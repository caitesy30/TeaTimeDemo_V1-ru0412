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

        /// <summary>
        /// 我的錢包首頁
        /// </summary>
        public IActionResult Index()
        {
            // 1. 取得當前使用者 Id
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2. 從資料庫取得使用者錢包明細（此處示範靜態資料，請依實際 Repository 替換）
            var items = new[]
            {
                new WalletItemViewModel { Name = "公益幣",    Quantity = 492 },
                new WalletItemViewModel { Name = "善時點數", Quantity = 50  }
            };

            // 3. 計算總點數與換算金額（範例：假設每點 50 元）
            var total = items.Sum(x => x.Quantity);
            var convertQty = total * 50;

            var vm = new WalletViewModel
            {
                TotalPoints = total,
                ConvertQuantity = convertQty,
                Items = items
            };

            return View(vm);
        }
    }
}
