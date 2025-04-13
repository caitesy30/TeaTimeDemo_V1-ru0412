// AnswerController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

using System.Text;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System.Web;
using HtmlAgilityPack;


namespace TeaTimeDemo.Controllers
{
    [Area("Customer")] // 指定區域為 Customer
    [Authorize] // 確保只有登入的使用者能夠存取
    public class AnswerController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public AnswerController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // 顯示所有已發布的問卷
        public IActionResult Index()
        {
            var surveys = _unitOfWork.Survey.GetAll(
                filter: s => s.IsPublished,
                includeProperties: "Questions.QuestionOptions");

            return View(surveys);
        }


        // 顯示所有已作答的問卷
        public IActionResult AnsweredSurveyList()
        {
            IEnumerable<AnsweredSurvey> AnsweredSurveys =
                _unitOfWork.AnsweredSurvey.GetAll(includeProperties: "Survey");


            //顯示 已填問卷
            return View(AnsweredSurveys);
        }

        public IActionResult AnsweredSurveyView(int id)
        {
            AnsweredSurvey AnsweredSurvey =
                _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == id );



            // 创建 HtmlDocument 实例并加载 HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(AnsweredSurvey.Lochtml);

            // 查询所有以 "option_" 开头的元素，并锁定它们
            var nodes = doc.DocumentNode.SelectNodes("//*[@id]");
            if (nodes != null)
            {
                foreach (var node in nodes)
                {
                    if (node.Id.StartsWith("option_"))
                    {
                        node.SetAttributeValue("disabled", "true");
                    }
                }
            }

            //Dictionary<int, QuestionDto> inputQuestionsMap = 
            //    JsonConvert.DeserializeObject<Dictionary<int, QuestionDto>>(AnsweredSurvey.AnswerJson);

            //List<int> allCheckedOption = new List<int>();

            int[] allCheckedOption =
                JsonConvert.DeserializeObject<int[]>(AnsweredSurvey.AnswerJson);

            //foreach (var item in inputQuestionsMap)
            //{
            //    allCheckedOption.AddRange(item.Value.OptionArr);
            //}
            if(allCheckedOption!=null&& allCheckedOption.Length > 0)
            {
                foreach (int optionId in allCheckedOption)
                {
                    SetTargetOptionValue(doc, optionId, true);
                }
            }
            // 获取修改后的 HTML
            string modifiedHtml = doc.DocumentNode.OuterHtml;


