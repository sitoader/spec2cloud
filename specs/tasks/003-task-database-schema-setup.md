# Task 003: Database Schema and Entity Framework Core Setup

**Feature**: Data Infrastructure  
**Dependencies**: Task 001 (Backend Scaffolding)  
**Estimated Complexity**: Medium

---

## Description

Design and implement the complete database schema for the Book Tracker application using Entity Framework Core code-first migrations. Set up all domain entities, relationships, and database context configuration.

---

## Technical Requirements

### Domain Entities

Create entity classes in `BookTracker.Core/Entities/`:

#### **ApplicationUser.cs**
```csharp
public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    
    // Navigation properties
    public ICollection<Book> Books { get; set; } = new List<Book>();
    public UserPreferences? Preferences { get; set; }
}
```

#### **Book.cs**
```csharp
public class Book
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
    public string? Isbn { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public string? Genres { get; set; } // JSON array stored as string
    public DateTime? PublicationDate { get; set; }
    public required BookStatus Status { get; set; }
    public DateTime AddedDate { get; set; }
    public string? Source { get; set; } // "google-books", "open-library", "manual"
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Rating? Rating { get; set; }
}

public enum BookStatus
{
    ToRead = 0,
    Reading = 1,
    Completed = 2
}
```

#### **Rating.cs**
```csharp
public class Rating
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public int Score { get; set; } // 1-5 stars
    public string? Notes { get; set; } // Max 1000 characters
    public DateTime RatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    
    // Navigation property
    public Book Book { get; set; } = null!;
}
```

#### **UserPreferences.cs**
```csharp
public class UserPreferences
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public string? PreferredGenres { get; set; } // JSON array
    public string? PreferredThemes { get; set; } // JSON array
    public string? FavoriteAuthors { get; set; } // JSON array
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    
    // Navigation property
    public ApplicationUser User { get; set; } = null!;
}
```

### Database Context Configuration

Update `ApplicationDbContext` in `BookTracker.Infrastructure/Data/`:

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

### Entity Configurations

Create configuration classes in `BookTracker.Infrastructure/Data/Configurations/`:

#### **BookConfiguration.cs**
- Table name: "Books"
- Primary key: Id (Guid)
- Required fields: Title (max 500), Author (max 200), Status
- Optional fields: Isbn (max 20), CoverImageUrl (max 500), Description (max 2000)
- Indexes:
  - Non-clustered index on UserId
  - Composite index on (UserId, Title) for duplicate detection
  - Index on Status for filtering
- Foreign key: UserId → AspNetUsers(Id) with cascade delete
- One-to-one relationship with Rating (cascade delete)

#### **RatingConfiguration.cs**
- Table name: "Ratings"
- Primary key: Id (Guid)
- Required fields: BookId, Score (check constraint 1-5)
- Optional fields: Notes (max 1000 characters)
- Foreign key: BookId → Books(Id) with cascade delete
- Index on BookId (unique)

#### **UserPreferencesConfiguration.cs**
- Table name: "UserPreferences"
- Primary key: Id (Guid)
- Required fields: UserId
- Optional fields: PreferredGenres, PreferredThemes, FavoriteAuthors
- Foreign key: UserId → AspNetUsers(Id) with cascade delete
- Index on UserId (unique)

### Initial Migration

Create initial EF Core migration:
- Migration name: "InitialCreate"
- Includes all tables: AspNetUsers, AspNetRoles, Books, Ratings, UserPreferences
- Includes all indexes and foreign key constraints

### Connection String Configuration

Configure connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=BookTrackerDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

For Azure (in appsettings.Production.json or App Service configuration):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:{server}.database.windows.net,1433;Database={database};User ID={user};Password={password};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

### Database Initialization

Create `DbInitializer` in `BookTracker.Infrastructure/Data/`:
- Apply pending migrations on startup (development only)
- Optionally seed test data for development

---

## Acceptance Criteria

