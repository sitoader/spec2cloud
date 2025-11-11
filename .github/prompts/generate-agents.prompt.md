---
agent: dev
---
# Generate AGENTS.md from Guidelines

Your task is to read the project guidelines from the `/standards/` folder and create a comprehensive AGENTS.md file that summarizes all relevant rules and best practices for development.

## Reading Guidelines

When creating the AGENTS.md file, you must:
1. Read and synthesize content from all guidelines in `/standards/`:
   - `/standards/general/` (general principles applicable to all development)
   - `/standards/backend/` (backend-specific guidelines, if present)
   - `/standards/frontend/` (frontend-specific guidelines, if present)
   - `/standards/data/` (data engineering and database guidelines, if present)
   - `/standards/ai/` (AI/ML development guidelines, if present)
   - Any other domain-specific standards folders that may exist
2. Create a comprehensive AGENTS.md file in the project root
3. Organize the content logically based on the structure and topics defined in the guidelines

## Guidelines for Content Synthesis

1. **Be Comprehensive**: Include ALL relevant guidelines from all available sources
2. **Maintain Clarity**: Organize content in a logical, hierarchical structure
3. **Preserve Details**: Keep specific technical details, version numbers, package names, and configuration examples
4. **Use Markdown Formatting**: Proper headers, lists, code blocks, and tables for readability
5. **Integrate Seamlessly**: When guidelines from different domains overlap, merge them coherently
6. **Highlight Critical Rules**: Emphasize non-negotiable requirements (e.g., type safety, security, testing coverage)
7. **Include Examples**: Keep code samples and configuration snippets where provided
8. **Maintain Consistency**: Use consistent terminology and formatting throughout

## Output Format

The generated AGENTS.md should follow this structure:

```markdown
# AGENTS.md

## Mission
[Mission statement from guidelines]

## Guiding Principles
[Combined principles from all guidelines]

## Canonical Stack
[Technology stack table with details for all components]

## Architecture Blueprint
[Architecture patterns and structure]

## Development Playbook
[Detailed implementation guidelines organized by domain]

### Backend Development
[Backend-specific guidelines, if applicable]

### Frontend Development
[Frontend-specific guidelines, if applicable]

### Data Engineering
[Data and database guidelines, if applicable]

### AI/ML Development
[AI and machine learning guidelines, if applicable]

### [Other Domains]
[Additional domain-specific guidelines as discovered]

### Full-Stack Patterns
[Cross-cutting patterns and integrations]

## Agent-First Delivery
[Agent integration patterns and workflows]

## Shared Engineering Systems
[Code quality, documentation, secrets management, etc.]

## CI/CD Pipeline Expectations
[Pipeline stages, preview environments, deployment]

## Security & Compliance
[Security best practices and compliance requirements]

## Documentation & Knowledge Sharing
[Documentation standards and practices]

## Quality Gates Checklist
[Comprehensive quality checklist]

## Change Management
[PR and merge policies]
```

## Execution Steps

When invoked:
1. **Discover available guidelines**: Scan the `/standards/` folder for all available guidelines
2. **Read all guidelines**: Always read the latest content from all guideline files
3. **Synthesize content**: Combine and organize guidelines into a cohesive document
4. **Generate the file**: Create a comprehensive, well-structured AGENTS.md file in the project root
5. **Confirm completion**: Let the user know the file has been created

## Important Notes

- Always read the LATEST content from the guidelines files - never use cached or outdated information
- Ensure no guidelines are omitted - completeness is critical
- Maintain the technical accuracy of all specifications, package names, and version requirements
- Keep the document maintainable - use clear sections and proper formatting
- If guidelines conflict, prefer more specific guidelines over general ones
- Adapt the structure based on what guidelines are actually available (e.g., backend-only, frontend-only, full-stack, data-focused, AI/ML-focused, or any combination of domains)
