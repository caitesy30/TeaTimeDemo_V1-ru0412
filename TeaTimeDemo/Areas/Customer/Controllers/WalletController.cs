using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize]
    public class WalletController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;

        public WalletController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        // GET: /Customer/Wallet/Index
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // 取得目前登入的User
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound("找不到使用者，請先登入。");
            }

            // 查詢使用者所有餘額 (Include Points)
            var balances = _unitOfWork.UserPointBalance.GetAll(
                filter: up => up.ApplicationUserId == user.Id,
                includeProperties: "Point",
                tracked: false // 只讀即可
            ).ToList();

            return View(balances);
        }

        /// <summary>
        /// 加(或扣)點數示範
        /// </summary>
        [HttpPost]
        public IActionResult UpdateBalance(int pointId, int amount)
        {
            // amount > 0 表示加點，amount < 0 表示扣點
            var userId = _userManager.GetUserId(User);
            var userBalance = _unitOfWork.UserPointBalance.GetFirstOrDefault(
                filter: u => u.ApplicationUserId == userId && u.PointId == pointId
            );
            if (userBalance == null)
            {
                // 如果沒有該點數的餘額紀錄，就幫他新增
                userBalance = new UserPointBalance
                {
                    ApplicationUserId = userId,
                    PointId = pointId,
                    Balance = 0
                };
                _unitOfWork.UserPointBalance.Add(userBalance);
            }

            userBalance.Balance += amount; // 加減點數
            if (userBalance.Balance < 0) userBalance.Balance = 0; // 不允許小於0

            _unitOfWork.Save(); // 寫回DB
            return RedirectToAction(nameof(Index));
        }
    }
}
