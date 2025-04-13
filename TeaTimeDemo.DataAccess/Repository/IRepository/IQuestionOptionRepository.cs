// DataAccess/Repository/IRepository/IQuestionOptionRepository.cs

using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    /// <summary>
    /// 定義 QuestionOption 的特定操作接口
    /// </summary>
    public interface IQuestionOptionRepository : IRepository<QuestionOption>
    {

        /// <summary>
        /// 更新選項資料
        /// </summary>
        /// <param name="obj">需要更新的 QuestionOption 實體</param>
        void Update(QuestionOption obj);

        /// <summary>
        /// 執行軟刪除
        /// </summary>
        /// <param name="obj">需要軟刪除的 QuestionOption 實體</param>
        void SoftDelete(QuestionOption obj);

        /// <summary>
        /// 還原軟刪除
        /// </summary>
        /// <param name="obj">需要還原的 QuestionOption 實體</param>
        void Restore(QuestionOption obj);

        /// <summary>
        /// 執行物理刪除
        /// </summary>
        /// <param name="obj">需要物理刪除的 QuestionOption 實體</param>
        void RemovePhysical(QuestionOption obj);

        void Remove(QuestionOption obj);

        IEnumerable<QuestionOption> GetAll(
      Expression<Func<QuestionOption, bool>> filter = null,
      Func<IQueryable<QuestionOption>, IOrderedQueryable<QuestionOption>> orderBy = null,
      string includeProperties = "",
      bool ignoreQueryFilters = false); // 新增此參數

    }
}
