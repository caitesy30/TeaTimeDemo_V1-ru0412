// Areas/Identity/Pages/Account/Logout.cshtml.cs
// ✅ 支援 GET / POST 全面登出（行動端/LIFF 也確實清掉）
// ✅ 清 Application / External / 2FA Schemes、所有 Identity 相關 Cookie、Session、Cache
// ✅ 回傳一律 LocalRedirect 至 returnUrl（預設 "/"）

#nullable disable
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Identity.Pages.Account
{
    [AllowAnonymous] // 行動端常以連結觸發，開放匿名呼叫（只做清除，沒有權限外洩風險）
    public class LogoutModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ILogger<LogoutModel> _logger;

        public LogoutModel(SignInManager<ApplicationUser> signInManager, ILogger<LogoutModel> logger)
        {
            _signInManager = signInManager;
            _logger = logger;
        }

        /// <summary>
        /// 把登入相關狀態「能清的都清光」
        /// </summary>
        private async Task SignOutAllAsync()
        {
            // 1) 退出各類 Identity Schemes
            await _signInManager.SignOutAsync(); // Application（.AspNetCore.Identity.Application）
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);          // 外部登入暫存（如 LINE 回傳後暫用）
            await HttpContext.SignOutAsync(IdentityConstants.TwoFactorUserIdScheme);  // 2FA
            await HttpContext.SignOutAsync(IdentityConstants.TwoFactorRememberMeScheme);

            // 2) 砍所有可能的 Identity 相關 Cookie（行動端最關鍵）
            var keys = Request?.Cookies?.Keys?.ToList() ?? new System.Collections.Generic.List<string>();
            foreach (var key in keys)
            {
                // 保守清除策略：凡與 Identity / AspNetCore 命名相關者，全刪
                if (key.Contains("Identity", StringComparison.OrdinalIgnoreCase)
                    || key.StartsWith(".AspNetCore.", StringComparison.OrdinalIgnoreCase)
                    || key.StartsWith(".AspNet.", StringComparison.OrdinalIgnoreCase))
                {
                    Response.Cookies.Delete(key, new Microsoft.AspNetCore.Http.CookieOptions
                    {
                        Path = "/",
                        Expires = DateTimeOffset.UnixEpoch, // 立即過期
                        HttpOnly = true, // 儘量安全
                        Secure = Request.IsHttps
                    });
                }
            }

            // 3) 清 Session（若有使用）
            try { HttpContext?.Session?.Clear(); } catch { /* 若未啟用 Session，不影響 */ }

            // 4) 防快取：避免上一頁導致視覺假登入
            Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
            Response.Headers["Pragma"] = "no-cache";
            Response.Headers["Expires"] = "0";
        }

        // ✅ 新增：支援 GET 登出（手機/LIFF 最常用）
        public async Task<IActionResult> OnGet(string returnUrl = "/")
        {
            await SignOutAllAsync();
            _logger.LogInformation("User logged out via GET.");
            return LocalRedirect(string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl);
        }

        // ✅ 保留：POST 登出（桌機表單流程）
        public async Task<IActionResult> OnPost(string returnUrl = "/")
        {
            await SignOutAllAsync();
            _logger.LogInformation("User logged out via POST.");
            return LocalRedirect(string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl);
        }
    }
}
