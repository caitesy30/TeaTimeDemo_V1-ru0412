using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models
{
    public class AnsweredPage : BaseEntity
    {

        //料號
        public string MtNum { get; set; }

        //根據料號 就可以知道PCB類別
        public int PcbCategoryId { get; set; }
        public int ProcessCategoryId { get; set; }

        public string PageName { get; set; }//自己的資訊

        public string SurveyOrderJson { get; set; }
    }
}
