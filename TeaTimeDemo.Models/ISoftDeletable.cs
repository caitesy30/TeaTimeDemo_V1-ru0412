using System;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 定義軟刪除的介面，包含軟刪除標誌和刪除時間
    /// </summary>
    public interface ISoftDeletable
    {
        /// <summary>
        /// 軟刪除標誌，表示該記錄是否已被刪除
        /// </summary>
        bool IsDeleted { get; set; }

        /// <summary>
        /// 刪除時間，當 IsDeleted 為 true 時，記錄刪除的時間
        /// </summary>
        DateTime? DeletedAt { get; set; }
    }
}
