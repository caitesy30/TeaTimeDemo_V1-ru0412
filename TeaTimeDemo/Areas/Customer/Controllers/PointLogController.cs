// ================================
// 檔名：PointLogController.cs
// 作者：茶神GPT
// 日期：2024-06-05
// 目的：會員點數異動紀錄專屬頁
// ================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize] // ← 需要登入
    public class PointLogController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public PointLogController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: /Customer/PointLog/Index
        [HttpGet]
        public IActionResult Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account", new { area = "Identity", returnUrl = Url.Action(nameof(Index), "PointLog", new { area = "Customer" }) });

            // 只查需要的資料
            var meName = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId)?.Name ?? "";
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();

            var myLogs = _unitOfWork.UserCurrencyLog
                .GetAll(x => x.UserId == userId) // ← 只抓自己的
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new UserCurrencyLogVM
                {
                    Name = meName, // View 有「姓名」欄，就填自己的名字
                    CreatedAt = x.CreatedAt,
                    CurrencyTypeName = coins.FirstOrDefault(c => c.Id == x.CurrencyTypeId)?.Name ?? "",
                    Quantity = x.Quantity,
                    BalanceAfter = x.BalanceAfter,
                    Action = x.Action,
                    Memo = x.Memo
                })
                .ToList();

            return View(new PointLogViewModel { Logs = myLogs });
        }

        // 同檔案內新增一個 Admin 專用動作
        [HttpGet]
        [Authorize(Roles = SD.Role_Admin)] // ← 只有 Admin 能看全部
        public IActionResult All(string? userId = null)
        {
            var logsQuery = _unitOfWork.UserCurrencyLog.GetAll();

            if (!string.IsNullOrEmpty(userId))
                logsQuery = logsQuery.Where(x => x.UserId == userId);

            var users = _unitOfWork.ApplicationUser.GetAll().ToList();
            var userDict = users.ToDictionary(u => u.Id, u => u.Name);
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();

            var logs = logsQuery
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new UserCurrencyLogVM
                {
                    Name = userDict.TryGetValue(x.UserId, out var name) ? name : "",
                    CreatedAt = x.CreatedAt,
                    CurrencyTypeName = coins.FirstOrDefault(c => c.Id == x.CurrencyTypeId)?.Name ?? "",
                    Quantity = x.Quantity,
                    BalanceAfter = x.BalanceAfter,
                    Action = x.Action,
                    Memo = x.Memo
                })
                .ToList();

            return View("Index", new PointLogViewModel { Logs = logs }); // 共用同一個 View
        }



        private static string ReplaceUserIdWithName(string memo, Dictionary<string, string> userDict)
        {
            if (string.IsNullOrEmpty(memo)) return "";
            foreach (var kv in userDict)
            {
                if (memo.Contains(kv.Key))
                {
                    memo = memo.Replace(kv.Key, kv.Value);
                }
            }
            return memo;
        }

    }

    // 新增 ViewModel
    public class PointLogViewModel
    {
        public List<UserCurrencyLogVM> Logs { get; set; }
    }
}
