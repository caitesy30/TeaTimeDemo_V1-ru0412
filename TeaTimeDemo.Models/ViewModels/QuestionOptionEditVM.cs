using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace TeaTimeDemo.Models.ViewModels
{
    public class QuestionOptionEditVM
    {
        public int Id { get; set; }

        [Display(Name = "選項文本")]
        [Required(ErrorMessage = "選項文本是必填字段")]
        [MaxLength(500, ErrorMessage = "選項文本不能超過500個字符")]
        public string OptionText { get; set; }

        [Display(Name = "是否正確")]
        public bool IsCorrect { get; set; }

        [Display(Name = "是否其他")]
        public bool IsOther { get; set; }

        [Display(Name = "描述")]
        [MaxLength(500, ErrorMessage = "描述不能超過500個字符")]
        public string Description { get; set; }

        [Display(Name = "排序順序")]
        public int SortOrder { get; set; }

        [Display(Name = "問題")]
        [Required(ErrorMessage = "問題是必填字段")]
        public int QuestionId { get; set; }

        /// <summary>
        /// 所屬問題的文本
        /// </summary>
        [Display(Name = "問題文本")]
        public string QuestionText { get; set; }

        // 下拉選單用於選擇問題
        public IEnumerable<SelectListItem> QuestionList { get; set; }

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


        // 其他需要的屬性
    }
}
