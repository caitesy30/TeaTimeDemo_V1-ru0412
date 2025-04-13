using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnswerOptionRepository : Repository<AnswerOption>, IAnswerOptionRepository
    {
        private readonly ApplicationDbContext _db;

        public AnswerOptionRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(AnswerOption obj)
        {
            var objFromDb = _db.AnswerOptions.FirstOrDefault(ao => ao.Id == obj.Id);
            if (objFromDb != null)
            {
                objFromDb.IsCorrect = obj.IsCorrect;
                objFromDb.IsOther = obj.IsOther;
                objFromDb.Description = obj.Description;
                // 其他屬性更新邏輯...
            }
        }
    }
}
