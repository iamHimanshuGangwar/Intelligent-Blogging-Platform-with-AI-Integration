import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * PATCH /api/blog/drafts/[draftId]
 * Update a blog draft
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: draft } = await supabase
      .from('blog_drafts')
      .select('author_user_id')
      .eq('id', draftId)
      .single();

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.author_user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot update other users draft' },
        { status: 403 }
      );
    }

    const { title, brief, content, tags, isPublished, publicationDate } =
      await req.json();

    // Calculate reading time if content is provided
    let readingTimeMinutes;
    if (content) {
      readingTimeMinutes = Math.ceil(content.length / 1000);
    }

    // Determine completion percentage
    let hasTitle = title !== undefined ? !!title : undefined;
    let hasBrief = brief !== undefined ? !!brief : undefined;
    let hasContent = content !== undefined ? !!content : undefined;

    let completionPercentage;
    if (
      hasTitle !== undefined ||
      hasBrief !== undefined ||
      hasContent !== undefined
    ) {
      const checksum =
        (hasTitle !== undefined ? 1 : 0) +
        (hasBrief !== undefined ? 1 : 0) +
        (hasContent !== undefined ? 1 : 0);

      completionPercentage = Math.round(checksum / 3 * 100);
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (brief !== undefined) updateData.brief = brief;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (readingTimeMinutes !== undefined)
      updateData.reading_time_minutes = readingTimeMinutes;
    if (completionPercentage !== undefined)
      updateData.completion_percentage = completionPercentage;
    if (isPublished !== undefined) {
      updateData.is_published = isPublished;
      if (isPublished) {
        updateData.published_at = publicationDate || new Date().toISOString();
      }
    }
    if (hasTitle !== undefined) updateData.has_title = hasTitle;
    if (hasBrief !== undefined) updateData.has_brief = hasBrief;
    if (hasContent !== undefined) updateData.has_content = hasContent;

    const { data: updated, error } = await supabase
      .from('blog_drafts')
      .update(updateData)
      .eq('id', draftId)
      .select()
      .single();

    if (error) {
      console.error('Draft update error:', error);
      return NextResponse.json(
        { error: 'Failed to update draft' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update draft error:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/drafts/[draftId]
 * Get a specific blog draft
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const userId = await getAuthUserId(_req);

    const supabase = await createClient();

    const { data: draft, error } = await supabase
      .from('blog_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // If draft is not published, verify ownership
    if (!draft.is_published && draft.author_user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access draft' },
        { status: 403 }
      );
    }

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error('Get draft error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/drafts/[draftId]
 * Delete a blog draft
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const userId = await getAuthUserId(_req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: draft } = await supabase
      .from('blog_drafts')
      .select('author_user_id')
      .eq('id', draftId)
      .single();

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.author_user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete other users draft' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('blog_drafts')
      .delete()
      .eq('id', draftId);

    if (error) {
      console.error('Draft deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete draft error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
