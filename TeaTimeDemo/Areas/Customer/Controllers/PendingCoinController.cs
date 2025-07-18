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

        // 明細頁
        public IActionResult Details(int id)
        {
            var item = _unitOfWork.PendingCoin.GetById(id);
            if (item == null) return NotFound();
            return View(item);
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

        // 編輯頁
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var item = _unitOfWork.PendingCoin.GetById(id);
            if (item == null) return NotFound();
            return View(item);
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(PendingCoin model)
        {
            if (ModelState.IsValid)
            {
                var dbItem = _unitOfWork.PendingCoin.GetById(model.Id);
                if (dbItem == null) return NotFound();
                dbItem.LineUserId = model.LineUserId;
                dbItem.CurrencyTypeId = model.CurrencyTypeId;
                dbItem.Quantity = model.Quantity;
                dbItem.FromUserId = model.FromUserId;
                dbItem.Memo = model.Memo;
                dbItem.IsClaimed = model.IsClaimed;
                dbItem.CreatedAt = model.CreatedAt;
                dbItem.ClaimedAt = model.ClaimedAt;
                _unitOfWork.PendingCoin.Update(dbItem);
                _unitOfWork.Save();
                return RedirectToAction("Index");
            }
            return View(model);
        }

        // 刪除
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var item = _unitOfWork.PendingCoin.GetById(id);
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
