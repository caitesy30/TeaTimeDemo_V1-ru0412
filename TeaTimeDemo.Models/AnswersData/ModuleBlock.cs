using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Numerics;
using System.Reflection.Emit;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace TeaTimeDemo.Models.AnswersData
{

	#region 模塊 : [母模組] ModuleBlock

    public class ModuleBlock
    {

        public  ModuleBlock()
        {
            InitModuleBlockS();

        }


        public int Id { get; set; }

        public string SurveyId { get; set; } //在哪一個問卷底下

        //隸屬於
        public string LayerParentId { get; set; } //在哪一個id框架底下

		#region # 框架位置
		public string PositionParentId { get; set; } //在哪一個id框架底下
        public int OrderRow { get; set; } //位置 行
        public int OrderColumn { get; set; } //位置 列
        public int OrderCount { get; set; } //位置 第幾個
        #endregion


        #region #選項內容

        public CheakBoxModule CheakBoxData = new CheakBoxModule();

        #endregion


        #region # 文本內容
        public string TextContent { get; set; } //在哪一個id框架底下
		public Dictionary<int, List<FillModule>> FillData = new Dictionary<int, List<FillModule>>();
        public Dictionary<int, List<ImageModule>> ImageData = new Dictionary<int, List<ImageModule>>();
        #endregion


        #region  # 表格欄位
        public List<ModuleBlock>[,] ModuleBlockS { get { return _ModuleBlockS; } }
        public List<ModuleBlock>[,] _ModuleBlockS /*= new List<ModuleBlock>[1, 1]*/;
        #endregion


        public void InitModuleBlockS()
        {
            if(_ModuleBlockS==null)
            {
                return;
            }
            for (int i = 0; i < _ModuleBlockS.GetLength(0); i++)
            {
                for (int j = 0; j < _ModuleBlockS.GetLength(1); j++)
                {
                    _ModuleBlockS[i, j] = new List<ModuleBlock>();
                }
            }
        }


        #region  # 表格欄位設定

        /// <o name="AddOrRemove">新增 (true) 或刪除 (false)。
        /// <o name="RowOrColumn">操作行 (true) 或列 (false)。
        /// <o name="HeadOrFeet">對頭部 (true) 或尾部 (false) 進行操作。
        public void SetModuleBlockSGrid(bool AddOrRemove, bool RowOrColumn, bool HeadOrFeet)
        {
            int rows = _ModuleBlockS.GetLength(0);
            int cols = _ModuleBlockS.GetLength(1);

            if (RowOrColumn) // 行操作
            {
                if (AddOrRemove) // 新增
                {
                    List<ModuleBlock>[,] newArray = new List<ModuleBlock>[rows + 1, cols];
                    for (int i = 0; i < rows; i++)
                    {
                        for (int j = 0; j < cols; j++)
                        {
                            newArray[HeadOrFeet ? i + 1 : i, j] = _ModuleBlockS[i, j];
                        }
                    }
                    // 新增行
                    for (int j = 0; j < cols; j++)
                    {
                        newArray[HeadOrFeet ? 0 : rows, j] = new List<ModuleBlock>();
                    }
                    _ModuleBlockS = newArray;
                }
                else if (rows > 1) // 刪除
                {
                    List<ModuleBlock>[,] newArray = new List<ModuleBlock>[rows - 1, cols];
                    for (int i = 0; i < rows - 1; i++)
                    {
                        for (int j = 0; j < cols; j++)
                        {
                            newArray[i, j] = _ModuleBlockS[HeadOrFeet ? i + 1 : i, j];
                        }
                    }
                    _ModuleBlockS = newArray;
                }
            }
            else // 列操作
            {
                if (AddOrRemove) // 新增
                {
                    List<ModuleBlock>[,] newArray = new List<ModuleBlock>[rows, cols + 1];
                    for (int i = 0; i < rows; i++)
                    {
                        for (int j = 0; j < cols; j++)
                        {
                            newArray[i, HeadOrFeet ? j + 1 : j] = _ModuleBlockS[i, j];
                        }
                    }
                    // 新增列
                    for (int i = 0; i < rows; i++)
                    {
                        newArray[i, HeadOrFeet ? 0 : cols] = new List<ModuleBlock>();
                    }
                    _ModuleBlockS = newArray;
                }
                else if (cols > 1) // 刪除
                {
                    List<ModuleBlock>[,] newArray = new List<ModuleBlock>[rows, cols - 1];
                    for (int i = 0; i < rows; i++)
                    {
                        for (int j = 0; j < cols - 1; j++)
                        {
                            newArray[i, j] = _ModuleBlockS[i, HeadOrFeet ? j + 1 : j];
                        }
                    }
                    _ModuleBlockS = newArray;
                }
            }
        }
        #endregion

      
        public string GetBlockHtml()
        {
            string safeId = System.Net.WebUtility.HtmlEncode(Id.ToString());
            StringBuilder result = new StringBuilder();

            result.Append($"<div id=\"{safeId}\"   class=\"ModuleBlock\"   draggable=\"true\">");
            result.Append("<div class=\"textBox\">");
            result.Append(OptionHtml());
            result.Append(GetLabelHtml());
            result.Append("</div>");
            result.Append(GetTableHtml(ModuleBlockS));
            result.Append("</div>");

            return result.ToString();
        }
        private string GetLabelHtml()
        {
            string safeId = System.Net.WebUtility.HtmlEncode(Id.ToString());
            // 設定 option focus 並生成 label
            string labelHtml = $"<label id=\"label_{safeId}\"";
            labelHtml += SetOptionFocus();
            labelHtml += TextContent;
            labelHtml += "</label>";

            return labelHtml;
        }
        string OptName { get { return _CheckBoxName(); } }
        string Q_name { get { return _QuestionName(); } }


        string SetOptionFocus()
        {

            //如果是選項
            if (CheakBoxData.IsCheakBoxMode && !string.IsNullOrWhiteSpace(CheakBoxData.LayerParentId))
            {
                return OptionFocusHtml();
            }
            else {

                return ">";
            }
            
        }


        string _CheckBoxName()
        {
            return $"Opt_{Id}";
        }

        string _QuestionName()
        {
            return $"Q_{CheakBoxData.LayerParentId}";
        }


        string OptionFocusHtml()
        {

            string Result = $"for=\"{OptName}\">";

            return Result;
        }

        string OptionHtml()
        {
            //如果是選項
            if (CheakBoxData.IsCheakBoxMode && !string.IsNullOrWhiteSpace(CheakBoxData.LayerParentId))
            {
                string OptionType = CheakBoxData.IsRadio ? "radio" : "checkbox";

                string Result = $"<input id=\"{OptName}\" name=\"{Q_name}\" required=\" \" type=\"checkbox\" value=\"{Id}\">";

                return Result;
            }
            else
            {
                return "";
            }
        }
        string GetTableHtml(List<ModuleBlock>[,] tableData)
        {
            StringBuilder html = new StringBuilder();

            // 開始表格
            html.AppendLine("<table>");

            // 生成表格的內容 (tbody)
            //html.AppendLine("<tbody>");
            if(tableData==null)
            {
                return "";
            }
            for (int i = 0; i < tableData.GetLength(0); i++)  // 遍歷行
            {
                html.AppendLine("<tr>");
                for (int j = 0; j < tableData.GetLength(1); j++)  // 遍歷列
                {
                    if(tableData[i, j]!=null)
                    {
                        // html.AppendLine("<td class=\"ModuleBlock\" draggable=\"true\">");
                        html.AppendLine("<td>");
                        html.AppendLine("<div class=\"table_Field\">");
                        for (int k = 0; k < tableData[i, j].Count; k++)  // 遍歷列
                        {
                           
                            html.AppendLine($"{tableData[i, j][k].GetBlockHtml()}");  // 取得每個單元格的值
                          
                        }
                        html.AppendLine("</div>");
                        html.AppendLine("</td>");
                    }
             
                }
                html.AppendLine("</tr>");
            }


            //html.AppendLine("</tbody>");

            // 結束表格
            html.AppendLine("</table>");

            return html.ToString();
        }


    }

    #endregion



	public class ImageModule
	{
        // 圖片大小
        public int LocWidth { get; set; }
        public int LocHeight { get; set; }
        // 圖片大小
        public int Width { get; set; }
        public int Height { get; set; }

    }

    public class FillModule
    {
        // 填空長度
        public int Length { get; set; }

        // 填空位置（可以是字符位置索引，也可以是其他標識）
        public int Position { get; set; }

        // 可選：填空的標籤或提示 (例如：「請輸入姓名」)
        public string Placeholder { get; set; }

        // 可選：用來初始化填空內容
        public string Answer { get; set; }

        public FillRule FillRule { get; set; }
    }

    public class FillRule
    {
        // 填空長度限制
        public int MaxLength { get; set; }

        // 是否為必填
        public bool Required { get; set; }

        // 填空的格式，使用正則表達式驗證填空
        public string Pattern { get; set; }

        // 預設值
        public string DefaultValue { get; set; }

        // 構造函數
        public FillRule(int maxLength, bool required = true, string pattern = "", string defaultValue = "")
        {
            MaxLength = maxLength;
            Required = required;
            Pattern = pattern;
            DefaultValue = defaultValue;
        }

        // 檢查填空內容是否符合規則
        public bool ValidateAnswer(string answer)
        {
            if (Required && string.IsNullOrWhiteSpace(answer)) return false; // 必填項判斷
            if (answer.Length > MaxLength) return false; // 長度限制
            if (!string.IsNullOrEmpty(Pattern) && !Regex.IsMatch(answer, Pattern)) return false; // 格式驗證
            return true;
        }
    }

    public class CheakBoxModule
    {

        // 是否是選項框
        public bool IsCheakBoxMode { get; set; }

        //隸屬於
        public string LayerParentId { get; set; } //在哪一個id框架底下

        // 是否為必填
        public bool IsRadio { get; set; }

    }





    #region  [模塊功能]
    //	模塊功能 : 每個模塊裡面都可以放字?  還是只有標題模塊 跟 問題模塊可以?
    //	編輯文字 : 粗細 斜體 字體顏色-背景顏色(3種 (限制避免版面混亂) )
    //	編輯填空 : 防呆表達式 文字長度 提示 插入位置  (選項模塊)
    //	編輯圖片 : 原始比例 調整比例 大小 文字提示 插入位置
    //	簡/詳答題 : 提示 簡答 詳答 字元長度
    #endregion

    // ModuleBlock模組方塊
    public enum ModuleType
	{
		[Display(Name = "無")]
		None = 0,
		[Display(Name = "標題或描述")]
		Title =1,     // 標題(編輯文字/編輯填空/編輯圖片) 多個問題 圖片或是表格  //不能放選項

		[Display(Name = "表格")]
		Table = 2,     // 可以放多個標題 多個問題 圖片或是表格  //不能放選項

		[Display(Name = "問題")] //唯一有選項功能的 不可以放問題造成無線迴圈 (流程圖例外)  >>QuestionModuleType.SingleChoiceFlow
		Question = 3,  // 問題(編輯文字/編輯填空/編輯圖片) 可放入多個選項 圖片或是表格

		[Display(Name = "選項")]  //選項模塊 由 父親類別製造 由父親定義是單選還是複選
		Option = 4,
	}

	// 問題類型
	public enum QuestionModuleType
	{
		[Display(Name = "簡/詳答題")]
		OpenEnded = 0,  // 簡答題與詳答題 唯一

        [Display(Name = "填空題")]
		FillInTheBlank = 1,  // 單純填空題 沒有選項  唯一

		[Display(Name = "單選題")]
		SingleChoice = 2,    // 單選題 可混合填空   可以多個

		[Display(Name = "複選題")]
		MultipleChoice = 3,   // 複選題 可混合填空  可以多個
    }


}







//<div>

//  <input id="Opt_8" name="Q_5" required=" " type="checkbox" value="8">     <<複選
//  <input id = "Opt_8" name = "Q_5" required = " "type ="radio" value ="8" >   <<單選
//  <label for= "Opt_8" > 有前版(或相似料號) 料號：______________ 跳至(2) </label>

//</div>



/////////////////////////////////////////////////////////////////////////////////

//    <table>
//        <thead>
//            <tr>
//                <th>  [ModuleBlock]  </th>
//                <th>  [ModuleBlock]  </th>
//                <th>  [ModuleBlock]  </th>
//            </tr>
//        </thead>
//        <tbody>
//            <tr>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//            </tr>
//            <tr>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//            </tr>
//            <tr>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//                <td>  [ModuleBlock]  </td>
//            </tr>
//        </tbody>
//    </table>