# 📚 Example: Building a Task Management App

**Let's walk through building a simple task management app from start to finish.**

## 🎯 The Idea
"I want to build a task management app for remote teams where they can create tasks, assign them to team members, track progress, and get notifications when tasks are completed."

---

## Step 1: Requirements Gathering with PM Agent

**You:** `@pm` I want to build a task management app for remote teams where they can create tasks, assign them to team members, track progress, and get notifications when tasks are completed.

**PM Agent Response:**
"Great idea! Let me ask some clarifying questions to help define this properly:

1. **Team Size**: What size teams are we targeting? (5-10 people, 10-50, enterprise?)
2. **Key Features**: Besides task creation and assignment, what other features are essential? (time tracking, file attachments, comments, etc.)
3. **Notifications**: What types of notifications? (email, in-app, mobile push?)
4. **Integration**: Do teams need to integrate with existing tools? (Slack, email, calendar?)
5. **Access Control**: Do you need different permission levels? (admin, manager, team member?)

Based on your answers, I'll create a comprehensive PRD."

**You respond with details, then:**

**You:** `/prd`

**Output:** Creates `specs/prd.md` with structured requirements

---

## Step 2: Feature Breakdown

**You:** `/frd`

**Output:** Creates feature files:
- `specs/features/task-creation.md`
- `specs/features/task-assignment.md`
- `specs/features/progress-tracking.md`
- `specs/features/notification-system.md`
- `specs/features/user-authentication.md`
- `specs/features/team-management.md`

---

## Step 3: Generate Development Guidelines (Optional)

**You:** `@devlead` `/generate-agents`

**Output:** Creates comprehensive `AGENTS.md` with:
- Coding standards
- Architecture patterns
- Technology stack guidelines
- Quality requirements

---

## Step 4: Technical Planning

**You:** `@dev` `/plan`

**Dev Agent Response:**
"I'll analyze the FRDs and create technical implementation tasks. Based on the requirements, I'm recommending:

**Backend:** ASP.NET Core Web API
**Frontend:** Next.js React application
**Database:** PostgreSQL with Entity Framework
**Authentication:** Azure AD B2C
**Notifications:** Azure Service Bus + SignalR

Creating detailed technical tasks..."

**Output:** Creates task files:
- `specs/tasks/setup-backend-api.md`
- `specs/tasks/implement-authentication.md`
- `specs/tasks/create-task-management-api.md`
- `specs/tasks/build-frontend-components.md`
- `specs/tasks/implement-real-time-notifications.md`
- `specs/tasks/setup-database-schema.md`

---

## Step 5A: Direct Implementation

**You:** `/implement`

**Dev Agent Response:**
"I'll implement the task management app directly. Creating project structure..."

**What happens:**
1. Creates `src/backend/TaskManager.API/` with ASP.NET Core project
2. Creates `src/frontend/task-manager-ui/` with Next.js project
3. Implements all the core features
4. Sets up database migrations
5. Creates component library
6. Adds authentication flows
7. Implements real-time notifications

**Output:** Working application code ready for deployment

---

## Step 5B: Alternative - Delegation

**You:** `/delegate`

**Dev Agent Response:**
"I'll create detailed GitHub Issues for implementation with GitHub Copilot. Each issue will include:
- Complete specifications
- Code examples
- Integration requirements
- Acceptance criteria"

**Output:** GitHub Issues like:
- "Implement Task Creation API Endpoint"
- "Build Task List React Component"
- "Set up Real-time Notification System"
- "Create User Authentication Flow"

You can then work with GitHub Copilot to implement each issue.

---

## Step 6: Azure Deployment

**You:** `@azure` `/deploy`

**Azure Agent Response:**
"Analyzing your task management application for Azure deployment. I see:
- ASP.NET Core API backend
- Next.js frontend
- PostgreSQL database
- Real-time features with SignalR
- Authentication requirements

I'll create Azure infrastructure with:
- **App Service** for the API
- **Static Web Apps** for the frontend  
- **Azure Database for PostgreSQL**
- **Azure SignalR Service**
- **Azure AD B2C** for authentication
- **Application Insights** for monitoring

Creating Bicep templates and CI/CD pipelines..."

**What happens:**
1. Creates `infra/` folder with Bicep templates
2. Sets up GitHub Actions for CI/CD
3. Configures Azure resources
4. Deploys the application
5. Sets up monitoring and logging

**Output:** 
- Live task management app running on Azure
- Automated CI/CD pipeline
- Infrastructure as Code
- Monitoring dashboards

---

## 🎉 Final Result

After following these steps, you have:

1. **Complete Documentation**
   - Product requirements in `specs/prd.md`
   - Feature specifications in `specs/features/`
   - Technical tasks in `specs/tasks/`

2. **Working Application**
   - Backend API in `src/backend/`
   - Frontend React app in `src/frontend/`
   - Database schema and migrations

3. **Azure Infrastructure**
   - Production-ready deployment
   - CI/CD pipelines
   - Monitoring and logging
   - Scalable architecture

4. **Live Application**
   - Accessible via Azure-provided URL
   - Real-time task updates
   - User authentication
   - Team collaboration features

**Total time:** Depending on complexity, this process typically takes:
- **Requirements & Planning:** 30-60 minutes
- **Implementation:** 2-6 hours (direct) or varies (delegated)
- **Deployment:** 30-60 minutes

---

## 💡 Key Takeaways from this Example

1. **Start Simple:** We focused on core task management features first
2. **Ask Good Questions:** The PM agent helped refine the requirements
3. **Technology Choices:** The dev agent recommended appropriate tech stack
4. **Flexible Implementation:** You can choose to implement directly or delegate
5. **Production Ready:** The Azure agent handles all deployment complexity

**Ready to try it yourself? Start with your own app idea and follow the same pattern!**