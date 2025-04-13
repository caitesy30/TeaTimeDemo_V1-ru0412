using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
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
    public class BlankSurvey
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public int? CategoryId { get; set; }

        public int? LayerId { get; set; }

        public string? Suffix { get; set; }
        

        public List<int> SelectedIds { get; set; }
        
        
    }
}
