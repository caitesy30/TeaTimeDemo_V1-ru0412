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
    // Notes 問題表，儲存問卷中的每個問題的回答
    public class Answer : BaseEntity, ISoftDeletable
    {
        // 問題的外鍵，指向對應的問題
        public int QuestionId { get; set; }

        // 指定 QuestionId 是外鍵，關聯到 Question 表
        [ForeignKey("QuestionId")]
        public virtual  Question Question { get; set; }

        // 使用者的外鍵欄位，連接到 ApplicationUser 表，追蹤誰回答了這個問題
        public string? ApplicationUserId { get; set; }

        // 指定這個欄位是外鍵，對應到 ApplicationUser 資料表
        [ForeignKey("ApplicationUserId")]
        [ValidateNever]
        public virtual ApplicationUser ApplicationUser { get; set; }

        // 動態生成使用者姓名，防止此屬性被序列化到 JSON
        [JsonIgnore]
        public string? JobName => ApplicationUser?.Name;

        // 動態生成使用者工號，同樣避免序列化
        [JsonIgnore]
        public string? JobNum => ApplicationUser?.Address;

        // Notes 料號，表示特定的料號
        public string? MtNum { get; set; }

        // 用於區分答案的類型（例如填空、單選、多選等）
        public AnswerTypeEnum AnswerType { get; set; }

        // 對於填寫類型的問題，存儲用戶的文字回答
        [MaxLength(500, ErrorMessage = "答案不能超過500個字元")]
        public string? AnswerText { get; set; }

        // 對於單選或多選題型，存儲選中的選項，與 QuestionOption 的關聯
        public virtual ICollection<AnswerOption> SelectedOptions { get; set; } = new List<AnswerOption>(); // 修正部分
    }
}
