using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    /// <summary>
    /// 填空題資料存取介面，繼承自 IRepository 介面
    /// </summary>
    public interface IFillInBlankRepository : IRepository<FillInBlank>
    {
        /// <summary>
        /// 更新填空題資料
        /// </summary>
        /// <param name="obj">要更新的 FillInBlank 物件</param>
        void Update(FillInBlank obj);

        /// <summary>
        /// 批次新增多個填空題
        /// </summary>
        /// <param name="entities">要新增的 FillInBlank 物件集合</param>
        void AddRange(IEnumerable<FillInBlank> entities);

        /// <summary>
        /// 批次刪除多個填空題
        /// </summary>
        /// <param name="entities">要刪除的 FillInBlank 物件集合</param>
        void RemoveRange(IEnumerable<FillInBlank> entities);

        /// <summary>
        /// 軟刪除填空題
        /// </summary>
        /// <param name="obj">要軟刪除的 FillInBlank 物件</param>
        void SoftDelete(FillInBlank obj);

        /// <summary>
        /// 還原被軟刪除的填空題
        /// </summary>
        /// <param name="obj">要還原的 FillInBlank 物件</param>
        void Restore(FillInBlank obj);

        /// <summary>
        /// 永久刪除填空題
        /// </summary>
        /// <param name="obj">要永久刪除的 FillInBlank 物件</param>
        void RemovePhysical(FillInBlank obj);
    }
}
