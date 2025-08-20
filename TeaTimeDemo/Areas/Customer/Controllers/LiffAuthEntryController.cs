using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Route("Customer/[controller]/[action]")]
    public class LiffAuthEntryController : Controller
    {
        // 只允許站內路徑；擋掉 /signin-* 與登出
        private static string SanitizeReturnUrl(string? returnUrl)
        {
            var safeDefault = "/Customer/Wallet/Index";
            if (string.IsNullOrWhiteSpace(returnUrl)) return safeDefault;
            if (!returnUrl.StartsWith("/")) return safeDefault;

            var lower = returnUrl.ToLowerInvariant();
            if (lower.StartsWith("/signin-")) return safeDefault;
            if (lower.Equals("/identity/account/logout")) return safeDefault;

            return returnUrl;
        }

        /// <summary>
        /// LINE Login 統一入口（B 方案主，A 方案保底）
        /// 已登入就直接回 returnUrl；未登入才丟 LINE OAuth Challenge。
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string returnUrl = "/", bool forceEmail = false)
        {
            var safeReturn = SanitizeReturnUrl(returnUrl);

            // ✅ 已登入就不要再去 LINE，直接回到原頁面執行後續（避免重登）
            if (User?.Identity?.IsAuthenticated == true)
                return Redirect(safeReturn);

            // ✅ 未登入 → 直接丟 LINE OAuth（不渲染任何頁面）
            var props = new AuthenticationProperties { RedirectUri = safeReturn };
            if (forceEmail) props.Items["force_email"] = "1"; // 支援 ?forceEmail=1

            return Challenge(props, AspNet.Security.OAuth.Line.LineAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
