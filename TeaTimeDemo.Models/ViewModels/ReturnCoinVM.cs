// ==========================
// 檔名：ReturnCoinVM.cs
// 製作人：茶神
// 日期：2024-06-06
// 目的：返還點數功能專用VM
// ==========================
namespace TeaTimeDemo.Models.ViewModels
{
    public class ReturnCoinVM
    {
        public int CurrencyTypeId { get; set; }    // 幣種Id
        public string Name { get; set; }           // 幣名稱
        public int Quantity { get; set; }          // 持有數量
        public string IconPath { get; set; }       // 幣圖示
    }
}
