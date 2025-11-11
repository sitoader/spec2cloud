---
agent: dev
---
# Dev team flow steps

Delegate implementation to GitHub Copilot by creating well-structured GitHub issues.

## Steps

### 1. Read Task Specification
Read the complete task file from `specs\tasks` to understand:
- Task description and requirements
- Dependencies on other tasks
- Acceptance criteria
- Testing requirements

### 2. Create GitHub Issue

Use the GitHub MCP server to create an issue with:

**Title:** Clear, concise task name (e.g., "Implement user authentication API")

**Description:** Include ALL of the following:
- Full task description from task file
- Link to relevant FRD in `specs/features`
- Link to PRD in `specs/prd.md`
- Reference to `AGENTS.md` for coding standards
- List of dependencies (tasks that must be completed first)
- Detailed acceptance criteria
- Testing requirements (≥85% coverage)
- Any architectural constraints or patterns to follow

**Labels:** Add appropriate labels:
- `feature`, `bug`, `enhancement`, etc.
- `backend`, `frontend`, `infrastructure`, etc.
- `priority:high`, `priority:medium`, `priority:low`

### 3. Update Task File
Once the issue is created:
- Update the task file in `specs\tasks` with the GitHub issue link
- Add the issue number at the top of the file

### 4. Assign to GitHub Copilot
Assign the issue to **GitHub Copilot coding agent**:
- Use the GitHub MCP assign function
- Copilot will create a branch and PR automatically
- Copilot will implement according to the detailed requirements

## Quality Checklist

Before delegating, verify:
- ✅ Issue includes complete task description
- ✅ All dependencies are documented
- ✅ Acceptance criteria are clear and testable
- ✅ Testing requirements are specified
- ✅ Links to PRD, FRD, and AGENTS.md are included
- ✅ Task file updated with issue link
- ✅ Issue assigned to GitHub Copilot

## Benefits of Delegation

- **Parallel Development:** Multiple tasks can be implemented simultaneously
- **Consistent Quality:** Copilot follows the detailed requirements
- **Automatic PRs:** Copilot creates pull requests for review
- **Traceability:** Clear link between tasks, issues, and implementation