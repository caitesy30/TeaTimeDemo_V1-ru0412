﻿using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using NuGet.Protocol.Plugins;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    public class StationController : Controller
    {
       
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public StationController(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnvironment)
        {
           
            _unitOfWork = unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }

        // 站別清單頁面
        public IActionResult Index(bool showImportForm = false)
        {
            var objStationList = _unitOfWork.Station.GetAll().ToList();
            ViewBag.ShowImportForm = showImportForm; // 控制是否顯示匯入表單
            Console.WriteLine(objStationList);
            Console.WriteLine("路徑");
            return View(objStationList);
        }

        // 匯出 Excel 功能
        public IActionResult ExportToExcel()
        {
            var stations = _unitOfWork.Station.GetAll().ToList();
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Stations");
                worksheet.Cell(1, 1).Value = "站別名稱";
                worksheet.Cell(1, 2).Value = "顯示順序";
                worksheet.Cell(1, 3).Value = "備註";

                for (int i = 0; i < stations.Count; i++)
                {
                    worksheet.Cell(i + 2, 1).Value = stations[i].Name;
                    worksheet.Cell(i + 2, 2).Value = stations[i].DisplayOrder;
                    worksheet.Cell(i + 2, 3).Value = stations[i].Remark ?? "";
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Stations.xlsx");
                }
            }
        }


        // 匯入 Excel 並新增或取代資料
        [HttpPost]
        public async Task<IActionResult> ImportExcel(IFormFile file, bool replaceExistingData)
        {
            if (file == null || file.Length == 0)
            {
                TempData["ERROR"] = "請選擇一個有效的 Excel 文件!";
                return RedirectToAction("Index");
            }

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream); // 使用 CopyToAsync 進行非同步操作
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);
                    var rows = worksheet.RowsUsed().Skip(1); // 跳過標題行

                    // 如果 replaceExistingData 為 true，則清空資料表
                    if (replaceExistingData)
                    {
                        var existingStations = _unitOfWork.Station.GetAll().ToList();
                        _unitOfWork.Station.RemoveRange(existingStations);  // 使用批次刪除
                        _unitOfWork.Save(); // 保存刪除操作
                    }
                    // 呼叫共用的批次新增方法，並處理匯入過程中的錯誤
                    await BatchAddStationsWithProgressUpdate(rows);
                }
            }

            TempData["SUCCESS"] = replaceExistingData ? "資料取代成功!" : "資料新增成功!";
            return RedirectToAction("Index");
        }

        // 共用的批次新增方法，並處理匯入過程中的錯誤
        private async Task BatchAddStationsWithProgressUpdate(IEnumerable<IXLRow> rows)
        {
            var stationsToAdd = new List<Station>();
            int successCount = 0;
            int errorCount = 0;
            int totalRows = rows.Count();
            int currentRow = 0;

            foreach (var row in rows)
            {
                try
                {
                    var station = new Station
                    {
                        Name = row.Cell(1).GetString(),
                        DisplayOrder = row.Cell(2).GetValue<int>(),
                        Remark = string.IsNullOrEmpty(row.Cell(3).GetString()) ? null : row.Cell(3).GetString()
                    };

                    stationsToAdd.Add(station);
                    successCount++;
                }
                catch (Exception ex)
                {
                    errorCount++;
                    // 記錄每一個發生錯誤的行
                    TempData["ERROR"] = $"匯入時發生錯誤: {ex.Message}，位於第 {row.RowNumber()} 行。";
                }
                currentRow++;
                // 計算進度百分比
            }
        

            // 批次新增成功的資料
            if (stationsToAdd.Any())
            {
                _unitOfWork.Station.AddRange(stationsToAdd);  // 使用批次新增
                _unitOfWork.Save();
            }

            // 匯入後通知使用者
            TempData["SUCCESS"] = $"成功匯入 {successCount} 筆資料，{errorCount} 筆資料匯入失敗。";
        }



        // 顯示匯入表單
        [HttpPost]
        public IActionResult ShowImportForm()
        {
            return RedirectToAction("Index", new { showImportForm = true });
        }

        // 新增或編輯站別
        public IActionResult Upsert(int? id)
        {
            var stationVM = new StationVM
            {
                StationList = _unitOfWork.Station.GetAll().Select(u => new SelectListItem
                {
                    Text = u.Name,
                    Value = u.Id.ToString()
                }),
                Station = new Station()
            };

            if (id == null || id == 0)
            {
                // 執行新增
                return View(stationVM);
            }
            else
            {
                // 執行編輯
                stationVM.Station = _unitOfWork.Station.Get(u => u.Id == id);
                return View(stationVM);
            }
        }

        [HttpPost]
        public IActionResult Upsert(StationVM stationVM, IFormFile? file)
        {
            if (ModelState.IsValid)
            {
                if (stationVM.Station.Id == 0)
                {
                    _unitOfWork.Station.Add(stationVM.Station);
                }
                else
                {
                    _unitOfWork.Station.Update(stationVM.Station);
                }

                _unitOfWork.Save();
                TempData["SUCCESS"] = "站別操作成功!";
                return RedirectToAction("Index");
            }
            else
            {
                stationVM.StationList = _unitOfWork.Station.GetAll().Select(u => new SelectListItem
                {
                    Text = u.Name,
                    Value = u.Id.ToString()
                });
                return View(stationVM);
            }
        }

        // API 取得所有站別資料
        [HttpGet]
        public IActionResult GetAll()
        {
            var objStationList = _unitOfWork.Station.GetAll().OrderBy(s => s.DisplayOrder).ToList();
            return Json(new { data = objStationList });
        }

        // API 刪除站別
        [HttpDelete]
        public IActionResult Delete(int? id)
        {
            var stationToBeDeleted = _unitOfWork.Station.Get(u => u.Id == id);
            if (stationToBeDeleted == null)
            {
                return Json(new { success = false, Message = "刪除失敗" });
            }

            _unitOfWork.Station.Remove(stationToBeDeleted);
            _unitOfWork.Save();
            return Json(new { success = true, message = "刪除成功" });
        }
    }
}

