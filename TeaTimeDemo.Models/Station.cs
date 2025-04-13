﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 站別。用於存儲有關站別的所有相關資訊。
    /// </summary>
    public class Station
    {
        /// <summary>
        /// 站別的唯一識別號。這個屬性由資料庫自動生成，不需要手動設置。
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 站別名稱。這是一個必填項目，不能為空。
        /// [Required] 屬性確保在進行模型驗證時該欄位必須要有值，否則驗證失敗並返回錯誤訊息。
        /// </summary>
        [Required(ErrorMessage = "站別名稱是必填項目。")]
        public string Name { get; set; }

        /// <summary>
        /// 顯示順序。這是一個必填項目，不能為空。
        /// </summary>
        [DisplayName("顯示順序")]
        [Range(1, 100, ErrorMessage = "輸入範圍應該要在1-100之間")]
        public int DisplayOrder { get; set; }


        /// <summary>
        /// 備註。這是一個選填項目，可以為空。
        /// 移除[Required]標記意味著這個欄位可以在資料庫中存儲為NULL。
        /// </summary>
        public string? Remark { get; set; } = string.Empty;
    }
}