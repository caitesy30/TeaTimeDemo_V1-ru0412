using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations; // 新增此命名空間以使用 IFormFile

namespace TeaTimeDemo.Models.ViewModels
{
    public class QuestionOptionVM
    {
        /// <summary>
        /// 問題選項的 ID
        /// </summary>
        public int Id { get; set; }

        
        /// <summary>
        /// 選項文本
        /// </summary>
        [Display(Name = "選項文本")]
        //[Required(ErrorMessage = "選項文本是必填欄位")]
        //[MaxLength(500, ErrorMessage = "選項文本不能超過500個字元")]
        [ValidateNever]
        public string OptionText { get; set; }
        


        /// <summary>
        /// 是否為正確答案
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// 是否為「其他」選項
        /// </summary>
        public bool IsOther { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        [MaxLength(500, ErrorMessage = "描述不能超過500個字元")]
        public string? Description { get; set; }

        /// <summary>
        /// 排序順序
        /// </summary>
        [Display(Name = "排序順序")]
        public int? SortOrder { get; set; }

        /// <summary>
        /// 所屬問題的 ID
        /// </summary>
        public int QuestionId { get; set; }

        /// <summary>
        /// 所屬問題的文本
        /// </summary>
        [Display(Name = "問題文本")]
        public string QuestionText { get; set; }

        /// <summary>
        /// 所屬問卷的 ID
        /// </summary>
        public int SurveyId { get; set; }

        /// <summary>
        /// 創建時間
        /// </summary>
        [Display(Name = "創建時間")]
        public DateTime? CreateTime { get; set; }

        /// <summary>
        /// 完成時間
        /// </summary>
        [Display(Name = "完成時間")]
        public DateTime? CompleteTime { get; set; }

        /// <summary>
        /// 備註
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 是否已刪除
        /// </summary>
        [ValidateNever]
        public bool IsDeleted { get; set; }

        /// <summary>
        /// 刪除時間
        /// </summary>
        [Display(Name = "刪除時間")]
        public DateTime? DeletedAt { get; set; }


        public QuestionOption QuestionOption { get; set; }

        // 問題的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionList { get; set; }

        // 問題選項的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionOptionList { get; set; }

        public List<QuestionImage> QuestionOptionImages { get; set; } = new List<QuestionImage>();

        // 新增這一行，用於接收選項的圖片
        [ValidateNever]
        public List<IFormFile> OptionImageFiles { get; set; } = new List<IFormFile>();

    
    

        [ValidateNever]
        public List<int> OptionImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> OptionImageHeights { get; set; } = new List<int>();

        // 現有選項圖片相關屬性
        public List<int> ExistingOptionImageIds { get; set; } = new List<int>();
        public List<int> ExistingOptionImageWidths { get; set; } = new List<int>();
        public List<int> ExistingOptionImageHeights { get; set; } = new List<int>();

        // **新增屬性**：用於接收新上傳的選項圖片的寬度和高度
        [ValidateNever]
        public List<int> NewOptionImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> NewOptionImageHeights { get; set; } = new List<int>();

        // 新增 FillInBlanks 集合，用於處理填空
        public List<FillInBlankVM> FillInBlanks { get; set; } = new List<FillInBlankVM>();
    }
}
