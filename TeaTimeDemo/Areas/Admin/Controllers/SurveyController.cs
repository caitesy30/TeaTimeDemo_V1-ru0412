using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.Linq;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Hosting; // 用來處理圖片上傳
using System.IO; // 處理文件操作
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel; // 新增此命名空間以使用 IFormFile
using AutoMapper;
using TeaTimeDemo.DTOs; // 引用 SurveyDTO 的命名空間
using HtmlAgilityPack; 


namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)] // 只有 Admin 和 Manager 角色能進入
    public class SurveyController : LangBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment; // 用於處理圖片上傳的環境變數
        private readonly IImageService _imageService; // 使用 IImageService 處理圖片
        private readonly IMapper _mapper; // 注入 IMapper


        /// <summary>
        /// 建構子，注入 IUnitOfWork、IWebHostEnvironment 與 IImageService
        /// </summary>
        /// <param name="unitOfWork">單元工作介面</param>
        /// <param name="hostEnvironment">網站宿主環境</param>
        /// <param name="imageService">圖片服務介面</param>
        public SurveyController(IUnitOfWork unitOfWork, IWebHostEnvironment hostEnvironment, IImageService imageService, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
            _imageService = imageService;
            _mapper = mapper; // 賦值
        }

        /// <summary>
        /// 問卷列表頁面
        /// </summary>
        /// <returns>問卷列表視圖</returns>
        public IActionResult Index()
        {
            return View(); // 不再傳遞 surveyList，讓 DataTables 使用 AJAX 獲取資料
        }

        /// <summary>
        /// 問卷的 Upsert 方法，用來處理創建和更新問卷 (GET)
        /// </summary>
        /// <param name="id">問卷 ID，若為 null 則為新增問卷</param>
        /// <returns>Upsert 視圖</returns>
        
        public IActionResult Upsert(int? id, string allIds, int? currentIndex)
        {
            // 初始化 SurveyVM 並準備站別、類別、問題類型的下拉選單資料
            SurveyVM surveyVM = new()
            {
                Survey = new Survey(),
                StationList = _unitOfWork.Station.GetAll().Select(s => new SelectListItem { Text = s.Name, Value = s.Id.ToString() }),
                CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem { Text = c.Name, Value = c.Id.ToString() }),
                QuestionTypeList = GetQuestionTypeList(),
                MceHtml = string.Empty, // 初始化為空，稍後動態生成
                ImageMappings = new Dictionary<string, int>() // 初始化 ImageMappings

                /*
                MceHtml = id != null && id > 0
                            ? _unitOfWork.Survey.Get(s => s.Id == id, includeProperties: "Questions,Questions.QuestionOptions,Category")?.MceHtml
                            : string.Empty
                */
            };

            // 如果有傳入 ID，表示是編輯問卷
            if (id != null && id > 0)
            {
                // 從資料庫中取得指定 ID 的問卷資料，包括相關的問題、選項及分類
                surveyVM.Survey = _unitOfWork.Survey.GetFirstOrDefault(
                    u => u.Id == id,
                  includeProperties: "Category,QuestionImages,Questions,Questions.FillInBlanks,Questions.QuestionImages,Questions.QuestionOptions,Questions.QuestionOptions.QuestionImages,Questions.QuestionOptions.FillInBlanks");

                if (surveyVM.Survey == null)
                {
                    return NotFound();
                }

                // 初始化 ExistingSurveyImageIds 等屬性，用於更新現有問卷圖片的尺寸
                surveyVM.ExistingSurveyImageIds = surveyVM.Survey.QuestionImages
                                                    .Where(qi => qi.SurveyId == surveyVM.Survey.Id && qi.QuestionId == null && qi.QuestionOptionId == null)
                                                    .Select(qi => qi.Id).ToList();
                surveyVM.ExistingSurveyImageWidths = surveyVM.Survey.QuestionImages
                                                    .Where(qi => qi.SurveyId == surveyVM.Survey.Id && qi.QuestionId == null && qi.QuestionOptionId == null)
                                                    .Select(qi => qi.Width).ToList();
                surveyVM.ExistingSurveyImageHeights = surveyVM.Survey.QuestionImages
                                                    .Where(qi => qi.SurveyId == surveyVM.Survey.Id && qi.QuestionId == null && qi.QuestionOptionId == null)
                                                    .Select(qi => qi.Height).ToList();

                // 初始化 ExistingQuestionImageIds 等屬性，用於更新現有問題圖片的尺寸
                surveyVM.ExistingQuestionImageIds = surveyVM.Survey.Questions
                                                        .Select(q => q.QuestionImages.Select(qi => qi.Id).ToList())
                                                        .ToList();
                surveyVM.ExistingQuestionImageWidths = surveyVM.Survey.Questions
                                                        .Select(q => q.QuestionImages.Select(qi => qi.Width).ToList())
                                                        .ToList();
                surveyVM.ExistingQuestionImageHeights = surveyVM.Survey.Questions
                                                        .Select(q => q.QuestionImages.Select(qi => qi.Height).ToList())
                                                        .ToList();

                // 初始化 ExistingOptionImageIds 等屬性，用於更新現有選項圖片的尺寸
                surveyVM.ExistingOptionImageIds = surveyVM.Survey.Questions
                                                    .Select(q => q.QuestionOptions
                                                        .Select(o => o.QuestionImages.Select(qi => qi.Id).ToList()) // 修改部分：使用 QuestionImages
                                                        .ToList())
                                                    .ToList();
                surveyVM.ExistingOptionImageWidths = surveyVM.Survey.Questions
                                                    .Select(q => q.QuestionOptions
                                                        .Select(o => o.QuestionImages.Select(qi => qi.Width).ToList()) // 修改部分：使用 QuestionImages
                                                        .ToList())
                                                    .ToList();
                surveyVM.ExistingOptionImageHeights = surveyVM.Survey.Questions
                                                    .Select(q => q.QuestionOptions
                                                        .Select(o => o.QuestionImages.Select(qi => qi.Height).ToList()) // 修改部分：使用 QuestionImages
                                                        .ToList())
                                                    .ToList();

                // 將每個問題和選項的圖片資料封裝進 ViewModel 傳遞給前端
                surveyVM.QuestionVMs = surveyVM.Survey.Questions.Select(q => new QuestionVM
                {
                    Question = q,
                    QuestionImages = q.QuestionImages.ToList(),
                    ExistingQuestionImageIds = q.QuestionImages.Select(qi => qi.Id).ToList(),
                    ExistingQuestionImageWidths = q.QuestionImages.Select(qi => qi.Width).ToList(),
                    ExistingQuestionImageHeights = q.QuestionImages.Select(qi => qi.Height).ToList(),
                    // **加入問題級別的填空資料**
                    FillInBlanks = q.FillInBlanks.Select(fib => new FillInBlankVM
                    {
                        Id = fib.Id,
                        QuestionId = fib.QuestionId,
                        QuestionOptionId = fib.QuestionOptionId,
                        RegexPattern = fib.RegexPattern,
                        Length = fib.Length,
                        Position = fib.Position,
                        BlankNumber = fib.BlankNumber,
                        Placeholder = fib.Placeholder
                    }).ToList(),

                    QuestionOptionVMs = q.QuestionOptions.Select(o => new QuestionOptionVM
                    {
                        QuestionOption = o,
                        QuestionOptionImages = o.QuestionImages.ToList(),
                        ExistingOptionImageIds = o.QuestionImages.Select(qi => qi.Id).ToList(),
                        ExistingOptionImageWidths = o.QuestionImages.Select(qi => qi.Width).ToList(),
                        ExistingOptionImageHeights = o.QuestionImages.Select(qi => qi.Height).ToList(),
                        FillInBlanks = o.FillInBlanks.Select(fib => new FillInBlankVM
                        {
                            Id = fib.Id,
                            QuestionId=fib.QuestionId,
                            QuestionOptionId = fib.QuestionOptionId,
                            RegexPattern = fib.RegexPattern,
                            Length = fib.Length,
                            Position = fib.Position,
                            BlankNumber = fib.BlankNumber,
                            Placeholder = fib.Placeholder // **新增這一行**
                            // 如果需要，您可以添加其他屬性
                        }).ToList()
                    }).ToList()
                }).ToList();

                // **動態生成 MceHtml，確保編輯器中的圖片屬性與左側表單同步**
                surveyVM.MceHtml = UpdateMceHtmlImages(surveyVM.Survey.MceHtml, surveyVM);

                // **建立 ImageMappings 映射**
                // 為問卷圖片建立映射
                foreach (var image in surveyVM.Survey.QuestionImages)
                {
                    surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                }

                // 為問題圖片建立映射
                foreach (var questionVM in surveyVM.QuestionVMs)
                {
                    foreach (var image in questionVM.QuestionImages)
                    {
                        surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                    }

                    // 為選項圖片建立映射
                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        foreach (var image in optionVM.QuestionOptionImages)
                        {
                            surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                        }
                    }
                }

            }

            // 如果 allIds 和 currentIndex 有值，設定 ViewBag
            if (!string.IsNullOrEmpty(allIds) && currentIndex.HasValue)
            {
                // 將多筆 ID 的資訊傳給 ViewBag，若無多筆模式可為 null
                ViewBag.AllIds = allIds;
                ViewBag.CurrentIndex = currentIndex;
            }

            return View(surveyVM); // 返回帶有問卷資料的視圖
        }



        /// <summary>
        /// 問卷的 Upsert 方法，處理表單提交，用來新增或更新問卷資料與圖片 (POST)
        /// </summary>
        /// <param name="surveyVM">問卷的 ViewModel</param>
        /// <param name="MceHtml">TinyMCE 編輯器的 HTML 內容</param>
        /// <returns>重定向到 Index 或返回 Upsert 視圖</returns>

        [HttpPost]
        [ValidateAntiForgeryToken]

        /*
        public IActionResult Upsert(SurveyVM surveyVM, string MceHtml)
        {
            
            // 宣告 errorMessages 變數，用於收集錯誤訊息
            //var errorMessages = new List<string>();
            

            // 檢查表單提交的資料是否有效
            if (ModelState.IsValid)
            {

                
                // 新增：收集 ModelState 中的錯誤訊息              
                //foreach (var state in ModelState)
                //{
                //    foreach (var error in state.Value.Errors)
                //    {
                //        errorMessages.Add($"欄位 '{state.Key}': {error.ErrorMessage}");
                //    }
                //}
                

                // ================================================
                // 第一步：先儲存 Survey 主檔，以取得 Survey.Id
                // ================================================


                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
                var currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);

                // 處理新增或編輯問卷
                if (surveyVM.Survey.Id == 0)
                {
                    // 設定問卷的建立人資訊
                    surveyVM.Survey.JobName = currentUser?.Name;  // 設定問卷的建立人名稱
                    surveyVM.Survey.JobNum = currentUser?.Address;  // 設定問卷的建立人地址
                    surveyVM.Survey.ApplicationUserId = currentUserId; // 設定建立人的 ID
                    surveyVM.Survey.CompleteTime = surveyVM.Survey.IsPublished ? DateTime.Now : (DateTime?)null; // 設定完成時間

                    // 尚未更新 MceHtml，此時先以使用者提交的 MceHtml 保存
                    // 後面會再重整 MceHtml
                    // **將 MceHtml 賦值給 Survey 的 MceHtml 欄位，並解析更新圖片屬性**
                    //surveyVM.Survey.MceHtml = UpdateMceHtmlImages(MceHtml, surveyVM); // 更新 MceHtml
                    surveyVM.Survey.MceHtml = MceHtml;


                    _unitOfWork.Survey.Add(surveyVM.Survey);
                    _unitOfWork.Save(); // 儲存後才有 Survey.Id
                    //  TempData["success"] = "問卷新增成功!";
                }
                else
                {
                    // 編輯問卷
                    var existingSurvey1 = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyVM.Survey.Id, includeProperties: "Questions", ignoreQueryFilters: true);
                    if (existingSurvey1 != null)
                    {
                        existingSurvey1.CategoryId = surveyVM.Survey.CategoryId; // 設置 CategoryId
                        existingSurvey1.Title = surveyVM.Survey.Title;
                        existingSurvey1.Description = surveyVM.Survey.Description;
                        existingSurvey1.StationName = surveyVM.Survey.StationName;
                        existingSurvey1.QuestionNum = surveyVM.Survey.QuestionNum;
                        existingSurvey1.IsPublished = surveyVM.Survey.IsPublished;
                        existingSurvey1.CompleteTime = surveyVM.Survey.IsPublished && existingSurvey1.CompleteTime == null ? DateTime.Now : (!surveyVM.Survey.IsPublished ? null : existingSurvey1.CompleteTime);

                        
                        //if (surveyVM.Survey.IsPublished && existingSurvey1.CompleteTime == null)
                        //{
                        //    existingSurvey1.CompleteTime = DateTime.Now;
                        //}
                        //else if (!surveyVM.Survey.IsPublished)
                        //{
                        //    existingSurvey1.CompleteTime = null;
                        //}
                        
                        // 先暫存目前的 MceHtml (尚未更新圖片)
                        existingSurvey1.MceHtml = MceHtml;

                        // **更新 MceHtml 前，解析並更新圖片屬性**
                        //existingSurvey1.MceHtml = UpdateMceHtmlImages(MceHtml, surveyVM);

                        _unitOfWork.Survey.Update(existingSurvey1);
                        _unitOfWork.Save(); // 更新後保存                    
                      //  TempData["success"] = "問卷編輯成功!";
                    }
                }
                
                // **處理現有問卷圖片的寬度和高度更新**
                if (surveyVM.ExistingSurveyImageIds != null && surveyVM.ExistingSurveyImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingSurveyImageIds.Count; i++)
                    {
                        int imageId = surveyVM.ExistingSurveyImageIds[i];
                        var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                        if (image != null)
                        {
                            image.Width = surveyVM.ExistingSurveyImageWidths[i];
                            image.Height = surveyVM.ExistingSurveyImageHeights[i];
                            _unitOfWork.QuestionImage.Update(image);
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理現有問題圖片的寬度和高度更新**
                if (surveyVM.ExistingQuestionImageIds != null && surveyVM.ExistingQuestionImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingQuestionImageIds.Count; i++)
                    {
                        for (int j = 0; j < surveyVM.ExistingQuestionImageIds[i].Count; j++)
                        {
                            int imageId = surveyVM.ExistingQuestionImageIds[i][j];
                            var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = surveyVM.ExistingQuestionImageWidths[i][j];
                                image.Height = surveyVM.ExistingQuestionImageHeights[i][j];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理現有選項圖片的寬度和高度更新**
                if (surveyVM.ExistingOptionImageIds != null && surveyVM.ExistingOptionImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingOptionImageIds.Count; i++)
                    {
                        for (int j = 0; j < surveyVM.ExistingOptionImageIds[i].Count; j++)
                        {
                            for (int k = 0; k < surveyVM.ExistingOptionImageIds[i][j].Count; k++)
                            {
                                int imageId = surveyVM.ExistingOptionImageIds[i][j][k];
                                var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                                if (image != null)
                                {
                                    image.Width = surveyVM.ExistingOptionImageWidths[i][j][k];
                                    image.Height = surveyVM.ExistingOptionImageHeights[i][j][k];
                                    _unitOfWork.QuestionImage.Update(image);
                                }
                            }
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理新上傳的問卷圖片，並處理寬度和高度**
                if (surveyVM.SurveyImageFiles != null && surveyVM.SurveyImageFiles.Count > 0)
                {
                    for (int i = 0; i < surveyVM.SurveyImageFiles.Count; i++)
                    {
                        var image = surveyVM.SurveyImageFiles[i];

                        if (image != null && image.Length > 0)
                        {
                            // 後端驗證圖片類型
                            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                            var extension = Path.GetExtension(image.FileName).ToLower();
                            if (!allowedExtensions.Contains(extension))
                            {
                                ModelState.AddModelError("SurveyImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                continue; // 跳過無效的圖片
                            }

                            // 後端驗證圖片大小
                            if (image.Length > 5 * 1024 * 1024) // 5MB
                            {
                                ModelState.AddModelError("SurveyImageFiles", "圖片大小不得超過 5MB。");
                                continue; // 跳過超大圖片
                            }

                            // **從表單中取得對應的寬度和高度，使用 NewSurveyImageWidths 和 NewSurveyImageHeights**
                            int width = surveyVM.NewSurveyImageWidths != null && surveyVM.NewSurveyImageWidths.Count > i
                                ? surveyVM.NewSurveyImageWidths[i]
                                : 200;

                            int height = surveyVM.NewSurveyImageHeights != null && surveyVM.NewSurveyImageHeights.Count > i
                                ? surveyVM.NewSurveyImageHeights[i]
                                : 200;

                            // 使用 ImageService 儲存圖片
                            var imageUrl = _imageService.SaveImage(image, "survey"); // 儲存問卷圖片
                            if (imageUrl != null)
                            {
                                var questionImage = new QuestionImage
                                {
                                    SurveyId = surveyVM.Survey.Id, // 設置 SurveyId
                                    ImageUrl = imageUrl,
                                    Width = width,   // 儲存圖片寬度
                                    Height = height  // 儲存圖片高度
                                };
                                _unitOfWork.QuestionImage.Add(questionImage); // 新增圖片記錄
                            }
                        }
                    }
                    _unitOfWork.Save();
                }



                // **處理每個問題**
                for (int qIndex = 0; qIndex < surveyVM.QuestionVMs.Count; qIndex++)
                {
                    var questionVM = surveyVM.QuestionVMs[qIndex];
                    var question = questionVM.Question;

                    // 新增或更新問題
                    if (question.Id == 0)
                    {
                        question.SurveyId = surveyVM.Survey.Id;
                        _unitOfWork.Question.Add(question);
                        _unitOfWork.Save();  // 保存以生成問題的 ID
                    }
                    else
                    {
                        // 編輯問題
                        // 從資料庫中取得已存在的問題實體，避免追蹤衝突
                        var existingQuestion = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == question.Id);

                        if (existingQuestion != null)
                        {
                            // 更新現有問題實體的屬性
                            existingQuestion.QuestionText = question.QuestionText;
                            existingQuestion.AnswerType = question.AnswerType;
                            existingQuestion.MceHtml = question.MceHtml;
                            existingQuestion.CreateTime = question.CreateTime;
                            existingQuestion.Remark = question.Remark;


                            // 更新其他需要的屬性

                            // 更新實體
                            _unitOfWork.Question.Update(existingQuestion);
                            _unitOfWork.Save();
                        }
                    }

                    // **處理現有問題圖片的寬度和高度更新**
                    if (questionVM.ExistingQuestionImageIds != null && questionVM.ExistingQuestionImageIds.Count > 0)
                    {
                        for (int i = 0; i < questionVM.ExistingQuestionImageIds.Count; i++)
                        {
                            int imageId = questionVM.ExistingQuestionImageIds[i];
                            var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = questionVM.ExistingQuestionImageWidths[i];
                                image.Height = questionVM.ExistingQuestionImageHeights[i];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                        _unitOfWork.Save(); // 保存更改
                    }

                    // **處理新上傳的問題圖片，並處理寬度和高度**
                    if (questionVM.QuestionImageFiles != null && questionVM.QuestionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionVM.QuestionImageFiles.Count; i++)
                        {
                            var image = questionVM.QuestionImageFiles[i];

                            if (image != null && image.Length > 0)
                            {
                                // 後端驗證圖片類型
                                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                var extension = Path.GetExtension(image.FileName).ToLower();
                                if (!allowedExtensions.Contains(extension))
                                {
                                    ModelState.AddModelError("QuestionImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                    continue; // 跳過無效的圖片
                                }

                                // 後端驗證圖片大小
                                if (image.Length > 5 * 1024 * 1024) // 5MB
                                {
                                    ModelState.AddModelError("QuestionImageFiles", "圖片大小不得超過 5MB。");
                                    continue; // 跳過超大圖片
                                }

                                // **從表單中取得對應的寬度和高度，使用 NewQuestionImageWidths 和 NewQuestionImageHeights**
                                int width = questionVM.NewQuestionImageWidths != null && questionVM.NewQuestionImageWidths.Count > i
                                    ? questionVM.NewQuestionImageWidths[i]
                                    : 190;

                                int height = questionVM.NewQuestionImageHeights != null && questionVM.NewQuestionImageHeights.Count > i
                                    ? questionVM.NewQuestionImageHeights[i]
                                    : 195;

                                // 使用 ImageService 儲存圖片
                                var imageUrl = _imageService.SaveImage(image, "question"); // 儲存問題圖片
                                if (imageUrl != null)
                                {
                                    var questionImage = new QuestionImage
                                    {
                                        QuestionId = question.Id, // 設置 QuestionId
                                        ImageUrl = imageUrl,
                                        Width = width,   // 儲存圖片寬度
                                        Height = height  // 儲存圖片高度
                                    };
                                    _unitOfWork.QuestionImage.Add(questionImage); // 新增問題圖片記錄
                                }
                            }
                        }
                        _unitOfWork.Save(); // 保存更改
                    }

                    // **處理填空（FillInBlanks）**
                    if (questionVM.FillInBlanks != null && questionVM.FillInBlanks.Count > 0)
                    {
                        // 初始化填空編號
                        int blankNumber = 1;

                        foreach (var fillInBlankVM in questionVM.FillInBlanks)
                        {
                            if (fillInBlankVM.IsDeleted)
                            {
                                if (fillInBlankVM.Id > 0)
                                {
                                    // 使用 SoftDelete 方法進行軟刪除
                                    var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                                        f => f.Id == fillInBlankVM.Id,
                                        ignoreQueryFilters: true
                                    );

                                    if (existingFillInBlank != null)
                                    {

                                        _unitOfWork.FillInBlank.SoftDelete(existingFillInBlank);
                                        _unitOfWork.Save(); // 保存更改
                                    }
                                }
                                // 跳過後續處理
                                continue;
                            }

                            // 自動生成填空編號
                            // fillInBlankVM.BlankNumber = blankNumber++;

                            // 設定填空所屬的問題 ID
                            fillInBlankVM.QuestionId = question.Id;

                            FillInBlank fillInBlank;

                            if (fillInBlankVM.Id == 0)
                            {
                                // 新增：將 FillInBlankVM 映射到 FillInBlank 實體
                                fillInBlank = new FillInBlank
                                {
                                    QuestionId = fillInBlankVM.QuestionId,
                                    RegexPattern = fillInBlankVM.RegexPattern,
                                    Length = fillInBlankVM.Length,
                                    Position = fillInBlankVM.Position,
                                    BlankNumber = fillInBlankVM.BlankNumber,
                                    Placeholder = fillInBlankVM.Placeholder
                                    // 根據需要添加其他屬性
                                };
                                _unitOfWork.FillInBlank.Add(fillInBlank);
                            }
                            else
                            {
                                // 編輯填空
                                // 從資料庫中取得已存在的填空實體
                                var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == fillInBlankVM.Id, ignoreQueryFilters: true);

                                if (existingFillInBlank != null)
                                {
                                    // 更新現有填空實體的屬性
                                    existingFillInBlank.RegexPattern = fillInBlankVM.RegexPattern;
                                    existingFillInBlank.Length = fillInBlankVM.Length;
                                    existingFillInBlank.Position = fillInBlankVM.Position;
                                    existingFillInBlank.BlankNumber = fillInBlankVM.BlankNumber;
                                    existingFillInBlank.Placeholder = fillInBlankVM.Placeholder;
                                    // 更新其他需要的屬性

                                    // 更新實體
                                    _unitOfWork.FillInBlank.Update(existingFillInBlank);
                                    //_unitOfWork.Save(); // 如果需要，可以在外面統一 Save()
                                }
                            }
                        }
                        _unitOfWork.Save(); // 保存填空的更改
                    }


                    // **處理每個選項及其圖片**
                    for (int oIndex = 0; oIndex < questionVM.QuestionOptionVMs.Count; oIndex++)
                    {
                        var optionVM = questionVM.QuestionOptionVMs[oIndex];
                        var option = optionVM.QuestionOption;
                        option.QuestionId = question.Id;

                        // 新增或更新選項
                        if (option.Id == 0)
                        {
                            _unitOfWork.QuestionOption.Add(option); // 新增選項
                            _unitOfWork.Save(); // 保存以生成選項的 ID
                        }
                        else
                        {
                            // 編輯選項
                            // 從資料庫中取得已存在的選項實體，避免追蹤衝突
                            var existingOption = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == option.Id, ignoreQueryFilters: true);

                            if (existingOption != null)
                            {
                                // 更新現有選項實體的屬性
                                existingOption.OptionText = option.OptionText;
                                existingOption.IsCorrect = option.IsCorrect;
                                existingOption.IsOther = option.IsOther;
                                existingOption.SortOrder = option.SortOrder;
                                existingOption.Description = option.Description;
                                // 更新其他需要的屬性

                                // 更新實體
                                _unitOfWork.QuestionOption.Update(existingOption);
                                _unitOfWork.Save();
                            }
                        }

                        // **處理現有選項圖片的寬度和高度更新**
                        if (optionVM.ExistingOptionImageIds != null && optionVM.ExistingOptionImageIds.Count > 0)
                        {
                            for (int i = 0; i < optionVM.ExistingOptionImageIds.Count; i++)
                            {
                                int imageId = optionVM.ExistingOptionImageIds[i];
                                var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                                if (image != null)
                                {
                                    image.Width = optionVM.ExistingOptionImageWidths[i];
                                    image.Height = optionVM.ExistingOptionImageHeights[i];
                                    _unitOfWork.QuestionImage.Update(image);
                                }
                            }
                            _unitOfWork.Save(); // 保存更改
                        }



                        // **處理新上傳的選項圖片，並處理寬度和高度**
                        if (optionVM.OptionImageFiles != null && optionVM.OptionImageFiles.Count > 0)
                        {
                            for (int i = 0; i < optionVM.OptionImageFiles.Count; i++)
                            {
                                var image = optionVM.OptionImageFiles[i];

                                if (image != null && image.Length > 0)
                                {
                                    // 後端驗證圖片類型
                                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                    var extension = Path.GetExtension(image.FileName).ToLower();
                                    if (!allowedExtensions.Contains(extension))
                                    {
                                        ModelState.AddModelError("OptionImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                        continue; // 跳過無效的圖片
                                    }

                                    // 後端驗證圖片大小
                                    if (image.Length > 5 * 1024 * 1024) // 5MB
                                    {
                                        ModelState.AddModelError("OptionImageFiles", "圖片大小不得超過 5MB。");
                                        continue; // 跳過超大圖片
                                    }

                                    // **從表單中取得對應的寬度和高度，使用 NewOptionImageWidths 和 NewOptionImageHeights**
                                    int width = optionVM.NewOptionImageWidths != null && optionVM.NewOptionImageWidths.Count > i
                                        ? optionVM.NewOptionImageWidths[i]
                                        : 180;

                                    int height = optionVM.NewOptionImageHeights != null && optionVM.NewOptionImageHeights.Count > i
                                        ? optionVM.NewOptionImageHeights[i]
                                        : 185;

                                    // 使用 ImageService 儲存圖片
                                    var imageUrl = _imageService.SaveImage(image, "option"); // 儲存選項圖片
                                    if (imageUrl != null)
                                    {
                                        var optionImage = new QuestionImage
                                        {
                                            QuestionOptionId = option.Id, // 設置 QuestionOptionId
                                            ImageUrl = imageUrl,
                                            Width = width,   // 儲存圖片寬度
                                            Height = height  // 儲存圖片高度
                                        };
                                        _unitOfWork.QuestionImage.Add(optionImage); // 新增選項圖片記錄
                                    }
                                }
                            }
                            _unitOfWork.Save(); // 保存更改
                        }

                        // **處理填空（FillInBlanks）**
                        if (optionVM.FillInBlanks != null && optionVM.FillInBlanks.Count > 0)
                        {
                            // 初始化填空編號
                            int blankNumber = 1;

                            foreach (var fillInBlankVM in optionVM.FillInBlanks)
                            {

                                if (fillInBlankVM.IsDeleted)
                                {
                                    if (fillInBlankVM.Id > 0)
                                    {
                                        // 使用 SoftDelete 方法進行軟刪除
                                        var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                                            f => f.Id == fillInBlankVM.Id,
                                            ignoreQueryFilters: true
                                        );

                                        if (existingFillInBlank != null)
                                        {
                                            _unitOfWork.FillInBlank.SoftDelete(existingFillInBlank);
                                            _unitOfWork.Save(); // 保存更改
                                        }
                                    }
                                    // 跳過後續處理
                                    continue;
                                }


                                // 自動生成填空編號
                                fillInBlankVM.BlankNumber = blankNumber++;

                                // 設定填空所屬的選項 ID
                                fillInBlankVM.QuestionOptionId = option.Id;


                                FillInBlank fillInBlank;

                                if (fillInBlankVM.Id == 0)
                                {
                                    // 新增：將 FillInBlankVM 映射到 FillInBlank 實體
                                    fillInBlank = new FillInBlank
                                    {
                                        QuestionOptionId = fillInBlankVM.QuestionOptionId,
                                        RegexPattern = fillInBlankVM.RegexPattern,
                                        Length = fillInBlankVM.Length,
                                        Position = fillInBlankVM.Position,
                                        BlankNumber = fillInBlankVM.BlankNumber,
                                        Placeholder = fillInBlankVM.Placeholder // 新增這一行
                                        // 根據需要添加其他屬性
                                    };
                                    _unitOfWork.FillInBlank.Add(fillInBlank);
                                }
                                else
                                {
                                    // 編輯填空
                                    // 從資料庫中取得已存在的填空實體
                                    var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == fillInBlankVM.Id, ignoreQueryFilters: true);

                                    if (existingFillInBlank != null)
                                    {
                                        // 更新現有填空實體的屬性
                                        existingFillInBlank.RegexPattern = fillInBlankVM.RegexPattern;
                                        existingFillInBlank.Length = fillInBlankVM.Length;
                                        existingFillInBlank.Position = fillInBlankVM.Position;
                                        existingFillInBlank.BlankNumber = fillInBlankVM.BlankNumber;
                                        existingFillInBlank.Placeholder = fillInBlankVM.Placeholder;
                                        // 更新其他需要的屬性

                                        // 更新實體
                                        _unitOfWork.FillInBlank.Update(existingFillInBlank);
                                        //_unitOfWork.Save(); // 如果需要，可以在外面統一 Save()
                                    }
                                }
                            }
                            _unitOfWork.Save(); // 保存填空的更改
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }               

                surveyVM.Survey.MceHtml = MceHtml;
                _unitOfWork.Survey.Update(surveyVM.Survey);
                _unitOfWork.Save(); // 儲存後才有 Survey.Id
                
                // 完成後設定成功訊息並重定向到列表頁面
                TempData["success"] = surveyVM.Survey.Id == 0 ? "問卷新增成功!" : "問卷編輯成功!";
               // return RedirectToAction("Index");
                return RedirectToAction("Upsert", new { id = surveyVM.Survey.Id });                              
               
            }

            
            // 如果表單驗證失敗，收集錯誤訊息
            //foreach (var state in ModelState)
            //{
            //    foreach (var error in state.Value.Errors)
            //    {
            //        errorMessages.Add($"欄位 '{state.Key}': {error.ErrorMessage}");
            //    }
            //}

            // 將錯誤訊息存入 TempData
            //TempData["ERROR"] = string.Join("<br/>", errorMessages);
                      

                // 如果表單驗證失敗，重新加載站別與分類下拉選單數據
                surveyVM.StationList = _unitOfWork.Station.GetAll().Select(s => new SelectListItem { Text = s.Name, Value = s.Id.ToString() });
                surveyVM.CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem { Text = c.Name, Value = c.Id.ToString() });
                surveyVM.QuestionTypeList = GetQuestionTypeList();
                return View(surveyVM); // 返回帶有錯誤提示的視圖           
        }
        */

     
        public IActionResult Upsert(SurveyVM surveyVM, string MceHtml, string AllIds, int? CurrentIndex)
        {
            // 宣告 errorMessages 變數，用於收集錯誤訊息
            var errorMessages = new List<string>();


            // 檢查表單提交的資料是否有效
            if (ModelState.IsValid)
            {


                // 新增：收集 ModelState 中的錯誤訊息              
                foreach (var state in ModelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        errorMessages.Add($"欄位 '{state.Key}': {error.ErrorMessage}");
                    }
                }


                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
                var currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);

                // 處理新增或編輯問卷
                if (surveyVM.Survey.Id == 0)
                {
                    // 設定問卷的建立人資訊
                    surveyVM.Survey.JobName = currentUser?.Name;  // 設定問卷的建立人名稱
                    surveyVM.Survey.JobNum = currentUser?.Address;  // 設定問卷的建立人地址
                    surveyVM.Survey.ApplicationUserId = currentUserId; // 設定建立人的 ID
                    surveyVM.Survey.CompleteTime = surveyVM.Survey.IsPublished ? DateTime.Now : (DateTime?)null; // 設定完成時間

                    // **將 MceHtml 賦值給 Survey 的 MceHtml 欄位，並解析更新圖片屬性**
                    surveyVM.Survey.MceHtml = UpdateMceHtmlImages(MceHtml, surveyVM); // 更新 MceHtml



                    _unitOfWork.Survey.Add(surveyVM.Survey);
                    _unitOfWork.Save(); // 先保存問卷，取得 ID
                    TempData["success"] = "問卷新增成功!";
                }
                else
                {
                    // 編輯問卷
                    var existingSurvey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyVM.Survey.Id, includeProperties: "Questions", ignoreQueryFilters: true);
                    if (existingSurvey != null)
                    {
                        existingSurvey.CategoryId = surveyVM.Survey.CategoryId; // 設置 CategoryId
                        existingSurvey.Title = surveyVM.Survey.Title;
                        existingSurvey.Description = surveyVM.Survey.Description;
                        existingSurvey.StationName = surveyVM.Survey.StationName;
                        existingSurvey.QuestionNum = surveyVM.Survey.QuestionNum;
                        existingSurvey.IsPublished = surveyVM.Survey.IsPublished;

                        if (surveyVM.Survey.IsPublished && existingSurvey.CompleteTime == null)
                        {
                            existingSurvey.CompleteTime = DateTime.Now;
                        }
                        else if (!surveyVM.Survey.IsPublished)
                        {
                            existingSurvey.CompleteTime = null;
                        }


                        // **更新 MceHtml 前，解析並更新圖片屬性**
                        existingSurvey.MceHtml = UpdateMceHtmlImages(MceHtml, surveyVM);

                        _unitOfWork.Survey.Update(existingSurvey);
                        _unitOfWork.Save(); // 更新後保存                    
                        TempData["success"] = "問卷編輯成功!";
                    }
                }

                // **處理現有問卷圖片的寬度和高度更新**
                if (surveyVM.ExistingSurveyImageIds != null && surveyVM.ExistingSurveyImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingSurveyImageIds.Count; i++)
                    {
                        int imageId = surveyVM.ExistingSurveyImageIds[i];
                        var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                        if (image != null)
                        {
                            image.Width = surveyVM.ExistingSurveyImageWidths[i];
                            image.Height = surveyVM.ExistingSurveyImageHeights[i];
                            _unitOfWork.QuestionImage.Update(image);
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理現有問題圖片的寬度和高度更新**
                if (surveyVM.ExistingQuestionImageIds != null && surveyVM.ExistingQuestionImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingQuestionImageIds.Count; i++)
                    {
                        for (int j = 0; j < surveyVM.ExistingQuestionImageIds[i].Count; j++)
                        {
                            int imageId = surveyVM.ExistingQuestionImageIds[i][j];
                            var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = surveyVM.ExistingQuestionImageWidths[i][j];
                                image.Height = surveyVM.ExistingQuestionImageHeights[i][j];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理現有選項圖片的寬度和高度更新**
                if (surveyVM.ExistingOptionImageIds != null && surveyVM.ExistingOptionImageIds.Count > 0)
                {
                    for (int i = 0; i < surveyVM.ExistingOptionImageIds.Count; i++)
                    {
                        for (int j = 0; j < surveyVM.ExistingOptionImageIds[i].Count; j++)
                        {
                            for (int k = 0; k < surveyVM.ExistingOptionImageIds[i][j].Count; k++)
                            {
                                int imageId = surveyVM.ExistingOptionImageIds[i][j][k];
                                var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                                if (image != null)
                                {
                                    image.Width = surveyVM.ExistingOptionImageWidths[i][j][k];
                                    image.Height = surveyVM.ExistingOptionImageHeights[i][j][k];
                                    _unitOfWork.QuestionImage.Update(image);
                                }
                            }
                        }
                    }
                    _unitOfWork.Save(); // 保存更改
                }

                // **處理新上傳的問卷圖片，並處理寬度和高度**
                if (surveyVM.SurveyImageFiles != null && surveyVM.SurveyImageFiles.Count > 0)
                {
                    for (int i = 0; i < surveyVM.SurveyImageFiles.Count; i++)
                    {
                        var image = surveyVM.SurveyImageFiles[i];

                        if (image != null && image.Length > 0)
                        {
                            // 後端驗證圖片類型
                            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                            var extension = Path.GetExtension(image.FileName).ToLower();
                            if (!allowedExtensions.Contains(extension))
                            {
                                ModelState.AddModelError("SurveyImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                continue; // 跳過無效的圖片
                            }

                            // 後端驗證圖片大小
                            if (image.Length > 5 * 1024 * 1024) // 5MB
                            {
                                ModelState.AddModelError("SurveyImageFiles", "圖片大小不得超過 5MB。");
                                continue; // 跳過超大圖片
                            }

                            // **從表單中取得對應的寬度和高度，使用 NewSurveyImageWidths 和 NewSurveyImageHeights**
                            int width = surveyVM.NewSurveyImageWidths != null && surveyVM.NewSurveyImageWidths.Count > i
                                ? surveyVM.NewSurveyImageWidths[i]
                                : 200;

                            int height = surveyVM.NewSurveyImageHeights != null && surveyVM.NewSurveyImageHeights.Count > i
                                ? surveyVM.NewSurveyImageHeights[i]
                                : 200;

                            // 使用 ImageService 儲存圖片
                            var imageUrl = _imageService.SaveImage(image, "survey"); // 儲存問卷圖片
                            if (imageUrl != null)
                            {
                                var questionImage = new QuestionImage
                                {
                                    SurveyId = surveyVM.Survey.Id, // 設置 SurveyId
                                    ImageUrl = imageUrl,
                                    Width = width,   // 儲存圖片寬度
                                    Height = height  // 儲存圖片高度
                                };
                                _unitOfWork.QuestionImage.Add(questionImage); // 新增圖片記錄
                            }
                        }
                    }
                }

                // **處理每個問題**
                for (int qIndex = 0; qIndex < surveyVM.QuestionVMs.Count; qIndex++)
                {
                    var questionVM = surveyVM.QuestionVMs[qIndex];
                    var question = questionVM.Question;

                    // 新增或更新問題
                    if (question.Id == 0)
                    {
                        question.SurveyId = surveyVM.Survey.Id;
                        _unitOfWork.Question.Add(question);
                        _unitOfWork.Save();  // 保存以生成問題的 ID
                    }
                    else
                    {
                        // 編輯問題
                        // 從資料庫中取得已存在的問題實體，避免追蹤衝突
                        var existingQuestion = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == question.Id);

                        if (existingQuestion != null)
                        {
                            // 更新現有問題實體的屬性
                            existingQuestion.QuestionText = question.QuestionText;
                            existingQuestion.AnswerType = question.AnswerType;
                            existingQuestion.MceHtml = question.MceHtml;
                            existingQuestion.CreateTime = question.CreateTime;
                            existingQuestion.Remark = question.Remark;


                            // 更新其他需要的屬性

                            // 更新實體
                            _unitOfWork.Question.Update(existingQuestion);
                            _unitOfWork.Save();
                        }
                    }

                    // **處理現有問題圖片的寬度和高度更新**
                    if (questionVM.ExistingQuestionImageIds != null && questionVM.ExistingQuestionImageIds.Count > 0)
                    {
                        for (int i = 0; i < questionVM.ExistingQuestionImageIds.Count; i++)
                        {
                            int imageId = questionVM.ExistingQuestionImageIds[i];
                            var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                            if (image != null)
                            {
                                image.Width = questionVM.ExistingQuestionImageWidths[i];
                                image.Height = questionVM.ExistingQuestionImageHeights[i];
                                _unitOfWork.QuestionImage.Update(image);
                            }
                        }
                        _unitOfWork.Save(); // 保存更改
                    }

                    // **處理新上傳的問題圖片，並處理寬度和高度**
                    if (questionVM.QuestionImageFiles != null && questionVM.QuestionImageFiles.Count > 0)
                    {
                        for (int i = 0; i < questionVM.QuestionImageFiles.Count; i++)
                        {
                            var image = questionVM.QuestionImageFiles[i];

                            if (image != null && image.Length > 0)
                            {
                                // 後端驗證圖片類型
                                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                var extension = Path.GetExtension(image.FileName).ToLower();
                                if (!allowedExtensions.Contains(extension))
                                {
                                    ModelState.AddModelError("QuestionImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                    continue; // 跳過無效的圖片
                                }

                                // 後端驗證圖片大小
                                if (image.Length > 5 * 1024 * 1024) // 5MB
                                {
                                    ModelState.AddModelError("QuestionImageFiles", "圖片大小不得超過 5MB。");
                                    continue; // 跳過超大圖片
                                }

                                // **從表單中取得對應的寬度和高度，使用 NewQuestionImageWidths 和 NewQuestionImageHeights**
                                int width = questionVM.NewQuestionImageWidths != null && questionVM.NewQuestionImageWidths.Count > i
                                    ? questionVM.NewQuestionImageWidths[i]
                                    : 190;

                                int height = questionVM.NewQuestionImageHeights != null && questionVM.NewQuestionImageHeights.Count > i
                                    ? questionVM.NewQuestionImageHeights[i]
                                    : 195;

                                // 使用 ImageService 儲存圖片
                                var imageUrl = _imageService.SaveImage(image, "question"); // 儲存問題圖片
                                if (imageUrl != null)
                                {
                                    var questionImage = new QuestionImage
                                    {
                                        QuestionId = question.Id, // 設置 QuestionId
                                        ImageUrl = imageUrl,
                                        Width = width,   // 儲存圖片寬度
                                        Height = height  // 儲存圖片高度
                                    };
                                    _unitOfWork.QuestionImage.Add(questionImage); // 新增問題圖片記錄
                                }
                            }
                        }
                    }

                    // **處理填空（FillInBlanks）**
                    if (questionVM.FillInBlanks != null && questionVM.FillInBlanks.Count > 0)
                    {
                        // 初始化填空編號
                        int blankNumber = 1;

                        foreach (var fillInBlankVM in questionVM.FillInBlanks)
                        {
                            if (fillInBlankVM.IsDeleted)
                            {
                                if (fillInBlankVM.Id > 0)
                                {
                                    // 使用 SoftDelete 方法進行軟刪除
                                    var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                                        f => f.Id == fillInBlankVM.Id,
                                        ignoreQueryFilters: true
                                    );

                                    if (existingFillInBlank != null)
                                    {

                                        _unitOfWork.FillInBlank.SoftDelete(existingFillInBlank);
                                        _unitOfWork.Save(); // 保存更改
                                    }
                                }
                                // 跳過後續處理
                                continue;
                            }

                            // 自動生成填空編號
                            fillInBlankVM.BlankNumber = blankNumber++;

                            // 設定填空所屬的問題 ID
                            fillInBlankVM.QuestionId = question.Id;

                            FillInBlank fillInBlank;

                            if (fillInBlankVM.Id == 0)
                            {
                                // 新增：將 FillInBlankVM 映射到 FillInBlank 實體
                                fillInBlank = new FillInBlank
                                {
                                    QuestionId = fillInBlankVM.QuestionId,
                                    RegexPattern = fillInBlankVM.RegexPattern,
                                    Length = fillInBlankVM.Length,
                                    Position = fillInBlankVM.Position,
                                    BlankNumber = fillInBlankVM.BlankNumber,
                                    Placeholder = fillInBlankVM.Placeholder
                                    // 根據需要添加其他屬性
                                };
                                _unitOfWork.FillInBlank.Add(fillInBlank);
                            }
                            else
                            {
                                // 編輯填空
                                // 從資料庫中取得已存在的填空實體
                                var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == fillInBlankVM.Id, ignoreQueryFilters: true);

                                if (existingFillInBlank != null)
                                {
                                    // 更新現有填空實體的屬性
                                    existingFillInBlank.RegexPattern = fillInBlankVM.RegexPattern;
                                    existingFillInBlank.Length = fillInBlankVM.Length;
                                    existingFillInBlank.Position = fillInBlankVM.Position;
                                    existingFillInBlank.BlankNumber = fillInBlankVM.BlankNumber;
                                    existingFillInBlank.Placeholder = fillInBlankVM.Placeholder;
                                    // 更新其他需要的屬性

                                    // 更新實體
                                    _unitOfWork.FillInBlank.Update(existingFillInBlank);
                                    _unitOfWork.Save(); // 如果需要，可以在外面統一 Save()
                                }
                            }
                        }
                        // _unitOfWork.Save(); // 保存填空的更改
                    }


                    // **處理每個選項及其圖片**
                    for (int oIndex = 0; oIndex < questionVM.QuestionOptionVMs.Count; oIndex++)
                    {
                        var optionVM = questionVM.QuestionOptionVMs[oIndex];
                        var option = optionVM.QuestionOption;
                        option.QuestionId = question.Id;

                        // 新增或更新選項
                        if (option.Id == 0)
                        {
                            _unitOfWork.QuestionOption.Add(option); // 新增選項
                            _unitOfWork.Save(); // 保存以生成選項的 ID
                        }
                        else
                        {
                            // 編輯選項
                            // 從資料庫中取得已存在的選項實體，避免追蹤衝突
                            var existingOption = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == option.Id, ignoreQueryFilters: true);

                            if (existingOption != null)
                            {
                                // 更新現有選項實體的屬性
                                existingOption.OptionText = option.OptionText;
                                existingOption.IsCorrect = option.IsCorrect;
                                existingOption.IsOther = option.IsOther;
                                existingOption.SortOrder = option.SortOrder;
                                existingOption.Description = option.Description;
                                // 更新其他需要的屬性

                                // 更新實體
                                _unitOfWork.QuestionOption.Update(existingOption);
                                _unitOfWork.Save();
                            }
                        }

                        // **處理現有選項圖片的寬度和高度更新**
                        if (optionVM.ExistingOptionImageIds != null && optionVM.ExistingOptionImageIds.Count > 0)
                        {
                            for (int i = 0; i < optionVM.ExistingOptionImageIds.Count; i++)
                            {
                                int imageId = optionVM.ExistingOptionImageIds[i];
                                var image = _unitOfWork.QuestionImage.GetFirstOrDefault(qi => qi.Id == imageId);
                                if (image != null)
                                {
                                    image.Width = optionVM.ExistingOptionImageWidths[i];
                                    image.Height = optionVM.ExistingOptionImageHeights[i];
                                    _unitOfWork.QuestionImage.Update(image);
                                }
                            }
                            _unitOfWork.Save(); // 保存更改
                        }



                        // **處理新上傳的選項圖片，並處理寬度和高度**
                        if (optionVM.OptionImageFiles != null && optionVM.OptionImageFiles.Count > 0)
                        {
                            for (int i = 0; i < optionVM.OptionImageFiles.Count; i++)
                            {
                                var image = optionVM.OptionImageFiles[i];

                                if (image != null && image.Length > 0)
                                {
                                    // 後端驗證圖片類型
                                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                                    var extension = Path.GetExtension(image.FileName).ToLower();
                                    if (!allowedExtensions.Contains(extension))
                                    {
                                        ModelState.AddModelError("OptionImageFiles", "僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。");
                                        continue; // 跳過無效的圖片
                                    }

                                    // 後端驗證圖片大小
                                    if (image.Length > 5 * 1024 * 1024) // 5MB
                                    {
                                        ModelState.AddModelError("OptionImageFiles", "圖片大小不得超過 5MB。");
                                        continue; // 跳過超大圖片
                                    }

                                    // **從表單中取得對應的寬度和高度，使用 NewOptionImageWidths 和 NewOptionImageHeights**
                                    int width = optionVM.NewOptionImageWidths != null && optionVM.NewOptionImageWidths.Count > i
                                        ? optionVM.NewOptionImageWidths[i]
                                        : 180;

                                    int height = optionVM.NewOptionImageHeights != null && optionVM.NewOptionImageHeights.Count > i
                                        ? optionVM.NewOptionImageHeights[i]
                                        : 185;

                                    // 使用 ImageService 儲存圖片
                                    var imageUrl = _imageService.SaveImage(image, "option"); // 儲存選項圖片
                                    if (imageUrl != null)
                                    {
                                        var optionImage = new QuestionImage
                                        {
                                            QuestionOptionId = option.Id, // 設置 QuestionOptionId
                                            ImageUrl = imageUrl,
                                            Width = width,   // 儲存圖片寬度
                                            Height = height  // 儲存圖片高度
                                        };
                                        _unitOfWork.QuestionImage.Add(optionImage); // 新增選項圖片記錄
                                    }
                                }
                            }
                        }

                        // **處理填空（FillInBlanks）**
                        if (optionVM.FillInBlanks != null && optionVM.FillInBlanks.Count > 0)
                        {
                            // 初始化填空編號
                            int blankNumber = 1;

                            foreach (var fillInBlankVM in optionVM.FillInBlanks)
                            {

                                if (fillInBlankVM.IsDeleted)
                                {
                                    if (fillInBlankVM.Id > 0)
                                    {
                                        // 使用 SoftDelete 方法進行軟刪除
                                        var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                                            f => f.Id == fillInBlankVM.Id,
                                            ignoreQueryFilters: true
                                        );

                                        if (existingFillInBlank != null)
                                        {
                                            _unitOfWork.FillInBlank.SoftDelete(existingFillInBlank);
                                            _unitOfWork.Save(); // 保存更改
                                        }
                                    }
                                    // 跳過後續處理
                                    continue;
                                }


                                // 自動生成填空編號
                                fillInBlankVM.BlankNumber = blankNumber++;

                                // 設定填空所屬的選項 ID
                                fillInBlankVM.QuestionOptionId = option.Id;


                                FillInBlank fillInBlank;

                                if (fillInBlankVM.Id == 0)
                                {
                                    // 新增：將 FillInBlankVM 映射到 FillInBlank 實體
                                    fillInBlank = new FillInBlank
                                    {
                                        QuestionOptionId = fillInBlankVM.QuestionOptionId,
                                        RegexPattern = fillInBlankVM.RegexPattern,
                                        Length = fillInBlankVM.Length,
                                        Position = fillInBlankVM.Position,
                                        BlankNumber = fillInBlankVM.BlankNumber,
                                        Placeholder = fillInBlankVM.Placeholder // 新增這一行
                                        // 根據需要添加其他屬性
                                    };
                                    _unitOfWork.FillInBlank.Add(fillInBlank);
                                }
                                else
                                {
                                    // 編輯填空
                                    // 從資料庫中取得已存在的填空實體
                                    var existingFillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == fillInBlankVM.Id, ignoreQueryFilters: true);

                                    if (existingFillInBlank != null)
                                    {
                                        // 更新現有填空實體的屬性
                                        existingFillInBlank.RegexPattern = fillInBlankVM.RegexPattern;
                                        existingFillInBlank.Length = fillInBlankVM.Length;
                                        existingFillInBlank.Position = fillInBlankVM.Position;
                                        existingFillInBlank.BlankNumber = fillInBlankVM.BlankNumber;
                                        existingFillInBlank.Placeholder = fillInBlankVM.Placeholder;
                                        // 更新其他需要的屬性

                                        // 更新實體
                                        _unitOfWork.FillInBlank.Update(existingFillInBlank);
                                        _unitOfWork.Save(); // 如果需要，可以在外面統一 Save()
                                    }
                                }
                            }
                            // _unitOfWork.Save(); // 保存填空的更改
                        }
                    }
                }


                // 將錯誤訊息存入 TempData
                //TempData["ERROR"] = string.Join("<br/>", errorMessages);



                // 儲存所有更改
                _unitOfWork.Save();
                TempData["success"] = surveyVM.Survey.Id == 0 ? "問卷新增成功!" : "問卷編輯成功!";

                // 判斷是否為多筆模式
                if (!string.IsNullOrEmpty(AllIds) && CurrentIndex.HasValue)
                {
                    var idArray = AllIds.Split(',').Select(int.Parse).ToList();
                    int nextIndex = CurrentIndex.Value + 1;
                    if (nextIndex < idArray.Count)
                    {
                        // 還有下一筆要處理，重導向至下一筆 Upsert
                        int nextId = idArray[nextIndex];
                        return RedirectToAction("Upsert", new { id = nextId, allIds = AllIds, currentIndex = nextIndex });
                    }
                    else
                    {
                        // 全部處理完畢，返回 Index
                        return RedirectToAction("Index");
                    }
                }
                else
                {
                    // 單筆模式，返回 Index
                    //return RedirectToAction("Index");
                    return RedirectToAction("Upsert", new { id = surveyVM.Survey.Id });
                    // return RedirectToAction(nameof(Index)); // 保存後重定向到問卷列表頁面
                }


            }


            // 如果表單驗證失敗，收集錯誤訊息
            foreach (var state in ModelState)
            {
                foreach (var error in state.Value.Errors)
                {
                    errorMessages.Add($"欄位 '{state.Key}': {error.ErrorMessage}");
                }
            }

            // 將錯誤訊息存入 TempData
           // TempData["ERROR"] = string.Join("<br/>", errorMessages);




            // 如果表單驗證失敗，重新加載站別與分類下拉選單數據
            surveyVM.StationList = _unitOfWork.Station.GetAll().Select(s => new SelectListItem { Text = s.Name, Value = s.Id.ToString() });
            surveyVM.CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem { Text = c.Name, Value = c.Id.ToString() });
            surveyVM.QuestionTypeList = GetQuestionTypeList();
            return View(surveyVM); // 返回帶有錯誤提示的視圖
        }

        // 新增 BeginRefresh Action
        [HttpGet]
        public IActionResult BeginRefresh()
        {

            // 設定 TempData 顯示「資料重整中」
            TempData["success"] = "資料重整中";

            // 從資料庫取得所有問卷 ID
            var allIds = _unitOfWork.Survey.GetAll().Select(s => s.Id).ToList();
            if (allIds.Count == 0)
            {
                TempData["error"] = "目前沒有可重整的問卷";
                return RedirectToAction("Index");
            }

            // 將 ID 列表串成字串 (以逗號分隔)
            var idListString = string.Join(",", allIds);

            // 重導至 Upsert 第一筆問卷，並帶上 allIds 與 currentIndex=0
            return RedirectToAction("Upsert", new { id = allIds[0], allIds = idListString, currentIndex = 0 });
        }



        [HttpPost]
        public IActionResult UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return Json(new { success = false, message = "未收到任何檔案。" });

            // 設定圖片儲存的資料夾路徑，根據需求調整 category
            string category = "survey"; // 或其他分類，如 "question", "option"
            var imageFolder = Path.Combine(_hostEnvironment.WebRootPath, "images", category);

            // 確保資料夾存在
            if (!Directory.Exists(imageFolder))
            {
                Directory.CreateDirectory(imageFolder);
            }

            // 生成唯一的圖片名稱
            var imageName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var imagePath = Path.Combine(imageFolder, imageName);

            try
            {
                // 儲存圖片到指定路徑
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    image.CopyTo(stream);
                }

                // 回傳圖片的 URL
                var imageUrl = Url.Content(Path.Combine("/images", category, imageName));
                return Json(new { success = true, imageUrl = imageUrl });
            }
            catch (Exception ex)
            {
                // 處理錯誤
                return Json(new { success = false, message = "圖片上傳失敗。" });
            }
        }


        /// <summary>
        /// 刪除圖片的功能 (AJAX)
        /// </summary>
        /// <param name="id">圖片的 ID</param>
        /// <returns>JSON 結果表示刪除是否成功</returns>
        [HttpPost]
        public IActionResult RemoveImage(int id)
        {
            var image = _unitOfWork.QuestionImage.GetFirstOrDefault(i => i.Id == id);
            if (image != null)
            {
                // 檢查圖片檔案是否存在
                var filePath = Path.Combine(_hostEnvironment.WebRootPath, image.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    // 使用 ImageService 刪除圖片文件
                    if (!_imageService.DeleteImage(image.ImageUrl))
                    {
                        return Json(new { success = false, message = "圖片刪除失敗" });
                    }
                }
                else
                {
                    // 圖片檔案不存在，也刪除資料庫中的記錄
                    _unitOfWork.QuestionImage.Remove(image);
                    _unitOfWork.Save();
                    // 如果圖片文件不存在，也允許刪除資料庫中的記錄
                    return Json(new { success = true, message = "圖片刪除成功" });
                }

                // 刪除數據庫中的圖片記錄
                _unitOfWork.QuestionImage.Remove(image);
                _unitOfWork.Save();
                return Json(new { success = true, message = "圖片刪除成功" });
            }
            return Json(new { success = false, message = "圖片刪除失敗" });
        }


        /// <summary>
        /// 刪除問題的邏輯 (AJAX)
        /// </summary>
        /// <param name="id">問題的 ID</param>
        /// <returns>JSON 結果表示刪除是否成功</returns>
        [HttpPost]
        public IActionResult RemoveQuestion(int id)
        {
            var question = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == id);
            if (question != null)
            {
                // 刪除問題相關的圖片
                var questionImages = _unitOfWork.QuestionImage.GetAll(qi => qi.QuestionId == id).ToList();
                foreach (var image in questionImages)
                {
                    _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                    _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
                }

                // 刪除問題選項及其相關圖片
                var options = _unitOfWork.QuestionOption.GetAll(o => o.QuestionId == id).ToList();
                foreach (var option in options)
                {
                    // 刪除選項相關的圖片
                    var optionImages = _unitOfWork.QuestionImage.GetAll(qi => qi.QuestionOptionId == option.Id).ToList();
                    foreach (var image in optionImages)
                    {
                        _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                        _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
                    }

                    _unitOfWork.QuestionOption.Remove(option); // 刪除選項
                }

                // 刪除問題
                _unitOfWork.Question.Remove(question);
                _unitOfWork.Save();
                return Json(new { success = true, message = "問題刪除成功" });
            }
            return Json(new { success = false, message = "問題刪除失敗" });
        }


        /// <summary>
        /// 刪除選項的邏輯 (AJAX)
        /// </summary>
        /// <param name="id">選項的 ID</param>
        /// <returns>JSON 結果表示刪除是否成功</returns>
        [HttpPost]
        public IActionResult RemoveOption(int id)
        {
            var option = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == id);
            if (option != null)
            {
                // 刪除選項相關的圖片
                var optionImages = _unitOfWork.QuestionImage.GetAll(qi => qi.QuestionOptionId == option.Id).ToList();
                foreach (var image in optionImages)
                {
                    _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                    _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
                }

                _unitOfWork.QuestionOption.Remove(option); // 刪除選項
                _unitOfWork.Save(); // 保存更改
                return Json(new { success = true, message = "選項刪除成功" });
            }

            return Json(new { success = false, message = "選項刪除失敗" });
        }


        /// <summary>
        /// 動態生成問題類型的下拉選單
        /// </summary>
        /// <returns>問題類型的下拉選單列表</returns>
        private List<SelectListItem> GetQuestionTypeList()
        {
            var enumValues = Enum.GetValues(typeof(AnswerTypeEnum)).Cast<AnswerTypeEnum>();
            return enumValues.Select(e => new SelectListItem
            {
                Text = GetEnumDisplayName(e),
                Value = ((int)e).ToString()
            }).ToList();
        }

        /// <summary>
        /// 輔助方法：取得枚舉的 Display 名稱
        /// </summary>
        /// <param name="enumValue">枚舉值</param>
        /// <returns>枚舉的顯示名稱</returns>
        private string GetEnumDisplayName(Enum enumValue)
        {
            var displayAttribute = enumValue.GetType().GetField(enumValue.ToString())
                .GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault() as DisplayAttribute;

            return displayAttribute?.Name ?? enumValue.ToString();
        }


        /// <summary>
        /// 切換問卷的發佈狀態 (AJAX)
        /// </summary>
        /// <param name="id">問卷的 ID</param>
        /// <returns>JSON 結果表示切換是否成功</returns>
        [HttpPost]
        public IActionResult TogglePublish(int id)
        {
            var survey = _unitOfWork.Survey.Get(s => s.Id == id); // 根據 ID 查詢問卷
            if (survey == null)
            {
                return Json(new { success = false, message = "問卷未找到" });
            }

            // 切換發佈狀態
            survey.IsPublished = !survey.IsPublished;

            // 如果發佈，更新完成時間；如果取消發佈，清空完成時間
            survey.CompleteTime = survey.IsPublished ? DateTime.Now : null;

            _unitOfWork.Survey.Update(survey); // 更新問卷狀態
            _unitOfWork.Save(); // 儲存更改
            return Json(new { success = true, message = "狀態已更新" });
        }


        /// <summary>
        /// 刪除問卷及其相關資料的邏輯 (AJAX)
        /// </summary>
        /// <param name="id">問卷的 ID</param>
        /// <returns>JSON 結果表示刪除是否成功</returns>
        [HttpDelete]
        public IActionResult Delete(int? id)
        {
            var survey = _unitOfWork.Survey.Get(s => s.Id == id, includeProperties: "Questions.QuestionOptions.QuestionImages");
            if (survey == null)
            {
                return Json(new { success = false, message = "刪除失敗" });
            }

            // 手動刪除與 SurveyId 相關的圖片
            var surveyImages = _unitOfWork.QuestionImage.GetAll(qi => qi.SurveyId == id && qi.QuestionId == null && qi.QuestionOptionId == null).ToList();
            foreach (var image in surveyImages)
            {
                _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
            }

            // 手動刪除問題和選項相關的圖片
            foreach (var question in survey.Questions)
            {
                // 刪除問題圖片
                foreach (var image in question.QuestionImages)
                {
                    _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                    _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
                }

                // 刪除每個問題選項相關的圖片
                foreach (var option in question.QuestionOptions)
                {
                    foreach (var image in option.QuestionImages)
                    {
                        _imageService.DeleteImage(image.ImageUrl); // 使用 ImageService 刪除圖片文件
                        _unitOfWork.QuestionImage.Remove(image); // 刪除數據庫中的圖片記錄
                    }
                }
            }

            // 刪除問卷及其關聯的問題
            _unitOfWork.Survey.Remove(survey);
            _unitOfWork.Save(); // 保存所有刪除操作

            return Json(new { success = true, message = "問卷及相關圖片刪除成功" });
        }

        /// <summary>
        /// 取得所有問卷資料並轉為 JSON 格式，用於前端 DataTable 顯示
        /// </summary>
        /// <returns>JSON 格式的問卷資料</returns>
        [HttpGet]
        public IActionResult GetAll()
        {
            var surveyList = _unitOfWork.Survey.GetAll(includeProperties: "ApplicationUser,Category");
            var surveyDTOList = _mapper.Map<IEnumerable<SurveyDTO>>(surveyList);

            // 調試輸出
            foreach (var survey in surveyDTOList)
            {
                Console.WriteLine($"Survey ID: {survey.Id}, CategoryName: {survey.CategoryName}");
            }

            return Json(new { data = surveyDTOList });
        }


        /*
        /// <summary>
        /// 匯出所有相關資料表到 Excel，包含空表格
        /// </summary>
        /// <returns>Excel 檔案下載</returns>
        public IActionResult ExportToExcel()
        {
            var surveys = _unitOfWork.Survey.GetAll(includeProperties: "ApplicationUser,Questions.QuestionOptions,Questions.QuestionImages,QuestionImages", ignoreQueryFilters: true).ToList();
            var questions = _unitOfWork.Question.GetAll().ToList();
            var questionOptions = _unitOfWork.QuestionOption.GetAll().ToList();
            var questionImages = _unitOfWork.QuestionImage.GetAll().ToList();
            const int maxCellLength = 32767;

            using (var workbook = new XLWorkbook())
            {
                // 1. Surveys 工作表
                var surveysSheet = workbook.Worksheets.Add("Surveys");
                surveysSheet.Cell(1, 1).Value = "問卷ID";
                surveysSheet.Cell(1, 2).Value = "建立人ID";
                surveysSheet.Cell(1, 3).Value = "建立人姓名";
                surveysSheet.Cell(1, 4).Value = "建立人工號";
                surveysSheet.Cell(1, 5).Value = "類別名稱";
                surveysSheet.Cell(1, 6).Value = "標題";
                surveysSheet.Cell(1, 7).Value = "描述";
                surveysSheet.Cell(1, 8).Value = "站別名稱";
                surveysSheet.Cell(1, 9).Value = "問題數量";
                surveysSheet.Cell(1, 10).Value = "是否發布";
                surveysSheet.Cell(1, 11).Value = "完成時間";
                surveysSheet.Cell(1, 12).Value = "TinyMCE HTML";
                surveysSheet.Cell(1, 13).Value = "建立時間";
                surveysSheet.Cell(1, 14).Value = "完成時間";
                surveysSheet.Cell(1, 15).Value = "備註";

                for (int i = 0; i < surveys.Count; i++)
                {
                    var survey = surveys[i];
                    string truncatedMceHtml = survey.MceHtml?.Length > maxCellLength ? survey.MceHtml.Substring(0, maxCellLength) : survey.MceHtml;

                    surveysSheet.Cell(i + 2, 1).Value = survey.Id;
                    surveysSheet.Cell(i + 2, 2).Value = survey.ApplicationUserId;
                    surveysSheet.Cell(i + 2, 3).Value = survey.ApplicationUser?.Name;
                    surveysSheet.Cell(i + 2, 4).Value = survey.JobNum;
                    surveysSheet.Cell(i + 2, 5).Value = survey.CategoryName;
                    surveysSheet.Cell(i + 2, 6).Value = survey.Title;
                    surveysSheet.Cell(i + 2, 7).Value = survey.Description;
                    surveysSheet.Cell(i + 2, 8).Value = survey.StationName;
                    surveysSheet.Cell(i + 2, 9).Value = survey.QuestionNum;
                    surveysSheet.Cell(i + 2, 10).Value = survey.IsPublished ? "是" : "否";
                    surveysSheet.Cell(i + 2, 11).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "未完成";
                    surveysSheet.Cell(i + 2, 12).Value = truncatedMceHtml;
                    surveysSheet.Cell(i + 2, 13).Value = survey.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, 14).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, 15).Value = survey.Remark;
                }

                // 如果沒有資料，填入「無資料」
                if (surveys.Count == 0)
                {
                    surveysSheet.Cell(2, 1).Value = "無資料";
                }

                // 2. Questions 工作表
                var questionsSheet = workbook.Worksheets.Add("Questions");
                questionsSheet.Cell(1, 1).Value = "問題ID";
                questionsSheet.Cell(1, 2).Value = "問卷ID";
                questionsSheet.Cell(1, 3).Value = "問題描述";
                questionsSheet.Cell(1, 4).Value = "答案類型";
                questionsSheet.Cell(1, 5).Value = "TinyMCE HTML";
                questionsSheet.Cell(1, 6).Value = "建立時間";
                questionsSheet.Cell(1, 7).Value = "備註";

                for (int i = 0; i < questions.Count; i++)
                {
                    var question = questions[i];
                    string truncatedQuestionMceHtml = question.MceHtml?.Length > maxCellLength ? question.MceHtml.Substring(0, maxCellLength) : question.MceHtml;

                    questionsSheet.Cell(i + 2, 1).Value = question.Id;
                    questionsSheet.Cell(i + 2, 2).Value = question.SurveyId;
                    questionsSheet.Cell(i + 2, 3).Value = question.QuestionText;
                    questionsSheet.Cell(i + 2, 4).Value = question.AnswerType.ToString();
                    questionsSheet.Cell(i + 2, 5).Value = truncatedQuestionMceHtml;
                    questionsSheet.Cell(i + 2, 6).Value = question.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    questionsSheet.Cell(i + 2, 7).Value = question.Remark;
                }

                // 如果沒有資料，填入「無資料」
                if (questions.Count == 0)
                {
                    questionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 3. QuestionOptions 工作表
                var optionsSheet = workbook.Worksheets.Add("QuestionOptions");
                optionsSheet.Cell(1, 1).Value = "選項ID";
                optionsSheet.Cell(1, 2).Value = "問題ID";
                optionsSheet.Cell(1, 3).Value = "選項描述";
                optionsSheet.Cell(1, 4).Value = "是否正確答案";
                optionsSheet.Cell(1, 5).Value = "是否為其他選項";
                optionsSheet.Cell(1, 6).Value = "排序順序";
                optionsSheet.Cell(1, 7).Value = "描述";               

                for (int i = 0; i < questionOptions.Count; i++)
                {
                    var option = questionOptions[i];
                    optionsSheet.Cell(i + 2, 1).Value = option.Id;
                    optionsSheet.Cell(i + 2, 2).Value = option.QuestionId;
                    optionsSheet.Cell(i + 2, 3).Value = option.OptionText;
                    optionsSheet.Cell(i + 2, 4).Value = option.IsCorrect ? "是" : "否";
                    optionsSheet.Cell(i + 2, 5).Value = option.IsOther ? "是" : "否";
                    optionsSheet.Cell(i + 2, 6).Value = option.SortOrder;
                    optionsSheet.Cell(i + 2, 7).Value = option.Description;                 
                }

                // 如果沒有資料，填入「無資料」
                if (questionOptions.Count == 0)
                {
                    optionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 4. QuestionImages 工作表
                var imagesSheet = workbook.Worksheets.Add("QuestionImages");
                imagesSheet.Cell(1, 1).Value = "圖片ID";
                imagesSheet.Cell(1, 2).Value = "問卷ID";
                imagesSheet.Cell(1, 3).Value = "問題ID";
                imagesSheet.Cell(1, 4).Value = "選項ID";
                imagesSheet.Cell(1, 5).Value = "圖片URL";
                imagesSheet.Cell(1, 6).Value = "替代文字";
                imagesSheet.Cell(1, 7).Value = "上傳時間";
                imagesSheet.Cell(1, 8).Value = "排序順序";               

                for (int i = 0; i < questionImages.Count; i++)
                {
                    var image = questionImages[i];
                    imagesSheet.Cell(i + 2, 1).Value = image.Id;
                    imagesSheet.Cell(i + 2, 2).Value = image.SurveyId;
                    imagesSheet.Cell(i + 2, 3).Value = image.QuestionId;
                    imagesSheet.Cell(i + 2, 4).Value = image.QuestionOptionId;
                    imagesSheet.Cell(i + 2, 5).Value = image.ImageUrl;
                    imagesSheet.Cell(i + 2, 6).Value = image.AltText;
                    imagesSheet.Cell(i + 2, 7).Value = image.UploadTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    imagesSheet.Cell(i + 2, 8).Value = image.SortOrder;                  
                }

                // 如果沒有資料，填入「無資料」
                if (questionImages.Count == 0)
                {
                    imagesSheet.Cell(2, 1).Value = "無資料";
                }

                // 設定欄寬自動調整
                foreach (var sheet in workbook.Worksheets)
                {
                    sheet.Columns().AdjustToContents();
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SurveyData.xlsx");
                }
            }
        }
        */

        /// <summary>
        /// 匯出舊格式所有相關資料表到 Excel，包含空表格
        /// </summary>
        /// <returns>Excel 檔案下載</returns>
        public IActionResult ExportToExcelOldFormat()
        {
            var surveys = _unitOfWork.Survey.GetAll(includeProperties: "ApplicationUser,Questions.QuestionOptions,Questions.QuestionImages,QuestionImages", ignoreQueryFilters: true).ToList();
            var questions = _unitOfWork.Question.GetAll().ToList();
            var questionOptions = _unitOfWork.QuestionOption.GetAll().ToList();
            var questionImages = _unitOfWork.QuestionImage.GetAll().ToList();
            const int maxCellLength = 32767;

            using (var workbook = new XLWorkbook())
            {
                // 1. Surveys 工作表
                var surveysSheet = workbook.Worksheets.Add("Surveys");
                surveysSheet.Cell(1, 1).Value = "問卷ID";
                surveysSheet.Cell(1, 2).Value = "建立人ID";
                surveysSheet.Cell(1, 3).Value = "建立人姓名";
                surveysSheet.Cell(1, 4).Value = "建立人工號";
                surveysSheet.Cell(1, 5).Value = "類別名稱";
                surveysSheet.Cell(1, 6).Value = "標題";
                surveysSheet.Cell(1, 7).Value = "描述";
                surveysSheet.Cell(1, 8).Value = "站別名稱";
                surveysSheet.Cell(1, 9).Value = "問題數量";
                surveysSheet.Cell(1, 10).Value = "是否發布";
                surveysSheet.Cell(1, 11).Value = "完成時間";
                surveysSheet.Cell(1, 12).Value = "TinyMCE HTML";
                surveysSheet.Cell(1, 13).Value = "建立時間";
                surveysSheet.Cell(1, 14).Value = "完成時間";
                surveysSheet.Cell(1, 15).Value = "備註";

                for (int i = 0; i < surveys.Count; i++)
                {
                    var survey = surveys[i];
                    string truncatedMceHtml = survey.MceHtml?.Length > maxCellLength ? survey.MceHtml.Substring(0, maxCellLength) : survey.MceHtml;

                    surveysSheet.Cell(i + 2, 1).Value = survey.Id;
                    surveysSheet.Cell(i + 2, 2).Value = survey.ApplicationUserId;
                    surveysSheet.Cell(i + 2, 3).Value = survey.ApplicationUser?.Name;
                    surveysSheet.Cell(i + 2, 4).Value = survey.JobNum;
                    surveysSheet.Cell(i + 2, 5).Value = survey.CategoryName;
                    surveysSheet.Cell(i + 2, 6).Value = survey.Title;
                    surveysSheet.Cell(i + 2, 7).Value = survey.Description;
                    surveysSheet.Cell(i + 2, 8).Value = survey.StationName;
                    surveysSheet.Cell(i + 2, 9).Value = survey.QuestionNum;
                    surveysSheet.Cell(i + 2, 10).Value = survey.IsPublished ? "是" : "否";
                    surveysSheet.Cell(i + 2, 11).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "未完成";
                    surveysSheet.Cell(i + 2, 12).Value = truncatedMceHtml;
                    surveysSheet.Cell(i + 2, 13).Value = survey.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, 14).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, 15).Value = survey.Remark;
                }

                // 如果沒有資料，填入「無資料」
                if (surveys.Count == 0)
                {
                    surveysSheet.Cell(2, 1).Value = "無資料";
                }

                // 2. Questions 工作表
                var questionsSheet = workbook.Worksheets.Add("Questions");
                questionsSheet.Cell(1, 1).Value = "問題ID";
                questionsSheet.Cell(1, 2).Value = "問卷ID";
                questionsSheet.Cell(1, 3).Value = "問題描述";
                questionsSheet.Cell(1, 4).Value = "答案類型";
                questionsSheet.Cell(1, 5).Value = "TinyMCE HTML";
                questionsSheet.Cell(1, 6).Value = "建立時間";
                questionsSheet.Cell(1, 7).Value = "備註";

                for (int i = 0; i < questions.Count; i++)
                {
                    var question = questions[i];
                    string truncatedQuestionMceHtml = question.MceHtml?.Length > maxCellLength ? question.MceHtml.Substring(0, maxCellLength) : question.MceHtml;

                    questionsSheet.Cell(i + 2, 1).Value = question.Id;
                    questionsSheet.Cell(i + 2, 2).Value = question.SurveyId;
                    questionsSheet.Cell(i + 2, 3).Value = question.QuestionText;
                    questionsSheet.Cell(i + 2, 4).Value = question.AnswerType.ToString();
                    questionsSheet.Cell(i + 2, 5).Value = truncatedQuestionMceHtml;
                    questionsSheet.Cell(i + 2, 6).Value = question.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    questionsSheet.Cell(i + 2, 7).Value = question.Remark;
                }

                // 如果沒有資料，填入「無資料」
                if (questions.Count == 0)
                {
                    questionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 3. QuestionOptions 工作表
                var optionsSheet = workbook.Worksheets.Add("QuestionOptions");
                optionsSheet.Cell(1, 1).Value = "選項ID";
                optionsSheet.Cell(1, 2).Value = "問題ID";
                optionsSheet.Cell(1, 3).Value = "選項描述";
                optionsSheet.Cell(1, 4).Value = "是否正確答案";
                optionsSheet.Cell(1, 5).Value = "是否為其他選項";
                optionsSheet.Cell(1, 6).Value = "排序順序";
                optionsSheet.Cell(1, 7).Value = "描述";

                for (int i = 0; i < questionOptions.Count; i++)
                {
                    var option = questionOptions[i];
                    optionsSheet.Cell(i + 2, 1).Value = option.Id;
                    optionsSheet.Cell(i + 2, 2).Value = option.QuestionId;
                    optionsSheet.Cell(i + 2, 3).Value = option.OptionText;
                    optionsSheet.Cell(i + 2, 4).Value = option.IsCorrect ? "是" : "否";
                    optionsSheet.Cell(i + 2, 5).Value = option.IsOther ? "是" : "否";
                    optionsSheet.Cell(i + 2, 6).Value = option.SortOrder;
                    optionsSheet.Cell(i + 2, 7).Value = option.Description;
                }

                // 如果沒有資料，填入「無資料」
                if (questionOptions.Count == 0)
                {
                    optionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 4. QuestionImages 工作表
                var imagesSheet = workbook.Worksheets.Add("QuestionImages");
                imagesSheet.Cell(1, 1).Value = "圖片ID";
                imagesSheet.Cell(1, 2).Value = "問卷ID";
                imagesSheet.Cell(1, 3).Value = "問題ID";
                imagesSheet.Cell(1, 4).Value = "選項ID";
                imagesSheet.Cell(1, 5).Value = "圖片URL";
                imagesSheet.Cell(1, 6).Value = "替代文字";
                imagesSheet.Cell(1, 7).Value = "上傳時間";
                imagesSheet.Cell(1, 8).Value = "排序順序";

                for (int i = 0; i < questionImages.Count; i++)
                {
                    var image = questionImages[i];
                    imagesSheet.Cell(i + 2, 1).Value = image.Id;
                    imagesSheet.Cell(i + 2, 2).Value = image.SurveyId;
                    imagesSheet.Cell(i + 2, 3).Value = image.QuestionId;
                    imagesSheet.Cell(i + 2, 4).Value = image.QuestionOptionId;
                    imagesSheet.Cell(i + 2, 5).Value = image.ImageUrl;
                    imagesSheet.Cell(i + 2, 6).Value = image.AltText;
                    imagesSheet.Cell(i + 2, 7).Value = image.UploadTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    imagesSheet.Cell(i + 2, 8).Value = image.SortOrder;
                }

                // 如果沒有資料，填入「無資料」
                if (questionImages.Count == 0)
                {
                    imagesSheet.Cell(2, 1).Value = "無資料";
                }

                // 設定欄寬自動調整
                foreach (var sheet in workbook.Worksheets)
                {
                    sheet.Columns().AdjustToContents();
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SurveyData.xlsx");
                }
            }
        }

        /*
        /// <summary>
        /// 匯出新格式的問卷資料到 Excel
        /// 新增 SortOrder、IsDeleted、DeletedAt 欄位
        /// </summary>
        public IActionResult ExportToExcelNewFormat()
        {
            var surveys = _unitOfWork.Survey.GetAll(ignoreQueryFilters: true, includeProperties: "ApplicationUser,Category").ToList();

            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var surveysSheet = workbook.Worksheets.Add("Surveys_NewFormat");
                surveysSheet.Cell(1, 1).Value = "問卷ID";
                surveysSheet.Cell(1, 2).Value = "建立人ID";
                surveysSheet.Cell(1, 3).Value = "建立人姓名";
                surveysSheet.Cell(1, 4).Value = "建立人工號";
                surveysSheet.Cell(1, 5).Value = "類別名稱";
                surveysSheet.Cell(1, 6).Value = "標題";
                surveysSheet.Cell(1, 7).Value = "描述";
                surveysSheet.Cell(1, 8).Value = "站別名稱";
                surveysSheet.Cell(1, 9).Value = "問題數量";
                surveysSheet.Cell(1, 10).Value = "是否發布";
                surveysSheet.Cell(1, 11).Value = "完成時間";
                surveysSheet.Cell(1, 12).Value = "TinyMCE HTML";
                surveysSheet.Cell(1, 13).Value = "建立時間";
                surveysSheet.Cell(1, 14).Value = "完成時間";
                surveysSheet.Cell(1, 15).Value = "備註";
                // 新增的三個欄位
                surveysSheet.Cell(1, 16).Value = "SortOrder";
                surveysSheet.Cell(1, 17).Value = "IsDeleted";
                surveysSheet.Cell(1, 18).Value = "DeletedAt";

                for (int i = 0; i < surveys.Count; i++)
                {
                    var survey = surveys[i];
                    surveysSheet.Cell(i + 2, 1).Value = survey.Id;
                    surveysSheet.Cell(i + 2, 2).Value = survey.ApplicationUserId;
                    surveysSheet.Cell(i + 2, 3).Value = survey.ApplicationUser?.Name;
                    surveysSheet.Cell(i + 2, 4).Value = survey.JobNum;
                    surveysSheet.Cell(i + 2, 5).Value = survey.Category?.Name;
                    surveysSheet.Cell(i + 2, 6).Value = survey.Title;
                    surveysSheet.Cell(i + 2, 7).Value = survey.Description;
                    surveysSheet.Cell(i + 2, 8).Value = survey.StationName;
                    surveysSheet.Cell(i + 2, 9).Value = survey.QuestionNum;
                    surveysSheet.Cell(i + 2, 10).Value = survey.IsPublished ? "是" : "否";
                    surveysSheet.Cell(i + 2, 11).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
                    surveysSheet.Cell(i + 2, 12).Value = survey.MceHtml;
                    surveysSheet.Cell(i + 2, 13).Value = survey.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
                    surveysSheet.Cell(i + 2, 14).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
                    surveysSheet.Cell(i + 2, 15).Value = survey.Remark;
                    surveysSheet.Cell(i + 2, 16).Value = survey.SortOrder;
                    surveysSheet.Cell(i + 2, 17).Value = survey.IsDeleted ? "是" : "否";
                    surveysSheet.Cell(i + 2, 18).Value = survey.DeletedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
                }

                if (surveys.Count == 0)
                {
                    surveysSheet.Cell(2, 1).Value = "無資料";
                }

                surveysSheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SurveyData_NewFormat.xlsx");
                }
            }
        }
        */

        /// <summary>
        /// 匯出新格式所有相關資料表到 Excel (Survey、Question、QuestionOption、QuestionImage)
        /// 其中將 Survey 的 MceHtml 拆成多段欄位 (最多5段) 以避免超過儲存格字元上限
        /// 並新增 SortOrder、IsDeleted、DeletedAt 欄位等可用資訊。
        /// </summary>
        /// <returns>Excel 檔案下載</returns>
        public IActionResult ExportToExcelNewFormat()
        {
            var surveys = _unitOfWork.Survey.GetAll(includeProperties: "ApplicationUser,Questions.QuestionOptions,Questions.QuestionImages,QuestionImages", ignoreQueryFilters: true).ToList();
            var questions = _unitOfWork.Question.GetAll().ToList();
            var questionOptions = _unitOfWork.QuestionOption.GetAll().ToList();
            var questionImages = _unitOfWork.QuestionImage.GetAll().ToList();

            // 設定 MceHtml 分段的大小上限
            int maxChunkSize = 30000;
            int maxParts = 5; // MceHtml 最多分5段
                              // 下列函式可用於分段字串
            List<string> SplitStringToChunks(string text, int maxLength)
            {
                var result = new List<string>();
                if (string.IsNullOrEmpty(text))
                {
                    result.Add("");
                    return result;
                }

                for (int i = 0; i < text.Length; i += maxLength)
                {
                    var length = Math.Min(maxLength, text.Length - i);
                    result.Add(text.Substring(i, length));
                }
                return result;
            }

            using (var workbook = new XLWorkbook())
            {
                // 1. Surveys 工作表 (新格式)
                var surveysSheet = workbook.Worksheets.Add("Surveys_NewFormat");
                // 基本欄位 (參考 OldFormat，但加入 MceHtml分段、SortOrder、IsDeleted、DeletedAt)
                surveysSheet.Cell(1, 1).Value = "問卷ID";
                surveysSheet.Cell(1, 2).Value = "建立人ID";
                surveysSheet.Cell(1, 3).Value = "建立人姓名";
                surveysSheet.Cell(1, 4).Value = "建立人工號";
                surveysSheet.Cell(1, 5).Value = "類別名稱";
                surveysSheet.Cell(1, 6).Value = "標題";
                surveysSheet.Cell(1, 7).Value = "描述";
                surveysSheet.Cell(1, 8).Value = "站別名稱";
                surveysSheet.Cell(1, 9).Value = "問題數量";
                surveysSheet.Cell(1, 10).Value = "是否發布";
                surveysSheet.Cell(1, 11).Value = "完成時間";

                // MceHtml 分段欄位 (Part1 ~ Part5)
                for (int p = 1; p <= maxParts; p++)
                {
                    surveysSheet.Cell(1, 11 + p).Value = $"MceHtml_Part{p}";
                }

                // 後續欄位: 建立時間、完成時間(再次出現可省略或改成其它時間欄位)、備註、SortOrder、IsDeleted、DeletedAt
                // 假設在 OldFormat 中，MceHtml 後面有 建立時間(13) 完成時間(14) 備註(15)
                // 現在我們插入了 5 個 MceHtml 分段欄位 (多了4欄)
                // 原本MceHtml在第12欄，現在Part1在第12欄，Part5到第16欄，因此後續欄位順延:
                // 建立時間:17欄, 完成時間:18欄, 備註:19欄, SortOrder:20欄, IsDeleted:21欄, DeletedAt:22欄
                int baseIndex = 11 + maxParts; // MceHtml最後一段結束後的欄位起點
                surveysSheet.Cell(1, baseIndex + 1).Value = "建立時間";
                surveysSheet.Cell(1, baseIndex + 2).Value = "完成時間(再次)";
                surveysSheet.Cell(1, baseIndex + 3).Value = "備註";
                surveysSheet.Cell(1, baseIndex + 4).Value = "SortOrder";
                surveysSheet.Cell(1, baseIndex + 5).Value = "IsDeleted";
                surveysSheet.Cell(1, baseIndex + 6).Value = "DeletedAt";

                // 寫入 Survey 資料
                for (int i = 0; i < surveys.Count; i++)
                {
                    var survey = surveys[i];

                    surveysSheet.Cell(i + 2, 1).Value = survey.Id;
                    surveysSheet.Cell(i + 2, 2).Value = survey.ApplicationUserId;
                    surveysSheet.Cell(i + 2, 3).Value = survey.ApplicationUser?.Name;
                    surveysSheet.Cell(i + 2, 4).Value = survey.JobNum;
                    surveysSheet.Cell(i + 2, 5).Value = survey.CategoryName;
                    surveysSheet.Cell(i + 2, 6).Value = survey.Title;
                    surveysSheet.Cell(i + 2, 7).Value = survey.Description;
                    surveysSheet.Cell(i + 2, 8).Value = survey.StationName;
                    surveysSheet.Cell(i + 2, 9).Value = survey.QuestionNum;
                    surveysSheet.Cell(i + 2, 10).Value = survey.IsPublished ? "是" : "否";
                    surveysSheet.Cell(i + 2, 11).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss") ?? "未完成";

                    // 分段 MceHtml
                    var mceHtml = survey.MceHtml ?? "";
                    var chunks = SplitStringToChunks(mceHtml, maxChunkSize);
                    for (int p = 0; p < maxParts; p++)
                    {
                        surveysSheet.Cell(i + 2, 12 + p).Value = (p < chunks.Count) ? chunks[p] : "";
                    }

                    surveysSheet.Cell(i + 2, baseIndex + 1).Value = survey.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, baseIndex + 2).Value = survey.CompleteTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    surveysSheet.Cell(i + 2, baseIndex + 3).Value = survey.Remark;
                    surveysSheet.Cell(i + 2, baseIndex + 4).Value = survey.SortOrder;
                    surveysSheet.Cell(i + 2, baseIndex + 5).Value = survey.IsDeleted ? "是" : "否";
                    surveysSheet.Cell(i + 2, baseIndex + 6).Value = survey.DeletedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
                }

                if (surveys.Count == 0)
                {
                    surveysSheet.Cell(2, 1).Value = "無資料";
                }

                // 2. Questions 工作表 (與舊格式相同，不需分段MceHtml，但可重覆性存放)
                var questionsSheet = workbook.Worksheets.Add("Questions_NewFormat");
                questionsSheet.Cell(1, 1).Value = "問題ID";
                questionsSheet.Cell(1, 2).Value = "問卷ID";
                questionsSheet.Cell(1, 3).Value = "問題描述";
                questionsSheet.Cell(1, 4).Value = "答案類型";
                questionsSheet.Cell(1, 5).Value = "TinyMCE HTML";
                questionsSheet.Cell(1, 6).Value = "建立時間";
                questionsSheet.Cell(1, 7).Value = "備註";

                for (int i = 0; i < questions.Count; i++)
                {
                    var question = questions[i];
                    questionsSheet.Cell(i + 2, 1).Value = question.Id;
                    questionsSheet.Cell(i + 2, 2).Value = question.SurveyId;
                    questionsSheet.Cell(i + 2, 3).Value = question.QuestionText;
                    questionsSheet.Cell(i + 2, 4).Value = question.AnswerType.ToString();
                    questionsSheet.Cell(i + 2, 5).Value = question.MceHtml;
                    questionsSheet.Cell(i + 2, 6).Value = question.CreateTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    questionsSheet.Cell(i + 2, 7).Value = question.Remark;
                }

                if (questions.Count == 0)
                {
                    questionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 3. QuestionOptions 工作表
                var optionsSheet = workbook.Worksheets.Add("QuestionOptions_NewFormat");
                optionsSheet.Cell(1, 1).Value = "選項ID";
                optionsSheet.Cell(1, 2).Value = "問題ID";
                optionsSheet.Cell(1, 3).Value = "選項描述";
                optionsSheet.Cell(1, 4).Value = "是否正確答案";
                optionsSheet.Cell(1, 5).Value = "是否為其他選項";
                optionsSheet.Cell(1, 6).Value = "排序順序";
                optionsSheet.Cell(1, 7).Value = "描述";

                for (int i = 0; i < questionOptions.Count; i++)
                {
                    var option = questionOptions[i];
                    optionsSheet.Cell(i + 2, 1).Value = option.Id;
                    optionsSheet.Cell(i + 2, 2).Value = option.QuestionId;
                    optionsSheet.Cell(i + 2, 3).Value = option.OptionText;
                    optionsSheet.Cell(i + 2, 4).Value = option.IsCorrect ? "是" : "否";
                    optionsSheet.Cell(i + 2, 5).Value = option.IsOther ? "是" : "否";
                    optionsSheet.Cell(i + 2, 6).Value = option.SortOrder;
                    optionsSheet.Cell(i + 2, 7).Value = option.Description;
                }

                if (questionOptions.Count == 0)
                {
                    optionsSheet.Cell(2, 1).Value = "無資料";
                }

                // 4. QuestionImages 工作表
                var imagesSheet = workbook.Worksheets.Add("QuestionImages_NewFormat");
                imagesSheet.Cell(1, 1).Value = "圖片ID";
                imagesSheet.Cell(1, 2).Value = "問卷ID";
                imagesSheet.Cell(1, 3).Value = "問題ID";
                imagesSheet.Cell(1, 4).Value = "選項ID";
                imagesSheet.Cell(1, 5).Value = "圖片URL";
                imagesSheet.Cell(1, 6).Value = "替代文字";
                imagesSheet.Cell(1, 7).Value = "上傳時間";
                imagesSheet.Cell(1, 8).Value = "排序順序";

                for (int i = 0; i < questionImages.Count; i++)
                {
                    var image = questionImages[i];
                    imagesSheet.Cell(i + 2, 1).Value = image.Id;
                    imagesSheet.Cell(i + 2, 2).Value = image.SurveyId;
                    imagesSheet.Cell(i + 2, 3).Value = image.QuestionId;
                    imagesSheet.Cell(i + 2, 4).Value = image.QuestionOptionId;
                    imagesSheet.Cell(i + 2, 5).Value = image.ImageUrl;
                    imagesSheet.Cell(i + 2, 6).Value = image.AltText;
                    imagesSheet.Cell(i + 2, 7).Value = image.UploadTime?.ToString("yyyy-MM-dd HH:mm:ss");
                    imagesSheet.Cell(i + 2, 8).Value = image.SortOrder;
                }

                if (questionImages.Count == 0)
                {
                    imagesSheet.Cell(2, 1).Value = "無資料";
                }

                // 設定欄寬自動調整
                foreach (var sheet in workbook.Worksheets)
                {
                    sheet.Columns().AdjustToContents();
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SurveyData_NewFormat.xlsx");
                }
            }
        }


        /// <summary>
        /// 匯入舊格式 Excel 資料到資料庫，包含 Survey, Question, QuestionOption 三個資料表
        /// </summary>
        /// <param name="file">上傳的 Excel 文件</param>
        /// <param name="replaceExistingData">是否替換現有資料</param>
        /// <returns>重定向到 Index 或返回錯誤訊息</returns>
        [HttpPost]
        public async Task<IActionResult> ImportExcelOldFormat(IFormFile file, bool replaceExistingData)
        {
            if (file == null || file.Length == 0)
            {
                TempData["ERROR"] = "請選擇一個有效的 Excel 文件!";
                return RedirectToAction("Index");
            }

            // 獲取當前使用者的 ApplicationUserId
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    // 1. 讀取 Surveys 工作表
                    var surveySheet = workbook.Worksheet("Surveys");
                    var surveyRows = surveySheet.RowsUsed().Skip(1); // 跳過標題行

                    // 建立一個字典來映射舊 SurveyID 到新 SurveyID
                    var surveyIdMapping = new Dictionary<int, int>();

                    if (replaceExistingData)
                    {
                        // 刪除所有現有資料
                        _unitOfWork.QuestionOption.RemoveRange(_unitOfWork.QuestionOption.GetAll());
                        _unitOfWork.Question.RemoveRange(_unitOfWork.Question.GetAll());
                        _unitOfWork.QuestionImage.RemoveRange(_unitOfWork.QuestionImage.GetAll());
                        _unitOfWork.Survey.RemoveRange(_unitOfWork.Survey.GetAll());
                        _unitOfWork.Save();
                    }

                    foreach (var row in surveyRows)
                    {
                        // 檢查是否有資料
                        if (row.Cell(1).IsEmpty() && row.Cell(2).IsEmpty())
                        {
                            continue; // 跳過空行
                        }

                        // 處理可能的日期格式錯誤
                        DateTime? createTime = null;
                        if (row.Cell(13).TryGetValue(out DateTime parsedDateTime))
                        {
                            createTime = parsedDateTime;
                        }
                        else
                        {
                            createTime = DateTime.Now; // 如果沒有日期，使用當前時間
                        }

                        // **處理 ApplicationUserId**
                        var applicationUserId = row.Cell(2).GetString(); // 假設建立人ID在第二欄

                        // 檢查 ApplicationUserId 是否在資料庫中存在
                        var applicationUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == applicationUserId);

                        if (applicationUser == null)
                        {
                            // 如果用戶不存在，使用當前匯入用戶的 ApplicationUserId
                            applicationUserId = currentUserId;
                        }

                        // **處理 Category**
                        // 從 Excel 中取得 CategoryName（假設在第5欄）
                        var categoryName = row.Cell(5).GetString();

                        // 根據 CategoryName 查詢資料庫中的 Category
                        var category = _unitOfWork.Category.GetFirstOrDefault(c => c.Name == categoryName);

                        // 如果 Category 不存在，可以選擇新增或提示錯誤
                        if (category == null)
                        {
                            // 您可以選擇以下其中一種方式

                            // **方式一：新增 Category**
                            // category = new Category { Name = categoryName };
                            // _unitOfWork.Category.Add(category);
                            // _unitOfWork.Save(); // 保存以生成 Category 的 ID

                            // **方式二：提示錯誤並跳過該筆資料**
                            TempData["ERROR"] = $"在資料庫中找不到類別 '{categoryName}'，請先新增該類別。";
                            return RedirectToAction("Index");
                        }
                        // 建立 Survey 實體，並設置 CategoryId
                        var survey = new Survey
                        {
                            //ApplicationUserId = row.Cell(2).GetString(),                 // 假設建立人ID在第二欄
                            ApplicationUserId = applicationUserId,                         // 使用處理後的 ApplicationUserId
                            JobName = row.Cell(3).GetString(),                             // 建立人姓名
                            JobNum = row.Cell(4).GetString(),                              // 建立人工號

                            //CategoryName = row.Cell(5).GetString(),
                            CategoryId = category.Id,                                      // 使用正確的 CategoryId

                            Title = row.Cell(6).GetString(),                               // 標題
                            Description = row.Cell(7).GetString(),                         // 描述
                            StationName = row.Cell(8).GetString(),                         // 站別名稱
                            QuestionNum = row.Cell(9).GetValue<int?>(),                    // 頁數
                            IsPublished = row.Cell(10).GetString().Trim() == "是",         // 是否發布
                            CompleteTime = createTime,
                            MceHtml = row.Cell(12).GetString(),                            // TinyMCE HTML

                            // 匯入 CreateTime 和 Remark，如果日期無效則使用 null
                            CreateTime = createTime,                                       // 建立時間
                            Remark = row.Cell(14).GetString()                              // 備註
                        };
                        _unitOfWork.Survey.Add(survey);
                        _unitOfWork.Save(); // 保存以生成 Survey ID
                        surveyIdMapping.Add(row.Cell(1).GetValue<int>(), survey.Id); // 假設原始問卷ID在第一欄
                    }

                    // 2. 讀取 Questions 工作表
                    var questionSheet = workbook.Worksheet("Questions");
                    var questionRows = questionSheet.RowsUsed().Skip(1);

                    var questionIdMapping = new Dictionary<int, int>();

                    foreach (var row in questionRows)
                    {
                        if (row.Cell(1).IsEmpty() && row.Cell(2).IsEmpty())
                        {
                            continue; // 跳過空行
                        }

                        var originalSurveyId = row.Cell(2).GetValue<int>();
                        if (!surveyIdMapping.ContainsKey(originalSurveyId))
                        {
                            // 無法找到對應的 Survey，跳過此問題
                            continue;
                        }

                        // 處理可能的日期格式錯誤
                        DateTime? createTime = null;
                        if (row.Cell(13).TryGetValue(out DateTime parsedDateTime))
                        {
                            createTime = parsedDateTime;
                        }
                        else
                        {
                            createTime = DateTime.Now; // 如果沒有日期，使用當前時間
                        }

                        var question = new Question
                        {
                            SurveyId = surveyIdMapping[originalSurveyId],
                            QuestionText = row.Cell(3).GetString(),
                            AnswerType = Enum.TryParse(row.Cell(4).GetString(), out AnswerTypeEnum answerType) ? answerType : AnswerTypeEnum.SingleChoice,
                            MceHtml = row.Cell(5).GetString(),

                            // 匯入 CreateTime 和 Remark
                            CreateTime = createTime,
                            Remark = row.Cell(7).GetString()
                        };
                        _unitOfWork.Question.Add(question);
                        _unitOfWork.Save(); // 保存以生成 Question ID
                        questionIdMapping.Add(row.Cell(1).GetValue<int>(), question.Id); // 假設原始問題ID在第一欄
                    }

                    // 3. 讀取 QuestionOptions 工作表
                    var optionSheet = workbook.Worksheet("QuestionOptions");
                    var optionRows = optionSheet.RowsUsed().Skip(1);

                    foreach (var row in optionRows)
                    {
                        if (row.Cell(1).IsEmpty() && row.Cell(2).IsEmpty())
                        {
                            continue; // 跳過空行
                        }

                        var originalQuestionId = row.Cell(2).GetValue<int>();
                        if (!questionIdMapping.ContainsKey(originalQuestionId))
                        {
                            // 無法找到對應的 Question，跳過此選項
                            continue;
                        }

                        var option = new QuestionOption
                        {
                            QuestionId = questionIdMapping[originalQuestionId],
                            OptionText = row.Cell(3).GetString(),
                            IsCorrect = row.Cell(4).GetString().Trim() == "是",
                            IsOther = row.Cell(5).GetString().Trim() == "是",
                            SortOrder = row.Cell(6).GetValue<int?>(),
                            Description = row.Cell(7).GetString(),
                        };
                        _unitOfWork.QuestionOption.Add(option);
                    }

                    _unitOfWork.Save(); // 儲存所有選項

                    // 4. 讀取 QuestionImages 工作表
                    var imageSheet = workbook.Worksheet("QuestionImages");
                    var imageRows = imageSheet.RowsUsed().Skip(1);

                    foreach (var row in imageRows)
                    {
                        if (row.Cell(1).IsEmpty() && row.Cell(2).IsEmpty())
                        {
                            continue; // 跳過空行
                        }

                        // 確保 SurveyId 存在於映射中
                        var originalSurveyId = row.Cell(2).GetValue<int?>();
                        if (!originalSurveyId.HasValue || !surveyIdMapping.ContainsKey(originalSurveyId.Value))
                        {
                            // 無法找到對應的 Survey，跳過此圖片
                            continue;
                        }

                        // 處理圖片上傳時間（加入 TryGetValue 檢查避免日期解析錯誤）
                        DateTime? uploadTime = null;
                        if (row.Cell(7).TryGetValue(out DateTime parsedUploadTime))
                        {
                            uploadTime = parsedUploadTime;
                        }
                        else
                        {
                            // 如果不是有效的日期，賦予當前時間
                            uploadTime = DateTime.Now;
                        }

                        // 處理圖片資料
                        var questionImage = new QuestionImage
                        {
                            SurveyId = surveyIdMapping[originalSurveyId.Value], // 確保使用正確映射後的 SurveyId
                            QuestionId = row.Cell(3).GetValue<int?>(),
                            QuestionOptionId = row.Cell(4).GetValue<int?>(),
                            ImageUrl = row.Cell(5).GetString(),
                            AltText = row.Cell(6).GetString(),
                            UploadTime = uploadTime, // 使用解析的日期值或預設值
                            SortOrder = row.Cell(8).GetValue<int?>()
                        };
                        _unitOfWork.QuestionImage.Add(questionImage);
                    }

                    _unitOfWork.Save(); // 儲存所有圖片

                }
            }

            TempData["SUCCESS"] = replaceExistingData ? "資料取代成功!" : "資料新增成功!";

            try
            {         
                return RedirectToAction("BeginRefresh");
            }
            catch (Exception ex)
            {               
                TempData["ERROR"] = "匯入完成，但資料重整時發生錯誤。";
                return RedirectToAction("Index");
            }
          
        }

        
        /// <summary>
        /// 匯入新格式的 Excel 資料到資料庫
        /// 會處理 SortOrder、IsDeleted、DeletedAt 欄位
        /// </summary>
        /// <param name="file">上傳的 Excel 文件</param>
        /// <param name="replaceExistingData">是否取代現有資料</param>
        [HttpPost]
        public async Task<IActionResult> ImportExcelNewFormat(IFormFile file, bool replaceExistingData)
        {
            if (file == null || file.Length == 0)
            {
                TempData["ERROR"] = "請選擇一個有效的 Excel 文件!";
                return RedirectToAction("Index");
            }

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new ClosedXML.Excel.XLWorkbook(stream))
                {
                    // 新格式表格名稱為 "Surveys_NewFormat"
                    var surveySheet = workbook.Worksheet("Surveys_NewFormat");
                    var surveyRows = surveySheet.RowsUsed().Skip(1);

                    if (replaceExistingData)
                    {
                        // 清除現有資料
                        _unitOfWork.QuestionOption.RemoveRange(_unitOfWork.QuestionOption.GetAll());
                        _unitOfWork.Question.RemoveRange(_unitOfWork.Question.GetAll());
                        _unitOfWork.QuestionImage.RemoveRange(_unitOfWork.QuestionImage.GetAll());
                        _unitOfWork.Survey.RemoveRange(_unitOfWork.Survey.GetAll());
                        _unitOfWork.Save();
                    }

                    var surveyIdMapping = new Dictionary<int, int>();

                    // 輔助函數處理日期
                    DateTime? parseDateTimeOrNull(string value)
                    {
                        if (DateTime.TryParse(value, out var dt))
                            return dt;
                        return null;
                    }

                    foreach (var row in surveyRows)
                    {
                        if (row.Cell(1).IsEmpty())
                            continue;

                        int originalId = row.Cell(1).GetValue<int>();

                        var applicationUserId = row.Cell(2).GetString();
                        var applicationUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == applicationUserId);
                        if (applicationUser == null)
                            applicationUserId = currentUserId;

                        var categoryName = row.Cell(5).GetString();
                        var category = _unitOfWork.Category.GetFirstOrDefault(c => c.Name == categoryName);
                        if (category == null)
                        {
                            TempData["ERROR"] = $"在資料庫中找不到類別 '{categoryName}'，請先新增該類別。";
                            return RedirectToAction("Index");
                        }

                        // 解析 SortOrder、IsDeleted、DeletedAt 欄位
                        int? sortOrder = row.Cell(16).TryGetValue<int>(out int so) ? so : (int?)null;
                        bool isDeleted = row.Cell(17).GetString().Trim() == "是";
                        var deletedAtStr = row.Cell(18).GetString();
                        DateTime? deletedAt = parseDateTimeOrNull(deletedAtStr);

                        var survey = new Survey
                        {
                            ApplicationUserId = applicationUserId,
                            JobName = row.Cell(3).GetString(),
                            JobNum = row.Cell(4).GetString(),
                            CategoryId = category.Id,
                            Title = row.Cell(6).GetString(),
                            Description = row.Cell(7).GetString(),
                            StationName = row.Cell(8).GetString(),
                            QuestionNum = row.Cell(9).TryGetValue<int?>(out int? qn) ? qn : (int?)null,
                            IsPublished = row.Cell(10).GetString().Trim() == "是",
                            CompleteTime = parseDateTimeOrNull(row.Cell(11).GetString()),
                            MceHtml = row.Cell(12).GetString(),
                            CreateTime = parseDateTimeOrNull(row.Cell(13).GetString()),
                            Remark = row.Cell(15).GetString(),
                            SortOrder = sortOrder,
                            IsDeleted = isDeleted,
                            DeletedAt = deletedAt
                        };

                        _unitOfWork.Survey.Add(survey);
                        _unitOfWork.Save();
                        surveyIdMapping.Add(originalId, survey.Id);
                    }

                    // 若後續尚有 "Questions_NewFormat"、"QuestionOptions_NewFormat" 工作表可再解析，
                    // 並同樣處理 SortOrder、IsDeleted、DeletedAt。此處略。請依實際需求實作。
                    // ...

                    _unitOfWork.Save();
                }
            }

            TempData["SUCCESS"] = replaceExistingData ? "新格式資料取代成功!" : "新格式資料新增成功!";


            try
            {
                return RedirectToAction("BeginRefresh");
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "匯入完成，但資料重整時發生錯誤。";
                return RedirectToAction("Index");
            }

           
        }
        



        /// <summary>
        /// 更新 MceHtml 中圖片的屬性（data-image-id、width、height、style）以與左側表單同步
        /// </summary>
        /// <param name="mceHtml">原始 MceHtml 內容</param>
        /// <param name="surveyVM">問卷的 ViewModel</param>
        /// <returns>更新後的 MceHtml 內容</returns>
        private string UpdateMceHtmlImages(string mceHtml, SurveyVM surveyVM)
        {
            if (string.IsNullOrEmpty(mceHtml))
            {
                return mceHtml;
            }

            var htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(mceHtml);

            // 獲取所有的 img 標籤
            var imgNodes = htmlDoc.DocumentNode.SelectNodes("//img");
            if (imgNodes == null)
            {
                return mceHtml;
            }

            foreach (var imgNode in imgNodes)
            {
                var src = imgNode.GetAttributeValue("src", "");
                var dataImageId = imgNode.GetAttributeValue("data-image-id", "");

                if (string.IsNullOrEmpty(src))
                {
                    continue;
                }

                // 根據 data-image-id 或 src 查找對應的圖片記錄
                var image = FindImageBySrcOrId(src, dataImageId, surveyVM);
                if (image != null)
                {
                    // 更新 data-image-id
                    imgNode.SetAttributeValue("data-image-id", image.Id.ToString());

                    // 更新 width 和 height 屬性
                    imgNode.SetAttributeValue("width", image.Width.ToString());
                    imgNode.SetAttributeValue("height", image.Height.ToString());

                    // 更新 style 中的 width 和 height
                    var style = imgNode.GetAttributeValue("style", "");
                    var styleDict = ParseStyle(style);
                    styleDict["width"] = $"{image.Width}px";
                    styleDict["height"] = $"{image.Height}px";
                    imgNode.SetAttributeValue("style", BuildStyle(styleDict));
                }
            }

            return htmlDoc.DocumentNode.OuterHtml;
        }

        private QuestionImage FindImageBySrcOrId(string src, string dataImageId, SurveyVM surveyVM)
        {
            QuestionImage image = null;

            // 優先使用 data-image-id 進行匹配
            if (!string.IsNullOrEmpty(dataImageId))
            {
                if (int.TryParse(dataImageId, out int imageId))
                {
                    // 在問卷圖片中查找
                    image = surveyVM.Survey.QuestionImages.FirstOrDefault(img => img.Id == imageId);
                    if (image != null)
                        return image;

                    // 在問題圖片中查找
                    foreach (var questionVM in surveyVM.QuestionVMs)
                    {
                        image = questionVM.QuestionImages.FirstOrDefault(img => img.Id == imageId);
                        if (image != null)
                            return image;

                        // 在選項圖片中查找
                        foreach (var optionVM in questionVM.QuestionOptionVMs)
                        {
                            image = optionVM.QuestionOptionImages.FirstOrDefault(img => img.Id == imageId);
                            if (image != null)
                                return image;
                        }
                    }
                }
            }

            // 如果 data-image-id 匹配失敗，則嘗試使用 src 進行匹配
            // 正規化 src 路徑
            var normalizedSrc = NormalizeImageUrl(src);

            // 在問卷圖片中查找
            image = surveyVM.Survey.QuestionImages.FirstOrDefault(img => NormalizeImageUrl(img.ImageUrl) == normalizedSrc);
            if (image != null)
                return image;

            // 在問題圖片中查找
            foreach (var questionVM in surveyVM.QuestionVMs)
            {
                image = questionVM.QuestionImages.FirstOrDefault(img => NormalizeImageUrl(img.ImageUrl) == normalizedSrc);
                if (image != null)
                    return image;

                // 在選項圖片中查找
                foreach (var optionVM in questionVM.QuestionOptionVMs)
                {
                    image = optionVM.QuestionOptionImages.FirstOrDefault(img => NormalizeImageUrl(img.ImageUrl) == normalizedSrc);
                    if (image != null)
                        return image;
                }
            }

            return null;
        }

        /*
        // 輔助方法：正規化圖片 URL，只保留相對路徑部分
        private string NormalizeImageUrl(string url)
        {
            if (Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out Uri uri))
            {
                return uri.IsAbsoluteUri ? uri.PathAndQuery : url;
            }
            return url;
        }
        */

        // 輔助方法：正規化圖片 URL，只保留相對路徑部分
        private string NormalizeImageUrl(string url)
        {
            if (Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out Uri uri))
            {
                // 只取圖片的相對路徑，或文件名
                return uri.IsAbsoluteUri ? uri.AbsolutePath : uri.ToString();
            }
            return url;
        }


        /// <summary>
        /// 根據圖片的 src 查找對應的圖片記錄
        /// </summary>
        /// <param name="src">圖片的 src 屬性</param>
        /// <param name="surveyVM">問卷的 ViewModel</param>
        /// <returns>對應的 QuestionImage 實例或 null</returns>
        private QuestionImage FindImageBySrc(string src, SurveyVM surveyVM)
        {
            // 查找問卷圖片
            var image = surveyVM.Survey.QuestionImages.FirstOrDefault(img => img.ImageUrl == src);
            if (image != null)
            {
                return image;
            }

            // 查找問題圖片
            foreach (var questionVM in surveyVM.QuestionVMs)
            {
                image = questionVM.QuestionImages.FirstOrDefault(img => img.ImageUrl == src);
                if (image != null)
                {
                    return image;
                }

                // 查找選項圖片
                foreach (var optionVM in questionVM.QuestionOptionVMs)
                {
                    image = optionVM.QuestionOptionImages.FirstOrDefault(img => img.ImageUrl == src);
                    if (image != null)
                    {
                        return image;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// 解析 style 屬性為字典
        /// </summary>
        /// <param name="style">style 屬性字符串</param>
        /// <returns>包含樣式屬性的字典</returns>
        private Dictionary<string, string> ParseStyle(string style)
        {
            var styleDict = new Dictionary<string, string>();
            var styleItems = style.Split(';', StringSplitOptions.RemoveEmptyEntries);
            foreach (var item in styleItems)
            {
                var keyValue = item.Split(':', StringSplitOptions.RemoveEmptyEntries);
                if (keyValue.Length == 2)
                {
                    styleDict[keyValue[0].Trim()] = keyValue[1].Trim();
                }
            }
            return styleDict;
        }

        /// <summary>
        /// 將字典構建為 style 字符串
        /// </summary>
        /// <param name="styleDict">包含樣式屬性的字典</param>
        /// <returns>style 字符串</returns>
        private string BuildStyle(Dictionary<string, string> styleDict)
        {
            return string.Join("; ", styleDict.Select(kv => $"{kv.Key}: {kv.Value}"));
        }

        /// <summary>
        /// 回收筒頁面：顯示已軟刪除的問卷列表視圖
        /// </summary>
        /// <returns>回收筒視圖</returns>
        public IActionResult RecycleBin()
        {
            return View();
        }

        /// <summary>
        /// 取得已刪除的問卷資料供 DataTable 使用 (忽略全域查詢過濾器)
        /// </summary>
        /// <returns>已刪除問卷的 JSON 資料</returns>
        [HttpGet]
        public IActionResult GetDeleted()
        {
            // 使用 ignoreQueryFilters: true 以取得已軟刪除的問卷
            var deletedSurveys = _unitOfWork.Survey.GetAll(filter: s => s.IsDeleted, ignoreQueryFilters: true, includeProperties: "Category");
            var deletedSurveyDTOs = deletedSurveys.Select(s => new SurveyDTO
            {
                Id = s.Id,
                CategoryName = s.Category?.Name,
                Title = s.Title,
                StationName = s.StationName,
                Description = s.Description,
                QuestionNum = s.QuestionNum,
                IsPublished = s.IsPublished ? "是" : "否",
                CreateTime = s.CreateTime.HasValue ? s.CreateTime.Value.ToString("yyyy-MM-dd HH:mm:ss") : "",
                CompleteTime = s.CompleteTime.HasValue ? s.CompleteTime.Value.ToString("yyyy-MM-dd HH:mm:ss") : "",
                JobName = s.JobName
            }).ToList();

            return Json(new { data = deletedSurveyDTOs });
        }

        /// <summary>
        /// 還原已刪除的問卷 (POST)
        /// </summary>
        /// <param name="id">問卷ID</param>
        /// <returns>重定向至回收筒頁面</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            // 使用 ignoreQueryFilters: true 取得已刪除的問卷
            var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == id && s.IsDeleted, ignoreQueryFilters: true);
            if (survey == null)
            {
                TempData["ERROR"] = "找不到指定的問卷，無法還原。";
                return RedirectToAction("RecycleBin");
            }

            // 將 IsDeleted 設為 false、DeletedAt 設為 null，代表從回收筒還原
            survey.IsDeleted = false;
            survey.DeletedAt = null;
            _unitOfWork.Survey.Update(survey);
            _unitOfWork.Save();
            TempData["success"] = "問卷已成功還原!";
            return RedirectToAction("RecycleBin");
        }

        /// <summary>
        /// 永久刪除已軟刪除的問卷 (POST)
        /// </summary>
        /// <param name="id">問卷ID</param>
        /// <returns>重定向至回收筒頁面</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult PermanentDelete(int id)
        {
            // 使用 ignoreQueryFilters: true 取得已軟刪除的問卷
            var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == id && s.IsDeleted, ignoreQueryFilters: true);
            if (survey == null)
            {
                TempData["ERROR"] = "找不到指定的問卷，無法永久刪除。";
                return RedirectToAction("RecycleBin");
            }

            // ==== 修改重點開始 ====
            // 此處不再直接呼叫 RemovePhysical(survey)。
            // 改為呼叫您在 SurveyRepository 中實作的 RemoveSurveyWithDependenciesPhysical(int surveyId) 方法，
            // 該方法會先刪除問卷相關的 Questions、Options、Images、FillInBlanks，再執行真刪除 Survey 本身。
            bool result = _unitOfWork.Survey.RemoveSurveyWithDependenciesPhysical(survey.Id);
            // 如果無法刪除(理論上不會發生，除非又找不到該Survey)，可加入檢查
            if (!result)
            {
                TempData["ERROR"] = "刪除問卷時發生問題，請稍後再試。";
                return RedirectToAction("RecycleBin");
            }

            // RemoveSurveyWithDependenciesPhysical 已經包含 SaveChanges 的流程(因為內部呼叫 RemovePhysical 已執行Save)
            // 若該方法中並未呼叫 SaveChanges()，需在此手動執行 _unitOfWork.Save();
            // 假設您在該方法中已適時呼叫 SaveChanges()，此處可省略。
            // _unitOfWork.Save(); 

            // ==== 修改重點結束 ====

            TempData["success"] = "問卷已永久刪除!";
            return RedirectToAction("RecycleBin");
        }

        [HttpGet]
        public IActionResult RefreshAllMceHtml()
        {
            // 取得所有問卷並包含相關關聯資料，以便完整重建 ViewModel
            var surveys = _unitOfWork.Survey.GetAll(
                includeProperties: "Category,QuestionImages,Questions,Questions.FillInBlanks,Questions.QuestionImages,Questions.QuestionOptions,Questions.QuestionOptions.QuestionImages,Questions.QuestionOptions.FillInBlanks"
            ).ToList();

            foreach (var survey in surveys)
            {
                // 建立 SurveyVM，模仿 Upsert GET 時的資料準備
                SurveyVM surveyVM = new SurveyVM
                {
                    Survey = survey,
                    StationList = _unitOfWork.Station.GetAll().Select(s => new SelectListItem { Text = s.Name, Value = s.Id.ToString() }),
                    CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem { Text = c.Name, Value = c.Id.ToString() }),
                    QuestionTypeList = GetQuestionTypeList(),
                    ImageMappings = new Dictionary<string, int>()
                };

                // 建立 QuestionVM 和 OptionVM 的資料結構
                surveyVM.QuestionVMs = survey.Questions.Select(q => new QuestionVM
                {
                    Question = q,
                    QuestionImages = q.QuestionImages.ToList(),
                    ExistingQuestionImageIds = q.QuestionImages.Select(qi => qi.Id).ToList(),
                    ExistingQuestionImageWidths = q.QuestionImages.Select(qi => qi.Width).ToList(),
                    ExistingQuestionImageHeights = q.QuestionImages.Select(qi => qi.Height).ToList(),
                    // 問題級別的填空
                    FillInBlanks = q.FillInBlanks.Select(fib => new FillInBlankVM
                    {
                        Id = fib.Id,
                        QuestionId = fib.QuestionId,
                        QuestionOptionId = fib.QuestionOptionId,
                        RegexPattern = fib.RegexPattern,
                        Length = fib.Length,
                        Position = fib.Position,
                        BlankNumber = fib.BlankNumber,
                        Placeholder = fib.Placeholder
                    }).ToList(),

                    // 問題選項及其填空與圖片
                    QuestionOptionVMs = q.QuestionOptions.Select(o => new QuestionOptionVM
                    {
                        QuestionOption = o,
                        QuestionOptionImages = o.QuestionImages.ToList(),
                        ExistingOptionImageIds = o.QuestionImages.Select(qi => qi.Id).ToList(),
                        ExistingOptionImageWidths = o.QuestionImages.Select(qi => qi.Width).ToList(),
                        ExistingOptionImageHeights = o.QuestionImages.Select(qi => qi.Height).ToList(),
                        FillInBlanks = o.FillInBlanks.Select(fib => new FillInBlankVM
                        {
                            Id = fib.Id,
                            QuestionId = fib.QuestionId,
                            QuestionOptionId = fib.QuestionOptionId,
                            RegexPattern = fib.RegexPattern,
                            Length = fib.Length,
                            Position = fib.Position,
                            BlankNumber = fib.BlankNumber,
                            Placeholder = fib.Placeholder
                        }).ToList()
                    }).ToList()

                }).ToList();

                // 建立 ImageMappings (圖片路徑與 Image Id 的映射)
                // 問卷圖片
                foreach (var image in survey.QuestionImages)
                {
                    surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                }

                // 問題圖片與選項圖片
                foreach (var questionVM in surveyVM.QuestionVMs)
                {
                    foreach (var image in questionVM.QuestionImages)
                    {
                        surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                    }

                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        foreach (var image in optionVM.QuestionOptionImages)
                        {
                            surveyVM.ImageMappings[NormalizeImageUrl(image.ImageUrl)] = image.Id;
                        }
                    }
                }

                // 使用 UpdateMceHtmlImages 重新更新 MceHtml 的圖片資訊
                var updatedMceHtml = UpdateMceHtmlImages(survey.MceHtml, surveyVM);
                survey.MceHtml = updatedMceHtml;

                _unitOfWork.Survey.Update(survey); // 更新問卷紀錄
            }

            // 儲存所有變更
            _unitOfWork.Save();

            // 以 TempData 顯示操作成功訊息
            TempData["success"] = "全部問卷的 MceHtml 已成功更新!";
            return RedirectToAction("Index");
        }





    }
}
