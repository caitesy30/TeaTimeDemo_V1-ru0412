using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using Microsoft.AspNetCore.Localization;
using Microsoft.Data.SqlClient;
using System.Resources;
using Microsoft.Extensions.Localization;
using DocumentFormat.OpenXml.Math;





namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class HomeController : LangBase
    {
        private readonly ILogger<HomeController> _logger;

        private readonly IUnitOfWork _unitOfWork;
        public HomeController(ILogger<HomeController> logger,IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }


        /// <summary>
        /// �����y��Action
        /// </summary>
        /// <param name="culture"></param>
        /// <returns></returns>
        //public IActionResult SetLanguage(string lang)
        //{
        //    HttpContext.Session.SetString("Lang", lang);
        //    return RedirectToAction("Index");
        //}


        public ActionResult UpdateLang()
        {
            // ���o���|
            //string twPath = Path.Combine(_env.ContentRootPath, "Resources", "Language.resx");
            //string usPath = Path.Combine(_env.ContentRootPath, "Resources", "Language.en-US.resx");

            //�p�G�S�����|�Ы�
            //Directory.CreateDirectory(Path.GetDirectoryName(twPath));
            //Directory.CreateDirectory(Path.GetDirectoryName(usPath));

            //using (var resxWriterTW = new ResXResourceWriter(twPath))
            //using (var resxWriterUS = new ResXResourceWriter(usPath))
            //{
            //        var list = _unitOfWork.Language.GetAll().ToList(); 
            //        foreach (var item in list)
            //        {
            //            resxWriterTW.AddResource(item.Lang_Key, item.Lang_zhTW);
            //            resxWriterUS.AddResource(item.Lang_Key, item.Lang_enUS);
            //        }

            //}

            // �ɦ^����
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Index()
        {
            IEnumerable<Category> notesList =
                _unitOfWork.Category.GetAll(c => c.IsPublished == true);
            return View(notesList);
        }

        public IActionResult Details(int productId)
        {
            ShoppingCart cart = new()
            {
                Product = _unitOfWork.Product.Get(u => u.Id == productId, includeProperties: "Category"),
                Count = 1,
                ProductId = productId
            };

         

            return View(cart);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        [Authorize] //��������
        public IActionResult Details(ShoppingCart shoppingCart)
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var UserId =
                claimsIdentity.FindFirst(ClaimTypes.NameIdentifier).Value;
            shoppingCart.ApplicationUserId = UserId;

            ShoppingCart cartFromDb = _unitOfWork.ShoppingCart.Get(u => u.ApplicationUser.Id == UserId && u.ProductId ==
                shoppingCart.ProductId && u.Ice == shoppingCart.Ice && u.Sweetness == shoppingCart.Sweetness);

            if (cartFromDb != null)
            {
                //�ʪ����w�إ�
                cartFromDb.Count += shoppingCart.Count;
                _unitOfWork.ShoppingCart.Update(cartFromDb);
            }
            else
            {
                //�s�W�ʪ���
                _unitOfWork.ShoppingCart.Add(shoppingCart);
            }
           
            TempData["success"] = "�[�J�ʪ������\�I";
            _unitOfWork.Save();

            return RedirectToAction(nameof(Index));

        }

    }
}
