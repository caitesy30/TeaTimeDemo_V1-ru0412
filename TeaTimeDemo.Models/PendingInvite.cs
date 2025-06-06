// Models/PendingInvite.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    public class PendingInvite
    {
        public int Id { get; set; }
        public string FromUserId { get; set; }
        public string Token { get; set; } // 唯一Token
        public int CurrencyTypeId { get; set; }
        public int Quantity { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsClaimed { get; set; } // 是否已領取
        public string ToLineUserId { get; set; } // 領取人LINE UserId（未領時為空）
    }
}