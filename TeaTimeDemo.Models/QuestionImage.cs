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
    // QuestionImage 類別，用於存儲問卷、問題和選項的圖片
    public class QuestionImage:BaseEntity, ISoftDeletable
    {
  

        // SurveyId，用於關聯到問卷，如果圖片屬於問卷，則此欄位有值
        public int? SurveyId { get; set; }
        [ForeignKey("SurveyId")]
        [JsonIgnore]
        public virtual Survey? Survey { get; set; } // 導覽屬性，關聯到 Survey

        // QuestionId，用於關聯到問題，如果圖片屬於問題，則此欄位有值
        public int? QuestionId { get; set; }
        [ForeignKey("QuestionId")]
        [JsonIgnore]
        public virtual Question? Question { get; set; } // 導覽屬性，關聯到 Question

        // QuestionOptionId，用於關聯到選項，如果圖片屬於選項，則此欄位有值
        public int? QuestionOptionId { get; set; }
        [ForeignKey("QuestionOptionId")]
        [JsonIgnore]
        public virtual QuestionOption? QuestionOption { get; set; } // 導覽屬性，關聯到 QuestionOption

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } // 圖片的 URL

        [MaxLength(200)]
        public string? AltText { get; set; } // 圖片的替代文字

        public DateTime? UploadTime { get; set; } = DateTime.Now; // 上傳時間

 

        // 新增的屬性
        public int Width { get; set; } = 200;  // 預設值 200px
        public int Height { get; set; } = 200; // 預設值 200px


    }
}
