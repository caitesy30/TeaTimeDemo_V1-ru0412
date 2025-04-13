using Microsoft.EntityFrameworkCore.Update.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class BlankSurveyRepository : Repository<BlankSurvey>, IBlankSurveyRepository
    {
        private ApplicationDbContext _db;  
        public BlankSurveyRepository(ApplicationDbContext db) : base(db) 
        {
            _db = db;
        }
        public void Update(BlankSurvey obj)
        {
            _db.Update(obj);
        }
    }
}
