// Models/DTOs/AnswerOptionDTO.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DTOs
{
    public class AnswerOptionDTO
    {
        public int Id { get; set; }

        // 外鍵，指向對應的 QuestionOption
        [Required(ErrorMessage = "選項 ID 是必填欄位")]
        public int QuestionOptionId { get; set; }

        // 答案文本內容
        [Required(ErrorMessage = "答案文本是必填欄位")]
        [MaxLength(500, ErrorMessage = "答案文本不能超過500個字元")]
        public string AnswerText { get; set; }

        // 排序順序
        public int? SortOrder { get; set; }

        // 軟刪除標誌
        public bool IsDeleted { get; set; } = false;

        // 刪除時間
        public DateTime? DeletedAt { get; set; }
    }
}
