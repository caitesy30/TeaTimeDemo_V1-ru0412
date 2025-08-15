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
//using Microsoft.Net.Http.Headers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.WebUtilities;       // QueryHelpers
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
using TeaTimeDemo.Services;

var builder = WebApplication.CreateBuilder(args);
// ── 新增：讓應用程式在 HTTP 80 端口也能接收請求（對應 cloudflared 預設的 ingress 轉送）
//builder.WebHost.UseUrls("http://0.0.0.0:80");


//── 一、服務註冊 ─────────────────────────────────────────//


// --- (A) Forwarded Headers：信任代理，把 X-Forwarded-* 還原為 Request 的原始資訊 ---
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedFor;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
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
    opts.Cookie.SameSite = SameSiteMode.None; // <— 第三方跳轉必須 None
    opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opts.Cookie.HttpOnly = true; // 防止 JavaScript 存取 Cookie
    opts.Events = new CookieAuthenticationEvents
    {
        // 可依需要處理 OnRedirectToLogin 等事件
    };
});

// 你若有其他 Cookie（TempData/Antiforgery）也要設 None+Secure
builder.Services.AddAntiforgery(o =>
{
    o.Cookie.SameSite = SameSiteMode.None;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
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
// 加入我們的 Intent 服務
builder.Services.AddScoped<RedemptionIntentService>();
builder.Services.AddScoped<WalletCreditService>();
builder.Services.AddScoped<ChannelUserLinkService>();

// (7) 其他：HttpClient、MemoryCache、SignalR、RazorPages、AutoMapper
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddRazorPages();
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// 背景服務
builder.Services.AddHostedService<PendingRefundWorker>();
builder.Services.AddHostedService<OutboxDispatcher>();

// (8) MVC + JSON + Localization
builder.Services.AddControllersWithViews()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    })
    .AddDataAnnotationsLocalization()
    .AddViewLocalization();

// (9) LINE OAuth 設定（重點：強制 https + 正確 Host）
builder.Services
  .AddAuthentication(options =>
  {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = LineAuthenticationDefaults.AuthenticationScheme;
  })
  .AddCookie()
  .AddLine(LineAuthenticationDefaults.AuthenticationScheme, "LINE 帳號登入", options =>
  {
      options.ClientId = builder.Configuration["LineLogin:ChannelId"];
      options.ClientSecret = builder.Configuration["LineLogin:ChannelSecret"];

      // 固定 CallbackPath，等等會把 redirect_uri 改寫成 https://{外部Host}{CallbackPath}
      options.CallbackPath = "/signin-line";

      // 要求 openid/profile/email 權限
      options.Scope.Clear();
      options.Scope.Add("profile");
      options.Scope.Add("openid");        // 要 id_token 時才需要；否則可拿掉
      // options.Scope.Add("email");      // ← 只有你的 Channel 已核准 Email address permission 才打開


      //options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
      options.SaveTokens = true;

      // 強制把 redirect_uri 換成外部 https 網域（拿掉 :443/:80）
      options.Events.OnRedirectToAuthorizationEndpoint = ctx =>
      {
          var req = ctx.Request;
          var forwardedHost = req.Headers["X-Forwarded-Host"].ToString();
          var host = string.IsNullOrWhiteSpace(forwardedHost) ? req.Host.Value : forwardedHost;

          // 去掉預設埠號，避免和後台不一致
          var colon = host.IndexOf(':');
          if (colon > 0)
          {
              var port = host[(colon + 1)..];
              if (port == "443" || port == "80") host = host[..colon];
          }

          var finalCallback = $"https://{host}{options.CallbackPath}";

          // 重組授權網址，只換 redirect_uri，其他參數保留
          var ub = new UriBuilder(ctx.RedirectUri);
          var parsed = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(ub.Query);
          var pairs = new List<KeyValuePair<string, string>>();
          foreach (var kv in parsed)
          {
              if (kv.Key.Equals("redirect_uri", StringComparison.OrdinalIgnoreCase))
              {
                  pairs.Add(new("redirect_uri", finalCallback));
              }
              else
              {
                  foreach (var v in kv.Value) pairs.Add(new(kv.Key, v));
              }
          }
          ub.Query = string.Join("&", pairs.Select(kv =>
              $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

          // 方便對照：把最後送出去的 authorize URL 打到 log
          Console.WriteLine("[LINE authorize] " + ub.Uri);

          ctx.Response.Redirect(ub.Uri.ToString());
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

app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    Secure = CookieSecurePolicy.Always
});

// 1. Forwarded Headers：處理 Cloudflare / 反向 Proxy
app.UseForwardedHeaders();

// 強制 Https Redirection（配合代理）
app.Use(async (ctx, next) =>
{
    // 若是代理端已還原 https，但 ASP.NET 覺得是 http，就改成 https
    if (ctx.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && proto == "https")
    {
        ctx.Request.Scheme = "https";
    }
    await next();
});


            
//── 二、中介軟體順序 ───────────────────────────────────────//



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

// 9. 路由
app.MapControllerRoute(
    name: "default",
    pattern: "{area=Customer}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "areaRoute",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

// 短網址
app.MapControllerRoute(
    name: "claimShortcut",
    pattern: "Wallet/Claim",
    defaults: new { area = "Customer", controller = "Wallet", action = "Claim" });



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
