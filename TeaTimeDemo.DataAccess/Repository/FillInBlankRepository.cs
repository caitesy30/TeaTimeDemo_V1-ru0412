using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Vml.Office;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    /// <summary>
    /// 填空題資料存取類別，實作 IFillInBlankRepository 介面
    /// </summary>
    public class FillInBlankRepository : Repository<FillInBlank>, IFillInBlankRepository
    {
        private readonly ApplicationDbContext _db;

        /// <summary>
        /// 建構子，注入 ApplicationDbContext
        /// </summary>
        /// <param name="db">資料庫上下文</param>
        public FillInBlankRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        /// <summary>
        /// 更新填空題資料
        /// </summary>
        /// <param name="obj">要更新的 FillInBlank 物件</param>
        public void Update(FillInBlank obj)
        {
            dbSet.Attach(obj);
            _db.Entry(obj).State = EntityState.Modified;
            //_db.FillInBlanks.Update(obj);
        }

        /// <summary>
        /// 批次新增多個填空題
        /// </summary>
        /// <param name="entities">要新增的 FillInBlank 物件集合</param>
        public void AddRange(IEnumerable<FillInBlank> entities)
        {
            _db.FillInBlanks.AddRange(entities); // 使用 EF Core 的 AddRange 方法批次新增
        }

        /// <summary>
        /// 批次刪除多個填空題
        /// </summary>
        /// <param name="entities">要刪除的 FillInBlank 物件集合</param>
        public void RemoveRange(IEnumerable<FillInBlank> entities)
        {
            _db.FillInBlanks.RemoveRange(entities); // 使用 EF Core 的 RemoveRange 方法批次刪除
        }

        /// <summary>
        /// 軟刪除填空題
        /// </summary>
        /// <param name="obj">要軟刪除的 FillInBlank 物件</param>
        public void SoftDelete(FillInBlank obj)
        {
            obj.IsDeleted = true;
            obj.DeletedAt = DateTime.Now;
            // 如果實體未被追蹤，附加到上下文
            var entry = _db.Entry(obj);
            if (entry.State == EntityState.Detached)
            {
                dbSet.Attach(obj);
            }
            // 設定實體狀態為 Modified
            entry.State = EntityState.Modified;

            _db.FillInBlanks.Update(obj);
        }

        /// <summary>
        /// 還原被軟刪除的填空題
        /// </summary>
        /// <param name="obj">要還原的 FillInBlank 物件</param>
        public void Restore(FillInBlank obj)
        {
            obj.IsDeleted = false;
            obj.DeletedAt = null;
            _db.FillInBlanks.Update(obj);
        }

        /// <summary>
        /// 永久刪除填空題
        /// </summary>
        /// <param name="obj">要永久刪除的 FillInBlank 物件</param>
        public void RemovePhysical(FillInBlank obj)
        {
            var entry = _db.Entry(obj);
            if (entry.State == EntityState.Detached)
            {
                _db.FillInBlanks.Attach(obj);
            }

            try
            {
                _db.IsHardDelete = true; // 設定為硬刪除
                _db.FillInBlanks.Remove(obj);
                _db.SaveChanges();
            }
            finally
            {
                _db.IsHardDelete = false; // 重置硬刪除標誌
            }
        }

        /// <summary>
        /// 取得所有填空題，支援篩選、排序、包含相關屬性以及忽略查詢過濾器
        /// </summary>
        /// <param name="filter">篩選條件</param>
        /// <param name="orderBy">排序條件</param>
        /// <param name="includeProperties">要包含的相關屬性，逗號分隔</param>
        /// <param name="ignoreQueryFilters">是否忽略全域查詢過濾器</param>
        /// <returns>符合條件的填空題集合</returns>
        public override IEnumerable<FillInBlank> GetAll(
            Expression<Func<FillInBlank, bool>> filter = null,
            Func<IQueryable<FillInBlank>, IOrderedQueryable<FillInBlank>> orderBy = null,
            string? includeProperties = null,
            bool includeDeleted = false,
            bool tracked = true,
            bool ignoreQueryFilters = false       
        )
        {
            IQueryable<FillInBlank> query = dbSet;

            if (ignoreQueryFilters)
            {
                query = query.IgnoreQueryFilters();
            }

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProperty.Trim());
                }
            }

            if (orderBy != null)
            {
                return orderBy(query).ToList();
            }

            return query.ToList();
        }
    }
}
