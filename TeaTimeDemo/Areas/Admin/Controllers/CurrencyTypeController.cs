using ClosedXML.Excel; // 必要
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // 必要
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
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


        // 匯出 Excel（全部欄位）
        public IActionResult ExportExcel()
        {
            var items = _unitOfWork.CurrencyType.GetAll().OrderBy(x => x.SortOrder).ToList();
            using (var wb = new XLWorkbook())
            {
                var ws = wb.Worksheets.Add("CurrencyTypes");
                // 欄位標題
                ws.Cell(1, 1).Value = "排序";
                ws.Cell(1, 2).Value = "名稱";
                ws.Cell(1, 3).Value = "發行數量";
                ws.Cell(1, 4).Value = "說明";
                ws.Cell(1, 5).Value = "抵押兌換率";
                ws.Cell(1, 6).Value = "發行日期";
                ws.Cell(1, 7).Value = "圖示路徑";
                ws.Cell(1, 8).Value = "Id"; // 匯出Id以防還原
                ws.Cell(1, 9).Value = "更新日期";

                // 寫入資料
                for (int i = 0; i < items.Count; i++)
                {
                    var it = items[i];
                    ws.Cell(i + 2, 1).Value = it.SortOrder;
                    ws.Cell(i + 2, 2).Value = it.Name;
                    ws.Cell(i + 2, 3).Value = it.TotalIssued;
                    ws.Cell(i + 2, 4).Value = it.Description;
                    ws.Cell(i + 2, 5).Value = it.ExchangeRate;
                    ws.Cell(i + 2, 6).Value = it.IssuedAt.ToString("yyyy-MM-dd");
                    ws.Cell(i + 2, 7).Value = it.IconPath;
                    ws.Cell(i + 2, 8).Value = it.Id;
                    ws.Cell(i + 2, 9).Value = it.UpdatedAt?.ToString("yyyy-MM-dd HH:mm:ss");
                }
                using (var ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "幣種資料表.xlsx");
                }
            }
        }

        // 匯入 Excel（全清空再匯入，重置ID）
        // using 省略，和你原本的 Controller 一樣

        [HttpPost]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["ERROR"] = "請選擇有效的Excel檔！";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                using (var ms = new MemoryStream())
                {
                    await file.CopyToAsync(ms);
                    using (var wb = new XLWorkbook(ms))
                    {
                        var ws = wb.Worksheet(1);

                        // 1. 先刪除資料表全部資料
                        var oldData = _unitOfWork.CurrencyType.GetAll().ToList();
                        _unitOfWork.CurrencyType.RemoveRange(oldData);
                        _unitOfWork.Save();

                        // 2. 重設自增ID（SQL Server）
                        _unitOfWork.DbContext.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('CurrencyTypes', RESEED, 0)");

                        // 3. 逐列匯入
                        var rows = ws.RowsUsed().Skip(1); // 跳過標題
                        int success = 0, fail = 0;
                        foreach (var row in rows)
                        {
                            try
                            {
                                var entity = new CurrencyType();
                                entity.SortOrder = row.Cell(1).GetValue<int>();
                                entity.Name = row.Cell(2).GetString();
                                entity.TotalIssued = row.Cell(3).GetValue<int>();
                                entity.Description = row.Cell(4).GetString();
                                entity.ExchangeRate = row.Cell(5).GetValue<int>();

                                // 日期防呆（自動解析格式）
                                DateTime issuedAt;
                                if (row.Cell(6).DataType == XLDataType.DateTime)
                                    issuedAt = row.Cell(6).GetDateTime();
                                else if (!DateTime.TryParse(row.Cell(6).GetString(), out issuedAt))
                                    issuedAt = DateTime.Now;
                                entity.IssuedAt = issuedAt;

                                entity.IconPath = row.Cell(7).GetString();
                                // Id略過，不處理
                                DateTime updatedAt;
                                entity.UpdatedAt = DateTime.TryParse(row.Cell(9).GetString(), out updatedAt) ? updatedAt : (DateTime?)null;

                                _unitOfWork.CurrencyType.Add(entity);
                                success++;
                            }
                            catch
                            {
                                fail++;
                                // 可加log
                                continue;
                            }
                        }
                        _unitOfWork.Save();
                        TempData["SUCCESS"] = $"匯入完成，資料全部取代！成功{success}筆，失敗{fail}筆。";
                    }
                }
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "匯入失敗：" + ex.Message;
            }
            return RedirectToAction(nameof(Index));
        }


        // 取得所有會員（ID/姓名），for 發幣下拉
        [HttpGet]
        public IActionResult GetAllMemberList()
        {
            // 這裡建議用你User/會員的Repository
            // 假設是 _unitOfWork.ApplicationUser.GetAll()
            var members = _unitOfWork.ApplicationUser.GetAll()
                .Select(u => new { id = u.Id, name = u.Name })
                .ToList();
            return Json(members);
        }


        // ==========================
        // 檔名：CurrencyTypeController.cs（發幣功能 Action）
        // 製作人：茶神
        // 日期：2024-05-31
        // 目的：管理員發幣給會員，寫一筆 UserCurrencyLog
        // ==========================

        [HttpPost]
        public IActionResult SendCurrency(string userId, int currencyTypeId, int quantity, string memo)
        {
            if (string.IsNullOrEmpty(userId) || quantity <= 0)
                return Json(new { success = false, message = "請輸入正確資料" });

            // 取得會員
            var member = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (member == null)
                return Json(new { success = false, message = "會員不存在" });

            var currency = _unitOfWork.CurrencyType.GetById(currencyTypeId);
            if (currency == null)
                return Json(new { success = false, message = "幣種不存在" });

            // 找出目前這位會員的該幣種最新餘額
            var lastLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == currencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldBalance = lastLog?.BalanceAfter ?? 0;
            int newBalance = oldBalance + quantity;

            // 寫一筆 log
            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = currencyTypeId,
                Quantity = quantity,
                Action = "後台發幣",
                Memo = memo,
                CreatedAt = DateTime.Now,
                BalanceAfter = newBalance
            });

            _unitOfWork.Save();
            return Json(new { success = true });
        }



    }
}