            return View((object)modifiedHtml);
        }

        public static bool SetTargetOptionValue(HtmlDocument doc, int _int, bool _bool)
        {
            // 构建 ID 为 "option_" + _int 的元素选择器
            var radioButton = doc.DocumentNode.SelectSingleNode($"//*[@id='option_{_int}']");

            // 确保找到了该单选框
            if (radioButton != null)
            {
                if (_bool)
                {
                    radioButton.SetAttributeValue("checked", "checked");
                }
                else
                {
                    // 移除 checked 属性
                    radioButton.Attributes.Remove("checked");
                }
                return true;
            }
            else
            {
                Console.WriteLine($"沒有找到目標選項Id [option_{_int}]");
                return false;
            }
        }



        public IActionResult DeleteAnsweredSurvey(int id)
        {
            AnsweredSurvey AnsweredSurvey =
                 _unitOfWork.AnsweredSurvey.GetFirstOrDefault(u => u.Id == id);

            _unitOfWork.AnsweredSurvey.Remove(AnsweredSurvey);

            _unitOfWork.Save();

            return RedirectToAction("AnsweredSurveyList"); ;
        }

        
        // 顯示特定問卷的詳細內容及問題
        public IActionResult TakeSurvey(int id)
        {

            return View(GetTargetTakeSurveyVM(id));
        }

        TakeSurveyVM GetTargetTakeSurveyVM(int id)
        {
            return GetTargetTakeSurveyVM(id, _unitOfWork, true);
        }
        public static   TakeSurveyVM GetTargetTakeSurveyVM(int id, IUnitOfWork _unitOfWork,bool IsPublished)
        {
            Survey survey = _unitOfWork.Survey.GetFirstOrDefault(
                s => s.Id == id && ( IsPublished ? s.IsPublished==IsPublished : true ),
                includeProperties: "Questions.QuestionOptions"
            );

            if (survey == null)
            {
                return null;
            }


            SurveyVM surveyVM = new SurveyVM()
            {
                Survey = survey,
                QuestionVMs = survey.Questions.Select(q => new QuestionVM
                {
                    Question = q,
                    QuestionOptionVMs = q.QuestionOptions.Select(o => new QuestionOptionVM
                    {
                        QuestionOption = o
                    }).ToList()
                }).ToList()
            };

            survey.MceHtml = R5AnswerUseTool.ReplacePath(survey.MceHtml);

            TakeSurveyVM takeSurveyVM = new TakeSurveyVM
            (survey, survey.Questions, R5AnswerUseTool.ReplacePath(survey.MceHtml));

            takeSurveyVM.SurveyView.Title = "TestTitle_LOC";

            Console.WriteLine($"\n###[ MceHtml修改前 {survey.Id}]###\n\n{takeSurveyVM.SurveyView.MceHtml}\n\n\n");

            R5AnswerUseTool.FixMceHtml(ref takeSurveyVM);

            Console.WriteLine($"\n###[ MceHtml修改後 ]###\n\n{takeSurveyVM.MceHtml}\n\n###[ 結束 ]###\n");
            Console.WriteLine($"=============================================");


            return takeSurveyVM;
        }



        public IActionResult TestGet(string QuestionsMapJson, string SurveyId)//, string LocHtml)
        {

            //LocHtml   << 太長了  失敗


            QuestionsMapJson = HttpUtility.UrlDecode(QuestionsMapJson);
            
            Console.WriteLine($"TestGet  {QuestionsMapJson}");

            // 反序列化 JSON 字符串為 Dictionary<int, QuestionDto>
            string str = $"=== 問卷ID: [ {SurveyId} ] ===\n\n";
            if (QuestionsMapJson != null)
            {
                var inputQuestionsMap = JsonConvert.DeserializeObject<Dictionary<int, QuestionDto>>(QuestionsMapJson);

                // 驗證接收到的資料
                if (inputQuestionsMap != null)
                {
                    foreach (var kvp in inputQuestionsMap)
                    {
                        var questionId = kvp.Key;
                        var question = kvp.Value;
                        str += $"問題ID:[ {questionId} ]" +
                            $"\n答案類型:[ {GetEnumDisplayName((AnswerTypeEnum)question.AnswerType)} ]" +
                            $"\n選項:[ {string.Join(",", question.OptionArr)} ];\n\n";
                    }
                }
            }

            //updateAnsweredSurvey( QuestionsMapJson,  SurveyId,  LocHtml);
            //return RedirectToAction("Index");


            return Content(QuestionsMapJson);
        }


        [HttpPost]
        public IActionResult TestGetPOST([FromBody] AnsweredSurveyData surveyData)
        {
            Console.WriteLine("TestGetPOST");
            // 確認接收到的資料
            string str = $"=== 問卷ID: [ {surveyData.SurveyId} ] TestGetPOST MODE===\n\n";

            if (surveyData.QuestionsMapJson != null)
            {
                var inputQuestionsMap = JsonConvert.DeserializeObject<Dictionary<int, QuestionDto>>(surveyData.QuestionsMapJson);

                // 驗證接收到的資料
                if (inputQuestionsMap != null)
                {
                    foreach (var kvp in inputQuestionsMap)
                    {
                        var questionId = kvp.Key;
                        var question = kvp.Value;
                        str += $"問題ID:[ {questionId} ]" +
                            $"<br>答案類型:[ {GetEnumDisplayName((AnswerTypeEnum)question.AnswerType)} ]" +
                            $"<br>選項:[ {string.Join(",", question.OptionArr)} ];";
                    }
                }
            }
            updateAnsweredSurvey(surveyData);
            return RedirectToAction("AnsweredSurveyList");
            // 返回處理結果
            //return Content(str);
        }

       

      public  void updateAnsweredSurvey(AnsweredSurveyData surveyData)
        {
            //surveyData.QuestionsMapJson = HttpUtility.UrlDecode(surveyData.QuestionsMapJson);
            //surveyData.LocHtml = HttpUtility.UrlDecode(surveyData.LocHtml);
            //AnsweredSurvey
            
            string AnswerJson = JsonConvert.SerializeObject(surveyData.ArrAllSelectedOptions);

            updateAnsweredSurvey(AnswerJson, surveyData.SurveyId, surveyData.LocHtml);
        }
        void updateAnsweredSurvey(string QuestionsMapJson, string SurveyId, string LocHtml)
        {
            
            if (string.IsNullOrWhiteSpace(QuestionsMapJson))
            {
                //  Dictionary<int, QuestionDto> inputQuestionsMap = JsonConvert.DeserializeObject<Dictionary<int, QuestionDto>>(QuestionsMapJson);

                return;
            }

            //string currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
            //ApplicationUser currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);
            
            AnsweredSurvey AnsweredSurvey = new AnsweredSurvey();
            
            #region 填充AnsweredSurvey
            AnsweredSurvey.Survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == int.Parse(SurveyId));

            AnsweredSurvey.Lochtml = LocHtml;

            //AnsweredSurvey.ApplicationUser = currentUser;
            //AnsweredSurvey.JobName = currentUser?.Name;  // 設定問卷的建立人名稱
            //AnsweredSurvey.JobNum = currentUser?.Address;  // 設定問卷的建立人地址
            //AnsweredSurvey.ApplicationUserId = currentUserId; // 設定建立人的 ID_unitOfWork.AnsweredSurvey.Add(AnsweredSurvey);

            AnsweredSurvey.AnswerJson = QuestionsMapJson;

            _unitOfWork.AnsweredSurvey.Add(AnsweredSurvey);
            _unitOfWork.Save(); // 先保存問卷，取得 ID
            TempData["success"] = "問卷填寫成功!";

            #endregion



        }



        //var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // 取得當前使用者 ID
        //var currentUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == currentUserId);

        //        // 處理新增或編輯問卷
        //        if (surveyVM.Survey.Id == 0)
        //        {
        //            // 設定問卷的建立人資訊
        //            surveyVM.Survey.JobName = currentUser?.Name;  // 設定問卷的建立人名稱
        //            surveyVM.Survey.JobNum = currentUser?.Address;  // 設定問卷的建立人地址
        //            surveyVM.Survey.ApplicationUserId = currentUserId; // 設定建立人的 ID
        //    }



        // 處理問卷提交
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SubmitSurvey(TakeSurveyVM model)
        {
            return NotFound();
            //if(false)
            //if (ModelState.IsValid)
            //{
            //    try
            //    {
            //        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            //        foreach (var questionVM in model.Questions)
            //        {
            //            // 確保 Question 不為 null 並且 Id 已設置
            //            if (questionVM.Question == null || questionVM.Question.Id == 0)
            //            {
            //                // 可能需要從數據庫中重新獲取問題
            //                var questionFromDb = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == questionVM.Question.Id);
            //                if (questionFromDb == null)
            //                {
            //                    ModelState.AddModelError("", "無效的問題 ID。");
            //                    continue; // 跳過此問題
            //                }
            //                questionVM.Question = questionFromDb;
            //            }

            //            var answer = new Answer
            //            {
            //                QuestionId = questionVM.Question.Id,
            //                ApplicationUserId = currentUserId,
            //                AnswerType = questionVM.Question.AnswerType,
            //                AnswerText = questionVM.AnswerText
            //            };

            //            if (questionVM.Question.AnswerType == AnswerTypeEnum.SingleChoice)
            //            {
            //                if (questionVM.SelectedOption.HasValue)
            //                {
            //                    var answerOption = new AnswerOption
            //                    {
            //                        QuestionOptionId = questionVM.SelectedOption.Value,
            //                        Answer = answer
            //                    };
            //                    answer.SelectedOptions.Add(answerOption);
            //                }
            //            }
            //            else if (questionVM.Question.AnswerType == AnswerTypeEnum.MultipleChoice)
            //            {
            //                if (questionVM.SelectedOptions != null)
            //                {
            //                    foreach (var selectedOptionId in questionVM.SelectedOptions)
            //                    {
            //                        var answerOption = new AnswerOption
            //                        {
            //                            QuestionOptionId = selectedOptionId,
            //                            Answer = answer
            //                        };
            //                        answer.SelectedOptions.Add(answerOption);
            //                    }
            //                }
            //            }

            //            _unitOfWork.Answer.Add(answer);
            //        }

            //        _unitOfWork.Save();
            //        TempData["success"] = "感謝您填寫問卷！";
            //        return RedirectToAction("Index");
            //    }
            //    catch (Exception ex)
            //    {
            //        // 記錄例外訊息
            //        Console.WriteLine(ex.Message);
            //        Console.WriteLine(ex.InnerException?.Message);

            //        ModelState.AddModelError("", "提交問卷時發生錯誤，請稍後再試。");
            //    }
            //}

            //// 如果模型無效，重新顯示問卷
            //// 需要重新加載 AnswerTypeList 和 QuestionOptionVMs
            //foreach (var questionVM in model.Questions)
            //{
            //    questionVM.AnswerTypeList = GetAnswerTypeList();
            //    questionVM.QuestionOptionVMs = _unitOfWork.QuestionOption.GetAll(
            //        qo => qo.QuestionId == questionVM.Question.Id
            //    ).Select(o => new QuestionOptionVM { QuestionOption = o }).ToList();
            //}

            //return View("TakeSurvey", model);

            ////  return RedirectToAction("TakeSurvey", new {id = model.Survey.Id });
        }








        // 在這裡添加 GenerateMceHtml 方法
        private string GenerateMceHtml(SurveyVM surveyVM)
        {
            var survey = surveyVM.Survey;
            var questionsHtml = new System.Text.StringBuilder();

            foreach (var questionVM in surveyVM.QuestionVMs)
            {
                var question = questionVM.Question;
                var answerTypeText = GetEnumDisplayName(question.AnswerType);

                // 建立問題的標題
                var questionHtml = $"<h3>{question.QuestionText} ({answerTypeText})</h3>";

                // 添加隱藏欄位以傳遞 Question.Id
                var qIndex = surveyVM.QuestionVMs.IndexOf(questionVM);
                questionHtml += $"<input type=\"hidden\" name=\"Questions[{qIndex}].Question.Id\" value=\"{question.Id}\" />";

                StringBuilder optionsHtml = new System.Text.StringBuilder();

                // 根據答案類型生成相應的輸入欄位
                if (question.AnswerType == AnswerTypeEnum.SingleChoice)
                {
                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        var option = optionVM.QuestionOption;
                        var optionIndex = questionVM.QuestionOptionVMs.IndexOf(optionVM);
                        optionsHtml.Append(
                            $"<input type=\"hidden\" name=\"Questions[{qIndex}].QuestionOptionVMs[{optionIndex}].QuestionOption.Id\" value=\"{option.Id}\" />" +
                            $"<input type=\"radio\" name=\"Questions[{qIndex}].SelectedOption\" value=\"{option.Id}\" id=\"option_{option.Id}\" required> " +
                            $"<label for=\"option_{option.Id}\">{option.OptionText}</label><br />");
                    }
                }
                else if (question.AnswerType == AnswerTypeEnum.MultipleChoice)
                {
                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        var option = optionVM.QuestionOption;
                        var optionIndex = questionVM.QuestionOptionVMs.IndexOf(optionVM);
                        optionsHtml.Append(
                            $"<input type=\"hidden\" name=\"Questions[{qIndex}].QuestionOptionVMs[{optionIndex}].QuestionOption.Id\" value=\"{option.Id}\" />" +
                            $"<input type=\"checkbox\" name=\"Questions[{qIndex}].SelectedOptions\" value=\"{option.Id}\" id=\"option_{option.Id}\"> " +
                            $"<label for=\"option_{option.Id}\">{option.OptionText}</label><br />");
                    }
                }
                else if (question.AnswerType == AnswerTypeEnum.TextAnswer)
                {
                    optionsHtml.Append($"<input type=\"text\" name=\"Questions[{qIndex}].AnswerText\" required class=\"form-control\" /><br />");
                }
                else if (question.AnswerType == AnswerTypeEnum.TextareaAnswer)
                {
                    optionsHtml.Append($"<textarea name=\"Questions[{qIndex}].AnswerText\" required class=\"form-control\"></textarea><br />");
                }

                questionHtml += "<p>" + optionsHtml.ToString() + "</p>";
                questionsHtml.Append(questionHtml);
            }

            // 建立問卷的標題和描述
            var content = $"<h1>{survey.Title}<span style=\"font-size: 0.7em; margin-left: 10px;\">站別: {survey.StationName} 頁數：{survey.QuestionNum}</span></h1>";
            content += $"<p>{survey.Description}</p>";


            content += "<img src = \"@product.ImageUrl\" class=\"card-img-top rounded\" style=\"width: 200px; height: 200px; object-fit: cover; />\n\n";
            content += $"<br>{survey.QuestionImages[0].Id}\n</br>";
            //   /images/survey/e85cd54d-13ee-4995-af7b-41de41ebb19d.jpg
            content += $"<div><img src = \"\\images\\survey\\e85cd54d-13ee-4995-af7b-41de41ebb19d.jpg\" alt = \"問卷圖片\" data - image - id = \"-1\" style = \"width: 240px; height: 200px;\" ></ div >";


            // 加入所有問題的 HTML
            content += questionsHtml.ToString();

            return content;
        }

        // 輔助方法：取得答案類型的下拉選單
        private List<SelectListItem> GetAnswerTypeList()
        {
            var enumValues = Enum.GetValues(typeof(AnswerTypeEnum)).Cast<AnswerTypeEnum>();
            return enumValues.Select(e => new SelectListItem
            {
                Text = GetEnumDisplayName(e),
                Value = ((int)e).ToString()
            }).ToList();
        }

        // 輔助方法：取得枚舉的 Display 名稱
        public static string GetEnumDisplayName(Enum enumValue)
        {
            var displayAttribute = enumValue.GetType().GetField(enumValue.ToString())
                .GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault() as DisplayAttribute;

            return displayAttribute?.Name ?? enumValue.ToString();
        }
    }





}

