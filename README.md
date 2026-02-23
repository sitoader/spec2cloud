
# 📚 Book Tracking App

Full-stack application, built from idea to production using custom agents and a structured spec-driven workflow.
This app can be used as a spec-driven development reference, to show how Product Requirements Documents (PRD), Feature Requirements Documents (FRD), Architecture Decision Records (ADR), and technical task breakdowns can be generated using specialized agents, and then delegated to GitHub Copilot coding agent for implementation.

The entire application was planned, specified, and built starting from the following prompt:
> *"I want to build a book tracking app that helps users keep track of what they've read or want to read, rate books, add personal notes, and get AI-powered recommendations based on your reading history and preferences — with explanations for why each book is recommended."*

---

## 🏗️ How This App Was Created

### Step 1: 💡 Idea → Product Requirements Document (PRD)

The request for building a book tracking app was given to a **PM (Product Manager) agent** which asked clarifying questions and produced a comprehensive [`specs/prd.md`](specs/prd.md) covering:
- Target users (avid readers)
- Core capabilities (library management, search, ratings, AI recommendations)
- Success metrics and user stories
- Assumptions, constraints, and open questions

### Step 2: 🔧 PRD → Feature Requirements Documents (FRDs)

The PM agent then broke the PRD down into individual **Feature Requirements Documents**, each with detailed functional requirements, acceptance criteria, and edge cases:

| Feature | Document |
|---------|----------|
| Book Library Management | [`specs/features/book-library-management.md`](specs/features/book-library-management.md) |
| Book Search & Discovery | [`specs/features/book-search-discovery.md`](specs/features/book-search-discovery.md) |
| User Preferences & Ratings | [`specs/features/user-preferences-ratings.md`](specs/features/user-preferences-ratings.md) |
| AI-Powered Recommendations | [`specs/features/ai-recommendations.md`](specs/features/ai-recommendations.md) |
| User Authentication & Data Persistence | [`specs/features/user-authentication.md`](specs/features/user-authentication.md) |

### Step 3: 📐 Architecture Decision Records (ADRs)

A **Dev Lead agent** analyzed the requirements and produced ADRs for every major technical decision:

| Decision | Document |
|----------|----------|
| Frontend Framework (Next.js) | [`specs/adr/0001-frontend-framework.md`](specs/adr/0001-frontend-framework.md) |
| Backend Framework (ASP.NET Core) | [`specs/adr/0002-backend-framework.md`](specs/adr/0002-backend-framework.md) |
| Database (PostgreSQL) | [`specs/adr/0003-database-selection.md`](specs/adr/0003-database-selection.md) |
| Authentication (ASP.NET Core Identity + JWT) | [`specs/adr/0004-authentication-strategy.md`](specs/adr/0004-authentication-strategy.md) |
| AI Service (Azure OpenAI GPT-4o) | [`specs/adr/0005-ai-service-selection.md`](specs/adr/0005-ai-service-selection.md) |
| Deployment Platform (Azure) | [`specs/adr/0006-deployment-platform.md`](specs/adr/0006-deployment-platform.md) |

### Step 4: 📋 FRDs + ADRs → Technical Tasks

A **Developer agent** created detailed technical tasks organized into phases, with dependencies, acceptance criteria, and test coverage requirements. See [`specs/tasks/README.md`](specs/tasks/README.md) for the full breakdown.

### Step 5: 🤖 Tasks → GitHub Issues → Copilot Coding Agent

Technical tasks were converted into **GitHub Issues** and delegated to the **GitHub Copilot coding agent**, which implemented each task as a pull request — following the specs, ADRs.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | ASP.NET Core 8, C#, Entity Framework Core |
| **Database** | PostgreSQL 16 (local via Docker) |
| **AI** | Azure OpenAI Service (GPT-4o) |
| **Auth** | ASP.NET Core Identity + JWT |
| **Testing** | Jest + React Testing Library (frontend), xUnit (backend) |

---

## 🚀 How to Run the App

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+ LTS](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for the PostgreSQL database)

### 1. Start the Database

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 instance on `localhost:5432` with:
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `BookTrackerDb`

### 2. Run the Backend API

```bash
cd src/BookTracker.Api
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5000` (with Swagger at `/swagger`).

### 3. Run the Frontend

```bash
cd book-tracker-web
npm install
cp .env.example .env.local   # Configure NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📜 Key Specs to Explore

If you're here to see the spec-driven development process, start with these documents:

1. **[`specs/prd.md`](specs/prd.md)** — The product vision born from the original idea
2. **[`specs/features/`](specs/features/)** — Detailed feature breakdowns with acceptance criteria
3. **[`specs/adr/`](specs/adr/)** — Architectural decisions with trade-off analysis
4. **[`specs/tasks/README.md`](specs/tasks/README.md)** — The complete implementation plan

