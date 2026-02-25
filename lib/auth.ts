/**
 * Auth Utility Functions for Verde CMS
 * Access Token + Refresh Token pattern with localStorage
 */

const ACCESS_TOKEN_KEY = 'cms_access_token';
const REFRESH_TOKEN_KEY = 'cms_refresh_token';

// Get backend API URL
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

// ─── Token Storage ─────────────────────────────────────────────────────────────

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setAccessToken = (accessToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ─── Token Refresh ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const refreshAccessToken = async (): Promise<boolean> => {
  // Prevent multiple simultaneous refresh requests
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();

      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
      
      // Refresh failed - clear tokens
      clearTokens();
      return false;
    } catch {
      clearTokens();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─── Auth Headers ──────────────────────────────────────────────────────────────

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ─── Authenticated Fetch with Auto-Refresh ─────────────────────────────────────

export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${getBackendUrl()}${endpoint}`;

  const makeRequest = async () => {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest();

  // If 401 with TOKEN_EXPIRED, try to refresh
  if (response.status === 401) {
    const data = await response.clone().json().catch(() => ({}));
    
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        response = await makeRequest();
      }
    }
  }

  return response;
};

// ─── Login ─────────────────────────────────────────────────────────────────────

export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      return { success: true };
    }

    return { success: false, message: data.message || 'Login failed' };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

// ─── Logout ────────────────────────────────────────────────────────────────────

export const logout = (): void => {
  clearTokens();
};

// ─── Auth Check ────────────────────────────────────────────────────────────────

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Verify token is still valid (optional - for initial load)
export const verifyAuth = async (): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const res = await authFetch('/auth/verify');
    if (res.ok) return true;
    
    // Token might be expired, authFetch auto-refreshes
    return res.ok;
  } catch {
    return false;
  }
};

// Legacy exports for backward compatibility
export const getAuthToken = getAccessToken;
export const setAuthToken = (token: string) => setAccessToken(token);
