using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DTOs
{
    public class MtNumAnswerDto
    {
        public int SurveyId { get; set; }         // DocumentExport 表的 Id
        public int Version { get; set; }          // 版本號
        public string MtNum { get; set; }         // 料號
        public string AnsweredJson { get; set; }    // 答案 JSON 字串

        // 新增：存放圖片資料的欄位，可存放圖片路徑或 Base64 編碼
        public string Images { get; set; }

        public int Stage { get; set; }   //階段
    }
}
