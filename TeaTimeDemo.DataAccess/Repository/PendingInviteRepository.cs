using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Linq;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class PendingInviteRepository : Repository<PendingInvite>, IPendingInviteRepository
    {
        private readonly ApplicationDbContext _db;

        public PendingInviteRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }


        public void Update(PendingInvite obj)
        {
            _db.Update(obj);
        }



    }
}
