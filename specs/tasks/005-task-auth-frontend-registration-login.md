# Task 005: User Authentication Frontend - Registration and Login UI

**Feature**: User Authentication (FRD-005)  
**Dependencies**: Task 002 (Frontend Scaffolding), Task 004 (Auth Backend)  
**Estimated Complexity**: Medium

---

## Description

Build registration and login pages in Next.js with form validation, error handling, and authentication state management. Integrate with backend authentication API.

---

## Technical Requirements

### Pages

Create in `app/(auth)/`:

#### `app/(auth)/register/page.tsx`
- Registration form with email, password, confirm password, display name fields
- Client-side validation (email format, password strength, passwords match)
- Submit calls POST /api/auth/register
- Success redirects to library page
- Error displays validation messages

#### `app/(auth)/login/page.tsx`
- Login form with email, password, "Remember Me" checkbox
- Client-side validation
- Submit calls POST /api/auth/login
- Success redirects to library page or previous page
- Error displays authentication failure message

### Components

Create in `components/auth/`:

#### `RegisterForm.tsx`
- Form fields: email, password, confirmPassword, displayName
- Real-time validation feedback
- Password strength indicator
- Submit button with loading state
- Error message display

#### `LoginForm.tsx`
- Form fields: email, password, rememberMe checkbox
- Submit button with loading state
- "Forgot password?" link (placeholder)
- Error message display

### Authentication Context

Create `lib/contexts/AuthContext.tsx`:
- Stores current user state (userId, email, displayName)
- Provides `isAuthenticated` boolean
- Provides `isLoading` boolean during initial check
- Exposes `login()`, `logout()`, `register()` functions
- Fetches current user on mount (GET /api/auth/me)

### API Client Functions

Create in `lib/api/auth.ts`:
- `register(email, password, displayName)`: POST /api/auth/register
- `login(email, password, rememberMe)`: POST /api/auth/login
- `logout()`: POST /api/auth/logout
- `getCurrentUser()`: GET /api/auth/me
- All functions handle errors and return typed responses

### Form Validation

Use Zod for validation schemas:

```typescript
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
  displayName: z.string().max(100).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Protected Routes

Create middleware or client-side guards:
- Redirect to `/login` if accessing protected pages while unauthenticated
- Store intended destination for post-login redirect

---

## Acceptance Criteria

### Registration Page
- [ ] Registration form displays with all required fields
- [ ] Email field validates format on blur
- [ ] Password strength indicator shows weak/medium/strong
- [ ] Confirm password validates match in real-time
- [ ] Submit button disabled until form is valid
- [ ] Loading state shown during API call
- [ ] Success redirects to library page
- [ ] Validation errors displayed inline for each field
- [ ] Server errors (duplicate email) displayed clearly
- [ ] Form accessible via keyboard navigation

### Login Page
- [ ] Login form displays with email, password, Remember Me
- [ ] Submit button disabled until form has values
- [ ] Loading state shown during API call
- [ ] Success redirects to library page or intended destination
- [ ] Invalid credentials show clear error message
- [ ] Account locked error displays lockout duration
- [ ] "Forgot password?" link visible (placeholder for v1)
- [ ] Form accessible via keyboard navigation

### Authentication State
- [ ] AuthContext provides current user data when authenticated
- [ ] `isAuthenticated` is true after successful login
- [ ] `isAuthenticated` is false after logout
- [ ] Current user fetched on app load if token exists
- [ ] Loading state prevents flicker during authentication check
- [ ] Logout clears user state and redirects to home

### Protected Routes
- [ ] Unauthenticated users redirected to /login
- [ ] Post-login redirect returns to intended page
- [ ] Authenticated users cannot access /login or /register (redirect to library)

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Cases**:

1. **RegisterForm Component**:
   - Displays all form fields
   - Validates email format
   - Shows password strength indicator
   - Validates password match
   - Calls register API on submit
   - Displays server validation errors
   
2. **LoginForm Component**:
   - Displays email and password fields
   - Validates required fields
   - Calls login API on submit
   - Displays authentication errors
   - Handles "Remember Me" checkbox
   
3. **AuthContext**:
   - Fetches current user on mount
   - Updates state on login
   - Clears state on logout
   - Provides isAuthenticated boolean

### Integration Tests

**Test Cases**:
1. **Registration Flow**:
   - User can navigate to registration page
   - User can fill form and submit
   - Success redirects to library
   - Duplicate email shows error
   
2. **Login Flow**:
   - User can navigate to login page
   - User can submit credentials
   - Success redirects to library
   - Invalid credentials show error

---

## Definition of Done

- [ ] All pages and components created
- [ ] All unit tests pass with ≥85% coverage
- [ ] Forms validate inputs correctly
- [ ] API integration works end-to-end
- [ ] Authentication state managed correctly
- [ ] Protected routes redirect unauthenticated users
- [ ] UI is responsive and accessible
- [ ] Code reviewed and approved
