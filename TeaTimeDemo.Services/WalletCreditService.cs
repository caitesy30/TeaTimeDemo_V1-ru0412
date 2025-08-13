using Microsoft.EntityFrameworkCore;
using System.Data;
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
        public async Task<ClaimOutcome> AddCoinByTokenAsync(string token, string lineUserId, Guid rid)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(lineUserId))
                return new ClaimOutcome(ClaimResult.Invalid, "缺少必要參數");

            await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var nowUtc = DateTime.UtcNow;

            var pending = _uow.PendingCoin.GetFirstOrDefault(x => x.Token == token);
            if (pending == null || pending.Status != 0 || pending.ExpiresAt <= nowUtc)
                return new ClaimOutcome(ClaimResult.NotFoundOrExpired, "連結不存在或已過期");

            if (pending.IsClaimed || pending.ClaimedAt.HasValue)
                return new ClaimOutcome(ClaimResult.Already, "此連結已被使用");

            if (!string.IsNullOrEmpty(pending.LineUserId) && pending.LineUserId != lineUserId)
                return new ClaimOutcome(ClaimResult.NotYourInvite, "非指定領取人");

            // ===== 計算餘額（以最後一筆 BalanceAfter 為準）=====
            var lastLog = _uow.UserCurrencyLog.GetAll(x => x.UserId == lineUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                        .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            var oldBal = lastLog?.BalanceAfter
                        ?? _uow.UserCurrencyLog.GetAll(x => x.UserId == lineUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                                               .Sum(x => x.Quantity);
            var newBal = oldBal + pending.Quantity;

            var idem = $"claim:{pending.Id}";
            // 若曾經寫過（重試/重入），會被唯一索引擋掉
            _uow.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = lineUserId,
                CurrencyTypeId = pending.CurrencyTypeId,
                Quantity = pending.Quantity,
                BalanceAfter = newBal,
                Action = "LINE好友領取",
                Memo = $"token:{pending.Token} rid:{rid} from:{pending.FromUserId} note:{pending.Memo}",
                CreatedAt = DateTime.Now,
                IdempotencyKey = idem
            });

            // 標記核銷
            pending.IsClaimed = true;
            pending.ClaimedAt = DateTime.Now;
            pending.Status = 1;
            pending.ClaimedByLineUserId = lineUserId;
            pending.ClaimedRid = rid;
            if (string.IsNullOrEmpty(pending.LineUserId))
                pending.LineUserId = lineUserId;

            _uow.PendingCoin.Update(pending);

            // 寫 Outbox（領取成功）
            _db.OutboxMessages.Add(new OutboxMessage
            {
                Type = "PendingCoinClaimed",
                PayloadJson = JsonSerializer.Serialize(new
                {
                    pending.Id,
                    pending.Token,
                    pending.CurrencyTypeId,
                    pending.Quantity,
                    lineUserId,
                    rid
                })
            });

            await _uow.SaveAsync();
            await tx.CommitAsync();

            return new ClaimOutcome(ClaimResult.Success, "領取成功");
        }

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
