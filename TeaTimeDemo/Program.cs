// Program.cs
using AspNet.Security.OAuth.Line;             // LINE OAuth
using AutoMapper;                             // AutoMapper
using Line.Messaging;                         // LINE Messaging API
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;     // Forwarded Headers
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.WebUtilities;      // QueryHelpers
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
using TeaTimeDemo.Services;
using TeaTimeDemo.Utility;

var builder = WebApplication.CreateBuilder(args);

// (A) Forwarded Headers（反向代理必備）
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedProto |
        ForwardedHeaders.XForwardedHost |
        ForwardedHeaders.XForwardedFor;
    // 若在 Cloudflare/Nginx 前面，可清空已知清單，避免被限制
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
  
});

builder.Services.Configure<IdentityOptions>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
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

// (4) Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    // 需確認帳號（外部登入建立時你可選擇直接標記 EmailConfirmed=true）
    opts.SignIn.RequireConfirmedAccount = true;

    // 允許沒有 Email 或重複（你原設定）
    opts.User.RequireUniqueEmail = false;

    // 放寬 UserName 字元集（支援 Email / LINE ID）
    opts.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    // 密碼策略（保留你原設定）
    opts.Password.RequiredLength = 6;
    opts.Password.RequireDigit = false;
    opts.Password.RequireLowercase = false;
    opts.Password.RequireUppercase = false;
    opts.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 自訂 Identity Cookie
builder.Services.ConfigureApplicationCookie(opts =>
{
    opts.LoginPath = "/Identity/Account/Login";
    opts.LogoutPath = "/Identity/Account/Logout";
    opts.AccessDeniedPath = "/Identity/Account/AccessDenied";

    // 手機/跨域安全
    opts.Cookie.SameSite = SameSiteMode.None;
    opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opts.Cookie.HttpOnly = true;

    // ★★★ 核心：把未登入/未授權的導向，交給我們的入口（避免自動打到 LINE）
    opts.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx =>
        {
            var path = (ctx.Request.Path.HasValue ? ctx.Request.Path.Value! : "/") + ctx.Request.QueryString.Value;
            var lower = path.ToLowerInvariant();

            // 回呼路徑 /signin-* 一律不要再重導，否則授權迴圈
            if (lower.StartsWith("/signin-"))
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }

            // 避免 return 到登出頁
            if (lower.Equals("/identity/account/logout"))
                path = "/Customer/Wallet/Index";

            // 統一導去我們的入口（Login Action 會決定是否真的去 LINE）
            var url = $"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(path)}";
            ctx.Response.Redirect(url);
            return Task.CompletedTask;
        },
        OnRedirectToAccessDenied = ctx =>
        {
            var path = (ctx.Request.Path.HasValue ? ctx.Request.Path.Value! : "/") + ctx.Request.QueryString.Value;
            var url = $"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(path)}";
            ctx.Response.Redirect(url);
            return Task.CompletedTask;
        }
    };
});

