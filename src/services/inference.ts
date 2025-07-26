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
        let errorData;
        try {
          const errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch {
          // Handle 503 and other HTTP errors more gracefully
          if (response.status === 503) {
            throw new Error('The AI service is temporarily unavailable. Please try again in a moment.');
          }
          throw new Error(`Service error (${response.status}). Please try again.`);
        }

        // Always retry on service unavailable errors
        if (response.status === 503 && attempt < maxRetries) {
          console.log('Service unavailable, will retry...');
          throw new Error('Service temporarily unavailable');
        }

        // Check if error is retryable
        if (errorData.retryable && attempt < maxRetries) {
          console.log(`Retryable error (${errorData.errorType}), will retry...`);
          throw new Error(errorData.error);
        }

        // Non-retryable error or last attempt
        throw new Error(errorData.error || `Service error (${response.status}). Please try again.`);
      }

      const data = await response.json();
      console.log('Inference successful on attempt', attempt);
      return data;
    } catch (error) {
      console.error(`Inference attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`The AI service is currently experiencing issues. Please try again in a few minutes.`);
      }
      
      // Dynamic retry delay based on error type
      let delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
      
      // Longer delay for service unavailable errors
      if (error.message.includes('unavailable') || error.message.includes('503')) {
        delay = Math.min(delay * 3, 30000); // Longer delay for service issues
      }
      
      delay = Math.min(delay, 15000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}