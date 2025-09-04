import { supabase } from '@/integrations/supabase/client';
import type { IntegrationConfig } from '../types';
import type { Tables } from '@/integrations/supabase/types';

// Map Supabase OAuth provider values to MIA platforms
const PROVIDER_TO_PLATFORM: Record<string, IntegrationConfig['platform']> = {
  google: 'google',
  facebook: 'meta',
  linkedin: 'linkedin',
  tiktok: 'tiktok',
};

function defaultStatuses(): IntegrationConfig[] {
  return [
    { platform: 'meta', isConnected: false, syncStatus: 'idle' },
    { platform: 'google', isConnected: false, syncStatus: 'idle' },
    { platform: 'linkedin', isConnected: false, syncStatus: 'idle' },
    { platform: 'tiktok', isConnected: false, syncStatus: 'idle' },
  ];
}

export async function fetchIntegrationStatuses(userId?: string): Promise<IntegrationConfig[]> {
  if (!userId) return defaultStatuses();

  const { data, error } = await supabase
    .from('user_oauth_credentials')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to load integration statuses:', error);
    return defaultStatuses();
  }

  const statuses = defaultStatuses();

  (data as Tables<'user_oauth_credentials'>[] | null)?.forEach((row) => {
    const platform = PROVIDER_TO_PLATFORM[row.provider];
    if (!platform) return;

    const idx = statuses.findIndex((s) => s.platform === platform);
    if (idx === -1) return;

    // Consider presence of a provider token as a connected account for status display.
    statuses[idx] = {
      platform,
      isConnected: true,
      lastSync: undefined, // No sync jobs stored yet
      syncStatus: 'success', // Show "Connected" badge in UI
      accountId: undefined,
    };
  });

  return statuses;
}

export async function connectPlatform(platform: IntegrationConfig['platform']): Promise<void> {
  switch (platform) {
    case 'google': {
      // Request Google Ads scope + basic profile scopes. This opens a popup and the
      // AuthContext will persist tokens to `user_oauth_credentials` on callback.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?integration=mia-google`,
          scopes: [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
          ].join(' '),
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      return;
    }
    case 'meta':
    case 'linkedin':
    case 'tiktok': {
      // TODO: Implement real OAuth flows when providers/scopes are ready
      throw new Error('Connection flow coming soon for this platform');
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
