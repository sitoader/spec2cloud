# 🚀 Getting Started with Spec2Cloud

**Transform your app idea into a deployed Azure application in 6 simple steps using AI agents.**

## 📋 What You Need Before Starting

- ✅ Your app idea (even just a rough concept is fine!)
- ✅ VS Code with GitHub Copilot enabled
- ✅ This repository opened in the dev container

## 🎯 The Complete Workflow

### Step 1: Start with Your Idea 💡
**What to do:** Simply describe your app idea to get started

**Example ideas:**
```
"I want to create a smart AI agent for elderly care that tracks vitals and alerts caregivers"

"Build a expense tracking app for small businesses with receipt scanning"

"Create a social fitness app where friends can challenge each other"
```

**💡 Tip:** The more specific you are, the better results you'll get, but don't worry if you only have a basic idea - the PM agent will help you flesh it out!

---

### Step 2: Create Product Requirements (`/prd`) 📝
**How it works:** The `/prd` command automatically uses the PM (Product Manager) agent

**What to do:**
1. Open GitHub Copilot Chat in VS Code
2. Share your app idea first: "I want to build an expense tracking app for small businesses"
3. Then type `/prd` to start the requirements process
4. The PM agent will ask clarifying questions about:
   - Who will use your app?
   - What problem does it solve?
   - What does success look like?
   - Any technical constraints?

**Output:** A structured Product Requirements Document saved to `specs/prd.md`

**Example conversation:**
```
You: I want to build an expense tracking app for small businesses
You: /prd

PM Agent: Great! Let me help you create a comprehensive PRD. I have a few questions:
1. What size businesses are we targeting? (1-10 employees, 10-50, etc.)
2. What's the biggest pain point they have with current expense tracking?
3. Do they need features like receipt scanning, mileage tracking, or integration with accounting software?
...
```

---

### Step 3: Break Down Features (`/frd`) 🔧
**How it works:** The `/frd` command continues with the PM (Product Manager) agent

**What to do:**
1. Type `/frd` (the PM agent automatically continues)
2. The PM agent will break your PRD into individual features
3. Review and provide feedback if needed

**Output:** Individual Feature Requirements Documents in `specs/features/`

**Example features created:**
- `specs/features/receipt-scanning.md`
- `specs/features/expense-categorization.md`  
- `specs/features/reporting-dashboard.md`

---

### Step 4: Generate Development Guidelines (`/generate-agents`) 📖
**How it works:** The `/generate-agents` command automatically uses the Dev Lead agent

**What to do:**
1. Type `/generate-agents` (no need to specify agent)
2. Wait for the agent to read all standards and create guidelines

**Output:** Comprehensive `AGENTS.md` file with coding standards and architectural guidance

**💡 Note:** This step is optional at the beginning but **required before Step 5**. You can do it now or right before planning.

---

### Step 5: Create Technical Plan (`/plan`) 🏗️
**How it works:** The `/plan` command automatically uses the Developer agent

**What to do:**
1. Type `/plan` (no need to specify agent)
2. The agent will analyze your FRDs and create technical implementation tasks

**Output:** Detailed technical tasks in `specs/tasks/` with:
- Implementation approach
- Technology choices
- Dependencies
- Acceptance criteria

**Example tasks created:**
- `specs/tasks/setup-backend-api.md`
- `specs/tasks/implement-receipt-upload.md`
- `specs/tasks/create-dashboard-ui.md`

---

### Step 6A: Implement Code (`/implement`) 💻
**How it works:** The `/implement` command continues with the Developer agent  
**Choose this if:** You want the AI to write the code directly

**What to do:**
1. Type `/implement` (continues with same agent)
2. The agent will create the application structure and write code
3. Code will be created in `src/backend/` and `src/frontend/`

**OR**

### Step 6B: Delegate to Copilot (`/delegate`) 🤝
**How it works:** The `/delegate` command continues with the Developer agent  
**Choose this if:** You want to work with GitHub Copilot's coding features

**What to do:**
1. Type `/delegate` (continues with same agent)
2. The agent will create detailed GitHub Issues
3. You can then use GitHub Copilot's coding assistance to implement each task

---

### Step 7: Deploy to Azure (`/deploy`) ☁️
**How it works:** The `/deploy` command automatically uses the Azure Cloud Architect agent

**What to do:**
1. Type `/deploy` (no need to specify agent)
2. The agent will:
   - Analyze your application
   - Create Bicep infrastructure templates
   - Set up CI/CD pipelines
   - Deploy to Azure

**Output:**
- Infrastructure as Code (Bicep templates)
- GitHub Actions workflows
- Deployed application on Azure

---

## 🎯 Quick Reference Commands

| Command | Auto-Selected Agent | Purpose | Output |
|---------|---------------------|---------|--------|
| *Share your idea* | (Manual conversation) | Start the process | Conversation |
| `/prd` | PM Agent | Create requirements doc | `specs/prd.md` |
| `/frd` | PM Agent | Break into features | `specs/features/*.md` |
| `/generate-agents` | Dev Lead Agent | Create dev guidelines | `AGENTS.md` |
| `/plan` | Developer Agent | Technical planning | `specs/tasks/*.md` |
| `/implement` | Developer Agent | Write code directly | Code in `src/` |
| `/delegate` | Developer Agent | Create GitHub Issues | Issues for Copilot |
| `/deploy` | Azure Agent | Deploy to Azure | Infrastructure + deployment |

## 💡 Tips for Success

### For Better Requirements (Steps 1-3)
- **Be specific about your users:** "Small business owners with 1-5 employees" vs "business users"
- **Describe the problem clearly:** What pain point are you solving?
- **Mention any constraints:** Budget, timeline, must integrate with X system, etc.

### For Better Technical Planning (Steps 4-5)
- **Review the generated AGENTS.md** to understand the coding standards
- **Ask questions** if you don't understand the technical approach
- **Provide feedback** on technology choices if you have preferences

### For Better Implementation (Step 6)
- **Choose `/implement`** for rapid prototyping and learning
- **Choose `/delegate`** for production applications or when you want to code alongside Copilot

### For Better Deployment (Step 7)
- **Specify your requirements:** Do you need a database? File storage? Authentication?
- **Mention scale expectations:** How many users? What performance do you need?
- **Ask about costs:** The agent can optimize for your budget

## 🔄 Iterative Process

Remember, this is an **iterative workflow**:
- You can go back to any step and refine
- The PM agent can update requirements based on new insights
- The dev agent can revise plans based on implementation learnings
- The azure agent can adjust infrastructure based on performance needs

## 🆘 Need Help?

**Having issues?** Check the **[Complete Troubleshooting Guide](./TROUBLESHOOTING.md)** for solutions to common problems.

**Quick fixes:**
- ✅ Make sure you're using the right agent (`@pm`, `@dev`, etc.)
- ✅ Start a new chat if agents aren't responding correctly
- ✅ Use exact commands: `/prd`, `/frd`, `/plan`, `/implement`, `/deploy`
- ✅ You can always go back and refine earlier steps

## 🎉 What You'll Have at the End

1. **Complete Documentation** in `specs/` folder
2. **Working Application Code** in `src/` folder
3. **Infrastructure Templates** for reproducible deployments
4. **CI/CD Pipelines** for automated deployments
5. **Production-Ready Application** running on Azure

---

**Ready to start? Just describe your app idea to `@pm` and begin your journey from idea to production! 🚀**