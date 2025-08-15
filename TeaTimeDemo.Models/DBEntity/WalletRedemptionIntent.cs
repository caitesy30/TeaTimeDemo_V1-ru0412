using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DBEntity
{
    /// <summary>
    /// 萬用留言/兌換意圖：只要有 rid 就能在後端完成核銷，不用再把 mode/token 外露到網址
    /// </summary>
    public class WalletRedemptionIntent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid(); // rid

        [MaxLength(50)]
        public string Mode { get; set; } = string.Empty; // gift / invite / 其他

        [MaxLength(200)]
        public string Token { get; set; } = string.Empty; // 你的自訂外部 token（不再出現在網址）

        [MaxLength(100)]
        public string? LineUserId { get; set; } // 成功登入後綁定的 LINE UserId（避免重放）

        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        public DateTime? ConsumedUtc { get; set; } // 核銷時間

        /// <summary>
        /// 0=Pending, 1=Consumed, 2=Cancelled/Expired
        /// </summary>
        public int Status { get; set; } = 0;

        /// <summary>
        /// 安全起見，意圖只在短時間內有效（例如 30 分鐘）
        /// </summary>
        public DateTime ExpiresUtc { get; set; } = DateTime.UtcNow.AddMinutes(30);

        // Models/DBEntity/WalletRedemptionIntent.cs （新增兩欄）
        [MaxLength(64)] public string? SourceLiffId { get; set; }     // 來源 LIFF ID
        [MaxLength(50)] public string? SourceChannelId { get; set; }  // 來源 LINE ChannelId



    }
}
