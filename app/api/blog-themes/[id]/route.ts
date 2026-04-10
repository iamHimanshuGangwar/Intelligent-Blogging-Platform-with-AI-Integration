import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAuthUserId } from "@/lib/auth-helpers";
import { sanitizeThemeConfig } from "@/lib/blog-themes";

async function getAdminFlag(userId: string | null) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return profile?.role === "admin";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(_request);
    const admin = await getAdminFlag(userId);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("blog_themes")
      .select("id, name, description, preview_icon, created_by, is_public, is_featured, status, theme_config")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (!admin && !data.is_public && data.created_by !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ theme: data });
  } catch (error) {
    console.error("Get blog theme error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getAdminFlag(userId);
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("blog_themes")
      .select("id, created_by")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (!admin && existing.created_by !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description || "").trim() || null;
    if (body.previewIcon !== undefined) updateData.preview_icon = String(body.previewIcon || "🎨").trim().slice(0, 4) || "🎨";
    if (body.isPublic !== undefined) updateData.is_public = Boolean(body.isPublic);
    if (body.is_public !== undefined) updateData.is_public = Boolean(body.is_public);
    if (body.themeConfig !== undefined || body.theme_config !== undefined) {
      updateData.theme_config = sanitizeThemeConfig(body.themeConfig || body.theme_config || null);
    }

    if (admin) {
      if (body.isFeatured !== undefined) updateData.is_featured = Boolean(body.isFeatured);
      if (body.is_featured !== undefined) updateData.is_featured = Boolean(body.is_featured);
      if (body.status === "active" || body.status === "archived") updateData.status = body.status;
    }

    const { data, error } = await supabase
      .from("blog_themes")
      .update(updateData)
      .eq("id", id)
      .select("id, name, description, preview_icon, created_by, is_public, is_featured, status, theme_config")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ theme: data });
  } catch (error) {
    console.error("Update blog theme error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getAdminFlag(userId);
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("blog_themes")
      .select("id, created_by")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (!admin && existing.created_by !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("blog_themes").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog theme error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
