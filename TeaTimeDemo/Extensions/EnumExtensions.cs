// Extensions/EnumExtensions.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace TeaTimeDemo.Extensions
{
    public static class EnumExtensions
    {
        public static T GetAttribute<T>(this Enum enumValue)
            where T : Attribute
        {
            return enumValue.GetType()
                            .GetMember(enumValue.ToString())
                            .FirstOrDefault()
                            ?.GetCustomAttribute<T>();
        }
    }
}
