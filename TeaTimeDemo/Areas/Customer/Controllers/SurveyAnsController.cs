using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mono.TextTemplating;
using Newtonsoft.Json;
using TeaTimeDemo.DataAccess.Repository;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.AnswersData.ViewModels;
using TeaTimeDemo.Models.ViewModels;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;
using static TeaTimeDemo.Models.ViewModels.LoadSurveyVM;


namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")] // 指定區域為 Customer
    [Authorize] // 確保只有登入的使用者能夠存取
    public class SurveyAnsController : Controller
    {

        private readonly IUnitOfWork _unitOfWork;
        public SurveyAnsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //
        public IActionResult Index(string MtNum, string ProcessName, bool vali = false)
        {

            Console.WriteLine("Index");

            //撈取AnsweredNotes  所有資料
            var TargetAnsweredNote = _unitOfWork.AnsweredNotes.GetFirstOrDefault(s => s.MtNum == MtNum);

            if (TargetAnsweredNote == null)
            {
                return NotFound($"No AnsweredNote found with MtNum: {MtNum}");
            }

            //反序列化 流程及問卷
            var optionSelections = JsonConvert.DeserializeObject<List<OptionSelection>>(TargetAnsweredNote.OptionList);

            //找出目標的流程跟問卷清單
            OptionSelection targetoptionSelection = optionSelections.FirstOrDefault(o => o.ProcessName == ProcessName);

            List<PageSelection> PageSelectionList = new List<PageSelection>();

            if(vali)
            {
                PageSelectionList = optionSelections
                .Where(o => o.PageList != null) // 避免 PageList 為 null
                .SelectMany(o => o.PageList)
                .ToList();

            }
            else
            {
                PageSelectionList = targetoptionSelection.PageList;
            }

                //-----------------------------------------------------------------------------------------------------------


                //新增空容器來裝目標問卷
                var surveyHtmlDataList = new List<LoadSurveyVM.surveyHtmlData>();


            var _Stage = TargetAnsweredNote.stage;

            for (int i = 0; i < PageSelectionList.Count; i++)
            {
                var surveySelectionData  = PageSelectionList[i];

                int DocumentExportId   = surveySelectionData.SurveyId;
                int Version = surveySelectionData.Version;

                //抓取目標問卷的架構資料
                var surveyData = _unitOfWork.DbContext.DocumentExports.FirstOrDefault(d => d.Id == DocumentExportId);

                if(surveyData==null)
                {
                    continue;
                }

                //根據目標 DocumentExportId 跟版本 找到該目標的html
                var htmlSections = _unitOfWork.DbContext.HtmlSections
                .Where(h => h.DocumentExportId == DocumentExportId && h.Version == Version)
                .OrderBy(h => h.Id)
                .Select(h => h.HtmlPart)
                .ToList();

                //組合fullHtml
                string fullHtml = string.Join("", htmlSections);


                // _unitOfWork.DbContext.MtNumAnswereds
                //根據目標 DocumentExportId 跟版本 找到該目標的html------------------

                //-----------------------------------------------------------------------------------------------//
                //   int surveyId = surveyData.Id;  // 先轉換為 int                                              //
                //   var AnsJson = _unitOfWork.DbContext.MtNumAnswereds                                          //
                //      .Where(h => h.MtNum == MtNum &&                                                          //
                //                  h.SurveyId == surveyId &&                                                    //
                //                  h.Version == surveyData.Version)                                             //
                //      .OrderByDescending(h => h.Stage)  // 依照 stage 由大到小排序                             //
                //      .Select(h => h.AnsweredJson)      // 只取 AnsweredJson                                   //
                //      .FirstOrDefault() ?? "";        // 取最大 stage 的資料，若為 null 則回傳 "[]"            //
                //   Console.WriteLine($"獲取資料   {MtNum}   {surveyId}   {surveyData.Version}   {AnsJson}");   //
                //                                                                                               //
                //-----------------------------------------------------------------------------------------------//


                int surveyId = surveyData.Id;  // 先轉換為 int 
                var AnsJson = "";
                var Images = "";

                var latestAnswerDebug = _unitOfWork.DbContext.MtNumAnswereds
                      .Where(h => h.MtNum == MtNum &&
                                  h.SurveyId == surveyId &&
                                  h.Version == surveyData.Version &&
                                  h.Stage <= _Stage)
                      .OrderByDescending(h => h.Stage)
                      .FirstOrDefault();

                if (latestAnswerDebug != null)
                {
                    AnsJson = latestAnswerDebug.AnsweredJson;
                    Images = latestAnswerDebug.Images;
                }


                //-------------------------------------------------------------------


                //組合surveyHtmlData
                var _surveyHtmlData = new LoadSurveyVM.surveyHtmlData();

                _surveyHtmlData.pcb_category = surveyData.Category;
                _surveyHtmlData.station = surveyData.Station;
                _surveyHtmlData.suffix =   surveyData.Suffix;
                _surveyHtmlData.pageNum =  int.Parse(surveyData.PageNo);
                _surveyHtmlData.documentId = surveyData.DocumentId;
                _surveyHtmlData.id = surveyData.Id;
                _surveyHtmlData.value = surveyData.Version;
                _surveyHtmlData.html = fullHtml;
                _surveyHtmlData.ansJson = AnsJson;
                _surveyHtmlData.images = surveyData.Images;

                surveyHtmlDataList.Add(_surveyHtmlData);
            }



            surveyHtmlDataList = surveyHtmlDataList
            .OrderBy(x => x.station == "PNL" ? 0 :
                          x.station == "內層" ? 1 :
                          x.station == "外層" ? 2 : 
                          x.station == "印字" ? 3 : 
                          x.station == "防焊" ? 4 : 
                          x.station == "其他" ? 5 : 6
                          )
            .ThenBy(x => x.suffix == "" ? 0 : x.suffix == "一般" ? 1 : 2) // "" 最前, "一般" 第二, 其他為 2
            .ThenBy(x => x.suffix) // 其他 suffix 按字母排序
            .ThenBy(x => x.pageNum) // PageNum 由小到大
            .ToList();

            //------------------------------------------------

            var model = new LoadSurveyVM();
            model.MtNum = MtNum;
            model.stage = _Stage; //TargetAnsweredNote.sta

            model.surveyHtmlDataList = surveyHtmlDataList;

            foreach (var item in model.surveyHtmlDataList)
            {
                Console.WriteLine($"{item.suffix}   {item.pageNum}   {item.ansJson}   Stage : {_Stage}");
            }

            //model
            return View(model);
        }








    }
}


