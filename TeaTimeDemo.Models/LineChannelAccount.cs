// Models/LineChannelAccount.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 將各 LINE Channel 的 userId 映射到平台全域會員 (ApplicationUser.Id)
    /// </summary>
    public class LineChannelAccount
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(50)]
        public string ChannelId { get; set; } = "";    // LINE Messaging API 的 ChannelId

        [Required, MaxLength(64)]
        public string LineUserId { get; set; } = "";   // 該 Channel 下的使用者 userId

        [Required]
        public string GlobalUserId { get; set; } = ""; // ApplicationUser.Id（全域會員）

        public DateTime LinkedAt { get; set; } = DateTime.UtcNow;
    }
}
