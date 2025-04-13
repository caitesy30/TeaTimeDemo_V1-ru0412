using System.Collections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.DataAccess.Data;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using TeaTimeDemo.Utility;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    public class ProductController : Controller
    {

        private readonly IUnitOfWork _unitOfWork;

        private readonly IWebHostEnvironment _webHostEnvironment;
        public ProductController(IUnitOfWork unitOfWork,IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }



        public IActionResult Index()
        {
            List<Product> objProductList = _unitOfWork.Product.GetAll(includeProperties:"Category").ToList();
            return View(objProductList);
        }

        public IActionResult Upsert(int? id)
        {
            ProductVM productVM = new()
            {
                CategoryList = _unitOfWork.Category.GetAll().Select(u =>
                    new SelectListItem
                    {
                        Text = u.Name,
                        Value = u.Id.ToString()
                    }),
                Product = new Product()
            };

            if (id == null || id == 0)
            {
                return View(productVM);
            }
            else
            {
                productVM.Product = _unitOfWork.Product.Get(u => u.Id == id);
                return View(productVM);
            }
           
        }


            [HttpPost] //當使用者提交表單時，[HttpPost] 方法會被觸發。
            public IActionResult Upsert(ProductVM productVM,IFormFile?file)
            {
                
                if (ModelState.IsValid)
                {
                    // 獲取 wwwroot 文件夾路徑
                    string wwwRootPath = _webHostEnvironment.WebRootPath;

                    if (file != null)
                    {
                    //Guid.NewGuid() 用於生成一個全新的全球唯一標識符 (GUID)。Guid 是一個 128 位的數字，通常用來標識一個唯一的物件。通過 ToString() 方法，可以將這個 Guid 轉換為字串格式，例如 "3f7e72e4-3dcb-4a8a-b735-94aef8fcba58"。
                    //Path.GetExtension(string path) 是一個來自 System.IO 命名空間的方法，用於獲取文件的副檔名。
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    //這個相對路徑會與 wwwRootPath 結合，生成一個指向 wwwroot/images/product 的完整路徑。
                    string productPath = Path.Combine(wwwRootPath, @"images\product");

                    // 確保目錄存在，不存在則創建
                    if (!Directory.Exists(productPath))
                    {
                        Directory.CreateDirectory(productPath);
                    }

                    if (!string.IsNullOrEmpty(productVM.Product.ImageUrl))
                    {
                        //有新圖片上傳，刪除舊圖片
                        var oldImagePath = Path.Combine(wwwRootPath, productVM.Product.ImageUrl.TrimStart('\\'));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }

                    using (var fileStream= new FileStream(Path.Combine(productPath,fileName),FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }
                    //這行代碼將文件的相對 URL 路徑保存到 ImageUrl 屬性中。
                    productVM.Product.ImageUrl = @"\images\product\" + fileName;
                    }

                    if (productVM.Product.Id == 0)
                    {
                        _unitOfWork.Product.Add(productVM.Product);
                    }
                    else
                    {
                        _unitOfWork.Product.Update(productVM.Product);
                    }
                    
                    _unitOfWork.Save();
                    TempData["success"] = "產品新增成功!";
                    return RedirectToAction("Index");
                }
                else
                {
                    productVM.CategoryList =
                        _unitOfWork.Category.GetAll().Select(u => new SelectListItem
                        {
                            Text = u.Name,
                            Value = u.Id.ToString()
                        });
                    return View(productVM);
                }

            }


        #region API CALLS

        [HttpGet]
        public IActionResult GetAll()
        {
            List<Product> objProductList=
            _unitOfWork.Product.GetAll(includeProperties:"Category").ToList();
            return Json(new{data=objProductList});
        }

        [HttpDelete]
        public IActionResult Delete(int? id)
        {
            var productToBeDeleted = _unitOfWork.Product.Get(u => u.Id == id);
            if (productToBeDeleted == null)
            {
                return Json(new { success = false, message = "刪除失敗" });
            }
            //檢查 ImageUrl 是否為 null 或空白
            if (!string.IsNullOrEmpty(productToBeDeleted.ImageUrl))
            {
                var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, productToBeDeleted.ImageUrl.TrimStart('\\'));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            _unitOfWork.Product.Remove(productToBeDeleted);
            _unitOfWork.Save();
            return Json(new { success = true, message = "刪除成功" });
        }

        #endregion

    
    }


}
