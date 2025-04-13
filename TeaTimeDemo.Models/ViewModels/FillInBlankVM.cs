using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.ViewModels
{
    /// <summary>
    /// FillInBlank ViewModel，用於與視圖交互
    /// </summary>
    public class FillInBlankVM
    {
        public int Id { get; set; }

        public int? QuestionId { get; set; }

        /// <summary>
        /// 外鍵，指向對應的 QuestionOption
        /// </summary>
        public int? QuestionOptionId { get; set; }

        /// <summary>
        /// 填空編號，從 1 開始自動遞增
        /// </summary>
        [Display(Name = "填空編號")]
        [Required(ErrorMessage = "填空編號是必填的")]
        public int BlankNumber { get; set; }

        /// <summary>
        /// 填空題的提示文字
        /// </summary>
        [Display(Name = "提示文字")]
       // [Required(ErrorMessage = "提示文字是必填的")]
       // [MaxLength(500, ErrorMessage = "提示文字不能超過500個字元")]
        public string? Placeholder { get; set; }

        /// <summary>
        /// 正則表達式，用於驗證填空輸入
        /// </summary>
        [Display(Name = "正則表達式")]
        public string RegexPattern { get; set; }

        /// <summary>
        /// 填空長度
        /// </summary>
        [Display(Name = "長度")]
        [Range(1, 100, ErrorMessage = "長度必須介於1到100之間")]
        public int Length { get; set; }

        /// <summary>
        /// 填空在描述中的插入位置
        /// </summary>
        [Display(Name = "插入位置")]
        [Range(1, 100, ErrorMessage = "插入位置必須介於1到100之間")]
        public int Position { get; set; }

        /// <summary>
        /// 軟刪除標誌
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// 答案文字（如有需要）
        /// </summary>
        public string AnswerText { get; set; }
    }
}
