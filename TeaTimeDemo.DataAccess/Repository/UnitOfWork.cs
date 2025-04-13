//UnitOfWork.cs

using System.Reflection;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using System.Reflection;
using DocumentFormat.OpenXml.Wordprocessing;

namespace TeaTimeDemo.DataAccess.Repository
{
    public class UnitOfWork:IUnitOfWork
    {
        private ApplicationDbContext _db;

        // 實作介面屬性
        public ApplicationDbContext DbContext => _db;

     


        public ICategoryRepository Category { get; private set; }
        public IProductRepository Product { get; private set; }
        public IStoreRepository Store { get; private set; }
        public IShoppingCartRepository ShoppingCart { get; private set; }

        public IApplicationUserRepository ApplicationUser { get; private set; }

        public IOrderHeaderRepository OrderHeader { get; private set; }

        public IOrderDetailRepository OrderDetail { get; private set; }

        public IStationRepository Station { get; private set; }

        // 問卷相關的 Repository 實例
        public ISurveyRepository Survey { get; private set; }
        public IQuestionRepository Question { get; private set; }
        public IAnswerRepository Answer { get; private set; }
        public IAnswerOptionRepository AnswerOption { get; private set; }
        public IQuestionImageRepository QuestionImage { get; private set; }       
        public IQuestionOptionRepository QuestionOption { get; private set; }
        public ISurveyGroupRepository SurveyGroup { get; private set; }
        public ISurveyToGroupRepository SurveyToGroup { get; private set; }
        public IFillInBlankRepository FillInBlank { get; private set; }        
        public ILayerRepository Layer { get; private set; }
        public IBlankSurveyRepository BlankSurvey { get; private set; }

        //Answered
        public IAnsweredNotesRepository AnsweredNotes { get; private set; }
        public IAnsweredProcessRepository AnsweredProcess { get; private set; }
        public IAnsweredPageRepository AnsweredPage { get; private set; }
        public IAnsweredSurveyRepository AnsweredSurvey { get; private set; }
        public ILanguageRepository Language { get; private set; }

        public INotesModifyRepository NotesModify { get; private set; }

        public IModuleBlockRepository ModuleBlock { get; private set; }
        public IRepository<HtmlSection> HtmlSection { get; private set; }

        public IRepository<DocumentExport> DocumentExport { get; private set; }

        public IRepository<KnowledgeEntry> KnowledgeEntry { get; private set; }

        public IRepository<Point> Point { get; private set; }
        public IRepository<UserPointBalance> UserPointBalance { get; private set; }


        public UnitOfWork(ApplicationDbContext db)
        {
            _db = db;
            Category = new CategoryRepository(_db);
            Product = new ProductRepository(_db);
            Store = new StoreRepository(_db);
            ShoppingCart = new ShoppingCartRepository(_db);
            ApplicationUser = new ApplicationUserRepository(_db);
            OrderHeader = new OrderHeaderRepository(_db);
            OrderDetail = new OrderDetailRepository(_db);
            Station = new StationRepository(_db);

            // 初始化問卷相關的 Repository
            Survey = new SurveyRepository(_db);
            Question = new QuestionRepository(_db);
            Answer = new AnswerRepository(_db);
            AnswerOption = new AnswerOptionRepository(_db);
            QuestionImage = new QuestionImageRepository(_db);
            QuestionOption = new QuestionOptionRepository(_db);            

            SurveyToGroup = new SurveyToGroupRepository(_db);

            SurveyGroup = new SurveyGroupRepository(_db);
            FillInBlank = new FillInBlankRepository(_db);
            Layer = new LayerRepository(_db);


            // 初始化答題相關的 Repository
            AnsweredNotes = new AnsweredNotesRepository(_db);
            AnsweredProcess = new AnsweredProcessRepository(_db);
            AnsweredPage = new AnsweredPageRepository(_db);
            AnsweredSurvey = new AnsweredSurveyRepository(_db);

            ModuleBlock = new ModuleBlockRepository();
            DocumentExport = new Repository<DocumentExport>(_db);
            HtmlSection = new Repository<HtmlSection>(_db);
            BlankSurvey = new BlankSurveyRepository(_db);
            NotesModify = new NotesModifyRepository(_db);
            KnowledgeEntry=new Repository<KnowledgeEntry>(_db);

            Point=new Repository<Point>(_db);
            UserPointBalance = new Repository<UserPointBalance>(_db);
        }
        public void Save()
        {
            _db.SaveChanges();
        }

        public void SaveChanges()
        {
            _db.SaveChanges();
        }

        /// <summary>
        /// 異步保存變更
        /// </summary>
        /// <returns>保存變更的 Task</returns>
        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }

        // Dispose 方法，當不再需要 UnitOfWork 時釋放資源
        public void Dispose()
        {
            _db.Dispose();
        }


        public int GetFieldNamedId<T>(T instance)
        {
            // 獲取類型 T 的所有字段
            var field = typeof(T).GetField("Id", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);

            if (field != null)
            {
                if(field.FieldType == typeof(int))
                {
                    return (int)field.GetValue(instance);
                }
                // 返回該字段的值（針對實例字段需要提供 instance）
            }

            throw new InvalidOperationException($"Field '_A' not found in type {typeof(T)}.");
        }

        public void DeleteEntity<T>(int id) where T : class
        {
            //Repository<T>
            // var repository = UnitOfWork.GetRepository<T>();

            var repository = getClass<Repository<T>>();

            var stationToBeDeleted = repository.Get(u => GetFieldNamedId(u) == id);
            if (stationToBeDeleted == null)
            {
                return;// Json(new { success = false, Message = "刪除失敗" });
            } 
        

            repository.Remove(stationToBeDeleted);
            Save();
        }
        public T getClass<T>()
        {
            // 獲取所有字段
            var fields = this.GetType()
                             .GetFields(BindingFlags.NonPublic | BindingFlags.Instance);

            // 遍歷字段，找到匹配的類型
            foreach (var field in fields)
            {
                if (field.FieldType == typeof(T))
                {
                    return (T)field.GetValue(this);
                }
            }

            // 如果找不到匹配類型，拋出異常
            throw new InvalidOperationException($"Type {typeof(T)} is not supported.");
        }

    }
}
