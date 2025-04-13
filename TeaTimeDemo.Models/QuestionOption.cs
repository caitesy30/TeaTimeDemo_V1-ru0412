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
    // Notes 問題表中的答案選項模組，用來儲存與問題相關的選項
    public class QuestionOption:BaseEntity, ISoftDeletable
    {
    

        // 外鍵，指向對應的問題
        public int QuestionId { get; set; }

        // 指定 QuestionId 是外鍵，關聯到 Question 表
        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; } // 虛擬導航屬性，連接到問題的資料

        // 選項的文本內容，必填，限制字元數不超過 500 個字元
        [ValidateNever]
       // [Required(ErrorMessage = "選項文本是必填欄位")]
       // [MaxLength(500, ErrorMessage = "選項文本不能超過500個字元")]
        public string OptionText { get; set; }

       

        // 是否為正確答案，適用於測驗類型的問題
        public bool IsCorrect { get; set; }

        // 是否為 "其他" 選項，允許用戶輸入自訂答案
        public bool IsOther { get; set; }

        // 選項的詳細描述，選填欄位
        [MaxLength(500, ErrorMessage = "描述不能超過500個字元")]
        public string? Description { get; set; }

        // 關聯到答案選項的集合，用來存儲與該選項相關的答案
        public virtual List<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();

        // 關聯到圖片的集合，用來存儲與該選項相關的圖片
        // 使用 virtual 關鍵字以支援 Entity Framework 的延遲加載
        public virtual List<QuestionImage> QuestionImages { get; set; } = new List<QuestionImage>();

        // 新增 FillInBlanks 集合
        public virtual ICollection<FillInBlank> FillInBlanks { get; set; } = new List<FillInBlank>();

    }
}
