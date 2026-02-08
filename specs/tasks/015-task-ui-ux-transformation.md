# Task 015: UI/UX Transformation with Modern Component Library

**Feature**: Enhanced User Experience (UX-001)  
**Dependencies**: Task 002 (Frontend Scaffolding), All UI tasks (005, 007, 009, 011, 013)  
**Estimated Complexity**: High

---

## Description

Transform the BookTracker application from functional to polished by integrating shadcn/ui component library, Framer Motion animations, Lucide icons, and implementing modern UI patterns including skeleton loaders, toast notifications, enhanced forms, and sophisticated micro-interactions.

---

## Objectives

1. **Establish Design System**: Install and configure shadcn/ui with custom theme tokens
2. **Component Modernization**: Replace all basic HTML elements with polished UI components
3. **Animation Layer**: Add smooth transitions, page animations, and micro-interactions
4. **Loading States**: Implement skeleton screens and better loading indicators
5. **Visual Hierarchy**: Improve typography, spacing, and call-to-action prominence
6. **Enhanced Forms**: Add icons, better validation feedback, and improved accessibility
7. **Toast Notifications**: Replace banner alerts with elegant toast system

---

## Technical Requirements

### Phase 1: Foundation Setup

#### Install Core Dependencies

```bash
# shadcn/ui CLI (installs components on demand)
npx shadcn@latest init

# Animation and icons
npm install framer-motion lucide-react sonner
```

#### Initialize shadcn/ui Configuration

Run init command with these options:
- Style: Default
- Base color: Zinc
- CSS variables: Yes
- Tailwind config: TypeScript
- React Server Components: Yes
- Components directory: `@/components/ui`
- Utils directory: `@/lib/utils`

Creates/Updates:
- `components/ui/` - Component library folder
- `lib/utils.ts` - Utility functions including `cn()` for classNames
- `tailwind.config.ts` - Extended with shadcn theme tokens
- `app/globals.css` - CSS variables for theming

#### Install shadcn/ui Components

```bash
# Core components needed
npx shadcn@latest add button card input label textarea select checkbox badge dialog separator skeleton tabs toast
```

This creates individual component files in `components/ui/`:
- `button.tsx` - Variant-based button system
- `card.tsx` - Standardized card container
- `input.tsx` - Enhanced input fields
- `label.tsx` - Form labels
- `textarea.tsx` - Multi-line inputs
- `select.tsx` - Custom select dropdowns
- `checkbox.tsx` - Styled checkboxes
- `badge.tsx` - Status badges and pills
- `dialog.tsx` - Modal dialogs
- `separator.tsx` - Visual dividers
- `skeleton.tsx` - Loading placeholders
- `tabs.tsx` - Tab navigation
- `toast.tsx` - Toast notification components

---

### Phase 2: Design System Enhancement

#### Update `app/globals.css`

Enhance existing CSS variables with additional design tokens:

```css
@layer base {
  :root {
    /* Existing variables */
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    
    /* Add primary accent colors */
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    
    /* Add accent colors */
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    
    /* Enhanced shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    
    /* Animation timings */
    --transition-fast: 150ms;
    --transition-base: 200ms;
    --transition-slow: 300ms;
  }
  
  .dark {
    /* Dark mode overrides */
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
  }
}

/* Add custom animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Update `tailwind.config.ts`

Add custom animations and extend theme:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
};
```

#### Add Toast Provider to `app/layout.tsx`

```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

---

### Phase 3: Authentication Pages Enhancement

#### Update `components/auth/LoginForm.tsx`

**Imports:**
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
```

**Changes:**
- Replace `<button>` with `<Button variant="default" disabled={isLoading}>`
- Add loading spinner: `{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}`
- Replace `<input>` with `<Input>` component
- Add input icons using Lucide: `<Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />`
- Wrap error messages in `<motion.div>` with `initial`, `animate`, `exit` props
- Replace error banners with `toast.error()` calls
- Add focus ring styling: `focus-visible:ring-2 focus-visible:ring-offset-2`

**Example transformation:**
```tsx
// Before
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full px-3 py-2 border rounded"
/>

// After
<div className="relative">
  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="pl-10"
    placeholder="name@example.com"
  />
</div>
```

#### Update `components/auth/RegisterForm.tsx`

Apply same enhancements as LoginForm plus:
- Keep existing password strength meter, style it with shadcn colors
- Add `<User>` icon for display name field
- Add success celebration on registration using `confetti()` or toast

---

### Phase 4: Book Library Page Transformation

