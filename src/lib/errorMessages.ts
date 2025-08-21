export type ToastPayload = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

async function readResponseDetails(resp: Response): Promise<string> {
  try {
    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await resp.clone().json();
      // Try to surface a concise message if available
      if (j?.error) return typeof j.error === 'string' ? j.error : JSON.stringify(j.error);
      if (j?.message) return String(j.message);
      return JSON.stringify(j);
    }
    return await resp.clone().text();
  } catch {
    return '';
  }
}

export async function mapErrorToToast(error: any): Promise<ToastPayload> {
  const resp: Response | undefined = error?.context?.response;

  if (resp) {
    const status = resp.status;
    switch (status) {
      case 401:
        return {
          title: 'Sign in required',
          description: 'You are signed out. Please sign in to continue.',
          variant: 'destructive',
        };
      case 403:
        return {
          title: 'Access restricted',
          description: 'This feature is limited to admins. Contact your admin if you need access.',
          variant: 'destructive',
        };
      case 429:
        return {
          title: 'Daily limit reached',
          description: 'You have reached today\'s 5-message limit. Try again tomorrow. Tip: combine related questions in one message.',
          variant: 'destructive',
        };
      case 502: {
        const details = await readResponseDetails(resp);
        return {
          title: 'Service unavailable',
          description: 'Our analytics service is temporarily unavailable. Please try again in a minute.' + (details ? ` (${details})` : ''),
          variant: 'destructive',
        };
      }
      case 504:
        return {
          title: 'Request timed out',
          description: 'The data source took too long. Try narrowing your question (e.g., last 30 days, one metric).',
          variant: 'destructive',
        };
      default: {
        const details = await readResponseDetails(resp);
        return {
          title: 'Request failed',
          description: details || 'The server returned an error. Please try again.',
          variant: 'destructive',
        };
      }
    }
  }

  // No Response — likely network/offline or generic error
  if (error?.name === 'AbortError') {
    return {
      title: 'Request timed out',
      description: 'The data source took too long. Try narrowing your question.',
      variant: 'destructive',
    };
  }
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('cors')) {
    return {
      title: 'Unable to reach API',
      description: 'Please check your internet connection and Supabase URL, then retry.',
      variant: 'destructive',
    };
  }

  return {
    title: 'Something went wrong',
    description: error?.message || 'Please try again.',
    variant: 'destructive',
  };
}
