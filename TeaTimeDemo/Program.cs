// Program.cs
using AspNet.Security.OAuth.Line;             // LINE OAuth
using AutoMapper;                             // AutoMapper
using Line.Messaging;                         // LINE Messaging API
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Proxies;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.DbInitializer;
using TeaTimeDemo.DataAccess.Repository;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Mapping;
using TeaTimeDemo.Models;
using TeaTimeDemo.Utility;

var builder = WebApplication.CreateBuilder(args);

//── 一、服務註冊 ─────────────────────────────────────────//

// (1) 本地化
builder.Services.AddLocalization(opts => opts.ResourcesPath = "Resources");

// (2) 大檔案上傳限制
builder.WebHost.ConfigureKestrel(opts => opts.Limits.MaxRequestBodySize = 300 * 1024 * 1024);
builder.Services.Configure<IISServerOptions>(opts => opts.MaxRequestBodySize = 300 * 1024 * 1024);
builder.Services.Configure<FormOptions>(opts => opts.MultipartBodyLengthLimit = 300 * 1024 * 1024);

// (3) EF Core + Lazy Loading
var defaultConn = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(opts =>
    opts.UseSqlServer(defaultConn)
        .EnableSensitiveDataLogging()
        .UseLazyLoadingProxies());

// (4) Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    opts.SignIn.RequireConfirmedAccount = true;
    opts.Password.RequiredLength = 6;
    opts.Password.RequireDigit = false;
    opts.Password.RequireLowercase = false;
    opts.Password.RequireUppercase = false;
    opts.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 自訂 Cookie 路徑
builder.Services.ConfigureApplicationCookie(opts =>
{
    opts.LoginPath = "/Identity/Account/Login";
    opts.LogoutPath = "/Identity/Account/Logout";
    opts.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

// (5) CORS
builder.Services.AddCors(o => o.AddPolicy("AllowAll",
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// (6) DI — Repository、Service
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IDbInitializer, DbInitializer>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

// (7) 其他：HttpClient、MemoryCache、SignalR、RazorPages、AutoMapper
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddRazorPages();
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// (8) MVC + JSON + Localization
builder.Services.AddControllersWithViews()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    })
    .AddDataAnnotationsLocalization()
    .AddViewLocalization();

// (9) LINE OAuth 設定（測試時可硬編 ID/Secret 確認流程）

builder.Services
  .AddAuthentication(options => {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = LineAuthenticationDefaults.AuthenticationScheme;
  })
  .AddLine(LineAuthenticationDefaults.AuthenticationScheme, "LINE 帳號登入", options => {
      options.ClientId = builder.Configuration["LineLogin:ChannelId"];
      options.ClientSecret = builder.Configuration["LineLogin:ChannelSecret"];
      options.CallbackPath = "/signin-line";
      options.Scope.Add("openid");
      options.Scope.Add("profile");
      options.SaveTokens = true;

      // 【新增】在導向授權前，記錄下完整 URL
      options.Events.OnRedirectToAuthorizationEndpoint = context => {
          // 將最終 RedirectUri 印到 Console 或日誌
          Console.WriteLine("LINE OAuth URL: " + context.RedirectUri);
          // 繼續執行原本的 Redirect
          context.Response.Redirect(context.RedirectUri);
          return Task.CompletedTask;
      };
  });


// (10) LINE Messaging API Client
var botToken = builder.Configuration["LineBot:ChannelAccessToken"];
builder.Services.AddSingleton(new LineMessagingClient(botToken));

// (11) Session
builder.Services.AddSession(opts =>
{
    opts.IdleTimeout = TimeSpan.FromMinutes(30);
    opts.Cookie.HttpOnly = true;
    opts.Cookie.IsEssential = true;
});

var app = builder.Build();

//── 二、中介軟體順序 ───────────────────────────────────────//

// 1. 本地化
var supportedCultures = new[] { "en-us", "zh-tw", "th-th" };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("zh-tw"),
    SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList(),
    SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList()
});

// 2. 靜態檔
app.UseStaticFiles();

// 3. Routing
app.UseRouting();

// 4. CORS
app.UseCors("AllowAll");

// 5. 驗證
app.UseAuthentication();
app.UseAuthorization();

// 6. Session
app.UseSession();

// 7. Endpoint 映射
app.MapControllerRoute(
    name: "default",
    pattern: "{area=Customer}/{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapControllers();

// 8. Database Seed
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<IDbInitializer>().Initialize();

app.Run();
