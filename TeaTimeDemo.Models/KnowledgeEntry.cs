// Models/KnowledgeEntry.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    public class KnowledgeEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Keyword { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Definition { get; set; }

        [StringLength(50)]
        public string Source { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}