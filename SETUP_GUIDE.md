# Frontend-Backend Integration Setup Guide

## 🎯 Overview

This document outlines the complete setup for connecting the HackOnX platform frontend (React + Vite) with the backend (Node.js + Express). The platform supports three portals: **Participant**, **Judge**, and **Admin**.

---

## 📦 What Has Been Set Up

### 1. **Environment Configuration**
- Created `.env` and `.env.example` files
- Environment variables:
  - `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:4000/api`)
  - `VITE_FRONTEND_URL`: Frontend URL (default: `http://localhost:5173`)
  - `VITE_RECAPTCHA_SITE_KEY`: Optional reCAPTCHA site key

### 2. **API Client** (`lib/axios.ts`)
- Axios-based HTTP client with interceptors
- Automatic JWT token injection from localStorage
- Automatic hackathon ID injection (from `x-hackathon-id` header)
- Centralized error handling
- Automatic redirect to login on 401 (Unauthorized)
- Support for file uploads with progress tracking
- **Features:**
  - Request interceptor: Adds `Authorization: Bearer <token>` header
  - Response interceptor: Handles 401, 403, and network errors
  - Credentials enabled (`withCredentials: true`) for cookie-based auth

### 3. **Authentication Context** (`contexts/AuthContext.tsx`)
- React Context for managing authentication state
- **Functions:**
  - `login(email, password)`: Authenticate user
  - `signup(firstName, lastName, email, password)`: Register new user
  - `logout()`: Clear session and redirect
  - `verifyEmail(token)`: Verify email with token
  - `updateUser(userData)`: Update user profile locally
  - `refetchUser()`: Fetch latest user data from server
- **State:**
  - `user`: Current user object (id, email, role, firstName, lastName, etc.)
  - `isAuthenticated`: Boolean flag
  - `isLoading`: Loading state during auth check
- **Custom Hooks:**
  - `useAuth()`: Access auth context
  - `useRole(requiredRole)`: Check if user has specific role

### 4. **Protected Routes** (`components/ProtectedRoute.tsx`)
- `<ProtectedRoute>`: Wraps routes requiring authentication
- Role-based access control (e.g., `allowedRoles={['admin']}`)
- `<PublicRoute>`: Redirects authenticated users away from public pages (e.g., login)
- Automatic redirection based on user role:
  - `participant` → `/dashboard`
  - `judge` → `/judge/dashboard`
  - `admin` → `/admin/dashboard`

### 5. **Updated App.tsx**
- Wrapped entire app with `<AuthProvider>`
- Applied `<ProtectedRoute>` to all role-specific routes
- Applied `<PublicRoute>` to landing page

### 6. **Service Layers**
Created service files for organized API calls:

#### **Auth Service** (`services/auth.service.ts`)
- `login()`, `signup()`, `logout()`
- `me()`: Get current user
- `verifyEmail()`, `forgotPassword()`, `resetPassword()`
- `updateProfile()`, `updatePassword()`, `updateEmailPreferences()`

#### **Team Service** (`services/team.service.ts`)
- `getMyTeams()`, `getTeamById()`, `createTeam()`, `joinTeam()`
- `updateTeam()`, `leaveTeam()`, `deleteTeam()`
- `inviteMember()`, `removeMember()`
- `getInvitations()`, `respondToInvitation()`

#### **Public Service** (`services/public.service.ts`)
- `getHackathons()`: List all hackathons with filters
- `getHackathonById()`: Get hackathon details
- `getLeaderboard()`: Get public leaderboard

### 7. **API Response Types** (`types/api.ts`)
- TypeScript interfaces for all API responses
- Types for: User, Team, Hackathon, Submission, Evaluation, Notification, etc.
- Dashboard types for all three portals

### 8. **Centralized Endpoints** (`config/endpoints.ts`)
- Updated to match backend routes
- Organized by feature/portal
- Uses environment variable for base URL
- **Sections:**
  - `AUTH`: Authentication endpoints
  - `PARTICIPANT`: Participant-specific endpoints
  - `PUBLIC`: Public endpoints (no auth required)
  - `TEAMS`: Team management
  - `SUBMISSIONS`: Submission management
  - `JUDGE`: Judge portal endpoints
  - `ADMIN`: Admin portal endpoints
  - `HACKATHONS`: Hackathon management (admin)

---

## 🔐 Authentication Flow

### Backend Authentication System
- **Method**: JWT (JSON Web Token)
- **Storage**: HTTP-only cookies (primary) + localStorage (fallback)
- **Roles**: `participant`, `judge`, `admin`
- **Middleware**: 
  - `verifyAuthToken`: Validates JWT from cookie or Authorization header
  - `requireRole`: Restricts access based on user role
  - `requireHackathonId`: Requires `x-hackathon-id` header for scoped routes

### Frontend Authentication Flow
1. **User logs in** → `authService.login()` called
2. **Backend returns** token + user data
3. **Token stored** in localStorage
4. **User data stored** in localStorage + AuthContext state
5. **Subsequent requests** → Axios interceptor adds `Authorization: Bearer <token>` header
6. **Token expires** → 401 response → User redirected to login

