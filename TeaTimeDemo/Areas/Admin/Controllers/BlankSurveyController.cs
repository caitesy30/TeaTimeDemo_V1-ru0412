
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using TeaTimeDemo.Controllers;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.DTOs;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.AnswersData.ViewModels;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.Web;
using static TeaTimeDemo.Models.AnswersData.ViewModels.AnsweredIndexVM;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository;
using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Identity.Client;








namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize]
    public class BlankSurveyController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public BlankSurveyController(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork=unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }


    #region VIEW
        public IActionResult Index(string status)   //NotesList
        {
            return View();
        }
         
        public IActionResult Station(int NotesId)
        {
            var blankSurveyVM = new BlankSurveyVM
            {
                Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == NotesId),
                LayerList = _unitOfWork.Layer.GetAll().ToList(),
            };
            return View(blankSurveyVM);
        }

        public IActionResult Survey(int NotesId, int StationId)
        {
            //var selectedSurveyIds = _unitOfWork.BlankSurvey
            //    .GetAll(stg => stg.CategoryId == NotesId && stg.LayerId == StationId && stg.SurveyId != null)
            //    .Select(stg => stg.SurveyId)
            //    .ToList();
            var blankSurveyVM = new BlankSurveyVM
            {
                Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == NotesId),
                Layer = _unitOfWork.Layer.GetFirstOrDefault(l => l.Id == StationId),
                //SelectedSurveyIds = selectedSurveyIds,
            };
            return View(blankSurveyVM);
        }


        #endregion


        #region 新增
        [HttpPost]
        public IActionResult AddNotes(Category category)
        {
            foreach (var key in Request.Form.Keys)
            {
                Console.WriteLine($"Key: {key}, Value: {Request.Form[key]}");
            }
            if (ModelState.IsValid)
            {
                _unitOfWork.Category.Add(category);
                _unitOfWork.Save();
                TempData["success"] = "新增類別成功！";
            }
            return RedirectToAction("Index");
        }


        public IActionResult AddLayer(BlankSurveyVM blankSurveyVM)
        {
            ModelState.Remove("Category.Id");
            ModelState.Remove("Category.Name");
            ModelState.Remove("Category.DisplayOrder");
            if (ModelState.IsValid)
            {
                _unitOfWork.Layer.Add(blankSurveyVM.Layer);
                _unitOfWork.Save();
                var blankSurveyDb = new BlankSurvey
                {
                    CategoryId = blankSurveyVM.Category.Id,
                    LayerId = blankSurveyVM.Layer.Id
                };
                _unitOfWork.BlankSurvey.Add(blankSurveyDb);
                _unitOfWork.Save();
                TempData["success"] = "新增類別成功！";
                
            }
            int categoryId = blankSurveyVM.Category.Id;
            return RedirectToAction("Station", new { NotesId = categoryId });
        }

        [HttpPost]
        public IActionResult NotesUpsert(BlankSurveyVM blankSurveyVM, IFormFile? file)
        {
            if (ModelState.IsValid)
            {
                string rootPath = _webHostEnvironment.WebRootPath;
                if (file != null)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string categoryPath = Path.Combine(rootPath, @"images\category");
                    if (!Directory.Exists(categoryPath))
                    {
                        Directory.CreateDirectory(categoryPath);
                    }
                    if (!string.IsNullOrEmpty(blankSurveyVM.Category.ImageUrl))
                    {
                        var oldImagePath =
                            Path.Combine(rootPath, blankSurveyVM.Category.ImageUrl.TrimStart('\\'));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }
                    using (var filestream = new FileStream(Path.Combine(categoryPath, fileName), FileMode.Create))
                    {
                        file.CopyTo(filestream);
                    }
                    blankSurveyVM.Category.ImageUrl = @"\images\category\" + fileName;
                }
                _unitOfWork.Category.Update(blankSurveyVM.Category);
                _unitOfWork.Save();
                TempData["success"] = "類別更新成功！";

            }
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult AddSelectLayer(BlankSurveyVM blankSurveyVM)
        {
            if (blankSurveyVM.SelectedLayerId > 0 && blankSurveyVM.Category.Id > 0)
            {
                var existData = _unitOfWork.BlankSurvey
                    .GetFirstOrDefault(stg => stg.CategoryId == blankSurveyVM.Category.Id &&
                    stg.LayerId == blankSurveyVM.SelectedLayerId);

                if (existData == null)
                {
                    var surveyToDb = new BlankSurvey
                    {
                        CategoryId = blankSurveyVM.Category.Id,
                        LayerId = blankSurveyVM.SelectedLayerId
                    };
                    _unitOfWork.BlankSurvey.Add(surveyToDb);
                    _unitOfWork.Save();
                }
            }
            int categoryId = blankSurveyVM.Category.Id;
            //pageGroupVM.Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == id);
            blankSurveyVM.LayerList = _unitOfWork.Layer.GetAll().ToList();
            return RedirectToAction("Station", new { NotesId = categoryId });
        }


        #endregion

        public BlankSurveyVM getBlankSurveyVM(BlankSurveyVM blankSurveyVM)
        {
            if (blankSurveyVM.SelectedSurveyIds != null )
            {
                //if (blankSurveyVM.SelectedSurveyIds == null)
                //{
                //    blankSurveyVM.SelectedSurveyIds = new List<int?>();
                //}

                int countObj = blankSurveyVM.SelectedSurveyIds.Count();


                //List<int?> existGroup = _unitOfWork.BlankSurvey
                //    .GetAll(stg => stg.LayerId == blankSurveyVM.Layer.Id && stg.SurveyId != null)
                //    .Select(stg => stg.SurveyId)
                //    .ToList();
                //比對差異
                //var idToAdd = blankSurveyVM.SelectedSurveyIds.Except(existGroup).ToList();

                //var idToRemove = existGroup.Except(blankSurveyVM.SelectedSurveyIds).ToList();
                //if (idToRemove.Any())
                //{
                //    foreach (var id in idToRemove)
                //    {
                //        var removeFromDb = _unitOfWork.BlankSurvey
                //            .GetFirstOrDefault(stg => stg.LayerId == blankSurveyVM.Layer.Id
                //            && stg.SurveyId == id);
                //        if (removeFromDb != null)
                //        {
                //            _unitOfWork.BlankSurvey.Remove(removeFromDb);
                //        }
                //    }
                //}
                //if (idToAdd.Any())
                //{
                //    foreach (var id in idToAdd)
                //    {
                //        _unitOfWork.BlankSurvey.Add(
                //            new BlankSurvey
                //            {
                //                SurveyId = id,
                //                LayerId = blankSurveyVM.Layer.Id,
                //                CategoryId = blankSurveyVM.Category.Id,
                //            });
                //        //countObj++;
                //    }
                //}
                //blankSurveyVM.SurveyGroup.Count = countObj;
               // _unitOfWork.SurveyGroup.Update(blankSurveyVM.SurveyGroup);
                _unitOfWork.Save();
                TempData["Success"] = "問卷選取成功！";
            }
            return blankSurveyVM;
        }

        [HttpPost]
        public IActionResult Upsert(BlankSurveyVM blankSurveyVM, int? NotesId, int? StationId)
        {
            if (ModelState.IsValid)
            {
                blankSurveyVM.Category = _unitOfWork.Category
                    .GetFirstOrDefault(c => c.Id == NotesId);
                blankSurveyVM.Layer = _unitOfWork.Layer.GetFirstOrDefault(sg => sg.Id == StationId);
                //_unitOfWork.SurveyGroup.Update(blankSurveyVM.SurveyGroup);
                //_unitOfWork.Save();
                getBlankSurveyVM(blankSurveyVM);

            }
            return RedirectToAction("Station", new { NotesId = NotesId });
        }



        #region API CALLS


        [HttpDelete]
        [Route("Admin/BlankSurvey/Delete/{tableName}/{id}")]
        public IActionResult Delete(string tableName, int id)
        {
            switch (tableName)
            {
                case "NtblData":
                    var notesToRemove = _unitOfWork.BlankSurvey
                        .GetAll(stg => stg.CategoryId == id);
                    var categoryToRemove = _unitOfWork.Category
                        .GetFirstOrDefault(c => c.Id == id);
                    _unitOfWork.BlankSurvey.RemoveRange(notesToRemove);
                    _unitOfWork.Category.Delete(categoryToRemove);
                    break;
                //case "LtblData":
                //    var layerToRemove = _unitOfWork.BlankSurvey
                //        .GetAll(stg => stg.LayerId == id);
                //    _unitOfWork.BlankSurvey.RemoveRange(layerToRemove);
                //    break;
                case "LtblData":
                    // 移除與該流程相關聯的 BlankSurvey 資料
                    //var blankSurveysToRemove = _unitOfWork.BlankSurvey
                    //    .GetAll(stg => stg.LayerId == id).ToList();
                    //if (blankSurveysToRemove.Any())
                    //{
                    //    _unitOfWork.BlankSurvey.RemoveRange(blankSurveysToRemove);
                    //}
                    // 取得該流程（Layer）記錄
                    var layerToRemove = _unitOfWork.Layer.GetFirstOrDefault(l => l.Id == id);
                    if (layerToRemove == null)
                    {
                        return Json(new { success = false, message = "找不到該流程" });
                    }
                    // 刪除該流程記錄
                    _unitOfWork.Layer.Delete(layerToRemove);
                    break;


                default:
                    return Json(new { success = false, message = "無效名稱" });
            }
            _unitOfWork.Save();
            return Json(new { success = true, message = "刪除成功" });
        }


        [HttpGet]
        public IActionResult GetNotes()
        {
            var CategoryList = _unitOfWork.Category.GetAll().Select(l => new
            {
                Id = l.Id,
                Name = l.Name,
                DisplayOrder = l.DisplayOrder,
                Ispublished = l.IsPublished
            }).ToList();
            return Json(new { data = CategoryList });
        }

        [HttpGet]
        [Route("/Admin/BlankSurvey/getLayers/{categoryId}")]
        public IActionResult GetLayers(int? categoryId)
        {
            var selectLayerId = _unitOfWork.BlankSurvey
                .GetAll(b => b.CategoryId == categoryId)
                .Select(b => b.LayerId).ToList();
            var layerList = _unitOfWork.Layer
            .GetAll(a => selectLayerId.Contains(a.Id)) 
            .Select(a => new
            {
                Id = a.Id,
                Name = a.Name,
                Order = a.Order,
                Description = a.Description
            }).ToList();
            return Json(new { data = layerList });
        }

        [HttpGet]
        public IActionResult GetSurveys()
        {
            var SurveyList = _unitOfWork.DocumentExport.GetAll().Select(d => new
            {
                Id = d.Id,
                Category = d.Category,
                Station = d.Station,
                PageNo = d.PageNo,
                DocumentId = d.DocumentId,
            }).ToList();
            return Json(new { data = SurveyList });
        }

        
        #endregion
    }
}
