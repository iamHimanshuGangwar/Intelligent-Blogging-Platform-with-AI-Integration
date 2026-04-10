/**
 * Retry logic with exponential backoff for API calls
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable (429, 503, 504, timeout)
      const isRetryable = 
        (error instanceof Error && 
          (error.message.includes('429') || 
           error.message.includes('503') || 
           error.message.includes('504') ||
           error.message.includes('timeout') ||
           error.message.includes('ECONNRESET') ||
           error.message.includes('ETIMEDOUT'))) ||
        (error instanceof Response && 
          (error.status === 429 || error.status === 503 || error.status === 504));

      if (!isRetryable || attempt === config.maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError || new Error('Unknown error in retry logic');
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  const message = error?.message || String(error);
  return message.includes('429') || message.includes('quota') || message.includes('rate limit');
}

/**
 * Check if error is a configuration error
 */
export function isConfigError(error: any): boolean {
  const message = error?.message || String(error);
  return (
    message.includes('401') ||
    message.includes('403') ||
    message.includes('API key') ||
    message.includes('not configured') ||
    message.includes('credentials')
  );
}