#### Create `components/ui/book-card-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </Card>
  );
}
```

#### Update `components/books/BookCard.tsx`

**Imports:**
```typescript
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Book, Heart, Trash2, Edit } from 'lucide-react';
```

**Changes:**
- Wrap card in `<motion.div>` with hover animation:
  ```tsx
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
  ```
- Replace outer `<div>` with `<Card className="overflow-hidden group">`
- Use `<Badge>` for status instead of colored span
- Replace buttons with shadcn `<Button variant="ghost" size="icon">`
- Add group hover effects for action buttons
- Add image loading skeleton

**Example structure:**
```tsx
<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
  <Card className="overflow-hidden group cursor-pointer">
    <CardContent className="p-0">
      <div className="aspect-[2/3] relative">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img src={coverUrl} alt={title} />
        )}
      </div>
    </CardContent>
    <CardFooter className="flex flex-col items-start p-4">
      <h3 className="font-semibold truncate w-full">{title}</h3>
      <p className="text-sm text-zinc-600">{author}</p>
      <div className="flex gap-2 mt-2">
        <Badge variant={statusVariant}>{status}</Badge>
      </div>
    </CardFooter>
  </Card>
</motion.div>
```

#### Update `components/books/BookGrid.tsx`

**Imports:**
```typescript
import { motion } from 'framer-motion';
import { BookCardSkeleton } from '@/components/ui/book-card-skeleton';
```

**Changes:**
- Wrap books in `<motion.div>` with stagger animation:
  ```tsx
  <motion.div
    variants={container}
    initial="hidden"
    animate="show"
    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
  >
    {books.map((book, i) => (
      <motion.div key={book.id} variants={item}>
        <BookCard {...book} />
      </motion.div>
    ))}
  </motion.div>
  ```
- Replace loading spinner with skeleton grid:
  ```tsx
  {isLoading && (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  )}
  ```

**Animation variants:**
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

#### Update `components/books/AddBookForm.tsx`

**Changes:**
- Replace all form inputs with shadcn components
- Use `<Label>` for all labels
- Replace genre checkboxes with styled `<Checkbox>` components
- Add icons to input fields (Book, User, Calendar, etc.)
- Replace submit button with `<Button>` with loading state
- Use `toast.success()` for successful submission

#### Update `components/books/BookFilters.tsx`

**Changes:**
- Replace `<select>` with shadcn `<Select>` component
- Replace search input with `<Input>` with Search icon
- Add `<Button variant="ghost">` for clear filters
- Add badge showing active filter count
- Make inline design instead of boxed section

#### Update `app/books/page.tsx`

**Changes:**
- Add stats cards at top showing:
  - Total books count
  - Books read this year
  - Current reading streak
- Make "Add Book" button prominent with gradient and icon
- Replace error banners with `toast.error()`
- Add page entrance animation with Framer Motion

**Stats cards example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-600">Total Books</p>
          <p className="text-3xl font-bold">{totalCount}</p>
        </div>
        <Book className="h-8 w-8 text-zinc-400" />
      </div>
    </CardContent>
  </Card>
  {/* More stat cards */}
</div>
```

---

### Phase 5: Search Page Enhancement

#### Update `components/search/BookTrackerSearchBar.tsx`

**Changes:**
- Replace `<input>` with `<Input>` with Search icon
- Add loading indicator (spinner) while searching
- Add clear button when text exists
- Add search history dropdown (optional)

#### Update `components/search/BookTrackerSearchResultCard.tsx`

**Changes:**
- Wrap in `<motion.div>` with hover lift
- Replace outer div with `<Card>`
- Use `<Badge>` for source pill
- Replace buttons with shadcn `<Button>`
- Add glow effect on hover

#### Update `components/search/BookTrackerBookDetailModal.tsx`

**Changes:**
- Replace `<dialog>` with shadcn `<Dialog>` component
- Add slide-in animation
- Use `<Tabs>` for organizing book details
- Enhance action buttons with icons

#### Update `app/search/page.tsx`

**Changes:**
- Replace spinner with skeleton grid during search
- Add empty state with illustration
- Use stagger animation for results appearing
- Replace alerts with toasts

---

### Phase 6: Recommendations Page Enhancement

#### Update `components/recommendations/BookTrackerGenerateButton.tsx`

**Changes:**
- Use shadcn `<Button>` with gradient styling
- Add Sparkles icon from Lucide
- Add pulse animation when idle
- Show progress indicator during generation
- Add celebration animation on success (confetti or toast)

**Example:**
```tsx
<Button
  size="lg"
  disabled={isGenerating}
  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
>
  {isGenerating ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-5 w-5" />
      Get AI Recommendations
    </>
  )}
</Button>
```

#### Update `components/recommendations/BookTrackerRecommendationCard.tsx`

**Changes:**
- Wrap in `<motion.div>` with entrance animation (fade + slide)
- Replace outer div with `<Card>`
- Replace Unicode stars with Lucide `<Star>` components
- Add fill animation for confidence scores
- Add flip animation on dismiss

