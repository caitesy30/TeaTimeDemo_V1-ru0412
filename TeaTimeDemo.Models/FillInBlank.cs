// Models/FillInBlank.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TeaTimeDemo.Models
{
    public class FillInBlank:BaseEntity, ISoftDeletable
    {

        public int? QuestionId { get; set; }
        [ForeignKey("QuestionId")]
        [JsonIgnore]
        public virtual Question? Question { get; set; } // 導覽屬性，關聯到 Question

        // 關聯到 QuestionOption 的外鍵
        public int? QuestionOptionId { get; set; }

        /// <summary>
        /// 外鍵關聯：連接到 QuestionOption
        /// </summary>
        [ForeignKey("QuestionOptionId")]
        [JsonIgnore]
        public virtual QuestionOption? QuestionOption { get; set; }

        // 填空編號，從 1 開始自動遞增
        [Display(Name = "填空編號")]
        public int BlankNumber { get; set; }

        // 正則表達式，用於驗證填空輸入
        [Display(Name = "正則表達式")]
        public string RegexPattern { get; set; }

        // 填空長度
        [Display(Name = "長度")]
        public int Length { get; set; }

        // 填空在描述中的插入位置
        [Display(Name = "插入位置")]
        public int Position { get; set; } // 在描述中的位置

        // **新增屬性**：填空的提示文字
        [Display(Name = "提示文字")]
        public string? Placeholder { get; set; } // 新增這一行
    }
}