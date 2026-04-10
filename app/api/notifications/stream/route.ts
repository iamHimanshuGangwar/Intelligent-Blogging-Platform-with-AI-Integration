/**
 * Real-time notifications via Server-Sent Events (SSE).
 * Clients connect to GET /api/notifications/stream and receive push events
 * whenever a new unread notification arrives for the authenticated user.
 *
 * The stream polls Supabase every 5 seconds to check for new notifications.
 * No WebSocket infrastructure required — works on Vercel Edge runtime.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

export const runtime = 'nodejs';
// Keep connection alive for up to 25 seconds (Vercel limit on hobby plan)
export const maxDuration = 25;

const POLL_INTERVAL_MS = 5_000;
const MAX_LIFETIME_MS = 24_000; // slightly under maxDuration to allow clean close

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            closed = true;
          }
        }
      };

      // Send initial connection confirmation
      enqueue(sseMessage('connected', { userId, timestamp: Date.now() }));

      const supabase = await createClient();
      let lastChecked = new Date().toISOString();
      const startedAt = Date.now();

      let intervalId: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        closed = true;
        if (intervalId) clearInterval(intervalId);
        try { controller.close(); } catch { /* already closed */ }
      };

      // Close stream after maxDuration to let client reconnect cleanly
      const lifetimeTimer = setTimeout(cleanup, MAX_LIFETIME_MS);

      intervalId = setInterval(async () => {
        if (closed) {
          clearInterval(intervalId!);
          clearTimeout(lifetimeTimer);
          return;
        }

        if (Date.now() - startedAt >= MAX_LIFETIME_MS) {
          cleanup();
          return;
        }

        try {
          const since = lastChecked;
          lastChecked = new Date().toISOString();

          const { data: newNotifs, error } = await supabase
            .from('notifications')
            .select('id, type, message, action_url, created_at, is_read')
            .eq('user_id', userId)
            .eq('is_read', false)
            .gt('created_at', since)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            enqueue(sseMessage('error', { message: 'Failed to fetch notifications' }));
            return;
          }

          if (newNotifs && newNotifs.length > 0) {
            enqueue(sseMessage('notifications', { items: newNotifs, count: newNotifs.length }));
          }

          // Heartbeat to keep connection alive
          enqueue(`: heartbeat\n\n`);
        } catch (err) {
          console.error('[SSE] Poll error:', err);
        }
      }, POLL_INTERVAL_MS);

      // Listen for client disconnect (AbortSignal)
      request.signal.addEventListener('abort', cleanup, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
