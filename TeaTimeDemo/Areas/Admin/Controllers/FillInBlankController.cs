using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.DTOs;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System;
using System.Collections.Generic;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    /// <summary>
    /// FillInBlank 管理控制器，負責處理 CRUD 操作及回收筒功能
    /// </summary>
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    [Route("admin/[controller]/[action]/{id?}")]
    public class FillInBlankController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        /// <summary>
        /// 建構子，注入 IUnitOfWork 和 IMapper
        /// </summary>
        /// <param name="unitOfWork">單元工作介面</param>
        /// <param name="mapper">AutoMapper 介面</param>
        public FillInBlankController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// 顯示填空題列表
        /// </summary>
        /// <returns>Index 視圖</returns>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 取得所有填空題的資料，供 DataTables 使用
        /// </summary>
        /// <returns>JSON 格式的填空題資料</returns>
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var fillInBlanks = _unitOfWork.FillInBlank.GetAll(
                    filter: f => !f.IsDeleted, // 只包含未刪除的填空題
                    includeProperties: "QuestionOption.Question.Survey"
                );

                var fillInBlankDTOs = _mapper.Map<List<FillInBlankDTO>>(fillInBlanks);

                return Json(new { data = fillInBlankDTOs });
            }
            catch (Exception ex)
            {
                // 可在此處記錄 ex.Message 以便除錯
                TempData["ERROR"] = "獲取填空題時發生錯誤。";
                return Json(new { data = new List<FillInBlankDTO>() });
            }
        }

        /// <summary>
        /// 顯示新增填空題的表單
        /// </summary>
        /// <returns>Create 視圖</returns>
        public IActionResult Create()
        {
            var fillInBlankVM = new FillInBlankVM
            {
                // 初始化需要的屬性（如果有）
            };
            ViewData["Action"] = "Create";
            ViewData["Title"] = "新增填空題";
            return View(fillInBlankVM);
        }

        /// <summary>
        /// 處理新增填空題的表單提交
        /// </summary>
        /// <param name="fillInBlankVM">填空題 ViewModel</param>
        /// <returns>重新導向至 Index 或重新顯示表單</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(FillInBlankVM fillInBlankVM)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var fillInBlank = _mapper.Map<FillInBlank>(fillInBlankVM);
                    fillInBlank.CreateTime = DateTime.Now;
                    fillInBlank.CompleteTime = DateTime.Now;

                    _unitOfWork.FillInBlank.Add(fillInBlank);
                    _unitOfWork.Save();

                    TempData["success"] = "填空題新增成功！";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    TempData["ERROR"] = "新增填空題時發生錯誤。";
                    return RedirectToAction(nameof(Create));
                }
            }
            return View(fillInBlankVM);
        }

        /// <summary>
        /// 顯示編輯填空題的表單
        /// </summary>
        /// <param name="id">填空題 ID</param>
        /// <returns>Edit 視圖或重新導向至 Index</returns>
        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                TempData["ERROR"] = "未指定要編輯的填空題。";
                return RedirectToAction(nameof(Index));
            }

            var fillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == id);
            if (fillInBlank == null)
            {
                TempData["ERROR"] = "找不到指定的填空題。";
                return RedirectToAction(nameof(Index));
            }

            var fillInBlankVM = _mapper.Map<FillInBlankVM>(fillInBlank);
            ViewData["Action"] = "Edit";
            ViewData["Title"] = "編輯填空題";
            return View(fillInBlankVM);
        }

        /// <summary>
        /// 處理編輯填空題的表單提交
        /// </summary>
        /// <param name="id">填空題 ID</param>
        /// <param name="fillInBlankVM">填空題 ViewModel</param>
        /// <returns>重新導向至 Index 或重新顯示表單</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, FillInBlankVM fillInBlankVM)
        {
            if (id != fillInBlankVM.Id)
            {
                TempData["ERROR"] = "編輯的填空題 ID 不匹配。";
                return RedirectToAction(nameof(Index));
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var fillInBlank = _mapper.Map<FillInBlank>(fillInBlankVM);
                    _unitOfWork.FillInBlank.Update(fillInBlank);
                    _unitOfWork.Save();

                    TempData["success"] = "填空題編輯成功！";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    TempData["ERROR"] = "編輯填空題時發生錯誤。";
                    return RedirectToAction(nameof(Edit), new { id = id });
                }
            }
            return View(fillInBlankVM);
        }

        /// <summary>
        /// 處理刪除填空題的 AJAX 請求
        /// </summary>
        /// <param name="id">填空題 ID</param>
        /// <returns>JSON 回應，指示成功或失敗</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int? id)
        {
            if (id == null)
            {
                return Json(new { success = false, message = "未指定要刪除的填空題。" });
            }

            var fillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(f => f.Id == id && !f.IsDeleted);
            if (fillInBlank == null)
            {
                return Json(new { success = false, message = "找不到指定的填空題。" });
            }

            try
            {
                _unitOfWork.FillInBlank.SoftDelete(fillInBlank);
                _unitOfWork.Save();
                return Json(new { success = true, message = "填空題已移至回收筒！" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"刪除時發生錯誤：{ex.Message}" });
            }
        }

        /// <summary>
        /// 顯示回收筒中的填空題列表
        /// </summary>
        /// <returns>RecycleBin 視圖</returns>
        public IActionResult RecycleBin()
        {
            try
            {
                var deletedFillInBlanks = _unitOfWork.FillInBlank.GetAll(
                    filter: f => f.IsDeleted,
                    ignoreQueryFilters: true
                );

                var fillInBlankDTOs = _mapper.Map<IEnumerable<FillInBlankDTO>>(deletedFillInBlanks);
                return View(fillInBlankDTOs);
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "獲取回收筒中的填空題時發生錯誤。";
                return RedirectToAction(nameof(Index));
            }
        }

        /// <summary>
        /// 處理還原填空題的表單提交
        /// </summary>
        /// <param name="id">填空題 ID</param>
        /// <returns>重新導向至 RecycleBin 或顯示錯誤訊息</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Restore(int id)
        {
            try
            {
                var fillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                    f => f.Id == id && f.IsDeleted,
                    ignoreQueryFilters: true
                );
                if (fillInBlank == null)
                {
                    TempData["ERROR"] = "找不到指定的填空題。";
                    return RedirectToAction(nameof(RecycleBin));
                }

                _unitOfWork.FillInBlank.Restore(fillInBlank);
                _unitOfWork.Save();
                TempData["success"] = "填空題已成功還原！";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "還原填空題時發生錯誤。";
                return RedirectToAction(nameof(RecycleBin));
            }
        }

        /// <summary>
        /// 處理永久刪除填空題的表單提交
        /// </summary>
        /// <param name="id">填空題 ID</param>
        /// <returns>重新導向至 RecycleBin 或顯示錯誤訊息</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult PermanentDelete(int id)
        {
            try
            {
                var fillInBlank = _unitOfWork.FillInBlank.GetFirstOrDefault(
                    f => f.Id == id && f.IsDeleted,
                    ignoreQueryFilters: true
                );
                if (fillInBlank == null)
                {
                    TempData["ERROR"] = "找不到指定的填空題。";
                    return RedirectToAction(nameof(RecycleBin));
                }

                _unitOfWork.FillInBlank.RemovePhysical(fillInBlank);
                _unitOfWork.Save();

                TempData["success"] = "填空題已永久刪除！";
                return RedirectToAction(nameof(RecycleBin));
            }
            catch (Exception ex)
            {
                TempData["ERROR"] = "永久刪除填空題時發生錯誤。";
                return RedirectToAction(nameof(RecycleBin));
            }
        }
    }
}
