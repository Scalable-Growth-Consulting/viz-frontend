import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
type AuthResultData = { user: User | null; session: Session | null };
type OAuthResultData = { provider: Provider; url: string | null };

type SupabaseSignInResponse = {
  data: AuthResultData;
  error: AuthError | null;
};

type SupabaseOAuthResponse = {
  data: OAuthResultData;
  error: AuthError | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<SupabaseSignInResponse>;
  signIn: (email: string, password: string) => Promise<SupabaseSignInResponse>;
  signInWithGoogle: () => Promise<SupabaseOAuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>;

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
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        navigate('/');
      }

      if (event === 'SIGNED_IN' && session?.provider_token) {
        handleBasicOAuthCallback(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleBasicOAuthCallback = async (session: Session) => {
    try {
      if (session.provider_token && session.provider_refresh_token) {
        const { error } = await supabase
          .from('user_oauth_credentials')
          .upsert({
            user_id: session.user.id,
            provider: 'google',
            access_token_encrypted: session.provider_token,
            refresh_token_encrypted: session.provider_refresh_token,
            token_expires_at: new Date(Date.now() + 86400000).toISOString(),
            scopes: [
              'https://www.googleapis.com/auth/userinfo.email',
              'https://www.googleapis.com/auth/userinfo.profile',
            ],
            is_bigquery_connected: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,provider',
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
      options: { data: { full_name: fullName } },
    });
    return { data: { user: data.user, session: data.session }, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data: { user: data.user, session: data.session }, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    return { data: { provider: data.provider, url: data.url }, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
  // set redirectTo to the page that will handle password reset on your host
  const redirectTo = `${window.location.origin}/forgot-password`;
  console.log('reset called, redirectTo=', redirectTo);
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { data, error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


