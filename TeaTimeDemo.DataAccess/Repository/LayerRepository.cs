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
 

    public class LayerRepository : Repository<Layer>, ILayerRepository
    {
        private ApplicationDbContext _db;
        public LayerRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(Layer obj)
        {
            _db.Update(obj);
        }
    }
}
