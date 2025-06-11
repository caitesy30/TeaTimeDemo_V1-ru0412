// ==========================
// 檔名：WalletController.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：會員錢包首頁（餘額、異動紀錄查詢）
// ==========================

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Linq;
using System.Security.Claims;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class WalletController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public WalletController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ⭐【1. 錢包首頁支援 LIFF 流量，沒登入時也能預覽】⭐
        public IActionResult Index()
        {
            // 判斷是否 LIFF 來源
            var referer = Request.Headers["Referer"].ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();
            bool isLiff = referer.Contains("liff.line.me") || userAgent.Contains("Line");

            string userId = null;
            if (!User.Identity.IsAuthenticated)
            {
                if (isLiff)
                {
                    // LIFF 流量來時，允許訪客模式，userId 設 null
                    // 或：你可以顯示「請先LINE授權」提示
                    // 或：引導到 LINE Login 頁面（可擴充）
                    // 這裡預設訪客模式，userId=null，查不到個人資料
                }
                else
                {
                    // 原本沒登入自動導回登入頁
                    return RedirectToAction("Login", "Account");
                }
            }
            else
            {
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            }

            // 幣種/異動紀錄查詢
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();
            List<UserCurrencyLogVM> logs = new List<UserCurrencyLogVM>();
            List<WalletItemViewModel> items = new List<WalletItemViewModel>();

            if (!string.IsNullOrEmpty(userId))
            {
                // 有 userId 才查個人資料
                logs = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new UserCurrencyLogVM
                    {
                        CreatedAt = x.CreatedAt,
                        CurrencyTypeName = coins.FirstOrDefault(c => c.Id == x.CurrencyTypeId)?.Name ?? "",
                        Quantity = x.Quantity,
                        BalanceAfter = x.BalanceAfter,
                        Action = x.Action,
                        Memo = x.Memo
                    }).ToList();

                items = coins.Select(ct => new WalletItemViewModel
                {
                    Name = ct.Name,
                    Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                        .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                        .Sum(x => x.Quantity),
                    ExchangeRate = ct.ExchangeRate
                }).ToList();
            }
            else
            {
                // 訪客或 LIFF 頁面顯示 0，或直接顯示空白資料
                items = coins.Select(ct => new WalletItemViewModel
                {
                    Name = ct.Name,
                    Quantity = 0,
                    ExchangeRate = ct.ExchangeRate
                }).ToList();
            }

            var total = items.Sum(x => x.Quantity);
            var convertQty = items.Sum(x => x.Quantity * x.ExchangeRate);

            var vm = new WalletViewModel
            {
                Items = items,
                Logs = logs,
                TotalPoints = total,
                ConvertQuantity = convertQty
            };

            return View(vm);
        }


        // ============ 返還步驟一：顯示返還幣列表（圖二） ============
        public IActionResult ReturnList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();
            var items = coins.Select(ct => new ReturnCoinVM
            {
                CurrencyTypeId = ct.Id,
                Name = ct.Name,
                IconPath = ct.IconPath,
                Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                    .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                    .Sum(x => x.Quantity)
            }).Where(x => x.Quantity > 0).ToList();

            return View(items); // 傳到 ReturnList.cshtml
        }

        // ============ 返還步驟二：選擇某幣返還（圖三） ============
        [HttpGet]
        public IActionResult Return(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coin = _unitOfWork.CurrencyType.GetById(id);
            var quantity = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == id)
                .Sum(x => x.Quantity);
            var vm = new ReturnCoinVM
            {
                CurrencyTypeId = id,
                Name = coin.Name,
                IconPath = coin.IconPath,
                Quantity = quantity
            };
            return View(vm); // 傳到 Return.cshtml
        }

        // ============ 返還步驟三：送出返還 =============
        [HttpPost]
        public IActionResult Return(ReturnCoinVM model, int returnQty)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (returnQty <= 0) return View(model); // 不允許負數

            // 目前擁有數量
            var nowQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .Sum(x => x.Quantity);

            if (returnQty > nowQty)
            {
                ModelState.AddModelError("", "返還數量不可大於持有數量");
                model.Quantity = nowQty;
                return View(model);
            }

            // 1. 會員扣點（寫一筆負數log）
            var lastLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldBalance = lastLog?.BalanceAfter ?? nowQty;
            int newBalance = oldBalance - returnQty;

            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = -returnQty,
                Action = "會員返還",
                Memo = "返還點數給後台",
                CreatedAt = DateTime.Now,
                BalanceAfter = newBalance
            });

            // 2. 後台發行者帳戶加點（可以寫指定帳號，這裡簡單用"Admin"）
            var admin = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.UserName == "admin");
            if (admin != null)
            {
                var adminOld = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == admin.Id && x.CurrencyTypeId == model.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.BalanceAfter ?? 0;

                _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
                {
                    UserId = admin.Id,
                    CurrencyTypeId = model.CurrencyTypeId,
                    Quantity = returnQty,
                    Action = "會員返還入帳",
                    Memo = $"會員返還：{userId}",
                    CreatedAt = DateTime.Now,
                    BalanceAfter = adminOld + returnQty
                });
            }
            _unitOfWork.Save();

            //TempData["SUCCESS"] = "返還成功！";
            return RedirectToAction("ReturnList");
        }


        // ==================== 兌換功能專用 ====================

        // =========== 幣換善時點數 步驟一：選擇幣列表 ==============
        public IActionResult ExchangeList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // 只顯示「可換善時點數」的幣（ExchangeRate>1，且持有>0）
            var coins = _unitOfWork.CurrencyType.GetAll()
                .Where(ct => ct.ExchangeRate > 1)
                .ToList();
            var items = coins
                .Select(ct => new ReturnCoinVM
                {
                    CurrencyTypeId = ct.Id,
                    Name = ct.Name,
                    IconPath = ct.IconPath,
                    Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                                .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                                .Sum(x => x.Quantity)
                })
                .Where(x => x.Quantity > 0) // 只顯示有持有的幣
                .ToList();
            return View(items); // 對應 ExchangeList.cshtml
        }

        // =========== 幣換善時點數 步驟二：進入兌換頁 ============
        [HttpGet]
        public IActionResult Exchange(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coin = _unitOfWork.CurrencyType.GetById(id);
            if (coin == null || coin.ExchangeRate <= 1) return NotFound();

            // 幣數量
            int coinQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == coin.Id)
                .Sum(x => x.Quantity);

            // 善時點數名稱（ExchangeRate==1）
            var goodPoint = _unitOfWork.CurrencyType.GetAll().FirstOrDefault(x => x.ExchangeRate == 1);
            string goodPointName = goodPoint?.Name ?? "善時點數";

            ViewBag.ExchangeRate = coin.ExchangeRate;
            ViewBag.CoinQty = coinQty;
            ViewBag.CoinName = coin.Name;
            ViewBag.GoodPointName = goodPointName;

            var vm = new ReturnCoinVM
            {
                CurrencyTypeId = coin.Id,
                Name = coin.Name,
                IconPath = coin.IconPath,
                Quantity = coinQty
            };
            return View(vm); // 對應 Exchange.cshtml
        }

        // =========== 幣換善時點數 步驟三：兌換動作 ============
        [HttpPost]
        public IActionResult Exchange(ReturnCoinVM model, int exchangeQty)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 驗證幣種
            var coin = _unitOfWork.CurrencyType.GetById(model.CurrencyTypeId);
            if (coin == null || coin.ExchangeRate <= 1) return View(model);

            // 會員持有幣數量
            int coinQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == coin.Id)
                .Sum(x => x.Quantity);

            if (exchangeQty < 1 || exchangeQty > coinQty)
            {
                ModelState.AddModelError("", $"兌換數量必須介於 1 ~ {coinQty} 枚");
                ViewBag.ExchangeRate = coin.ExchangeRate;
                ViewBag.CoinQty = coinQty;
                ViewBag.CoinName = coin.Name;
                ViewBag.GoodPointName = "善時點數";
                return View(model);
            }

            // 找出善時點數幣種
            var goodPoint = _unitOfWork.CurrencyType.GetAll().FirstOrDefault(x => x.ExchangeRate == 1);
            if (goodPoint == null) return View(model);

            // 計算要加的善時點數
            int addGoodPoint = exchangeQty * coin.ExchangeRate;

            // === 1. 幣 扣除 ===
            var lastCoinLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == coin.Id)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldCoinBalance = lastCoinLog?.BalanceAfter ?? coinQty;
            int newCoinBalance = oldCoinBalance - exchangeQty;
            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = coin.Id,
                Quantity = -exchangeQty,
                Action = "幣換善時點數",
                Memo = $"兌換 {addGoodPoint} 點善時點數",
                CreatedAt = DateTime.Now,
                BalanceAfter = newCoinBalance
            });

            // === 2. 善時點數 增加 ===
            int goodPointQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == goodPoint.Id)
                .Sum(x => x.Quantity);
            var lastGPLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == goodPoint.Id)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldGPBalance = lastGPLog?.BalanceAfter ?? goodPointQty;
            int newGPBalance = oldGPBalance + addGoodPoint;

            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = goodPoint.Id,
                Quantity = addGoodPoint,
                Action = "幣換善時點數",
                Memo = $"由{coin.Name}兌換",
                CreatedAt = DateTime.Now,
                BalanceAfter = newGPBalance
            });

            _unitOfWork.Save();
            // 成功返回錢包
            return RedirectToAction("Index");
        }

        // 請將下列方法加到 WalletController 裡面，已全繁體中文註解                

        // ========== 轉讓步驟一：選擇可轉讓幣種（圖二） ==========
        public IActionResult TransferList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coins = _unitOfWork.CurrencyType.GetAll().ToList();
            var items = coins.Select(ct => new TransferCoinVM
            {
                CurrencyTypeId = ct.Id,
                Name = ct.Name,
                IconPath = ct.IconPath,
                Quantity = _unitOfWork.UserCurrencyLog.GetAll()
                    .Where(x => x.UserId == userId && x.CurrencyTypeId == ct.Id)
                    .Sum(x => x.Quantity)
            }).Where(x => x.Quantity > 0).ToList();

            return View(items); // 對應 TransferList.cshtml
        }

        // ========== 轉讓步驟二：輸入會員 or 選LINE好友＋數量 ==========
        [HttpGet]
        public IActionResult Transfer(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var coin = _unitOfWork.CurrencyType.GetById(id);
            var quantity = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == id)
                .Sum(x => x.Quantity);

            // 取得所有會員（排除自己）
            var members = _unitOfWork.ApplicationUser.GetAll()
                .Where(u => u.Id != userId)
                .Select(u => new Microsoft.AspNetCore.Mvc.Rendering.SelectListItem
                {
                    Value = u.Id,
                    Text = u.Name
                }).ToList();

            // --- 模擬LINE好友資料 ---
            var lineFriends = new List<SelectListItem>
    {
        new SelectListItem { Value = "U001", Text = "小美（LINE）" },
        new SelectListItem { Value = "U002", Text = "阿偉（LINE）" },
        new SelectListItem { Value = "U003", Text = "老王（LINE）" }
    };

            ViewBag.MemberList = members;
            ViewBag.LineFriendList = lineFriends;

            var vm = new TransferCoinVM
            {
                CurrencyTypeId = id,
                Name = coin.Name,
                IconPath = coin.IconPath,
                Quantity = quantity
            };
            return View(vm); // 對應 Transfer.cshtml
        }

    
        // ========== 轉讓步驟三：送出處理 ==========
        [HttpPost]
        public IActionResult Transfer(TransferCoinVM model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (model.TransferQty <= 0)
                return View(model);

            bool isLineFriend = !string.IsNullOrEmpty(model.TargetLineFriendId);
            bool isMember = !string.IsNullOrEmpty(model.TargetUserId);

            // 檢查餘額
            var nowQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .Sum(x => x.Quantity);

            if (model.TransferQty > nowQty)
            {
                ModelState.AddModelError("", "轉讓數量不可大於持有數量");
                model.Quantity = nowQty;
                // ...帶會員清單
                return View(model);
            }

            // 1. 扣自己的點
            var lastLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldBalance = lastLog?.BalanceAfter ?? nowQty;
            int newBalance = oldBalance - model.TransferQty;

            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = -model.TransferQty,
                Action = isLineFriend ? "LINE好友預約轉讓" : "會員轉讓",
                Memo = isLineFriend ? $"轉給LINE好友：{model.TargetLineFriendName}" : $"轉讓給會員：{model.TargetUserId}",
                CreatedAt = DateTime.Now,
                BalanceAfter = newBalance
            });

            // 2. 收方處理
            string resultMsg = "";
            if (isMember)
            {
                // 對方會員即時入帳
                var otherOld = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == model.TargetUserId && x.CurrencyTypeId == model.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.BalanceAfter ?? 0;

                _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
                {
                    UserId = model.TargetUserId,
                    CurrencyTypeId = model.CurrencyTypeId,
                    Quantity = model.TransferQty,
                    Action = "會員轉讓入帳",
                    Memo = $"來自：{userId}",
                    CreatedAt = DateTime.Now,
                    BalanceAfter = otherOld + model.TransferQty
                });
                resultMsg = "轉讓給會員成功！";
            }
            else if (isLineFriend)
            {
                // 假設用 InvitePending（略），這裡直接顯示訊息
                resultMsg = $"已預約轉讓給 LINE 好友「{model.TargetLineFriendName}」！";
            }

            _unitOfWork.Save();

            // --- 重點：顯示轉讓成功頁（帶訊息） ---
            return RedirectToAction("TransferResult", new { msg = resultMsg });
        }

        // ========== 轉讓步驟四：顯示成功畫面 ==========
        public IActionResult TransferResult(string msg)
        {
            ViewBag.Message = msg;
            return View();
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public IActionResult TransferToLine(TransferCoinVM model)
        {

      


            // 檢查餘額、數量等
            string token = Guid.NewGuid().ToString("N");
            var invite = new PendingInvite
            {
                FromUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = model.TransferQty,
                Note = model.Note,
                Token = token,
                CreatedAt = DateTime.Now,
                IsClaimed = false
            };
            _unitOfWork.PendingInvite.Add(invite);
            _unitOfWork.Save();
            return Json(new { success = true, token });
        }

        // ========== 支援訪客模式的 Claim 頁 ==========
        [HttpGet]
        public IActionResult Claim(string token)
        {
            // 只用 token 查資料，不檢查登入狀態
            var invite = _unitOfWork.PendingInvite.GetFirstOrDefault(x => x.Token == token && !x.IsClaimed);
            if (invite == null)
                return Content("此邀請已領取或不存在");

            ViewBag.IsUserLoggedIn = User.Identity.IsAuthenticated; // 可顯示登入提示
            return View(invite); // 不論登入與否皆可顯示
        }


        [HttpPost]
        public IActionResult Claim(string token, string lineUserId)
        {
            var invite = _unitOfWork.PendingInvite.GetFirstOrDefault(x => x.Token == token && !x.IsClaimed);
            if (invite == null) return Content("此邀請已領取或不存在");
            if (string.IsNullOrEmpty(lineUserId)) return Content("未取得 LINE 用戶，請於 LINE App 中點選連結。");

            invite.IsClaimed = true;
            invite.ToLineUserId = lineUserId;
            _unitOfWork.Save();
            return Content("領取成功！點數已入帳。");
        }




    }
}
