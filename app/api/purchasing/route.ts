import { NextRequest, NextResponse } from 'next/server';

// Purchasing API alias for backwards compatibility.
// Internally proxies to /api/subscriptions so older clients keep working.
async function proxyToSubscriptions(request: NextRequest) {
  const targetUrl = new URL('/api/subscriptions', request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl.toString(), init);
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyToSubscriptions(request);
}

export async function POST(request: NextRequest) {
  return proxyToSubscriptions(request);
}

export async function PUT(request: NextRequest) {
  return proxyToSubscriptions(request);
}
