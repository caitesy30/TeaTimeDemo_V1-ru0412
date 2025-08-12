// ==========================
// 檔名：LiffAuthEntryController.cs
// 功能：LIFF 登入入口，保留 redirect (含 query) 原封不動轉回
// ==========================
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Route("Customer/[controller]/[action]")]
    public class LiffAuthEntryController : Controller
    {
        /// <summary>
        /// 統一觸發外部登入（LINE）入口。
        /// 特色：
        ///  - 我們不在這裡做任何商務，只負責「送你去登入，然後回 returnUrl」
        ///  - RedirectUri 會在 Program.cs 的 LINE OAuth 設定中，強制用 https + 正確 Host
        /// </summary>
        [HttpGet]
        public IActionResult Login(string returnUrl = "/")
        {
            // 安全：限制回跳到站內路徑
            if (string.IsNullOrEmpty(returnUrl) || !returnUrl.StartsWith("/"))
                returnUrl = "/";

            var properties = new AuthenticationProperties
            {
                RedirectUri = returnUrl
            };

            // 直接 Challenge LINE（AspNet.Security.OAuth.Line）
            return Challenge(properties, AspNet.Security.OAuth.Line.LineAuthenticationDefaults.AuthenticationScheme);
        }


        // GET: /Customer/LiffAuthEntry?redirect=/Customer/Wallet/LiffEntry?mode=gift&token=abc123
        //public IActionResult Index(string redirect = null)
        //{
        //    // 預設回去錢包（保底）
        //    var safeRedirect = string.IsNullOrWhiteSpace(redirect) ? "/Customer/Wallet" : redirect;

        //    if (User?.Identity?.IsAuthenticated == true)
        //    {
        //        // ✅ 已登入：立刻原封不動導回（query 參數不會掉）
        //        return Redirect(safeRedirect);
        //    }

        //    // ❗未登入：交給 View 的 JS 去叫出 LINE Login（或顯示一顆「登入」按鈕）
        //    ViewBag.Redirect = safeRedirect;
        //    return View();
        //}
    }
}
