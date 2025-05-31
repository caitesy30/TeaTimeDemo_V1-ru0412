// ==========================
// 檔名：WalletController.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：會員錢包首頁（餘額、異動紀錄查詢）
// ==========================

using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class WalletController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public WalletController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            // 1. 取得目前登入會員ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2. 一次抓下所有幣種，避免重複查詢
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();

            // 3. 取得所有交易紀錄（最新在前），並組合VM（JOIN查出名稱）
            var logs = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new UserCurrencyLogVM
                {
                    CreatedAt = x.CreatedAt,
                    CurrencyTypeName = coins.FirstOrDefault(c => c.Id == x.CurrencyTypeId)?.Name ?? "", // 幣種中文名稱
                    Quantity = x.Quantity,
                    BalanceAfter = x.BalanceAfter,
                    Action = x.Action,
                    Memo = x.Memo
                })
                .ToList();

            // 4. 計算每個幣種持有，並帶入 ExchangeRate
            var items = coins.Select(ct => new WalletItemViewModel
            {
                Name = ct.Name,
                Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                    .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                    .Sum(x => x.Quantity),
                ExchangeRate = ct.ExchangeRate   // 兌換率
            }).ToList();

            // 5. 計算總點數及換算（**依各幣種兌換率**）
            var total = items.Sum(x => x.Quantity);
            var convertQty = items.Sum(x => x.ExchangeRate > 0 ? x.Quantity / x.ExchangeRate : 0);
            // 例：50:1，100點=2元；可依需求調整顯示小數或只取整數

            // 6. 組合 ViewModel
            var vm = new WalletViewModel
            {
                Items = items,
                Logs = logs,
                TotalPoints = total,
                ConvertQuantity = convertQty
            };

            // 7. 回傳 View
            return View(vm);
        }
    }
}
