using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;


namespace TeaTimeDemo.Models
{
    public class NotesModify : BaseEntity
    {
        public string MtNum { get; set; }

        public string Status { get; set; }
        public int Stage { get; set; }
        public string? ApplicationUserId { get; set; }
        [ForeignKey("ApplicationUserId")]
        [ValidateNever]
        public virtual ApplicationUser ApplicationUser { get; set; }
        [JsonIgnore]
        public string JobName { get; set; }

        // 動態生成使用者工號，同樣避免序列化
        [JsonIgnore]
        public string JobNum { get; set; }


    }
}
