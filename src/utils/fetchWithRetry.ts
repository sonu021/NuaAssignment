export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
}

/**
 * Executes a fetch request with exponential backoff retry for network errors
 * and 5xx server responses. Retries are skipped if aborted via AbortSignal.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions,
): Promise<Response> {
  const maxRetries = retryOptions?.maxRetries ?? 3;
  const initialDelayMs = retryOptions?.initialDelayMs ?? 500;
  const backoffFactor = retryOptions?.backoffFactor ?? 2;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      if (options?.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const response = await fetch(url, options);

      // Retry on 5xx server errors, but not client errors (4xx)
      if (response.status >= 500 && attempt < maxRetries) {
        throw new Error(`Server error HTTP ${response.status}`);
      }

      return response;
    } catch (error: any) {
      if (error?.name === "AbortError" || options?.signal?.aborted) {
        throw error;
      }

      attempt++;

      if (attempt > maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay with small random jitter
      const delay =
        initialDelayMs * Math.pow(backoffFactor, attempt - 1) +
        Math.random() * 100;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Maximum retry attempts reached");
}