### Email Verification Flow
1. User signs up → Verification email sent
2. User clicks link → Frontend receives token
3. Frontend calls `authService.verifyEmail(token)`
4. Backend verifies token from Redis → Marks user as verified

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+ installed
- Backend running on `http://localhost:4000`
- PostgreSQL database configured
- Redis server running (for email verification tokens)

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd "c:\Users\Kishan B M\Documents\hackanox\hackonxdesigns-beta"
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your backend URL:
     ```env
     VITE_API_BASE_URL=http://localhost:4000/api
     VITE_FRONTEND_URL=http://localhost:5173
     ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Backend Setup

1. **Update CORS Configuration**
   - In backend `.env`, set:
     ```env
     FRONTEND_URL=http://localhost:5173
     ```
   - This allows the backend to accept requests from the frontend

2. **Start Backend Server**
   ```bash
   cd "c:\Users\Kishan B M\Documents\Hacknox\kishan-backend\nextor-backend"
   npm run dev
   ```
   Backend will run on `http://localhost:4000`

---

## 🔑 Environment Variables Reference

### Frontend (`.env`)
```env
# Backend API base URL (without trailing slash)
VITE_API_BASE_URL=http://localhost:4000/api

# Frontend URL (for CORS)
VITE_FRONTEND_URL=http://localhost:5173

# Optional: reCAPTCHA site key
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

### Backend (`.env`)
```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=your_postgres_connection_string

# JWT Secret
JWT_SECRET=your_secret_key_here

# Redis (for email verification)
REDIS_URL=redis://localhost:6379

# Email Configuration (for verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# reCAPTCHA (optional)
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

---

## 🚀 Next Steps: Building Login & Signup Pages

Now that the infrastructure is set up, you can create the authentication pages:

### 1. **Create Login Page** (`pages/Login.tsx`)
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // User will be automatically redirected by PublicRoute
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### 2. **Create Signup Page** (`pages/Signup.tsx`)
Similar structure to Login, but use `signup()` from AuthContext

### 3. **Create Email Verification Page** (`pages/VerifyEmail.tsx`)
- Extract token from URL query params
- Call `verifyEmail(token)`
- Show success/error message

### 4. **Add Routes to App.tsx**
```tsx
<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
<Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
<Route path="/verify-email" element={<VerifyEmail />} />
```

---

## 📡 API Usage Examples

### Using Auth Service
```tsx
import authService from '../services/auth.service';

// Login
const response = await authService.login('user@example.com', 'password');

// Get current user
const user = await authService.me();

// Update profile
await authService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  institution: 'MIT',
});
```

### Using Team Service
```tsx
import teamService from '../services/team.service';

// Get my teams
const teams = await teamService.getMyTeams();

// Create team
const newTeam = await teamService.createTeam({
  name: 'Team Awesome',
  hackathonId: 'hackathon-123',
});

// Join team with code
await teamService.joinTeam('ABC123');
```

### Using API Client Directly
```tsx
import apiClient from '../lib/axios';

// Custom API call
const response = await apiClient.get('/custom/endpoint');
const data = response.data;

// Upload file
const formData = new FormData();
formData.append('file', file);
await apiClient.upload('/submissions/123/upload', formData, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use HTTPS in production** (update `secure: true` in cookie options)
3. **Validate inputs on frontend** before sending to backend
4. **Handle errors gracefully** (don't expose sensitive information)
5. **Implement rate limiting** on backend (already present in backend code)
6. **Use reCAPTCHA** on signup/login forms (optional but recommended)

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check backend is using `cors({ origin: process.env.FRONTEND_URL, credentials: true })`

### 401 Unauthorized
- Check if token exists in localStorage
- Verify token hasn't expired (7 days default)
- Ensure backend JWT_SECRET matches

### Network Errors
- Verify backend is running on correct port
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure no firewall blocking requests

### Authentication Not Persisting
- Check if `withCredentials: true` is set in axios config
- Verify browser allows third-party cookies (if frontend/backend on different domains)

---

## 📚 File Structure Summary

```
hackonxdesigns-beta/
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── App.tsx                       # Main app with AuthProvider
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── components/
│   └── ProtectedRoute.tsx        # Route protection components
├── lib/
│   └── axios.ts                  # Configured axios instance
├── config/
│   └── endpoints.ts              # Centralized API endpoints
├── services/
│   ├── auth.service.ts           # Auth API calls
│   ├── team.service.ts           # Team API calls
│   └── public.service.ts         # Public API calls
└── types/
    └── api.ts                    # TypeScript types for API
```

---

## ✅ Checklist

- [x] Environment variables configured
- [x] Axios client with interceptors created
- [x] Authentication context implemented
- [x] Protected routes set up
- [x] Service layers created
- [x] Type definitions added
- [x] Endpoints centralized
- [x] App.tsx updated with AuthProvider
- [x] .gitignore updated
- [x] Axios package installed
- [ ] Login page created
- [ ] Signup page created
- [ ] Email verification page created
- [ ] Password reset pages created
- [ ] Error boundary implemented (recommended)
- [ ] Loading states added (recommended)

---

## 🎉 Ready to Start!

You now have a solid foundation for connecting your frontend to the backend. The next steps are to:

1. **Create authentication pages** (Login, Signup, Verify Email)
2. **Test the authentication flow** end-to-end
3. **Build out individual features** (Teams, Submissions, Judge evaluations, etc.)
4. **Add loading states and error handling** in UI components

Let me know when you're ready to build the login/signup pages or any other specific feature! 🚀
