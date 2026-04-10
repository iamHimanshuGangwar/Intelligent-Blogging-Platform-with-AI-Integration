import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logActivity } from "@/lib/activity-log";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email, name, avatar_url, role } = await request.json();

    if (id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that Supabase is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
      console.error('Supabase Service Role Key is not configured properly');
      return NextResponse.json(
        { 
          error: "Supabase not configured. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.",
          profile: {
            id: userId,
            email,
            name,
            avatar_url,
            role: role || "user"
          }
        }, 
        { status: 200 } // Return 200 with fallback data instead of 400
      );
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert(
        [{ id, email, name, avatar_url, role, updated_at: new Date().toISOString() }],
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Profile sync error:", error.message, error.code);
      
      // If it's a schema issue, return fallback profile
      if (error.message?.includes('relation "public.profiles" does not exist')) {
        return NextResponse.json(
          { 
            error: "Database schema not initialized. Please run migrations in Supabase.",
            profile: {
              id,
              email,
              name,
              avatar_url,
              role: role || "user"
            }
          },
          { status: 200 } // Return 200 with fallback data
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Track sign-in / sign-up event
    const isNewUser = profile && profile.created_at === profile.updated_at;
    logActivity({
      userId: id,
      activityType: isNewUser ? 'user_signup' : 'user_signin',
      entityType: 'user',
      entityId: id,
      metadata: { email, name, method: 'clerk' },
    }).catch(() => {});

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
