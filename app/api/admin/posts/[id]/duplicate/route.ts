import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { logAdminAction } from '@/lib/admin-audit';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return userId;
    }
  } catch { /* continue */ }

  const email = verifyAdminSessionCookie(request);
  if (email) return email;

  try {
    const supabase = await createClient();
    const otpToken = request.cookies.get('otp_session_token')?.value;
    if (!otpToken) return null;
    const { data: session } = await supabase
      .from('otp_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', otpToken)
      .maybeSingle();
    if (!session?.is_active || new Date(session.expires_at) <= new Date()) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user_id)
      .maybeSingle();
    return profile?.role === 'admin' ? session.user_id : null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await verifyAdmin(request);
  if (!adminUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: source, error: fetchError } = await supabase
    .from('posts')
    .select('title, content, excerpt, topic, category, cover_image_url, blog_theme, author_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !source) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const duplicateTitle = `Copy of ${source.title}`;
  const baseSlug = createSlug(duplicateTitle);

  // Ensure slug uniqueness by appending a short timestamp suffix
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: newPost, error: insertError } = await supabase
    .from('posts')
    .insert({
      title: duplicateTitle,
      slug,
      content: source.content,
      excerpt: source.excerpt,
      topic: source.topic,
      category: source.category,
      cover_image_url: source.cover_image_url,
      blog_theme: source.blog_theme,
      author_id: adminUserId,
      status: 'draft',
      approval_status: 'pending',
    })
    .select('id, title, slug, status, created_at')
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logAdminAction({
    adminId: adminUserId,
    action: 'post.duplicate',
    resourceType: 'post',
    resourceId: newPost.id,
    details: { sourcePostId: id, sourceTitle: source.title },
  });

  return NextResponse.json({ success: true, post: newPost }, { status: 201 });
}
