using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class AnsweredSurveyRepository : Repository<AnsweredSurvey>, IAnsweredSurveyRepository
    {
        private readonly ApplicationDbContext _db;

        public AnsweredSurveyRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(AnsweredSurvey obj)
        {
            _db.AnsweredSurveys.Update(obj);
        }
    }
}
