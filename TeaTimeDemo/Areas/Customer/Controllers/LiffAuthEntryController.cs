// ==========================
// 檔名：LiffAuthEntryController.cs
// 目的：專門負責 LIFF 登入自動跳轉（乾淨）
// ==========================
using Microsoft.AspNetCore.Mvc;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class LiffAuthEntryController : Controller
    {
        // LIFF專用登入入口
        public IActionResult Index(string redirect = null)
        {
            if (User.Identity.IsAuthenticated)
            {
                return Redirect(redirect ?? "/Customer/Wallet");
            }
            ViewBag.Redirect = redirect ?? "/Customer/Wallet";
            return View();
        }

    }
}
