using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace TeaTimeDemo.Models
{

    //R5
    public class AnsweredSurvey: BaseEntity, ISoftDeletable
    {


        //料號
        public string MtNum { get; set; }

        //PCB類別
        public int PcbCategoryId { get; set; }

        //流程ID
        public int ProcessCategoryId { get; set; }


        //屬於哪一個頁面底下
        public string PageName { get; set; }


        public string Title { get; set; }

        public string status { get; set; }


        // 問題的外鍵，指向對應的問題
        public int SurveyId { get; set; }


        // 指定 QuestionId 是外鍵，關聯到 Question 表
        [ForeignKey("SurveyId")]
        public virtual Survey Survey { get; set; }

        public string Lochtml { get; set; }


        // 存儲用戶的回答
        [ValidateNever]
        [Column(TypeName = "nvarchar(max)")]
        public string AnswerJson { get; set; }

    }
}
