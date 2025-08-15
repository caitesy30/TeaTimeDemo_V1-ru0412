// ==========================
// 檔名：WalletController.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：會員錢包首頁（餘額、異動紀錄查詢）
// ==========================

using AspNet.Security.OAuth.Line;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http; // 確保有引入命名空間
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Services;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    [Route("Customer/[controller]/[action]")]
    public class WalletController : Controller
    {
        private readonly RedemptionIntentService _intentSvc;
        private readonly ApplicationDbContext _db;
        private readonly IUnitOfWork _unitOfWork;
        public WalletController(IUnitOfWork unitOfWork, RedemptionIntentService intentSvc, ApplicationDbContext db)
        {
            _intentSvc = intentSvc;
            _db = db;
            _unitOfWork = unitOfWork;
        }

        /// 分享入口：/Customer/Wallet/Start?mode=gift&token=abc123
        /// 建 rid → 302 到 LiffAuthEntry/Login?returnUrl=/Customer/Wallet/LiffReturn?rid={rid}
        [HttpGet]
        public async Task<IActionResult> Start(string mode, string token, string? liffId, [FromServices] IConfiguration cfg)
        {
            // 依 LIFF ID 找對應的 ChannelId（appsettings.json 的對照表）
            var channelId = string.IsNullOrWhiteSpace(liffId)
                ? null
                : cfg[$"Line:LiffToChannel:{liffId}"];

            var rid = await _intentSvc.CreateAsync(mode, token, liffId, channelId);
            var returnUrl = $"/Customer/Wallet/LiffReturn?rid={rid}";
            return Redirect($"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(returnUrl)}");
        }

        /// LINE Login 回來：以 rid 單次核銷，加幣後顯示成功頁
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> LiffReturn(
          Guid rid,
          [FromServices] WalletCreditService credit,
          [FromServices] ChannelUserLinkService linkSvc)
           {
            // 1) 取得 LINE userId（身分供映射用）
            var lineUserId = User.FindFirst("urn:line:userid")?.Value ?? string.Empty;

            // 2) 取得全域會員 Id（Identity 內部主鍵）
            var globalUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(globalUserId))
                return Redirect($"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString($"/Customer/Wallet/LiffReturn?rid={rid}")}");

            // 3) 取出意圖，並綁定 (ChannelId, LineUserId) → GlobalUserId
            var consumed = await _intentSvc.ConsumeAsync(rid, lineUserId);
            if (consumed == null) return View("LiffReturnInvalid");

            if (!string.IsNullOrWhiteSpace(consumed.SourceChannelId) && !string.IsNullOrWhiteSpace(lineUserId))
            {
                await linkSvc.BindAsync(consumed.SourceChannelId, lineUserId, globalUserId);
            }

            // 4) 用全域會員入帳（錢包一律記 ApplicationUser.Id）
            if (string.Equals(consumed.Mode, "gift", StringComparison.OrdinalIgnoreCase))
            {
                var result = await credit.AddCoinByTokenAsync(consumed.Token, globalUserId, rid, claimedLineUserId: lineUserId);
                if (result.Result == WalletCreditService.ClaimResult.Success) return View("LiffReturnSuccess");
                if (result.Result is WalletCreditService.ClaimResult.Already or WalletCreditService.ClaimResult.NotFoundOrExpired)
                    return View("LiffReturnInvalid");
                if (result.Result == WalletCreditService.ClaimResult.NotYourInvite)
                {
                    var pc = _unitOfWork.PendingCoin.GetFirstOrDefault(x => x.Token == consumed.Token);
                    ViewBag.NickName = pc?.NickName; ViewBag.Token = pc?.Token; ViewBag.PendingCoinId = pc?.Id;
                    return View("ClaimConfirm", pc);
                }
                return View("LiffReturnInvalid");
            }

            return View("LiffReturnSuccess");
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
                var mode = Request.Query["mode"].ToString();
                var token = Request.Query["token"].ToString();

                if (!string.IsNullOrEmpty(token))
                {
                    // 可以將 token 存入 ViewBag 或 TempData，在 View 顯示提示
                    ViewBag.LiffToken = token;
                    ViewBag.LiffMode = mode;
                }

                //if (!isLiff)
                //{
                //    return RedirectToAction("Login", "Account");
                //}

                if (!User.Identity.IsAuthenticated)
                {
                    var returnUrl = Url.Action(nameof(Index), "Wallet", new { area = "Customer" })!;
                    return Redirect($"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(returnUrl)}");
                }

            }

            else
            {
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // ★★ 自動補發所有待領幣（用 LINE userId 而不是全域會員 Id）★★
                var lineUserIdForAutoClaim = User.FindFirst("urn:line:userid")?.Value;
                if (!string.IsNullOrEmpty(lineUserIdForAutoClaim))
                {
                    ClaimPendingCoinsIfAny(lineUserIdForAutoClaim);
                }
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

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public IActionResult AutoClaimPendingByLine()
        {
            var lineUserId = User.FindFirst("urn:line:userid")?.Value;
            if (string.IsNullOrEmpty(lineUserId))
                return Json(new { claimedCount = 0 });

            // ✅ 現在方法會回傳 int
            var claimed = ClaimPendingCoinsIfAny(lineUserId);
            return Json(new { claimedCount = claimed });
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
            if (userId == null)
            {
                // 正確：明確呼叫 Login 動作，並帶回跳網址
                var returnUrl = Url.Action(nameof(TransferList), "Wallet", new { area = "Customer" })!;
                return Redirect($"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(returnUrl)}");
            }

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

            return View(items);
        }


        // ========== 轉讓步驟二：輸入會員 or 選LINE好友＋數量 ==========
        [HttpGet]
        public IActionResult Transfer(int id, int? qty)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                var returnUrl = Url.Action(nameof(Transfer), "Wallet", new { area = "Customer", id, qty })!;
                return Redirect($"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(returnUrl)}");
            }
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
                Quantity = quantity,
                TransferQty = qty ?? 1 // <<==這一行：如果有 qty，預設填到 ViewModel
            };
            return View(vm); // 對應 Transfer.cshtml
        }



        // ========== 轉讓步驟三：送出處理 ==========
        [HttpPost]
        public IActionResult Transfer(TransferCoinVM model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null) return Unauthorized();
            if (model.TransferQty <= 0)
                return View(model);

            bool isLineFriend = !string.IsNullOrEmpty(model.TargetLineFriendId);
            bool isMember = !string.IsNullOrEmpty(model.TargetUserId);

            // 🚧【C 方案守門】這支只允許「會員即時入帳」；LINE 好友一律走 AJAX 的 TransferToLine
            if (!isMember && !isLineFriend)
            {
                ModelState.AddModelError("", "請選擇收方（會員或 LINE 好友分享）");
                // 回填你原本的下拉清單資料…
                return View(model);
            }
            if (isLineFriend)
            {
                // 不接受 LINE 好友從這支進來，避免「扣了但沒建 Pending」
                return BadRequest("請使用 LINE 分享按鈕產生邀請。");
            }

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


        // Transfer 給 LINE 好友時：預扣一筆，並建立 PendingCoin 等對方領取
        [HttpPost]
        [Authorize]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> TransferToLine(TransferCoinVM model, [FromServices] ApplicationDbContext db)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            // 1) 檢查餘額（用最後一筆 BalanceAfter 或加總）
            var nowQty = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId).Sum(x => x.Quantity);
            if (model.TransferQty > nowQty) return Json(new { success = false, message = "持有數量不足，無法轉讓" });

            // 2) 先建立 Pending（LineUserId 可為 null →「未指定收方」）
            var token = Guid.NewGuid().ToString("N");
            var pending = new PendingCoin
            {
                Token = token,
                NickName = model.TargetLineFriendName ?? "",
                FromUserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = model.TransferQty,
                LineUserId = string.IsNullOrWhiteSpace(model.TargetLineFriendId) ? null : model.TargetLineFriendId,
                Memo = string.IsNullOrWhiteSpace(model.Note) ? "預約轉讓" : model.Note,
                IsClaimed = false,
                Status = 0,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
            _unitOfWork.PendingCoin.Add(pending);
            await _unitOfWork.SaveAsync(); // 取得 pending.Id

            // 3) 預扣（冪等鍵 prededuct:{pending.Id}）
            var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                          .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            var oldBal = last?.BalanceAfter ?? nowQty;
            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = -model.TransferQty,
                BalanceAfter = oldBal - model.TransferQty,
                Action = "LINE好友預約轉讓（預扣）",
                Memo = $"pending:{pending.Id} token:{pending.Token} {(string.IsNullOrWhiteSpace(model.Note) ? "" : $"｜{model.Note}")}",
                CreatedAt = DateTime.UtcNow,
                IdempotencyKey = $"prededuct:{pending.Id}"
            });

            // 4) Outbox：建立事件（可用來通知/推播）
            _unitOfWork.DbContext.OutboxMessages.Add(new OutboxMessage
            {
                Type = "PendingCoinCreated",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { pending.Id, pending.Token, pending.CurrencyTypeId, pending.Quantity, pending.FromUserId })
            });

            await _unitOfWork.SaveAsync();
            await tx.CommitAsync();

            return Json(new { success = true, token });
        }






        // ========== 支援訪客模式的 Claim 頁 ==========
        // 加在 Customer/WalletController.cs 內（完整 Copy Paste，含自動會員補建）
        [HttpGet]
        public IActionResult Claim(string token)
        {

            TempData["DebugMsg"] = $"Claim Action！token={token}, login={User.Identity.IsAuthenticated}";

            if (!User.Identity.IsAuthenticated)
            {
                var properties = new AuthenticationProperties
                {
                    RedirectUri = $"/Customer/Wallet/Claim?token={Uri.EscapeDataString(token)}"
                };
                return Challenge(properties, LineAuthenticationDefaults.AuthenticationScheme);
            }
            // ⭐ 取得 pendingCoin
            var pending = _unitOfWork.PendingCoin.GetFirstOrDefault(x => x.Token == token && !x.IsClaimed);
            if (pending == null)
                return View("ClaimError");

            // 取得目前登入者LINE UserId
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // === 【1. 自動對應】===
            if (!string.IsNullOrEmpty(pending.LineUserId) && pending.LineUserId == userId)
            {
                // 補發入帳流程
                var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == pending.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                int oldBalance = last?.BalanceAfter ?? 0;

                _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
                {
                    UserId = userId,
                    CurrencyTypeId = pending.CurrencyTypeId,
                    Quantity = pending.Quantity,
                    BalanceAfter = oldBalance + pending.Quantity,
                    Action = "LINE好友領取",
                    Memo = string.IsNullOrWhiteSpace(pending.Memo) ? "LINE自動領取" : pending.Memo,
                    CreatedAt = DateTime.Now
                });

                pending.IsClaimed = true;
                pending.ClaimedAt = DateTime.Now;
                _unitOfWork.Save();

                ViewBag.Message = "領取成功！點數已自動入帳。";
                return View("ClaimResult"); // 你可以自訂成功頁
            }

            // === 【2. 無法自動，顯示暱稱人工確認】===
            ViewBag.NickName = pending.NickName;
            ViewBag.Token = pending.Token;
            ViewBag.PendingCoinId = pending.Id;
            return View("ClaimConfirm", pending);
        }




        [HttpPost]
        public async Task<IActionResult> Claim(string token, string lineUserId)
        {
            // 1. 取得邀請資料
            var invite = _unitOfWork.PendingInvite.GetFirstOrDefault(x => x.Token == token && !x.IsClaimed);
            if (invite == null)
                return Content("此邀請已領取或不存在");

            if (string.IsNullOrEmpty(lineUserId))
                return Content("請於LINE內領取");

            // 2. 若系統不存在此會員，則自動註冊（快速註冊，僅LINE用戶id）
            var user = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == lineUserId);
            if (user == null)
            {
                // 若有 UserManager 可用更嚴謹註冊，這裡先簡易方式直接加入
                user = new TeaTimeDemo.Models.ApplicationUser
                {
                    Id = lineUserId,
                    UserName = lineUserId,
                    Name = "LINE好友" // 可傳更多資訊如 displayName
                };
                _unitOfWork.ApplicationUser.Add(user);
                _unitOfWork.Save();
            }

            // 3. 標記已領取
            invite.IsClaimed = true;
            invite.ToLineUserId = lineUserId;

            // 4. 領取入帳
            var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == lineUserId && x.CurrencyTypeId == invite.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();

            int balance = last?.BalanceAfter ?? 0;
            _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
            {
                UserId = lineUserId,
                CurrencyTypeId = invite.CurrencyTypeId,
                Quantity = invite.Quantity,
                Action = "LINE好友領取",
                Memo = $"來自：{invite.FromUserId}",
                CreatedAt = DateTime.Now,
                BalanceAfter = balance + invite.Quantity
            });

            _unitOfWork.Save();
            return Content("領取成功！");
        }

        private int ClaimPendingCoinsIfAny(string lineUserId)
        {
            var pendings = _unitOfWork.PendingCoin
                .GetAll(x => x.LineUserId == lineUserId && x.Status == 0 && x.ExpiresAt > DateTime.UtcNow)
                .ToList();

            var claimedCount = 0;

            foreach (var pc in pendings)
            {
                // 取使用者該幣最後餘額
                var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == lineUserId && x.CurrencyTypeId == pc.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt)
                    .FirstOrDefault();

                int oldBalance = last?.BalanceAfter ?? 0;

                _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
                {
                    UserId = lineUserId,
                    CurrencyTypeId = pc.CurrencyTypeId,
                    Quantity = pc.Quantity,
                    BalanceAfter = oldBalance + pc.Quantity,
                    Action = "自動補發",
                    Memo = string.IsNullOrWhiteSpace(pc.Memo) ? "LINE自動領取" : pc.Memo,
                    CreatedAt = DateTime.Now
                });

                pc.IsClaimed = true;
                pc.ClaimedAt = DateTime.Now;

                // 如果你有用 Status 表示已完成，也可以順便標記
                 pc.Status = 1;

                claimedCount++;
            }

            _unitOfWork.Save();
            return claimedCount;
        }


        [HttpPost]
        public IActionResult ClaimManual(int pendingCoinId)
        {
            var pending = _unitOfWork.PendingCoin.GetById(pendingCoinId);
            if (pending == null || pending.IsClaimed)
                return Content("這筆點數已被領取或不存在！");

            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 入帳
            var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == pending.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int oldBalance = last?.BalanceAfter ?? 0;

            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = pending.CurrencyTypeId,
                Quantity = pending.Quantity,
                BalanceAfter = oldBalance + pending.Quantity,
                Action = "人工核對領取",
                Memo = string.IsNullOrWhiteSpace(pending.Memo) ? "人工確認領取" : pending.Memo,
                CreatedAt = DateTime.Now
            });
            pending.IsClaimed = true;
            pending.ClaimedAt = DateTime.Now;
            _unitOfWork.Save();

            ViewBag.Message = "領取成功（人工確認）！";
            return View("ClaimResult");
        }


        public class ClaimRequestVM
        {
            public string lineUserId { get; set; }
            public string? liffId { get; set; }
            public string? idToken { get; set; } // TODO: 未來可驗 JWT 與 aud=你的 ChannelId
        }


        [HttpPost]
        public async Task<IActionResult> ClaimByUserId(
        [FromBody] ClaimRequestVM req,
        [FromServices] IConfiguration cfg,
        [FromServices] ChannelUserLinkService linkSvc)
        {
            if (string.IsNullOrEmpty(req.lineUserId))
                return Content("未取得LINE UserId，請用LINE APP開啟本頁。");

            // 這段就是你問的程式：把 (ChannelId, LineUserId) 綁到 GlobalUserId
            var globalUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var channelId = string.IsNullOrWhiteSpace(req.liffId) ? null : cfg[$"Line:LiffToChannel:{req.liffId}"];
            if (!string.IsNullOrEmpty(channelId) && !string.IsNullOrEmpty(globalUserId))
            {
                await linkSvc.BindAsync(channelId, req.lineUserId, globalUserId);
            }

            // （以下保持你原本的流程）
            var pending = _unitOfWork.PendingInvite.GetFirstOrDefault(
                x => x.ToLineUserId == req.lineUserId && !x.IsClaimed);

            if (pending == null)
                return Content("你目前沒有可領取的點數邀請～");

            var last = _unitOfWork.UserCurrencyLog.GetAll(
                x => x.UserId == req.lineUserId && x.CurrencyTypeId == pending.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            int balance = last?.BalanceAfter ?? 0;
            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = req.lineUserId,
                CurrencyTypeId = pending.CurrencyTypeId,
                Quantity = pending.Quantity,
                Action = "LINE好友領取",
                Memo = $"來自：{pending.FromUserId}",
                CreatedAt = DateTime.Now,
                BalanceAfter = balance + pending.Quantity
            });

            pending.IsClaimed = true;
            _unitOfWork.Save();

            return Content("領取成功！點數已入帳 🎉");
        }



        // 加在 WalletController.cs

        [HttpGet]
        public IActionResult LiffEntry(string mode = null, string token = null)
        {
            // 【新增】將傳入的 mode/token 儲存到 Session 中，避免登入或導向時遺失
            if (!string.IsNullOrEmpty(mode))
            {
                HttpContext.Session.SetString("liff_mode", mode);
            }
            if (!string.IsNullOrEmpty(token))
            {
                HttpContext.Session.SetString("liff_token", token);
            }

            // 如果使用者尚未登入
            if (!User.Identity.IsAuthenticated)
            {
                // 將回來的路徑設成沒有 query string 的 LiffEntry，
                // 讓登入完回來時由 Session 取回 mode/token
                var returnUrl = "/Customer/Wallet/LiffEntry";
                var loginUrl = $"/Identity/Account/Login?returnUrl={Uri.EscapeDataString(returnUrl)}";
                return Redirect(loginUrl);
            }

            // 使用者已登入 → 從 Session 補回 mode/token（若當前 query 為空）
            mode ??= HttpContext.Session.GetString("liff_mode");
            token ??= HttpContext.Session.GetString("liff_token");

            // 依 mode 決定導向頁面
            switch (mode)
            {
                case "claim":
                    return RedirectToAction("Claim", new { token });
                case "transfer":
                    return RedirectToAction("TransferList");
                case "wallet":
                default:
                    return RedirectToAction("Index");
            }
        }




    }
}
