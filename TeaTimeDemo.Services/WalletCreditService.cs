using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq;
using System.Text.Json;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Services
{
    public class WalletCreditService
    {
        private readonly IUnitOfWork _uow;
        private readonly ApplicationDbContext _db;

        public WalletCreditService(IUnitOfWork uow)
        {
            _uow = uow;
            _db = uow.DbContext;
        }

        public enum ClaimResult { Success, Already, NotFoundOrExpired, NotYourInvite, Invalid }

        public sealed record ClaimOutcome(ClaimResult Result, string Message);

        // =============== 領取入帳（含重入保障＋Outbox） ===============
        // ✅ 新版簽章：用全域會員入帳 + 可選的 claimedLineUserId（供「指定領取人」核對）
        public async Task<ClaimOutcome> AddCoinByTokenAsync(
            string token,
            string globalUserId,
            Guid rid,
            string? claimedLineUserId = null)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(globalUserId))
                return new ClaimOutcome(ClaimResult.Invalid, "缺少必要參數");

            await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var nowUtc = DateTime.UtcNow;

            // 1) 取待領幣
            var pending = _uow.PendingCoin.GetFirstOrDefault(x => x.Token == token);
            if (pending == null || pending.Status != 0 || pending.ExpiresAt <= nowUtc)
                return new ClaimOutcome(ClaimResult.NotFoundOrExpired, "連結不存在或已過期");

            if (pending.IsClaimed || pending.ClaimedAt.HasValue)
                return new ClaimOutcome(ClaimResult.Already, "此連結已被使用");

            // 2) 指定領取人檢查（若 PendingCoin 有指定 LineUserId，就要與實際登入者一致）
            if (!string.IsNullOrEmpty(pending.LineUserId) &&
                !string.IsNullOrEmpty(claimedLineUserId) &&
                pending.LineUserId != claimedLineUserId)
            {
                return new ClaimOutcome(ClaimResult.NotYourInvite, "非指定領取人");
            }

            // 3) 餘額計算（以最後一筆 BalanceAfter 為主，若無則用加總）
            var lastLog = _uow.UserCurrencyLog.GetAll(x => x.UserId == globalUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                          .OrderByDescending(x => x.CreatedAt).FirstOrDefault();

            var oldBal = lastLog?.BalanceAfter
                      ?? _uow.UserCurrencyLog.GetAll(x => x.UserId == globalUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                                             .Sum(x => x.Quantity);

            var newBal = oldBal + pending.Quantity;

            // 4) 入帳（冪等鍵避免重複寫入）
            var idem = $"claim:{pending.Id}";
            _uow.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = globalUserId,                    // ✅ 一律記全域會員
                CurrencyTypeId = pending.CurrencyTypeId,
                Quantity = pending.Quantity,
                BalanceAfter = newBal,
                Action = "LINE好友領取",
                Memo = string.IsNullOrWhiteSpace(pending.Memo) ? "LINE自動領取" : pending.Memo,
                CreatedAt = DateTime.Now,
                IdempotencyKey = idem
            });

            // 5) 標記待領幣已領
            pending.IsClaimed = true;
            pending.ClaimedAt = DateTime.Now;
            pending.Status = 1;
            pending.ClaimedRid = rid;
            pending.ClaimedByLineUserId = claimedLineUserId;

            // 6) Outbox（可用於下游通知）
            _db.OutboxMessages.Add(new OutboxMessage
            {
                Type = "PendingCoinClaimed",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    pending.Id,
                    GlobalUserId = globalUserId,
                    pending.CurrencyTypeId,
                    pending.Quantity
                })
            });


            try
            {
                await _uow.SaveAsync();
                await tx.CommitAsync();
                return new ClaimOutcome(ClaimResult.Success, "入帳成功");
            }
            catch (DbUpdateException ex)
            {
                // 若是 IdempotencyKey 唯一鍵衝突，視為已處理（重送/重入）
                var msg = ex.InnerException?.Message ?? ex.Message;
                if (msg.Contains("IX_UserCurrencyLogs_IdempotencyKey", StringComparison.OrdinalIgnoreCase)
                 || msg.Contains("IdempotencyKey", StringComparison.OrdinalIgnoreCase))
                {
                    await tx.RollbackAsync();
                    return new ClaimOutcome(ClaimResult.Already, "此連結已核銷");
                }
                await tx.RollbackAsync();
                throw; // 其他例外往外丟，由全域例外處理
            }

        }

        // ✅ 方便保留舊呼叫（3 參數）相容：自動轉呼新版
        public Task<ClaimOutcome> AddCoinByTokenAsync(string token, string globalUserId, Guid rid)
            => AddCoinByTokenAsync(token, globalUserId, rid, null);
    

        // =============== 逾期退回（給排程呼叫） ===============
        public async Task<int> RefundExpiredPendingsOnceAsync(int take = 100)
        {
            var nowUtc = DateTime.UtcNow;
            // 取一批逾期未領的
            var expired = _uow.PendingCoin.GetAll(x => x.Status == 0 && x.ExpiresAt <= nowUtc)
                                          .OrderBy(x => x.ExpiresAt)
                                          .Take(take)
                                          .ToList();
            var count = 0;

            foreach (var pc in expired)
            {
                await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

                // 再查一次最新狀態
                var pending = _uow.PendingCoin.GetFirstOrDefault(x => x.Id == pc.Id);
                if (pending == null || pending.Status != 0) { await tx.RollbackAsync(); continue; }

                // 退回給 FromUserId
                var last = _uow.UserCurrencyLog.GetAll(x => x.UserId == pending.FromUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                                               .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                var oldBal = last?.BalanceAfter
                           ?? _uow.UserCurrencyLog.GetAll(x => x.UserId == pending.FromUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                                                  .Sum(x => x.Quantity);
                var newBal = oldBal + pending.Quantity;

                var idem = $"refund:{pending.Id}";

                _uow.UserCurrencyLog.Add(new UserCurrencyLog
                {
                    UserId = pending.FromUserId,
                    CurrencyTypeId = pending.CurrencyTypeId,
                    Quantity = pending.Quantity,
                    BalanceAfter = newBal,
                    Action = "預扣逾期退回",
                    Memo = $"pending:{pending.Id} token:{pending.Token}",
                    CreatedAt = DateTime.Now,
                    IdempotencyKey = idem
                });

                pending.Status = 2;                 // Cancelled/Expired+Refunded
                pending.RefundedAt = DateTime.Now;
                _uow.PendingCoin.Update(pending);

                _db.OutboxMessages.Add(new OutboxMessage
                {
                    Type = "PendingCoinExpiredRefunded",
                    PayloadJson = JsonSerializer.Serialize(new
                    {
                        pending.Id,
                        pending.Token,
                        pending.CurrencyTypeId,
                        pending.Quantity,
                        pending.FromUserId
                    })
                });

                await _uow.SaveAsync();
                await tx.CommitAsync();
                count++;
            }

            return count;
        }
    }
}
