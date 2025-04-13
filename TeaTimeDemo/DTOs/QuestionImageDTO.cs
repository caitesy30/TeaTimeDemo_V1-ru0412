// Models/DTOs/QuestionImageDTO.cs
using System;
using System.Collections.Generic;

namespace TeaTimeDemo.Models.DTOs
{
    public class QuestionImageDTO
    {
        public int Id { get; set; }
        public int? SurveyId { get; set; }
        public int? QuestionId { get; set; }
        public int? QuestionOptionId { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public DateTime? UploadTime { get; set; }
        public int? SortOrder { get; set; }
        public string ImageExtension { get; set; } // 新增圖片擴展名
        public List<string> ImageBase64Parts { get; set; } // 新增 Base64 字串部分
        public int Width { get; set; }  
        public int Height { get; set; }
        public string Description { get; set; }              
        public bool IsDeleted { get; set; } = false;
    }
}
