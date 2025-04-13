//IStationRepository.cs

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface IStationRepository:IRepository<Station>
    {
        void Update(Station obj);

        void AddRange(IEnumerable<Station> entities);  // 批次新增
        void RemoveRange(IEnumerable<Station> entities);  // 批次刪除
    }
}
