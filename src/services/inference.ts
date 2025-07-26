import { supabase } from "@/integrations/supabase/client";

// Base URL for functions - use localhost in development
const FUNCTIONS_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:54321/functions/v1'
  : 'https://aemqjpcbtgdnfypgkkhx.supabase.co/functions/v1';

export async function inference(prompt: string) {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in inference:', error);
    throw error;
  }
} 