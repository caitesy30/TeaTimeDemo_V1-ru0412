// Areas/Admin/Controllers/API/SurveyReactController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using TeaTimeDemo.Utility;

namespace TeaTimeDemo.Areas.Admin.Controllers.API
{
    [Area("Admin")]
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)] // 只有 Admin 和 Manager 角色能存取
    public class SurveyReactController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SurveyReactController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// 取得所有類別，用於下拉選單
        /// </summary>
        /// <returns>類別列表</returns>
        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = _unitOfWork.Category.GetAll()
                                .Select(c => new SelectListItem { Text = c.Name, Value = c.Id.ToString() })
                                .ToList();
            return Ok(categories);
        }

        /// <summary>
        /// 取得所有站別，用於下拉選單
        /// </summary>
        /// <returns>站別列表</returns>
        [HttpGet("stations")]
        public IActionResult GetStations()
        {
            var stations = _unitOfWork.Station.GetAll()
                                .Select(s => new SelectListItem { Text = s.Name, Value = s.Name })
                                .ToList();
            return Ok(stations);
        }

        /// <summary>
        /// 保存問卷資料
        /// </summary>
        /// <param name="surveyVM">問卷的 ViewModel</param>
        /// <returns>儲存結果</returns>
        [HttpPost("save")]
        public async Task<IActionResult> SaveSurvey([FromBody] SurveyVM surveyVM)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 處理新增或編輯問卷
            if (surveyVM.Survey.Id == 0)
            {
                // 新增問卷
                _unitOfWork.Survey.Add(surveyVM.Survey);
                _unitOfWork.Save(); // 保存以生成問卷的 ID

                // 處理問題
                foreach (var questionVM in surveyVM.QuestionVMs)
                {
                    // 映射到 Question 實體
                    var question = new Question
                    {
                        SurveyId = surveyVM.Survey.Id,
                        QuestionText = questionVM.QuestionText,
                        AnswerType = (TeaTimeDemo.Models.AnswerTypeEnum)questionVM.AnswerType // 明確轉型
                    };


                    _unitOfWork.Question.Add(question);
                    _unitOfWork.Save(); // 保存以生成問題的 ID

                    // 處理選項
                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        var option = new QuestionOption
                        {
                            QuestionId = question.Id,
                            OptionText = optionVM.OptionText,
                            IsCorrect = optionVM.IsCorrect
                        };
                        _unitOfWork.QuestionOption.Add(option);
                        _unitOfWork.Save(); // 保存以生成選項的 ID
                    }
                }


                return Ok(new { success = true, message = "問卷已成功新增。" });
            }
            else
            {
                // 編輯問卷
                var existingSurvey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyVM.Survey.Id);
                if (existingSurvey == null)
                {
                    return NotFound();
                }

                // 更新問卷屬性
                existingSurvey.Title = surveyVM.Survey.Title;
                existingSurvey.Description = surveyVM.Survey.Description;
                existingSurvey.CategoryId = surveyVM.Survey.CategoryId;
                existingSurvey.StationName = surveyVM.Survey.StationName;
                existingSurvey.IsPublished = surveyVM.Survey.IsPublished;

                _unitOfWork.Survey.Update(existingSurvey);
                _unitOfWork.Save();

                // 處理問題的更新（這裡可以根據需要實現更複雜的邏輯，如刪除、更新、添加問題）
                // 這裡僅示範如何更新現有問題和添加新問題
                foreach (var questionVM in surveyVM.QuestionVMs) // 修改為 QuestionVMs
                {
                    if (questionVM.Id == 0)
                    {
                        // 新增問題
                        var question = new Question
                        {
                            SurveyId = surveyVM.Survey.Id,
                            QuestionText = questionVM.QuestionText,
                            AnswerType = (TeaTimeDemo.Models.AnswerTypeEnum)questionVM.AnswerType // 明確轉型
                        };
                        _unitOfWork.Question.Add(question);
                        _unitOfWork.Save();
                    }
                    else
                    {
                        // 更新問題
                        var existingQuestion = _unitOfWork.Question.GetFirstOrDefault(q => q.Id == questionVM.Id);
                        if (existingQuestion != null)
                        {
                            existingQuestion.QuestionText = questionVM.QuestionText;
                            existingQuestion.AnswerType = (TeaTimeDemo.Models.AnswerTypeEnum)questionVM.AnswerType; // 明確轉型
                            _unitOfWork.Question.Update(existingQuestion);
                            _unitOfWork.Save();
                        }
                    }

                    // 處理選項
                    foreach (var optionVM in questionVM.QuestionOptionVMs)
                    {
                        if (optionVM.Id == 0)
                        {
                            // 新增選項
                            var option = new QuestionOption
                            {
                                QuestionId = questionVM.Id,
                                OptionText = optionVM.OptionText,
                                IsCorrect = optionVM.IsCorrect
                            };
                            _unitOfWork.QuestionOption.Add(option);
                            _unitOfWork.Save();
                        }
                        else
                        {
                            // 更新選項
                            var existingOption = _unitOfWork.QuestionOption.GetFirstOrDefault(o => o.Id == optionVM.Id);
                            if (existingOption != null)
                            {
                                existingOption.OptionText = optionVM.OptionText;
                                existingOption.IsCorrect = optionVM.IsCorrect;
                                _unitOfWork.QuestionOption.Update(existingOption);
                                _unitOfWork.Save();
                            }
                        }
                    }
                }


                return Ok(new { success = true, message = "問卷已成功更新。" });
            }
        }
    }
}