public class QuestionDto
{
    public int AnswerType { get; set; }
    public List<int> OptionArr { get; set; }
}


public class AnsweredSurveyData
{
    public string AnsweredSurveyId { get; set; }
    public int[] ArrAllSelectedOptions { get; set; }
    public string QuestionsMapJson { get; set; }
    public string SurveyId { get; set; }
    public string LocHtml { get; set; }

    //public string MtNum { get; set; }
    //public string ProcessNum { get; set; }
    //public string PageName { get; set; }



}

public class R5AnswerUseTool
{


    public static string ReplacePath(string input)
    {             //../../images/survey
        return input.Replace("../../images", "\\images");
    }

    public static void FixMceHtml(ref TakeSurveyVM takeSurveyVM)
    {
        string[] RealMceHtmlArr =null;
        string ModeStr = "";
        //根據問題數量對應
        //    ModeStr = "<br><br><br> <h6><font size=\"1\">使用 QuestionCount 對應編輯</font></h6> <br> ";
        //if (!SetByQuestionNum(ref takeSurveyVM, out RealMceHtmlArr))
        //{
        //    return;
        //}


        //根據OptionValue對應
        ModeStr = "<br><br><br> <h6><font size=\"1\">使用 OptionValue 對應編輯</font></h6> <br> ";
        if (!SetByOptionValue(ref takeSurveyVM, out RealMceHtmlArr))
        { 
            return;
        }


        string RealMceHtml = "";
        foreach (var strSub in RealMceHtmlArr)
        {
            RealMceHtml += strSub;
            Console.WriteLine(strSub);
        }
        //RealMceHtml += ModeStr;

        takeSurveyVM.MceHtml = RealMceHtml;
    }

