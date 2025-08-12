// ==========================
// 檔名：LiffAuthEntryController.cs
// 功能：LIFF 登入入口，保留 redirect (含 query) 原封不動轉回
// ==========================
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class LiffAuthEntryController : Controller
    {
        // GET: /Customer/LiffAuthEntry?redirect=/Customer/Wallet/LiffEntry?mode=gift&token=abc123
        public IActionResult Index(string redirect = null)
        {
            // 預設回去錢包（保底）
            var safeRedirect = string.IsNullOrWhiteSpace(redirect) ? "/Customer/Wallet" : redirect;

            if (User?.Identity?.IsAuthenticated == true)
            {
                // ✅ 已登入：立刻原封不動導回（query 參數不會掉）
                return Redirect(safeRedirect);
            }

            // ❗未登入：交給 View 的 JS 去叫出 LINE Login（或顯示一顆「登入」按鈕）
            ViewBag.Redirect = safeRedirect;
            return View();
        }
    }
}
