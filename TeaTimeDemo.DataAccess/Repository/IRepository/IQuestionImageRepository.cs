using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface IQuestionImageRepository : IRepository<QuestionImage>
    {
        void Update(QuestionImage obj);

        void RemoveRange(IEnumerable<QuestionImage> objs);

        void RemovePhysical(QuestionImage obj);

        void RemovePhysicalRange(IEnumerable<QuestionImage> objs); // 新增

    }
}
