// DataAccess/Repository/IRepository/IModuleBlockRepository.cs
using System;
using System.Linq.Expressions;
using TeaTimeDemo.Models.AnswersData;

namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface IModuleBlockRepository
    {
        ModuleBlock GetFirstOrDefault(Expression<Func<ModuleBlock, bool>> filter);
        void Add(ModuleBlock moduleBlock); // 新增 Add 方法
        void Update(ModuleBlock moduleBlock);
        // 您可以根據需求添加更多方法
    }
}
