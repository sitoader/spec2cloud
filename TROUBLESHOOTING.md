# 🆘 Troubleshooting Guide

**Common issues and how to solve them quickly.**

## 🤖 Agent Issues

### "The agent isn't responding correctly"
**Symptoms:** Agent gives generic responses or doesn't follow the workflow

**Solutions:**
1. ✅ **Use slash commands:** The commands automatically select the right agent - just type `/prd`, `/frd`, `/plan`, etc.
2. ✅ **Start fresh chat:** Begin a new conversation if needed
3. ✅ **Be more specific:** Add more details to your request
4. ✅ **Use exact commands:** Type `/prd`, `/frd`, `/plan`, etc. exactly

**Example:**
```
❌ "Hey, can you help me with requirements?"
✅ "I want to build a food delivery app for college students"
✅ "/prd"
```

---

### "Wrong agent is responding"
**Symptoms:** Getting development advice when asking for requirements

**Solutions:**
1. ✅ **Use slash commands:** Commands like `/prd`, `/plan`, `/deploy` automatically select the right agent
2. ✅ **Start new chat:** If you get mixed responses, begin fresh
3. ✅ **Follow the sequence:** Use commands in the right order: `/prd` → `/frd` → `/plan` → `/implement` → `/deploy`

---

## 📝 Workflow Issues

### "I skipped a step and things aren't working"
**Symptoms:** Later steps fail or give poor results

**Required order:**
1. `@pm` + share idea + `/prd` + `/frd`
2. `@devlead` + `/generate-agents` (before step 3)
3. `@dev` + `/plan`
4. `@dev` + `/implement` OR `/delegate`
5. `@azure` + `/deploy`

**Solution:** Go back to the missed step and complete it first.

---

### "The PRD/FRD is not detailed enough"
**Symptoms:** Later agents complain about missing information

**Solutions:**
1. ✅ **Provide more context** to the PM agent
2. ✅ **Answer all clarifying questions** thoroughly
3. ✅ **Update existing docs:** You can ask `@pm` to revise the PRD/FRD
4. ✅ **Be specific about users, features, and constraints**

---

## 💻 Technical Issues

### "Code generation fails or produces errors"
**Symptoms:** Syntax errors, missing dependencies, or broken code

**Solutions:**
1. ✅ **Check AGENTS.md exists:** Run `@devlead` + `/generate-agents` first
2. ✅ **Verify tech stack:** Make sure the agent knows your preferred technologies
3. ✅ **Start smaller:** Ask for simpler implementation first, then iterate
4. ✅ **Provide feedback:** Tell the agent what's wrong and ask for fixes

---

### "Can't install or run the generated code"
**Symptoms:** Dependency errors, build failures

**Solutions:**
1. ✅ **Check Node.js/Python version** in dev container
2. ✅ **Run in dev container:** Make sure you're using the provided environment
3. ✅ **Ask agent to fix:** Share the error message with `@dev`
4. ✅ **Check file paths:** Ensure code is in correct `src/` directories

---

## ☁️ Deployment Issues

### "Azure deployment fails"
**Symptoms:** Resource creation errors, authentication issues

**Solutions:**
1. ✅ **Check Azure credentials:** Ensure you're logged into Azure CLI
2. ✅ **Verify permissions:** Make sure you can create resources in your subscription
3. ✅ **Check resource names:** Azure resources need globally unique names
4. ✅ **Ask for simpler deployment:** Start with basic App Service, add complexity later

---

### "Application deployed but not working"
**Symptoms:** 404 errors, database connection issues

**Solutions:**
1. ✅ **Check application logs** in Azure portal
2. ✅ **Verify environment variables** are set correctly
3. ✅ **Ask `@azure` to troubleshoot** with the error messages
4. ✅ **Test locally first** before deploying

---

## 🔄 Process Issues

### "I want to change something mid-process"
**Symptoms:** Requirements changed, different tech stack needed

**Solutions:**
1. ✅ **Go backward:** Update PRD/FRD first, then regenerate downstream
2. ✅ **Start new branch:** Keep working version while experimenting
3. ✅ **Be explicit:** Tell agents "I want to change X to Y"
4. ✅ **Iterate:** The process is designed for refinement

---

### "Output is in wrong folder or format"
**Symptoms:** Files created in unexpected locations

**Expected structure:**
```
specs/
├── prd.md                 # From @pm /prd
├── features/              # From @pm /frd
│   ├── feature-1.md
│   └── feature-2.md
└── tasks/                 # From @dev /plan
    ├── task-1.md
    └── task-2.md

src/
├── backend/               # From @dev /implement
└── frontend/              # From @dev /implement

infra/                     # From @azure /deploy
├── main.bicep
└── ...

AGENTS.md                  # From @devlead /generate-agents
```

**Solution:** Ask the agent to recreate files in correct locations.

---

## 🎯 Performance Issues

### "Agents are too slow or timing out"
**Symptoms:** Long waits, incomplete responses

**Solutions:**
1. ✅ **Break requests into smaller parts**
2. ✅ **Wait for completion** before next command
3. ✅ **Check internet connection**
4. ✅ **Try simpler prompts** first

---

### "Responses are too generic"
**Symptoms:** Boilerplate code, generic requirements

**Solutions:**
1. ✅ **Add more specific details** about your domain
2. ✅ **Provide examples** of similar apps
3. ✅ **Ask follow-up questions** to refine output
4. ✅ **Reference existing standards** if available

---

## 🚨 Emergency Resets

### "Everything is broken, start over"
**When to do this:** Major errors, completely wrong direction

**Steps:**
1. Create new branch: `git checkout -b fresh-start`
2. Delete generated files (keep original idea notes)
3. Start from Step 1 with `@pm`
4. Apply lessons learned from first attempt

---

### "Just want to test the workflow"
**For learning/experimenting:**

**Simple test idea:**
"I want to build a simple note-taking app where users can create, edit, and delete text notes."

This idea is:
- ✅ Simple enough for quick testing
- ✅ Has clear requirements
- ✅ Easy to implement
- ✅ Quick to deploy

---

## 📞 Getting Help

### When troubleshooting doesn't work:
1. **Check the documentation** in this repository
2. **Review the example walkthrough** for reference
3. **Start with a simpler project** to learn the workflow
4. **Ask agents to explain** their reasoning or approach

### Pro Tips:
- 💡 **Keep notes** of what works and what doesn't
- 💡 **Experiment** with different approaches
- 💡 **Ask "why"** when you don't understand agent decisions
- 💡 **Share error messages** completely with agents

---

**Remember: The workflow is designed to be iterative. Don't be afraid to go back and refine earlier steps!**