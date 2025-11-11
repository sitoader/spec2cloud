# ADR-0003: Database Selection

**Date**: 2025-11-11  
**Status**: Proposed

## Context

We need to select a database for storing all application data including user accounts, book libraries, ratings, notes, preferences, and recommendation history. The database must support:

**Data Model** (from FRDs):
- **User accounts**: Email, password hash, profile data (FRD-005)
- **Books**: Title, author, cover URL, description, genres, metadata, status (Read/TBR) (FRD-001)
- **Ratings**: Numeric ratings (1-5 stars), notes/reviews, timestamps (FRD-003)
- **Preferences**: Genres, themes, favorite authors (arrays/lists) (FRD-003)
- **Relationships**: One user → many books, books have ratings/notes

**Requirements** (from PRD/FRDs):
- **Data consistency**: Strong consistency for user auth and library operations
- **Performance**: Library loads <2 seconds with 500 books, queries <1 second
- **Transactions**: Ensure data integrity (e.g., user registration, book additions)
- **Scalability**: Handle up to 500 books per user, potentially thousands of users
- **Azure deployment**: Native Azure hosting for simplicity
- **Cost efficiency**: Optimize for development and initial deployment costs
- **Simplicity-first**: Avoid over-engineering for MVP

**Data Characteristics**:
- Primarily structured, relational data (users own books, books have ratings)
- Modest data volume per user (hundreds of books, not millions)
- Read-heavy for library views, write-moderate for ratings/notes
- No global distribution requirements initially (single region acceptable)
- No extreme latency requirements (<10ms not needed, <1s sufficient)

## Decision Drivers

- **Data model fit**: How well does the schema match our relational data?
- **Consistency guarantees**: Strong consistency needed for auth and library integrity
- **Query capabilities**: Can we efficiently filter/sort books by genre, rating, status?
- **Azure integration**: Native services, deployment simplicity, tooling support
- **Developer experience**: ORM support, migrations, type-safety with EF Core
- **Performance**: Adequate for 500-book libraries, low latency for queries
- **Cost**: Reasonable for MVP and early growth (avoid over-provisioning)
- **Simplicity**: Minimal operational overhead, clear patterns
- **Scalability path**: Can grow with user base without major refactoring

## Considered Options

### Option 1: Azure SQL Database

**Description**: Fully managed SQL Server database service in Azure, with built-in high availability, backups, and scaling.

**Pros**:
- **Perfect data model fit**: Relational data with foreign keys, joins, transactions
- **Strong consistency**: ACID transactions guarantee data integrity
- **Powerful querying**: SQL provides rich filtering, sorting, aggregation (critical for library views)
- **Excellent Azure integration**: Native service, automatic backups, built-in monitoring
- **Entity Framework Core**: First-class ORM support with type-safe LINQ queries, migrations
- **Proven technology**: Mature, battle-tested, well-understood
- **Developer tools**: Excellent tooling (SSMS, Azure Data Studio, VS integration)
- **Security**: Built-in encryption, row-level security, Azure AD integration
- **Serverless option**: Pay-per-use pricing for low initial costs
- **Easy scaling**: Can scale up/down compute and storage independently
- **Performance**: Sub-second queries for our data volumes, indexing strategies well-understood

**Cons**:
- **Relational overhead**: Schema migrations required, less flexible than NoSQL for schema changes
- **Cost at scale**: Can become expensive at high throughput (though serverless mitigates for MVP)
- **Single-region by default**: Multi-region requires additional setup (not needed for v1)
- **Less trendy**: Perceived as "traditional" compared to NoSQL (but fits our needs)

### Option 2: Azure Cosmos DB (NoSQL API)

**Description**: Globally distributed, multi-model NoSQL database with multiple consistency levels and APIs.

**Pros**:
- **Global distribution**: Multi-region writes/reads out of the box (overkill for v1)
- **Flexible schema**: JSON documents, easy to add fields without migrations
- **Low latency**: Single-digit millisecond latency globally (not required for our use case)
- **Horizontal scalability**: Massive scale potential (beyond our needs)
- **Multi-model**: Can store documents, graphs, key-value (we only need documents)
- **Azure-native**: Fully managed, automatic indexing, change feed

**Cons**:
- **Overkill for use case**: We don't need global distribution or extreme low latency
- **Higher cost**: More expensive than SQL Database for our workload characteristics
- **Query limitations**: No JOINs, complex queries require application-side logic or denormalization
- **Data modeling complexity**: Would need to denormalize user/book/rating relationships
- **Less natural fit**: Our data is inherently relational (users → books → ratings)
- **Consistency trade-offs**: Default eventual consistency, need to configure session/strong
- **EF Core support**: Limited compared to SQL Server (Cosmos DB provider less mature)
- **Learning curve**: Requires understanding of partition keys, RU/s provisioning

### Option 3: Azure Database for PostgreSQL

**Description**: Fully managed PostgreSQL database service in Azure.

**Pros**:
- **Relational model**: Same benefits as SQL Database for our data structure
- **JSON support**: Can store flexible data (preferences, metadata) as JSONB
- **Open source**: No licensing concerns, larger OSS community
- **Cost-effective**: Often cheaper than SQL Database for equivalent workload
- **Azure integration**: Managed service with backups, monitoring, high availability
- **EF Core support**: Good PostgreSQL provider available
- **Rich data types**: Arrays, JSONB, full-text search built-in

**Cons**:
- **Less Azure-native**: Not as tightly integrated as SQL Database
- **Tooling**: Fewer native Azure tools compared to SQL Database
- **Team familiarity**: Potentially less familiar than SQL Server for .NET teams
- **Feature parity**: Some Azure SQL features (like serverless) not available
- **Migration effort**: If we later need SQL-specific features, migration required

