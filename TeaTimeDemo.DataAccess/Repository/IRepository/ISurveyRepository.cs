using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface ISurveyRepository : IRepository<Survey>
    {
        void Update(Survey obj);

        void RemovePhysical(Survey obj);


        void RemovePhysicalRange(IEnumerable<Survey> objs); // 新增

        public bool RemoveSurveyWithDependenciesPhysical(int surveyId);
    }
}
