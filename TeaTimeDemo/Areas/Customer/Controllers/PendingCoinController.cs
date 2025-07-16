using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class PendingCoinController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public PendingCoinController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // 待領幣清單（管理用）
        public IActionResult Index()
        {
            var list = _unitOfWork.PendingCoin.GetAll()
                .OrderByDescending(x => x.CreatedAt)
                .ToList();
            return View(list);
        }

        // 新增一筆待領幣（管理/測試用）
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Create(PendingCoin model)
        {
            model.CreatedAt = DateTime.Now;
            model.IsClaimed = false;
            _unitOfWork.PendingCoin.Add(model);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        // 編輯
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var item = _unitOfWork.PendingCoin.GetFirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound();
            return View(item);
        }
        [HttpPost]
        public IActionResult Edit(PendingCoin model)
        {
            var item = _unitOfWork.PendingCoin.GetFirstOrDefault(x => x.Id == model.Id);
            if (item == null) return NotFound();
            item.Quantity = model.Quantity;
            item.CurrencyTypeId = model.CurrencyTypeId;
            item.LineUserId = model.LineUserId;
            item.Memo = model.Memo;
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        // 刪除
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var item = _unitOfWork.PendingCoin.GetFirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound();
            _unitOfWork.PendingCoin.Remove(item);
            _unitOfWork.Save();
            return RedirectToAction("Index");
        }

        // 查某人待領幣（測試/查詢用）
        public IActionResult UserPendings(string lineUserId)
        {
            var list = _unitOfWork.PendingCoin.GetAll(x => x.LineUserId == lineUserId && !x.IsClaimed)
                .OrderBy(x => x.CreatedAt).ToList();
            return View("Index", list); // 直接用Index的View
        }
    }
}
