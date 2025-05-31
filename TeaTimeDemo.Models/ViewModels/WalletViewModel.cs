// ==========================
// 檔名：WalletViewModel.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：前端顯示用—錢包總覽＋交易明細
// ==========================

using System.Collections.Generic;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Models.ViewModels
{
    public class WalletViewModel
    {
        public List<WalletItemViewModel> Items { get; set; }
        public List<UserCurrencyLogVM> Logs { get; set; }  // <--- 這裡改成 VM
        public int ConvertQuantity { get; set; }    // 換算顯示
        public int TotalPoints { get; set; }
    }
}
