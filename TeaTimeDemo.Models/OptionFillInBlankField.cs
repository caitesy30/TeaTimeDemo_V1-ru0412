// Models/OptionFillInBlankField.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    public class OptionFillInBlankField
    {
        public int Id { get; set; }

        [Required]
        public int QuestionOptionId { get; set; }

        [ForeignKey("QuestionOptionId")]
        public virtual QuestionOption QuestionOption { get; set; }

        // 在 OptionText 中的索引位置，用於確定填空字段的位置
        public int Index { get; set; }

        // 其他屬性，如占位符文字等，可以根據需求添加
        public string Placeholder { get; set; }
    }
}
