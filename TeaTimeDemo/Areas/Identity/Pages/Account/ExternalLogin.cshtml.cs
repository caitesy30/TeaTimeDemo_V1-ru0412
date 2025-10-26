// Areas/Identity/Pages/Account/ExternalLogin.cshtml.cs
#nullable disable
using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Identity.Pages.Account
{
    [AllowAnonymous]
    public class ExternalLoginModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUserStore<ApplicationUser> _userStore;
        private readonly IUserEmailStore<ApplicationUser> _emailStore;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<ExternalLoginModel> _logger;

        // ✅ 預設角色（你原本就使用 Customer）
        private const string DefaultRole = "Customer";

        public ExternalLoginModel(
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            IUserStore<ApplicationUser> userStore,
            ILogger<ExternalLoginModel> logger,
            IEmailSender emailSender)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _userStore = userStore;
            _emailStore = GetEmailStore();
            _logger = logger;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; }
        public string ProviderDisplayName { get; set; }
        public string ReturnUrl { get; set; }
        [TempData] public string ErrorMessage { get; set; }

        public class InputModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; }
        }

        public IActionResult OnGet() => RedirectToPage("./Login");

        // 第一步：發起 Challenge 到外部（LINE）
        public IActionResult OnPost(string provider, string returnUrl = null)
        {
            ReturnUrl = returnUrl ?? Url.Content("~/");
            var redirectUrl = Url.Page("./ExternalLogin", pageHandler: "Callback", values: new { returnUrl = ReturnUrl });
            var props = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return new ChallengeResult(provider, props);
        }

        // 第二步：LINE 授權回呼
        // 🎯 重點：這裡直接「能自動落地就落地」，避免手機端沒送出確認頁導致沒建帳
        public async Task<IActionResult> OnGetCallbackAsync(string returnUrl = null, string remoteError = null)
        {
            ReturnUrl = returnUrl ?? Url.Content("~/");

            if (remoteError != null)
            {
                ModelState.AddModelError(string.Empty, $"外部登入錯誤：{remoteError}");
                return Page();
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
                return RedirectToPage("./Login", new { ReturnUrl });

            // 已綁定過外部登入 → 直接登入
            var signInResult = await _signInManager.ExternalLoginSignInAsync(
                info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);

            if (signInResult.Succeeded)
            {
                // ✅ 若系統使用者還沒有 Email，嘗試用此次 Claim 補上
                var boundUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
                var emailFromClaim = info.Principal.FindFirstValue(ClaimTypes.Email);
                if (boundUser != null && string.IsNullOrEmpty(boundUser.Email) && !string.IsNullOrEmpty(emailFromClaim))
                {
                    boundUser.Email = emailFromClaim;
                    if (string.IsNullOrEmpty(boundUser.UserName)) boundUser.UserName = emailFromClaim;
                    // 有 Email 視為已驗證（你的網站設定 RequireConfirmedAccount = true）
                    boundUser.EmailConfirmed = true;
                    await _userManager.UpdateAsync(boundUser);
                }
                return LocalRedirect(ReturnUrl);
            }

            // 走到這裡代表首次登入（尚未綁定）→ 嘗試自動落地
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var displayName = info.Principal.FindFirstValue(ClaimTypes.Name)
                               ?? info.Principal.Identity?.Name
                               ?? "LINE用戶";

            var auto = await TryAutoProvisionAsync(info, email, displayName, ReturnUrl);
            if (auto != null) return auto; // 成功：直接導回

            // 若自動落地失敗（通常是建立/綁定例外），退回填 Email 頁
            Input = new InputModel { Email = email };
            ProviderDisplayName = info.ProviderDisplayName;
            ReturnUrl = returnUrl;
            return Page();
        }

        // 第三步：使用者在頁面手動補 Email（保留，但強化：會優先更新「以 LINE sub 建立的帳號」）
        public async Task<IActionResult> OnPostConfirmationAsync(string returnUrl = null)
        {
            returnUrl = returnUrl ?? Url.Content("~/");

            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                ErrorMessage = "Error loading external login information during confirmation.";
                return RedirectToPage("./Login", new { ReturnUrl = returnUrl });
            }

            if (!ModelState.IsValid)
            {
                ProviderDisplayName = info.ProviderDisplayName;
                ReturnUrl = returnUrl;
                return Page();
            }

            var email = Input.Email?.Trim();
            var displayName = info.Principal.FindFirstValue(ClaimTypes.Name) ?? email?.Split('@')[0] ?? "LINE用戶";
            var lineSub = info.ProviderKey; // LINE 的 userId（sub）

            // 1) 若「已用 LINE sub 建帳」→ 更新 Email & 綁外登
            var userById = await _userManager.FindByIdAsync(lineSub);
            if (userById != null)
            {
                userById.Email = email;
                userById.UserName = string.IsNullOrEmpty(userById.UserName) ? email : userById.UserName;
                userById.Name = string.IsNullOrEmpty(userById.Name) ? displayName : userById.Name;
                userById.EmailConfirmed = true;
                await _userManager.UpdateAsync(userById);

                var bindRes = await _userManager.AddLoginAsync(userById, info);
                // 已有綁定也沒關係
                await EnsureRoleAsync(userById, DefaultRole);
                await _signInManager.SignInAsync(userById, isPersistent: false, info.LoginProvider);
                return LocalRedirect(returnUrl);
            }

            // 2) 若同 Email 的帳號已存在 → 直接綁定外登 + 登入
            var exist = await _userManager.FindByEmailAsync(email);
            if (exist != null)
            {
                await _userManager.AddLoginAsync(exist, info);
                await EnsureRoleAsync(exist, DefaultRole);
                await _signInManager.SignInAsync(exist, isPersistent: false, info.LoginProvider);
                return LocalRedirect(returnUrl);
            }

            // 3) 全新建立（Identity Id = LINE sub）
            var user = new ApplicationUser
            {
                Id = lineSub,                 // ✅ 關鍵：讓 NameIdentifier = LINE userId
                UserName = email,
                Email = email,
                Name = displayName,
                EmailConfirmed = true         // 外登 + 有 Email → 視為已確認
            };

            var result = await _userManager.CreateAsync(user);
            if (result.Succeeded)
            {
                await EnsureRoleAsync(user, DefaultRole);
                await _userManager.AddLoginAsync(user, info);
                _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);
                await _signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
                return LocalRedirect(returnUrl);
            }

            foreach (var error in result.Errors) ModelState.AddModelError(string.Empty, error.Description);
            ProviderDisplayName = info.ProviderDisplayName;
            ReturnUrl = returnUrl;
            return Page();
        }

        // ===== 私有方法：自動落地會員（最小驚擾，優先滿足領幣／回流） =====
        private async Task<IActionResult> TryAutoProvisionAsync(ExternalLoginInfo info, string email, string displayName, string returnUrl)
        {
            var lineSub = info.ProviderKey; // = LINE 的 sub

            // A) 若 Email 已存在 → 綁外登 + 登入
            if (!string.IsNullOrWhiteSpace(email))
            {
                var exist = await _userManager.FindByEmailAsync(email);
                if (exist != null)
                {
                    var addLogin = await _userManager.AddLoginAsync(exist, info);
                    if (addLogin.Succeeded)
                    {
                        // 補 name / role
                        if (string.IsNullOrWhiteSpace(exist.Name)) { exist.Name = displayName ?? exist.UserName ?? email; await _userManager.UpdateAsync(exist); }
                        await EnsureRoleAsync(exist, DefaultRole);
                        await _signInManager.SignInAsync(exist, isPersistent: false, info.LoginProvider);
                        return LocalRedirect(returnUrl);
                    }
                }
            }

            // B) 全新建立：Identity Id = LINE sub（🔑 讓 PendingCoin 的 LineUserId 直接對上 NameIdentifier）
            var user = new ApplicationUser
            {
                Id = lineSub, // 🔑 關鍵！你的 Claim/領幣流程就能用 NameIdentifier 對 PendingCoin.LineUserId
            };

            if (!string.IsNullOrWhiteSpace(email))
            {
                user.UserName = email;
                user.Email = email;
                user.EmailConfirmed = true; // 有 Email → 視同已驗證
            }
            else
            {
                // 沒取到 Email：先落地，後續可在帳戶設定或 Confirmation 頁補
                user.UserName = $"line_{lineSub}";
                user.Email = null;
                user.EmailConfirmed = false;
            }

            user.Name = string.IsNullOrWhiteSpace(displayName)
                ? (user.Email?.Split('@')[0] ?? user.UserName)
                : displayName;

            var create = await _userManager.CreateAsync(user);
            if (!create.Succeeded)
            {
                foreach (var e in create.Errors) ModelState.AddModelError(string.Empty, e.Description);
                return null; // 失敗就退回頁面讓使用者手動補
            }

            await EnsureRoleAsync(user, DefaultRole);

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (!addLoginResult.Succeeded)
            {
                foreach (var e in addLoginResult.Errors) ModelState.AddModelError(string.Empty, e.Description);
                return null;
            }

            await _signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
            return LocalRedirect(returnUrl);
        }

        private async Task EnsureRoleAsync(ApplicationUser user, string role)
        {
            if (!await _userManager.IsInRoleAsync(user, role))
            {
                // 若角色不存在，這裡會丟 IdentityError；假設你的 DBInitializer 已建立角色
                await _userManager.AddToRoleAsync(user, role);
            }
        }

        private IUserEmailStore<ApplicationUser> GetEmailStore()
        {
            if (!_userManager.SupportsUserEmail)
                throw new NotSupportedException("The default UI requires a user store with email support.");
            return (IUserEmailStore<ApplicationUser>)_userStore;
        }
    }
}
