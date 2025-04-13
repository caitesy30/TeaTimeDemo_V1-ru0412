using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace TeaTimeDemo.Models.ViewModels
{
    public class AnswerVM
    {
        public Answer Answer { get; set; }

        // 問題的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionList { get; set; }

        // 使用者答案選項的下拉選單
        [ValidateNever]
        public IEnumerable<AnswerOptionVM> AnswerOptions { get; set; }
    }
}