// Antiforgery Cookie（跨域安全一致）
builder.Services.AddAntiforgery(o =>
{
    o.Cookie.SameSite = SameSiteMode.None;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// (5) CORS
builder.Services.AddCors(o => o.AddPolicy("AllowAll",
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// (6) DI
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IDbInitializer, DbInitializer>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<RedemptionIntentService>();
builder.Services.AddScoped<WalletCreditService>();
builder.Services.AddScoped<ChannelUserLinkService>();

// (7) 其他服務
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddRazorPages();
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// 背景服務（保留你原本）
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

// (9) 認證：預設用 Cookie，只有在我們的入口才去 Challenge LINE
builder.Services
  .AddAuthentication(options =>
  {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme; // 關鍵
  })
  .AddCookie()
  .AddLine(LineAuthenticationDefaults.AuthenticationScheme, "LINE 帳號登入", options =>
  {
      options.ClientId = builder.Configuration["LineLogin:ChannelId"];
      options.ClientSecret = builder.Configuration["LineLogin:ChannelSecret"];
      options.CallbackPath = "/signin-line";

      // 要求的 scope
      options.Scope.Clear();
      options.Scope.Add("openid");
      options.Scope.Add("profile");
      options.Scope.Add("email"); // 若你的 Channel 已開通 email

      // Claim 對應（領幣/綁定需要）
      options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
      options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");           // 若 LINE 回來有 name
      options.ClaimActions.MapJsonKey("urn:line:userid", "sub");          // 重要：LINE userId

      options.SaveTokens = true;

      // 修正 redirect_uri（代理/多網域）
      options.Events.OnRedirectToAuthorizationEndpoint = ctx =>
      {
          var req = ctx.Request;

          // 以 X-Forwarded-* 優先
          var forwardedHost = req.Headers["X-Forwarded-Host"].ToString();
          var host = string.IsNullOrWhiteSpace(forwardedHost) ? req.Host.Value : forwardedHost;

          // 去掉標準 port
          var colon = host.IndexOf(':');
          if (colon > 0)
          {
              var port = host[(colon + 1)..];
              if (port == "443" || port == "80") host = host[..colon];
          }

          // www → 裸網域（避免 301 造成 state 不符）
          if (host.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
              host = host[4..];

          // 以 https + 正確 host 組出 callback
          var finalCallback = $"https://{host}{options.CallbackPath}";

          // 重組 Query：換掉 redirect_uri，拿掉 prompt，視需要再加
          var ub = new UriBuilder(ctx.RedirectUri);
          var parsed = QueryHelpers.ParseQuery(ub.Query);
          var pairs = new List<KeyValuePair<string, string>>();
          foreach (var kv in parsed)
          {
              if (kv.Key.Equals("redirect_uri", StringComparison.OrdinalIgnoreCase)) continue;
              if (kv.Key.Equals("prompt", StringComparison.OrdinalIgnoreCase)) continue;
              foreach (var v in kv.Value) pairs.Add(new(kv.Key, v));
          }
          pairs.Add(new("redirect_uri", finalCallback));

          // 支援 forceEmail：需要時強制彈出同意（把 Items["force_email"]="1" 或 ?forceEmail=1）
          var forceEmail = req.Query.TryGetValue("forceEmail", out var qv) && string.Equals(qv, "1", StringComparison.OrdinalIgnoreCase);
          if (ctx.Properties?.Items?.TryGetValue("force_email", out var flag) == true && flag == "1") forceEmail = true;
          if (forceEmail)
          {
              pairs.RemoveAll(p => p.Key.Equals("prompt", StringComparison.OrdinalIgnoreCase));
              pairs.Add(new("prompt", "consent"));
              pairs.RemoveAll(p => p.Key.Equals("ui_locales", StringComparison.OrdinalIgnoreCase));
              pairs.Add(new("ui_locales", "zh-TW"));
          }

          ub.Query = string.Join("&", pairs.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

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

// CookiePolicy（搭配 SameSite=None）
app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    Secure = CookieSecurePolicy.Always
});

// 1) Forwarded Headers
app.UseForwardedHeaders();

// 1.5) 正規化中介軟體（避免回呼被 301 或被改協議）
app.Use(async (ctx, next) =>
{
    // 若代理告知 https，就把 Scheme 設為 https（影響組 URL）
    if (ctx.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto)
        && string.Equals(proto, "https", StringComparison.OrdinalIgnoreCase))
    {
        ctx.Request.Scheme = "https";
    }

    // 回呼 /signin-* 不做 www→裸網域的 301，以免丟失 code/state
    var pathLower = ctx.Request.Path.Value?.ToLowerInvariant() ?? "";
    var isOAuthCallback = pathLower.StartsWith("/signin-");

    if (!isOAuthCallback &&
        ctx.Request.Host.HasValue &&
        ctx.Request.Host.Value.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
    {
        var target = $"https://{ctx.Request.Host.Value[4..]}{ctx.Request.PathBase}{ctx.Request.Path}{ctx.Request.QueryString}";
        ctx.Response.Redirect(target, permanent: true);
        return;
    }

    await next();
});

// 2) HTTPS 重導
app.UseHttpsRedirection();

// 3) 本地化
var supportedCultures = new[] { "en-us", "zh-tw", "th-th" };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("zh-tw"),
    SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList(),
    SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList()
});

// 4) 靜態檔
app.UseStaticFiles();

// 5) Routing
app.UseRouting();

// 6) CORS
app.UseCors("AllowAll");

// 7) Auth
app.UseAuthentication();
app.UseAuthorization();

// 8) Session
app.UseSession();

// 9) 路由
// ★ 健康檢查端點：讓 Cloudflare / 監測工具確認子站是否啟動成功
app.MapGet("/healthz", () => Results.Ok("OK"));

app.MapControllerRoute(
    name: "default",
    pattern: "{area=Customer}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "areaRoute",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "claimShortcut",
    pattern: "Wallet/Claim",
    defaults: new { area = "Customer", controller = "Wallet", action = "Claim" });

app.MapRazorPages();

// 把任何 /Account/Login 都導到我們的入口（保留 ReturnUrl）
app.MapGet("/Account/Login", async ctx =>
{
    var returnUrl = ctx.Request.Query["ReturnUrl"].ToString();
    var safe = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl;
    var url = $"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(safe)}";
    ctx.Response.Redirect(url);
});

app.MapControllers();
// ★ 啟動期的 DB 遷移防護：避免 DB 一卡就 500.30
using (var scope = app.Services.CreateScope())
{
    try
    {
        scope.ServiceProvider.GetRequiredService<IDbInitializer>().Initialize();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate(); // 若上線階段不想風險，可改 EnsureCreated 或移到背景服務
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[Startup-Migrate] {ex}"); // 建議改記 Serilog
        // 不 throw 讓網站先起來；再人工處理 DB
    }
}

app.Run();
