// ==========================
// 檔名：CurrencyType.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：定義幣/點數種類主檔（幣別管理）
// ==========================

using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 幣/點數種類主檔
    /// </summary>
    public class CurrencyType
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; }            // 幣名稱
        public int TotalIssued { get; set; }        // 發行數量
        public string Description { get; set; }     // 幣說明
        public DateTime IssuedAt { get; set; }     // 發行日期（原CreatedAt改名，資料庫需Migration調整）
        public DateTime? UpdatedAt { get; set; }   // 更新日期（可為空）
        public int ExchangeRate { get; set; }      // 抵押兌換率（例50表示50:1）
        public string IconPath { get; set; }       // 幣圖示（檔案路徑）
        public int SortOrder { get; set; }         // 排序值，數字越小越前面


    }
}
