import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return true;
    }
  } catch { /* continue */ }

  return verifyAdminSessionCookie(request) !== null;
}

// Token TTL: 24 hours
const TTL_MS = 24 * 60 * 60 * 1000;

function generatePreviewToken(postId: string): string {
  const secret = process.env.PREVIEW_SECRET || process.env.NEXTAUTH_SECRET || 'aiblog-preview-secret';
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${postId}:${expiresAt}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify the post exists
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('id, slug')
    .eq('id', id)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const token = generatePreviewToken(id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aiblog.dev';
  const previewUrl = `${appUrl}/blog/preview?token=${token}`;

  return NextResponse.json({ previewUrl, expiresInHours: 24 });
}
