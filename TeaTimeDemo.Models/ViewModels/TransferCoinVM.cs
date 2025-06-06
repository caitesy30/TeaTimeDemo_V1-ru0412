// ==========================
// 檔名：TransferCoinVM.cs
// 製作人：茶神
// 日期：2024-06-07
// 目的：會員轉讓點數功能專用VM
// ==========================
namespace TeaTimeDemo.Models.ViewModels
{
    public class TransferCoinVM
    {
        public int CurrencyTypeId { get; set; }     // 幣種Id
        public string Name { get; set; }            // 幣名稱
        public int Quantity { get; set; }           // 持有數量
        public string IconPath { get; set; }        // 幣圖示

        public string TargetUserId { get; set; }    // 目標會員Id
        public string TargetUserName { get; set; }  // 目標會員名稱
        public int TransferQty { get; set; }        // 轉讓數量
        public string TargetLineFriendId { get; set; } // LINE好友唯一識別（或直接用好友名稱或LINE ID）
        public string TargetLineFriendName { get; set; }

        // 新增欄位：方便結果顯示
        public string TransferStatus { get; set; }    // 轉讓狀態
        public string SuccessMessage { get; set; }    // 成功訊息

        public string Note { get; set; }                // <<< 新增註記欄位


    }
}
