// Areas/Admin/Controllers/QuestionController.cs

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.ComponentModel.DataAnnotations;
using TeaTimeDemo.Extensions;
using TeaTimeDemo.Models.DTOs;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    [Route("admin/[controller]/[action]/{id?}")]
    public class QuestionController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostEnvironment;

        public QuestionController(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _hostEnvironment = hostEnvironment;
        }

        // GET: Admin/Question
        public IActionResult Index()
        {
            return View();
        }

        // GET: Admin/Question/GetAll
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var questions = _unitOfWork.Question.GetAll(
                    filter: q => !q.IsDeleted,// 僅包含未刪除的問題
                    includeProperties: "Survey,QuestionOptions,QuestionImages"
                );

                var questionDTOs = _mapper.Map<List<QuestionDTO>>(questions);

                return Json(new { data = questionDTOs });
            }
            catch (Exception ex)
            {
                // 可以在此記錄 ex.Message 以進行調試
                TempData["ERROR"] = "獲取問題時發生錯誤。";
                return Json(new { data = new List<QuestionVM>() });
            }
        }

        /// <summary>
        /// 顯示新增問題的表單
        /// </summary>
        // GET: Admin/Question/Create
        public IActionResult Create()
        {
            var questionVM = new QuestionVM
            {
                AnswerTypeList = GetAnswerTypeSelectList().ToList(),
                SurveyList = GetSurveySelectList(),
                MceHtml = string.Empty // 或其他預設值
            };

            ViewData["Action"] = "Create";
            ViewData["Title"] = "新增問題";

            return View(questionVM);
        }

        // POST: Admin/Question/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(QuestionVM questionVM)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // 獲取該問卷中最大的 SortOrder
                    var maxSortOrder = _unitOfWork.Question.GetAll(q => q.SurveyId == questionVM.SurveyId && !q.IsDeleted)
                                        .Select(q => q.SortOrder)
                                        .DefaultIfEmpty(0)
                                        .Max();

                    // 設定新問題的 SortOrder 為最大值 + 1
                    questionVM.SortOrder = maxSortOrder + 1;

                    var question = _mapper.Map<Question>(questionVM);
                    question.CreateTime = DateTime.Now;
                    question.CompleteTime = DateTime.Now;

                    _unitOfWork.Question.Add(question);
                    _unitOfWork.Save();

                    // 處理圖片上傳
                    if (questionVM.QuestionImageFiles != null && questionVM.QuestionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionVM.QuestionImageFiles.Count; i++)
                        {
                            var file = questionVM.QuestionImageFiles[i];
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
                                int width = questionVM.NewQuestionImageWidths != null && questionVM.NewQuestionImageWidths.Count > i
                                    ? questionVM.NewQuestionImageWidths[i]
                                    : 200; // 預設寬度
                                int height = questionVM.NewQuestionImageHeights != null && questionVM.NewQuestionImageHeights.Count > i
                                    ? questionVM.NewQuestionImageHeights[i]
                                    : 200; // 預設高度

                                // 儲存圖片並獲取 URL
                                var imageUrl = SaveImage(file, "question");
                                if (imageUrl != null)
                                {
                                    var questionImage = new QuestionImage
                                    {
                                        ImageUrl = imageUrl,
                                        Width = width,
                                        Height = height
                                    };
                                    question.QuestionImages.Add(questionImage);
                                }
                            }
                        }
                    }

                    _unitOfWork.Question.Add(question);
                    _unitOfWork.Save();
                    TempData["success"] = "問題新增成功!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    TempData["ERROR"] = "新增問題時發生錯誤。";
                    return RedirectToAction(nameof(Create));
                }
            }

            // 如果模型驗證失敗，重新加載問卷清單和答案類型清單
            questionVM.AnswerTypeList = GetAnswerTypeSelectList().ToList();
            questionVM.SurveyList = GetSurveySelectList();
            return View(questionVM);
        }

        // GET: Admin/Question/Edit/5
        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                TempData["ERROR"] = "未指定要編輯的問題。";
                return RedirectToAction(nameof(Index));
            }

            var question = _unitOfWork.Question.GetFirstOrDefault(
                q => q.Id == id,
                includeProperties: "QuestionImages,QuestionOptions,Survey"
            );
            if (question == null)
            {
                TempData["ERROR"] = "找不到指定的問題。";
                return RedirectToAction(nameof(Index));
            }

            var questionVM = _mapper.Map<QuestionVM>(question);

            questionVM.SurveyList = _unitOfWork.Survey.GetAll().Select(s => new SelectListItem
            {
                Text = s.Title,
                Value = s.Id.ToString()
            }).ToList();

            questionVM.AnswerTypeList = GetAnswerTypeSelectList().ToList();

            // 映射現有圖片的尺寸
            questionVM.ExistingQuestionImageIds = question.QuestionImages.Select(qi => qi.Id).ToList();
            questionVM.ExistingQuestionImageWidths = question.QuestionImages.Select(qi => qi.Width).ToList();
            questionVM.ExistingQuestionImageHeights = question.QuestionImages.Select(qi => qi.Height).ToList();

            return View(questionVM);
        }

        // POST: Admin/Question/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, QuestionVM questionVM)
        {
            if (id != questionVM.Id)
            {
                TempData["ERROR"] = "編輯的問題 ID 不匹配。";
                return RedirectToAction(nameof(Index));
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var question = _unitOfWork.Question.GetFirstOrDefault(
                        q => q.Id == id,
                        includeProperties: "QuestionImages"
                    );
                    if (question == null)
                    {
                        TempData["ERROR"] = "找不到指定的問題。";
                        return RedirectToAction(nameof(Index));
                    }

                    _mapper.Map(questionVM, question);

                    // 更新現有圖片的尺寸
                    if (questionVM.ExistingQuestionImageIds != null)
                    {
                        for (int i = 0; i < questionVM.ExistingQuestionImageIds.Count; i++)
                        {
                            int imageId = questionVM.ExistingQuestionImageIds[i];
                            var image = question.QuestionImages.FirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = questionVM.ExistingQuestionImageWidths[i];
                                image.Height = questionVM.ExistingQuestionImageHeights[i];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                    }

                    // 處理新上傳的圖片
                    if (questionVM.QuestionImageFiles != null && questionVM.QuestionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionVM.QuestionImageFiles.Count; i++)
                        {
                            var file = questionVM.QuestionImageFiles[i];
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
                                int width = questionVM.NewQuestionImageWidths != null && questionVM.NewQuestionImageWidths.Count > i
                                    ? questionVM.NewQuestionImageWidths[i]
                                    : 200; // 預設寬度
                                int height = questionVM.NewQuestionImageHeights != null && questionVM.NewQuestionImageHeights.Count > i
                                    ? questionVM.NewQuestionImageHeights[i]
                                    : 200; // 預設高度

                                // 儲存圖片並獲取 URL
                                var imageUrl = SaveImage(file, "question");
                                if (imageUrl != null)
                                {
                                    var questionImage = new QuestionImage
                                    {
                                        ImageUrl = imageUrl,
                                        Width = width,
                                        Height = height
                                    };
                                    question.QuestionImages.Add(questionImage);
                                }
                            }
                        }
                    }

                    _unitOfWork.Question.Update(question);
                    _unitOfWork.Save();
                    TempData["success"] = "問題編輯成功!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    TempData["ERROR"] = "編輯問題時發生錯誤。";
                    return RedirectToAction(nameof(Edit), new { id = id });
                }
            }

            questionVM.SurveyList = _unitOfWork.Survey.GetAll().Select(s => new SelectListItem
            {
                Text = s.Title,
                Value = s.Id.ToString()
            }).ToList();

            questionVM.AnswerTypeList = GetAnswerTypeSelectList().ToList();
            return View(questionVM);
        }

        // POST: Admin/Question/Delete/5
        [HttpPost]
        public IActionResult Delete(int? id)
        {
            if (id == null)
            {
                return Json(new { success = false, message = "未指定要刪除的問題。" });
            }

            var question = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == id && !q.IsDeleted);
            if (question == null)
            {
                return Json(new { success = false, message = "找不到指定的問題。" });
            }

            try
            {
                _unitOfWork.Question.SoftDelete(question);
                _unitOfWork.Save();
                return Json(new { success = true, message = "問題已移至回收筒!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"刪除時發生錯誤：{ex.Message}" });
            }
        }

        // GET: Admin/Question/RecycleBin
        public IActionResult RecycleBin()
        {
            try
            {
                var deletedQuestions = _unitOfWork.Question.GetAll(
                    filter: q => q.IsDeleted,
                    includeProperties: "Survey",
                    ignoreQueryFilters: true
                );
                return View(deletedQuestions);
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "獲取回收筒中的問題時發生錯誤。";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Admin/Question/Restore/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            try
            {
                var question = _unitOfWork.Question.GetFirstOrDefault(
                    q => q.Id == id && q.IsDeleted,
                    ignoreQueryFilters: true
                );
                if (question == null)
                {
                    TempData["ERROR"] = "找不到指定的問題。";
                    return RedirectToAction(nameof(RecycleBin));
                }

                _unitOfWork.Question.Restore(question);
                _unitOfWork.Save();
                TempData["success"] = "問題已從回收筒還原!";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "還原問題時發生錯誤。";
                return RedirectToAction(nameof(RecycleBin));
            }
        }

        // POST: Admin/Question/PermanentDelete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult PermanentDelete(int id)
        {
            try
            {
                var question = _unitOfWork.Question.GetFirstOrDefault(
                    q => q.Id == id && q.IsDeleted,
                    includeProperties: "QuestionImages",
                    ignoreQueryFilters: true
                );
                if (question == null)
                {
                    TempData["ERROR"] = "找不到指定的問題。";
                    return RedirectToAction(nameof(RecycleBin));
                }

                // 刪除相關圖片
                foreach (var image in question.QuestionImages.ToList())
                {
                    DeleteImage(image.ImageUrl);
                    _unitOfWork.QuestionImage.Remove(image);
                }

                // 刪除相關選項
                foreach (var option in question.QuestionOptions.ToList())
                {
                    _unitOfWork.QuestionOption.Remove(option);
                }

                _unitOfWork.Question.RemovePhysical(question);
                _unitOfWork.Save();

                TempData["success"] = "問題已永久刪除!";
                return RedirectToAction(nameof(RecycleBin));
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "永久刪除問題時發生錯誤。";
                return RedirectToAction(nameof(RecycleBin));
            }
        }

        /// <summary>
        /// 儲存圖片並返回其 URL
        /// </summary>
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
        /// 刪除圖片文件
        /// </summary>
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

        

        /// <summary>
        /// 重新配置問題的排序順序
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ReconfigureSortOrder()
        {
            try
            {
                // 獲取所有未刪除的問題，按 SurveyId 和現有 SortOrder 排序
                var questions = _unitOfWork.Question.GetAll(
                    filter: q => !q.IsDeleted,
                    includeProperties: "Survey"
                ).OrderBy(q => q.SurveyId).ThenBy(q => q.Id).ToList();

                // 按 SurveyId 分組，並為每組中的每個項目分配新的 SortOrder
                var groupedQuestions = questions.GroupBy(q => q.SurveyId);

                foreach (var group in groupedQuestions)
                {
                    int sortOrder = 1;
                    foreach (var question in group)
                    {
                        question.SortOrder = sortOrder++;
                        _unitOfWork.Question.Update(question);
                    }
                }

                // 保存更改到資料庫
                _unitOfWork.Save();

                TempData["success"] = "問題排序已成功重新配置。";
            }
            catch (Exception ex)
            {
                // 可以在此處記錄異常詳細資訊
                TempData["ERROR"] = "重新配置問題排序時發生錯誤。";
            }

            return RedirectToAction("Index");
        }

        /// <summary>
        /// 上移問題
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult MoveUp(int id, int surveyId)
        {
            try
            {
                // 獲取當前問題
                var currentQuestion = _unitOfWork.Question.Get(q => q.Id == id
                    && !q.IsDeleted
                    && q.SurveyId == surveyId);

                if (currentQuestion == null)
                {
                    return Json(new { success = false, message = "找不到要上移的問題。" });
                }

                // 獲取同一 SurveyId 下，SortOrder 小於當前問題的問題
                var previousQuestions = _unitOfWork.Question.GetAll(
                    q => q.SurveyId == surveyId
                        && q.SortOrder < currentQuestion.SortOrder
                        && !q.IsDeleted
                ).OrderByDescending(q => q.SortOrder).ToList();

                var previousQuestion = previousQuestions.FirstOrDefault();

                if (previousQuestion == null)
                {
                    return Json(new { success = false, message = "已經是第一個問題。" });
                }

                // 交換屬性，除了 Id 和 SurveyId
                SwapQuestionProperties(currentQuestion, previousQuestion);

                // 更新資料庫
                _unitOfWork.Question.Update(currentQuestion);
                _unitOfWork.Question.Update(previousQuestion);
                _unitOfWork.Save();

                return Json(new { success = true, message = "問題已成功上移。" });
            }
            catch (Exception ex)
            {
                // 記錄異常
                return Json(new { success = false, message = "上移問題時發生錯誤。" });
            }
        }

        /// <summary>
        /// 下移問題
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult MoveDown(int id, int surveyId)
        {
            try
            {
                // 獲取當前問題
                var currentQuestion = _unitOfWork.Question.Get(q => q.Id == id
                    && !q.IsDeleted
                    && q.SurveyId == surveyId);

                if (currentQuestion == null)
                {
                    return Json(new { success = false, message = "找不到要下移的問題。" });
                }

                // 獲取同一 SurveyId 下，SortOrder 大於當前問題的問題
                var nextQuestions = _unitOfWork.Question.GetAll(
                    q => q.SurveyId == surveyId
                        && q.SortOrder > currentQuestion.SortOrder
                        && !q.IsDeleted
                ).OrderBy(q => q.SortOrder).ToList();

                var nextQuestion = nextQuestions.FirstOrDefault();

                if (nextQuestion == null)
                {
                    return Json(new { success = false, message = "已經是最後一個問題。" });
                }

                // 交換屬性，除了 Id 和 SurveyId
                SwapQuestionProperties(currentQuestion, nextQuestion);

                // 更新資料庫
                _unitOfWork.Question.Update(currentQuestion);
                _unitOfWork.Question.Update(nextQuestion);
                _unitOfWork.Save();

                return Json(new { success = true, message = "問題已成功下移。" });
            }
            catch (Exception ex)
            {
                // 記錄異常
                return Json(new { success = false, message = "下移問題時發生錯誤。" });
            }
        }

        // 私有方法，用於交換兩個問題的屬性，除了 Id 和 SurveyId
        private void SwapQuestionProperties(Question question1, Question question2)
        {
            // 交換 QuestionText
            string tempQuestionText = question1.QuestionText;
            question1.QuestionText = question2.QuestionText;
            question2.QuestionText = tempQuestionText;

            // 交換 AnswerType
            var tempAnswerType = question1.AnswerType;
            question1.AnswerType = question2.AnswerType;
            question2.AnswerType = tempAnswerType;

        

            // 交換其他需要的屬性，如 CreateTime、CompleteTime 等
            DateTime? tempCreateTime = question1.CreateTime;
            question1.CreateTime = question2.CreateTime;
            question2.CreateTime = tempCreateTime;

            DateTime? tempCompleteTime = question1.CompleteTime;
            question1.CompleteTime = question2.CompleteTime;
            question2.CompleteTime = tempCompleteTime;

            // 如果有其他需要交換的屬性，請依此類推
        }

        /// <summary>
        /// 顯示插入問題的表單
        /// </summary>
        // GET: Admin/Question/Insert/5
        public IActionResult Insert(int? id)
        {
            if (id == null)
            {
                TempData["ERROR"] = "未指定要插入的位置。";
                return RedirectToAction(nameof(Index));
            }

            // 獲取當前問題
            var currentQuestion = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == id && !q.IsDeleted, includeProperties: "Survey");
            if (currentQuestion == null)
            {
                TempData["ERROR"] = "找不到指定的問題。";
                return RedirectToAction(nameof(Index));
            }

            // 準備 ViewModel，預設 SurveyId 為當前問題的 SurveyId，並將 SortOrder 設為當前問題的 SortOrder
            var questionVM = new QuestionVM
            {
                // 不設置 Id，因為我們要添加新問題
                CurrentQuestionId = currentQuestion.Id, // 傳遞當前問題的 ID
                SurveyId = currentQuestion.SurveyId,
                SortOrder = currentQuestion.SortOrder, // 插入到當前問題的位置
                SurveyTitle = currentQuestion.Survey.Title,
                AnswerTypeList = GetAnswerTypeSelectList().ToList(),
                SurveyList = GetSurveySelectList(), // 如果插入時不需要選擇問卷，可以忽略
                MceHtml = string.Empty // 或其他預設值
            };

            ViewData["Action"] = "Insert";
            ViewData["Title"] = "插入問題";
            return View("Create", questionVM); // 使用相同的視圖
        }

        /// <summary>
        /// 處理插入問題的 POST 請求
        /// </summary>
        // POST: Admin/Question/Insert/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Insert(QuestionVM questionVM)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // 獲取需要插入的位置的問題
                    var currentQuestion = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == questionVM.CurrentQuestionId && !q.IsDeleted);
                    if (currentQuestion == null)
                    {
                        TempData["ERROR"] = "找不到指定的問題。";
                        return RedirectToAction(nameof(Index));
                    }

                    // 調整後續問題的排序順序
                    var subsequentQuestions = _unitOfWork.Question.GetAll(
                        q => q.SurveyId == currentQuestion.SurveyId
                        && q.SortOrder >= currentQuestion.SortOrder 
                        && !q.IsDeleted
                    ).OrderByDescending(q => q.SortOrder).ToList();

                    foreach (var q in subsequentQuestions)
                    {
                        q.SortOrder += 1;
                        _unitOfWork.Question.Update(q);
                    }

                    // 創建新問題
                    questionVM.Id = 0; // 確保新問題的 Id 為 0，讓資料庫自動生成
                    var question = _mapper.Map<Question>(questionVM);
                    question.SurveyId = currentQuestion.SurveyId;
                    question.SortOrder = currentQuestion.SortOrder; // 插入到當前問題的位置
                    question.CreateTime = DateTime.Now;
                    question.CompleteTime = DateTime.Now;

                    
                    // 處理圖片上傳（如果有）
                    if (questionVM.QuestionImageFiles != null && questionVM.QuestionImageFiles.Any())
                    {
                        question.QuestionImages = new List<QuestionImage>(); // 確保集合已初始化

                        foreach (var file in questionVM.QuestionImageFiles)
                        {
                            if (file.Length > 0)
                            {
                                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                var extension = Path.GetExtension(file.FileName).ToLower();
                                if (!allowedExtensions.Contains(extension))
                                {
                                    TempData["ERROR"] = "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。";
                                    return RedirectToAction(nameof(Index));
                                }

                                if (file.Length > 5 * 1024 * 1024) // 5MB
                                {
                                    TempData["ERROR"] = "圖片大小不得超過 5MB。";
                                    return RedirectToAction(nameof(Index));
                                }

                                // 儲存圖片並獲取 URL
                                var imageUrl = SaveImage(file, "question");
                                if (imageUrl != null)
                                {
                                    var questionImage = new QuestionImage
                                    {
                                        ImageUrl = imageUrl,
                                        Width = 200, // 預設寬度或根據需要調整
                                        Height = 200 // 預設高度或根據需要調整
                                    };
                                    question.QuestionImages.Add(questionImage);
                                }
                            }
                        }                      
                    }

                    // 添加新問題
                    _unitOfWork.Question.Add(question);

                    // 保存數據庫更改
                    _unitOfWork.Save();

                    TempData["success"] = "問題插入成功!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    TempData["ERROR"] = "插入問題時發生錯誤：{ex.Message}";
                    return RedirectToAction(nameof(Index));
                }
            }

            // 如果模型驗證失敗，重新加載問卷清單
            questionVM.AnswerTypeList = GetAnswerTypeSelectList().ToList();
            questionVM.SurveyList = GetSurveySelectList();

            ViewData["Action"] = "Insert";
            ViewData["Title"] = "插入問題";
            return View("Create", questionVM);
        }

       

        /// <summary>
        /// 獲取答案類型的選項列表，包含預設選項
        /// </summary>
        /// <returns>答案類型的 SelectListItem 集合</returns>
        private IEnumerable<SelectListItem> GetAnswerTypeSelectList()
        {
            var list = Enum.GetValues(typeof(AnswerTypeEnum))
                .Cast<AnswerTypeEnum>()
                .Select(e => new SelectListItem
                {
                    Value = ((int)e).ToString(),
                    Text = GetAnswerTypeText(e)
                }).ToList();

            // 添加預設選項
            list.Insert(0, new SelectListItem { Value = "", Text = "--請選擇答案類型--" });

            return list;
        }

        /// <summary>
        /// 獲取答案類型的文字描述
        /// </summary>
        /// <param name="answerType">答案類型枚舉值</param>
        /// <returns>答案類型的文字描述</returns>
        private string GetAnswerTypeText(AnswerTypeEnum answerType)
        {
            switch (answerType)
            {
                case AnswerTypeEnum.SingleChoice:
                    return "單選";
                case AnswerTypeEnum.MultipleChoice:
                    return "多選";
                case AnswerTypeEnum.TextAnswer:
                    return "填空";
                case AnswerTypeEnum.TextareaAnswer:
                    return "填空框";
                case AnswerTypeEnum.SelectOption:
                    return "下拉選單";
                case AnswerTypeEnum.ImageUpload:
                    return "圖片上傳";
                default:
                    return "未知";
            }        
        }

        /// <summary>
        /// 獲取問卷的選項列表
        /// </summary>
        /// <returns>問卷的 SelectListItem 集合</returns>
        private IEnumerable<SelectListItem> GetSurveySelectList()
        {
            return _unitOfWork.Survey.GetAll()
                .Select(s => new SelectListItem
                {
                    Value = s.Id.ToString(),
                    Text = s.Title
                });
        }
    }
}
