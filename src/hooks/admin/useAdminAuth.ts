import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AdminAuthState } from '../../types/admin';

export const useAdminAuth = (): AdminAuthState & {
  signOut: () => Promise<void>;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  // Tracks whether authorization check has completed for the current user
  const [authorizationChecked, setAuthorizationChecked] = useState(false);

  const checkAuthorization = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setIsAuthorized(false);
      setAuthorizationChecked(true);
      return;
    }

    try {
      // SECURITY: Enhanced authorization check with multiple validation layers
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('is_active, email')
        .eq('email', userEmail.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('User not found in admin_accounts or inactive:', userEmail);
        setIsAuthorized(false);
      } else {
        // SECURITY: Additional verification that the email matches exactly
        if (
          data.email.toLowerCase() === userEmail.toLowerCase() &&
          data.is_active === true
        ) {
          setIsAuthorized(true);
        } else {
          console.log('Email mismatch or inactive account:', userEmail);
          setIsAuthorized(false);
        }
      }
      setAuthorizationChecked(true);
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
      setAuthorizationChecked(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check initial session (guard errors so loading always clears)
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);

        if (currentUser?.email) {
          // don't await here so loading always clears quickly
          // reset authorizationChecked while a fresh check runs
          setAuthorizationChecked(false);
          checkAuthorization(currentUser.email);
        } else {
          setIsAuthorized(false);
          setAuthorizationChecked(true);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setIsAuthorized(false);
      } finally {
        // Add small delay to prevent flash, then clear loading
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, 500);
      }
    })();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        const currentUser = session?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);

        if (currentUser?.email) {
          setAuthorizationChecked(false);
          // don't await here either
          checkAuthorization(currentUser.email);
        } else {
          setIsAuthorized(false);
          setAuthorizationChecked(true);
        }
      } catch (error) {
        console.error('Error on auth state change:', error);
        setIsAuthorized(false);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      try {
        subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthorized(false);
  };

  return {
    user,
    // keep loading true until auth session and authorization check complete
    loading: loading || (user !== null && !authorizationChecked),
    isAuthorized,
    signOut,
  };
};
