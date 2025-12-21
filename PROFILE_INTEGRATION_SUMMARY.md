# Profile Pages Integration Summary

## Overview
Updated Profile and EditProfile pages to fetch and save real user data from the backend API instead of displaying hardcoded placeholder data.

## Files Modified

### 1. types/api.ts
**Changes:**
- Updated `MeResponse` interface to match backend response structure with nested `Profiles` object
- Added fields: `Profiles` containing `first_name`, `last_name`, `avatar_url`, `bio`, `github_url`, `linkedin_url`, `phone`
- Removed top-level fields that don't exist in backend: `is_verified`, `institution`, `portfolio_url`
- Created legacy `UserProfile` interface for backward compatibility

**Backend Response Structure:**
```typescript
{
  id: string;
  email: string;
  role: 'participant' | 'judge' | 'admin';
  Profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
    phone?: string;
  };
}
```

### 2. services/auth.service.ts
**Changes:**
- Updated `me()` method to extract `user` from nested response: `response.data.user`
- Updated `updateProfile()` method to use snake_case field names matching backend API:
  - `first_name`, `last_name`, `avatar_url`, `bio`, `phone`, `linkedin_url`, `github_url`
- Changed return type to include response message and profile data

**API Endpoints Used:**
- `GET /api/auth/me` - Fetch current user profile
- `POST /api/auth/user/edit` - Update profile fields

### 3. pages/Profile.tsx
**Changes:**
- **Added State Management:**
  - `user`: MeResponse | null
  - `isLoading`: boolean
  - `error`: string | null

- **Added useEffect Hook:**
  - Fetches profile data on component mount using `authService.me()`
  - Sets loading and error states appropriately

- **Added Loading State UI:**
  - Spinner with "Loading profile..." message
  - Centered full-height display

- **Added Error State UI:**
  - Error message with retry button
  - Red-themed error display

- **Updated Profile Display:**
  - Avatar: Shows `user.Profiles.avatar_url` if available, otherwise displays initials from first/last name
  - Name: Displays `${user.Profiles.first_name} ${user.Profiles.last_name}`
  - Role Badge: Shows user.role (participant/judge/admin)
  - Email: Displays `user.email`
  - Bio: Shows `user.Profiles.bio` if available, otherwise shows placeholder message
  - Social Links: Conditionally renders GitHub and LinkedIn links from `user.Profiles.github_url` and `user.Profiles.linkedin_url`
  - Empty State: Shows "No social links added yet" when both are missing

- **Removed Fields (Not in Backend):**
  - Institution
  - Portfolio URL
  - Achievements/Stats (wins, streak)
  - Tech Stack
  - Work Experience

**Helper Functions:**
- `getInitials()`: Generates 2-letter initials from first and last name
- `fullName`: Computed full name string

### 4. pages/EditProfile.tsx
**Changes:**
- **Added State Management:**
  - `user`: MeResponse | null
  - `isFetching`: boolean (separate from save loading)
  - `error`: string | null
  - `successMessage`: string | null
  - Form fields: `firstName`, `lastName`, `bio`, `githubUrl`, `linkedinUrl`, `phone`, `avatarUrl`

- **Added useEffect Hook:**
  - Fetches existing profile data on mount
  - Pre-populates all form fields with current values
  - Sets avatar preview from existing avatar_url

- **Updated handleSave Function:**
  - Async function that calls `authService.updateProfile()`
  - Sends only non-empty fields to backend
  - Shows success message on successful save
  - Shows error message on failure
  - Navigates back to profile page after 1 second delay
  - Properly handles loading states

- **Added Loading State UI:**
  - Full-screen spinner while fetching initial data
  - "Loading profile..." message

- **Added Error/Success Messages:**
  - Error banner (red) displayed at top when save fails
  - Success banner (green) displayed when save succeeds
  - Both auto-dismiss on next action

- **Updated Form Inputs (General Tab):**
  - Converted all inputs to controlled components
  - First Name: Required field, uses `value` and `onChange`
  - Last Name: Required field, uses `value` and `onChange`
  - Phone: Optional field with placeholder
  - Bio: Textarea with controlled value
  - Removed fields not in backend: Display Name, Current Role, Location, Website

- **Updated Form Inputs (Social Tab):**
  - GitHub URL: Controlled input with full URL placeholder
  - LinkedIn URL: Controlled input with full URL placeholder
  - Removed Twitter/X (not in backend schema)

- **Updated Avatar Display:**
  - Shows initials computed from firstName and lastName state
  - Displays avatar preview from avatarUrl

- **Experience Tab:**
  - Kept UI but marked as not connected to backend
  - Data is not saved (backend doesn't have work experience table)

## Backend API Contract

### GET /api/auth/me
**Response:**
```json
{
  "message": "User details retrieved successfully.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "participant",
    "Profiles": {
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://...",
      "bio": "...",
      "github_url": "https://github.com/...",
      "linkedin_url": "https://linkedin.com/in/...",
      "phone": "+91..."
    }
  }
}
```

### POST /api/auth/user/edit
**Request Body (all fields optional):**
```json
{
  "first_name": "string",
  "last_name": "string",
  "avatar_url": "string",
  "bio": "string",
  "phone": "string",
  "linkedin_url": "string",
  "github_url": "string"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

**Allowed Fields (backend validation):**
- `first_name` (NOT NULL in DB)
- `last_name` (NOT NULL in DB)
- `avatar_url`
- `bio`
- `phone`
- `linkedin_url`
- `github_url`

## Testing Checklist

### Profile Page
- [ ] Page loads without errors
- [ ] Spinner shows while fetching data
- [ ] User data displays correctly (name, email, avatar)
- [ ] Initials show when no avatar URL
- [ ] Bio displays or shows placeholder when empty
- [ ] GitHub link shows when URL exists
- [ ] LinkedIn link shows when URL exists
- [ ] Empty state shows when no social links
- [ ] "Edit Profile" button navigates to edit page
- [ ] Error state shows with retry button on API failure

### Edit Profile Page
- [ ] Page loads and fetches existing data
- [ ] Form fields populate with current values
- [ ] Avatar preview shows existing avatar or initials
- [ ] First Name and Last Name are editable
- [ ] Bio textarea works correctly
- [ ] Phone input accepts text
- [ ] GitHub URL input works
- [ ] LinkedIn URL input works
- [ ] Save button shows loading spinner
- [ ] Success message appears after successful save
- [ ] Error message appears on save failure
- [ ] Page navigates back to profile after save
- [ ] Back button works correctly
- [ ] Experience tab UI displays (but doesn't save)

## Known Limitations

1. **File Upload Not Implemented:**
   - Avatar and banner uploads show preview but don't actually upload files
   - Would need file upload service integration

2. **Experience Section:**
   - UI exists in EditProfile but data is not saved to backend
   - Backend has no work_experience table

3. **Missing Backend Fields:**
   - Stats/Achievements (wins, streak count)
   - Tech Stack/Skills
   - Institution
   - Portfolio URL (separate from LinkedIn/GitHub)
   - Verification status display

4. **No Form Validation:**
   - Frontend doesn't validate URLs
   - Backend handles validation for required fields
   - Consider adding frontend validation for better UX

## Future Enhancements

1. Add file upload integration for avatar
2. Add URL format validation on frontend
3. Add character limits for bio (with counter)
4. Implement phone number format validation
5. Add "unsaved changes" warning when navigating away
6. Consider adding institution and portfolio fields to backend
7. Add work experience table to backend if needed
8. Implement achievements/stats tracking
9. Add skills/tech stack management
