// ==========================
// 檔名：LiffAuthEntryController.cs
// 功能：LIFF 登入入口，保留 redirect (含 query) 原封不動轉回（含回跳清洗）
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
        // 白名單：只允許站內路徑；黑名單：避免回登出與 signin 類路徑
        private static string SanitizeReturnUrl(string? returnUrl)
        {
            var safeDefault = "/Customer/Wallet/Index";

            if (string.IsNullOrWhiteSpace(returnUrl)) return safeDefault;
            if (!returnUrl.StartsWith("/")) return safeDefault;

            var lower = returnUrl.ToLowerInvariant();
            if (lower.StartsWith("/signin-")) return safeDefault;
            if (lower.Equals("/identity/account/logout")) return safeDefault;

            // 視需要可再擴充黑名單
            return returnUrl;
        }

        /// <summary>
        /// 統一觸發外部登入（LINE）入口。
        /// 不處理商務，只負責：送去登入 → 回安全的 returnUrl
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string returnUrl = "/")
        {
            var safeReturn = SanitizeReturnUrl(returnUrl);

            var properties = new AuthenticationProperties
            {
                RedirectUri = safeReturn
            };

            return Challenge(properties, AspNet.Security.OAuth.Line.LineAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
