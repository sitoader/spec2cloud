# 🔄 Spec2Cloud Workflow Cheat Sheet

## The 7-Step Process

```
💡 Your App Idea
    ↓
📝 @pm → /prd → specs/prd.md
    ↓
🔧 @pm → /frd → specs/features/*.md
    ↓
📖 @devlead → /generate-agents → AGENTS.md (optional, can do later)
    ↓
🏗️ @dev → /plan → specs/tasks/*.md
    ↓
    ┌─────────────────┐
    │   Choose Path   │
    └─────────────────┘
    ↓               ↓
💻 /implement    🤝 /delegate
Code in src/    GitHub Issues
    ↓               ↓
    └───────┬───────┘
            ↓
☁️ @azure → /deploy → Azure Infrastructure + App
```

## Quick Commands Reference

| Step | Type | Auto-Selected Agent | Result |
|------|------|-------------------|--------|
| 1 | *"I want to build..."* | (Manual conversation) | Requirements gathering |
| 2 | `/prd` | PM Agent | Product Requirements Doc |
| 3 | `/frd` | PM Agent | Feature breakdown |
| 4 | `/generate-agents` | Dev Lead Agent | Development guidelines |
| 5 | `/plan` | Developer Agent | Technical tasks |
| 6a | `/implement` | Developer Agent | Direct coding |
| 6b | `/delegate` | Developer Agent | GitHub Issues for Copilot |
| 7 | `/deploy` | Azure Agent | Azure deployment |

## 🚨 Common Mistakes to Avoid

❌ **Don't skip the PRD** - It's the foundation for everything else  
❌ **Don't rush through FRDs** - Take time to get features right  
❌ **Don't forget `/generate-agents`** - Required before `/plan` and `/implement`  
❌ **Don't mix agents** - Use the right agent for each command  
❌ **Don't deploy untested code** - Test your implementation first  

## ✅ Pro Tips

✨ **Start small** - Begin with a simple version, iterate later  
✨ **Be specific** - The more details you provide, the better the results  
✨ **Ask questions** - The agents can explain their decisions  
✨ **Iterate freely** - You can always go back and refine  
✨ **Use examples** - Reference similar apps the agents might know  

---

**Need more details? Check out [GETTING_STARTED.md](./GETTING_STARTED.md) for the complete guide!**