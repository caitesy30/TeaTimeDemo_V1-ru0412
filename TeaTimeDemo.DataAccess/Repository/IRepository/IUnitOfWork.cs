//IUnitOfWork.cs

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.Models;


namespace TeaTimeDemo.DataAccess.Repository.IRepository
{
    public interface IUnitOfWork : IDisposable
    {
        ICategoryRepository Category { get; }

        IProductRepository Product { get; }

        IStoreRepository Store { get; }

        IShoppingCartRepository ShoppingCart { get; }

        IApplicationUserRepository ApplicationUser { get; }

        IOrderHeaderRepository OrderHeader { get; }

        IOrderDetailRepository OrderDetail { get; }

        IStationRepository Station { get; }

        // 新增問卷相關的 Repository
        ISurveyRepository Survey { get; }
        IQuestionRepository Question { get; }
        IAnswerRepository Answer { get; }
        IAnswerOptionRepository AnswerOption { get; }
        IQuestionImageRepository QuestionImage { get; }
       // IRepository<QuestionImage> QuestionImage { get; }
        IQuestionOptionRepository QuestionOption { get; }

        IFillInBlankRepository FillInBlank { get; }

        ISurveyGroupRepository SurveyGroup { get; }
        ISurveyToGroupRepository SurveyToGroup { get; }
        ILayerRepository Layer { get; }
        IBlankSurveyRepository BlankSurvey { get; }


        //Answered
        IAnsweredNotesRepository AnsweredNotes { get; }
        IAnsweredProcessRepository AnsweredProcess{ get; }
        IAnsweredPageRepository AnsweredPage { get; }
        IAnsweredSurveyRepository AnsweredSurvey { get; }
        ILanguageRepository Language { get; }

        IModuleBlockRepository ModuleBlock { get; }
        INotesModifyRepository NotesModify { get; }

        // 加上這行，把內部的 ApplicationDbContext 暴露出去
        ApplicationDbContext DbContext { get; }

        IRepository<DocumentExport> DocumentExport { get; }

        IRepository<HtmlSection> HtmlSection { get; }

        IRepository<KnowledgeEntry> KnowledgeEntry { get; }

        IRepository<Point> Point { get; }
        IRepository<UserPointBalance> UserPointBalance { get; }

        void Save();
        // void DeleteEntity();

        Task SaveAsync();

        void SaveChanges();
    }
}
