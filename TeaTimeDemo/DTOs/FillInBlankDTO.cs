using System;
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models.DTOs
{
    /// <summary>
    /// FillInBlank 資料傳輸物件，用於資料交換
    /// </summary>
    public class FillInBlankDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// 外鍵，指向對應的 QuestionOption
        /// </summary>
        [Required(ErrorMessage = "選項 ID 是必填欄位")]
        public int QuestionOptionId { get; set; }

        /// <summary>
        /// 填空題的提示文字
        /// </summary>
        [Required(ErrorMessage = "提示文字是必填欄位")]
        [MaxLength(500, ErrorMessage = "提示文字不能超過500個字元")]
        public string Placeholder { get; set; }

        /// <summary>
        /// 排序順序
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// 軟刪除標誌
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// 刪除時間
        /// </summary>
        public DateTime? DeletedAt { get; set; }

        /// <summary>
        /// 填空編號，從 1 開始自動遞增
        /// </summary>
        public int BlankNumber { get; set; }

        /// <summary>
        /// 正則表達式，用於驗證填空輸入
        /// </summary>
        public string RegexPattern { get; set; }

        /// <summary>
        /// 填空長度
        /// </summary>
        public int Length { get; set; }

        /// <summary>
        /// 填空在描述中的插入位置
        /// </summary>
        public int Position { get; set; }
    }
}
