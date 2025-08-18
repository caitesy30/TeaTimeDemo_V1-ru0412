// ==========================
// API：商城商品清單（別名版）
// Route: /Customer/Api/StoreProducts/List
// 後續只要把 _seed 換成資料庫查詢即可
// ==========================
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers.Api
{
    [Area("Customer")]
    [ApiController]
    [Route("Customer/Api/[controller]/[action]")]
    public class StoreProductsController : ControllerBase
    {
        // ⚠️ 先用 In-Memory（DEMO），避免動到你現有 ProductVm/Db
        private static readonly List<StoreProductVM> _seed = new()
        {
            new StoreProductVM{ Id=1, Name="無線藍牙耳機", Price=1290, Seller="音控小舖",
                Image="https://picsum.photos/seed/p1/800/600", Category="3C",
                Brief="藍牙5.3｜ENC降噪", Desc="支援快速配對、Type‑C 充電。"
            },
            new StoreProductVM{ Id=2, Name="雙人保暖被", Price=980, Seller="溫暖家居",
                Image="https://picsum.photos/seed/p2/800/600", Category="居家",
                Brief="保暖輕盈", Desc="冬天必備，親膚材質。"
            },
            new StoreProductVM{ Id=3, Name="極細眼線液", Price=299, Seller="美妝研究社",
                Image="https://picsum.photos/seed/p3/800/600", Category="美妝",
                Brief="防水抗暈", Desc="新手也好畫。"
            },
            new StoreProductVM{ Id=4, Name="機能運動衣", Price=690, Seller="UP SPORT",
                Image="https://picsum.photos/seed/p4/800/600", Category="服飾",
                Brief="吸濕排汗", Desc="跑步健身必備。"
            },
            new StoreProductVM{ Id=5, Name="迷你積木組", Price=450, Seller="玩具共和國",
                Image="https://picsum.photos/seed/p5/800/600", Category="玩具",
                Brief="創意啟蒙", Desc="含說明書與收納盒。"
            },
            new StoreProductVM{ Id=6, Name="休閒露營椅", Price=1150, Seller="戶外玩家",
                Image="https://picsum.photos/seed/p6/800/600", Category="戶外",
                Brief="輕量折疊", Desc="附收納袋，輕鬆外出。"
            },
        };

        [HttpGet]
        public IActionResult List(string? cat = null, int page = 1, int size = 20, string? q = null)
        {
            IEnumerable<StoreProductVM> query = _seed;
            if (!string.IsNullOrWhiteSpace(cat) && cat != "全部")
                query = query.Where(x => x.Category.Equals(cat, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(x => x.Name.Contains(q, StringComparison.OrdinalIgnoreCase));

            var total = query.Count();
            var items = query.Skip((page - 1) * size).Take(size).ToList();
            return Ok(new { total, items });
        }

        [HttpGet("{id:int}")]
        public IActionResult Detail(int id)
        {
            var prod = _seed.FirstOrDefault(p => p.Id == id);
            if (prod == null) return NotFound();
            return Ok(prod);
        }
    }

    // ✅ 別名 VM，避免和你原本 ProductVm 衝突
    public class StoreProductVM
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int Price { get; set; }
        public string Seller { get; set; } = "";
        public string Image { get; set; } = "";
        public string Category { get; set; } = "";
        public string? Brief { get; set; }
        public string? Desc { get; set; }
    }
}
