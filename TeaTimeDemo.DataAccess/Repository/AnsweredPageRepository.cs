using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnsweredPageRepository : Repository<AnsweredPage>, IAnsweredPageRepository
    {
        private readonly ApplicationDbContext _db;

        public AnsweredPageRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(AnsweredPage obj)
        {
            _db.AnsweredPages.Update(obj);
        }
    }
}
