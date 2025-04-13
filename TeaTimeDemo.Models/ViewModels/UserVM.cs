using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.Models;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.ViewModels
{
    public class UserVM
    {
        public ApplicationUser Input { get; set; }
        public IEnumerable<SelectListItem> RoleList { get; set; }
        public IEnumerable<SelectListItem> StoreList { get; set; }

        [Required(ErrorMessage = "請選擇角色")]
        [Display(Name = "角色")]
        public string Role { get; set; } // 新增角色屬性

        // 密碼欄位僅在新增使用者時需要
        [DataType(DataType.Password)]
        [Display(Name = "密碼")]
        [MinLength(8, ErrorMessage = "密碼至少需要 8 個字元。")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "確認密碼")]
        [Compare("Password", ErrorMessage = "密碼與確認密碼不匹配。")]
        public string ConfirmPassword { get; set; }
    }
}
