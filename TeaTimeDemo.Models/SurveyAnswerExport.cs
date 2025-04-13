//SurveyAnswerExport.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 儲存問卷答案（包含網頁內容與答案 JSON）的資料表
    /// </summary>
    public class SurveyAnswerExport
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }      // 種類

        [MaxLength(50)]
        public string? Station { get; set; }       // 站別

        [MaxLength(50)]
        public string? PageNo { get; set; }        // 頁數

        [MaxLength(50)]
        public string? SequenceNo { get; set; }    // 序號

        [MaxLength(50)]
        public string? DocumentId { get; set; }    // 文件編號

        [Column(TypeName = "NVARCHAR(MAX)")]
        public string? HtmlContent { get; set; }   // 儲存網頁 HTML

        [Column(TypeName = "NVARCHAR(MAX)")]
        public string? AnswerJson { get; set; }    // 儲存答案的 JSON 字串

        public string? Images { get; set; }        // 圖片（選擇性）

        public string? Comment { get; set; }       // 備註（選擇性）

        // ---------------- 新增欄位 ----------------

        [Column(TypeName = "NVARCHAR(MAX)")]
        public string? QuestionData { get; set; }  // 存放題目資料的 JSON 字串

        public DateTime CreatedAt { get; set; } = DateTime.Now; // 建立時間，預設為目前時間

        public int Version { get; set; }           // 版本編號，用來管控問卷版本
    }
}

