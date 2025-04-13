using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnsweredNotesRepository : Repository<AnsweredNotes>, IAnsweredNotesRepository
    {
        private readonly ApplicationDbContext _db;

        public AnsweredNotesRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(AnsweredNotes obj)
        {
            _db.AnsweredNotes.Update(obj);
        }
    }
}
