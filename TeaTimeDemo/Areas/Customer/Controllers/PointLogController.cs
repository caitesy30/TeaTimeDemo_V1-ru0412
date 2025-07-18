// ================================
// 檔名：PointLogController.cs
// 作者：茶神GPT
// 日期：2024-06-05
// 目的：會員點數異動紀錄專屬頁
// ================================
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class PointLogController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public PointLogController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: /Customer/PointLog/Index
        public IActionResult Index()
        {
            // 取得目前登入會員ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 取得所有會員ID+Name (只需查一次)
            var users = _unitOfWork.ApplicationUser.GetAll().ToList();

            // 取得所有幣種（名稱查找用）
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();

            var userDict = users.ToDictionary(u => u.Id, u => u.Name);

            // 抓所有點數異動紀錄，JOIN 幣種名稱
            var logs = _unitOfWork.UserCurrencyLog.GetAll()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new UserCurrencyLogVM
                {
                    Name = userDict.ContainsKey(x.UserId) ? userDict[x.UserId] : "",
                    CreatedAt = x.CreatedAt,
                    CurrencyTypeName = coins.FirstOrDefault(c => c.Id == x.CurrencyTypeId)?.Name ?? "",
                    Quantity = x.Quantity,
                    BalanceAfter = x.BalanceAfter,
                    Action = x.Action,
                    Memo = ReplaceUserIdWithName(x.Memo, userDict)
                })
                .ToList();

            // ViewModel 只需要 Logs
            var vm = new PointLogViewModel
            {
                Logs = logs
            };

            return View(vm);
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
