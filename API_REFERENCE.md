# Quick API Integration Reference

## 🚀 Quick Start

### Using Authentication
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Check if user is logged in
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  // Access user data
  return <div>Hello, {user.firstName}!</div>;
}
```

### Making API Calls
```tsx
import apiClient from './lib/axios';
import { ENDPOINTS } from './config/endpoints';

// GET request
const teams = await apiClient.get(ENDPOINTS.TEAMS.MY_TEAMS);

// POST request
await apiClient.post(ENDPOINTS.TEAMS.CREATE, {
  name: 'My Team',
  hackathonId: '123'
});

// With URL parameters
const team = await apiClient.get(ENDPOINTS.TEAMS.DETAIL('team-id-123'));
```

### Using Services
```tsx
import authService from './services/auth.service';
import teamService from './services/team.service';

// Login
await authService.login('email@example.com', 'password');

// Get teams
const teams = await teamService.getMyTeams();
```

## 🔐 Authentication States

### Check User Role
```tsx
import { useRole } from './contexts/AuthContext';

function AdminButton() {
  const isAdmin = useRole('admin');
  
  if (!isAdmin) return null;
  
  return <button>Admin Action</button>;
}
```

### Check Multiple Roles
```tsx
const canManage = useRole(['admin', 'judge']);
```

## 🛡️ Protected Routes

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Require authentication
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Require specific role
<Route path="/admin/panel" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Multiple roles allowed
<Route path="/manage" element={
  <ProtectedRoute allowedRoles={['admin', 'judge']}>
    <ManagePage />
  </ProtectedRoute>
} />
```

## 📡 Common API Patterns

### Handle Loading State
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const fetchData = async () => {
  setLoading(true);
  setError('');
  try {
    const data = await apiClient.get('/endpoint');
    // Handle success
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Upload Files
```tsx
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  await apiClient.upload(
    ENDPOINTS.SUBMISSIONS.UPLOAD_FILE('submission-id'),
    formData,
    (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      console.log(`Upload: ${progress}%`);
    }
  );
};
```

### Handle Errors
```tsx
import { ApiError } from './lib/axios';

try {
  await apiClient.post('/endpoint', data);
} catch (error) {
  const apiError = error as ApiError;
  
  if (apiError.status === 400) {
    // Bad request - show validation errors
    console.error(apiError.message);
  } else if (apiError.status === 403) {
    // Forbidden - insufficient permissions
    alert('You do not have permission');
  } else {
    // Other errors
    console.error(apiError.message);
  }
}
```

## 🎯 Setting Hackathon Context

Many routes require a selected hackathon ID:

```tsx
// Set hackathon ID (stored in localStorage)
localStorage.setItem('selectedHackathonId', 'hackathon-123');

// Clear hackathon ID
localStorage.removeItem('selectedHackathonId');

// The axios interceptor will automatically add this to headers
```

## 📝 TypeScript Types

### Import Types
```tsx
import { 
  User, 
  Team, 
  Hackathon, 
  Submission 
} from './types/api';

const [team, setTeam] = useState<Team | null>(null);
```

### User Role Type
```tsx
import { UserRole } from './contexts/AuthContext';

const role: UserRole = 'participant'; // 'judge' | 'admin'
```

## 🔄 Refresh User Data

```tsx
const { refetchUser } = useAuth();

// After updating profile
await authService.updateProfile(profileData);
await refetchUser(); // Refresh user data in context
```

## 🚪 Logout

```tsx
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is automatically redirected to landing page
};
```

## 🌐 Environment Variables

Access in components:
```tsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

## 💡 Tips

1. **Always use services** instead of direct API calls for consistency
2. **Handle loading states** for better UX
3. **Show error messages** to users when API calls fail
4. **Use TypeScript types** for type safety
5. **Check authentication** before making protected API calls
6. **Set hackathon ID** before accessing hackathon-scoped routes
7. **Use try-catch** blocks for all async operations
8. **Clear tokens on logout** to prevent stale sessions

## 📊 Backend API Structure

### URL Pattern
```
Base URL: http://localhost:4000/api

Auth: /auth/*
Public: /public/*
Teams: /teams/*
Submissions: /submissions/*
Notifications: /notifications/*

Participant: /participant/*
Judge: /judge/*
Admin: /admin/*
```

### Required Headers
```
Authorization: Bearer <token>         // For authenticated routes
x-hackathon-id: <hackathon-id>       // For hackathon-scoped routes
Content-Type: application/json       // For JSON requests
```

The axios client automatically adds these headers! ✨
