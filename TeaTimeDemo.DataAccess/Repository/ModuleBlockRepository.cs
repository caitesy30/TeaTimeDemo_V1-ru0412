// DataAccess/Repository/ModuleBlockRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models.AnswersData;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class ModuleBlockRepository : IModuleBlockRepository
    {
        // 模擬資料庫中的 ModuleBlocks
        private readonly List<ModuleBlock> _moduleBlocks;

        public ModuleBlockRepository()
        {
            _moduleBlocks = new List<ModuleBlock>();
        }

        public ModuleBlock GetFirstOrDefault(Expression<Func<ModuleBlock, bool>> filter)
        {
            return _moduleBlocks.AsQueryable().FirstOrDefault(filter);
        }

        public void Add(ModuleBlock moduleBlock)
        {
            _moduleBlocks.Add(moduleBlock);
        }

        public void Update(ModuleBlock moduleBlock)
        {
            var existingModule = _moduleBlocks.FirstOrDefault(m => m.Id == moduleBlock.Id);
            if (existingModule != null)
            {
                existingModule.TextContent = moduleBlock.TextContent;
                existingModule.CheakBoxData = moduleBlock.CheakBoxData;
                // 更新其他屬性
            }
        }

        // 其他方法根據需要實作
    }
}
