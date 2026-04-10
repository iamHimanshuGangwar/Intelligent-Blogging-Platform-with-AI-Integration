import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * GET /api/analytics/audience
 * Get audience mapping and demographics
 */
export async function GET(_req: NextRequest) {
  try {
    const userId = await getAuthUserId(_req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch audience mapping for the user
    const { data: audience, error } = await supabase
      .from('audience_mapping')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is OK
      console.error('Audience fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audience data' },
        { status: 500 }
      );
    }

    // Default audience data
    const defaultAudience = {
      user_id: userId,
      total_followers: 0,
      students_percentage: 0,
      professionals_percentage: 0,
      creators_percentage: 0,
      other_percentage: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      audience: audience || defaultAudience,
    });
  } catch (error: any) {
    console.error('Get audience error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/audience
 * Create or update audience mapping (admin/manual update)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      totalFollowers,
      studentsPercentage = 0,
      professionalsPercentage = 0,
      creatorsPercentage = 0,
      otherPercentage = 0,
    } = await req.json();

    // Validate percentages sum to 100
    const totalPercentage =
      studentsPercentage +
      professionalsPercentage +
      creatorsPercentage +
      otherPercentage;

    if (Math.abs(totalPercentage - 100) > 1) {
      // Allow 1% margin for rounding
      return NextResponse.json(
        { error: 'Percentages must sum to 100' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upsert audience mapping
    const { data: audience, error } = await supabase
      .from('audience_mapping')
      .upsert(
        [
          {
            user_id: userId,
            total_followers: totalFollowers || 0,
            students_percentage: studentsPercentage,
            professionals_percentage: professionalsPercentage,
            creators_percentage: creatorsPercentage,
            other_percentage: otherPercentage,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Audience update error:', error);
      return NextResponse.json(
        { error: 'Failed to update audience data' },
        { status: 500 }
      );
    }

    return NextResponse.json(audience, { status: 201 });
  } catch (error: any) {
    console.error('Update audience error:', error);
    return NextResponse.json(
      { error: 'Failed to update audience data' },
      { status: 500 }
    );
  }
}
