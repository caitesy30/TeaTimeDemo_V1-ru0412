// Areas/Identity/Pages/Account/ConfirmEmail.cshtml.cs
#nullable disable
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Identity.Pages.Account
{
    public class ConfirmEmailModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ConfirmEmailModel(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [TempData] public string StatusMessage { get; set; }
        public bool IsSuccess { get; set; }
        public bool AlreadyConfirmed { get; set; }
        public string Email { get; set; }

        public async Task<IActionResult> OnGetAsync(string userId, string code)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(code))
                return RedirectToPage("/Index");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound($"找不到使用者（ID: '{userId}'）。");

            Email = user.Email;

            // 已驗證過
            if (await _userManager.IsEmailConfirmedAsync(user))
            {
                AlreadyConfirmed = true;
                IsSuccess = true;
                StatusMessage = "您的 Email 早已完成驗證，感謝您！";
                return Page();
            }

            // 解析 code
            try
            {
                var decoded = WebEncoders.Base64UrlDecode(code);
                code = Encoding.UTF8.GetString(decoded);
            }
            catch
            {
                IsSuccess = false;
                StatusMessage = "驗證連結無效或已逾期，請重新取得驗證信。";
                return Page();
            }

            // 確認
            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded)
            {
                IsSuccess = true;
                StatusMessage = "Email 驗證成功！歡迎加入～";
            }
            else
            {
                var err = result.Errors?.FirstOrDefault()?.Description ?? "驗證失敗";
                if (err.Contains("is already confirmed", StringComparison.OrdinalIgnoreCase))
                {
                    AlreadyConfirmed = true;
                    IsSuccess = true;
                    StatusMessage = "您的 Email 早已完成驗證，感謝您！";
                }
                else
                {
                    IsSuccess = false;
                    StatusMessage = $"驗證失敗：{err}";
                }
            }
            return Page();
        }
    }
}
