using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnswerRepository : Repository<Answer>, IAnswerRepository
    {
        private readonly ApplicationDbContext _db;

        public AnswerRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Answer obj)
        {
            var objFromDb = _db.Answers.FirstOrDefault(a => a.Id == obj.Id);
            if (objFromDb != null)
            {
                objFromDb.AnswerText = obj.AnswerText;
                objFromDb.MtNum = obj.MtNum;
                // 其他屬性更新邏輯...
            }
        }
    }
}
