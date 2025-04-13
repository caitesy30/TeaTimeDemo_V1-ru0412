using System.Collections.Generic;
using System.Diagnostics;
using System.Security.Claims;
using System.Security.Policy;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using TeaTimeDemo.Controllers;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.DTOs;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.AnswersData.ViewModels;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.Web;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using TeaTimeDemo.DataAccess.Data;
using Microsoft.IdentityModel.Tokens;
using DocumentFormat.OpenXml.Office2010.Excel;



 


namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize]
    public class OrderController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ApplicationDbContext _db;
        [BindProperty]
        public OrderVM OrderVM { get; set; }
        public OrderController(IUnitOfWork unitOfWork, ApplicationDbContext db)
        {
            _unitOfWork=unitOfWork;
            _db = db;
        }

        // =================【新增加：判斷模組是否過大】=================
        // (純範例: 以 HTML 文字長度 > 5000 做為「過大」判斷)
        private bool IsModuleTooBig(HtmlDocument doc)
        {
            // 也可以改成實際寬高計算，這裡示範用文字字數
            var allText = doc.DocumentNode.InnerText;
            return (allText.Length > 5000);
        }

        // =================【新增加：只保留 ModuleBlock_inner】=================
        private string KeepOnlyInner(HtmlDocument doc)
        {
            // 找到所有 .ModuleBlock
            var blocks = doc.DocumentNode.SelectNodes("//div[contains(@class,'ModuleBlock')]");
            if (blocks == null) return doc.DocumentNode.OuterHtml;

            foreach (var block in blocks)
            {
                // 若下層存在 class="ModuleBlock_inner"，就把它取代原本的 .ModuleBlock
                var inner = block.SelectSingleNode(".//div[contains(@class,'ModuleBlock_inner')]");
                if (inner != null)
                {
                    // 用 inner 內容取代外層 block
                    block.ParentNode.ReplaceChild(inner, block);
                }
            }
            return doc.DocumentNode.OuterHtml;
        }

        /*
        // POST：接收選擇的 Notes Id，更新完成時間，然後以該料號導向 GET 列印頁面
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

            // 導向 GET 的 Print 方法，並傳入料號 (MtNum) 與 Vali 參數
            return RedirectToAction("Print", new { MtNum = selectedNotes.MtNum, Vali = true });
        }

        // GET：依據料號 (MtNum) 組合列印用的 HTML 內容，並回傳 Print.cshtml 頁面
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
                // 可加入分頁區隔
                outputHtmls.Add("<div class=\"break\"> </div>");
            }

            // 利用 ViewData 傳遞資料給 Print.cshtml
            ViewData["HtmlContent"] = string.Join("", outputHtmls);
            ViewData["MtNum"] = MtNum;
            return View("Print");
        }
        */


        [HttpPost]
        //public IActionResult DuplicateNotes(string mtNum)
        //{
        //    var existNotes = _unitOfWork.AnsweredNotes.GetFirstOrDefault(a => a.MtNum == mtNum);
        //    if (existNotes == null) return Json();

        //}

        [HttpPost]
        public IActionResult CompleteNotes(int Id)
        {
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            selectedNotes.status = "等待料號審核";
            selectedNotes.CompleteTime = DateTime.Now;
            //_unitOfWork.AnsweredNotes.SaveChanges();
            var log = new NotesModify
            {
                MtNum = selectedNotes.MtNum,
                Status = selectedNotes.status,
                Stage = selectedNotes.stage,
                ApplicationUserId = selectedNotes.ApplicationUserId,
                JobName = selectedNotes.JobName,
                JobNum = selectedNotes.JobNum,
                CreateTime = selectedNotes.CreateTime,
                CompleteTime = DateTime.Now,
            };
            _unitOfWork.NotesModify.Add(log);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult RejectNotes(int Id, string remark)
        {
            var selectNotes = _unitOfWork.AnsweredNotes.GetFirstOrDefault(a => a.Id == Id);
            if (selectNotes == null) return NotFound();
            selectNotes.status = "作答編輯中";
            selectNotes.CompleteTime = DateTime.Now;

            var modifyLog = new NotesModify
            {
                MtNum = selectNotes.MtNum,
                Status = "作答編輯中",
                Stage = selectNotes.stage + 1,
                ApplicationUserId = selectNotes.ApplicationUserId,
                Remark = "退回：" + remark,
                JobNum = selectNotes.JobNum,
                JobName = selectNotes.JobName,
                CompleteTime = DateTime.Now
            };
            _unitOfWork.NotesModify.Add(modifyLog);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }


        [HttpPost]
        public IActionResult CancelNotes(int Id)
        {
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            selectedNotes.status = "作答編輯中";
            selectedNotes.CompleteTime = DateTime.Now;
            //_unitOfWork.AnsweredNotes.SaveChanges();
            var log = new NotesModify
            {
                MtNum = selectedNotes.MtNum,
                Status = selectedNotes.status,
                ApplicationUserId = selectedNotes.ApplicationUserId,
                JobName = selectedNotes.JobName,
                JobNum = selectedNotes.JobNum,
                CreateTime = selectedNotes.CreateTime,
                CompleteTime = selectedNotes.CompleteTime,
            };
            _unitOfWork.NotesModify.Add(log);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }
        [HttpPost]
        public IActionResult ValiNotes(int Id)
        {
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            selectedNotes.status = "料號審核中";
            selectedNotes.CompleteTime = DateTime.Now;
            selectedNotes.stage += 1;
            _unitOfWork.AnsweredNotes.SaveChanges();
            var log = new NotesModify
            {
                MtNum = selectedNotes.MtNum,
                Status = selectedNotes.status,
                Stage = selectedNotes.stage,
                ApplicationUserId = selectedNotes.ApplicationUserId,
                JobName = selectedNotes.JobName,
                JobNum = selectedNotes.JobNum,
                CreateTime = selectedNotes.CreateTime,
                CompleteTime = selectedNotes.CompleteTime,
            };
            _unitOfWork.NotesModify.Add(log);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult ToValiNotes(int Id)
        {
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            //selectedNotes.status = "料號審核中";
            selectedNotes.CompleteTime = DateTime.Now;
            //selectedNotes.stage += 1;
            //_unitOfWork.AnsweredNotes.SaveChanges();
            //var log = new NotesModify
            //{
            //    MtNum = selectedNotes.MtNum,
            //    Status = selectedNotes.status,
            //    Stage = selectedNotes.stage,
            //    ApplicationUserId = selectedNotes.ApplicationUserId,
            //    JobName = selectedNotes.JobName,
            //    JobNum = selectedNotes.JobNum,
            //    CreateTime = selectedNotes.CreateTime,
            //    CompleteTime = selectedNotes.CompleteTime,
            //};
            //_unitOfWork.NotesModify.Add(log);
            _unitOfWork.Save();
            return RedirectToAction("Index", "SurveyAns", new { area = "Customer", MtNum = selectedNotes.MtNum, Vali = true }); 
        }

        [HttpPost]
        public IActionResult ValiComplete(int Id)
        {
            var selectedNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            selectedNotes.status = "完成";
            selectedNotes.CompleteTime = DateTime.Now;
            //selectedNotes.stage += 1;
            //_unitOfWork.AnsweredNotes.SaveChanges();
            var log = new NotesModify
            {
                MtNum = selectedNotes.MtNum,
                Status = selectedNotes.status,
                Stage = selectedNotes.stage,
                ApplicationUserId = selectedNotes.ApplicationUserId,
                JobName = selectedNotes.JobName,
                JobNum = selectedNotes.JobNum,
                CreateTime = selectedNotes.CreateTime,
                CompleteTime = selectedNotes.CompleteTime,
            };
            _unitOfWork.NotesModify.Add(log);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        #region View
        public IActionResult Index(string status)   //NotesList
        {
            

            
            AnsweredIndexVM answeredIndexVM = new AnsweredIndexVM();
            var checkList = _unitOfWork.AnsweredNotes.GetAll().Select(ansn => ansn.MtNum).ToList();
            //var ccheckList = _unitOfWork.AnsweredSurvey.GetAll();

            //foreach (var obj in ccheckList) 
            //{
            //    var ccheck = "CAM";
            //    if (obj.status == null) { }
            //    var notesUpdate = _unitOfWork.AnsweredNotes.GetFirstOrDefault(ansn => ansn.MtNum == obj.MtNum);
            //    notesUpdate.status = ccheck;
            //   _unitOfWork.SaveChanges();
            //} 
            
            foreach (var note in checkList) 
            {
                var check = "作答編輯中";
                var surveyList = _unitOfWork.AnsweredSurvey.GetAll(anss => anss.MtNum == note);
                foreach (var su in surveyList) 
                {
                    if (su.status == null) { check = null; break; }
                }
                var notesUpdate = _unitOfWork.AnsweredNotes.GetFirstOrDefault(ansn => ansn.MtNum == note);
                if(notesUpdate.status == null) 
                {
                    notesUpdate.status = check;
                    _unitOfWork.SaveChanges();
                }
                
                
            }
            switch (status)
            {
                case "作答編輯中":
                    answeredIndexVM.SelectedNotes = _unitOfWork.AnsweredNotes.GetAll(ans => ans.status == "作答編輯中");
                    break;
                case "等待料號審核":
                    answeredIndexVM.SelectedNotes = _unitOfWork.AnsweredNotes.GetAll(ans => ans.status == "等待料號審核");
                    break;
                case "料號審核中":
                    answeredIndexVM.SelectedNotes = _unitOfWork.AnsweredNotes.GetAll(ans => ans.status == "料號審核中");
                    break;
                case "完成":
                    answeredIndexVM.SelectedNotes = _unitOfWork.AnsweredNotes.GetAll(ans => ans.status == "完成");
                    break;
                default:
                    answeredIndexVM.SelectedNotes = _unitOfWork.AnsweredNotes.GetAll();
                    break;
            }
            

            //Notes
            //answeredIndexVM.AllNotes = _unitOfWork.AnsweredNotes.GetAll();

            //Category
            answeredIndexVM.Categorys =  _unitOfWork.Category.GetAll();
            answeredIndexVM.Layers = _unitOfWork.Layer.GetAll();
            answeredIndexVM.NotesModifyLogs = _unitOfWork.NotesModify.GetAll();
            if (answeredIndexVM.NotesProcess == null)
            {
                answeredIndexVM.NotesProcess = new List<NotesProgress>();
            }
            foreach(var obj in answeredIndexVM.SelectedNotes) 
            {
                 int total = 0;
                int completed = 0;
                var selectProcess = _unitOfWork.AnsweredProcess.GetAll(ap => ap.MtNum == obj.MtNum);
                total = selectProcess.Count();
                foreach (var ansp in selectProcess)
                {
                    var pDone = true;
                    var pageList = _unitOfWork.AnsweredPage.GetAll(ap => ap.MtNum == obj.MtNum && ap.ProcessCategoryId == ansp.ProcessCategoryId);
                    foreach (var p in pageList)
                    {
                        bool done = true;
                        var surveyList = _unitOfWork.AnsweredSurvey.GetAll(an => an.PageName == p.PageName && an.MtNum == obj.MtNum);
                        foreach (var su in surveyList)
                        {
                            if (su.AnswerJson == "[]" || string.IsNullOrEmpty(su.AnswerJson)) { done = false; break;}
                            
                        }
                        if (!done) { pDone = false;break; }
                       
                    }
                    if (pDone) completed++;
                }
                //answeredIndexVM.NotesProcess.Add(new NotesProgress
                //{
                //        MtNum = obj.MtNum,
                //        Total = total,
                //        Completed = completed
                //});
            }
            return View(answeredIndexVM);
        }
        public IActionResult NotesView(int Id)   //Notes
        {
            
            var answeredNotesVM = new AnsweredNotesVM();
            
            answeredNotesVM.AnsweredNotes = _unitOfWork.AnsweredNotes.Get(a => a.Id == Id);
            //answeredNotesVM.Categorys = _unitOfWork.Category.GetAll();
            //answeredNotesVM.Layers = _unitOfWork.Layer.GetAll();
            answeredNotesVM.Title = $"料號 : {answeredNotesVM.AnsweredNotes.MtNum} 流程清單";
            //var optionSelections = JsonConvert.DeserializeObject<List<OptionSelection>>(answeredNotesVM.AnsweredNotes.OptionList ?? "[]");

            var optionSelections = JsonConvert.DeserializeObject<List<OptionSelection>>(answeredNotesVM.AnsweredNotes.OptionList 
                ?? "[]") ?? new List<OptionSelection>();

            //類別
            int pcbCategoryId = answeredNotesVM.AnsweredNotes.PcbCategoryId;


            var allProcess = new List<BlankSurvey>();

            foreach (var option in optionSelections)
            {
                var survey = _unitOfWork.BlankSurvey
                    .Get(b => b.Id == option.Value);

                if (survey != null)
                {
                    allProcess.Add(survey);
                }
            }
            optionSelections.Reverse();
            answeredNotesVM.AllProcess = optionSelections;

            

            return View(answeredNotesVM);
        }
        public IActionResult ProcessView(string MtNum, int ProcessNum)   //Notes
        {
            AnsweredProcessVM answeredProcessVM = new AnsweredProcessVM(); 

            answeredProcessVM.Title = $"料號 : {MtNum} / {ProcessNum} 頁別清單";
            answeredProcessVM.AllPage = _unitOfWork.AnsweredPage.GetAll(ap => ap.MtNum == MtNum && ap.ProcessCategoryId == ProcessNum);
            answeredProcessVM.Categorys = _unitOfWork.Category.GetAll();
            answeredProcessVM.Layers = _unitOfWork.Layer.GetAll();
            answeredProcessVM.AnsweredSurveysList = _unitOfWork.AnsweredSurvey
                    .GetAll(ans => ans.MtNum == MtNum && ans.ProcessCategoryId == ProcessNum)
                    .ToList();
            if (answeredProcessVM.ProcessingSurvey == null)
            {
                answeredProcessVM.ProcessingSurvey = new List<PageProgress>();
            }
            foreach (var obj in answeredProcessVM.AllPage)
            { 
                var surveyList = _unitOfWork.AnsweredSurvey.GetAll(a => a.PageName == obj.PageName && a.MtNum == MtNum);
                int totalSurvey = surveyList.Count();
                int answeredCount = 0;
                foreach (var survey in surveyList) 
                {
                    if (survey.AnswerJson != "[]" && !string.IsNullOrEmpty(survey.AnswerJson)) answeredCount++;
                }

                answeredProcessVM.ProcessingSurvey.Add(new PageProgress
                {
                    PageName = obj.PageName,
                    TotalPages = surveyList.Count(),
                    CompletedPages = answeredCount
                });
            }

            //var testList = answeredProcessVM.AllPage
            //    .GroupBy(a => a.PcbCategoryId)
            //    .Select(ans => new PageProgress
            //    { 
            //        ProcessCategoryId =ans.Key
            //        TotalPages = ans.Count(ans =>ans.PcbCategoryId == ans.PcbCategoryId)
            //        CompletedPages = ans.Count()
            //    })





            //var progressList= answeredProcessVM.AllPage
            //    .GroupBy(a => a.PcbCategoryId)
            //    .Select(ans => new PageProgress
            //    {
            //        ProcessCategoryId = ans.Key,
            //        TotalPages = ans.Count(),
            //        //CompletedPages = ans.Count(a => a.AnswerJson !="[]" && !string.IsNullOrEmpty(a.AnswerJson))
            //    }).ToList();
            //answeredProcessVM.ProcessingSurvey = progressList;
            //顯示該流程  裡面放  PageList

            return View(answeredProcessVM);
        }
        public IActionResult PageView(string MtNum, int ProcessNum, string PageName)   //Notes
        {
            //顯示該頁面  裡面放  ServeyList

            AnsweredPageVM answeredPageVM = new AnsweredPageVM();
            var last = _unitOfWork.AnsweredSurvey.GetAll(asur => asur.MtNum == MtNum && asur.ProcessCategoryId == ProcessNum).ToList().FindLast(ans => ans != null).Id;
            answeredPageVM.SurveyCount = last;
            answeredPageVM.Title = $"料號 : {MtNum} / {ProcessNum} / {PageName} 問卷清單";
            answeredPageVM.AllSurvey = _unitOfWork.AnsweredSurvey.GetAll(asur=> asur.MtNum == MtNum && asur.ProcessCategoryId == ProcessNum && asur.PageName == PageName);
            answeredPageVM.Categorys = _unitOfWork.Category.GetAll();
            answeredPageVM.Layers = _unitOfWork.Layer.GetAll();
            return View(answeredPageVM);
        }
        #endregion 



        //編輯
        public IActionResult ServeyEdit(int ServeyId, int SurveyCount)   //Notes
        {
            AnsweredSurvey AnsweredSurvey = _unitOfWork.AnsweredSurvey.GetById(ServeyId);

            Console.WriteLine($"ServeyId : {ServeyId}");
            AnsweredSurveyVM AnsweredSurveyVM = new AnsweredSurveyVM();

            ViewData["SurveyId"] = ServeyId;

            var modHtml = addAnsweredToHtml(ServeyId);
            AnsweredSurveyVM.MtNum = AnsweredSurvey.MtNum;

            AnsweredSurveyVM.ProcessNum = AnsweredSurvey.ProcessCategoryId;

            AnsweredSurveyVM.PageName = AnsweredSurvey.PageName;

            AnsweredSurveyVM.SurveyView = new SurveySub(AnsweredSurvey.Id , AnsweredSurvey.Title , modHtml);

            ViewData["SurveyCount"] = SurveyCount;    
            //顯示目標 Servey
            return View(AnsweredSurveyVM);
        }

        [HttpPost]
        public IActionResult GetAnsweredSurveyData([FromBody] AnsweredSurveyData surveyData)
        {
            // 確認接收到的資料
            string str = $"=== 問卷ID: [ {surveyData.SurveyId} ] TestGetPOST MODE===\n\n";

          
            updateAnsweredSurvey(surveyData);

             
            return Json(new { success = true });
            //(string MtNum, int ProcessNum, string PageName)
           // return RedirectToAction(nameof(PageView), new { MtNum = surveyData.MtNum, ProcessNum = surveyData.ProcessNum, PageName = surveyData.PageName });
            
        }

        /// <summary>
        /// 新增框架
        /// </summary>
        /// <param name="surveyData"></param>
        [HttpPost]
        public IActionResult AddSurveyOption([FromBody] AnsweredIndexVM.SurveyOption model)
        {
            if (model == null)
            {
                return Json(new { success = false, message = "請求數據不可為空！" });
            }
            if (string.IsNullOrEmpty(model.OptionName) || model.SurveyIds == null || !model.SurveyIds.Any())
            {
                return Json(new { success = false, message = "選項名稱或問卷未選擇！" });
            }

            var option = new BlankSurvey
            {
                Name = model.OptionName
            };

            option.SelectedIds = model.SurveyIds;

            var targetId = _unitOfWork.Layer.Get(l => l.Name ==  model.ProcessName).Id;
            option.LayerId = targetId;

            option.CategoryId = model.CategoryId;


            _unitOfWork.BlankSurvey.Add(option);
            _unitOfWork.Save();


            return Json(new { success = true });
        }


        public void updateAnsweredSurvey(AnsweredSurveyData surveyData)
        {
            string AnswerJson = JsonConvert.SerializeObject(surveyData.ArrAllSelectedOptions);

            updateAnsweredSurvey(surveyData.AnsweredSurveyId, AnswerJson, surveyData.SurveyId, surveyData.LocHtml);
        }
        void updateAnsweredSurvey(string AnsweredSurveyId, string QuestionsMapJson, string SurveyId, string LocHtml)
        {

            if (string.IsNullOrWhiteSpace(QuestionsMapJson))
            {
                //  Dictionary<int, QuestionDto> inputQuestionsMap = JsonConvert.DeserializeObject<Dictionary<int, QuestionDto>>(QuestionsMapJson);

                return;
            }
            //string currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
            //ApplicationUser currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);

            AnsweredSurvey AnsweredSurvey = _unitOfWork.AnsweredSurvey.GetById(int.Parse(AnsweredSurveyId)); 

            #region 填充AnsweredSurvey

            AnsweredSurvey.AnswerJson = QuestionsMapJson;

            _unitOfWork.AnsweredSurvey.Update(AnsweredSurvey);
            _unitOfWork.Save(); // 先保存問卷
            TempData["success"] = "問卷填寫成功!";

            #endregion



        }


        public IActionResult getHidePageContent(string MtNum) 
        {
            var allProcesses = _unitOfWork.AnsweredProcess
                    .GetAll(apo => apo.MtNum == MtNum)
                    .Select(apo => apo.ProcessCategoryId)
                    .ToList();

            List<string> outputHtmls = new List<string>();
            var allTargetSurveys = new List<int>();
            List<int> count = new List<int>();
            foreach (var pro in allProcesses)
            {
                var allPages = _unitOfWork.AnsweredPage
                    .GetAll(apa => apa.MtNum == MtNum)
                    .Select(apa => apa.PageName)
                    .ToList();
                foreach (var sur in allPages)
                {
                    var allSurveys = _unitOfWork.AnsweredSurvey
                        .GetAll(asu => asu.MtNum == MtNum && asu.PageName == sur)
                        .Select(asu => asu.Id)
                        .ToList();
                    foreach (var surveyIds in allSurveys)
                    {
                        allTargetSurveys.Add(surveyIds);
                        string SurveyAnsweredHtml = getServeyAnsweredHtml(surveyIds);
                        

                        string HideHtml = RemoveBrTagsExceptAfterLabel(HideUnselectedOptions(SurveyAnsweredHtml));

                        //output

                        // 新增過大判斷
                        HtmlDocument doc = new HtmlDocument();
                        doc.LoadHtml(HideHtml);
                        if (IsModuleTooBig(doc))
                        {
                            HideHtml = KeepOnlyInner(doc);
                        }

                        // 給個外框
                        string surveyWithBorder = 
                            $"<div style='border-width: 2px; border-color: darkslategrey; border-style: solid; padding: 10px; margin-left: 0px;margin-right: 0px;;'>{HideHtml}</div>";
                        //string boxesHtml = addboxToHtml(surveyWithBorder);
                        //string hideboxeshtml = GetHeader(boxesHtml);
                        outputHtmls.Add(surveyWithBorder);

                    }
                    outputHtmls.Add($"<div class=\"break\"  >    </div>");
                }
            }
            ViewData["MtNum"] = MtNum;
            ViewData["HtmlContent"] = string.Join("", outputHtmls);
            return View("Print");
        }

        
        public IActionResult getHideContent(string MtNum)
        {
            var allProcesses = _unitOfWork.AnsweredProcess
                    .GetAll(apo => apo.MtNum == MtNum)
                    .Select(apo => apo.ProcessCategoryId)
                    .ToList();

            List<string> outputHtmls = new List<string>();
            var allTargetSurveys = new List<int>();
            foreach (var pro in allProcesses)
            {
                var allPages = _unitOfWork.AnsweredPage
                    .GetAll(apa => apa.MtNum == MtNum)
                    .Select(apa => apa.PageName)
                    .ToList();
                foreach (var sur in allPages)
                {
                    var allSurveys = _unitOfWork.AnsweredSurvey
                        .GetAll(asu => asu.MtNum == MtNum && asu.PageName == sur)
                        .Select(asu => asu.Id)
                        .ToList();
                    foreach (var surveyIds in allSurveys)
                    {
                        allTargetSurveys.Add(surveyIds);
                    }
                }
            }
            foreach (var surveyIds in allTargetSurveys)
            {

                string SurveyAnsweredHtml = getServeyAnsweredHtml(surveyIds);

                string HideHtml = RemoveBrTagsExceptAfterLabel(HideUnselectedOptions(SurveyAnsweredHtml));

                // ============ 新增過大判斷 ===========
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(HideHtml);
                if (IsModuleTooBig(doc))
                {
                    // 若太大，就只保留 inner
                    HideHtml = KeepOnlyInner(doc);
                }

                //HideUnselectedOptions
                outputHtmls.Add(HideHtml);



                //outputHtmls.Add($"<div class=\"break\"  >    </div>");
            }
            //return Json(outputHtmls);
            ViewData["MtNum"] = MtNum;
            ViewData["HtmlContent"] = string.Join("", outputHtmls);
            return View("Print");
            //return Json(new { success = true, htmlContent = string.Join("", outputHtmls) });
        }


        public IActionResult getPrintContent(string MtNum) 
        {
            var allProcesses = _unitOfWork.AnsweredProcess
                    .GetAll(apo => apo.MtNum == MtNum)
                    .Select(apo => apo.ProcessCategoryId)
                    .ToList();
            
            List<string> outputHtmls = new List<string> ();
            var allTargetSurveys =new List<int>();

            foreach (var pro in allProcesses)
            {
                var allPages = _unitOfWork.AnsweredPage
                    .GetAll(apa => apa.MtNum == MtNum)
                    .Select(apa => apa.PageName)
                    .ToList();
                foreach (var sur in allPages) 
                {
                    var allSurveys = _unitOfWork.AnsweredSurvey
                        .GetAll(asu => asu.MtNum == MtNum && asu.PageName == sur)
                        .Select(asu => asu.Id)
                        .ToList();
                    foreach (var surveyIds in allSurveys)
                    {
                        allTargetSurveys.Add(surveyIds);
                    }
                }
            }
            foreach (var surveyIds in allTargetSurveys)
            {

                string SurveyAnsweredHtml = getServeyAnsweredHtml(surveyIds);

                // 這裡可再加 check
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(SurveyAnsweredHtml);
                if (IsModuleTooBig(doc))
                {
                    // 若太大，就只保留 inner
                    SurveyAnsweredHtml = KeepOnlyInner(doc);
                }

                //HideUnselectedOptions
                outputHtmls.Add(SurveyAnsweredHtml);



                outputHtmls.Add(  $"<div class=\"break\"  >    </div>" );
                  }
            //return Json(outputHtmls);
            ViewData["HtmlContent"] = string.Join("", outputHtmls);
            ViewData["MtNum"] = MtNum;
            return View("Print");
            //return Json(new { success = true, htmlContent = string.Join("", outputHtmls) });
        }


        string GetHeader(string html)
        {
            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(html);

            // 選取所有的 <h3> 節點
            var h3Nodes = doc.DocumentNode.SelectNodes("//h3");
            if (h3Nodes == null) return html; // 如果沒有找到任何 <h3>，返回原始 HTML

            foreach (var h3Node in h3Nodes)
            {
                // 獲取 <h3> 節點的下一個兄弟節點
                var nextSibling = h3Node.NextSibling;

                // 繼續檢查是否需要跳過空白文字或註解節點
                while (nextSibling != null && (nextSibling.Name == "#text" || nextSibling.Name == "#comment"))
                {
                    nextSibling = nextSibling.NextSibling;
                }

                // 如果下一個節點存在且名稱不是 <div>
                if (nextSibling != null && nextSibling.Name != "div" && (h3Node.InnerText.Contains("□", StringComparison.OrdinalIgnoreCase)))
                {
                    var divNodes = h3Node.SelectNodes(".//div");
                    if (divNodes != null)
                    {
                        foreach (var divNode in divNodes)
                        {
                            // 將子 <div> 節點設為隱藏
                            divNode.SetAttributeValue("style", "display:none;");
                        }
                    }
                }
            }

            // 返回修改過的 HTML
            return doc.DocumentNode.OuterHtml;
        }

        string addboxToHtml(string OldHtmlBtId)
        {
            // 创建 HtmlDocument 实例并加载 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(OldHtmlBtId);
            //Questions[1].SelectedOption
            // 查询所有h3元素
            var h3Nodes = doc.DocumentNode.SelectNodes("//h3");
            if (h3Nodes != null)
            {
                foreach (var h3Node in h3Nodes)
                {
                    var nextSibling = h3Node.NextSibling;
                    if (nextSibling != null) 
                    {
                        if (nextSibling.Name == "div" || (h3Node.InnerText.Contains("□", StringComparison.OrdinalIgnoreCase)))
                        {
                            string checkbox = "<input type=\"checkbox\" class=\"checkbox1\" />";
                            //var labelTest = HtmlNode.CreateNode($"<div class='checkbox-div'><div>CAM製作：{checkbox}</div><div>CAM審核：{checkbox}</div><div>QA：{checkbox}</div> </div>");
                            var labelTest = HtmlNode.CreateNode($"<div class='checkbox-div'>CAM：{checkbox}  /  {checkbox}  QA：{checkbox}</div>");
                            // 将勾选框添加到 h3 元素后
                            h3Node.AppendChild(labelTest);
                            //h3Node.AppendChild(label2);
                        }
                        else
                        {
                            h3Node.SetAttributeValue("class", "h3Title");
                        }
                    }
                }
            }
            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;
            return modifiedHtml;
        }


        string addAnsweredToHtml(int SurveyId)
        {
            AnsweredSurvey AnsweredSurvey =
        _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == SurveyId);


            // 创建 HtmlDocument 实例并加载 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(AnsweredSurvey.Lochtml);


            //Questions[1].SelectedOption
            // 查询所有 input 元素
            var inputNodes = doc.DocumentNode.SelectNodes("//input[@name]");
            if (inputNodes != null)
            {
                foreach (var inputNode in inputNodes)
                {
                    // 修改 name 属性，追加 _SurveyId
                    string originalName = inputNode.GetAttributeValue("name", "");
                    if (originalName.StartsWith("Questions[") && originalName.Contains(".SelectedOption"))
                    {
                        string modifiedName = $"{originalName}_{SurveyId}";
                        inputNode.SetAttributeValue("name", modifiedName);
                    }
                }
            }

            // 查询所有以 "option_" 开头的元素，并锁定它们



            int[] allCheckedOption =
                JsonConvert.DeserializeObject<int[]>(AnsweredSurvey.AnswerJson);

            if (allCheckedOption == null || allCheckedOption.Length == 0)
            {


            }
            else
            {
                foreach (int optionId in allCheckedOption)
                {

                    AnswerController.SetTargetOptionValue(doc, optionId, true);
                }
            }

            var nodes = doc.DocumentNode.SelectNodes("//*[@id]");
            
            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;


            return modifiedHtml;
        }


        
        string  getServeyAnsweredHtml(int  SurveyId)
        {
            AnsweredSurvey AnsweredSurvey =
        _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == SurveyId);


            // 创建 HtmlDocument 实例并加载 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(AnsweredSurvey.Lochtml);



            
            //Questions[1].SelectedOption
            // 查询所有 input 元素
            //var inputNodes = doc.DocumentNode.SelectNodes("//input[@name]");
            //if (inputNodes != null)
            //{
            //    foreach (var inputNode in inputNodes)
            //    {
            //        // 修改 name 属性，追加 _SurveyId
            //        string originalName = inputNode.GetAttributeValue("name", "");
            //        if (originalName.StartsWith("Questions[") && originalName.Contains(".SelectedOption"))
            //        {
            //            string modifiedName = $"{originalName}_{SurveyId}";
            //            inputNode.SetAttributeValue("name", modifiedName);
            //        }
            //    }
            //}

            // 查询所有以 "option_" 开头的元素，并锁定它们
       
      

            int[] allCheckedOption =
                JsonConvert.DeserializeObject<int[]>(AnsweredSurvey.AnswerJson);

            //if (allCheckedOption == null || allCheckedOption.Length==0) {


            //}
            //else{
            //    foreach (int optionId in allCheckedOption)
            //    {

            //        AnswerController.SetTargetOptionValue(doc, optionId, true);
            //    }
            //}

            if (allCheckedOption != null && allCheckedOption.Length > 0)
            {
                foreach (int optionId in allCheckedOption)
                {
                    AnswerController.SetTargetOptionValue(doc, optionId, true);
                }
            }

            //var nodes = doc.DocumentNode.SelectNodes("//*[@id]");
            //if (nodes != null)
            //{
            //    foreach (var node in nodes)
            //    {
            //        if (node.Id.StartsWith("option_"))
            //        {
            //            node.SetAttributeValue("disabled", "true");
            //        }
            //    }
            //}
            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;


            return modifiedHtml;
        }

        string HideUnselectedOptions(string OldHtmlBtId)
        {
            // 创建 HtmlDocument 实例并加载旧的 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(OldHtmlBtId);

            // 选择所有的 input 元素（假设选项是 input 元素）
            var inputNodes = doc.DocumentNode.SelectNodes("//input[@name]");

            if (inputNodes != null)
            {
                foreach (var inputNode in inputNodes)
                {
                    // 判断该选项是否未被选中
                    if (inputNode.GetAttributeValue("checked", null) == null)
                    {
                        // 隐藏未选中的 input 元素
                        inputNode.SetAttributeValue("style", "display: none;");

                        // 查找与该 input 元素关联的 label 元素
                        var labelNode = doc.DocumentNode.SelectSingleNode($"//label[@for='{inputNode.GetAttributeValue("id", "")}']");

                        // 如果找到 label 元素，隐藏它
                        if (labelNode != null)
                        {
                            labelNode.SetAttributeValue("style", "display: none;");
                        }
                    }
                }
            }

            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;

            return modifiedHtml;
        }

        string RemoveBrTagsExceptAfterLabel(string OldHtmlBtId)
        {
            // 创建 HtmlDocument 实例并加载旧的 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(OldHtmlBtId);

            // 查找所有的 <br> 标签
            var brNodes = doc.DocumentNode.SelectNodes("//br");

            if (brNodes != null)
            {
                foreach (var brNode in brNodes.ToList())  // 使用 ToList() 以便在遍历时删除
                {
                    // 查找该 <br> 标签之前的第一个 <label> 标签
                    var previousLabelNode = brNode.PreviousSibling;
                    bool isAfterLabel = false;

                    // 遍历直到找到 <label> 标签或到达文档的开始
                    while (previousLabelNode != null)
                    {
                        // 如果找到了一个有效的 <label> 标签
                        if (previousLabelNode.Name == "label" && previousLabelNode.GetAttributeValue("style", "") != "display: none;")
                        {
                            isAfterLabel = true;
                            break;
                        }

                        // 如果 <br> 前面是另一个 <br> 标签，继续查找
                        if (previousLabelNode.Name == "br")
                        {
                            previousLabelNode = previousLabelNode.PreviousSibling;
                            continue;
                        }

                        // 如果不是 <label> 或 <br> 标签，停止
                        break;
                    }

                    // 如果 <br> 标签不是在 <label> 后，删除它
                    if (!isAfterLabel)
                    {
                        brNode.Remove();
                    }
                }
            }

            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;

            return modifiedHtml;
        }


        //查看

        public IActionResult ServeyView(int SurveyId)
        {
            var currentSurvey = _unitOfWork.AnsweredSurvey.GetFirstOrDefault(asu => asu.Id == SurveyId);
            var last = _unitOfWork.AnsweredSurvey.GetAll(asur => asur.MtNum == currentSurvey.MtNum && asur.ProcessCategoryId == currentSurvey.ProcessCategoryId).ToList().FindLast(ans => ans != null).Id;
            var surveyCount = last;//_unitOfWork.AnsweredSurvey.GetAll(ans => ans.MtNum == currentSurvey.MtNum).ToList().Count();
            // 获取修改后的 HTML
            CheckSurveyVM ck = new CheckSurveyVM() 
            { 
                html = getServeyAnsweredHtml(SurveyId),
                SelectedSurvey = currentSurvey,
                SurveyCount = surveyCount
            };
            return View(ck);
        }

        [HttpPost]
        public IActionResult UpdateStatus(int surveyId, int surveyCount) 
        {
            //SurveyId = 7 & SurveyCount = 50
            var SelectSurvey = _unitOfWork.AnsweredSurvey.GetFirstOrDefault(ans => ans.Id == surveyId);
            SelectSurvey.status = "CAM";
            _unitOfWork.SaveChanges();
            if (surveyId == surveyCount) 
            {
                return RedirectToAction("PageView", new { 
                    MtNum = SelectSurvey.MtNum,
                    ProcessNum = SelectSurvey.ProcessCategoryId,
                    PageName = SelectSurvey.PageName
                });
            }
            int nextId = surveyId + 1;
            return RedirectToAction("ServeyView", new { SurveyId = nextId,  SurveyCount = surveyCount });
        }

        [HttpPost]
        public IActionResult AddNotes([FromBody] AnsweredIndexVM.CreateNotesRequest request)   //Notes
        {
            try
            {
                // 基本驗證
                if (string.IsNullOrEmpty(request.MtNum))
                {
                    return Json(new { success = false, message = "料號不可為空" });
                }

                if (request.PcbCategoryId <= 0)
                {
                    return Json(new { success = false, message = "請選擇 PCB 類別" });
                }
                string currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
                ApplicationUser currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);
                var existNotes = _unitOfWork.AnsweredNotes.GetFirstOrDefault(a => a.MtNum == request.MtNum);
                if (existNotes != null)
                {
                    return Json(new { success = false, message = "已存在重複料號" });
                }
                var newNote = new AnsweredNotes
                {
                    PcbCategoryId = request.PcbCategoryId,
                    MtNum = request.MtNum,
                    OptionList = JsonConvert.SerializeObject(request.OptionList),
                    CreateTime = DateTime.Now,
                    CompleteTime = DateTime.Now,
                    ApplicationUser = currentUser,
                    JobName = currentUser?.Name,
                    JobNum = currentUser?.Address,
                    status = "作答編輯中",
                };

                var log = new NotesModify
                {
                    MtNum = request.MtNum,
                    Status = newNote.status,
                    Stage = 0,
                    ApplicationUser = currentUser,
                    JobName = currentUser?.Name,
                    JobNum = currentUser?.Address,
                    CreateTime = newNote.CreateTime,
                    CompleteTime = newNote.CompleteTime,
                };

                _unitOfWork.AnsweredNotes.Add(newNote);
                _unitOfWork.NotesModify.Add(log);
                _unitOfWork.Save();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }

        }
        

        //bool AddNewNotes_IdMode(string MtNum , int PcbCategoryId)
        //{
        //    Dictionary<int, Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>>
        //        PcbDic
        //    = GetAllTargetSurveyId(PcbCategoryId);

        //    if(PcbDic.Count<=0)
        //    {
        //        return false;
        //    }

        //    //建立 空的PCB
        //    foreach (var PCB_KVP in PcbDic)
        //    {
        //        int PcbId = PCB_KVP.Key;
        //        Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>
        //            ProcessDic = PCB_KVP.Value;
        //        List<int> AnsweredProcessIDs = new List<int>();
        //        AnsweredNotes AnsweredNotes = addAnsweredNotes_IdMode(MtNum, PcbCategoryId);
        //        //建立 空的AnsweredProcess
        //        foreach (var Process_KVP in ProcessDic)
        //        {
        //            int ProcessId = Process_KVP.Key;
        //            Dictionary<int, Dictionary<int, Survey>>
        //                PageDic = Process_KVP.Value;
        //            List<int> AnsweredPageIDs = new List<int>();
        //            AnsweredProcess answeredProcess = addAnsweredProcess_IdMode(MtNum, PcbCategoryId, ProcessId);
        //            AnsweredProcessIDs.Add(answeredProcess.Id);

        //            //建立 空的AnsweredPage
        //            foreach (var Page_KVP in PageDic)
        //            {
        //                int PageId = Page_KVP.Key;
        //                Dictionary<int, Survey>
        //                    SurveyDic = Page_KVP.Value;

        //                List<int> AnsweredSurveyIDs = new List<int>();

        //                AnsweredPage answeredPage = addAnsweredPage_IdMode(MtNum, PcbCategoryId, ProcessId, PageId);
        //                string PageName = answeredPage.PageName;

        //                AnsweredPageIDs.Add(answeredPage.Id);
        //                //建立 空的AnsweredSurvey
        //                foreach (var Survey_KVP in SurveyDic)
        //                {
        //                    int SurveyId = Survey_KVP.Key;
        //                    Survey Survey = Survey_KVP.Value;

        //                    AnsweredSurvey AnsweredSurvey = addAnsweredSurvey_IdMode(MtNum, PcbCategoryId, ProcessId, PageName, SurveyId, Survey);
        //                    AnsweredSurveyIDs.Add(AnsweredSurvey.Id);
        //                }

        //                answeredPage.SurveyOrderJson = JsonConvert.SerializeObject(AnsweredSurveyIDs);
        //                _unitOfWork.AnsweredPage.Update(answeredPage);
        //                _unitOfWork.Save(); // 先保存問卷，取得 ID
        //            }

        //            answeredProcess.PageOrderJson = JsonConvert.SerializeObject(AnsweredPageIDs);
        //            _unitOfWork.AnsweredProcess.Update(answeredProcess);
        //            _unitOfWork.Save(); // 先保存問卷，取得 ID
        //        }

        //        //AnsweredNotes.ProcessOrderJson= JsonConvert.SerializeObject(AnsweredProcessIDs);
        //        _unitOfWork.AnsweredNotes.Update(AnsweredNotes);
        //        _unitOfWork.Save(); // 先保存問卷，取得 ID

        //    }

        //    return true;

        //}

       
        #region IdMode
        AnsweredSurvey addAnsweredSurvey_IdMode(string MtNum, int PcbCategoryId ,int ProcessCategoryId, string PageName, int SurveyId, Survey _Survey)
        {
            AnsweredSurvey AnsweredSurvey = new AnsweredSurvey();

            #region 填充AnsweredSurvey

            //AnsweredSurvey.Survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == SurveyId);
            AnsweredSurvey.MtNum = MtNum;
            AnsweredSurvey.PcbCategoryId = PcbCategoryId;
            AnsweredSurvey.ProcessCategoryId = ProcessCategoryId;
            AnsweredSurvey.PageName = PageName;
            AnsweredSurvey.Title = _Survey.Title;
            AnsweredSurvey.Survey = _Survey;
            AnsweredSurvey.Lochtml = AnswerController.GetTargetTakeSurveyVM(SurveyId, _unitOfWork, false).MceHtml;

            AnsweredSurvey.AnswerJson = "";

            _unitOfWork.AnsweredSurvey.Add(AnsweredSurvey);
            _unitOfWork.Save(); // 先保存問卷，取得 ID

            #endregion
            return AnsweredSurvey;
        }

        AnsweredPage addAnsweredPage_IdMode(string MtNum,int PcbCategoryId, int ProcessCategoryId, int PageId)
        {

            SurveyGroup SG = _unitOfWork.SurveyGroup.GetFirstOrDefault(sg => sg.Id == PageId);

            AnsweredPage AnsweredPage = new AnsweredPage();

            AnsweredPage.MtNum = MtNum;
            AnsweredPage.PcbCategoryId = PcbCategoryId;
            AnsweredPage.ProcessCategoryId = ProcessCategoryId;
            AnsweredPage.PageName = SG.Name;


            AnsweredPage.SortOrder = SG.Order;

            _unitOfWork.AnsweredPage.Add(AnsweredPage);
            _unitOfWork.Save(); // 先保存問卷，取得 ID
            return AnsweredPage;
        }

        AnsweredProcess addAnsweredProcess_IdMode(string MtNum, int PcbCategoryId, int ProcessId)
        {
            AnsweredProcess AnsweredProcess = new AnsweredProcess();

            AnsweredProcess.MtNum = MtNum;
            AnsweredProcess.PcbCategoryId= PcbCategoryId;
            AnsweredProcess.ProcessCategoryId = ProcessId;

            _unitOfWork.AnsweredProcess.Add(AnsweredProcess);
            _unitOfWork.Save(); // 先保存問卷，取得 ID
            return AnsweredProcess;
        }

        AnsweredNotes addAnsweredNotes_IdMode(string MtNum, int PcbId)
        {

            Category SG = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == PcbId);

            //要做 null 防呆
            AnsweredNotes AnsweredNotes = new AnsweredNotes();

            AnsweredNotes.MtNum = MtNum;
            AnsweredNotes.PcbCategoryId = PcbId;

            string currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
            ApplicationUser currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);


            AnsweredNotes.ApplicationUser = currentUser;
            AnsweredNotes.JobName = currentUser?.Name;  // 設定問卷的建立人名稱
            AnsweredNotes.JobNum = currentUser?.Address;  // 設定問卷的建立人地址


            _unitOfWork.AnsweredNotes.Add(AnsweredNotes);
            _unitOfWork.Save(); // 先保存問卷，取得 ID

            return AnsweredNotes;
        }
        #endregion

        public Dictionary<int, Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>>
            GetAllTargetSurveyId(int CategoryID)   //NotesList
        {
            //  CategoryID  LayerID(Process)  SurveyGroupId(Page)   SurveyID
            Dictionary<int, Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>> SurveyDic
            = new Dictionary<int, Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>>();

            List<SurveyToGroup> SurveyToGroupList = _unitOfWork.SurveyToGroup
               .GetAll(stg => stg.CategoryId== CategoryID && stg.SurveyId != null).ToList();

            foreach (SurveyToGroup surveyToGroup in SurveyToGroupList)
            {
                int? categoryId  = null;
                int? processId   = null;
                int? pageId      = null;
                int? surveyId    = null;

                if(surveyToGroup.CategoryId!=null)
                {
                  categoryId = (int)surveyToGroup.CategoryId;
                }
                if (surveyToGroup.LayerId != null)
                {
                    processId = (int)surveyToGroup.LayerId;
                }
                if (surveyToGroup.SurveyGroupId != null)
                {
                    pageId = (int)surveyToGroup.SurveyGroupId;
                }
                if (surveyToGroup.SurveyId != null)
                {
                    surveyId = (int)surveyToGroup.SurveyId;
                }

                // 根據categoryId初始化
                if(categoryId!=null)
                {
                    if (!SurveyDic.ContainsKey((int)categoryId))
                    {
                        SurveyDic[(int)categoryId] = new Dictionary<int, Dictionary<int, Dictionary<int, Survey>>>();
                    }

                    // 根據ProcessId初始化
                    if (processId != null)
                    {
                        if (!SurveyDic[(int)categoryId].ContainsKey((int)processId))
                        {
                            SurveyDic[(int)categoryId][(int)processId] = new Dictionary<int, Dictionary<int, Survey>>();
                        }


                        if (pageId != null)
                        {
                            // 根據PageId初始化
                            if (!SurveyDic[(int)categoryId][(int)processId].ContainsKey((int)pageId))
                            {
                                SurveyDic[(int)categoryId][(int)processId][(int)pageId] = new Dictionary<int, Survey>();
                            }


                            if (surveyId != null)
                            {
                                if (!SurveyDic[(int)categoryId][(int)processId][(int)pageId].ContainsKey((int)surveyId))
                                {
                                    Survey targetSurvey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyId);
                                    if (targetSurvey != null)
                                    {
                                        SurveyDic[(int)categoryId][(int)processId][(int)pageId][(int)surveyId] = targetSurvey;
                                    }
                                    else
                                    {
                                        throw new InvalidOperationException($"Survey with ID {surveyId} not found.");
                                    }
                                }
                            }


                        }

                    }
                }

            }

            return SurveyDic;
        }





        public IActionResult Details(int orderId)
        {

            OrderVM = new OrderVM
            {
                //根據訂單標題內的訂購人id，顯示訂購人的資訊，以及顯示訂單內所有產品的內容
                OrderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == orderId,
                    includeProperties: "ApplicationUser"),

                OrderDetail = _unitOfWork.OrderDetail.GetAll(u => u.OrderHeaderId 
                                                                  == orderId, includeProperties: "Product")
            };

            return View(OrderVM);
        }

        [HttpPost]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Employee + "," + SD.Role_Manager)]

        public IActionResult UpdateOrderDetail()
        {
            var orderHeaderFromDb = _unitOfWork.OrderHeader.Get(u => u.Id ==
                                                                     OrderVM.OrderHeader.Id);
            orderHeaderFromDb.Name = OrderVM.OrderHeader.Name;
            orderHeaderFromDb.PhoneNumber = OrderVM.OrderHeader.PhoneNumber;
            orderHeaderFromDb.Address = OrderVM.OrderHeader.Address;

            _unitOfWork.OrderHeader.Update(orderHeaderFromDb);
            _unitOfWork.Save();

            TempData["Success"] = "訂購人資訊更新成功！";

            return RedirectToAction(nameof(Details), new { orderId = orderHeaderFromDb.Id });
        }

        [HttpPost]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Employee + "," + SD.Role_Manager)]

        public IActionResult StartProcessing()
        {
            _unitOfWork.OrderHeader.UpdateStatus(OrderVM.OrderHeader.Id,
                SD.StatusInProcess);
            _unitOfWork.Save();

            TempData["Success"] = "訂單狀態更新成功！";

            return RedirectToAction(nameof(Details), new { orderId = OrderVM.OrderHeader.Id });
        }

        [HttpPost]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Employee + "," + SD.Role_Manager)]

        public IActionResult OrderReady()
        {
            _unitOfWork.OrderHeader.UpdateStatus(OrderVM.OrderHeader.Id,
                SD.StatusReady);
            _unitOfWork.Save();

            TempData["Success"] = "訂單狀態更新成功！";

            return RedirectToAction(nameof(Details), new { orderId = OrderVM.OrderHeader.Id });
        }

        [HttpPost]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Employee + "," + SD.Role_Manager)]

        public IActionResult OrderCompleted()
        {
            _unitOfWork.OrderHeader.UpdateStatus(OrderVM.OrderHeader.Id,
                SD.StatusCompleted);
            _unitOfWork.Save();

            TempData["Success"] = "訂單狀態更新成功！";

            return RedirectToAction(nameof(Details), new { orderId = OrderVM.OrderHeader.Id });
        }

        [HttpPost]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Employee + "," + SD.Role_Manager)]

        public IActionResult CancelOrder()
        {
            _unitOfWork.OrderHeader.UpdateStatus(OrderVM.OrderHeader.Id,
                SD.StatusCancelled);
            _unitOfWork.Save();

            TempData["Success"] = "訂單狀態更新成功！";

            return RedirectToAction(nameof(Details), new { orderId = OrderVM.OrderHeader.Id });
        }


        #region API CALLS


        [HttpDelete]
        
        public IActionResult DeleteNotes(string MtNum) 
        {
            if (MtNum != null) 
            {
                var NotesToBeDelete = _unitOfWork.AnsweredNotes.GetFirstOrDefault(ansn => ansn.MtNum == MtNum);
                var LogsToBeDelete = _unitOfWork.NotesModify.GetAll(n => n.MtNum == MtNum);
                //var ProcessesToBeDelete = _unitOfWork.AnsweredProcess.GetAll(anspr => anspr.MtNum == MtNum);
                //var SurveysToBeDelete = _unitOfWork.AnsweredSurvey.GetAll(anss => anss.MtNum == MtNum);
                if (NotesToBeDelete != null) 
                {
                    _unitOfWork.AnsweredNotes.Remove(NotesToBeDelete);
                }
                if (LogsToBeDelete != null)
                {
                    _unitOfWork.NotesModify.RemoveRange(LogsToBeDelete);
                }
                //if (ProcessesToBeDelete != null) 
                //{
                //    _unitOfWork.AnsweredProcess.RemoveRange(ProcessesToBeDelete);
                //}
                //if (SurveysToBeDelete != null)
                //{
                //    _unitOfWork.AnsweredSurvey.RemoveRange(SurveysToBeDelete);
                //}
            }
            _db.IsHardDelete = true;
            _unitOfWork.Save();
            _db.IsHardDelete = false ;
            return Json(new { success = true, message = "刪除成功" });
        }
        

        [HttpGet]
        public IActionResult GetAll(string status)
        {
            IEnumerable<OrderHeader> objOrderHeaders;

            if (User.IsInRole(SD.Role_Admin) || User.IsInRole(SD.Role_Employee)
                                             || User.IsInRole(SD.Role_Manager))
            {
                objOrderHeaders = _unitOfWork.OrderHeader
                    .GetAll(includeProperties: "ApplicationUser").ToList();
            }
            else
            {
                var claimsIdentity = (ClaimsIdentity)User.Identity;
                var userId = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier).Value;
                objOrderHeaders = _unitOfWork.OrderHeader.GetAll(u =>
                    u.ApplicationUserId == userId, includeProperties: "ApplicationUser");

            }


            switch (status)
            {
                case "Pending":
                    objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == SD.StatusPending);
                    break;
                case "Processing":
                    objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == SD.StatusInProcess);
                    break;
                case "Ready":
                    objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == SD.StatusReady);
                    break;
                case "Completed":
                    objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == SD.StatusCompleted);
                    break;
                default:
                    break;
            }
            return Json(new { data = objOrderHeaders });
        }


        [HttpPost]
        public IActionResult ToggleStatus(int surveyId)
        {
            var survey = _unitOfWork.AnsweredSurvey.GetFirstOrDefault(s => s.Id == surveyId);
            if (survey != null)
            {
                // 切換 status
                // is this condition true ? YES : NO
                survey.status = (survey.status == "CAM") ? null : "CAM";
                _unitOfWork.Save();
                return Json(new { status = survey.status }); // 返回更新後的 status
            }
            return Json(new { status = "error" }); // 如果沒有找到該 Survey
        }



        [HttpGet]

        public IActionResult GetSurvey(int categoryId, string processName)
        {
            var categoryName = _unitOfWork.Category.Get(c => c.Id == categoryId).Name;
            List<object> surveys = new List<object>(); 
            if (categoryId == 3)
            {
                var extraSurveys = _unitOfWork.DocumentExport.GetAll(d => d.Category == "硬板" && d.Station == processName).Select(d => new
                {
                    Id = d.Id,
                    Category = d.Category,
                    Station = d.Station,
                    PageNo = d.PageNo,
                    DocumentId = d.DocumentId,
                    Version = d.Version
                }).ToList();
                surveys.AddRange(extraSurveys);
            }
            var surveyList = _unitOfWork.DocumentExport
                .GetAll(d => d.Category == categoryName && d.Station == processName)
                .Select(d => new
                {
                    Id= d.Id,
                    Category = d.Category,
                    Station = d.Station,
                    PageNo = d.PageNo,
                    DocumentId = d.DocumentId,
                    Version = d.Version
                }).ToList();
            surveys.AddRange(surveyList);
            return Json(new { data = surveys });
        }


        [HttpGet]

        public IActionResult GetProcessesByCategory(int categoryId, string processType)
        {

            var layer = _unitOfWork.Layer.Get(l => l.Name == processType);
            if (layer == null)
            {
                return Json(new
                {
                    success = false,
                    message = $"流程類型 '{processType}' 不存在"
                });
            }


            var processes = _unitOfWork.BlankSurvey
                .GetAll(b => b.CategoryId == categoryId && b.LayerId == layer.Id)
                .Select(b => new { Id = b.Id, Name = b.Name })
                .ToList();

            return Json(new
            {
                success = true,
                data = processes
            });
        }


        [HttpGet]

        public IActionResult GetBlankSurvey(int id) { 
            var blankSurvey = _unitOfWork.BlankSurvey.Get(b => b.Id == id);
            if (blankSurvey == null) 
            {
                return Json(new
                {
                    success = false,
                    message = "無此問卷!"
                });
            }

            var selectedIds = blankSurvey.SelectedIds ?? new List<int>();


            var surveyData = _unitOfWork.DocumentExport
                .GetAll(s => selectedIds.Contains(s.Id))
                .Select(s => new
                {
                    surveyId = s.Id,
                    version = s.Version
                })
                .ToList();

            return Json(new
            {
                success = true,
                data = surveyData
            });
        }

        ///input： CategoryId 、 Station  、 Suffix
        [HttpGet]
        public IActionResult GetBlankSurveyDefault(int categoryId, string layer)
        {

            if(categoryId == 0)
            {
                return Json(new
                {
                    success = false,
                    message = "無此問卷!"
                });
            }
            var targetCategory = _unitOfWork.Category
                .GetFirstOrDefault(c => c.Id == categoryId).Name;

            var selectSurvey = _unitOfWork.DocumentExport
                .GetAll(d => d.Category == targetCategory && d.Station == layer && !d.PageNo.Contains("-"))
                .Select(s => new
                {
                    surveyId = s.Id,
                    version = s.Version
                })
                .ToList();
            return Json(new
            {
                success = true,
                data = selectSurvey
            });
        }



        [HttpGet]
        public IActionResult GetBlankSurveyToOption(int id)
        {
            if (id == 0)
            {
                return Json(new
                {
                    success = false,
                    message = "無此問卷"
                });
            }
                var blankSurvey = _unitOfWork.BlankSurvey.Get(b => b.Id == id);
            var targetLayer = _unitOfWork.Layer.Get(l => l.Id == blankSurvey.LayerId).Name;
            if (blankSurvey == null || targetLayer == null)
            {
                return Json(new
                {
                    success = false,
                    message = "無此問卷"
                });
            }

            return Json(new
            {
                success = true,
                data = new
                {
                    selectedIds = blankSurvey.SelectedIds,
                    CategoryId = blankSurvey.CategoryId,
                    processName = targetLayer,
                }
            });
        }


        [HttpPost]
        public IActionResult UpdateSurveyOptions([FromBody] UpdateOptionRequest request) 
        {
            var existOption = _unitOfWork.BlankSurvey.GetFirstOrDefault(b => b.Id == request.BlankSurveyId);
            existOption.Name = request.OptionName;
            existOption.SelectedIds = request.SurveyIds;
            _unitOfWork.SaveChanges();

            return Json(new { success = true, message = "更新完成" });
        }


        #endregion
    }
}
