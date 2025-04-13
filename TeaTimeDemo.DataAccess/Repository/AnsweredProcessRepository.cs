using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnsweredProcessRepository : Repository<AnsweredProcess>, IAnsweredProcessRepository
    {
        private readonly ApplicationDbContext _db;

        public AnsweredProcessRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(AnsweredProcess obj)
        {
            _db.AnsweredProcess.Update(obj);
        }
    }
}
