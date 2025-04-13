using Microsoft.AspNetCore.Mvc;
using HtmlAgilityPack;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Controllers; // 若 AnswerController 中的 SetTargetOptionValue 方法在此命名空間

namespace TeaTimeDemo.Controllers
{
    // 此控制器不屬於任何 Area，所有使用者皆可存取
    public class PrintController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PrintController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // POST: /Print/Print
        [HttpPost]
        public IActionResult Print(int Id)
        {
            // 取得對應的 Notes 資料
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            if (selectedNotes == null)
            {
                return NotFound("找不到對應的料號記錄");
            }
            // 更新完成時間
            selectedNotes.CompleteTime = DateTime.Now;
            _unitOfWork.Save();

            // 導向 GET 的 Print 方法，傳入料號 (MtNum) 與 Vali 參數
            return RedirectToAction("Print", new { MtNum = selectedNotes.MtNum, Vali = true });
        }

        // GET: /Print/Print
        [HttpGet]
        public IActionResult Print(string MtNum, bool Vali = false)
        {
            if (string.IsNullOrEmpty(MtNum))
            {
                return NotFound("料號不能為空");
            }

            // 取得該料號所有相關流程之 ProcessCategoryId
            var allProcesses = _unitOfWork.AnsweredProcess
                                .GetAll(apo => apo.MtNum == MtNum)
                                .Select(apo => apo.ProcessCategoryId)
                                .ToList();

            List<string> outputHtmls = new List<string>();
            var allTargetSurveys = new List<int>();

            // 依流程取得每個頁面，再取得對應的問卷 Id
            foreach (var pro in allProcesses)
            {
                var allPages = _unitOfWork.AnsweredPage
                                .GetAll(apa => apa.MtNum == MtNum)
                                .Select(apa => apa.PageName)
                                .ToList();
                foreach (var page in allPages)
                {
                    var allSurveys = _unitOfWork.AnsweredSurvey
                                        .GetAll(asu => asu.MtNum == MtNum && asu.PageName == page)
                                        .Select(asu => asu.Id)
                                        .ToList();
                    allTargetSurveys.AddRange(allSurveys);
                }
            }

            // 依問卷 Id 取得問卷 HTML；若內容過大則僅保留 .ModuleBlock_inner 部分
            foreach (var surveyId in allTargetSurveys)
            {
                string SurveyAnsweredHtml = getServeyAnsweredHtml(surveyId);
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(SurveyAnsweredHtml);
                if (IsModuleTooBig(doc))
                {
                    SurveyAnsweredHtml = KeepOnlyInner(doc);
                }
                outputHtmls.Add(SurveyAnsweredHtml);
                // 加入分頁區隔
                outputHtmls.Add("<div class=\"break\"> </div>");
            }

            // 將組合後的 HTML 字串透過 ViewData 傳遞給 Print.cshtml
            ViewData["HtmlContent"] = string.Join("", outputHtmls);
            ViewData["MtNum"] = MtNum;
            return View("Print");
        }

        #region 輔助方法

        private bool IsModuleTooBig(HtmlDocument doc)
        {
            // 以 HTML 內文字長度 > 5000 判斷過大
            var allText = doc.DocumentNode.InnerText;
            return (allText.Length > 5000);
        }

        private string KeepOnlyInner(HtmlDocument doc)
        {
            // 找到所有 .ModuleBlock，若內含 .ModuleBlock_inner 則僅保留內層
            var blocks = doc.DocumentNode.SelectNodes("//div[contains(@class,'ModuleBlock')]");
            if (blocks == null) return doc.DocumentNode.OuterHtml;

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

        private string getServeyAnsweredHtml(int SurveyId)
        {
            // 取得該問卷的 AnsweredSurvey 資料
            var answeredSurvey = _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == SurveyId);
            if (answeredSurvey == null) return string.Empty;
            var doc = new HtmlDocument();
            doc.LoadHtml(answeredSurvey.Lochtml);
            int[] allCheckedOption = JsonConvert.DeserializeObject<int[]>(answeredSurvey.AnswerJson);
            if (allCheckedOption != null && allCheckedOption.Length > 0)
            {
                foreach (int optionId in allCheckedOption)
                {
                    // 假設 AnswerController.SetTargetOptionValue 可直接呼叫
                    AnswerController.SetTargetOptionValue(doc, optionId, true);
                }
            }
            return doc.DocumentNode.OuterHtml;
        }

        #endregion
    }
}
