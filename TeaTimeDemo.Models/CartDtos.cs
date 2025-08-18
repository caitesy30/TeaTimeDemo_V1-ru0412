using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TeaTimeDemo;


namespace TeaTimeDemo.Models
{
    // 購物車項目（Session 版本）
    public class CartItemDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = "";
        public int Price { get; set; }
        public int Qty { get; set; }
        public string Image { get; set; } = "";
        public string Seller { get; set; } = "";
    }

    public class CartSummaryDto
    {
        public int Count { get; set; }   // 總件數
        public int Amount { get; set; }  // 總金額（Coins）
    }
}
