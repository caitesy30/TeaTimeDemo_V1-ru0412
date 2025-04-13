using Microsoft.EntityFrameworkCore;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class SurveyRepository : Repository<Survey>, ISurveyRepository
    {
        private readonly ApplicationDbContext _db;

        public SurveyRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Survey obj)
        {
            var objFromDb = _db.Surveys.FirstOrDefault(s => s.Id == obj.Id);
            if (objFromDb != null)
            {
                objFromDb.CategoryName = obj.CategoryName;  // 更新類別名稱
                objFromDb.Title = obj.Title;
                objFromDb.Description = obj.Description;
                objFromDb.StationName = obj.StationName;  // 更新站別名稱
                objFromDb.QuestionNum = obj.QuestionNum;  // 更新頁數或問題順序
                objFromDb.IsPublished = obj.IsPublished;
                objFromDb.MceHtml = obj.MceHtml;

                if (obj.IsPublished && objFromDb.CompleteTime == null)
                {
                    objFromDb.CompleteTime = DateTime.Now;
                }
                else if (!obj.IsPublished)
                {
                    objFromDb.CompleteTime = null; // 如果取消發佈，清空完成時間
                }
            }
        }

        /// <summary>
        /// 執行物理刪除
        /// </summary>
        public void RemovePhysical(Survey obj)
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
        public void RemovePhysicalRange(IEnumerable<Survey> objs)
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

        /// <summary>
        /// **修改後版本**：真刪除一個 Survey 及其下游資料(Questions, Options, Images)
        /// 在呼叫 RemovePhysical 前先手動刪除關聯的 Question、QuestionOption、QuestionImage、FillInBlank 資料。
        /// </summary>
        /// <param name="surveyId">要刪除的 Survey ID</param>
        /// <returns>操作結果：true 表示成功刪除，false 表示找不到 Survey</returns>
         

        /*
        public bool RemoveSurveyWithDependenciesPhysical(int surveyId)
        {
            _db.IsHardDelete = true; // 確保不執行軟刪除
            int rowsAffected = 0;
            try
            {
                // 1. 先刪除 SurveyToGroups 中的相關記錄，因為該外鍵關係是 Restrict，否則無法刪除 Survey
                _db.Database.ExecuteSqlRaw("DELETE FROM SurveyToGroups WHERE SurveyId = {0}", surveyId);

                // 2. 再刪除 Survey 本身
                rowsAffected = _db.Database.ExecuteSqlRaw("DELETE FROM Surveys WHERE Id = {0}", surveyId);
            }
            finally
            {
                _db.IsHardDelete = false;
            }

            return rowsAffected > 0;
        }
        */

        /*
        public bool RemoveSurveyWithDependenciesPhysical(int surveyId)
        {
            // 取得目標 Survey (包含相關下游資料)
            var survey = _db.Surveys
                .Include(s => s.Questions)
                    .ThenInclude(q => q.QuestionOptions)
                        .ThenInclude(o => o.QuestionImages)
                .Include(s => s.Questions)
                    .ThenInclude(q => q.QuestionImages)
                .Include(s => s.Questions)
                    .ThenInclude(q => q.FillInBlanks) // 若問題有填空題需加上
                .Include(s => s.QuestionImages)
                .Include(s => s.SurveyToGroups) // 加入 SurveyToGroups
                .FirstOrDefault(s => s.Id == surveyId);

            if (survey == null)
            {
                return false; // 找不到指定的 Survey
            }

            // 一、刪除與 Survey 關聯的 SurveyToGroups (必須先刪除以解除外鍵約束)
            if (survey.SurveyToGroups.Any())
            {
                _db.SurveyToGroups.RemoveRange(survey.SurveyToGroups);
                _db.SaveChanges();
            }

            // 二、刪除與 Survey 關聯的 QuestionImages (問卷級圖片)
            if (survey.QuestionImages.Any())
            {
                _db.QuestionImages.RemoveRange(survey.QuestionImages);
                _db.SaveChanges();
            }

            // 三、刪除 Survey 下的 Questions (以及 Questions 下的 Options、Images、FillInBlanks)
            foreach (var question in survey.Questions.ToList())
            {
                // 刪除 QuestionImages (問題級圖片)
                if (question.QuestionImages.Any())
                {
                    _db.QuestionImages.RemoveRange(question.QuestionImages);
                    _db.SaveChanges();
                }

                // 刪除 Question 的 FillInBlanks (若有問題級填空)
                if (question.FillInBlanks.Any())
                {
                    _db.FillInBlanks.RemoveRange(question.FillInBlanks);
                    _db.SaveChanges();
                }

                // 刪除 QuestionOption -> OptionImages, FillInBlanks
                foreach (var option in question.QuestionOptions.ToList())
                {
                    // 刪除 Option Images
                    if (option.QuestionImages.Any())
                    {
                        _db.QuestionImages.RemoveRange(option.QuestionImages);
                        _db.SaveChanges();
                    }

                    // 刪除 Option 的 FillInBlanks (若有)
                    if (option.FillInBlanks.Any())
                    {
                        _db.FillInBlanks.RemoveRange(option.FillInBlanks);
                        _db.SaveChanges();
                    }

                    // 刪除 Option 本身
                    _db.QuestionOptions.Remove(option);
                    _db.SaveChanges();
                }

                // 刪除 Question 本身
                _db.Questions.Remove(question);
                _db.SaveChanges();
            }

            // 四、刪除 Survey 本身
            RemovePhysical(survey);

            return true;
        }
        */

        
        public bool RemoveSurveyWithDependenciesPhysical(int surveyId)
        {
            try
            {
                // 暫時禁用外鍵約束
                _db.Database.ExecuteSqlRaw("ALTER TABLE SurveyToGroups NOCHECK CONSTRAINT FK_SurveyToGroups_Surveys_SurveyId");

                // 刪除 Survey
                _db.Database.ExecuteSqlRaw("DELETE FROM Surveys WHERE Id = {0}", surveyId);
                _db.SaveChanges();

                return true;
            }
            catch
            {
                return false;
            }
            finally
            {
                // 恢復外鍵約束
                _db.Database.ExecuteSqlRaw("ALTER TABLE SurveyToGroups WITH CHECK CHECK CONSTRAINT FK_SurveyToGroups_Surveys_SurveyId");
            }
        }
        

    }
}
