import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

const isSchemaError = (error: unknown) => {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  return code === 'PGRST204' || code === 'PGRST205' || (typeof message === 'string' && message.includes('does not exist'));
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = id;
    const { coverLetter, fullName, email, phone } = await request.json();

    // Validate required fields
    if (!coverLetter || !fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify job exists
    let jobData: { id: string; title: string; company_name: string; author_id?: string | null } | null = null;
    if (isUuid(jobId)) {
      const lookup = await supabase
        .from('job_listings')
        .select('id, title, company_name, author_id')
        .eq('id', jobId)
        .maybeSingle();
      if (!lookup.error && lookup.data) {
        jobData = lookup.data as any;
      }
    }

    // Check if already applied
    const existingByJob = isUuid(jobId)
      ? await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('user_id', userId)
          .maybeSingle()
      : { data: null as any, error: null as any };

    const existingByExternal = await supabase
      .from('job_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('external_job_id', jobId)
      .maybeSingle();

    if (existingByJob.data || existingByExternal.data) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // Create application
    // Create application (supports legacy schema and external/mock job IDs)
    let applicationInsert: any = {
      user_id: userId,
      status: 'applied',
      cover_letter: coverLetter,
      resume_url: null,
      applied_at: new Date().toISOString(),
      applicant_name: fullName,
      applicant_email: email,
      applicant_phone: phone,
      external_job_id: jobId,
      external_job_title: jobData?.title || 'External Job Listing',
      external_company_name: jobData?.company_name || 'Unknown Company',
    };

    if (jobData?.id) {
      applicationInsert.job_id = jobData.id;
    }

    const insert = await supabase
      .from('job_applications')
      .insert(applicationInsert)
      .select()
      .single();

    let application = insert.data;
    let appError = insert.error;

    if (appError && isSchemaError(appError)) {
      const legacyInsert = await supabase
        .from('job_applications')
        .insert({
          user_id: userId,
          ...(jobData?.id ? { job_id: jobData.id } : {}),
          status: 'applied',
          cover_letter: coverLetter,
          resume_url: null,
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();

      application = legacyInsert.data;
      appError = legacyInsert.error;
    }

    if (appError) throw appError;

    // Update job application count
    if (jobData?.id) {
      await supabase.rpc('increment_job_applications', { job_id: jobData.id });
    }

    // Create notification for recruiter
    try {
      await supabase.from('notifications').insert({
        user_id: jobData?.author_id,
        triggered_by_user_id: userId,
        type: 'job_application',
        post_id: null,
        title: 'New Job Application',
        message: `${fullName} applied for ${jobData?.title || 'a job'} at ${jobData?.company_name || 'your company'}`,
      });
    } catch (notificationError) {
      console.warn('Failed to create job application notification:', notificationError);
    }

    // Log analytics event
    try {
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'job_apply',
        event_data: {
          job_id: jobData?.id || null,
          external_job_id: jobId,
          company: jobData?.company_name || null,
          position: jobData?.title || null,
        },
      });
    } catch (analyticsError) {
      console.warn('Failed to log job application analytics event:', analyticsError);
    }

    return NextResponse.json(
      {
        success: true,
        application,
        message: 'Application submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting job application:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = await getAuthUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = id;

    // Check if user has already applied
    const { data: application, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .or(`job_id.eq.${jobId},external_job_id.eq.${jobId}`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}
