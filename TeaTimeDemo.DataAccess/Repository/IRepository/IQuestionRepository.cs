using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface IQuestionRepository : IRepository<Question>
    {
        void Update(Question obj);

        void SoftDelete(Question obj);

        void Restore(Question obj);

        void RemovePhysical(Question obj);

        IEnumerable<Question> GetAll(
          Expression<Func<Question, bool>> filter = null,
          Func<IQueryable<Question>, IOrderedQueryable<Question>> orderBy = null,
          string includeProperties = "",
          bool ignoreQueryFilters = false
      );
    }
}
