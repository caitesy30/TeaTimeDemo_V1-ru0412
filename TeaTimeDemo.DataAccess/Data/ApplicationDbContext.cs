using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.Linq.Expressions;
using TeaTimeDemo.Models;



namespace TeaTimeDemo.DataAccess.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        // 新增一個標誌，用於指示是否執行物理刪除
        public bool IsHardDelete { get; set; } = false;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<OrderHeader> OrderHeaders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Station> Stations { get; set; }
        public DbSet<Survey> Surveys { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<QuestionImage> QuestionImages { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<SurveyGroup> SurveyGroups { get; set; }
        public DbSet<SurveyToGroup> SurveyToGroups { get; set; }
        public DbSet<FillInBlank> FillInBlanks { get; set; }

        public DbSet<Layer> Layers{ get; set; }

        public DbSet<AnsweredNotes> AnsweredNotes { get; set; }
        public DbSet<AnsweredProcess> AnsweredProcess { get; set; }
        public DbSet<AnsweredPage> AnsweredPages { get; set; }
        public DbSet<AnsweredSurvey> AnsweredSurveys { get; set; }

        public DbSet<NotesModify> NotesModifies { get; set; }

        // === 新增這行 ===
        public DbSet<DocumentExport> DocumentExports { get; set; }
        public DbSet<HtmlSection> HtmlSections { get; set; }

        // 新增：儲存問卷答案的表
        public DbSet<SurveyAnswerExport> SurveyAnswerExports { get; set; }
        public DbSet<SurveyAnswerHtmlSection> SurveyAnswerHtmlSections { get; set; }

        public DbSet<MtNumAnswered> MtNumAnswereds { get; set; }


        public DbSet<BlankSurvey> BlankSurveys { get; set; }

        public DbSet<KnowledgeEntry> KnowledgeEntries { get; set; }

        //=== 新增的錢包資料表 ===
        public DbSet<Point> Points { get; set; }
        public DbSet<UserPointBalance> UserPointBalances { get; set; }

        /// <summary>
        /// 覆寫 SaveChanges 方法，實現軟刪除邏輯
        /// </summary>
        /// <returns>影響的資料列數</returns>
        public override int SaveChanges()
        {
            HandleSoftDelete();
            return base.SaveChanges();
        }


        /// <summary>
        /// 覆寫 SaveChangesAsync 方法，實現軟刪除邏輯
        /// </summary>
        /// <param name="cancellationToken">取消標記</param>
        /// <returns>影響的資料列數的 Task</returns>
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            HandleSoftDelete();
            return await base.SaveChangesAsync(cancellationToken);
        }

        /// <summary>
        /// 處理軟刪除邏輯
        /// </summary>
        private void HandleSoftDelete()
        {
            if (!IsHardDelete) // 只有在不是物理刪除時，才執行軟刪除
            {
                foreach (var entry in ChangeTracker.Entries<BaseEntity>())
                {
                    if (entry.State == EntityState.Deleted)
                    {
                        // 執行軟刪除
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedAt = DateTime.Now;
                    }
                }
            }
        }


        /// <summary>
        /// 設定模型的行為，包括全域查詢過濾器
        /// </summary>
        /// <param name="modelBuilder">模型建構器</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            // 遍歷模型中的所有實體類型
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // 檢查該實體類型是否實現了 ISoftDeletable 接口
                if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
                {
                    // 創建一個參數，這個參數代表實體類型，用來在查詢過濾器中使用
                    var parameter = Expression.Parameter(entityType.ClrType, "e");

                    // 獲取 Entity Framework 中的 Property 方法，並將其泛型設置為 bool
                    var propertyMethodInfo = typeof(EF).GetMethod("Property").MakeGenericMethod(typeof(bool));

                    // 調用 Property 方法來獲取 IsDeleted 屬性
                    var isDeletedProperty = Expression.Call(propertyMethodInfo, parameter, Expression.Constant("IsDeleted"));

                    // 創建一個比較表達式，判斷 IsDeleted 是否為 false
                    var compareExpression = Expression.Equal(isDeletedProperty, Expression.Constant(false));

                    // 將比較表達式包裝為 Lambda 表達式
                    var lambda = Expression.Lambda(compareExpression, parameter);

                    // 為該實體類型設置全域查詢過濾器，過濾條件為 IsDeleted 為 false
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
           

            // 預先載入的數據
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "硬板", DisplayOrder = 1 },
                new Category { Id = 2, Name = "汽車板", DisplayOrder = 2 },
                new Category { Id = 3, Name = "軟硬板", DisplayOrder = 3 }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "台灣水果茶",
                    Size = "大杯",
                    Description = "天然果飲，迷人多變",
                    Price = 60,
                    CategoryId = 1,
                    ImageUrl = ""
                },
                new Product
                {
                    Id = 2,
                    Name = "鐵觀音",
                    Size = "中杯",
                    Description = "品鐵觀音，享人生的味道",
                    Price = 35,
                    CategoryId = 2,
                    ImageUrl = ""
                },
                new Product
                {
                    Id = 3,
                    Name = "美式咖啡",
                    Size = "中杯",
                    Description = "用咖啡體悟悠閒時光",
                    Price = 50,
                    CategoryId = 3,
                    ImageUrl = ""
                }
            );

            modelBuilder.Entity<Store>().HasData(
                new Store
                {
                    Id = 1,
                    Name = "上海展華電子有限公司",
                    Address = "江蘇省南通高新區希望大道99號",
                    City = "南通",
                    PhoneNumber = "0513-86866000",
                    Description = "塑造展華優質企業文化，以人為本，以誠信負責為基石"
                },
                new Store
                {
                    Id = 2,
                    Name = "燿華宜蘭廠區",
                    Address = "宜蘭縣蘇澳鎮頂寮里頂平路36號",
                    City = "蘇澳鎮",
                    PhoneNumber = "(03)970 5818",
                    Description = "經營團隊秉持「積極創新、團結和諧、客戶導向、謹守誠信」的經營理念"
                },
                new Store
                {
                    Id = 3,
                    Name = "燿華泰國廠區",
                    Address = "泰國",
                    City = "未知",
                    PhoneNumber = "未知",
                    Description = "積極創新、團結和諧、客戶導向、謹守誠信"
                },
                new Store
                {
                    Id = 4,
                    Name = "燿華土城廠區",
                    Address = "新北市土城區中山路4巷3號",
                    City = "土城",
                    PhoneNumber = "(02)2268 5071",
                    Description = "積極創新、團結和諧、客戶導向、謹守誠信"
                }
            );
            modelBuilder.Entity<Layer>().HasData(
                new Layer
                {   
                    Id = 1,
                    Name = "PNL",
                    Order = 1,
                },
                new Layer
                {
                    Id = 2,
                    Name = "內層",
                    Order = 2,
                },
                new Layer
                {
                    Id = 3,
                    Name = "外層",
                    Order = 3,
                },
                new Layer
                {
                    Id = 4,
                    Name = "印字",
                    Order = 4,
                },
                new Layer
                {
                    Id = 5,
                    Name = "防焊",
                    Order = 5,
                },
                new Layer
                {
                    Id = 6,
                    Name = "其他",
                    Order = 6,
                }
            );
            // 設定 Answer 與 AnswerOption 的關聯
            modelBuilder.Entity<Answer>()
                .HasMany(a => a.SelectedOptions)
                .WithOne(ao => ao.Answer)
                .HasForeignKey(ao => ao.AnswerId)
                .OnDelete(DeleteBehavior.Cascade);  // 當刪除 Answer 時，刪除關聯的 AnswerOption

            // 設定 AnswerOption 與 QuestionOption 的關聯
            modelBuilder.Entity<AnswerOption>()
                .HasOne(ao => ao.QuestionOption)
                .WithMany(qo => qo.AnswerOptions)
                .HasForeignKey(ao => ao.QuestionOptionId)
                .OnDelete(DeleteBehavior.NoAction);  // 避免多重級聯刪除

            // 防止其他表的多重級聯刪除問題
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Survey)
                .WithMany(s => s.Questions)
                .HasForeignKey(q => q.SurveyId)
                .OnDelete(DeleteBehavior.Cascade);  // 問卷刪除時，問題一起刪除

            // 配置 Question 与 QuestionOption 的关联
            modelBuilder.Entity<Question>()
                .HasMany(q => q.QuestionOptions)
                .WithOne(qo => qo.Question)
                .HasForeignKey(qo => qo.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<QuestionImage>()
                .HasOne(qi => qi.Survey)  // Survey 可以有圖片，但不設置級聯刪除
                .WithMany(s => s.QuestionImages)
                .HasForeignKey(qi => qi.SurveyId)
                .OnDelete(DeleteBehavior.Restrict);  // 取消對 SurveyId 的級聯刪除，改為手動刪除

            // 配置 Question 与 QuestionImage 的关联
            modelBuilder.Entity<QuestionImage>()
                .HasOne(qi => qi.Question)
                .WithMany(q => q.QuestionImages)
                .HasForeignKey(qi => qi.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);  // 問題刪除時，圖片一起刪除

            modelBuilder.Entity<QuestionOption>()
                .HasOne(qo => qo.Question)
                .WithMany(q => q.QuestionOptions)
                .HasForeignKey(qo => qo.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);  // 問題刪除時，選項一起刪除

            modelBuilder.Entity<QuestionOption>()
                .HasMany(qo => qo.QuestionImages)
                .WithOne(qi => qi.QuestionOption)
                .HasForeignKey(qi => qi.QuestionOptionId)
                .OnDelete(DeleteBehavior.Cascade);


            // 設定 FillInBlank 與 QuestionOption 的關聯
            modelBuilder.Entity<FillInBlank>()
                .HasOne(f => f.QuestionOption)
                .WithMany(qo => qo.FillInBlanks)
                .HasForeignKey(f => f.QuestionOptionId)
                .OnDelete(DeleteBehavior.Cascade); // 當刪除 QuestionOption 時，相關的 FillInBlanks 也會被刪除


            //SurveyGroup與Survey關聯，一對多
            modelBuilder.Entity<SurveyToGroup>()
                .HasKey(stg => stg.Id);

            modelBuilder.Entity<SurveyToGroup>()
                .HasOne(stg => stg.SurveyGroup)
                .WithMany(sg => sg.SurveyToGroups)
                .HasForeignKey(stg => stg.SurveyGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SurveyToGroup>()
                .HasOne(stg => stg.Survey)
                .WithMany(s => s.SurveyToGroups)
                .HasForeignKey(stg => stg.SurveyId)
                .OnDelete(DeleteBehavior.Restrict);//不允許問卷被刪除時連鎖刪除父級關聯

            modelBuilder.Entity<SurveyToGroup>()
                .HasOne(stg => stg.Layer)
                .WithMany(l => l.SurveyToGroups)
                .HasForeignKey(stg => stg.LayerId)
                .OnDelete(DeleteBehavior.Restrict);

     

        }
    }
}
