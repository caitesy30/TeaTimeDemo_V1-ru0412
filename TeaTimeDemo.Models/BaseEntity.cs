using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace TeaTimeDemo.Models
{
    public abstract class BaseEntity:ISoftDeletable
    {
        // 主鍵，唯一標識
        [Key]
        public int Id { get; set; }

        // 創建時間，設置預設值為當前時間並將其設定為只讀
        [DisplayFormat(DataFormatString = "{0:yyyy/MM/dd HH:mm:ss}", ApplyFormatInEditMode = true)]
        [DataType(DataType.DateTime)]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // 自動生成的欄位
        public DateTime? CreateTime { get; set; } = DateTime.Now;

        // 完成時間，預設為空
        [DisplayFormat(DataFormatString = "{0:yyyy/MM/dd HH:mm:ss}", ApplyFormatInEditMode = true)]
        [DataType(DataType.DateTime)]
        public DateTime? CompleteTime { get; set; }

        // 備註，選填欄位，並設置資料庫中的欄位類型為 nvarchar(max)
        [ValidateNever]
        [Column(TypeName = "nvarchar(max)")]
        public string? Remark { get; set; }

        // 排序順序，用於控制顯示的順序，可以是可選值
        public int? SortOrder { get; set; }

        // 軟刪除標誌，表示該記錄是否已被刪除
        public bool IsDeleted { get; set; } = false;

        // 刪除時間，當 IsDeleted 為 true 時，記錄刪除的時間
        public DateTime? DeletedAt { get; set; }
    }
}
