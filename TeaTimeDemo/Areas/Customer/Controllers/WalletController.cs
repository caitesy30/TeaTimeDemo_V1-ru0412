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


        // ============ 返還步驟一：顯示返還幣列表（圖二） ============
        public IActionResult ReturnList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();
            var items = coins.Select(ct => new ReturnCoinVM
            {
                CurrencyTypeId = ct.Id,
                Name = ct.Name,
                IconPath = ct.IconPath,
                Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                    .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                    .Sum(x => x.Quantity)
            }).Where(x => x.Quantity > 0).ToList();

            return View(items); // 傳到 ReturnList.cshtml
        }

        // ============ 返還步驟二：選擇某幣返還（圖三） ============
        [HttpGet]
        public IActionResult Return(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coin = _unitOfWork.CurrencyType.GetById(id);
            var quantity = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == id)
                .Sum(x => x.Quantity);
            var vm = new ReturnCoinVM
            {
                CurrencyTypeId = id,
                Name = coin.Name,
                IconPath = coin.IconPath,
                Quantity = quantity
            };
            return View(vm); // 傳到 Return.cshtml
        }

        // ============ 返還步驟三：送出返還 =============
        [HttpPost]
        public IActionResult Return(ReturnCoinVM model, int returnQty)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (returnQty <= 0) return View(model); // 不允許負數

            // 目前擁有數量
            var nowQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .Sum(x => x.Quantity);

            if (returnQty > nowQty)
            {
                ModelState.AddModelError("", "返還數量不可大於持有數量");
                model.Quantity = nowQty;
                return View(model);
            }

            // 1. 會員扣點（寫一筆負數log）
            var lastLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldBalance = lastLog?.BalanceAfter ?? nowQty;
            int newBalance = oldBalance - returnQty;

            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = -returnQty,
                Action = "會員返還",
                Memo = "返還點數給後台",
                CreatedAt = DateTime.Now,
                BalanceAfter = newBalance
            });

            // 2. 後台發行者帳戶加點（可以寫指定帳號，這裡簡單用"Admin"）
            var admin = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.UserName == "admin");
            if (admin != null)
            {
                var adminOld = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == admin.Id && x.CurrencyTypeId == model.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.BalanceAfter ?? 0;

                _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
                {
                    UserId = admin.Id,
                    CurrencyTypeId = model.CurrencyTypeId,
                    Quantity = returnQty,
                    Action = "會員返還入帳",
                    Memo = $"會員返還：{userId}",
                    CreatedAt = DateTime.Now,
                    BalanceAfter = adminOld + returnQty
                });
            }
            _unitOfWork.Save();

            //TempData["SUCCESS"] = "返還成功！";
            return RedirectToAction("ReturnList");
        }

    }
}
