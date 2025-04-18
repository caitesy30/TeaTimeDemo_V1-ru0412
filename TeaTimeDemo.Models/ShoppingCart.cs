﻿﻿using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models
{
    public class ShoppingCart
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        [ValidateNever]
        public virtual Product Product { get; set; }


        [Range(1, 100, ErrorMessage = "請輸入1-100的數字")]
        public int Count { get; set; }
        public string Ice { get; set; }
        public string Sweetness { get; set; }

        public string ApplicationUserId { get; set; }
        [ForeignKey("ApplicationUserId")]
        [ValidateNever]
        public  virtual ApplicationUser ApplicationUser { get; set; }


    }
}