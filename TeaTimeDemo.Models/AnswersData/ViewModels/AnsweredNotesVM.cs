using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class AnsweredNotesVM
    {
        public string Title { get; set; }
        public AnsweredNotes AnsweredNotes { get; set; }
        public IEnumerable<OptionSelection> AllProcess { get; set; }
        //public IEnumerable<Category> Categorys { get; set; }
        //public IEnumerable<Layer> Layers { get; set; }

        public List<ProcessProgress> ProcessingProcess { get; set; }

        
    }
    public class ProcessProgress
    {
        public int ProcessingProcess {get; set;}
        public int Total { get; set; }
        public int Completed { get; set; }
    }
}
    