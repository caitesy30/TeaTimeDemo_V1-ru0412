using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace TeaTimeDemo.Models
{
    public class Language
    {
        public int Id { get; set; }
        
        public string Lang_Key { get; set; }
        public string Lang_zhTW { get; set; }

        [Column(TypeName = "varchar(255)")] // varchar限輸入英數字
        public string Lang_enUS { get; set; }

    }
}
