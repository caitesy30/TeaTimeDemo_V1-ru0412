// ==========================
// 檔名：Areas/Customer/Controllers/Api/SellerCrudController.cs
// 目的：Seller CRUD（示範用 In-Memory，後續可換 Repository/EF）
// 路由：/Customer/Api/SellerCrud/List|Upsert|Delete/{id}
// ==========================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers.Api
{
    [Area("Customer")]
    [ApiController]
    [Authorize] // 若需匿名測試請移除或改 AllowAnonymous
    [Route("Customer/Api/[controller]/[action]")]
    public class SellerCrudController : ControllerBase
    {
        private static readonly object _lock = new();
        private static int _id = 100;
        private static readonly List<SellerItemDto> _items = new()
        {
            new SellerItemDto{ Id=1, Name="無線滑鼠", Price=299, Stock=50, Category="3C", Image="https://picsum.photos/seed/x1/800/600" },
            new SellerItemDto{ Id=2, Name="運動水壺", Price=199, Stock=80, Category="運動", Image="https://picsum.photos/seed/x2/800/600" },
            new SellerItemDto{ Id=3, Name="休閒襪 3 入", Price=129, Stock=60, Category="服飾", Image="https://picsum.photos/seed/x3/800/600" },
        };

        [HttpGet]
        public IActionResult List(string? q = null)
        {
            IEnumerable<SellerItemDto> query = _items;
            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(x => x.Name.Contains(q, StringComparison.OrdinalIgnoreCase));
            return Ok(query.OrderByDescending(x => x.Id).ToList());
        }

        [HttpGet("{id:int}")]
        public IActionResult Get(int id)
        {
            var it = _items.FirstOrDefault(x => x.Id == id);
            return it == null ? NotFound() : Ok(it);
        }

        [HttpPost]
        public IActionResult Upsert([FromBody] SellerItemDto input)
        {
            if (input == null || string.IsNullOrWhiteSpace(input.Name))
                return BadRequest("名稱必填");
            lock (_lock)
            {
                if (input.Id <= 0)
                {
                    input.Id = ++_id;
                    _items.Add(input);
                }
                else
                {
                    var it = _items.FirstOrDefault(x => x.Id == input.Id);
                    if (it == null) return NotFound();
                    it.Name = input.Name;
                    it.Price = input.Price;
                    it.Stock = input.Stock;
                    it.Category = input.Category ?? it.Category;
                    it.Image = input.Image ?? it.Image;
                    it.Desc = input.Desc ?? it.Desc;
                }
            }
            return Ok(input);
        }

        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            lock (_lock)
            {
                var it = _items.FirstOrDefault(x => x.Id == id);
                if (it == null) return NotFound();
                _items.Remove(it);
            }
            return Ok(new { ok = true });
        }
    }

    // 簡化 DTO（示範）
    public class SellerItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int Price { get; set; }
        public int Stock { get; set; }
        public string? Category { get; set; }
        public string? Image { get; set; }
        public string? Desc { get; set; }
    }
}
