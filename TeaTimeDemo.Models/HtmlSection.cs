//HtmlSection.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    public class HtmlSection
    {
        [Key]
        public int Id { get; set; }

        public int DocumentExportId { get; set; }

        [ForeignKey("DocumentExportId")]
        public virtual DocumentExport DocumentExport { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string HtmlPart { get; set; }

        // ★ 新增欄位：版本號 (對應 DocumentExport 的版本)
        public int Version { get; set; }

        public HtmlSection()
        {
        }
    }
}
