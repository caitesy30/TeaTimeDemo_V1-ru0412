using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class AnsweredSurveyVM
    {

        public string Title { get; set; }


        public string MtNum { get; set; }

        public int ProcessNum { get; set; }

        public  string PageName { get; set; }

        public virtual SurveySub SurveyView { get; set; }
       
    }
}
