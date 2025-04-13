using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using Microsoft.Identity.Client;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class SurveyGroupRepository : Repository<SurveyGroup>, ISurveyGroupRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyGroupRepository(ApplicationDbContext db) : base(db) 
        {
            _db = db;
        }

        public void Update(SurveyGroup obj)
        {
            _db.SurveyGroups.Update(obj);
        }
    }
}