import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

const isMissingTableError = (error: unknown) => {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  return code === 'PGRST205' || (typeof message === 'string' && message.includes('Could not find the table'));
};

async function saveToLegacyResumeSchema(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, resumeData: any) {
  const resumeTitle = resumeData?.fullName ? `${resumeData.fullName} Resume` : 'My Resume';

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .upsert(
      {
        user_id: userId,
        title: resumeTitle,
        summary: resumeData?.summary || null,
        email: resumeData?.email || null,
        phone: resumeData?.phone || null,
        location: resumeData?.location || resumeData?.address || null,
        website_url: resumeData?.website || null,
        linkedin_url: resumeData?.linkedin || null,
        is_default: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,is_default' }
    )
    .select('id, updated_at')
    .single();

  if (resumeError || !resume) {
    throw resumeError || new Error('Failed to save legacy resume record');
  }

  await supabase.from('resume_sections').delete().eq('resume_id', resume.id);

  const sections = [
    { type: 'contact', title: 'Contact', content: { fullName: resumeData?.fullName || '', photoUrl: resumeData?.photoUrl || '', address: resumeData?.address || '' }, order_index: 1 },
    { type: 'summary', title: 'Summary', content: { text: resumeData?.summary || '' }, order_index: 2 },
    { type: 'experience', title: 'Experience', content: { items: resumeData?.experience || [] }, order_index: 3 },
    { type: 'education', title: 'Education', content: { items: resumeData?.education || [] }, order_index: 4 },
    { type: 'skills', title: 'Skills', content: { items: resumeData?.skills || [] }, order_index: 5 },
    { type: 'certifications', title: 'Certifications', content: { items: resumeData?.certifications || [] }, order_index: 6 },
  ];

  const { error: sectionsError } = await supabase.from('resume_sections').insert(
    sections.map((section) => ({ ...section, resume_id: resume.id }))
  );

  if (sectionsError) {
    throw sectionsError;
  }

  return {
    ...resumeData,
    updated_at: resume.updated_at,
  };
}

async function loadFromLegacyResumeSchema(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('id, summary, email, phone, location, website_url, linkedin_url, updated_at')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (resumeError || !resume) {
    return null;
  }

  const { data: sections } = await supabase
    .from('resume_sections')
    .select('type, content')
    .eq('resume_id', resume.id);

  const sectionMap = new Map((sections || []).map((section) => [section.type, section.content || {}]));
  const contact = sectionMap.get('contact') || {};

  return {
    fullName: typeof contact.fullName === 'string' ? contact.fullName : '',
    email: resume.email || '',
    phone: resume.phone || '',
    address: typeof contact.address === 'string' ? contact.address : '',
    location: resume.location || '',
    linkedin: resume.linkedin_url || '',
    website: resume.website_url || '',
    summary: (sectionMap.get('summary') as { text?: string })?.text || resume.summary || '',
    skills: ((sectionMap.get('skills') as { items?: string[] })?.items || []) as string[],
    experience: ((sectionMap.get('experience') as { items?: any[] })?.items || []) as any[],
    education: ((sectionMap.get('education') as { items?: any[] })?.items || []) as any[],
    certifications: ((sectionMap.get('certifications') as { items?: string[] })?.items || []) as string[],
    photoUrl: typeof contact.photoUrl === 'string' ? contact.photoUrl : '',
    updated_at: resume.updated_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeData } = await request.json();
    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Save or update resume — try user_resumes first, then fall back to legacy schema
    let savedData: any = null;

    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .upsert({
          user_id: userId,
          resume_data: resumeData,
          template: resumeData?.template || 'classic',
          color_theme: resumeData?.colorTheme || 'slate',
          ats_score: resumeData?.atsScore || 0,
          full_name: resumeData?.fullName || null,
          target_role: resumeData?.targetRole || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        if (isMissingTableError(error)) {
          throw error; // fall through to legacy
        }
        // Could be type mismatch (UUID vs TEXT) or other column error — try legacy
        console.warn('user_resumes save failed, trying legacy:', error.message);
        throw error;
      }

      savedData = data;
    } catch (primaryError) {
      // Fall back to legacy resumes + resume_sections schema
      try {
        const legacyResume = await saveToLegacyResumeSchema(supabase, userId, resumeData);
        return NextResponse.json({ resume: legacyResume, fallback: 'legacy_schema' }, { status: 200 });
      } catch (legacyError) {
        console.error('Both resume save paths failed:', { primaryError, legacyError });
        return NextResponse.json({ error: 'Failed to save resume. Please try again.' }, { status: 500 });
      }
    }

    return NextResponse.json({ resume: savedData }, { status: 200 });
  } catch (error) {
    console.error('Save resume error:', error);
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

    const { data, error } = await supabase
      .from('user_resumes')
      .select('resume_data, updated_at')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      if (isMissingTableError(error)) {
        const legacyResume = await loadFromLegacyResumeSchema(supabase, userId);
        return NextResponse.json({ resume: legacyResume, fallback: 'legacy_schema' }, { status: 200 });
      }

      console.error('Resume fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      resume: data ? {
        ...data.resume_data,
        updated_at: data.updated_at
      } : null
    }, { status: 200 });
  } catch (error) {
    console.error('Get resume error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}