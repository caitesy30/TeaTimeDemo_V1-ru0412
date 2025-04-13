// TakeSurveyVM.cs


using DocumentFormat.OpenXml.Office2010.Excel;

namespace TeaTimeDemo.Models.ViewModels
{
 
   public class LoadSurveyVM
    {
        public string MtNum { get; set; }

        public int stage { get; set; }

        public List<surveyHtmlData> surveyHtmlDataList { get; set; }

        public class surveyHtmlData
        {
            public string pcb_category { get; set; }
            public string station { get; set; }
            public string suffix { get; set; }
            public int pageNum { get; set; }
            public string documentId { get; set; }
            public int id { get; set; }
            public int value { get; set; }
            public string html { get; set; }
            public string ansJson { get; set; }
            public string images { get; set; }
        }
    }



}

