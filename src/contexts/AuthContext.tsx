import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthResultData = { user: User | null; session: Session | null; };
type OAuthResultData = { provider: Provider; url: string | null; };

type SupabaseSignInResponse = 
  | { data: AuthResultData; error: null; }
  | { data: { user: null; session: null; }; error: AuthError; };

type SupabaseOAuthResponse = 
  | { data: OAuthResultData; error: null; }
  | { data: { provider: Provider; url: null; }; error: AuthError; };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<SupabaseSignInResponse>;
  signIn: (email: string, password: string) => Promise<SupabaseSignInResponse>;
  signInWithGoogle: () => Promise<SupabaseOAuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Only handle basic OAuth callback for regular authentication
        if (event === 'SIGNED_IN' && session?.provider_token && !window.location.pathname.includes('/data-control')) {
          await handleBasicOAuthCallback(session);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleBasicOAuthCallback = async (session: Session) => {
    try {
      if (session.provider_token && session.provider_refresh_token) {
        // Store basic OAuth credentials without BigQuery access
        const { error } = await supabase
          .from('user_oauth_credentials')
          .upsert({
            user_id: session.user.id,
            provider: 'google',
            access_token_encrypted: session.provider_token,
            refresh_token_encrypted: session.provider_refresh_token,
            token_expires_at: new Date(Date.now() + 3600000).toISOString(),
            scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            is_bigquery_connected: false, // Not connected to BigQuery yet
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,provider'
          });

        if (error) {
          console.error('Error storing OAuth credentials:', error);
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log('Attempting to sign out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        // Even if there's a minor error, attempt to clear local state and redirect
      } else {
        console.log('Supabase sign out successful. Redirecting...');
      }
    } catch (e) {
      console.error('Unexpected error during sign out:', e);
    } finally {
      // Always redirect after attempting sign out
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