## Decision Outcome

**Chosen Option**: Azure SQL Database with Serverless tier (Option 1)

**Rationale**:

1. **Perfect fit for data model**: Our data is inherently relational:
   - Users have many books (one-to-many relationship)
   - Books have ratings and notes (one-to-one)
   - Strong referential integrity needed (user deletes → cascade to books)
   - Natural fit for SQL schema with foreign keys

2. **Query requirements**: We need complex queries that SQL handles naturally:
   - "Show me all Read books rated 4+ stars in Science Fiction genre"
   - "Filter TBR by author and sort by added date"
   - "Find books with notes containing specific keywords"
   - JOINs and WHERE clauses are straightforward in SQL

3. **Entity Framework Core excellence**: EF Core with SQL Server provides:
   - Type-safe LINQ queries mapped directly to our C# models
   - Automatic migrations for schema changes
   - Built-in change tracking
   - Excellent integration with ASP.NET Core (from ADR-0002)

4. **Simplicity-first alignment**:
   - Well-understood technology, minimal learning curve
   - Clear patterns and best practices
   - No complex partition key strategies or RU/s tuning
   - Standard SQL skills applicable

5. **Cost optimization for MVP**:
   - **Serverless tier**: Pay only when database is active
   - Auto-pause after inactivity (saves costs during low usage)
   - Auto-scale compute based on demand
   - Start small (<$50/month), scale as needed

6. **Azure-native benefits**:
   - Automatic backups with point-in-time restore
   - Built-in high availability
   - Azure AD authentication integration
   - Application Insights integration
   - Seamless deployment from Azure DevOps/GitHub Actions

7. **Performance more than adequate**:
   - Sub-second queries for 500-book libraries with proper indexing
   - Handles concurrent users efficiently
   - Can optimize with indexes, query plans, caching if needed

**Why not Cosmos DB**: 
- 4-6x more expensive for our workload
- Global distribution and <10ms latency not needed
- Relational queries difficult without JOINs
- Would require denormalization (users embedded with books), losing data normalization benefits

**Why not PostgreSQL**:
- SQL Database serverless tier matches cost advantages
- Better Azure tooling integration
- Team likely more familiar with SQL Server in .NET ecosystem
- Easier path to enterprise features if needed later (Azure AD, advanced security)

## Consequences

### Positive

- **Developer productivity**: EF Core makes data access fast and type-safe
- **Query power**: SQL provides everything needed for filtering, sorting, aggregating
- **Data integrity**: ACID transactions prevent data corruption
- **Tooling**: Excellent database management tools (SSMS, Azure Data Studio)
- **Cost-effective**: Serverless tier optimizes costs for MVP
- **Well-understood**: Clear patterns, extensive documentation, large community
- **Azure-native**: Seamless integration with other Azure services
- **Migration path**: Can upgrade to other Azure SQL tiers if needed (Basic → Standard → Premium)

### Negative

- **Schema rigidity**: Database migrations required for schema changes
- **Potential over-provisioning**: If traffic is extremely variable, serverless pauses/resumes can add latency
- **Single-region initially**: Multi-region requires geo-replication setup (acceptable for v1)
- **Vendor lock-in**: Tightly coupled to Azure SQL (though standard SQL is portable)

### Neutral

- **Relational constraints**: Need to plan schema carefully (mitigated by EF Core migrations)
- **Index management**: Will need to add indexes for performance (standard practice)
- **Backup management**: Handled automatically by Azure (less control, more simplicity)

## Implementation Notes

1. **Use Serverless tier for MVP**:
   - Auto-pause delay: 60 minutes
   - Min vCores: 0.5, Max vCores: 2 (adjust based on actual usage)
   - Expected cost: $20-50/month initially

2. **Connection string in Azure Key Vault**: Never hardcode credentials

3. **Entity Framework Core**:
   - Code-first migrations for version control of schema
   - Use fluent API for complex configurations
   - Enable query logging in development

4. **Schema design**:
   - `Users` table: Id, Email, PasswordHash, DisplayName, CreatedDate
   - `Books` table: Id, UserId (FK), Title, Author, CoverUrl, Description, Status, AddedDate
   - `Ratings` table: BookId (FK), Rating, Notes, RatedDate (one-to-one with Books)
   - `Preferences` table: UserId (FK), Genres (JSON array), Themes (JSON array), FavoriteAuthors (JSON array)

5. **Indexing strategy**:
   - Clustered index on primary keys (default)
   - Non-clustered index on UserId for Books table
   - Non-clustered index on Status, Genre for filtering
   - Consider full-text search index on Notes if searching is common

6. **Connection resilience**: Use EF Core retry policies for transient faults

7. **Monitor and optimize**: Use Azure SQL Database Advisor recommendations

## References

- PRD: `specs/prd.md` - Section 6 (Constraints, Data Dependency)
- FRD-001: `specs/features/book-library-management.md` - Section 3 (Data Requirements)
- FRD-003: `specs/features/user-preferences-ratings.md` - Section 3 (Data Requirements)
- FRD-005: `specs/features/user-authentication.md` - Section 3 (Data Requirements)
- ADR-0002: `specs/adr/0002-backend-framework.md` - ASP.NET Core chosen (EF Core alignment)
- Azure SQL Database Serverless: https://learn.microsoft.com/azure/azure-sql/database/serverless-tier-overview
- Entity Framework Core: https://learn.microsoft.com/ef/core/
