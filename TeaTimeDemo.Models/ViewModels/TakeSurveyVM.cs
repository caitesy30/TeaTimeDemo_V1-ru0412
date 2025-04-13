// TakeSurveyVM.cs


using DocumentFormat.OpenXml.Office2010.Excel;

namespace TeaTimeDemo.Models.ViewModels
{
    public class TakeSurveyVM
    {
        public virtual SurveySub SurveyView { get; set; }
        public List<QuestionSub> Questions = new List<QuestionSub>();
        public string MceHtml { get; set; } // 新增 MceHtml 屬性


        public TakeSurveyVM (Survey survey, List<Question> questions,string mceHtml)
        {
            SurveyView = new(survey);
            Questions.Clear();
            foreach (var item in questions)
            {
                Questions.Add( new QuestionSub(item));
            }
            MceHtml = mceHtml;
        }

    }
    public class SurveySub
    {
        public int Id;
        public string Title;
        public string MceHtml; // 新增 MceHtml 屬性

        public SurveySub(Survey Survey)
        {
            Id=Survey.Id;
            Title=Survey.Title;
            MceHtml=Survey.MceHtml; 
        }

        public SurveySub(int _Id, string _Title, string _MceHtml)
        {
            Id = _Id;
            Title = _Title;
            MceHtml = _MceHtml;
        }
    }
 

    public class QuestionSub 
    {
        public int Id;
        // 外鍵：連接到 Survey (問卷) 的主鍵
        public int SurveyId;

        // 枚舉類型，定義問題的回答形式（例如：單選、多選、填空等）
        public AnswerTypeEnum AnswerType;
    
        // 關聯到該問題的選項集合
        public  List<OptionSub> QuestionOptions  = new List<OptionSub>();

        public  List<OptionSub> AnswerOptions = new List<OptionSub>();


        public QuestionSub(Question Question)
        {
            Id= Question.Id;
            SurveyId =   Question.SurveyId;
            AnswerType= Question.AnswerType;
            foreach (var item in Question.QuestionOptions)
            {
                QuestionOptions.Add(new OptionSub(item));
            }
        }
    
    }



    public class OptionSub
    {
        public int OptionId;
        public int QuestionId;

        public OptionSub(QuestionOption Question)
        {
            OptionId = Question.Id;

            QuestionId = Question.QuestionId;
        }
    }

}