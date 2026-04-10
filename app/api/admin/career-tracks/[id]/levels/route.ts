import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error("Get progression levels error:", error);
    return NextResponse.json({ error: "Failed to fetch progression levels" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createClient();

    const { level, name, description, perks, icon } = await req.json();
    if (!level || !name) {
      return NextResponse.json({ error: "Level and name are required" }, { status: 400 });
    }

    const { data: newLevel, error } = await supabase
      .from("career_levels")
      .insert([{ career_track_id: id, level, name, description, perks: perks || [], icon }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newLevel![0], { status: 201 });
  } catch (error) {
    console.error("Create progression level error:", error);
    return NextResponse.json({ error: "Failed to create progression level" }, { status: 500 });
  }
}
