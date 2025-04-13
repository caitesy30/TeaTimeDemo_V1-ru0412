// DataAccess/Repository/QuestionOptionRepository.cs

using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class QuestionOptionRepository : Repository<QuestionOption>, IQuestionOptionRepository
    {
        private readonly ApplicationDbContext _db;

        public QuestionOptionRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }


        /*
        /// <summary>
        /// 更新選項資料
        /// </summary>
        public void Update(QuestionOption obj)
        {
            var objFromDb = _db.QuestionOptions.FirstOrDefault(qo => qo.Id == obj.Id);
            if (objFromDb != null)
            {
                // 更新基本屬性
                objFromDb.OptionText = obj.OptionText;
                objFromDb.IsCorrect = obj.IsCorrect;
                objFromDb.IsOther = obj.IsOther;
                objFromDb.Description = obj.Description;
                objFromDb.SortOrder = obj.SortOrder;
                objFromDb.QuestionId = obj.QuestionId;
                

                // 可以根據需要更新其他屬性
            }
        }
        */

        /// <summary>
        /// 更新選項資料
        /// </summary>
        public void Update(QuestionOption obj)
        {
            _db.QuestionOptions.Update(obj);
        }


        public  IEnumerable<QuestionOption> GetAll(
        Expression<Func<QuestionOption, bool>> filter = null,
        Func<IQueryable<QuestionOption>, IOrderedQueryable<QuestionOption>> orderBy = null,
        string includeProperties = "",
     //   bool includeDeleted = false,
        bool ignoreQueryFilters = false)
        {
            IQueryable<QuestionOption> query = dbSet;


           

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



        /// <summary>
        /// 執行軟刪除
        /// </summary>
        public void SoftDelete(QuestionOption obj)
        {
            obj.IsDeleted = true;
            obj.DeletedAt = DateTime.Now;
            _db.QuestionOptions.Update(obj);
        }

        /// <summary>
        /// 還原軟刪除
        /// </summary>
        public void Restore(QuestionOption obj)
        {
            obj.IsDeleted = false;
            obj.DeletedAt = null;
            _db.QuestionOptions.Update(obj);
        }

        /// <summary>
        /// 執行物理刪除
        /// </summary>
        public void RemovePhysical(QuestionOption obj)
        {
            var entry = _db.Entry(obj);
            if (entry.State == EntityState.Detached)
            {
                dbSet.Attach(obj);
            }


            try
            {
                // 設置 IsHardDelete 為 true 以繞過軟刪除邏輯
                _db.IsHardDelete = true;
              //  entry.State = EntityState.Deleted; // 直接設定狀態為 Deleted
                dbSet.Remove(obj);
                _db.SaveChanges(); // 在此處保存變更

            }
            finally
            {
                // 確保在操作完成後重置 IsHardDelete
                _db.IsHardDelete = false;
            }
        }

        public void Remove(QuestionOption obj)
        {
            _db.QuestionOptions.Remove(obj);
        }
    }
}
