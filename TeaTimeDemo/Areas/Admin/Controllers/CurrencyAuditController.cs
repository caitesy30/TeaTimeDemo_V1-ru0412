using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Utility;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public class CurrencyAuditController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public CurrencyAuditController(IUnitOfWork uow) { _unitOfWork = uow; }

        public IActionResult Index() => View();

        #region ---------- Shared aggregator (單一真相) ----------
        /// <summary>
        /// 依「最後一筆餘額」彙總出「每幣種使用者總持幣」。
        /// 任何需要 UsersHold 的地方都用它，避免兩表不一致。
        /// </summary>
        private Dictionary<int, int> GetUsersHoldByCurrency()
        {
            var logs = _unitOfWork.DbContext.UserCurrencyLogs.AsNoTracking();
            // 取每人/每幣種最新一筆，並彙總為每幣種合計
            var latestByCurrency = (
                from l in logs
                join m in
                    (from x in logs
                     group x by new { x.UserId, x.CurrencyTypeId } into g
                     select new { g.Key.UserId, g.Key.CurrencyTypeId, MaxId = g.Max(y => y.Id) })
                on new { l.UserId, l.CurrencyTypeId, l.Id }
                equals new { m.UserId, m.CurrencyTypeId, Id = m.MaxId }
                group l by l.CurrencyTypeId into g
                select new { CurrencyTypeId = g.Key, UsersHold = g.Sum(x => x.BalanceAfter) }
            ).ToDictionary(x => x.CurrencyTypeId, x => x.UsersHold);

            return latestByCurrency;
        }
        #endregion

        // 幣種對帳彙總（以總表資料為主）
        [HttpGet]
        public IActionResult GetAudit()
        {
            var currencies = _unitOfWork.DbContext.CurrencyTypes
                .AsNoTracking()
                .Select(c => new { c.Id, c.Name, c.TotalIssued, c.RemainQuantity })
                .ToList();

            var usersHoldByCur = GetUsersHoldByCurrency();

            var rows = currencies
                .Select(c =>
                {
                    usersHoldByCur.TryGetValue(c.Id, out var usersHold);
                    var givenOut = c.TotalIssued - c.RemainQuantity; // 顯示用
                    var diff = usersHold - givenOut;                 // >0 使用者多；<0 系統多扣
                    return new
                    {
                        currencyTypeId = c.Id,
                        name = c.Name,
                        totalIssued = c.TotalIssued,
                        remain = c.RemainQuantity,
                        givenOut,
                        usersHold,   // = 所有人持幣總表數字（同一真相）
                        diff
                    };
                })
                .OrderBy(r => r.currencyTypeId)
                .ToList();

            return Json(rows);
        }

        // 單一幣種：各使用者目前餘額（以最新 BalanceAfter）
        [HttpGet]
        public IActionResult UsersByCurrency(int currencyTypeId)
        {
            var logs = _unitOfWork.DbContext.UserCurrencyLogs
                .AsNoTracking()
                .Where(l => l.CurrencyTypeId == currencyTypeId);

            var latestPerUserCurrency = (
                from l in logs
                join m in
                    (from x in logs
                     group x by new { x.UserId, x.CurrencyTypeId } into g
                     select new { g.Key.UserId, g.Key.CurrencyTypeId, MaxId = g.Max(y => y.Id) })
                on new { l.UserId, l.CurrencyTypeId, l.Id }
                equals new { m.UserId, m.CurrencyTypeId, Id = m.MaxId }
                select new { l.UserId, l.BalanceAfter }
            );

            var items = (
                from u in _unitOfWork.DbContext.ApplicationUsers.AsNoTracking()
                join b in latestPerUserCurrency on u.Id equals b.UserId
                orderby u.Name
                select new { userId = u.Id, name = u.Name, balance = b.BalanceAfter }
            ).ToList();

            var total = items.Sum(x => x.balance);
            return Json(new { total, count = items.Count, items });
        }

        /// <summary>
        /// 單一幣種：剩餘數量 = 發行數量 - 使用者總持幣（以總表為主）
        /// </summary>
        [HttpPost]
        public IActionResult FixRemain(int currencyTypeId)
        {
            var c = _unitOfWork.CurrencyType.GetById(currencyTypeId);
            if (c == null) return Json(new { success = false, message = "幣種不存在" });

            var usersHoldByCur = GetUsersHoldByCurrency();
            usersHoldByCur.TryGetValue(c.Id, out var usersHold);

            var newRemain = c.TotalIssued - usersHold;
            if (newRemain < 0) newRemain = 0;

            c.RemainQuantity = newRemain;
            c.UpdatedAt = DateTime.Now;

            _unitOfWork.CurrencyType.Update(c);
            _unitOfWork.Save();

            return Json(new { success = true, currencyTypeId = c.Id, newRemain = c.RemainQuantity });
        }

        /// <summary>
        /// ★ 一鍵修正全部幣種：
        /// 以「所有人持幣總表」(UsersHold) 為準，
        /// RemainQuantity = TotalIssued - UsersHold。
        /// 回傳最新 rows 讓前端直接重繪主表，主表『已發出』自然等於 UsersHold。
        /// </summary>
        [HttpPost]
        public IActionResult FixRemainAll()
        {
            var usersHoldByCur = GetUsersHoldByCurrency();
            var all = _unitOfWork.CurrencyType.GetAll().ToList();

            foreach (var c in all)
            {
                usersHoldByCur.TryGetValue(c.Id, out var usersHold);
                var newRemain = c.TotalIssued - usersHold;
                if (newRemain < 0) newRemain = 0;

                c.RemainQuantity = newRemain;
                c.UpdatedAt = DateTime.Now;
                _unitOfWork.CurrencyType.Update(c);
            }
            _unitOfWork.Save();

            // 直接組回主表 rows，讓前端不必再打一次 GetAudit
            var rows = all
                .Select(c =>
                {
                    usersHoldByCur.TryGetValue(c.Id, out var usersHold);
                    var givenOut = c.TotalIssued - c.RemainQuantity;
                    var diff = usersHold - givenOut;
                    return new
                    {
                        currencyTypeId = c.Id,
                        name = c.Name,
                        totalIssued = c.TotalIssued,
                        remain = c.RemainQuantity,
                        givenOut,
                        usersHold,
                        diff
                    };
                })
                .OrderBy(r => r.currencyTypeId)
                .ToList();

            return Json(new { success = true, rows });
        }

        // 單人差異補正（新增一筆修正 Log）
        [HttpPost]
        public IActionResult FixUserBalance(string userId, int currencyTypeId, int targetBalance, string memo)
        {
            if (string.IsNullOrEmpty(userId))
                return Json(new { success = false, message = "缺少使用者" });

            var last = _unitOfWork.UserCurrencyLog
                .GetAll(x => x.UserId == userId && x.CurrencyTypeId == currencyTypeId)
                .OrderByDescending(x => x.Id)
                .FirstOrDefault();

            int current = last?.BalanceAfter ?? 0;
            int delta = targetBalance - current;
            if (delta == 0)
                return Json(new { success = true, message = "目前餘額已正確，無需修正" });

            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = currencyTypeId,
                Quantity = delta,
                Action = "系統差異修正",
                Memo = memo,
                CreatedAt = DateTime.Now,
                BalanceAfter = targetBalance
            });
            _unitOfWork.Save();

            return Json(new { success = true, userId, currencyTypeId, targetBalance });
        }

        // 所有人持幣總表
        [HttpGet]
        public IActionResult AllHoldings()
        {
            var currencies = _unitOfWork.DbContext.CurrencyTypes
                .AsNoTracking()
                .OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
                .Select(c => new { c.Id, c.Name })
                .ToList();

            var logs = _unitOfWork.DbContext.UserCurrencyLogs.AsNoTracking();

            var latestPerUserCurrency = (
                from l in logs
                join m in
                    (from x in logs
                     group x by new { x.UserId, x.CurrencyTypeId } into g
                     select new { g.Key.UserId, g.Key.CurrencyTypeId, MaxId = g.Max(y => y.Id) })
                on new { l.UserId, l.CurrencyTypeId, l.Id }
                equals new { m.UserId, m.CurrencyTypeId, Id = m.MaxId }
                select new { l.UserId, l.CurrencyTypeId, l.BalanceAfter }
            ).ToList();

            var byUser = latestPerUserCurrency
                .GroupBy(x => x.UserId)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        BalDict = g.ToDictionary(k => k.CurrencyTypeId, v => v.BalanceAfter),
                        RowTotal = g.Sum(s => s.BalanceAfter)
                    });

            var users = _unitOfWork.DbContext.ApplicationUsers
                .AsNoTracking()
                .Select(u => new { u.Id, u.Name })
                .ToList();

            var rows = users
                .Select(u =>
                {
                    byUser.TryGetValue(u.Id, out var pack);
                    var balances = currencies.ToDictionary(
                        c => c.Id,
                        c => (pack != null && pack.BalDict.TryGetValue(c.Id, out var v)) ? v : 0
                    );
                    var total = pack?.RowTotal ?? 0;
                    return new { userId = u.Id, name = u.Name, balances, rowTotal = total };
                })
                .Where(r => r.rowTotal > 0) // 要全員就移除此行
                .OrderBy(r => r.name)
                .ToList();

            var totals = currencies.ToDictionary(c => c.Id, c => rows.Sum(r => r.balances[c.Id]));
            var grandTotal = totals.Values.Sum();

            return Json(new { currencies, rows, totals, grandTotal });
        }

        // 不在幣種表中的持幣摘要
        [HttpGet]
        public IActionResult UnknownSummary()
        {
            var validIds = _unitOfWork.DbContext.CurrencyTypes
                .AsNoTracking()
                .Select(c => c.Id)
                .ToHashSet();

            var q = _unitOfWork.DbContext.UserCurrencyLogs
                .AsNoTracking()
                .Where(l => !validIds.Contains(l.CurrencyTypeId));

            var countLogs = q.Count();
            var affectedUsers = q.Select(l => l.UserId).Distinct().Count();
            var currencyIds = q.Select(l => l.CurrencyTypeId).Distinct().OrderBy(x => x).ToList();

            return Json(new { countLogs, affectedUsers, currencyIds });
        }

        // 清除不在幣種表中的持幣紀錄（不可復原，請先備份）
        [HttpPost]
        public IActionResult PurgeUnknownCurrencies(string? userId = null)
        {
            var validIds = _unitOfWork.DbContext.CurrencyTypes
                .AsNoTracking()
                .Select(c => c.Id)
                .ToHashSet();

            var q = _unitOfWork.DbContext.UserCurrencyLogs
                .Where(l => !validIds.Contains(l.CurrencyTypeId));

            if (!string.IsNullOrWhiteSpace(userId))
                q = q.Where(l => l.UserId == userId);

            var toDelete = q.ToList();
            var deleted = toDelete.Count;
            if (deleted > 0)
            {
                _unitOfWork.DbContext.UserCurrencyLogs.RemoveRange(toDelete);
                _unitOfWork.DbContext.SaveChanges();
            }

            return Json(new { success = true, deleted });
        }
    }
}
