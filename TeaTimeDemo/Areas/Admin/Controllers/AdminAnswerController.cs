using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.Linq;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Hosting; // 用來處理圖片上傳
using System.IO; // 處理文件操作
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel; // 新增此命名空間以使用 IFormFile

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)] // 只有 Admin 和 Manager 角色能進入
    public class AdminAnswerController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminAnswerController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            var answers = _unitOfWork.Answer.GetAll(includeProperties: "Question,ApplicationUser,SelectedOptions.QuestionOption");
            return View(answers);
        }
    }
}
