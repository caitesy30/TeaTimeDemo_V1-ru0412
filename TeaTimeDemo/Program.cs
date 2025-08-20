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
using Microsoft.AspNetCore.WebUtilities;       // QueryHelpers
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Proxies;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
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

// (A) Forwarded Headers
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
    opts.User.RequireUniqueEmail = false;
    opts.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
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
    opts.Cookie.SameSite = SameSiteMode.None;
    opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opts.Cookie.HttpOnly = true;

    // 若你同時要 www 與裸網域共用 Cookie，可開啟下行（建議仍以方案A為主，不一定要開這個）
    //opts.Cookie.Domain = ".caitesy.com";

    // ★★★ 這裡是關鍵：未登入統一導到我們的登入入口（再由入口去 Challenge LINE）
    opts.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx =>
        {
            var lower = (ctx.Request.Path.Value ?? "").ToLowerInvariant();
            // ✅ OAuth 回呼不可再次重導，否則會形成 authorize 迴圈
            if (lower.StartsWith("/signin-"))
            {
                ctx.Response.StatusCode = 401;
                return Task.CompletedTask;
            }

            // 原始請求完整路徑 + Query
            var path = (ctx.Request.Path.HasValue ? ctx.Request.Path.Value! : "/") + ctx.Request.QueryString.Value;

            // 避免回登出頁
            if (lower == "/identity/account/logout")
                path = "/Customer/Wallet/Index";

            // ✅ 改成導到我們的入口（保留 returnUrl/rid）
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

// 其他 Cookie（Antiforgery）
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

// (9) ★ 認證：把 DefaultChallengeScheme 改回 Cookies（不要全域自動丟 LINE）
builder.Services
  .AddAuthentication(options =>
  {
      options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      // ✅ 保持 DefaultChallengeScheme = Cookies（讓我們自行導去 LINE）
      options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
  })
  .AddCookie()
  .AddLine(LineAuthenticationDefaults.AuthenticationScheme, "LINE 帳號登入", options =>
  {
      options.ClientId = builder.Configuration["LineLogin:ChannelId"];
      options.ClientSecret = builder.Configuration["LineLogin:ChannelSecret"];
      options.CallbackPath = "/signin-line";

      options.Scope.Clear();
      options.Scope.Add("profile");
      options.Scope.Add("openid");
      // 若你的 Channel 有開 email 權限才加
      options.Scope.Add("email");
      options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");

      options.SaveTokens = true;

      // 強制把 redirect_uri 換成 https + 正確 Host（去掉 :443/:80）
      options.Events.OnRedirectToAuthorizationEndpoint = ctx =>
      {
          var req = ctx.Request;

          var forwardedHost = req.Headers["X-Forwarded-Host"].ToString();
          var host = string.IsNullOrWhiteSpace(forwardedHost) ? req.Host.Value : forwardedHost;

          var colon = host.IndexOf(':');
          if (colon > 0)
          {
              var port = host[(colon + 1)..];
              if (port == "443" || port == "80") host = host[..colon];
          }

          // ⭐ 若是 www.，換成裸網域，避免 301 造成 state 對不上
          if (host.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
          {
              host = host.Substring(4);
          }

          var finalCallback = $"https://{host}{options.CallbackPath}";

          // 解析目前 RedirectUri 並替換 redirect_uri 參數
          var ub = new UriBuilder(ctx.RedirectUri);
          var parsed = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(ub.Query);
          var pairs = new List<KeyValuePair<string, string>>();
          foreach (var kv in parsed)
          {
              // 固定改 redirect_uri；同時忽略原本的 prompt
              if (kv.Key.Equals("redirect_uri", StringComparison.OrdinalIgnoreCase)) continue;
              if (kv.Key.Equals("prompt", StringComparison.OrdinalIgnoreCase)) continue;
              foreach (var v in kv.Value) pairs.Add(new(kv.Key, v));
          }
          pairs.Add(new("redirect_uri", finalCallback));

          // 支援 ?forceEmail=1：強制同意畫面（補抓 Email）
          var forceEmail = req.Query.TryGetValue("forceEmail", out var qv) && string.Equals(qv, "1", StringComparison.OrdinalIgnoreCase);
          if (ctx.Properties?.Items?.TryGetValue("force_email", out var flag) == true && flag == "1") forceEmail = true;
          if (forceEmail)
          {
              pairs.RemoveAll(p => p.Key.Equals("prompt", StringComparison.OrdinalIgnoreCase));
              pairs.Add(new("prompt", "consent"));
              pairs.RemoveAll(p => p.Key.Equals("ui_locales", StringComparison.OrdinalIgnoreCase));
              pairs.Add(new("ui_locales", "zh-TW"));
          }

          ub.Query = string.Join("&", pairs.Select(kv =>
              $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

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

// 1. Forwarded Headers
app.UseForwardedHeaders();

// 強制 https（配合代理）
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && proto == "https")
    {
        ctx.Request.Scheme = "https";
    }

    // ⭐ 回呼路徑 /signin-* 不要做 301 正規化（避免丟 code/state）
    var pathLower = ctx.Request.Path.Value?.ToLowerInvariant() ?? "";
    var isOAuthCallback = pathLower.StartsWith("/signin-");

    // （可選）主機名正規化：把 www 301 到裸網域，避免 cookie 掉在不同 host
    if (!isOAuthCallback &&
        ctx.Request.Host.HasValue &&
        ctx.Request.Host.Value.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
    {
        var target = $"https://{ctx.Request.Host.Value.Substring(4)}{ctx.Request.PathBase}{ctx.Request.Path}{ctx.Request.QueryString}";
        ctx.Response.Redirect(target, permanent: true);
        return;
    }

    await next();
});

// 2. HTTPS
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

// 7. Auth
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

app.MapControllerRoute(
    name: "claimShortcut",
    pattern: "Wallet/Claim",
    defaults: new { area = "Customer", controller = "Wallet", action = "Claim" });

app.MapRazorPages();

// 讓任何誤打 /Account/Login 的地方，也一致導到入口（保留 ReturnUrl）
app.MapGet("/Account/Login", async ctx =>
{
    var returnUrl = ctx.Request.Query["ReturnUrl"].ToString();
    var safe = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl;
    var url = $"/Customer/LiffAuthEntry/Login?returnUrl={Uri.EscapeDataString(safe)}";
    ctx.Response.Redirect(url);
});

app.MapControllers();

// 10. Database Seed/Migrate
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<IDbInitializer>().Initialize();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

app.Run();
