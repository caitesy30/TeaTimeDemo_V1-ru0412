// ==========================
// 檔名：WalletController.cs
// 製作人：茶神
// 日期：2024-05-31
// 目的：會員錢包首頁（餘額、異動紀錄查詢）
// ==========================

using AspNet.Security.OAuth.Line;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
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
                    // 可以提示請先LINE授權，或留空
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

                // ★★ 新增：自動補發所有待領幣 ★★
                ClaimPendingCoinsIfAny(userId);
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
            if (userId == null)
            {
                // 換成專屬 LIFF 登入入口，登入後自動回 TransferList
                return Redirect($"/Customer/LiffAuthEntry?redirect=/Customer/Wallet/TransferList");
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

            return View(items); // 對應 TransferList.cshtml
        }

        // ========== 轉讓步驟二：輸入會員 or 選LINE好友＋數量 ==========
        [HttpGet]
        public IActionResult Transfer(int id, int? qty)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Redirect($"/Customer/LiffAuthEntry?redirect=/Customer/Wallet/Transfer/{id}");
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


        // Transfer 給 LINE 好友時：預扣一筆，並建立 PendingCoin 等對方領取
        [HttpPost]
        [IgnoreAntiforgeryToken]
        public IActionResult TransferToLine(TransferCoinVM model)
        {
            // 取得目前登入者的 UserId
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 產生一組唯一 Token（可選，但這版本不使用 Token）
            var token = Guid.NewGuid().ToString("N");

            // === 1. 預扣自己的點數 ===
            var nowQty = _unitOfWork.UserCurrencyLog.GetAll()
                .Where(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .Sum(x => x.Quantity);

            if (model.TransferQty > nowQty)
            {
                return Json(new { success = false, message = "持有數量不足，無法轉讓" });
            }

            var lastLog = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == userId && x.CurrencyTypeId == model.CurrencyTypeId)
                .OrderByDescending(x => x.CreatedAt).FirstOrDefault();

            int oldBalance = lastLog?.BalanceAfter ?? nowQty;
            int newBalance = oldBalance - model.TransferQty;

            _unitOfWork.UserCurrencyLog.Add(new UserCurrencyLog
            {
                UserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = -model.TransferQty,
                BalanceAfter = newBalance,
                Action = "LINE好友預約轉讓",
                Memo = $"轉讓給LINE好友：{model.TargetLineFriendName}",
                CreatedAt = DateTime.Now
            });

            // === 2. 建立 PendingCoin ===
            var pendingCoin = new PendingCoin
            {
                Token = token,                                 // 新增：唯一token
                NickName = model.TargetLineFriendName ?? "",   // 新增：好友暱稱
                FromUserId = userId,
                CurrencyTypeId = model.CurrencyTypeId,
                Quantity = model.TransferQty,
                LineUserId = model.TargetLineFriendId, // 若還沒授權也可先空著
                Memo = $"轉讓給LINE好友：{model.TargetLineFriendName}",
                IsClaimed = false,
                CreatedAt = DateTime.Now
            };
            _unitOfWork.PendingCoin.Add(pendingCoin);

            // === 3. 儲存 ===
            _unitOfWork.Save();

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

        private void ClaimPendingCoinsIfAny(string lineUserId)
        {
            var pendings = _unitOfWork.PendingCoin.GetAll(x => x.LineUserId == lineUserId && !x.IsClaimed).ToList();
            foreach (var pc in pendings)
            {
                var last = _unitOfWork.UserCurrencyLog.GetAll(x => x.UserId == lineUserId && x.CurrencyTypeId == pc.CurrencyTypeId)
                    .OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                int oldBalance = last?.BalanceAfter ?? 0;
                _unitOfWork.UserCurrencyLog.Add(new TeaTimeDemo.Models.UserCurrencyLog
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
            }
            _unitOfWork.Save();
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
        }

        [HttpPost]
        public IActionResult ClaimByUserId([FromBody] ClaimRequestVM req)
        {
            if (string.IsNullOrEmpty(req.lineUserId))
                return Content("未取得LINE UserId，請用LINE APP開啟本頁。");

            // 查找此人尚未領取的PendingInvite（也可改PendingCoin，看你DB）
            var pending = _unitOfWork.PendingInvite.GetFirstOrDefault(
                x => x.ToLineUserId == req.lineUserId && !x.IsClaimed);

            if (pending == null)
                return Content("你目前沒有可領取的點數邀請～");

            // 加入錢包紀錄
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

            // 標記已領取
            pending.IsClaimed = true;
            _unitOfWork.Save();

            return Content("領取成功！點數已入帳 🎉");
        }

        // 加在 WalletController.cs
        [HttpGet]
        public IActionResult LiffEntry(string mode = null, string token = null)
        {
            // 如果沒登入，可自動啟動 LINE Login 或顯示提示
            if (!User.Identity.IsAuthenticated)
            {
                // 自動觸發 LINE Login（也可考慮在前端 JS 判斷 LIFF 直接調用 liff.login）
                return Redirect("/Identity/Account/Login");
            }

            // 依 mode 跳到正確畫面
            switch (mode)
            {
                case "wallet":
                default:
                    return RedirectToAction("Index");
                case "claim":
                    return RedirectToAction("Claim", new { token });
                case "transfer":
                    return RedirectToAction("TransferList");
            }
        }



    }
}
