import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileType, fileUrl } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get resume ID
    const { data: resume } = await supabase
      .from('user_resumes')
      .select('id')
      .eq('user_id', userId)
      .single();

    const { data, error } = await supabase
      .from('resume_files')
      .insert({
        user_id: userId,
        resume_id: resume?.id || null,
        file_name: fileName,
        file_type: fileType,
        file_url: fileUrl || 'local_export',
      })
      .select()
      .single();

    if (error) {
      // Table might not exist yet — that's ok, don't fail the export
      console.warn('resume_files insert failed:', error.message);
      return NextResponse.json({ saved: false, note: 'File tracking unavailable' }, { status: 200 });
    }

    return NextResponse.json({ saved: true, file: data }, { status: 200 });
  } catch (error) {
    console.error('Resume file save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: files, error } = await supabase
      .from('resume_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ files: [] }, { status: 200 });
    }

    return NextResponse.json({ files: files || [] }, { status: 200 });
  } catch (error) {
    console.error('Resume files fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
