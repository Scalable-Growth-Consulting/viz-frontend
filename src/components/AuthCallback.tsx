import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleIntegrationUpdate = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const integration = params.get('integration');

        if (!integration || !user) return;

        // Currently only Google provider is supported for integrations
        const provider = 'google';

        // Fetch existing row to merge scopes
        const { data: existing, error: fetchError } = await supabase
          .from('user_oauth_credentials')
          .select('scopes, is_bigquery_connected')
          .eq('user_id', user.id)
          .eq('provider', provider)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Failed fetching existing OAuth credentials:', fetchError);
        }

        const currentScopes: string[] = Array.isArray(existing?.scopes) ? existing!.scopes as string[] : [];
        let newScopes = new Set(currentScopes);
        let updates: Record<string, any> = {};

        if (integration === 'bigquery') {
          // Mark BQ connected and add BQ scopes
          newScopes.add('https://www.googleapis.com/auth/bigquery.readonly');
          newScopes.add('https://www.googleapis.com/auth/userinfo.email');
          newScopes.add('https://www.googleapis.com/auth/userinfo.profile');
          updates.is_bigquery_connected = true;
        }

        if (integration === 'mia-google') {
          // Add Google Ads scope required by MIA
          newScopes.add('https://www.googleapis.com/auth/adwords');
          newScopes.add('https://www.googleapis.com/auth/userinfo.email');
          newScopes.add('https://www.googleapis.com/auth/userinfo.profile');
        }

        if (Object.keys(updates).length > 0 || newScopes.size !== currentScopes.length) {
          const { error: updateError } = await supabase
            .from('user_oauth_credentials')
            .upsert({
              user_id: user.id,
              provider,
              scopes: Array.from(newScopes),
              ...updates,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,provider',
            });

          if (updateError) {
            console.error('Failed updating OAuth credentials after callback:', updateError);
          }
        }

        // Clean the URL after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Auth callback integration handler error:', err);
      }
    };

    if (!loading) {
      if (user) {
        handleIntegrationUpdate().finally(() => navigate('/'));
      } else {
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