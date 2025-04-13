using DocumentFormat.OpenXml.Presentation;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Permissions;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace TeaTimeDemo.Models.ViewModels
{
    public class PageGroupVM
    {
        public  int SelectedLayerId { get; set; }
        
        public Category Category { get; set; }
        public SurveyGroup SurveyGroup { get; set; }
        [JsonIgnore]
        public Layer Layer { get; set; }
        public List<Survey> Surveys { get; set; } = new List<Survey>();
        public List<int?> SelectedSurveyIds { get; set; }
        //public int[] Arr {  get; set; }測試
        public IEnumerable<Survey> SurveyList { get; set; }
        public IEnumerable<Category> CategoryList { get; set; }
        public IEnumerable<Layer> LayerList { get; set; }
    }

}
