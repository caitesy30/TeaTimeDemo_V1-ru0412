using Microsoft.Extensions.Localization;

namespace TeaTimeDemo.Resources
{
    public class SharedResource
    {
        private readonly IStringLocalizer _localizer;
        public SharedResource(IStringLocalizer localizer)
        {
            _localizer = localizer;
        }
    }
}
