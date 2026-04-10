import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: levels, error } = await supabase
      .from("career_levels")
      .select("*")
      .eq("career_track_id", id)
      .order("level", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(levels);
  } catch (error) {
    console.error("Get career levels error:", error);
    return NextResponse.json({ error: "Failed to fetch progression levels" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();

    const body = await req.json();
    const { data: updated, error } = await supabase
      .from("career_tracks")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, track: updated![0] });
  } catch (error) {
    console.error("Update career track error:", error);
    return NextResponse.json({ error: "Failed to update career track" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();

    const { error } = await supabase.from("career_tracks").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete career track error:", error);
    return NextResponse.json({ error: "Failed to delete career track" }, { status: 500 });
  }
}
