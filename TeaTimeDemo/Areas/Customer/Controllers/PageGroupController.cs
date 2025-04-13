using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Build.ObjectModelRemoting;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using SQLitePCL;
using TeaTimeDemo.DataAccess.Repository;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.CodeAnalysis;


namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Authorize]
    public class PageGroupController : Controller
    {

        static Dictionary<int, PageGroupVM> PageGroupVMsDic = new Dictionary<int, PageGroupVM>();

        private readonly IWebHostEnvironment _webHostEnvironment;

        private readonly IUnitOfWork _unitOfWork;
        public PageGroupController(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }


        #region VIEWS


        /// <summary>
        /// 進入page層級的view
        /// </summary>
        /// <param name="id">傳入LayerId</param>
        /// <returns></returns>
        [HttpGet]
        [Route("customer/pagegroup/Page/{categoryId}/{layerId}")]
        public IActionResult Page(int? categoryId, int? layerId)
        {
            var pageGroupVM = new PageGroupVM
            {
                Layer = _unitOfWork.Layer.GetFirstOrDefault(l => l.Id == layerId),
                Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == categoryId),
                //SurveyGroup = _unitOfWork.SurveyGroup.GetAll(),
            };
            return View(pageGroupVM);
        }

        /// <summary>
        /// 勾選survey的View
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("customer/pagegroup/upsert/{categoryId}/{layerId}/{id}")]
        public IActionResult Upsert(int? categoryId, int? layerId, int? id)
        {
            //var selectedLayerIds = _unitOfWork.Layer.GetAll();
            var selectedSurveyIds = _unitOfWork.SurveyToGroup
                .GetAll(stg => stg.SurveyGroupId == id && stg.CategoryId == categoryId && stg.LayerId == layerId && stg.SurveyId != null)
                .Select(stg => stg.SurveyId)
                .ToList();
            var pageGroupVM = new PageGroupVM
            {
                Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == categoryId),
                Layer = _unitOfWork.Layer.GetFirstOrDefault(l => l.Id == layerId),
                SurveyGroup = _unitOfWork.SurveyGroup.GetFirstOrDefault(sg => sg.Id == id),
                SelectedSurveyIds = selectedSurveyIds,
                //Layer = selectedLayerIds.FirstOrDefault(),//初始化為列表第一個
                //LayerList = selectedLayerIds
            };
            return View(pageGroupVM);
        }

        /// <summary>
        /// 流程View
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public IActionResult Layer(int? id)
        {
            var pageGroupVM = new PageGroupVM
            {
                Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == id),
                LayerList = _unitOfWork.Layer.GetAll().ToList(),

            };
            //用session存確保到下個view
            //HttpContext.Session.SetInt32("CategoryId", id.Value);
            return View(pageGroupVM);
        }

        /// <summary>
        /// Notes類別View
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }


        #endregion




        /// <summary>將Layer加到關聯表中
        /// 
        /// </summary>
        /// <param name="id">傳入的LayerId</param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult AddSelectLayer(PageGroupVM pageGroupVM)
        {
            if (pageGroupVM.SelectedLayerId > 0 && pageGroupVM.Category.Id > 0)
            {
                var existData = _unitOfWork.SurveyToGroup
                    .GetFirstOrDefault(stg => stg.CategoryId == pageGroupVM.Category.Id &&
                    stg.LayerId == pageGroupVM.SelectedLayerId);

                if (existData == null)
                {
                    var surveyToDb = new SurveyToGroup
                    {
                        CategoryId = pageGroupVM.Category.Id,
                        LayerId = pageGroupVM.SelectedLayerId
                    };
                    _unitOfWork.SurveyToGroup.Add(surveyToDb);
                    _unitOfWork.Save();
                }
            }
            int categoryId = pageGroupVM.Category.Id;
            //pageGroupVM.Category = _unitOfWork.Category.GetFirstOrDefault(c => c.Id == id);
            pageGroupVM.LayerList = _unitOfWork.Layer.GetAll().ToList();
            return RedirectToAction("Layer", new { id = categoryId });
        }


        [HttpPost]
        [Route("customer/pagegroup/upsert/{categoryId}/{layerId}/{id}")]
        public IActionResult Upsert(PageGroupVM pageGroupVM, int? categoryId, int? layerId)
        {
            if (ModelState.IsValid)
            {
                pageGroupVM.Category = _unitOfWork.Category
                    .GetFirstOrDefault(c => c.Id == categoryId);
                pageGroupVM.Layer = _unitOfWork.Layer.GetFirstOrDefault(sg => sg.Id == layerId);
                _unitOfWork.SurveyGroup.Update(pageGroupVM.SurveyGroup);
                _unitOfWork.Save();
                getPageGroupVM(pageGroupVM);
                
            }
            return RedirectToAction("Page", new { categoryId = categoryId, layerId = layerId });
        }


        [HttpPost]
        //新增資料進去SurveyGroup
        public IActionResult AddGroup(PageGroupVM pageGroupVM)
        {
            if (!TryValidateModel(pageGroupVM.SurveyGroup))
            {
                var inputObj = new SurveyGroup
                {
                    Name = pageGroupVM.SurveyGroup.Name,
                    Order = pageGroupVM.SurveyGroup.Order,
                    Description = pageGroupVM.SurveyGroup.Description,
                };

                _unitOfWork.SurveyGroup.Add(inputObj);
                _unitOfWork.Save();
                var surveyGroupId = inputObj.Id;
                var surveyToGroup = new SurveyToGroup
                {
                    CategoryId = pageGroupVM.Category.Id,
                    LayerId = pageGroupVM.Layer.Id,
                    SurveyGroupId = surveyGroupId,
                };
                _unitOfWork.SurveyToGroup.Add(surveyToGroup);
                _unitOfWork.Save();
            }
            return RedirectToAction("Page",
                new { categoryid = pageGroupVM.Category.Id, layerId = pageGroupVM.Layer.Id });
        }


        //挑選出選中的問卷並更新DB關聯表
        public PageGroupVM getPageGroupVM(PageGroupVM pageGroupVM)
        {
            if (pageGroupVM.SelectedSurveyIds != null || pageGroupVM.SurveyGroup != null)
            {
                if (pageGroupVM.SelectedSurveyIds == null)
                {
                    pageGroupVM.SelectedSurveyIds = new List<int?>();
                }

                int countObj = pageGroupVM.SelectedSurveyIds.Count();


                List<int?> existGroup = _unitOfWork.SurveyToGroup
                    .GetAll(stg => stg.SurveyGroupId == pageGroupVM.SurveyGroup.Id && stg.SurveyId != null) 
                    .Select(stg => stg.SurveyId)
                    .ToList();
                //比對差異
                var idToAdd = pageGroupVM.SelectedSurveyIds.Except(existGroup).ToList();
                
                var idToRemove = existGroup.Except(pageGroupVM.SelectedSurveyIds).ToList();
                if (idToRemove.Any())
                {
                    foreach (var id in idToRemove)
                    {
                        var removeFromDb = _unitOfWork.SurveyToGroup
                            .GetFirstOrDefault(stg => stg.SurveyGroupId == pageGroupVM.SurveyGroup.Id
                            && stg.SurveyId == id);
                        if (removeFromDb != null)
                        {
                            _unitOfWork.SurveyToGroup.Remove(removeFromDb);
                        }
                    }
                }
                if (idToAdd.Any())
                {
                    foreach (var id in idToAdd)
                    {
                        _unitOfWork.SurveyToGroup.Add(
                            new SurveyToGroup
                            {
                                SurveyGroupId = pageGroupVM.SurveyGroup.Id,
                                SurveyId = id,
                                LayerId = pageGroupVM.Layer.Id,
                                CategoryId = pageGroupVM.Category.Id,
                            });
                        //countObj++;
                    }
                }
                pageGroupVM.SurveyGroup.Count = countObj;
                _unitOfWork.SurveyGroup.Update(pageGroupVM.SurveyGroup);
                _unitOfWork.Save();
                TempData["Success"] = "問卷選取成功！";
            }
            return pageGroupVM;
        }


        [HttpPost]
        public IActionResult AddLayer(PageGroupVM pageGroupVM)
        {
            if (pageGroupVM.Layer != null)
            {
                _unitOfWork.Layer.Add(pageGroupVM.Layer);
                _unitOfWork.Save();
                var surveyToDb = new SurveyToGroup
                {
                    CategoryId = pageGroupVM.Category.Id,
                    LayerId = pageGroupVM.Layer.Id
                };
                _unitOfWork.SurveyToGroup.Add(surveyToDb);
                _unitOfWork.Save();
                TempData["success"] = "新增類別成功！";
            }
            int categoryId = pageGroupVM.Category.Id;
            return RedirectToAction("Layer", new { id = categoryId });
        }


        [HttpPost]
        public IActionResult AutoAdd(int categoryId, int layerId, int dataTableCount)
        {
            var layer = _unitOfWork.Layer.GetById(layerId);
            string newSurveyGroupName = $"{layer.Name}第{dataTableCount + 1}頁";
            var newSG = new SurveyGroup
            {
                Name = newSurveyGroupName,
                Count = 0,
                Order = dataTableCount + 1,
                Description = ""
            };
            _unitOfWork.SurveyGroup.Add(newSG);
            _unitOfWork.Save();
            var surveyGorupId = newSG.Id;
            var surveyToGroup = new SurveyToGroup
            {
                CategoryId = categoryId,
                LayerId = layerId,
                SurveyGroupId = surveyGorupId,
            };
            _unitOfWork.SurveyToGroup.Add(surveyToGroup);
            _unitOfWork.Save();
            return Json(new
            {
                success = true,
                redirectUrl = Url.Action("Page", new { categoryid = categoryId, layerId = layerId })
            });
        }


        [HttpPost]
        public IActionResult NotesUpsert(PageGroupVM pageGroupVM, IFormFile? file)
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
                    if (!string.IsNullOrEmpty(pageGroupVM.Category.ImageUrl))
                    {
                        var oldImagePath =
                            Path.Combine(rootPath, pageGroupVM.Category.ImageUrl.TrimStart('\\'));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }
                    using (var filestream = new FileStream(Path.Combine(categoryPath, fileName), FileMode.Create)) 
                    { 
                        file.CopyTo(filestream);
                    }
                    pageGroupVM.Category.ImageUrl = @"\images\category\" + fileName;
                }
                _unitOfWork.Category.Update(pageGroupVM.Category);
                _unitOfWork.Save();
                TempData["success"] = "類別更新成功！";

            }
            return RedirectToAction("Index");
        }
        
        [HttpPost]
        public IActionResult AddCategory(Category category)
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

        
        #region API CALLS

        [HttpPost]
        public IActionResult TogglePublish(int id)
        {
            var notes = _unitOfWork.Category.Get(s => s.Id == id);
            if (notes == null)
            {
                return Json(new { success = false, message = "未找到類別" });
            }

            // 切換發佈狀態
            notes.IsPublished = !notes.IsPublished;

            // 如果發佈，更新完成時間；如果取消發佈，清空完成時間
            //notes.CompleteTime = notes.IsPublished ? DateTime.Now : null;

            _unitOfWork.Category.Update(notes); // 更新問卷狀態
            _unitOfWork.Save(); // 儲存更改
            return Json(new { success = true, message = "狀態已更新" });
        }


        /// <summary>
        /// js呼叫取得所有問卷
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetAll()
        {
            var surveyList = _unitOfWork.Survey.GetAll().Select(s => new
            {
                Id = s.Id,
                CategoryName = s.CategoryName,
                Title = s.Title,
                StationName = s.StationName,
                Description = s.Description,
                QuestionNum = s.QuestionNum,
                IsPublished = s.IsPublished,
                CreateTime = s.CreateTime,
                CompleteTime = s.CompleteTime,
                JobName = s.JobName
            }).ToList();
            return Json(new { data = surveyList });
        }


        /// <summary>
        /// js呼叫取得notes類別
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetCategoryList()
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


        /// <summary>
        /// js呼叫取得頁數
        /// </summary>
        /// <param name="categoryId"></param>
        /// <param name="layerId"></param>
        /// <returns></returns>

        [HttpGet]
        [Route("/Customer/PageGroup/GetSurveyGroupList/{categoryId}/{layerId}")]
        public IActionResult GetSurveyGroupList(int? categoryId, int? layerId)
        {
            var surveyGroupList = _unitOfWork.SurveyGroup
                .GetAll(sg => sg.SurveyToGroups.Any(stg => stg.CategoryId == categoryId && stg.LayerId == layerId))
                .Select(sg => new
                {
                    sg.Id,
                    sg.Name,
                    sg.Count,
                    sg.Order,
                    sg.Description,
                }).ToList();
            return Json(new { data = surveyGroupList });
        }
        


        /// <summary>
        /// js呼叫取得layer
        /// </summary>
        /// <param name="categoryId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("/Customer/PageGroup/GetLayerList/{categoryId}")]
        public IActionResult GetLayerList(int? categoryId)
        {
            var selectedLayers = _unitOfWork.Layer
                .GetAll(l => l.SurveyToGroups.Any(stg => stg.CategoryId == categoryId))
                .Select(l => new
                {
                    l.Id,
                    l.Name,
                    l.Order,
                    l.Description
                }).ToList();

            //var layerIds = _unitOfWork.SurveyToGroup
            //    .GetAll(stg =>  stg.CategoryId == id)
            //    .Select(stg => stg.LayerId)
            //    .ToList();
            //var selectedLayers = _unitOfWork.Layer
            //    .GetAll(l => layerIds.Contains(l.Id))
            //    .Select(l => new
            //    {
            //        Id = l.Id,
            //        Name = l.Name,
            //        Order = l.Order,
            //        Description = l.Description,
            //    }).ToList();
            //Console.WriteLine($"====================\n {Json( new { data = selectedLayers }) }\n ===========================");
            return Json(new { data = selectedLayers });
        }

        [HttpGet]
        public IActionResult GetTest(int? id)
        {
            
            var selectSurveyGroups = _unitOfWork.SurveyGroup
                .GetAll(sg => sg.SurveyToGroups.Any(stg => stg.LayerId == id))
                .Select(sg => new
                {
                    sg.Id,
                    sg.Name,
                    sg.Order,
                    sg.Description
                }).ToList();
            return Json(new { data = selectSurveyGroups });
        }



        [HttpDelete]
        [Route("customer/pagegroup/delete/{tableName}/{id}")]
        public IActionResult Delete(string tableName, int id)
        {
            switch (tableName) 
            {
                case "NtblData":
                    var notesToRemove = _unitOfWork.SurveyToGroup
                        .GetAll(stg => stg.CategoryId == id);
                    var categoryToRemove = _unitOfWork.Category
                        .GetFirstOrDefault(c => c.Id == id);
                    _unitOfWork.SurveyToGroup.RemoveRange(notesToRemove);
                    _unitOfWork.Category.Delete(categoryToRemove);
                    break;
                case "LtblData":
                    var layerToRemove = _unitOfWork.SurveyToGroup
                        .GetAll(stg => stg.LayerId == id);
                    _unitOfWork.SurveyToGroup.RemoveRange(layerToRemove);
                    break;
                case "GtblData":
                    var pageToRemove = _unitOfWork.SurveyToGroup
                        .GetAll(stg => stg.SurveyGroupId == id);
                    _unitOfWork.SurveyToGroup.RemoveRange(pageToRemove);
                    break;
                default:
                    return Json(new { success = false, message = "無效名稱" });
            }
            _unitOfWork.Save();
            return Json(new { success = true, message = "刪除成功" });
        } 


        #endregion
    };
}
