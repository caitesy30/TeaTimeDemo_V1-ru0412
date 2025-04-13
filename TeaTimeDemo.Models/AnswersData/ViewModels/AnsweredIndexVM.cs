using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.ExtendedProperties;
using DocumentFormat.OpenXml.Office2010.PowerPoint;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace TeaTimeDemo.Models.AnswersData.ViewModels
{
    public class AnsweredIndexVM
    {

        public IEnumerable<AnsweredNotes> AllNotes { get; set; }

        public IEnumerable<Category> Categorys { get; set; }
        public IEnumerable<Layer> Layers { get; set; }

        public List<NotesProgress> NotesProcess { get; set; }

        public List<SurveyOption> SurveyOptions { get; set; }

        public IEnumerable<AnsweredNotes> SelectedNotes { get; set; }
        public IEnumerable<NotesModify> NotesModifyLogs { get; set; }
        public class NotesProgress
        {
            public string MtNum { get; set; }
            public int Total { get; set; }
            public int Completed { get; set; }
        }




        public class SurveyOption
        {
            public int CategoryId { get; set; }
            public string ProcessName { get; set; }
            public string OptionName { get; set; }
            public List<int> SurveyIds { get; set; }
        }

        public class PageSelection
        {
            public int SurveyId { get; set; }
            public int Version { get; set; }
        }
        public class OptionSelection
        {

            public string ProcessName { get; set; }
            //public string ProcessType { get; set; }
            public int Value { get; set; }
            public List<PageSelection> PageList { get; set; }
        }

        public class CreateNotesRequest
        {
            public string MtNum { get; set; }
            public int PcbCategoryId { get; set; }
            public List<OptionSelection> OptionList { get; set; }
        }


        public  class UpdateOptionRequest
        {
            public int BlankSurveyId { get; set; }

            public string OptionName { get; set; }
            public List<int> SurveyIds { get; set; }
        }

    }
}
