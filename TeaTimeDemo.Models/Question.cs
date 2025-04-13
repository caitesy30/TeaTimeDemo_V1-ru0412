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
    // Question 類別：表示問卷中的問題
    public class Question : BaseEntity, ISoftDeletable
    {
 


        // 外鍵：連接到 Survey (問卷) 的主鍵
        public int SurveyId { get; set; }

        // 外鍵關聯：連接到 Survey 表（問卷表）
        [ForeignKey("SurveyId")]
        public virtual Survey Survey { get; set; } // 虛擬導航屬性，連接到問卷資料

        // 問題文本內容，限制字元長度不超過 500 個字元，為必填欄位
        [Required]
        [MaxLength(500)]
        public string QuestionText { get; set; }

        // 枚舉類型，定義問題的回答形式（例如：單選、多選、填空等）
        public AnswerTypeEnum AnswerType { get; set; }


        // 關聯到該問題的圖片集合
        // 使用 virtual 可支援延遲加載，並初始化為一個空的 List
        public virtual List<QuestionImage> QuestionImages { get; set; } = new List<QuestionImage>();

        // 關聯到該問題的選項集合
        public virtual List<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();

        // 问题级别的填空字段
        //public virtual List<FillInBlank> FillInBlanks { get; set; }
        public virtual ICollection<FillInBlank> FillInBlanks { get; set; } = new List<FillInBlank>();


        public Question()
        {
            QuestionImages = new List<QuestionImage>();
            QuestionOptions = new List<QuestionOption>();
        }

        // 儲存 TinyMCE 富文本編輯器中的 HTML 內容，非必填
        [ValidateNever]
        [Column(TypeName = "nvarchar(max)")] // 設定欄位類型為 nvarchar(max)
        public string? MceHtml { get; set; }
    }

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
