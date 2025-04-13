// Areas/Admin/Controllers/QuestionOptionController.cs

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using Microsoft.CodeAnalysis.Options;
using TeaTimeDemo.Models.DTOs;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)] // 只有 Admin 和 Manager 角色能進入
    [Route("admin/[controller]/[action]/{id?}")]
    public class QuestionOptionController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostEnvironment; // 用於處理圖片上傳

        public QuestionOptionController(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _hostEnvironment = hostEnvironment;
        }

        /// <summary>
        /// 顯示所有選項（使用 DataTables）
        /// </summary>
        // GET: Admin/QuestionOption
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 提供 DataTables 所需的 JSON 資料
        /// </summary>
        // GET: Admin/QuestionOption/GetAll
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var questionOptions = _unitOfWork.QuestionOption.GetAll(
                    filter: qo => !qo.IsDeleted, // 僅包含未刪除的選項
                    includeProperties: "Question,QuestionImages"
                );

                var questionOptionDTOs = _mapper.Map<List<QuestionOptionDTO>>(questionOptions);

                return Json(new { data = questionOptionDTOs });
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "獲取問題選項時發生錯誤。";
                return Json(new { data = new List<QuestionOptionDTO>() });
            }
        }



        /// <summary>
        /// 顯示創建新選項的表單
        /// </summary>
        // GET: Admin/QuestionOption/Create
        public IActionResult Create()
        {
            var questionOptionVM = new QuestionOptionVM
            {
                QuestionList = _unitOfWork.Question.GetAll().Select(q => new SelectListItem
                {
                    Text = q.QuestionText,
                    Value = q.Id.ToString()
                }),
                // 如果需要填充 QuestionOptionList，請在此處設定
                QuestionOptionList = _unitOfWork.QuestionOption.GetAll().Select(qo => new SelectListItem
                {
                    Text = qo.OptionText,
                    Value = qo.Id.ToString()
                })
            };
            return View(questionOptionVM);
        }

        /// <summary>
        /// 處理創建新選項的 POST 請求
        /// </summary>
        // POST: Admin/QuestionOption/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(QuestionOptionVM questionOptionVM)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // 使用 AutoMapper 將 ViewModel 映射到實體模型
                    var questionOption = _mapper.Map<QuestionOption>(questionOptionVM);

                    // 處理圖片上傳
                    if (questionOptionVM.OptionImageFiles != null && questionOptionVM.OptionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionOptionVM.OptionImageFiles.Count; i++)
                        {
                            var file = questionOptionVM.OptionImageFiles[i];
                            if (file != null && file.Length > 0)
                            {
                                // 驗證圖片類型和大小
                                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                var extension = Path.GetExtension(file.FileName).ToLower();
                                if (!allowedExtensions.Contains(extension))
                                {
                                    TempData["ERROR"] = "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。";
                                    return RedirectToAction(nameof(Create));
                                }

                                if (file.Length > 5 * 1024 * 1024) // 5MB
                                {
                                    TempData["ERROR"] = "圖片大小不得超過 5MB。";
                                    return RedirectToAction(nameof(Create));
                                }

                                // 獲取圖片的寬度和高度，若未提供則使用預設值 200
                                int width = questionOptionVM.NewOptionImageWidths != null && questionOptionVM.NewOptionImageWidths.Count > i
                                    ? questionOptionVM.NewOptionImageWidths[i]
                                    : 200; // 預設寬度
                                int height = questionOptionVM.NewOptionImageHeights != null && questionOptionVM.NewOptionImageHeights.Count > i
                                    ? questionOptionVM.NewOptionImageHeights[i]
                                    : 200; // 預設高度

                                // 儲存圖片並獲取 URL
                                var imageUrl = SaveImage(file, "option");
                                if (imageUrl != null)
                                {
                                    var optionImage = new QuestionImage
                                    {
                                        ImageUrl = imageUrl,
                                        Width = width,
                                        Height = height
                                    };
                                    questionOption.QuestionImages.Add(optionImage);
                                }
                            }
                        }
                    }

                    // 添加新選項到資料庫
                    _unitOfWork.QuestionOption.Add(questionOption);
                    _unitOfWork.Save();
                    TempData["success"] = "選項新增成功!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    // 設定 TempData["ERROR"] 為錯誤訊息
                    TempData["ERROR"] = "新增選項時發生錯誤。";
                    return RedirectToAction(nameof(Create));
                }
            }

            // 如果模型驗證失敗，重新加載問題清單和選項清單
            questionOptionVM.QuestionList = _unitOfWork.Question.GetAll().Select(q => new SelectListItem
            {
                Text = q.QuestionText,
                Value = q.Id.ToString()
            });
            questionOptionVM.QuestionOptionList = _unitOfWork.QuestionOption.GetAll().Select(qo => new SelectListItem
            {
                Text = qo.OptionText,
                Value = qo.Id.ToString()
            });
            return View(questionOptionVM);
        }

        /// <summary>
        /// 顯示編輯選項的表單
        /// </summary>
        // GET: Admin/QuestionOption/Edit/5
        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                TempData["ERROR"] = "未指定要編輯的選項。";
                return RedirectToAction(nameof(Index));
            }

            // 獲取指定的選項，並包含相關的圖片資訊
            var questionOption = _unitOfWork.QuestionOption.GetFirstOrDefault(qo => qo.Id == id, includeProperties: "QuestionImages,Question");
            if (questionOption == null)
            {
                TempData["ERROR"] = "找不到指定的選項。";
                return RedirectToAction(nameof(Index));
            }

            // 使用 AutoMapper 映射到 ViewModel
            var questionOptionVM = _mapper.Map<QuestionOptionVM>(questionOption);

            // 設定下拉選單
            questionOptionVM.QuestionList = _unitOfWork.Question.GetAll().Select(q => new SelectListItem
            {
                Text = q.QuestionText,
                Value = q.Id.ToString()
            });
            questionOptionVM.QuestionOptionList = _unitOfWork.QuestionOption.GetAll().Select(qo => new SelectListItem
            {
                Text = qo.OptionText,
                Value = qo.Id.ToString()
            });

            // 映射現有圖片的尺寸
            questionOptionVM.ExistingOptionImageIds = questionOption.QuestionImages.Select(qi => qi.Id).ToList();
            questionOptionVM.ExistingOptionImageWidths = questionOption.QuestionImages.Select(qi => qi.Width).ToList();
            questionOptionVM.ExistingOptionImageHeights = questionOption.QuestionImages.Select(qi => qi.Height).ToList();

            // 映射 FillInBlanks
            questionOptionVM.FillInBlanks = _mapper.Map<List<FillInBlankVM>>(questionOption.FillInBlanks);

            return View(questionOptionVM);
        }

        /// <summary>
        /// 處理編輯選項的 POST 請求
        /// </summary>
        // POST: Admin/QuestionOption/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, QuestionOptionVM questionOptionVM)
        {
            if (id != questionOptionVM.Id)
            {
                TempData["ERROR"] = "編輯的選項 ID 不匹配。";
                return RedirectToAction(nameof(Index));
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // 使用 AutoMapper 將 ViewModel 映射到實體模型
                    var questionOption = _unitOfWork.QuestionOption.GetFirstOrDefault(qo => qo.Id == id, includeProperties: "QuestionImages");
                    if (questionOption == null)
                    {
                        TempData["ERROR"] = "找不到指定的選項。";
                        return RedirectToAction(nameof(Index));
                    }

                    // 使用 AutoMapper 將 ViewModel 映射到實體模型
                    _mapper.Map(questionOptionVM, questionOption);

                    // 檢查 CreateTime，若為空則設定為現在時間
                    if (!questionOption.CreateTime.HasValue)
                    {
                        questionOption.CreateTime = DateTime.Now;
                    }

                    // 設定 CompleteTime 為現在時間
                    questionOption.CompleteTime = DateTime.Now;

                    // 更新現有圖片的尺寸
                    if (questionOptionVM.ExistingOptionImageIds != null)
                    {
                        for (int i = 0; i < questionOptionVM.ExistingOptionImageIds.Count; i++)
                        {
                            int imageId = questionOptionVM.ExistingOptionImageIds[i];
                            var image = questionOption.QuestionImages.FirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = questionOptionVM.ExistingOptionImageWidths[i];
                                image.Height = questionOptionVM.ExistingOptionImageHeights[i];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                    }

                    // 處理新上傳的圖片
                    if (questionOptionVM.OptionImageFiles != null && questionOptionVM.OptionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionOptionVM.OptionImageFiles.Count; i++)
                        {
                            var file = questionOptionVM.OptionImageFiles[i];
                            if (file != null && file.Length > 0)
                            {
                                // 驗證圖片類型和大小
                                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                var extension = Path.GetExtension(file.FileName).ToLower();
                                if (!allowedExtensions.Contains(extension))
                                {
                                    TempData["ERROR"] = "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。";
                                    return RedirectToAction(nameof(Edit), new { id = id });
                                }

                                if (file.Length > 5 * 1024 * 1024) // 5MB
                                {
                                    TempData["ERROR"] = "圖片大小不得超過 5MB。";
                                    return RedirectToAction(nameof(Edit), new { id = id });
                                }

                                // 獲取圖片的寬度和高度，若未提供則使用預設值 200
                                int width = questionOptionVM.NewOptionImageWidths != null && questionOptionVM.NewOptionImageWidths.Count > i
                                    ? questionOptionVM.NewOptionImageWidths[i]
                                    : 200; // 預設寬度
                                int height = questionOptionVM.NewOptionImageHeights != null && questionOptionVM.NewOptionImageHeights.Count > i
                                    ? questionOptionVM.NewOptionImageHeights[i]
                                    : 200; // 預設高度

                                // 儲存圖片並獲取 URL
                                var imageUrl = SaveImage(file, "option");
                                if (imageUrl != null)
                                {
                                    var optionImage = new QuestionImage
                                    {
                                        ImageUrl = imageUrl,
                                        Width = width,
                                        Height = height
                                    };
                                    questionOption.QuestionImages.Add(optionImage);
                                }
                            }
                        }
                    }

                    // 更新選項資料
                    _unitOfWork.QuestionOption.Update(questionOption);
                    _unitOfWork.Save();
                    TempData["success"] = "選項編輯成功!";
                }
                catch (Exception ex)
                {
                    // 設定 TempData["ERROR"] 為錯誤訊息
                    TempData["ERROR"] = "編輯選項時發生錯誤。";
                    return RedirectToAction(nameof(Edit), new { id = id });
                }
                return RedirectToAction(nameof(Index));
            }

            // 如果模型驗證失敗，重新加載問題清單和選項清單
            questionOptionVM.QuestionList = _unitOfWork.Question.GetAll().Select(q => new SelectListItem
            {
                Text = q.QuestionText,
                Value = q.Id.ToString()
            });
            questionOptionVM.QuestionOptionList = _unitOfWork.QuestionOption.GetAll().Select(qo => new SelectListItem
            {
                Text = qo.OptionText,
                Value = qo.Id.ToString()
            });
            return View(questionOptionVM);
        }

        /// <summary>
        /// 顯示刪除確認頁面
        /// </summary>
        // GET: Admin/QuestionOption/Delete/5
        //[ValidateAntiForgeryToken]
        public IActionResult Delete(int? id)
        {

            if (id == null)
            {

                return Json(new { success = false, message = "未指定要刪除的選項。" });
            }

            var option = _unitOfWork.QuestionOption.GetAll(
                filter: qo => qo.Id == id && !qo.IsDeleted, // 確保只刪除未刪除的記錄
                includeProperties: ""
                ).FirstOrDefault();

           
            
            if (option == null)
            {
                return Json(new { success = false, message = "未指定要刪除的選項。" });
            }

            try
            {
                // 執行軟刪除
                _unitOfWork.QuestionOption.SoftDelete(option);
                _unitOfWork.Save();
                return Json(new { success = true, message = "選項已移至回收筒!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"刪除時發生錯誤：{ex.Message}" });
            }
        }             

        /// <summary>
        /// 顯示回收筒中的已刪除選項
        /// </summary>
        // GET: Admin/QuestionOption/RecycleBin
        public IActionResult RecycleBin()
        {
            try
            {
                // 獲取所有已軟刪除的選項，並包含相關的問題資訊
                var deletedQuestionOptions = _unitOfWork.QuestionOption.GetAll(
                    filter: qo => qo.IsDeleted,
                    includeProperties: "QuestionImages,Question",
                     ignoreQueryFilters: true // 添加此參數以繞過全局查詢過濾器
                ).ToList();

                // 將資料映射到 ViewModel（如有需要）
                //var questionOptionVMs = _mapper.Map<List<QuestionOptionVM>>(deletedQuestionOptions);


                // 將資料直接傳遞到視圖
                return View(deletedQuestionOptions);
            }
            catch (Exception ex)
            {
                // 設定 TempData["ERROR"] 為錯誤訊息
                TempData["ERROR"] = "獲取回收筒中的選項時發生錯誤。";
                return RedirectToAction(nameof(Index));
            }
        }


        /// <summary>
        /// 還原回收筒中的選項
        /// </summary>
        // POST: Admin/QuestionOption/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            try
            {
                // 獲取已刪除的選項，忽略全局查詢過濾器
                var questionOption = _unitOfWork.QuestionOption.GetAll(
                    filter: qo => qo.Id == id && qo.IsDeleted,
                    includeProperties: "QuestionImages",
                    ignoreQueryFilters: true
                ).FirstOrDefault();

                if (questionOption == null)
                {
                    TempData["ERROR"] = "找不到指定的選項。";
                    return RedirectToAction(nameof(Index));
                }

                // 執行還原軟刪除
                _unitOfWork.QuestionOption.Restore(questionOption);
                _unitOfWork.Save();

                TempData["success"] = "選項已從回收筒還原!";
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "還原選項時發生錯誤。";
            }
            return RedirectToAction(nameof(Index));
        }

        /// <summary>
        /// 永久刪除回收筒中的選項，並刪除相關的圖片文件
        /// </summary>
        // POST: Admin/QuestionOption/PermanentDelete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult PermanentDelete(int id)
        {
            try
            {
                // 獲取已刪除的選項，忽略全局查詢過濾器
                var questionOption = _unitOfWork.QuestionOption.GetAll(
                    filter: qo => qo.Id == id && qo.IsDeleted,
                    includeProperties: "QuestionImages",
                    ignoreQueryFilters: true
                ).FirstOrDefault();

                if (questionOption == null)
                {
                    TempData["ERROR"] = "找不到指定的選項。";
                    return RedirectToAction(nameof(RecycleBin));
                }

                // 刪除相關圖片
                foreach (var image in questionOption.QuestionImages.ToList())
                {
                    DeleteImage(image.ImageUrl); // 刪除圖片文件
                    _unitOfWork.QuestionImage.Remove(image); // 刪除資料庫中的圖片記錄
                }

                // 執行物理刪除
                _unitOfWork.QuestionOption.RemovePhysical(questionOption);
                //_unitOfWork.Save();

                TempData["success"] = "選項已永久刪除!";
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "永久刪除選項時發生錯誤。";
            }
            return RedirectToAction(nameof(RecycleBin));
        }

        /// <summary>
        /// 處理圖片刪除的 POST 請求
        /// </summary>
        // POST: Admin/QuestionOption/RemoveImage
        [HttpPost]
        public IActionResult RemoveImage(int id)
        {
            try
            {
                var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == id);
                if (image != null)
                {
                    // 刪除圖片文件
                    DeleteImage(image.ImageUrl);
                    // 刪除資料庫中的圖片記錄
                    _unitOfWork.QuestionImage.Remove(image);
                    _unitOfWork.Save();
                    TempData["success"] = "圖片刪除成功";
                    return Json(new { success = true, message = "圖片刪除成功" });
                }
                TempData["ERROR"] = "找不到指定的圖片。";
                return Json(new { success = false, message = "圖片刪除失敗，找不到相關資料。" });
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "刪除圖片時發生錯誤。";
                return Json(new { success = false, message = "圖片刪除失敗，發生異常。" });
            }
        }

        /// <summary>
        /// 儲存圖片並返回其 URL
        /// </summary>
        /// <param name="file">上傳的圖片文件</param>
        /// <param name="category">圖片分類，如 "survey", "question", "option"</param>
        /// <returns>圖片的 URL 或 null</returns>
        private string SaveImage(IFormFile file, string category)
        {
            try
            {
                string uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath, "images", category);
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    file.CopyTo(fileStream);
                }

                return Path.Combine("/images", category, uniqueFileName).Replace("\\", "/");
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "儲存圖片時發生錯誤。";
                return null;
            }
        }

        /// <summary>
        /// 重新配置選項的排序順序
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ReconfigureSortOrder()
        {
            try
            {
                // 獲取所有未刪除的 QuestionOptions，按 QuestionId 和現有 sortOrder 排序
                var questionOptions = _unitOfWork.QuestionOption.GetAll(
                    filter: qo => !qo.IsDeleted,
                    includeProperties: "Question"
                ).OrderBy(qo => qo.QuestionId).ThenBy(qo => qo.Id).ToList(); // 按 QuestionId 和 Id 排序

                // 按 QuestionId 分組，並為每組中的每個項目分配新的 sortOrder
                var groupedOptions = questionOptions.GroupBy(qo => qo.QuestionId);

                foreach (var group in groupedOptions)
                {
                    int sortOrder = 1;
                    foreach (var option in group)
                    {
                        option.SortOrder = sortOrder++;
                        _unitOfWork.QuestionOption.Update(option);
                    }
                }

                // 保存更改到資料庫
                _unitOfWork.Save();

                TempData["success"] = "選項排序已成功重新配置。";
            }
            catch (Exception ex)
            {
                // 可以在此處記錄異常詳細資訊（例如使用日誌工具）
                TempData["ERROR"] = "重新配置選項排序時發生錯誤。";
            }

            return RedirectToAction("Index");
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult MoveUp(int id, int surveyId, int questionId)
        {
            try
            {
                // 獲取當前選項
                var currentOption = _unitOfWork.QuestionOption.Get(qo => qo.Id == id
                    && !qo.IsDeleted
                    && qo.QuestionId == questionId
                    && qo.Question.SurveyId == surveyId, includeProperties: "Question");

                if (currentOption == null)
                {
                    return Json(new { success = false, message = "找不到要上升的項目。" });
                }

                // 獲取同一 SurveyId 和 QuestionId 下，SortOrder 小於當前選項的選項
                var previousOptions = _unitOfWork.QuestionOption.GetAll(
                    qo => qo.QuestionId == questionId
                        && qo.Question.SurveyId == surveyId
                        && qo.SortOrder < currentOption.SortOrder
                        && !qo.IsDeleted
                ).OrderByDescending(qo => qo.SortOrder).ToList();

                var previousOption = previousOptions.FirstOrDefault();

                if (previousOption == null)
                {
                    return Json(new { success = false, message = "已經是第一個選項。" });
                }

                // 交換屬性，除了 Id、QuestionId 和 SurveyId
                SwapQuestionOptionProperties(currentOption, previousOption);

                // 更新資料庫
                _unitOfWork.QuestionOption.Update(currentOption);
                _unitOfWork.QuestionOption.Update(previousOption);
                _unitOfWork.Save();

                return Json(new { success = true, message = "選項已成功上升。" });
            }
            catch (Exception ex)
            {
            
                return Json(new { success = false, message = "上升選項排序時發生錯誤。" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult MoveDown(int id, int surveyId, int questionId)
        {
            try
            {
                // 獲取當前選項
                var currentOption = _unitOfWork.QuestionOption.Get(qo => qo.Id == id
                    && !qo.IsDeleted
                    && qo.QuestionId == questionId
                    && qo.Question.SurveyId == surveyId, includeProperties: "Question");

                if (currentOption == null)
                {
                    return Json(new { success = false, message = "找不到要下降的項目。" });
                }

                // 獲取同一 SurveyId 和 QuestionId 下，SortOrder 大於當前選項的選項
                var nextOptions = _unitOfWork.QuestionOption.GetAll(
                    qo => qo.QuestionId == questionId
                        && qo.Question.SurveyId == surveyId
                        && qo.SortOrder > currentOption.SortOrder
                        && !qo.IsDeleted
                ).OrderBy(qo => qo.SortOrder).ToList();

                var nextOption = nextOptions.FirstOrDefault();

                if (nextOption == null)
                {
                    return Json(new { success = false, message = "已經是最後一個選項。" });
                }

                // 交換屬性，除了 Id、QuestionId 和 SurveyId
                SwapQuestionOptionProperties(currentOption, nextOption);

                // 更新資料庫
                _unitOfWork.QuestionOption.Update(currentOption);
                _unitOfWork.QuestionOption.Update(nextOption);
                _unitOfWork.Save();

                return Json(new { success = true, message = "選項已成功下降。" });
            }
            catch (Exception ex)
            {
     
                return Json(new { success = false, message = "下降選項排序時發生錯誤。" });
            }
        }

        // 私有方法，用於交換兩個 QuestionOption 的屬性，除了 Id、QuestionId 和 SurveyId
        private void SwapQuestionOptionProperties(QuestionOption option1, QuestionOption option2)
        {
            // 交換 OptionText
            string tempOptionText = option1.OptionText;
            option1.OptionText = option2.OptionText;
            option2.OptionText = tempOptionText;

           
            // 交換 CreateTime
            DateTime? tempCreateTime = option1.CreateTime;
            option1.CreateTime = option2.CreateTime;
            option2.CreateTime = tempCreateTime;

            // 交換 CompleteTime
            DateTime? tempCompleteTime = option1.CompleteTime;
            option1.CompleteTime = option2.CompleteTime;
            option2.CompleteTime = tempCompleteTime;

            // 交換 DeletedAt
            DateTime? tempDeletedAt = option1.DeletedAt;
            option1.DeletedAt = option2.DeletedAt;
            option2.DeletedAt = tempDeletedAt;

            // 如果有其他需要交換的屬性，請依此類推
        }


        /// <summary>
        /// 刪除圖片文件
        /// </summary>
        /// <param name="imageUrl">圖片的 URL</param>
        private void DeleteImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return;

                string filePath = Path.Combine(_hostEnvironment.WebRootPath, imageUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "刪除圖片文件時發生錯誤。";
            }
        }

    }


}