#### Update `components/ratings/BookTrackerRatingStars.tsx`

**Changes:**
- Replace Unicode stars (`★`) with Lucide `<Star>` components
- Add smooth fill transition on hover
- Add color transition (gray → yellow)
- Support half-stars (optional)

**Example:**
```tsx
import { Star } from 'lucide-react';

{[1, 2, 3, 4, 5].map((star) => (
  <motion.button
    key={star}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => onRate(star)}
  >
    <Star
      className={cn(
        "h-6 w-6 transition-colors",
        star <= rating
          ? "fill-yellow-400 text-yellow-400"
          : "fill-none text-zinc-300"
      )}
    />
  </motion.button>
))}
```

#### Update `components/recommendations/BookTrackerRecommendationLoading.tsx`

**Changes:**
- Replace spinner with `<BookCardSkeleton>` grid
- Add shimmer effect to skeletons

#### Update `app/recommendations/page.tsx`

**Changes:**
- Add tooltip explaining AI features
- Replace error alerts with toasts
- Add page entrance animation

---

### Phase 7: Preferences Page Enhancement

#### Update `components/preferences/BookTrackerPreferencesForm.tsx`

**Changes:**
- Replace checkboxes with shadcn `<Checkbox>` with check animation
- Group genres using `<Tabs>` component
- Create tag input component for themes/authors
- Add animation to rating bars
- Add success confetti or celebratory toast on save

**Genre section example:**
```tsx
<Tabs defaultValue="fiction" className="w-full">
  <TabsList>
    <TabsTrigger value="fiction">Fiction</TabsTrigger>
    <TabsTrigger value="nonfiction">Non-Fiction</TabsTrigger>
    <TabsTrigger value="other">Other</TabsTrigger>
  </TabsList>
  <TabsContent value="fiction" className="space-y-4">
    {fictionGenres.map((genre) => (
      <div key={genre} className="flex items-center space-x-2">
        <Checkbox
          id={genre}
          checked={selectedGenres.includes(genre)}
          onCheckedChange={() => toggleGenre(genre)}
        />
        <Label htmlFor={genre}>{genre}</Label>
      </div>
    ))}
  </TabsContent>
</Tabs>
```

#### Update `app/preferences/page.tsx`

**Changes:**
- Add `<Separator />` between form sections
- Make save button more prominent
- Show success toast on save

---

### Phase 8: Navigation & Header Enhancement

#### Update `components/layout/Header.tsx`

**Changes:**
- Make header sticky with backdrop blur
- Add active state to navigation links
- Create user menu dropdown using `<DropdownMenu>` (install with `npx shadcn@latest add dropdown-menu`)
- Add mobile menu with slide-in animation
- Add icons to navigation items

**Example sticky header:**
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center">
    {/* Header content */}
  </div>
