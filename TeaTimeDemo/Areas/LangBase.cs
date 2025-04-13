using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Globalization;
using System.Web;


namespace TeaTimeDemo.Areas
{
    public class LangBase : Controller
    {
        ///// <summary>
        ///// 覆寫 ActionExecuting 事件
        ///// </summary>
        ///// <param name="filterContext"></param>
        //public override void OnActionExecuting(ActionExecutingContext context)
        //{
        //    // 語系名稱
        //    var langName = "";

        //    //從cookie裡讀取語言設定
        //    context.HttpContext.Request.Cookies.TryGetValue("Localization.CurrentUICulture", out langName);
        //    if (string.IsNullOrEmpty(langName) && context.HttpContext.Request.Headers.ContainsKey("Accept-Language")) 
        //    {
        //        var userLanguages = context.HttpContext.Request.Headers["Accept-Language"].ToString();
        //        if (!string.IsNullOrEmpty(userLanguages))
        //        {
        //            langName = userLanguages.Split(',')[0]; // 取第一優先語言
        //        }
        //    }

        //    //自行判斷可接受的語系名稱，不符名稱則採用預設語系
        //    if (langName != "zh-TW" && langName != "en-US")
        //    {
        //        langName = "zh-TW"; // 預設為繁體中文
        //    }

        //    // 更換語系設定
        //    Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(langName);

        //    // 把語言設定儲存到 Cookie
        //    var cookieOptions = new CookieOptions
        //    {
        //        Expires = DateTime.Now.AddMonths(1), // 儲存 1 個月
        //        Secure = true,
        //        HttpOnly = true,
        //        SameSite = SameSiteMode.Lax
        //    };
        //    context.HttpContext.Response.Cookies.Append("Localization.CurrentUICulture", langName, cookieOptions);

        //    // 設置到 ViewData（如果需要在 View 中使用）
        //    if (context.Controller is Controller controller)
        //    {
        //        controller.ViewData["_Language"] = langName;
        //    }

        //    base.OnActionExecuting(context);

        //}

        public IActionResult ChangeLanguage(string lang)
        {
            Response.Cookies.Append(
                "lang",
                lang,
                new CookieOptions { Expires = DateTime.UtcNow.AddYears(1) }
            );
            return Redirect(Request.Headers["Referer"].ToString());
        }
    }
}

