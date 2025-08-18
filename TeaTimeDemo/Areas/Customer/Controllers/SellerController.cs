using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize] // TODO: 可改成 Seller 角色
    [Route("Customer/[controller]/[action]")]
    public class SellerController : Controller
    {
        // GET: /Customer/Seller/ProductCreate
        [HttpGet]
        public IActionResult ProductCreate()
        {
            return View();
        }

        // POST: /Customer/Seller/ProductCreate
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ProductCreateSubmit()
        {
            // TODO: Model Binding + 儲存 DB + 上傳圖片
            TempData["success"] = "（DEMO）已收到表單，下一步接資料庫";
            return RedirectToAction(nameof(ProductCreate));
        }
    }
}
