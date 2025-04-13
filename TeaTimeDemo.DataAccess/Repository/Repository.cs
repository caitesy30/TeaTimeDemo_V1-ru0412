using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    // Repository 類別實作 IRepository 介面，對資料庫進行基本的 CRUD 操作
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ApplicationDbContext _db; // 資料庫上下文
        internal DbSet<T> dbSet; // 代表資料庫中的某一表

        // 建構子，傳入資料庫上下文並設定 dbSet
        public Repository(ApplicationDbContext db)
        {
            _db = db;
            this.dbSet = _db.Set<T>(); // 設定對應的 DbSet
       
        }

        /// <summary>
        /// 取得所有資料，支持條件篩選和關聯屬性
        /// </summary>
        /// <param name="filter">篩選條件</param>
        /// <param name="includeProperties">需要包含的關聯屬性，以逗號分隔</param>
        /// <param name="includeDeleted">是否包含已軟刪除的資料</param>
        /// <param name="tracked">是否追蹤實體變更（預設為 true）</param>
        /// <returns>符合條件的 T 集合</returns>
        public virtual IEnumerable<T> GetAll(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string? includeProperties = null,
            bool includeDeleted = false,
            bool tracked = true,
            bool ignoreQueryFilters = false)
        {
            IQueryable<T> query = dbSet; // 建立基本查詢

            if (!tracked)
            {
                query = query.AsNoTracking(); // 不追蹤實體變更，提高效能
            }

            if (ignoreQueryFilters)
            {
                query = query.IgnoreQueryFilters();
            }


            if (filter != null) // 如果有篩選條件
            {
                query = query.Where(filter); // 套用篩選條件
            }

            if (!string.IsNullOrEmpty(includeProperties)) // 如果指定了關聯屬性
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim()); // 套用關聯屬性查詢
                }
            }

            if (orderBy != null)
            {
                return orderBy(query).ToList();
            }

            return query.ToList(); // 返回查詢結果
        }

        public async Task<T> GetFirstOrDefaultAsync(
           Expression<Func<T, bool>> filter = null,
           Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
           string includeProperties = null,
           bool tracked = true)
        {
            IQueryable<T> query = tracked ? dbSet : dbSet.AsNoTracking();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (includeProperties != null)
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.FirstOrDefaultAsync();
        }


        /// <summary>
        /// 根據條件取得單一資料，支持關聯屬性
        /// </summary>
        /// <param name="filter">篩選條件</param>
        /// <param name="includeProperties">需要包含的關聯屬性，以逗號分隔</param>
        /// <returns>符合條件的第一筆 T 實體，若無則返回 null</returns>
        public T Get(Expression<Func<T, bool>> filter, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;
            query = query.Where(filter); // 根據篩選條件取得資料

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim()); // 套用關聯屬性查詢
                }
            }

            return query.FirstOrDefault(); // 返回符合條件的第一筆資料
        }

        /// <summary>
        /// 根據條件取得單一資料，支持關聯屬性
        /// </summary>
        /// <param name="filter">篩選條件</param>
        /// <param name="includeProperties">需要包含的關聯屬性，以逗號分隔</param>
        /// <param name="includeDeleted">是否包含已軟刪除的資料</param>
        /// <param name="tracked">是否追蹤實體變更（預設為 true）</param>
        /// <returns>符合條件的第一筆 T 實體，若無則返回 null</returns>
        public virtual T GetFirstOrDefault(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool includeDeleted = false,
            bool tracked = true,
            bool ignoreQueryFilters = false)
        {
            IQueryable<T> query = dbSet;

            if (!tracked)
            {
                query = query.AsNoTracking(); // 不追蹤實體變更，提高效能
            }

            if (ignoreQueryFilters)
            {
                query = query.IgnoreQueryFilters();
            }

            query = query.Where(filter); // 根據篩選條件取得資料

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim()); // 套用關聯屬性查詢
                }
            }

            return query.FirstOrDefault(); // 返回符合條件的第一筆資料
        }


        // 新增單筆資料
        public void Add(T entity)
        {
            dbSet.Add(entity); // 將實體加入到資料庫上下文中
        }

        public async Task AddAsync(T entity)
        {
            await dbSet.AddAsync(entity);
        }

        // 批次新增多筆資料
        public void AddRange(IEnumerable<T> entities)
        {
            dbSet.AddRange(entities); // 批次將多個實體加入到資料庫上下文中
        }

        // 更新現有的資料
        public void Update(T entity)
        {
            dbSet.Update(entity); // 更新現有的實體資料
        }

        // 刪除單筆資料
        public void Delete(T entity)
        {
            dbSet.Remove(entity); // 從資料庫上下文中移除該實體
        }

        // 刪除多筆資料 (批次刪除)
        public void RemoveRange(IEnumerable<T> entities)
        {
            dbSet.RemoveRange(entities); // 批次移除多筆資料
        }

        // 刪除表中的所有資料
        public void DeleteAll()
        {
            var entities = dbSet.ToList(); // 先取得所有實體
            dbSet.RemoveRange(entities); // 批次移除所有實體
        }

        // 根據 ID 取得單一資料
        public T GetById(int id)
        {
            return dbSet.Find(id); // 根據主鍵查找實體
        }

        // 根據 ID 刪除資料
        public void DeleteById(int id)
        {
            var entity = GetById(id); // 先查詢該 ID 的實體
            if (entity != null)
            {
                Remove(entity);
            }
        }

        /// <summary>
        /// 刪除資料透過實體類別（僅物理刪除）
        /// </summary>
        /// <param name="entity">要刪除的 T 實體</param>
        public virtual void Remove(T entity)
        {
            dbSet.Remove(entity); // 直接執行物理刪除
        }

        // 儲存變更，將資料庫上下文的變更保存到實際資料庫
        public void SaveChanges()
        {
            _db.SaveChanges(); // 保存所有變更
        }
    }
}


