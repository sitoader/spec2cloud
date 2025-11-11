# Task 002: Frontend Next.js Project Scaffolding

**Feature**: Infrastructure  
**Dependencies**: None  
**Estimated Complexity**: Medium

---

## Description

Set up the foundational Next.js 13+ frontend application structure with TypeScript, Tailwind CSS, and all necessary tooling. This provides the base for all frontend features.

---

## Technical Requirements

### Project Initialization

Create Next.js project with:
- **Next.js Version**: 14+ (App Router)
- **TypeScript**: Strict mode enabled
- **Package Manager**: npm or pnpm
- **Project Name**: `book-tracker-web`
- **Styling**: Tailwind CSS
- **ESLint**: Configured with strict rules

### Project Structure

```
book-tracker-web/
  app/
    layout.tsx                  # Root layout
    page.tsx                    # Home page
    globals.css                 # Global styles
    not-found.tsx               # 404 page
    error.tsx                   # Error boundary
  components/
    ui/                         # Reusable UI components
    layout/                     # Layout components (Header, Footer)
  lib/
    api/                        # API client functions
    utils/                      # Utility functions
  types/
    index.ts                    # TypeScript type definitions
  public/
    images/                     # Static images
  .env.local                    # Environment variables (gitignored)
  .env.example                  # Example env file
  next.config.js                # Next.js configuration
  tailwind.config.ts            # Tailwind configuration
  tsconfig.json                 # TypeScript configuration
```

### Required Dependencies

**Core**:
- `next` (14+)
- `react` (18+)
- `react-dom` (18+)
- `typescript` (5+)

**Styling**:
- `tailwindcss` (3+)
- `postcss` (latest)
- `autoprefixer` (latest)
- `clsx` (utility for conditional classes)

**Utilities**:
- `date-fns` or `dayjs` (date formatting)
- `zod` (runtime validation)

**Dev Dependencies**:
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `eslint`
- `eslint-config-next`
- `@typescript-eslint/parser`
- `@typescript-eslint/eslint-plugin`

### TypeScript Configuration

Configure `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind CSS Configuration

Configure `tailwind.config.ts`:
- Content paths for all component files
- Custom color palette aligned with brand
- Custom font family
- Responsive breakpoints
- Dark mode support (class-based, optional for v1)

### ESLint Configuration

Extend Next.js ESLint config with strict rules:
- No unused variables
- Explicit return types for functions
- No any types
- Consistent import order
- React hooks rules

### Environment Variables

Create `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Configure Next.js to validate required env vars on build.

### Root Layout

Create `app/layout.tsx`:
- HTML structure with lang attribute
- Metadata (title, description)
- Global styles import
- Font configuration (Google Fonts or local)
- Providers wrapper (for future context providers)

### Home Page

Create `app/page.tsx`:
- Simple landing page with app description
- Links to sign up / log in (placeholder for now)
- Responsive layout using Tailwind

### Error Boundaries

Create `app/error.tsx`:
- Global error boundary
- Displays user-friendly error message
- Reset button to retry
- Logs error to console (Application Insights in production)

Create `app/not-found.tsx`:
- Custom 404 page
- Link back to home

### API Client Setup

Create `lib/api/client.ts`:
- Base fetch wrapper function
- Handles authentication headers (JWT from cookies)
- Error handling (network errors, HTTP errors)
- Type-safe response parsing
- Base URL from environment variable

Example structure:
```typescript
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Implementation
}
```

### Utility Functions

Create `lib/utils/cn.ts`:
- `cn()` function for conditional class names using clsx

---

## Acceptance Criteria

- [ ] Next.js 14+ project initialized with App Router and TypeScript strict mode
- [ ] All required dependencies installed and documented in package.json
- [ ] Project structure follows defined organization (app/, components/, lib/, types/)
- [ ] TypeScript strict mode enabled with zero errors
- [ ] Tailwind CSS configured and compiling correctly
- [ ] ESLint configured with strict rules, zero errors/warnings on clean build
- [ ] Root layout renders with proper HTML structure and metadata
- [ ] Home page displays placeholder content with responsive Tailwind styling
- [ ] Error boundary (`error.tsx`) catches and displays errors gracefully
- [ ] 404 page (`not-found.tsx`) displays for unknown routes
- [ ] `.env.example` created with required environment variables
- [ ] `.gitignore` includes `.env.local`, `node_modules/`, `.next/`
- [ ] API client wrapper created with TypeScript generics for type-safe responses
- [ ] `cn()` utility function available for conditional classes
- [ ] Application runs locally with `npm run dev` on port 3000
- [ ] Application builds successfully with `npm run build` (zero errors, zero warnings)

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Framework**: Jest + React Testing Library

**Setup**:
- Install `jest`, `@testing-library/react`, `@testing-library/jest-dom`
- Configure Jest for Next.js (`jest.config.js`)
- Create `setupTests.ts` for global test setup

**Test Cases**:
1. **Utility Functions**:
   - `cn()` correctly merges class names
   - `cn()` handles conditional classes

2. **API Client**:
   - Sends requests to correct endpoint with base URL
   - Includes authentication header when token present
   - Throws error for non-2xx responses
   - Parses JSON response correctly

3. **Component Tests** (after components created):
   - Root layout renders children
   - Error boundary catches errors and displays fallback UI

### Integration Tests

**Test Cases**:
1. **Application Startup**:
   - Next.js dev server starts without errors
   - Home page loads successfully
   - Navigation between pages works

2. **Build Process**:
   - Production build completes successfully
   - Static pages generated correctly
   - No TypeScript errors in build output

---

## Implementation Notes

- Use `create-next-app@latest` to bootstrap project
- Choose "Yes" for TypeScript, ESLint, Tailwind CSS, App Router
- Choose "No" for src/ directory (use app/ directly)
- Use `@/` path alias for cleaner imports
- Configure VS Code settings for auto-format on save with Prettier
- Use Server Components by default, add `'use client'` only when needed
- Follow Next.js 14 best practices for metadata API
- Use `next/font` for optimized font loading
- Implement loading.tsx and error.tsx for better UX (in future tasks)
- Keep components small and focused (single responsibility)

---

## Definition of Done

- [ ] Code builds with zero TypeScript errors and zero ESLint warnings
- [ ] All unit tests pass with ≥85% code coverage
- [ ] Application runs locally without errors
- [ ] Production build succeeds without warnings
- [ ] Tailwind styles render correctly in browser
- [ ] Browser console shows no errors or warnings
- [ ] Code follows ESLint rules and Next.js conventions
- [ ] README.md documents setup instructions and available scripts
- [ ] Code reviewed and approved
