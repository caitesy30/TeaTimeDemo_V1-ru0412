// Models/DTOs/QuestionDTO.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DTOs
{
    public class QuestionDTO
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public string SurveyTitle { get; set; }
        public int SurveyId { get; set; }
        public int AnswerType { get; set; }
        public DateTime? CreateTime { get; set; }
        public DateTime? CompleteTime { get; set; }

        public int? SortOrder { get; set; }

      

        // 其他必要的屬性
    }
}
