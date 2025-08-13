using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    public class PendingCoin
    {
        [Key]
        public int Id { get; set; }
        //[Required]
        public string? LineUserId { get; set; }        // LINE帳號
        [Required]
        public int CurrencyTypeId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public string FromUserId { get; set; }
        public string Memo { get; set; }


        // ---- 狀態/審計 ----
        public bool IsClaimed { get; set; }
        public int Status { get; set; } = 0;           // 0=Pending, 1=Claimed, 2=Cancelled/Expired+Refunded
        public DateTime CreatedAt { get; set; }
        public DateTime? ClaimedAt { get; set; }
        public string? Token { get; set; }     // 唯一領取token
        public string? NickName { get; set; }  // 好友暱稱

        // C 方案新增
        public DateTime ExpiresAt { get; set; }        // 逾期時間（例如 +24h）
        public string? ClaimedByLineUserId { get; set; }
        public Guid? ClaimedRid { get; set; }
        public DateTime? RefundedAt { get; set; }

        [Timestamp] public byte[]? RowVersion { get; set; } // 樂觀鎖，擋並發

    }
}
