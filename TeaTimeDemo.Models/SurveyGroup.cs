using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models
{
    public class SurveyGroup
    {
        public int Id { get; set; }
        public string Name { get; set; }

        //[DefaultValue("0")]
        [ValidateNever]
        public int Count { get; set; } = 0;

        public int Order { get; set; }
        public string? Description { get; set; }
        public virtual ICollection<SurveyToGroup> SurveyToGroups { get; set; } = new List<SurveyToGroup>();  // 關聯 Survey
    }
}
