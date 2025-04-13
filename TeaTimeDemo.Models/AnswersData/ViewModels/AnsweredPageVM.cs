using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Math;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class AnsweredPageVM
    {
        public string Title { get; set; }
        public IEnumerable<AnsweredSurvey> AllSurvey { get; set; }
        public IEnumerable<Category> Categorys { get; set; }
        public IEnumerable<Layer> Layers { get; set; }
        public int SurveyCount { get; set; }
    }
}
