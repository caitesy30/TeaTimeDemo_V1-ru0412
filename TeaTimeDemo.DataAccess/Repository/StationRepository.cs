//StationRepository.cs

using Microsoft.EntityFrameworkCore.Migrations;
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
    public class StationRepository:Repository<Station>,IStationRepository
    {
        private ApplicationDbContext _db;

        public StationRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }


        public void Update(Station obj)
        {
            _db.Stations.Update(obj);
        }

        // 批次新增
        public void AddRange(IEnumerable<Station> entities)
        {
            _db.Stations.AddRange(entities); // 使用 EF Core 的 AddRange 方法批次新增
        }

        // 批次刪除
        public void RemoveRange(IEnumerable<Station> entities)
        {
            _db.Stations.RemoveRange(entities); // 使用 EF Core 的 RemoveRange 方法批次刪除
        }

    }
}
