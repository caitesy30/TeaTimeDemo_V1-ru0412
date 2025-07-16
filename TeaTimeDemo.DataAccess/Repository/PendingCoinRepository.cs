using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class PendingCoinRepository : Repository<PendingCoin>, IPendingCoinRepository
    {
        private readonly ApplicationDbContext _db;

        public PendingCoinRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }


        public void Update(PendingCoin obj)
        {
            _db.Update(obj);
        }



    }
}
