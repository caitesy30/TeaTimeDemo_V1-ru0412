using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class CurrencyTypeController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _webHostEnv;

        public CurrencyTypeController(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnv)
        {
            _unitOfWork = unitOfWork;
            _webHostEnv = webHostEnv;
        }

        // 幣種清單（排序優先依 SortOrder，再依發行日降冪）
        public IActionResult Index()
        {
            var list = _unitOfWork.CurrencyType
                .GetAll()
                .OrderBy(x => x.SortOrder)
                .ThenByDescending(x => x.IssuedAt)
                .ToList();
            return View(list);
        }

        // 新增 GET
        public IActionResult Create()
        {
            return View();
        }

        // 新增 POST
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CurrencyType model, IFormFile iconFile)
        {
            if (ModelState.IsValid)
            {
                // 圖示檔案處理
                if (iconFile != null && iconFile.Length > 0)
                {
                    string folder = Path.Combine(_webHostEnv.WebRootPath, "images", "currency-icons");
                    if (!Directory.Exists(folder))
                        Directory.CreateDirectory(folder);

                    string ext = Path.GetExtension(iconFile.FileName);
                    string fileName = $"{Guid.NewGuid()}{ext}";
                    string filePath = Path.Combine(folder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await iconFile.CopyToAsync(stream);
                    }
                    model.IconPath = $"/images/currency-icons/{fileName}";
                }
                model.IssuedAt = DateTime.Now;
                model.UpdatedAt = DateTime.Now;

                _unitOfWork.CurrencyType.Add(model);
                _unitOfWork.Save();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // 編輯 GET
        public IActionResult Edit(int id)
        {
            var item = _unitOfWork.CurrencyType.GetById(id);
            if (item == null) return NotFound();
            return View(item);
        }

        // 編輯 POST
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(CurrencyType model, IFormFile iconFile)
        {
            var dbItem = _unitOfWork.CurrencyType.GetById(model.Id);
            if (dbItem == null) return NotFound();

            if (ModelState.IsValid)
            {
                // 基本欄位更新
                dbItem.Name = model.Name;
                dbItem.Description = model.Description;
                dbItem.TotalIssued = model.TotalIssued;
                dbItem.SortOrder = model.SortOrder;               // ← 排序欄位
                dbItem.ExchangeRate = model.ExchangeRate;
                dbItem.IssuedAt = model.IssuedAt;
                dbItem.UpdatedAt = DateTime.Now;

                // 處理圖示檔案
                if (iconFile != null && iconFile.Length > 0)
                {
                    string folder = Path.Combine(_webHostEnv.WebRootPath, "images", "currency-icons");
                    if (!Directory.Exists(folder))
                        Directory.CreateDirectory(folder);

                    string ext = Path.GetExtension(iconFile.FileName);
                    string fileName = $"{Guid.NewGuid()}{ext}";
                    string filePath = Path.Combine(folder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await iconFile.CopyToAsync(stream);
                    }
                    dbItem.IconPath = $"/images/currency-icons/{fileName}";
                }

                _unitOfWork.CurrencyType.Update(dbItem);
                _unitOfWork.Save();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // 刪除
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var item = _unitOfWork.CurrencyType.GetById(id);
            if (item == null) return NotFound();
            _unitOfWork.CurrencyType.Remove(item);
            _unitOfWork.Save();
            return RedirectToAction(nameof(Index));
        }
    }
}