</header>
```

---

### Phase 9: Global Polish & Shared Components

#### Update `components/books/BookTrackerStatusBadge.tsx`

**Changes:**
- Use shadcn `<Badge>` with variants
- Add icon per status (BookOpen, BookMarked, CheckCircle)
- Add animation on status change

#### Create `components/ui/empty-state.tsx`

Reusable empty state component with illustration:

```tsx
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <Icon className="h-16 w-16 text-zinc-300 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 mb-4">{description}</p>
      {action}
    </motion.div>
  );
}
```

#### Update `app/page.tsx` (Landing Page)

**Changes:**
- Add animated gradient background
- Replace emojis with Lucide icons
- Add feature card hover effects:
  ```tsx
  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
    <Card>
      {/* Feature content */}
    </Card>
  </motion.div>
  ```
- Add CTA button with gradient

#### Add Page Transitions to `app/layout.tsx`

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransitionProvider({ children }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Component Inventory

### New UI Components (shadcn/ui)

All installed in `components/ui/`:

1. `button.tsx` - Button variants (default, outline, ghost, link)
2. `card.tsx` - Card container with header/content/footer
3. `input.tsx` - Enhanced input field
4. `label.tsx` - Form label
5. `textarea.tsx` - Multi-line text input
6. `select.tsx` - Custom select dropdown
7. `checkbox.tsx` - Styled checkbox
8. `badge.tsx` - Status badges
9. `dialog.tsx` - Modal dialog
10. `separator.tsx` - Visual divider
11. `skeleton.tsx` - Loading placeholder
12. `tabs.tsx` - Tab navigation
13. `toast.tsx` - Toast notification components

### Custom Components

Create these as needed:

1. `components/ui/book-card-skeleton.tsx` - Skeleton for book cards
2. `components/ui/empty-state.tsx` - Empty state pattern
3. `components/ui/stat-card.tsx` - Dashboard stat cards

---

## Animation Patterns

### Hover Effects

```tsx
whileHover={{ y: -4, scale: 1.02 }}
transition={{ duration: 0.2 }}
```

### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

### Page Transitions

```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}
```

### Button Press

```tsx
whileTap={{ scale: 0.95 }}
```

---

## Style Patterns

### Focus States

All interactive elements should have:
```tsx
className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
```

### Card Hover

```tsx
className="transition-shadow hover:shadow-lg"
```

### Disabled States

Use shadcn button's built-in disabled styling:
```tsx
<Button disabled={isLoading}>
```

---

## Toast Notifications

### Success
```typescript
toast.success('Book added successfully!');
```

### Error
```typescript
toast.error('Failed to add book. Please try again.');
```

### Loading
```typescript
const toastId = toast.loading('Adding book...');
// Later:
toast.success('Book added!', { id: toastId });
```

### With Action
```typescript
toast.success('Book deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreBook()
  }
});
```

---

## Testing Checklist

### Visual Tests

- [ ] All pages load without layout shift
- [ ] Dark mode works on all pages
- [ ] Hover states work on all interactive elements
- [ ] Focus states are visible and consistent
- [ ] Loading states appear correctly
- [ ] Empty states display properly
- [ ] Toast notifications appear in correct position
- [ ] Modal dialogs center properly
- [ ] Forms validate and show errors clearly

### Animation Tests

- [ ] Page transitions are smooth
- [ ] Grid items stagger on load
- [ ] Cards lift on hover
- [ ] Buttons scale on press
- [ ] Stars fill smoothly when rating
- [ ] Skeleton loaders shimmer
- [ ] No janky animations (maintain 60fps)

### Responsive Tests

- [ ] Mobile (375px): All components usable
- [ ] Tablet (768px): Layout adjusts appropriately
- [ ] Desktop (1280px): Optimal spacing
- [ ] Large desktop (1920px): Content not too wide

### Accessibility Tests

- [ ] Keyboard navigation works throughout
- [ ] Focus order is logical
- [ ] Screen reader announcements work
- [ ] Color contrast meets WCAG AA
- [ ] Interactive elements have proper ARIA labels

### Cross-browser Tests

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## Performance Considerations

### Bundle Size

- Tree-shake unused components
- Use dynamic imports for heavy components
- Keep framer-motion animations simple

### Animation Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Debounce rapid animations

### Image Loading

- Use Next.js `<Image>` component where possible
- Show skeleton while images load
- Lazy load images below the fold

---

## Documentation Updates

### Add to README.md

Document the new UI component system:

```markdown
## UI Component Library

This project uses [shadcn/ui](https://ui.shadcn.com/) for components, built on:
- Radix UI primitives (accessibility)
- Tailwind CSS (styling)
- Framer Motion (animations)

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Animation Guidelines

- Use Framer Motion for React-based animations
- Keep animations subtle and purposeful
- Maintain 60fps by animating only `transform` and `opacity`
- Use stagger effects for lists

### Toast Notifications

Import from `sonner`:
```typescript
import { toast } from 'sonner';

toast.success('Action completed!');
toast.error('Something went wrong');
```
```

---

## Migration Strategy

### Week 1: Foundation
1. Install dependencies
2. Configure shadcn/ui
3. Add toast provider
4. Create skeleton components

### Week 2: Authentication & Forms
1. Update login/register pages
2. Enhance all form inputs
3. Add loading states to buttons

### Week 3: Book Library
1. Transform book cards
2. Add grid animations
3. Update filters
4. Polish add/edit forms

### Week 4: Search & Recommendations
1. Enhance search interface
2. Polish recommendation cards
3. Upgrade star ratings
4. Add AI generation animations

### Week 5: Polish & Testing
1. Update preferences page
2. Enhance navigation/header
3. Add page transitions
4. Comprehensive testing
5. Performance optimization

---

## Success Criteria

- [ ] All pages use shadcn/ui components consistently
- [ ] Smooth animations throughout (no jank)
- [ ] All loading states use skeletons
- [ ] Toast notifications replace banner alerts
- [ ] Forms have clear validation feedback
- [ ] Hover/focus states are prominent
- [ ] Dark mode works perfectly
- [ ] Mobile responsive on all pages
- [ ] Lighthouse performance score > 90
- [ ] Lighthouse accessibility score > 95
- [ ] No console errors or warnings
- [ ] User feedback: "feels professional and modern"

---

## Notes

- **Non-breaking**: All changes are visual only, no API/backend modifications needed
- **Incremental**: Can be deployed page-by-page for gradual rollout
- **Reversible**: Original styles can be restored if needed
- **Accessible**: shadcn/ui and Radix UI ensure WCAG compliance
- **Performant**: Framer Motion is optimized for 60fps animations
- **Maintainable**: Standardized components reduce code duplication

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Sonner Toast](https://sonner.emilkowal.ski/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
