import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Check for OAuth callback specific parameters if needed, though Supabase usually handles this internally.
      // For a basic callback, we just ensure the user is logged in.
      if (user) {
        navigate('/');
      } else {
        // If no user after loading, means auth failed or no session was found
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Loader2 className="w-8 h-8 animate-spin text-viz-accent" />
      <p className="ml-3 text-viz-text-secondary">Authenticating...</p>
    </div>
  );
};

export default AuthCallback; 