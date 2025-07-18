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
        public bool IsClaimed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ClaimedAt { get; set; }
        public string? Token { get; set; }     // 唯一領取token
        public string? NickName { get; set; }  // 好友暱稱
    }
}
