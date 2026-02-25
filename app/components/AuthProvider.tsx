'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, verifyAuth, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check on login page
      if (pathname === '/login') {
        // If already logged in, redirect to dashboard
        if (isAuthenticated()) {
          const valid = await verifyAuth();
          if (valid) {
            router.replace('/');
            return;
          }
        }
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      // Verify token is still valid
      const valid = await verifyAuth();
      if (!valid) {
        router.replace('/login');
        return;
      }

      setIsLoggedIn(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const logout = () => {
    authLogout();
    setIsLoggedIn(false);
    router.replace('/login');
  };

  // Show loading state while checking auth
  if (isLoading && pathname !== '/login') {
    return (
      <div className="fixed inset-0 bg-[#faf9f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--verde-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[var(--verde-text)] uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
