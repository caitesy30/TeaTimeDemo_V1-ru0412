using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models
{
    public class AnsweredProcess: BaseEntity
    {

        //料號
        public string MtNum { get; set; }

        //根據料號 就可以知道PCB類別
        public int PcbCategoryId { get; set; }  //自己的資訊

        public int ProcessCategoryId { get; set; } //自己的資訊


        public string PageOrderJson { get; set; }
       

    }
}
