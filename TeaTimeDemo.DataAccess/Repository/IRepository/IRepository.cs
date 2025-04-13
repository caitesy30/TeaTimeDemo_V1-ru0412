using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    // 定義一個泛型的倉儲接口，實現對資料庫中任意類別的標準操作
    public interface IRepository<T> where T : class
    {
        // 取得所有資料，可根據條件進行篩選，並可指定關聯屬性進行關聯查詢
        IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string? includeProperties = null,
            bool includeDeleted = false,// 可選參數，保留以兼容舊代碼
            bool tracked = true,
            bool ignoreQueryFilters = false);

        // 根據條件取得單一資料，可指定關聯屬性進行關聯查詢
        T Get(Expression<Func<T, bool>> filter, string? includeProperties = null);

        // 根據條件取得單一資料，不同命名方便存取，可指定關聯屬性進行關聯查詢
        T GetFirstOrDefault(Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool includeDeleted = false,// 可選參數，保留以兼容舊代碼
            bool tracked = true,
            bool ignoreQueryFilters = false);

        Task<T> GetFirstOrDefaultAsync(
        Expression<Func<T, bool>> filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
        string includeProperties = null,
        bool tracked = true);

        // 新增一筆資料
        void Add(T entity);

        // 新增非同步新增方法
        Task AddAsync(T entity);

        // 新增多筆資料 (批次新增)
        void AddRange(IEnumerable<T> entities); // 新增的批次處理功能

        // 更新現有的資料
        void Update(T entity);

        // 刪除資料透過實體類別有更多條件時使用
        void Delete(T entity);

        // 刪除多筆實體資料 (批次刪除)
        void RemoveRange(IEnumerable<T> entities); // 批次刪除

        // 刪除所有資料，移除該表中的所有實體
        void DeleteAll();

        // 透過 ID 取得單一資料
        T GetById(int id);

        // 透過 ID 刪除資料
        void DeleteById(int id);

        // 刪除資料透過實體類別
        void Remove(T entity);

        // 儲存變更
        void SaveChanges();
    }
}