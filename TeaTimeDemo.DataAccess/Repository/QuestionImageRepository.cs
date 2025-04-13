using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class QuestionImageRepository : Repository<QuestionImage>, IQuestionImageRepository
    {
        private readonly ApplicationDbContext _db;

        public QuestionImageRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(QuestionImage obj)
        {
            var objFromDb = _db.QuestionImages.FirstOrDefault(qi => qi.Id == obj.Id);
            if (objFromDb != null)
            {
                objFromDb.ImageUrl = obj.ImageUrl;
                objFromDb.AltText = obj.AltText;
                objFromDb.Width = obj.Width;
                objFromDb.Height = obj.Height;

                // 更新 SurveyId 和 QuestionOptionId 的邏輯（新增）
                objFromDb.SurveyId = obj.SurveyId;
                objFromDb.QuestionId = obj.QuestionId;
                objFromDb.QuestionOptionId = obj.QuestionOptionId;

                // 更新其他屬性...
            }
        }

        public void RemoveRange(IEnumerable<QuestionImage> objs)
        {
            _db.QuestionImages.RemoveRange(objs); // 使用 EF Core 的 RemoveRange 方法批次刪除
        }


        /// <summary>
        /// 執行物理刪除
        /// </summary>
        public void RemovePhysical(QuestionImage obj)
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

        /// <summary>
        /// 執行批次物理刪除
        /// </summary>
        public void RemovePhysicalRange(IEnumerable<QuestionImage> objs)
        {
            foreach (var obj in objs)
            {
                var entry = _db.Entry(obj);
                if (entry.State == EntityState.Detached)
                {
                    dbSet.Attach(obj);
                }

                //dbSet.Remove(obj);

                try
                {
                    // 設置 IsHardDelete 為 true 以繞過軟刪除邏輯
                    _db.IsHardDelete = true;
                    //  entry.State = EntityState.Deleted; // 直接設定狀態為 Deleted
                    dbSet.Remove(obj);
                    // 不呼叫 SaveChanges，讓控制器負責
                    //_db.SaveChanges(); // 在此處保存變更

                }
                finally
                {
                    // 確保在操作完成後重置 IsHardDelete
                    _db.IsHardDelete = false;
                }
            }           
        }

    }
}
