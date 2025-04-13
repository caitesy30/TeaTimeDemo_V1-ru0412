using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.DTOs;
using TeaTimeDemo.Utility;
using Microsoft.AspNetCore.Hosting;
using ClosedXML.Excel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using System.Collections.Generic;
using System;
using System.Drawing;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    public class QuestionImageController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IMapper _mapper;

        public QuestionImageController(IUnitOfWork unitOfWork, IWebHostEnvironment hostEnvironment, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
            _mapper = mapper;
        }

        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 取得所有未刪除的圖片資料 (DataTable 使用)
        /// </summary>
        [HttpGet]
        public IActionResult GetAll()
        {
            var allObj = _unitOfWork.QuestionImage.GetAll(filter: qi => !qi.IsDeleted); // 只取未刪除資料
            var allDto = _mapper.Map<List<QuestionImageDTO>>(allObj);

            foreach (var dto in allDto)
            {
                // 拼湊描述欄位
                List<string> descriptionParts = new List<string>();

                if (dto.SurveyId.HasValue)
                {
                    var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == dto.SurveyId.Value);
                    if (survey != null && !string.IsNullOrEmpty(survey.Title))
                        descriptionParts.Add(survey.Title);
                }

                if (dto.QuestionId.HasValue)
                {
                    var question = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == dto.QuestionId.Value);
                    if (question != null && !string.IsNullOrEmpty(question.QuestionText))
                        descriptionParts.Add(question.QuestionText);
                }

                if (dto.QuestionOptionId.HasValue)
                {
                    var option = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == dto.QuestionOptionId.Value);
                    if (option != null && !string.IsNullOrEmpty(option.OptionText))
                        descriptionParts.Add(option.OptionText);
                }

                dto.Description = string.Join(" ", descriptionParts);

                // 處理圖片 Base64
                if (!string.IsNullOrEmpty(dto.ImageUrl))
                {
                    var imagePath = Path.Combine(_hostEnvironment.WebRootPath, dto.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        byte[] imageBytes = System.IO.File.ReadAllBytes(imagePath);
                        string base64String = Convert.ToBase64String(imageBytes);
                        dto.ImageBase64Parts = SplitString(base64String, 32000);
                    }
                    else
                    {
                        dto.ImageBase64Parts = new List<string> { "圖片不存在" };
                    }
                }
                else
                {
                    dto.ImageBase64Parts = new List<string> { "無圖片" };
                }
            }

            return Json(new { data = allDto });
        }

        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var objFromDb = _unitOfWork.QuestionImage.GetFirstOrDefault(u => u.Id == id && !u.IsDeleted);
            if (objFromDb == null)
            {
                return Json(new { success = false, message = "刪除失敗，找不到該圖片。" });
            }

            // 軟刪除處理
            objFromDb.IsDeleted = true;
            objFromDb.DeletedAt = DateTime.Now;
            _unitOfWork.QuestionImage.Update(objFromDb);
            _unitOfWork.Save();

            return Json(new { success = true, message = "圖片已移至回收筒!" });
        }

        public IActionResult ExportToExcel()
        {
            // 匯出未刪除圖片
            var questionImages = _unitOfWork.QuestionImage.GetAll(filter: qi => !qi.IsDeleted).ToList();
            var questionImageDtos = _mapper.Map<List<QuestionImageDTO>>(questionImages);

            foreach (var dto in questionImageDtos)
            {
                if (!string.IsNullOrEmpty(dto.ImageUrl))
                {
                    var imagePath = Path.Combine(_hostEnvironment.WebRootPath, dto.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        byte[] imageBytes = System.IO.File.ReadAllBytes(imagePath);
                        string base64String = Convert.ToBase64String(imageBytes);
                        dto.ImageBase64Parts = SplitString(base64String, 32000);
                    }
                    else
                    {
                        dto.ImageBase64Parts = new List<string> { "圖片不存在" };
                    }
                }
                else
                {
                    dto.ImageBase64Parts = new List<string> { "無圖片" };
                }
            }

            int maxParts = questionImageDtos.Max(dto => dto.ImageBase64Parts.Count);

            using (var workbook = new XLWorkbook())
            {
                var imagesSheet = workbook.Worksheets.Add("QuestionImages");
                imagesSheet.Cell(1, 1).Value = "圖片ID";
                imagesSheet.Cell(1, 2).Value = "問卷ID";
                imagesSheet.Cell(1, 3).Value = "問題ID";
                imagesSheet.Cell(1, 4).Value = "選項ID";
                imagesSheet.Cell(1, 5).Value = "圖片路徑";
                imagesSheet.Cell(1, 6).Value = "替代文字";
                imagesSheet.Cell(1, 7).Value = "上傳時間";
                imagesSheet.Cell(1, 8).Value = "排序順序";
                imagesSheet.Cell(1, 9).Value = "寬度";
                imagesSheet.Cell(1, 10).Value = "高度";

                for (int part = 1; part <= maxParts; part++)
                {
                    imagesSheet.Cell(1, 10 + part).Value = $"圖片Base64_Part{part}";
                }

                for (int i = 0; i < questionImageDtos.Count; i++)
                {
                    var imageDto = questionImageDtos[i];
                    imagesSheet.Cell(i + 2, 1).Value = imageDto.Id;
                    imagesSheet.Cell(i + 2, 2).Value = imageDto.SurveyId;
                    imagesSheet.Cell(i + 2, 3).Value = imageDto.QuestionId;
                    imagesSheet.Cell(i + 2, 4).Value = imageDto.QuestionOptionId;
                    imagesSheet.Cell(i + 2, 5).Value = imageDto.ImageUrl;
                    imagesSheet.Cell(i + 2, 6).Value = imageDto.AltText;
                    imagesSheet.Cell(i + 2, 7).Value = imageDto.UploadTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    imagesSheet.Cell(i + 2, 8).Value = imageDto.SortOrder;
                    imagesSheet.Cell(i + 2, 9).Value = imageDto.Width;
                    imagesSheet.Cell(i + 2, 10).Value = imageDto.Height;

                    for (int part = 0; part < imageDto.ImageBase64Parts.Count; part++)
                    {
                        imagesSheet.Cell(i + 2, 11 + part).Value = imageDto.ImageBase64Parts[part];
                    }
                }

                imagesSheet.Columns().AdjustToContents();

                using (var mem = new MemoryStream())
                {
                    workbook.SaveAs(mem);
                    var content = mem.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QuestionImages.xlsx");
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> ImportExcel(IFormFile file, bool replaceExistingData, bool isNewFormat)
        {
            if (file == null || file.Length == 0)
            {
                TempData["ERROR"] = "請選擇有效的 Excel 文件!";
                return RedirectToAction("Index");
            }

            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var imagesSheet = workbook.Worksheet("QuestionImages");
                        var rows = imagesSheet.RowsUsed().Skip(1); // 跳過標題行

                        if (replaceExistingData)
                        {
                            // 清除現有未刪除資料與圖片文件
                            var allImages = _unitOfWork.QuestionImage.GetAll(filter: qi => !qi.IsDeleted);

                            // 獲取所有已刪除的圖片
                           // var allDeletedImages = _unitOfWork.QuestionImage.GetAll(
                           //     filter: qi => qi.IsDeleted,
                           //     ignoreQueryFilters: true
                           // ).ToList();

                            foreach (var img in allImages)
                            {
                                var imgPath = Path.Combine(_hostEnvironment.WebRootPath, img.ImageUrl.TrimStart('/'));
                                if (System.IO.File.Exists(imgPath))
                                {
                                    System.IO.File.Delete(imgPath);
                                }

                              //  _unitOfWork.QuestionImage.RemovePhysical(img);
                            }


                            // 執行批次物理刪除
                            _unitOfWork.QuestionImage.RemovePhysicalRange(allImages);
                            //_unitOfWork.QuestionImage.RemoveRange(allImages);

                            _unitOfWork.Save();
                        }

                        foreach (var row in rows)
                        {
                            try
                            {
                                int cellCount = row.CellCount();

                                var surveyId = row.Cell(2).GetValue<int?>();
                                var questionId = row.Cell(3).GetValue<int?>();
                                var questionOptionId = row.Cell(4).GetValue<int?>();
                                var imageUrl = row.Cell(5).GetString();
                                var altText = row.Cell(6).GetString();

                                DateTime? uploadTime = null;
                                if (row.Cell(7).TryGetValue<DateTime>(out DateTime tempUploadTime))
                                {
                                    uploadTime = tempUploadTime;
                                }

                                var sortOrder = row.Cell(8).GetValue<int?>();

                                int width = 200;
                                int height = 200;

                                int base64StartCol;
                                if (isNewFormat && cellCount >= 10)
                                {
                                    width = row.Cell(9).GetValue<int?>() ?? 200;
                                    height = row.Cell(10).GetValue<int?>() ?? 200;
                                    base64StartCol = 11;
                                }
                                else
                                {
                                    base64StartCol = 9;
                                }

                                // 驗證關聯關係
                                if (surveyId.HasValue && _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyId.Value) == null) continue;
                                if (questionId.HasValue && _unitOfWork.Question.GetFirstOrDefault(q => q.Id == questionId.Value) == null) continue;
                                if (questionOptionId.HasValue && _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == questionOptionId.Value) == null) continue;

                                List<string> base64Parts = new List<string>();
                                int part = 0;
                                while (true)
                                {
                                    var cell = row.Cell(base64StartCol + part);
                                    if (cell == null || cell.IsEmpty()) break;
                                    var cellValue = cell.GetString();
                                    if (string.IsNullOrEmpty(cellValue)) break;
                                    base64Parts.Add(cellValue);
                                    part++;
                                }

                                if (base64Parts.Count > 0 && base64Parts[0] != "圖片不存在" && base64Parts[0] != "無圖片")
                                {
                                    try
                                    {
                                        string base64String = string.Join("", base64Parts);
                                        byte[] imageBytes = Convert.FromBase64String(base64String);
                                        string extension = Path.GetExtension(imageUrl).ToLower();
                                        if (extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".gif")
                                        {
                                            extension = ".jpg";
                                        }

                                        string filePath = Path.Combine(_hostEnvironment.WebRootPath, imageUrl.TrimStart('/'));
                                        var directory = Path.GetDirectoryName(filePath);
                                        if (!Directory.Exists(directory))
                                        {
                                            Directory.CreateDirectory(directory);
                                        }

                                        bool imageSaved = false;
                                        if (System.IO.File.Exists(filePath))
                                        {
                                            if (replaceExistingData)
                                            {
                                                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                                                imageSaved = true;
                                            }
                                            else
                                            {
                                                continue;
                                            }
                                        }
                                        else
                                        {
                                            await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                                            imageSaved = true;
                                        }

                                        if (imageSaved && (!isNewFormat || cellCount < 10))
                                        {
                                            using (var imgStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                                            {
                                                using (var image = Image.FromStream(imgStream))
                                                {
                                                    width = image.Width;
                                                    height = image.Height;
                                                }
                                            }
                                        }

                                        var questionImage = new QuestionImage
                                        {
                                            SurveyId = surveyId,
                                            QuestionId = questionId,
                                            QuestionOptionId = questionOptionId,
                                            ImageUrl = imageUrl,
                                            AltText = altText,
                                            UploadTime = uploadTime ?? DateTime.Now,
                                            SortOrder = sortOrder,
                                            Width = width,
                                            Height = height
                                        };
                                        _unitOfWork.QuestionImage.Add(questionImage);

                                    }
                                    catch (FormatException)
                                    {
                                        continue;
                                    }
                                }
                                else
                                {
                                    continue;
                                }
                            }
                            catch (Exception exRow)
                            {
                                TempData["ERROR"] = $"匯入失敗於第 {row.RowNumber()} 行: {exRow.Message}";
                                return RedirectToAction("Index");
                            }
                        }
                        _unitOfWork.Save();
                    }
                }
                TempData["SUCCESS"] = "匯入成功!";
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "匯入失敗: " + ex.Message;
            }

            return RedirectToAction("Index");
        }

        /// <summary>
        /// 回收筒列表頁面
        /// </summary>
        public IActionResult RecycleBin()
        {
            return View();
        }

        /// <summary>
        /// 取得已刪除的圖片資料 (DataTable 使用)
        /// </summary>
        [HttpGet]
        public IActionResult GetDeleted()
        {
            // 使用 ignoreQueryFilters = true 表示忽略全局查詢過濾器(若有使用)
            var deletedImages = _unitOfWork.QuestionImage.GetAll(filter: qi => qi.IsDeleted, ignoreQueryFilters: true).ToList();
            var deletedDtos = _mapper.Map<List<QuestionImageDTO>>(deletedImages);

            foreach (var dto in deletedDtos)
            {
                // 拼湊描述
                List<string> descriptionParts = new List<string>();
                if (dto.SurveyId.HasValue)
                {
                    var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == dto.SurveyId.Value, ignoreQueryFilters: true);
                    if (survey != null && !string.IsNullOrEmpty(survey.Title))
                        descriptionParts.Add(survey.Title);
                }

                if (dto.QuestionId.HasValue)
                {
                    var question = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == dto.QuestionId.Value, ignoreQueryFilters: true);
                    if (question != null && !string.IsNullOrEmpty(question.QuestionText))
                        descriptionParts.Add(question.QuestionText);
                }

                if (dto.QuestionOptionId.HasValue)
                {
                    var option = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == dto.QuestionOptionId.Value, ignoreQueryFilters: true);
                    if (option != null && !string.IsNullOrEmpty(option.OptionText))
                        descriptionParts.Add(option.OptionText);
                }
                dto.Description = string.Join(" ", descriptionParts);

                // Base64處理 (可視需要決定是否在回收筒頁面也需要)
                // 此處可省略，回收筒頁面主要顯示基本資訊即可
            }

            return Json(new { data = deletedDtos });
        }

        /// <summary>
        /// 還原已刪除的圖片
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            // 獲取已刪除的圖片(包含 ignoreQueryFilters)
            var img = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == id && qi.IsDeleted, ignoreQueryFilters: true);
            if (img == null)
            {
                TempData["ERROR"] = "找不到指定的圖片，無法還原。";
                return RedirectToAction("RecycleBin");
            }

            img.IsDeleted = false;
            img.DeletedAt = null;
            _unitOfWork.QuestionImage.Update(img);
            _unitOfWork.Save();
            TempData["success"] = "圖片已成功還原!";
            return RedirectToAction("RecycleBin");
        }

        /// <summary>
        /// 永久刪除已刪除的圖片(從資料庫移除檔案及記錄)
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult PermanentDelete(int id)
        {
            // 獲取已刪除的圖片(包含 ignoreQueryFilters)
            var img = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == id && qi.IsDeleted, ignoreQueryFilters: true);
            if (img == null)
            {
                TempData["ERROR"] = "找不到指定的圖片，無法永久刪除。";
                return RedirectToAction("RecycleBin");
            }

            // 刪除圖片檔案
            var imagePath = Path.Combine(_hostEnvironment.WebRootPath, img.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }

            // 資料庫移除記錄
           // _unitOfWork.QuestionImage.Remove(img);
            // 執行物理刪除
            _unitOfWork.QuestionImage.RemovePhysical(img);

            _unitOfWork.Save();

            

            TempData["success"] = "圖片已永久刪除!";
            return RedirectToAction("RecycleBin");
        }

        private List<string> SplitString(string str, int chunkSize)
        {
            List<string> parts = new List<string>();
            for (int i = 0; i < str.Length; i += chunkSize)
            {
                if (i + chunkSize > str.Length)
                    parts.Add(str.Substring(i));
                else
                    parts.Add(str.Substring(i, chunkSize));
            }
            return parts;
        }

        [HttpPost]
        public IActionResult UpdateDimensions(int id, int width, int height)
        {
            var objFromDb = _unitOfWork.QuestionImage.GetFirstOrDefault(u => u.Id == id && !u.IsDeleted);
            if (objFromDb == null)
            {
                return Json(new { success = false, message = "更新失敗，找不到該圖片。" });
            }

            objFromDb.Width = width;
            objFromDb.Height = height;
            _unitOfWork.QuestionImage.Update(objFromDb);
            _unitOfWork.Save();

            return Json(new { success = true, message = "圖片尺寸更新成功" });
        }
    }
}
