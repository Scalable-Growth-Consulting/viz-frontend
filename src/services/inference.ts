import { supabase } from "@/integrations/supabase/client";

// Base URL for functions - use localhost in development
const FUNCTIONS_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:54321/functions/v1'
  : 'https://aemqjpcbtgdnfypgkkhx.supabase.co/functions/v1';

export async function inference(prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Inference attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch(`${FUNCTIONS_URL}/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Inference successful on attempt', attempt);
      return data;
    } catch (error) {
      console.error(`Inference attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to get inference after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}