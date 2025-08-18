// AnswerController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System.Web;
using HtmlAgilityPack;


namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")] // 指定區域為 Customer
    [Authorize] // 確保只有登入的使用者能夠存取
    public class StoreController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public StoreController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
          
        [HttpGet]
        public IActionResult Blueprint()
        {
            return View(); // 對應 Blueprint.cshtml
        }

 
        [HttpGet("{id:int}")] public IActionResult Detail(int id) { ViewData["ProductId"] = id; return View(); }
     

        // ★ 新增：第二版（分頁）
        [HttpGet]
        public IActionResult BlueprintV2() => View();

        // 新增：/Customer/Store/Index  → 商城首頁（JS 渲染）
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

    }


}





