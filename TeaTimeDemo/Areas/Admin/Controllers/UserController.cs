using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services; // 確保引用了這個命名空間
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.ViewModels;
using TeaTimeDemo.Utility;
using System.Threading.Tasks;
using System.Text.Encodings.Web;
using ClosedXML.Excel;
using System.IO;
using Microsoft.EntityFrameworkCore;
using TeaTimeDemo.DataAccess.Data;

namespace TeaTimeDemo.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
    public class UserController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmailSender _emailSender;
        private readonly ApplicationDbContext _dbContext;

        public UserController(
             ApplicationDbContext dbContext,
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IEmailSender emailSender) // 使用非泛型 IEmailSender
        {
            _dbContext = dbContext;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
        }

        public IActionResult Index()
        {
            return View();
        }

        // GET: Admin/User/Upsert
        public IActionResult Upsert(string? id)
        {
            UserVM userVM = new()
            {
                RoleList = _roleManager.Roles.Select(r => new SelectListItem
                {
                    Text = r.Name,
                    Value = r.Name
                }),
                StoreList = _unitOfWork.Store.GetAll().Select(s => new SelectListItem
                {
                    Text = s.Name,
                    Value = s.Id.ToString()
                }),
                Input = new ApplicationUser()
            };

            if (string.IsNullOrEmpty(id))
            {
                // 新增使用者
                return View(userVM);
            }
            else
            {
                // 編輯使用者
                var user = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == id, includeProperties: "Store");
                if (user == null)
                {
                    return NotFound();
                }
                userVM.Input = user;
                return View(userVM);
            }
        }

        // POST: Admin/User/Upsert
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Upsert(UserVM userVM)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(userVM.Input.Id))
                {
                    // 新增使用者
                    var user = new ApplicationUser
                    {
                        UserName = userVM.Input.Email,
                        Email = userVM.Input.Email,
                        Name = userVM.Input.Name,
                        Address = userVM.Input.Address,
                        PhoneNumber = userVM.Input.PhoneNumber,
                        StoreId = userVM.Input.StoreId
                    };

                    var result = await _userManager.CreateAsync(user, userVM.Password); // 使用 userVM.Password 作為密碼

                    if (result.Succeeded)
                    {
                        if (!string.IsNullOrEmpty(userVM.Role))
                        {
                            await _userManager.AddToRoleAsync(user, userVM.Role);
                        }
                        else
                        {
                            await _userManager.AddToRoleAsync(user, SD.Role_Customer);
                        }

                        // 發送確認郵件
                        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        var callbackUrl = Url.Action(
                            "ConfirmEmail",
                            "Account",
                            new { userId = user.Id, code = code },
                            protocol: HttpContext.Request.Scheme);

                        await _emailSender.SendEmailAsync(user.Email, "確認您的電子郵件",
                            $"請點擊 <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>這裡</a> 以確認您的帳戶。");

                        TempData["success"] = "新增使用者成功!";
                        return RedirectToAction("Index");
                    }
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
                else
                {
                    // 編輯使用者
                    var user = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userVM.Input.Id, includeProperties: "Store");
                    if (user == null)
                    {
                        return NotFound();
                    }

                    user.Name = userVM.Input.Name;
                    user.Address = userVM.Input.Address;
                    user.PhoneNumber = userVM.Input.PhoneNumber;
                    user.StoreId = userVM.Input.StoreId;

                    _unitOfWork.ApplicationUser.Update(user);
                    _unitOfWork.Save();

                    // 更新使用者角色
                    var userRoles = await _userManager.GetRolesAsync(user);
                    await _userManager.RemoveFromRolesAsync(user, userRoles);
                    if (!string.IsNullOrEmpty(userVM.Role))
                    {
                        await _userManager.AddToRoleAsync(user, userVM.Role);
                    }
                    else
                    {
                        await _userManager.AddToRoleAsync(user, SD.Role_Customer);
                    }

                    TempData["success"] = "編輯使用者成功!";
                    return RedirectToAction("Index");
                }
            }

            // 如果有錯誤，重新填充下拉選單
            userVM.RoleList = _roleManager.Roles.Select(r => new SelectListItem
            {
                Text = r.Name,
                Value = r.Name
            });
            userVM.StoreList = _unitOfWork.Store.GetAll().Select(s => new SelectListItem
            {
                Text = s.Name,
                Value = s.Id.ToString()
            });

            return View(userVM);
        }

        public IActionResult ExportToExcel()
        {
            var users = _userManager.Users.ToList();
            var roles = _roleManager.Roles.ToList();
            var userRoles = _dbContext.UserRoles.ToList();

            using (var workbook = new XLWorkbook())
            {
                // 匯出 Users 資料
                var usersWorksheet = workbook.Worksheets.Add("Users");
                usersWorksheet.Cell(1, 1).Value = "UserName";
                usersWorksheet.Cell(1, 2).Value = "Email";
                usersWorksheet.Cell(1, 3).Value = "Name";
                usersWorksheet.Cell(1, 4).Value = "PhoneNumber";
                usersWorksheet.Cell(1, 5).Value = "StoreId";
                usersWorksheet.Cell(1, 6).Value = "Address"; // 增加 Address 欄位

                for (int i = 0; i < users.Count; i++)
                {
                    usersWorksheet.Cell(i + 2, 1).Value = users[i].UserName;
                    usersWorksheet.Cell(i + 2, 2).Value = users[i].Email;
                    usersWorksheet.Cell(i + 2, 3).Value = users[i].Name;
                    usersWorksheet.Cell(i + 2, 4).Value = users[i].PhoneNumber;
                    usersWorksheet.Cell(i + 2, 5).Value = users[i].StoreId;
                    usersWorksheet.Cell(i + 2, 6).Value = users[i].Address; // 增加 Address 的值
                }

                // 匯出 Roles 資料
                var rolesWorksheet = workbook.Worksheets.Add("Roles");
                rolesWorksheet.Cell(1, 1).Value = "Name";

                for (int i = 0; i < roles.Count; i++)
                {
                    rolesWorksheet.Cell(i + 2, 1).Value = roles[i].Name;
                }

                // 匯出 UserRoles 資料
                var userRolesWorksheet = workbook.Worksheets.Add("UserRoles");
                userRolesWorksheet.Cell(1, 1).Value = "UserName";
                userRolesWorksheet.Cell(1, 2).Value = "RoleName";

                for (int i = 0; i < userRoles.Count; i++)
                {
                    var user = users.FirstOrDefault(u => u.Id == userRoles[i].UserId);
                    var role = roles.FirstOrDefault(r => r.Id == userRoles[i].RoleId);

                    userRolesWorksheet.Cell(i + 2, 1).Value = user?.UserName;
                    userRolesWorksheet.Cell(i + 2, 2).Value = role?.Name;
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UsersAndRoles.xlsx");
                }
            }
        }

        // 匯入功能
        [HttpPost]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["Error"] = "請選擇一個有效的 Excel 文件！";
                return RedirectToAction("Index");
            }

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    // 讀取 Roles
                    var rolesWorksheet = workbook.Worksheet("Roles");
                    foreach (var row in rolesWorksheet.RowsUsed().Skip(1))
                    {
                        var roleName = row.Cell(1).GetString();
                        if (!await _roleManager.RoleExistsAsync(roleName))
                        {
                            await _roleManager.CreateAsync(new IdentityRole(roleName));
                        }
                    }

                    // 讀取 Users
                    var usersWorksheet = workbook.Worksheet("Users");
                    foreach (var row in usersWorksheet.RowsUsed().Skip(1))
                    {
                        var userName = row.Cell(1).GetString();
                        var email = row.Cell(2).GetString();
                        var name = row.Cell(3).GetString();
                        var phoneNumber = row.Cell(4).GetString();
                        var storeId = row.Cell(5).GetValue<int>();
                        var address = row.Cell(6).GetString(); // 讀取 Address 欄位

                        if (await _userManager.FindByEmailAsync(email) == null)
                        {
                            var user = new ApplicationUser
                            {
                                UserName = userName,
                                Email = email,
                                Name = name,
                                PhoneNumber = phoneNumber,
                                StoreId = storeId,
                                Address = address, // 設定 Address
                                EmailConfirmed = true
                            };
                            // 為使用者設定一個臨時密碼
                            var result = await _userManager.CreateAsync(user, "12345678");
                            if (!result.Succeeded)
                            {
                                // 處理錯誤
                                foreach (var error in result.Errors)
                                {
                                    ModelState.AddModelError("", error.Description);
                                }
                                continue;
                            }
                        }
                    }

                    // 讀取 UserRoles
                    var userRolesWorksheet = workbook.Worksheet("UserRoles");
                    foreach (var row in userRolesWorksheet.RowsUsed().Skip(1))
                    {
                        var userName = row.Cell(1).GetString();
                        var roleName = row.Cell(2).GetString();

                        var user = await _userManager.FindByNameAsync(userName);
                        if (user != null && await _roleManager.RoleExistsAsync(roleName))
                        {
                            if (!await _userManager.IsInRoleAsync(user, roleName))
                            {
                                await _userManager.AddToRoleAsync(user, roleName);
                            }
                        }
                    }
                }
            }

            TempData["Success"] = "匯入成功！";
            return RedirectToAction("Index");
        }

        #region API CALLS

        [HttpGet]
        public IActionResult GetAll()
        {
            var userList = _unitOfWork.ApplicationUser.GetAll(includeProperties: "Store").Select(u => new
            {
                u.Id,
                u.Name,
                u.Address,
                StoreName = u.Store != null ? u.Store.Name : "N/A",
                u.PhoneNumber,
                Roles = string.Join(",", _userManager.GetRolesAsync(u).Result)
            }).ToList();
            return Json(new { data = userList });
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(string? id)
        {
            var userToBeDeleted = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == id, includeProperties: "Store");
            if (userToBeDeleted == null)
            {
                return Json(new { success = false, message = "刪除失敗，找不到該使用者。" });
            }

            var result = await _userManager.DeleteAsync(userToBeDeleted);
            if (result.Succeeded)
            {
                return Json(new { success = true, message = "刪除成功！" });
            }
            else
            {
                return Json(new { success = false, message = "刪除失敗，請稍後再試。" });
            }
        }

        #endregion
    }
}
