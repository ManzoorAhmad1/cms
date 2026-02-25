/**
 * Auth Utility Functions for Verde CMS
 * Manages JWT token storage and retrieval
 */

const COOKIE_NAME = 'cms_auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Get backend API URL
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

// Get auth token from cookie
export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
};

// Set auth token cookie
export const setAuthToken = (token: string): void => {
  if (typeof document === 'undefined') return;
  // Use Secure flag for HTTPS sites, SameSite=Lax for same-site navigation
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
};

// Clear auth token cookie
export const clearAuthToken = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
};

// Get auth headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Authenticated fetch wrapper
export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${getBackendUrl()}${endpoint}`;
  
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// Login function
export const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.token) {
      setAuthToken(data.token);
      // Debug: verify cookie was set
      console.log('Token set, cookie check:', document.cookie.includes('cms_auth_token'));
      return { success: true };
    }
    
    return { success: false, message: data.message || 'Login failed' };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  // Clear via server-side (handles httpOnly if any)
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors
  }
  // Also clear client-side
  clearAuthToken();
};

// Check if authenticated (client-side)
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
