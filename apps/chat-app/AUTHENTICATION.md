# Authentication Setup

This application uses NextAuth.js for authentication with a credentials provider (email/password).

## Environment Variables

Add the following environment variables to your `.env` file:

```env
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret key:
```bash
openssl rand -base64 32
```

## Database Migration

The authentication tables are automatically created when you run migrations:

```bash
cd apps/chat-app
npx prisma migrate dev
```

## Seed Demo User

To create the demo user (admin@busy.com / BusyAdmin2024!):

```bash
cd apps/chat-app
npm run db:seed
```

Or using Prisma directly:
```bash
cd apps/chat-app
npx prisma db seed
```

## Features

- **Email/Password Authentication**: Users can register and sign in with email and password
- **Protected Routes**: Chat API requires authentication
- **Session Management**: JWT-based session strategy
- **User Management**: 
  - User registration at `/register`
  - User login at `/login`
  - Automatic redirect to login for unauthenticated users
  - Logout functionality

## Demo Credentials

- **Email**: admin@busy.com
- **Password**: BusyAdmin2024!

> **Note**: This is a demo password for development only. In production, ensure users create strong, unique passwords.

## Usage

### Register a New User

1. Navigate to `/register`
2. Fill in name (optional), email, and password
3. User is automatically signed in after registration

### Sign In

1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"

### Sign Out

Click the "Sign Out" button in the top right corner of the chat page.

## Security Notes

- Passwords are hashed using bcryptjs with 10 salt rounds
- JWT sessions are used instead of database sessions for better performance
- All API routes require authentication
- The NEXTAUTH_SECRET should be changed in production
- Use strong passwords in production

## Prisma Models

The following models are added for NextAuth:

- **User**: Stores user information (id, email, name, password, etc.)
- **Account**: OAuth provider accounts (for future OAuth integration)
- **Session**: User sessions (currently using JWT, but can switch to database sessions)
- **VerificationToken**: Email verification tokens (for future email verification)
