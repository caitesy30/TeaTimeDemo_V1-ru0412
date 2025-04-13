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
    public class LanguageRepository : Repository<Language>, ILanguageRepository
    {
        private ApplicationDbContext _db;
        public LanguageRepository(ApplicationDbContext db) : base(db) 
        {
            _db = db;
        }
        public void Update(Language obj)
        {
            _db.Update(obj);
        }
    }
}