    static bool SetByOptionValue(ref TakeSurveyVM takeSurveyVM, out string[] RealMceHtmlArr)
    {

        string RealMceHtml = ReplacePath(takeSurveyVM.MceHtml);

        RealMceHtmlArr = SplitByAngleBrackets(RealMceHtml);


        List<OptionSub> QuestionOptions = new List<OptionSub>();

        foreach (QuestionSub questionSub in takeSurveyVM.Questions)
        {
            QuestionOptions.AddRange(questionSub.QuestionOptions);
        }

         HtmlArrSetQuestionNumByOptions(QuestionOptions,ref RealMceHtmlArr);

        return true;
    }
    static bool SetByQuestionNum(ref TakeSurveyVM takeSurveyVM, out string[] RealMceHtmlArr)
    {

        string RealMceHtml = ReplacePath(takeSurveyVM.MceHtml);
        
        RealMceHtmlArr = SplitByAngleBrackets(RealMceHtml);

        if (CheckQuestionCount(RealMceHtmlArr) != takeSurveyVM.Questions.Count)
        {
            //問題數量檢測 數量不對

            Console.WriteLine($"問題數量檢測 數量不對  {CheckQuestionCount(RealMceHtmlArr)}  {takeSurveyVM.Questions.Count}  ");
            return false;
        }
        //將欄位下tag
        List<QuestionDataSub> QuestionDataSubList = HtmlArrSetQuestionModeFixTag(ref RealMceHtmlArr);

        HtmlArrSetQuestionNum(QuestionDataSubList, takeSurveyVM.Questions, ref RealMceHtmlArr);

        return true;
    }


