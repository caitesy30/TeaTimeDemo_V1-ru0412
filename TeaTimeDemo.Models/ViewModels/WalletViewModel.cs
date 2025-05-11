using System.Collections.Generic;

namespace TeaTimeDemo.Models.ViewModels
{
    /// <summary>
    /// 單一錢包項目
    /// </summary>
    public class WalletItemViewModel
    {
        public string Name { get; set; }      // 名稱，如「公益幣」
        public int Quantity { get; set; }     // 擁有數量
    }

    /// <summary>
    /// 我的錢包頁面 ViewModel
    /// </summary>
    public class WalletViewModel
    {
        public int TotalPoints { get; set; }      // 點數總數（示範）
        public int ConvertQuantity { get; set; }  // 換算後金額
        public IEnumerable<WalletItemViewModel> Items { get; set; }  // 明細清單
    }
}
