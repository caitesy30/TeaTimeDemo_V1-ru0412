using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;

namespace TeaTimeDemo.Models
{
    public class AnsweredNotes : BaseEntity
    {
        //料號
        public int PcbCategoryId { get; set; }
        public string MtNum { get; set; }

        public string OptionList { get; set; }

        public string? status { get; set; }

        public int stage { get; set; } = 0;

        // 使用者的外鍵欄位，連接到 ApplicationUser 表，追蹤誰回答了這個問題
        public string? ApplicationUserId { get; set; }

        // 指定這個欄位是外鍵，對應到 ApplicationUser 資料表
        [ForeignKey("ApplicationUserId")]
        [ValidateNever]
        public virtual ApplicationUser ApplicationUser { get; set; }

        // 動態生成使用者姓名，防止此屬性被序列化到 JSON
        [JsonIgnore]
        public string JobName { get; set; }

        // 動態生成使用者工號，同樣避免序列化
        [JsonIgnore]
        public string JobNum { get; set; }
    }
}
