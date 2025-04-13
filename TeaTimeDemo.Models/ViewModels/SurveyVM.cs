using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http; // 新增此命名空間以使用 IFormFile

namespace TeaTimeDemo.Models.ViewModels
{
    public class SurveyVM
    {
        public Survey Survey { get; set; }  // 問卷實體


        // 問卷基本資訊
        // 類別的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> CategoryList { get; set; }

        // 站別的下拉選單
        [ValidateNever]
        public IEnumerable<SelectListItem> StationList { get; set; }


        // 問題類型列表
        // 問題類型的下拉選單（單選、多選、填空等）
        [ValidateNever]
        public IEnumerable<SelectListItem> QuestionTypeList { get; set; }



        // 問卷中包含的問題 ViewModel 列表
        public List<QuestionVM> QuestionVMs { get; set; } = new List<QuestionVM>();

        public List<Question> Questions { get; set; }

        // **新增屬性**：用於接收問卷的圖片檔案
        [ValidateNever]
        public List<IFormFile> SurveyImageFiles { get; set; } = new List<IFormFile>();

        [ValidateNever]
        public string? MceHtml { get; set; }


        [ValidateNever]
        public List<int> SurveyImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> SurveyImageHeights { get; set; } = new List<int>();

        // **新增屬性**：用於接收新上傳的問卷圖片的寬度和高度
        [ValidateNever]
        public List<int> NewSurveyImageWidths { get; set; } = new List<int>(); // <-- 在這裡添加

        [ValidateNever]
        public List<int> NewSurveyImageHeights { get; set; } = new List<int>(); // <-- 在這裡添加


        // **新增屬性**：用於接收現有問卷圖片的 ID、寬度和高度
        [ValidateNever]
        public List<int> ExistingSurveyImageIds { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> ExistingSurveyImageWidths { get; set; } = new List<int>();

        [ValidateNever]
        public List<int> ExistingSurveyImageHeights { get; set; } = new List<int>();

        // **新增屬性**：用於接收現有問題圖片的 ID、寬度和高度
        [ValidateNever]
        public List<List<int>> ExistingQuestionImageIds { get; set; } = new List<List<int>>();

        [ValidateNever]
        public List<List<int>> ExistingQuestionImageWidths { get; set; } = new List<List<int>>();

        [ValidateNever]
        public List<List<int>> ExistingQuestionImageHeights { get; set; } = new List<List<int>>();

        // **新增屬性**：用於接收現有選項圖片的 ID、寬度和高度
        [ValidateNever]
        public List<List<List<int>>> ExistingOptionImageIds { get; set; } = new List<List<List<int>>>();

        [ValidateNever]
        public List<List<List<int>>> ExistingOptionImageWidths { get; set; } = new List<List<List<int>>>();

        [ValidateNever]
        public List<List<List<int>>> ExistingOptionImageHeights { get; set; } = new List<List<List<int>>>();

        public Dictionary<string, int> ImageMappings { get; set; }


    }

}
