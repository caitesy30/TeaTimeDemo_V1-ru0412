using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class AnsweredProcessVM
    {
        public string Title { get; set; }
        public IEnumerable<AnsweredPage> AllPage { get; set; }
        public IEnumerable<Category> Categorys { get; set; }
        public IEnumerable<Layer> Layers { get; set; }
        public List<AnsweredSurvey> AnsweredSurveysList { get; set; }
        public List<PageProgress> ProcessingSurvey { get; set; }
    }
      public class PageProgress
      {            
            public string PageName { get; set; }
            public int TotalPages { get; set; }
            public int CompletedPages { get; set; }
      }
}
