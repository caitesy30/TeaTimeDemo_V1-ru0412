// Models/DTOs/QuestionOptionDTO.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DTOs
{
    /// <summary>
    /// 問題選項的資料傳輸物件（DTO），用於資料交換
    /// </summary>
    public class QuestionOptionDTO
    {
        /// <summary>
        /// 問題選項的唯一識別碼
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 外鍵，指向對應的問題
        /// </summary>
        [Required(ErrorMessage = "問題 ID 是必填欄位")]
        public int QuestionId { get; set; }

        /// <summary>
        /// 所屬問卷的 ID
        /// </summary>
        public int SurveyId { get; set; }

        /// <summary>
        /// 問題文本，用於顯示相關的問題
        /// </summary>
        public string QuestionText { get; set; }

        /// <summary>
        /// 選項的文本內容，必填，限制字元數不超過 500 個字元
        /// </summary>
        //[Required(ErrorMessage = "選項文本是必填欄位")]
        //[MaxLength(500, ErrorMessage = "選項文本不能超過500個字元")]
        public string OptionText { get; set; }

        /// <summary>
        /// 是否為正確答案，適用於測驗類型的問題
        /// </summary>
        public bool IsCorrect { get; set; }

        /// <summary>
        /// 是否為 "其他" 選項，允許用戶輸入自訂答案
        /// </summary>
        public bool IsOther { get; set; }

        /// <summary>
        /// 選項的詳細描述，選填欄位
        /// </summary>
        [MaxLength(500, ErrorMessage = "描述不能超過500個字元")]
        public string? Description { get; set; }

        /// <summary>
        /// 排序順序，用於控制選項的顯示順序
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// 軟刪除標誌，表示該記錄是否已被刪除
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// 刪除時間，當 IsDeleted 為 true 時，記錄刪除的時間
        /// </summary>
        public DateTime? DeletedAt { get; set; }

        /// <summary>
        /// 與選項相關的答案選項集合（可選）
        /// </summary>
        public List<AnswerOptionDTO> AnswerOptions { get; set; } = new List<AnswerOptionDTO>();

        /// <summary>
        /// 與選項相關的圖片集合（可選）
        /// </summary>
        public List<QuestionImageDTO> QuestionImages { get; set; } = new List<QuestionImageDTO>();

        /// <summary>
        /// 與選項相關的填空題集合（可選）
        /// </summary>
        public List<FillInBlankDTO> FillInBlanks { get; set; } = new List<FillInBlankDTO>();
    }
}
