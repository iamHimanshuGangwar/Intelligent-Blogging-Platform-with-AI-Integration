import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { verifyAdminSessionCookie } from "@/lib/admin-auth";

async function getAdminIdentity(req: NextRequest): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {}
  const adminData = verifyAdminSessionCookie(req);
  if (adminData) return adminData;
  return null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: careerTracks, error } = await supabase
      .from("career_tracks")
      .select("*")
      .eq("is_active", true)
      .order("creator_count", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(careerTracks);
  } catch (error) {
    console.error("Get career tracks error:", error);
    return NextResponse.json({ error: "Failed to fetch career tracks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await getAdminIdentity(req);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();

    const { name, description, icon } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: newTrack, error } = await supabase
      .from("career_tracks")
      .insert([{ name, description, icon, creator_count: 0, growth_rate: 0, is_active: true }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newTrack![0], { status: 201 });
  } catch (error) {
    console.error("Create career track error:", error);
    return NextResponse.json({ error: "Failed to create career track" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminId = await getAdminIdentity(req);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();

    const trackId = req.nextUrl.searchParams.get("id");
    if (!trackId) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("career_tracks").delete().eq("id", trackId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete career track error:", error);
    return NextResponse.json({ error: "Failed to delete career track" }, { status: 500 });
  }
}
