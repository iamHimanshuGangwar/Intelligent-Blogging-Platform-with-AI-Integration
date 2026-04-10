/**
 * Request Queue Manager
 * Handles API requests with built-in rate limiting and queuing
 * Prevents 429 errors by throttling requests to a reasonable rate
 */

import { EventEmitter } from 'events';

interface QueuedRequest<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  retries: number;
  maxRetries: number;
  createdAt: number;
  priority: 'low' | 'normal' | 'high';
}

interface QueueConfig {
  maxConcurrent: number; // Max requests running simultaneously
  maxRetries: number; // Max retry attempts
  requestsPerSecond: number; // Rate limit
  timeoutMs: number; // Request timeout
  backoffMultiplier: number; // Exponential backoff multiplier
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 2, // Conservative: 2 concurrent requests
  maxRetries: 3,
  requestsPerSecond: 2, // 2 requests per second = 120 per minute
  timeoutMs: 60000, // 60 second timeout
  backoffMultiplier: 2,
};

/**
 * RequestQueue manages API requests with rate limiting and retry logic
 */
export class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private active: Map<string, Promise<any>> = new Map();
  private config: QueueConfig;
  private emitter: EventEmitter;
  private lastRequestTime: number = 0;
  private minTimeBetweenRequests: number;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.minTimeBetweenRequests = 1000 / this.config.requestsPerSecond;
    this.emitter = new EventEmitter();
  }

  /**
   * Enqueue a request for execution
   */
  async enqueue<T>(
    fn: () => Promise<T>,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req-${Date.now()}-${Math.random()}`,
        fn,
        resolve,
        reject,
        retries: 0,
        maxRetries: this.config.maxRetries,
        createdAt: Date.now(),
        priority,
      };

      // Add to queue sorted by priority
      this.queue.push(request);
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      this.emitter.emit('enqueued', request.id);
      this.processQueue();
    });
  }

  /**
   * Process queued requests respecting rate limits
   */
  private async processQueue(): Promise<void> {
    while (
      this.queue.length > 0 &&
      this.active.size < this.config.maxConcurrent
    ) {
      const request = this.queue.shift();
      if (!request) break;

      await this.waitForRateLimit();

      const promise = this.executeRequest(request);
      this.active.set(request.id, promise);

      promise
        .then(() => this.active.delete(request.id))
        .catch(() => this.active.delete(request.id));

      // Continue processing
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Wait to respect rate limit
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minTimeBetweenRequests) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minTimeBetweenRequests - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Execute a single request with retry logic
   */
  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    try {
      this.emitter.emit('started', request.id);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          this.config.timeoutMs
        )
      );

      const result = await Promise.race([request.fn(), timeoutPromise]);

      this.emitter.emit('success', request.id);
      request.resolve(result);
    } catch (error: any) {
      const is429 = error?.status === 429 || error?.message?.includes('429');
      const is5xx = error?.status >= 500;
      const shouldRetry =
        (is429 || is5xx || error?.message?.includes('ECONNRESET')) &&
        request.retries < request.maxRetries;

      if (shouldRetry) {
        request.retries++;
        const backoffTime = Math.pow(this.config.backoffMultiplier, request.retries) * 1000;

        this.emitter.emit('retry', {
          id: request.id,
          retryCount: request.retries,
          backoffTime,
        });

        // Re-enqueue with delay
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        this.queue.unshift(request);
        this.processQueue();
      } else {
        this.emitter.emit('failed', {
          id: request.id,
          error: error?.message || String(error),
          retries: request.retries,
        });
        request.reject(error);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queued: this.queue.length,
      active: this.active.size,
      totalConcurrent: this.queue.length + this.active.size,
    };
  }

  /**
   * Listen to queue events
   */
  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler);
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Get current configuration
   */
  getConfig(): QueueConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<QueueConfig>) {
    this.config = { ...this.config, ...config };
    this.minTimeBetweenRequests = 1000 / this.config.requestsPerSecond;
  }
}

// Global queue instance for Gemini API
export const geminiRequestQueue = new RequestQueue({
  maxConcurrent: 1, // Single concurrent request for Gemini
  maxRetries: 3,
  requestsPerSecond: 1.5, // 1.5 requests per second = 90 per minute (safe for free tier, which is ~15/min but we'll batch)
  timeoutMs: 90000, // 90 second timeout (Gemini can be slow)
  backoffMultiplier: 2,
});

// Log queue events in development
if (process.env.NODE_ENV === 'development') {
  geminiRequestQueue.on('retry', (data) => {
    console.log(
      `🔄 Retry ${data.retryCount}/${3} (waiting ${data.backoffTime}ms)...`
    );
  });

  geminiRequestQueue.on('failed', (data) => {
    console.error(`❌ Request failed after retries: ${data.error}`);
  });
}

export default RequestQueue;
