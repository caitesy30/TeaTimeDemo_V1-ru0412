using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models
{
    public class SurveyToGroup
    {
        public int Id { get; set; }


        public int? SurveyGroupId { get; set; }
        public virtual SurveyGroup SurveyGroup { get; set; }  // 對應 SurveyGroup


        public int? SurveyId { get; set; }
        public virtual Survey Survey { get; set; }  // 對應 Survey

        public int? LayerId {  get; set; }
        public virtual Layer Layer { get; set; }

        public int? CategoryId { get; set; }
        public virtual Category Category { get; set; }
    }
}
