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
    public class BlankSurveyVM
    {
        public int SelectedLayerId { get; set; }
        public Layer Layer { get; set; }
        public DocumentExport DocumentExport { get; set; }
        public Category Category { get; set; }

        public IEnumerable<Layer> LayerList { get; set; }
        public IEnumerable<String> CategoryList { get; set; }
        public List<int?> SelectedSurveyIds { get; set; }
    }

}
