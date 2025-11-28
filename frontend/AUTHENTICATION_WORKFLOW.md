# Authentication Workflow Documentation

This document describes the implementation of the authentication system in the GoAround frontend application, utilizing Supabase for identity management.

## Overview

The authentication system is built using:
- **Supabase Auth**: For user management, session handling, and secure token storage.
- **Pinia Store (`authStore`)**: For managing application-level authentication state (`user`, `session`, `isAuthenticated`).
- **Axios Interceptors**: For automatically attaching access tokens to API requests and handling token expiration.
- **Authentication Service**: A wrapper around the Supabase client to provide a clean API for the application.

## 1. Configuration

### Supabase Client
The Supabase client is initialized in `src/config/supabase/supabase.ts` using environment variables. It automatically handles:
- **Token Storage**: Persists `access_token` and `refresh_token` in `localStorage`.
- **Auto-Refresh**: Automatically refreshes the access token before it expires.

### Axios Interceptors
Configured in `src/config/axios/axios.ts`:
- **Request Interceptor**: Retrieves the current session using `supabase.auth.getSession()` and attaches the `Authorization: Bearer <token>` header to every request.
- **Response Interceptor**: Listens for `401 Unauthorized` responses. If encountered, it triggers `supabase.auth.signOut()` to clear the invalid session and log the user out.

## 2. Authentication Service

Located in `src/services/authenticationService.ts`, this singleton class provides methods for:
- **`signUp(input: ISignUpInput)`**: Registers a new user. Throws `SignUpFailedException` on error.
- **`signIn(input: ISignInInput)`**: Logs in a user. Throws `SignInFailedException` on error.
- **`signOut()`**: Logs out the user.
- **`getSession()`**: Retrieves the current active session.
- **`getMe()`**: Retrieves the current user details.

## 3. Auth Store

The Pinia store in `src/stores/authStore.ts` manages the reactive state:
- **State**:
  - `user`: The current user object.
  - `session`: The current auth session.
  - `isAuthenticated`: Boolean flag indicating login status.
  - `isLoading`: Loading state for async actions.
  - `error`: Error messages.

- **Actions**:
  - **`initialize()`**: Called on app start. Checks for an existing session and sets up a listener (`onAuthStateChange`) to keep the store in sync with Supabase (e.g., handling auto-refresh or logout).
  - **`register()`**: Calls the service to sign up and updates state.
  - **`login()`**: Calls the service to sign in and updates state.
  - **`logout()`**: Calls the service to sign out and clears state.

## 4. Error Handling

Custom exceptions are defined in `src/utils/exceptions`:
- **`SignUpFailedException`**: Thrown when registration fails.
- **`SignInFailedException`**: Thrown when login fails (e.g., invalid credentials).

The `authStore` catches these exceptions and sets a user-friendly `error` message in the state.

## 5. Usage Example

```typescript
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Login
await authStore.login({ email: 'user@example.com', password: 'password' });

// Check status
if (authStore.isAuthenticated) {
  console.log('User is logged in:', authStore.user);
}

// Logout
await authStore.logout();
```
