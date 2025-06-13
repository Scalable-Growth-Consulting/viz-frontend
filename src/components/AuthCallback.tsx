import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // Prepare the data to be upserted
          const upsertData = {
            user_id: session.user.id,
            provider: 'google',
            access_token_encrypted: session.provider_token || null, // Ensure null if undefined
            refresh_token_encrypted: session.provider_refresh_token || null, // Ensure null if undefined
            token_expires_at: new Date(Date.now() + 3600000).toISOString(),
            scopes: ['https://www.googleapis.com/auth/bigquery.readonly'],
            is_bigquery_connected: true,
            updated_at: new Date().toISOString()
          };

          console.log('Session object:', session);
          console.log('Upserting OAuth credentials with data:', upsertData);

          // Store the OAuth credentials
          const { error: credError } = await supabase
            .from('user_oauth_credentials')
            .upsert(upsertData, {
              onConflict: 'user_id,provider'
            });

          if (credError) throw credError;

          toast({
            title: "Successfully connected",
            description: "BigQuery connection has been established",
          });
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        toast({
          title: "Connection failed",
          description: "Failed to complete the BigQuery connection",
          variant: "destructive",
        });
      } finally {
        // Redirect back to the data control page
        navigate('/data-control');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing Authentication...</h2>
        <p className="text-viz-text-secondary">Please wait while we finish setting up your BigQuery connection.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 