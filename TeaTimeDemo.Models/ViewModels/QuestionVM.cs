// Models/ViewModels/QuestionVM.cs
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations; // 新增此命名空間以使用 IFormFile

namespace TeaTimeDemo.Models.ViewModels
{
    public class QuestionVM
    {
        public int Id { get; set; }

        public int CurrentQuestionId { get; set; } // 用於插入操作，指定插入位置的問題 ID

        public Question Question { get; set; }              

        public string QuestionText { get; set; }

        public string SurveyTitle { get; set; } // 新增的屬性


        // 對於填空類型的答案
        [MaxLength(500, ErrorMessage = "答案不能超過500個字元")]
        public string? AnswerText { get; set; }

        [ValidateNever]
        public string? MceHtml { get; set; }

        [ValidateNever]
        public int? SurveyId { get; set; }

        [ValidateNever]
        public int? SortOrder { get; set; }

        // 單選選項
        public int? SelectedOption { get; set; }

        // 用於接收用戶的回答
        // 使用者選擇的選項
        public List<int> SelectedOptions { get; set; } = new List<int>();

        // 答案類型的下拉選單（單選、多選、填空等）
        [ValidateNever]
        public List<SelectListItem> AnswerTypeList { get; set; }

        // 這裡加入 AnswerType 屬性
        public AnswerTypeEnum AnswerType { get; set; }

        // 问卷列表（下拉选单）
        [ValidateNever]
        public IEnumerable<SelectListItem> SurveyList { get; set; }

        // 這個問題的選項 ViewModel 列表
        public List<QuestionOptionVM> QuestionOptionVMs { get; set; } = new List<QuestionOptionVM>();

        public List<QuestionImage> QuestionImages { get; set; } = new List<QuestionImage>();

        // **新增屬性**：用於接收問題的圖片檔案
        [ValidateNever]
        public List<IFormFile> QuestionImageFiles { get; set; } = new List<IFormFile>();

        [ValidateNever]
        public List<int> QuestionImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> QuestionImageHeights { get; set; } = new List<int>();

        // 現有問題圖片相關屬性
        public List<int> ExistingQuestionImageIds { get; set; } = new List<int>();
        public List<int> ExistingQuestionImageWidths { get; set; } = new List<int>();
        public List<int> ExistingQuestionImageHeights { get; set; } = new List<int>();

        // **新增屬性**：用於接收新上傳的問題圖片的寬度和高度
        [ValidateNever]
        public List<int> NewQuestionImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> NewQuestionImageHeights { get; set; } = new List<int>();

        // **新增屬性**：問題級別的填空列表
        public List<FillInBlankVM> FillInBlanks { get; set; } = new List<FillInBlankVM>();

        // 答案類型的枚舉：定義不同的回答方式
        public enum AnswerTypeEnum
        {
            [Display(Name = "單選")]
            SingleChoice = 0,  // 單選題
            [Display(Name = "多選")]
            MultipleChoice = 1,  // 多選題
            [Display(Name = "填空")]
            TextAnswer = 2,  // 填空題
            [Display(Name = "填空框")]
            TextareaAnswer = 3,  // 長文本填空題
            [Display(Name = "下拉選單")]
            SelectOption = 4,  // 下拉選單選項
            [Display(Name = "圖片上傳")]
            ImageUpload = 5  // 圖片上傳
                             // 可以在此處擴展更多的回答類型
        }


    }
}
