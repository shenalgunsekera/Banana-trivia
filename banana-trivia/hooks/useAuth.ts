'use client';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear auth on page refresh (session-only persistence)
    if (typeof window !== 'undefined') {
      // Check if this is a page refresh
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const isRefresh = navEntry?.type === 'reload' || 
                        (performance.navigation && (performance.navigation as any).type === 1);
      
      if (isRefresh) {
        // Clear auth on refresh
        signOut(auth).catch(() => {
          // Ignore errors if already signed out
        });
        setUser(null);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle popup blocked
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      }
      // Handle popup closed
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, logout };
}