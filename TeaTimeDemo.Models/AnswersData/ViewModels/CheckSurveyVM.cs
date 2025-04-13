using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class CheckSurveyVM
    {

        public object html { get; set; }
        public AnsweredSurvey SelectedSurvey {  get; set; }
        public int  SurveyCount { get; set; }

    }
}
