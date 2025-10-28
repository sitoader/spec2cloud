---
mode: dev
---
# Dev Team Implementation Flow

When implementing code, your responsibilities include:
- Writing modular, maintainable, and testable code.
- Following team coding standards and architectural patterns.
- Ensuring the implementation satisfies all defined tests.
- Documenting key decisions and assumptions in the code.

## Implementation Steps

Follow these steps in order when implementing a task:

### 1. Gather Requirements Context
Read all relevant context to understand the full scope:
- PRD found in `specs\prd.md`
- Relevant feature specifications in `specs\features`
- Task specifications in `specs\tasks`

### 2. Create Implementation Plan
Make a detailed plan for implementing the task, including:
- Components or modules to be created/modified
- Data models and contracts
- API endpoints or interfaces
- Testing strategy

### 3. Identify Dependencies
Identify all libraries and frameworks needed for the implementation.

### 4. Research Using Microsoft Learn MCP
Use the Microsoft Learn MCP server to get:
- Code samples and examples
- Best practices and patterns
- Latest stable versions of libraries and frameworks
- Official Microsoft documentation

### 5. Research Using Context7 MCP (If Needed)
If information is not found on Microsoft Learn MCP, use the Context7 MCP server to get:
- Code samples for non-Microsoft libraries
- Best practices and usage patterns
- Latest versions and documentation

### 6. Implement the Code
Write the implementation code following:
- Team coding standards (see `AGENTS.md`)
- Architectural patterns defined in the project
- Type-safety requirements
- Modular, self-contained design principles

### 7. Write Unit Tests
Create unit tests to verify the implementation:
- Test all public methods and functions
- Test edge cases and error conditions
- Aim for ≥85% code coverage

### 8. Run Unit Tests
Execute the unit tests to verify correctness:
- Run tests using the appropriate test runner
- Review test output and failures

### 9. Fix and Iterate on Unit Tests
Loop until all unit tests pass:
- Fix implementation issues
- Refine tests as needed
- Ensure implementation is correct

### 10. Write Integration and Regression Tests
Create comprehensive tests:
- Integration tests for API endpoints and service interactions
- Regression tests for critical user flows
- Contract tests for API specifications

### 11. Run All Tests
Execute the full test suite:
- Run unit, integration, and regression tests
- Verify ≥85% coverage threshold

### 12. Fix and Iterate on All Tests
Loop until all tests pass:
- Address test failures
- Refine implementation
- Ensure quality gates are met

### 13. Write the MADR
Create a Markdown Architectural Decision Record (MADR) in `specs\adr`:
- Use sequential numbering (e.g., `0001-decision-title.md`)
- Present **3 options** considered for the implementation
- Document decision drivers and context
- Explain why the chosen option was selected
- Include consequences and trade-offs
- This is critical for future maintainability

### 14. Update Documentation
Write or update documentation following guidelines in `AGENTS.md`:
- Update existing docs in `/docs` directory (do NOT create separate summaries)
- Use MkDocs format (Markdown)
- Update API documentation if applicable
- Add code documentation comments
- Ensure `mkdocs build --strict` passes

## Quality Checklist

Before marking a task complete, verify:
- ✅ All tests pass (unit, integration, regression)
- ✅ Code coverage ≥85%
- ✅ Type safety enforced (no type errors)
- ✅ Linters and formatters pass
- ✅ MADR created with 3 options documented
- ✅ Documentation updated in `/docs`
- ✅ No secrets committed
- ✅ Code follows team standards in `AGENTS.md`