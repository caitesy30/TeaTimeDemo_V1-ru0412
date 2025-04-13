//DocumentExport.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace TeaTimeDemo.Models
{
    public class DocumentExport
    {
        [Key]
        public int Id { get; set; }

        // 一、四個欄位（從第一個模塊）
        [MaxLength(50)]
        public string? Category { get; set; }     // 種類
        [MaxLength(50)]
        public string? Station { get; set; }      // 站別
        [MaxLength(50)]
        public string? PageNo { get; set; }       // 頁數
        [MaxLength(50)]
        public string? SequenceNo { get; set; }   // 序號

        // 二、文件編號（從最後一個模塊）
        [MaxLength(50)]
        public string? DocumentId { get; set; }

        // 三、額外欄位：Html、圖片、備註
        [Column(TypeName = "NVARCHAR(MAX)")]
        public string? HtmlContent { get; set; }  // 儲存此份 HTML
        public string? Images { get; set; }       // 圖片路徑/檔名 或 Base64
        public string? Comment { get; set; }      // 備註

        // ★ 新增欄位 ★
        public int Version { get; set; }          // 版本號
        public DateTime? LatestTime { get; set; }   // 最新更新時間
        [MaxLength(50)]
        public string? CreatedById { get; set; }    // 工號
        [MaxLength(50)]
        public string? CreatedByName { get; set; }  // 姓名
        [MaxLength(50)]
        public string? Suffix { get; set; }  // 後綴

        // 四、與 HtmlSection 的一對多關聯
        public virtual ICollection<HtmlSection> HtmlSections { get; set; }

        public DocumentExport()
        {
            HtmlSections = new List<HtmlSection>();
        }
    }
}
