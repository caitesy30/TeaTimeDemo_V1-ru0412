using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface INotesModifyRepository : IRepository<NotesModify>
    {
        void Update(NotesModify obj);
    }
}
