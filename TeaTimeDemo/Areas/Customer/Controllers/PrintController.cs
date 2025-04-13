using DocumentFormat.OpenXml.Office2010.Excel;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using TeaTimeDemo.Controllers;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.AnswersData.ViewModels;
using TeaTimeDemo.Models.ViewModels;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;
using static TeaTimeDemo.Models.ViewModels.LoadSurveyVM;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize]// 確保只有登入的使用者能夠存取
    public class PrintController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PrintController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// POST: /Customer/Print/Print  
        /// 當使用者按下「列印」按鈕時，更新該筆記錄的完成時間，再轉導到 GET 方法。
        /// </summary>
        [HttpPost]
        public IActionResult Print(int Id)
        {
            // 取得對應的 AnsweredNotes 記錄
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            if (selectedNotes == null)
            {
                return NotFound("找不到對應的料號記錄");
            }
            // 更新完成時間
            selectedNotes.CompleteTime = DateTime.Now;
            _unitOfWork.Save();

            // 轉導到 GET 方法，傳入 MtNum 與 Vali=true
            return RedirectToAction("Print", new { MtNum = selectedNotes.MtNum, Vali = true });
        }

        /// <summary>
        /// GET: /Customer/Print/Print?MtNum=xxx&Vali=True  
        /// 依據傳入的料號（MtNum）從 AnsweredNotes 撈取選項，再從 DocumentExports 與 HtmlSections 撈取問卷內容，
        /// 組合成 LoadSurveyVM 模型，並傳入檢視頁；內容的 HTML 組合後會將每筆問卷內容包在 .survey-section 中，
        /// 與 SurveyAns 頁面相同，懸浮按鈕可用來切換印表時的斷頁效果。
        /// </summary>
        [HttpGet]
        public IActionResult Print(string MtNum, bool Vali = false)
        {
            if (string.IsNullOrEmpty(MtNum))
            {
                return NotFound("料號不能為空");
            }

            // 從 AnsweredNotes 撈取該筆記錄（依料號搜尋）
            var targetAnsweredNote = _unitOfWork.AnsweredNotes.GetFirstOrDefault(a => a.MtNum == MtNum);
            if (targetAnsweredNote == null)
            {
                return NotFound($"找不到對應的資料，料號：{MtNum}");
            }

            // 反序列化 AnsweredNotes 的 OptionList（問卷選項）
            var optionSelections = JsonConvert.DeserializeObject<List<OptionSelection>>(targetAnsweredNote.OptionList);
            // 若 Vali 為 true，則取所有頁面；否則僅取預設流程的頁面（此邏輯可依需求調整）
            List<PageSelection> pageSelectionList;
            if (Vali)
            {
                pageSelectionList = optionSelections
                    .Where(o => o.PageList != null)
                    .SelectMany(o => o.PageList)
                    .ToList();
            }
            else
            {
                pageSelectionList = optionSelections.FirstOrDefault()?.PageList ?? new List<PageSelection>();
            }

            // 建立問卷 HTML 資料的容器
            var surveyHtmlDataList = new List<LoadSurveyVM.surveyHtmlData>();
            var currentStage = targetAnsweredNote.stage;

            // 依每筆頁面選項從 DocumentExports 與 HtmlSections 撈取問卷內容
            foreach (var pageSelection in pageSelectionList)
            {
                int documentExportId = pageSelection.SurveyId;
                int version = pageSelection.Version;

                // 撈取對應的問卷架構資料（DocumentExport）
                var surveyData = _unitOfWork.DbContext.DocumentExports.FirstOrDefault(d => d.Id == documentExportId);
                if (surveyData == null)
                    continue;

                // 從 HtmlSections 撈取該問卷的所有 HTML 片段，依照 Id 升冪排序並組合成完整 HTML
                var htmlParts = _unitOfWork.DbContext.HtmlSections
                                   .Where(h => h.DocumentExportId == documentExportId && h.Version == version)
                                   .OrderBy(h => h.Id)
                                   .Select(h => h.HtmlPart)
                                   .ToList();
                string fullHtml = string.Join("", htmlParts);

                // 從 MtNumAnswereds 撈取該筆問卷的回答資料（若有），取最新一筆（stage <= currentStage）
                int surveyId = surveyData.Id;
                string ansJson = "";
                string images = "";
                var latestAnswer = _unitOfWork.DbContext.MtNumAnswereds
                    .Where(a => a.MtNum == MtNum &&
                                a.SurveyId == surveyId &&
                                a.Version == surveyData.Version &&
                                a.Stage <= currentStage)
                    .OrderByDescending(a => a.Stage)
                    .FirstOrDefault();
                if (latestAnswer != null)
                {
                    ansJson = latestAnswer.AnsweredJson;
                    images = latestAnswer.Images;
                }

                // 組合該筆問卷資料
                var surveyHtmlData = new LoadSurveyVM.surveyHtmlData
                {
                    pcb_category = surveyData.Category,
                    station = surveyData.Station,
                    suffix = surveyData.Suffix,
                    pageNum = int.TryParse(surveyData.PageNo, out int p) ? p : 0,
                    documentId = surveyData.DocumentId,
                    id = surveyData.Id,
                    value = surveyData.Version,
                    html = fullHtml,
                    ansJson = ansJson,
                    images = surveyData.Images
                };
                surveyHtmlDataList.Add(surveyHtmlData);
            }

            // 依 station、suffix 與 pageNum 對問卷資料排序（依需求調整）
            surveyHtmlDataList = surveyHtmlDataList
                .OrderBy(x => x.station == "PNL" ? 0 :
                              x.station == "內層" ? 1 :
                              x.station == "外層" ? 2 :
                              x.station == "印字" ? 3 :
                              x.station == "防焊" ? 4 :
                              x.station == "其他" ? 5 : 6)
                .ThenBy(x => x.suffix == "" ? 0 : x.suffix == "一般" ? 1 : 2)
                .ThenBy(x => x.suffix)
                .ThenBy(x => x.pageNum)
                .ToList();

            // 建立 LoadSurveyVM 模型
            var model = new LoadSurveyVM
            {
                MtNum = MtNum,
                stage = currentStage,
                surveyHtmlDataList = surveyHtmlDataList
            };

            // 將所有問卷的 HTML 內容組合，每筆問卷包在 .survey-section 區塊中
            string combinedHtml = string.Join("", surveyHtmlDataList.Select(s => $"<div class=\"survey-section\">{s.html}</div>"));
            ViewData["HtmlContent"] = combinedHtml;
            ViewData["MtNum"] = MtNum;

            return View("Print", model);
        }

        #region 輔助方法

        /// <summary>
        /// 判斷 HTML 內容是否過大（內文長度超過 5000 字元）
        /// </summary>
        private bool IsModuleTooBig(HtmlDocument doc)
        {
            var allText = doc.DocumentNode.InnerText;
            return allText.Length > 100;
        }

        /// <summary>
        /// 若 HTML 內容過大，僅保留 .ModuleBlock_inner 的內容
        /// </summary>
        private string KeepOnlyInner(HtmlDocument doc)
        {
            var blocks = doc.DocumentNode.SelectNodes("//div[contains(@class,'ModuleBlock')]");
            if (blocks == null)
                return doc.DocumentNode.OuterHtml;

            foreach (var block in blocks)
            {
                var inner = block.SelectSingleNode(".//div[contains(@class,'ModuleBlock_inner')]");
                if (inner != null)
                {
                    block.ParentNode.ReplaceChild(inner, block);
                }
            }
            return doc.DocumentNode.OuterHtml;
        }

        /// <summary>
        /// 取得指定問卷的 HTML 內容，並根據 AnswerJson 處理選項
        /// （請確認 AnswerController.SetTargetOptionValue 為靜態方法且能正常處理）
        /// </summary>
        private string getServeyAnsweredHtml(int SurveyId)
        {
            var answeredSurvey = _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == SurveyId);
            if (answeredSurvey == null || string.IsNullOrEmpty(answeredSurvey.Lochtml))
                return string.Empty;

            var doc = new HtmlDocument();
            try
            {
                doc.LoadHtml(answeredSurvey.Lochtml);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"載入 Lochtml 發生錯誤：{ex.Message}");
                return string.Empty;
            }

            int[] allCheckedOption = null;
            try
            {
                allCheckedOption = JsonConvert.DeserializeObject<int[]>(answeredSurvey.AnswerJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"反序列化 AnswerJson 發生錯誤：{ex.Message}");
            }
            if (allCheckedOption != null && allCheckedOption.Length > 0)
            {
                foreach (int optionId in allCheckedOption)
                {
                    AnswerController.SetTargetOptionValue(doc, optionId, true);
                }
            }
            return doc.DocumentNode.OuterHtml;
        }

        #endregion
    }
}