    public static void HtmlArrSetQuestionNumByOptions(List<OptionSub> OptionSubs, ref string[] HtmlArr)
    {


        Console.WriteLine("==========開始設定 QuestionNumByOptions============");
        Console.WriteLine($"=========={HtmlArr.Length}-{OptionSubs.Count}============");
        for (int arrNum = 0; arrNum < HtmlArr.Length; arrNum++)
        {
            string item = HtmlArr[arrNum];
            //確認是否是問題字串
            if (CheckIsMatchAttributes(item))
            {
                int OptionNum = int.Parse(ExtractOptionName(item));


                int QuestionNum = -1;

                bool hasTarget = false;
                for (int i = OptionSubs.Count-1; i >= 0; i--)
                {
                    Console.WriteLine($"測試:{OptionNum}  {OptionSubs[i].OptionId}_{QuestionNum = OptionSubs[i].QuestionId}");
                    if (OptionSubs[i].OptionId == OptionNum)
                    {
                        QuestionNum = OptionSubs[i].QuestionId;
                        Console.WriteLine($"OptionSubs:{OptionSubs[i].OptionId}_{QuestionNum}");
                        OptionSubs.RemoveAt(i);
                        hasTarget = true;
                        break;
                    }
                }

               if(!hasTarget)
                {
                    break;
                }


                HtmlArr[arrNum] = UpdateHtmlAttributes(item, $"{QuestionNum}", $"{OptionNum}");



                string nextItem = HtmlArr[arrNum + 1];
                if (CheckIsMatch_Option(nextItem))
                {

                    HtmlArr[arrNum + 1] = UpdateHtmlAttributes(nextItem, $"{QuestionNum}", $"{OptionNum}");
                }

            }
        }
        Console.WriteLine("==========結束設定 QuestionNumByOptions============");

    }

