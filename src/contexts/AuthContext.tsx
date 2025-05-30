import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
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

        // Handle OAuth callback for BigQuery
        if (event === 'SIGNED_IN' && session?.provider_token) {
          await handleOAuthCallback(session);
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

  const handleOAuthCallback = async (session: Session) => {
    try {
      if (session.provider_token && session.provider_refresh_token) {
        // Store OAuth credentials
        const { error } = await supabase
          .from('user_oauth_credentials')
          .upsert({
            user_id: session.user.id,
            provider: 'google',
            access_token_encrypted: session.provider_token, // TODO: Encrypt before storing
            refresh_token_encrypted: session.provider_refresh_token, // TODO: Encrypt before storing
            token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            scopes: ['https://www.googleapis.com/auth/bigquery.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
            is_bigquery_connected: true,
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
        redirectTo: `${window.location.origin}/data-control`,
        scopes: 'https://www.googleapis.com/auth/bigquery.readonly https://www.googleapis.com/auth/userinfo.email',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
