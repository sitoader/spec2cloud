# Book Tracker Web

A modern Next.js 14+ web application for tracking your personal reading library, discovering new books, and getting AI-powered recommendations.

## Features

- 📚 **Book Library Management** - Track and organize your reading collection
- 🔍 **Book Search & Discovery** - Search millions of books from multiple sources
- 🤖 **AI Recommendations** - Get personalized book suggestions powered by AI
- 🎨 **Modern UI** - Built with Next.js 14+ App Router and Tailwind CSS
- ⚡ **Type-Safe** - Full TypeScript support with strict mode enabled
- 🧪 **Well Tested** - Comprehensive test coverage with Jest and React Testing Library

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 4
- **State Management**: React Context (Zustand if needed)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with strict rules
- **Validation**: Zod
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or pnpm 8+

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-tracker-web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page auto-updates as you edit files.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
book-tracker-web/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── error.tsx            # Error boundary
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/                  # Reusable UI components
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # API client functions
│   │   └── client.ts        # Type-safe API client
│   └── utils/               # Utility functions
│       └── cn.ts            # Class name utility
├── types/
│   └── index.ts             # TypeScript type definitions
├── public/
│   └── images/              # Static images
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (gitignored)
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── jest.config.ts           # Jest configuration
└── jest.setup.ts            # Jest setup file
```

## Development Guidelines

### Code Style

- TypeScript strict mode is enabled
- All functions must have explicit return types
- No `any` types allowed
- Unused variables trigger errors
- Follow ESLint rules for code quality

### Component Guidelines

- Use Server Components by default
- Add `'use client'` only when needed (hooks, events, browser APIs)
- Keep components small and focused (single responsibility)
- Use the `cn()` utility for conditional class names

### Import Aliases

Use the `@/` alias for cleaner imports:

```typescript
// Good
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

// Avoid
import { apiClient } from '../../lib/api/client';
```

### Testing

- Write tests for all utility functions
- Maintain ≥85% code coverage
- Use React Testing Library for component tests
- Follow the Arrange-Act-Assert pattern

## API Integration

The application uses a type-safe API client located at `lib/api/client.ts`.

Example usage:

```typescript
import { apiClient } from '@/lib/api/client';

// Type-safe API call
const users = await apiClient<User[]>('/api/users');

// With custom options
const user = await apiClient<User>('/api/users/1', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' }),
});
```

The API client automatically:
- Adds the base URL from environment variables
- Includes authentication headers (JWT from cookies)
- Handles errors and provides detailed error information
- Parses JSON responses with type safety

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Run linting and fix any issues

## License

Private - All rights reserved

