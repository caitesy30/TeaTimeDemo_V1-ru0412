// ==========================
// 檔名：WalletItemViewModel.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：前端顯示用—單一幣持有資訊
// ==========================

namespace TeaTimeDemo.Models.ViewModels
{
    public class WalletItemViewModel
    {
        public string Name { get; set; }
        public int Quantity { get; set; }

        public int ExchangeRate { get; set; }  // 加入兌換率
    }
}