    public static List<QuestionDataSub> HtmlArrSetQuestionModeFixTag(ref string[] HtmlArr)
    {

        List<QuestionDataSub> QuestionDataSubList =new  List<QuestionDataSub>();

        string LocQuestionName = "";
        int QuestionNum = -1;
        int OptionNum = -1;

        for (int arrNum = 0; arrNum < HtmlArr.Length; arrNum++)
        {
            string item = HtmlArr[arrNum];
            //確認是否是問題字串
            if (CheckIsMatchAttributes(item))
            {
                string NowQuestionName = ExtractQuestionName(item); 

                if(NowQuestionName != LocQuestionName)
                {
                    LocQuestionName = NowQuestionName;
                    QuestionNum++;
                    OptionNum = 0;
                }
                else
                {
                    OptionNum++;
                }
                

                HtmlArr[arrNum] = UpdateHtmlAttributes(item, $"#{NowQuestionName}", $"##{OptionNum}##");

                string nextItem = HtmlArr[arrNum + 1];
                if (CheckIsMatch_Option(nextItem))
                {

                    HtmlArr[arrNum + 1] = UpdateHtmlAttributes(nextItem, $"#{NowQuestionName}", $"##{OptionNum}##");
                }

                QuestionDataSubList.Add(new QuestionDataSub(arrNum, QuestionNum, OptionNum));
            }
        }

        return QuestionDataSubList;
    }


    public static void HtmlArrSetQuestionNum(List<QuestionDataSub> QuestionDataSubList, List<QuestionSub> QuestionSubList, ref string[] HtmlArr)
    {
       
        

        foreach (QuestionDataSub DataSub in QuestionDataSubList)
        {
            int arrNum = DataSub.ArrNum;
            int questionNum = DataSub.QuestionNum;
            int optionNum = DataSub.OptionNum;
            string item = HtmlArr[arrNum];

            int questionId = QuestionSubList[questionNum].Id;
            int optionId = QuestionSubList[questionNum].QuestionOptions[optionNum].OptionId;


            //確認是否是問題字串
            if (CheckIsMatchAttributes(item))
            {

                HtmlArr[arrNum] = UpdateHtmlAttributes(item, $"{questionId}", $"{optionId}");

                string nextItem = HtmlArr[arrNum + 1];
                if (CheckIsMatch_Option(nextItem))
                {

                    HtmlArr[arrNum + 1] = UpdateHtmlAttributes(nextItem, $"{questionId}", $"{optionId}");
                }
            }

        }


    }



