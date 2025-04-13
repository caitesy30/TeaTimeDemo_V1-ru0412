//SurveyAnswerHtmlSection.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 新增：儲存 SurveyAnswerExport 分段的 HTML
    /// </summary>
    public class SurveyAnswerHtmlSection
    {
        [Key]
        public int Id { get; set; }

        public int SurveyAnswerExportId { get; set; }

        [ForeignKey("SurveyAnswerExportId")]
        public virtual SurveyAnswerExport SurveyAnswerExport { get; set; }

        [Column(TypeName = "NVARCHAR(MAX)")]
        public string HtmlPart { get; set; }
    }
}
