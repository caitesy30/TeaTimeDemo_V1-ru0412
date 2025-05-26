// Program.cs
using AspNet.Security.OAuth.Line;             // LINE OAuth
using AutoMapper;                             // AutoMapper
using Line.Messaging;                         // LINE Messaging API
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;      // Forwarded Headers
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Proxies;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Globalization;
using System.Security.Claims;
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
// ── 新增：讓應用程式在 HTTP 80 端口也能接收請求（對應 cloudflared 預設的 ingress 轉送）
//builder.WebHost.UseUrls("http://0.0.0.0:80");


//── 一、服務註冊 ─────────────────────────────────────────//

// (0) 轉發標頭：讀取 Cloudflare 或反向代理傳來的 X-Forwarded-* 標頭
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                             | ForwardedHeaders.XForwardedProto;
    // 如有需要，可設定 KnownProxies/KnownNetworks
});

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

// (4) Identity 設定
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    opts.SignIn.RequireConfirmedAccount = true;
    opts.User.RequireUniqueEmail = false;      // 允許多帳號無 email 或 email 重複

    // ✅ 加上這行：放寬 UserName 可接受的格式（Email 與 LINE ID 都能用）
    opts.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";


    opts.Password.RequiredLength = 6;
    opts.Password.RequireDigit = false;
    opts.Password.RequireLowercase = false;
    opts.Password.RequireUppercase = false;
    opts.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 自訂 Identity Cookie 路徑
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

// (9) LINE OAuth 設定
builder.Services
  .AddAuthentication(options =>
  {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = LineAuthenticationDefaults.AuthenticationScheme;
  })
  .AddCookie() // Identity 已自動註冊，此行可留或移除都行
  .AddLine(LineAuthenticationDefaults.AuthenticationScheme, "LINE 帳號登入", options =>
  {
      options.ClientId = builder.Configuration["LineLogin:ChannelId"];
      options.ClientSecret = builder.Configuration["LineLogin:ChannelSecret"];
      options.CallbackPath = "/signin-line";

      // 要求 openid, profile, email 權限
      options.Scope.Add("openid");
      options.Scope.Add("profile");
      options.Scope.Add("email");

      // 將 email claim 取出
      options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");

      options.SaveTokens = true;

      // 調試：印出最終 OAuth URL
      options.Events.OnRedirectToAuthorizationEndpoint = context =>
      {
          Console.WriteLine("LINE OAuth URL: " + context.RedirectUri);
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

// 1. Forwarded Headers：處理 Cloudflare / 反向 Proxy
app.UseForwardedHeaders();

// 2. 強制 HTTPS
app.UseHttpsRedirection();

// 3. 本地化
var supportedCultures = new[] { "en-us", "zh-tw", "th-th" };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("zh-tw"),
    SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList(),
    SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList()
});

// 4. 靜態檔
app.UseStaticFiles();

// 5. Routing
app.UseRouting();

// 6. CORS
app.UseCors("AllowAll");

// 7. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 8. Session
app.UseSession();

// 9. Endpoint 映射
app.MapControllerRoute(
    name: "default",
    pattern: "{area=Customer}/{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapControllers();

// 10. Database Seed
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<IDbInitializer>().Initialize();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // 如無資料庫則自動建立；如有則套用尚未執行的 migration
    db.Database.Migrate();
}
app.Run();
