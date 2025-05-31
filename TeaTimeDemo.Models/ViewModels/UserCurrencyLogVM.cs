// ==========================
// 檔名：UserCurrencyLogVM.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：給前端錢包頁用的交易紀錄VM
// ==========================
using System;

namespace TeaTimeDemo.Models.ViewModels
{
    public class UserCurrencyLogVM
    {
        public DateTime CreatedAt { get; set; }         // 異動時間
        public string CurrencyTypeName { get; set; }    // 幣種名稱（由後端查出來）
        public int Quantity { get; set; }               // 異動數量
        public int BalanceAfter { get; set; }           // 異動後餘額
        public string Action { get; set; }              // 動作（如消費、贈送）
        public string Memo { get; set; }                // 備註
    }
}
