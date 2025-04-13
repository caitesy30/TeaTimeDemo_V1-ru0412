// TeaTimeDemo/DTOs/SurveyDTO.cs
using System;

namespace TeaTimeDemo.DTOs
{
    public class SurveyDTO
    {
        public int Id { get; set; }
        public string CategoryName { get; set; }
        public string Title { get; set; }
        public string StationName { get; set; }
        public string Description { get; set; }
        public int? QuestionNum { get; set; }
        public string IsPublished { get; set; }
        public string CreateTime { get; set; }
        public string CompleteTime { get; set; }
        public string JobName { get; set; }
    }
}
