using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    public class OutboxMessage
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(80)] public string Type { get; set; }  // e.g. PendingCoinClaimed / PendingCoinExpiredRefunded
        [Required] public string PayloadJson { get; set; } = "{}";
        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
        public DateTime? NotBeforeUtc { get; set; }                 // 重試回退
        public int Attempts { get; set; } = 0;
        public DateTime? ProcessedUtc { get; set; }
        public string? LastError { get; set; }
    }
}
