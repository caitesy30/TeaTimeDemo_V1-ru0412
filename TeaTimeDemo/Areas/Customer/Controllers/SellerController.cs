// ==========================
// 檔名：Areas/Customer/Controllers/SellerController.cs
// 目的：Seller Center（後台）單頁（合併「Stage 1：MVP」與「MVP 交易及上架助手」）
// 規範：.NET 8、Area 路由、View 僅掛 JS，所有 HTML 由 JS 產生
// ==========================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize] // 若要開放匿名可改為 [AllowAnonymous]
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

        // GET: /Customer/Seller/Center?stage=mvp|assistant
        [HttpGet]
        public IActionResult Center(string? stage = null)
        {
            ViewBag.Stage = stage ?? "mvp";
            return View();
        }

    }
}
