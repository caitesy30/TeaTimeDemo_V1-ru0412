﻿using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.Models;
using TeaTimeDemo.Utility;


namespace TeaTimeDemo.DataAccess.DbInitializer
{
    public class DbInitializer : IDbInitializer
    {
        //使用依賴注入的方式來引入我們會用到的服務
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;

        public DbInitializer(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        public void Initialize()
        {
            try
            {
                /*var pendingMigrations = _db.Database.GetPendingMigrations().ToList();

        if (pendingMigrations.Count > 0)
        {
            foreach (var migration in pendingMigrations)
            {
                // 2. 解析 migration 來獲取創建的資料表
                var createdTables = GetCreatedTablesFromMigration(migration);

                foreach (var table in createdTables)
                {
                    // 3. 檢查資料庫中是否已經存在該資料表
                    var tableExists = CheckIfTableExistsInDb(table);
                    
                    if (tableExists)
                    {
                        Console.WriteLine($"Table '{table}' already exists. Skipping creation.");
                    }
                    else
                    {
                        Console.WriteLine($"Table '{table}' does not exist. Proceeding with migration.");
                    }
                }
            }
            
            // 4. 若有待處理的遷移，執行遷移
            _db.Database.Migrate();
        }
        else
        {
            Console.WriteLine("No pending migrations.");
        }*/
                // 檢查是否有待處理的migration，如果有就進行資料庫遷移migration。 
                if (_db.Database.GetPendingMigrations().Count()>0)
                {
                    
                    _db.Database.Migrate();
                }
            }
            catch (Exception ex)
            {
                //Logger.LogError(ex, "An error occurred while migrating the database.");

                throw new ApplicationException("An error occurred while migrating the database.", ex);
            }

            // 檢查角色是否存在，如果不存在就建立所有角色以及我們的管理者帳號
            if (!_roleManager.RoleExistsAsync(SD.Role_Customer).GetAwaiter().GetResult())
            {
                _roleManager.CreateAsync(new IdentityRole(SD.Role_Customer)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(SD.Role_Manager)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(SD.Role_Employee)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(SD.Role_Admin)).GetAwaiter().GetResult();

                // 創建管理員用戶
                _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = "admin@gmail.com",
                    Email = "admin@gmail.com",
                    StoreId = 4,
                    Name = "Administrator",
                    PhoneNumber = "0911111111",
                    Address = "12345",
                    EmailConfirmed = true
                }, "Admin123*").GetAwaiter().GetResult();

                _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = "alvin@gmail.com",
                    Email = "alvin@gmail.com",
                    StoreId = 4,
                    Name = "alvin",
                    PhoneNumber = "0911111111",
                    Address = "24177",
                    EmailConfirmed = true
                },"Admin123*").GetAwaiter().GetResult();
 
                ApplicationUser user = _db.ApplicationUsers.FirstOrDefault(u => u.Email == "admin@gmail.com");
                _userManager.AddToRoleAsync(user, SD.Role_Admin).GetAwaiter().GetResult();
                ApplicationUser newUser = _db.ApplicationUsers.FirstOrDefault(u => u.Email == "alvin@gmail.com");
                _userManager.AddToRoleAsync(newUser, SD.Role_Admin).GetAwaiter().GetResult();
            }
            return;
        }
    }
}