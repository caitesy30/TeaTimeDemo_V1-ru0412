using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace TeaTimeDemo.Models.ViewModels
{
    public class AnswerOptionVM
    {
        public AnswerOption AnswerOption { get; set; }

        // 答案的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> AnswerList { get; set; }

        // 問題選項的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionOptionList { get; set; }
    }
}
