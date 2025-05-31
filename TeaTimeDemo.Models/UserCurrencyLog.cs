// ==========================
// 檔名：UserCurrencyLog.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：定義會員幣/點數交易紀錄表（所有進出紀錄）
// ==========================

using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 會員幣/點數交易紀錄
    /// </summary>
    public class UserCurrencyLog
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; }          // ApplicationUser.Id
        [Required]
        public int CurrencyTypeId { get; set; }     // 幣種 Id
        public int Quantity { get; set; }           // 異動數量
        public int BalanceAfter { get; set; }       // 異動後餘額
        public string Action { get; set; }          // 進/出/消費/贈送
        public string Memo { get; set; }            // 備註
        public DateTime CreatedAt { get; set; }     // 異動時間
    }
}
