using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class QuestionRepository : Repository<Question>, IQuestionRepository
    {
        private readonly ApplicationDbContext _db;

        public QuestionRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        /*
        public void Update(Question obj)
        {
            var objFromDb = _db.Questions.FirstOrDefault(q => q.Id == obj.Id);
            if (objFromDb != null)
            {
                objFromDb.QuestionText = obj.QuestionText;
                objFromDb.AnswerType = obj.AnswerType;
                objFromDb.MceHtml = obj.MceHtml;
                // 其他屬性更新邏輯...
            }
        }
        */

        public void Update(Question obj)
        {
            _db.Questions.Update(obj);
        }

        public void SoftDelete(Question obj)
        {
            obj.IsDeleted = true;
            obj.DeletedAt = DateTime.Now;
            _db.Questions.Update(obj);
        }

        public void Restore(Question obj)
        {
            obj.IsDeleted = false;
            obj.DeletedAt = null;
            _db.Questions.Update(obj);
        }

        public void RemovePhysical(Question obj)
        {
            var entry = _db.Entry(obj);
            if (entry.State == EntityState.Detached)
            {
                dbSet.Attach(obj);
            }

            try
            {
                _db.IsHardDelete = true;
                dbSet.Remove(obj);
                _db.SaveChanges();
            }
            finally
            {
                _db.IsHardDelete = false;
            }
        }

        public IEnumerable<Question> GetAll(
         Expression<Func<Question, bool>> filter = null,
         Func<IQueryable<Question>, IOrderedQueryable<Question>> orderBy = null,
         string includeProperties = "",
         bool ignoreQueryFilters = false
     )
        {
            IQueryable<Question> query = dbSet;

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
