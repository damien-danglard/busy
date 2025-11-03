# Authentication Flow Diagram

## User Registration Flow

```
User → /register
  ↓
Register Page (register/page.tsx)
  ↓ (submit form)
POST /api/register
  ↓
Validation:
  - Email format check
  - Password strength check (≥8 chars)
  - Duplicate email check
  ↓
bcrypt.hash(password, 10)
  ↓
prisma.user.create()
  ↓
Auto sign-in via signIn('credentials')
  ↓
Redirect to / (chat page)
```

## User Login Flow

```
User → /login
  ↓
Login Page (login/page.tsx)
  ↓ (submit form)
signIn('credentials', { email, password })
  ↓
NextAuth API (/api/auth/[...nextauth])
  ↓
CredentialsProvider.authorize()
  ↓
prisma.user.findUnique({ email })
  ↓
bcrypt.compare(password, user.password)
  ↓
Return user object if valid
  ↓
JWT created with user.id
  ↓
Session cookie set
  ↓
Redirect to / (chat page)
```

## Protected Route Access Flow

```
User → / (chat page)
  ↓
useSession() hook
  ↓
Check session status:
  - loading → Show "Loading..."
  - unauthenticated → Redirect to /login
  - authenticated → Show chat interface
```

## Chat API Request Flow

```
Client → POST /api/chat
  ↓
getSession() (server-side)
  ↓
Check session:
  - No session → Return 401 Unauthorized
  - Valid session → Process request
    ↓
    chatWithLangChain(messages)
    ↓
    prisma.message.create() (x2)
    ↓
    Return response
```

## Session Management

```
JWT Session Strategy:
  ↓
Login → JWT created with:
  - user.id
  - user.email
  - expiration
  ↓
JWT stored in HTTP-only cookie
  ↓
Client requests include cookie automatically
  ↓
Server validates JWT on each request
  ↓
Session data available via:
  - Client: useSession() hook
  - Server: getServerSession(authOptions)
```

## Logout Flow

```
User clicks "Sign Out"
  ↓
signOut({ callbackUrl: '/login' })
  ↓
NextAuth API clears session cookie
  ↓
Redirect to /login
```

## Key Security Points

1. **Passwords Never Stored Plain Text**
   - bcrypt hashing with 10 salt rounds
   - Irreversible hash function

2. **Session Security**
   - HTTP-only cookies (not accessible to JavaScript)
   - Secure flag in production (HTTPS only)
   - JWT signed with NEXTAUTH_SECRET

3. **Input Validation**
   - Client-side: HTML5 validation (minLength, type="email")
   - Server-side: Regex validation, password strength

4. **API Protection**
   - All protected routes check session
   - 401 responses for unauthorized access

5. **CSRF Protection**
   - NextAuth built-in CSRF protection
   - Tokens validated on state-changing requests
