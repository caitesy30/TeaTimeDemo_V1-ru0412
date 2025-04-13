using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace TeaTimeDemo.Models.ViewModels
{
    public class QuestionImageVM
    {
        public QuestionImage QuestionImage { get; set; }

        // 問題的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionList { get; set; } // 用來選擇問題

        // 問卷的下拉選單（新增）
        [ValidateNever]
        public IEnumerable<SelectListItem> SurveyList { get; set; } // 用來選擇問卷

        // 選項的下拉選單（新增）
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionOptionList { get; set; } // 用來選擇問題的選項
    }
}