    public static string[] SplitByAngleBrackets(string input)
    {

        //input = input.Replace("\n", "").Replace("\r", "");
        // 正則表達式，將 '<' 和 '>' 之間的內容當作一個區塊來進行分割
        string pattern = @"(<[^>]*>)";

        // 使用正則表達式分割字串
        string[] result = Regex.Split(input, pattern);

        List<string> strList = new List<string>();
        foreach (string resultSub in result)
        {
            string _resultSub = resultSub.Replace(" ", "");
            if (!string.IsNullOrEmpty(_resultSub))
            {
                strList.Add(resultSub);
            }
        }

        // 輸出分割後的結果
        return strList.ToArray();
    }


    public static int CheckQuestionCount(string[] HtmlArr)
    {
        string LocQuestionName=null;
        int QuestionCount = 0;

        for (int i = 0; i < HtmlArr.Length; i++)
        {
            string item = HtmlArr[i];
            //確認是否是問題字串
            if (CheckIsMatchAttributes(item))
            {
                string NowQuestionName = ExtractQuestionName(item); 
                if (LocQuestionName != NowQuestionName)
                {
                    LocQuestionName = NowQuestionName;
                    QuestionCount++;    
                }
            }
        }
        return  QuestionCount;
    }


    public static string ExtractQuestionName(string input)
    {
        // 正則表達式來匹配 "Questions[x]" 其中 x 是數字
        var match = Regex.Match(input, @"Questions\[(.*?)\]");
        if (match.Success)
        {
            // 提取捕獲組中的數字並返回
            return (match.Groups[1].Value);
        }

        // 如果沒有匹配，返回 -1 或其他合適的錯誤碼
        return "";
    }
    public static string ExtractOptionName(string input)
    {
        // 正則表達式來匹配 "option_"
        var match = Regex.Match(input, @"""option_(.*?)""");
        if (match.Success)
        {
            // 提取捕獲組中的數字並返回
            return (match.Groups[1].Value);
        }

        // 如果沒有匹配，返回 -1 或其他合適的錯誤碼
        return "";
    }

    public static bool CheckIsMatchAttributes(string input)
    {
        // 只检查是否包含符合特定模式的 id、name 和 value 属性
        bool containsOption = Regex.IsMatch(input, @"""option_(.*?)""");
        bool containsQuestions = Regex.IsMatch(input, @"Questions\[(.*?)\]");
        bool containsValue = Regex.IsMatch(input, @"value=""(.*?)""");

        // 如果三个条件都匹配，则返回 true
        return containsOption && containsQuestions && containsValue;
    }
    public static bool CheckIsMatch_Option(string input)
    {
        return Regex.IsMatch(input, @"""option_(.*?)"""); ;
    }
    public static bool CheckIfContainsAttributes(string input)
    {
        return input.Contains("input id=\"option_") &&
               input.Contains("name=\"Questions[") &&
               input.Contains("value=\"");
    }
    public static string UpdateHtmlAttributes(string inputStr, string newQuestionId, string newOptionId)
    {
        //@"Questions\[(\d+)\]  <<數字

        // 匹配 "Questions[...]" 中的内容（不限制为数字）
        inputStr = Regex.Replace(inputStr, @"Questions\[(.*?)\]", match =>
        {
            if (match.Success)
            {
                // 用新的 Question ID 替换原来的内容
                return $"Questions[{newQuestionId}]";
            }
            // 如果没有匹配，保持原样
            return match.Value;
        });

        // 匹配 "option_..." 中的内容（不限制为数字）
        inputStr = Regex.Replace(inputStr, @"""option_(.*?)""", match =>
        {
            if (match.Success)
            {
                // 用新的 Option ID 替换原来的内容
                return $"\"option_{newOptionId}\"";
            }
            // 如果没有匹配，保持原样
            return match.Value;
        });

        // 匹配 value="..." 中的内容（不限制为数字）
        inputStr = Regex.Replace(inputStr, @"value=""(.*?)""", match =>
        {
            if (match.Success)
            {
                // 用新的 Option ID 替换原来的内容
                return $"value=\"{newOptionId}\"";
            }
            // 如果没有匹配，保持原样
            return match.Value;
        });

        return inputStr;
    }

    public struct QuestionDataSub
    {
   
        public int ArrNum;
        public int QuestionNum;
        public int OptionNum;

        public QuestionDataSub(int arrNum, int questionNum, int optionNum)
        {
            this.ArrNum = arrNum;
            this.QuestionNum = questionNum;
            this.OptionNum = optionNum;
        }

       
    }

}