- [ ] All entity classes created with proper properties and data annotations
- [ ] `ApplicationUser` extends `IdentityUser` with custom properties
- [ ] All entities have navigation properties correctly configured
- [ ] Entity configurations use Fluent API (not data annotations) for complex rules
- [ ] All required fields have `[Required]` or `required` keyword
- [ ] String fields have max length constraints
- [ ] `BookStatus` enum defined with meaningful values (ToRead, Reading, Completed)
- [ ] Rating score has check constraint limiting values to 1-5
- [ ] All foreign keys configured with appropriate cascade delete behavior
- [ ] Indexes created on UserId, Status, and composite (UserId, Title)
- [ ] `ApplicationDbContext` includes DbSets for all entities
- [ ] Initial migration created successfully with all tables and relationships
- [ ] Migration applies successfully to local database
- [ ] Database created with correct schema (verify with SQL Server Object Explorer)
- [ ] No orphaned columns or tables from previous migrations
- [ ] Connection string configured for both local and Azure SQL Database

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Project**: `BookTracker.Infrastructure.Tests`

**Test Cases**:

1. **Entity Validation**:
   - Book with required fields creates successfully
   - Book without title throws validation exception
   - Book without author throws validation exception
   - Rating score outside 1-5 range fails validation
   
2. **Relationships**:
   - Book belongs to ApplicationUser (foreign key enforced)
   - Rating belongs to Book (foreign key enforced)
   - UserPreferences belongs to ApplicationUser (foreign key enforced)
   - Deleting user cascades to Books, Ratings, Preferences
   - Deleting book cascades to Rating
   
3. **Configuration**:
   - Books table has correct indexes (UserId, Status, composite)
   - Ratings table has unique constraint on BookId
   - String fields have max length constraints applied
   - Required fields are non-nullable in database schema

### Integration Tests

**Test Cases**:

1. **Database Creation**:
   - Migration applies successfully to empty database
   - All tables created with correct schema
   - All indexes and constraints created
   
2. **CRUD Operations**:
   - Insert ApplicationUser succeeds
   - Insert Book with valid UserId succeeds
   - Insert Book with invalid UserId fails (foreign key violation)
   - Insert Rating with valid BookId succeeds
   - Insert duplicate Rating for same BookId fails (unique constraint)
   - Update Book fields succeeds
   - Delete User cascades to Books and Ratings
   
3. **Query Performance**:
   - Query books by UserId uses index (verify execution plan)
   - Filter books by Status uses index
   - Duplicate detection query on (UserId, Title) uses composite index

---

## Implementation Notes

- Use `required` keyword for non-nullable reference types (C# 11 feature)
- Enable nullable reference types in all projects
- Store JSON arrays as strings (use `System.Text.Json` for serialization)
- Use `Guid` for all primary keys (better for distributed systems)
- Use `DateTime` for all timestamps (UTC in application logic)
- Configure cascade delete carefully to avoid accidental data loss
- Use Fluent API in separate configuration classes for cleaner code
- Apply migrations programmatically in development, use migration scripts in production
- Consider adding `CreatedDate` and `UpdatedDate` to all entities for audit trail
- Use indexes strategically (avoid over-indexing)
- Test cascade deletes thoroughly to ensure data integrity

### Example Entity Configuration

```csharp
public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Books");
        builder.HasKey(b => b.Id);
        
        builder.Property(b => b.Title).IsRequired().HasMaxLength(500);
        builder.Property(b => b.Author).IsRequired().HasMaxLength(200);
        builder.Property(b => b.Isbn).HasMaxLength(20);
        builder.Property(b => b.CoverImageUrl).HasMaxLength(500);
        builder.Property(b => b.Description).HasMaxLength(2000);
        
        builder.HasIndex(b => b.UserId);
        builder.HasIndex(b => new { b.UserId, b.Title });
        builder.HasIndex(b => b.Status);
        
        builder.HasOne(b => b.User)
               .WithMany(u => u.Books)
               .HasForeignKey(b => b.UserId)
               .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(b => b.Rating)
               .WithOne(r => r.Book)
               .HasForeignKey<Rating>(r => r.BookId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
```

---

## Definition of Done

- [ ] All entity classes created and tested
- [ ] All entity configurations created with Fluent API
- [ ] Initial migration created and applied to local database
- [ ] Database schema verified in SQL Server Object Explorer
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Foreign key relationships work correctly
- [ ] Cascade deletes function as expected
- [ ] Indexes improve query performance (verified with execution plans)
- [ ] Code follows EF Core best practices
- [ ] Code reviewed and approved
