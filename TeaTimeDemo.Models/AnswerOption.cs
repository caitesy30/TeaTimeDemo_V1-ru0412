using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;


namespace TeaTimeDemo.Models
{
    // 用於表示答案選擇的選項
    public class AnswerOption:BaseEntity, ISoftDeletable
    {
     

        // 答案的外鍵，指向 Answer
        public int AnswerId { get; set; }

        [ForeignKey("AnswerId")]
        public virtual Answer Answer { get; set; }

        // 選項的外鍵，指向 QuestionOption
        public int QuestionOptionId { get; set; }

        [ForeignKey("QuestionOptionId")]
        public virtual QuestionOption QuestionOption { get; set; }

        // 是否是正確的答案選項
        public bool IsCorrect { get; set; }

        // 是否是 "其他" 選項（允許用戶輸入自定義答案）
        public bool IsOther { get; set; }

        // 選項的詳細描述
        [MaxLength(500)]
        public string? Description { get; set; }
    }
}

