import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { getAuthUserId } from "@/lib/auth-helpers";
import { BLOG_THEMES, getThemeCollections, sanitizeThemeConfig } from "@/lib/blog-themes";
import { cacheGet, cacheSet, cacheInvalidatePrefix } from "@/lib/cache";

async function isAdminUser(userId: string | null) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return profile?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);
    const admin = await isAdminUser(userId);
    const scope = request.nextUrl.searchParams.get("scope");
    const includeBuiltin = request.nextUrl.searchParams.get("includeBuiltin") !== "false";

    // Cache public theme listings for anonymous/non-admin users
    const isPublicRequest = !admin && !userId;
    const cacheKey = isPublicRequest ? `themes:public:${includeBuiltin}` : null;

    if (cacheKey) {
      const cached = await cacheGet<{ themes: unknown[]; builtInCount: number }>(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    let query = supabase
      .from("blog_themes")
      .select("id, name, description, preview_icon, created_by, is_public, is_featured, status, theme_config")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (!(admin && scope === "all")) {
      if (userId) {
        query = query.or(`is_public.eq.true,created_by.eq.${userId}`);
      } else {
        query = query.eq("is_public", true);
      }
      query = query.eq("status", "active");
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const creatorIds = Array.from(new Set((data || []).map((item) => item.created_by).filter(Boolean)));
    const creatorMap = new Map<string, string>();

    if (creatorIds.length > 0) {
      const { data: creators } = await supabase.from("profiles").select("id, name").in("id", creatorIds);
      for (const creator of creators || []) {
        if (creator.id) creatorMap.set(creator.id, creator.name || "Creator");
      }
    }

    const records = (data || []).map((item) => ({
      ...item,
      creator_name: item.created_by ? creatorMap.get(item.created_by) || null : null,
    }));

    const themes = includeBuiltin ? getThemeCollections(records) : records;
    const payload = { themes, builtInCount: BLOG_THEMES.length };

    if (cacheKey) {
      cacheSet(cacheKey, payload, 120).catch(() => {});
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Get blog themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdminUser(userId);
    const supabase = await createClient();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const previewIcon = String(body.previewIcon || "🎨").trim().slice(0, 4) || "🎨";
    const isPublic = Boolean(body.isPublic || body.is_public || false);
    const isFeatured = admin ? Boolean(body.isFeatured || body.is_featured || false) : false;
    const status = admin && body.status === "archived" ? "archived" : "active";

    if (!name) {
      return NextResponse.json({ error: "Theme name is required" }, { status: 400 });
    }

    const themeConfig = sanitizeThemeConfig(body.themeConfig || body.theme_config || null);
    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from("blog_themes")
      .insert({
        id,
        name,
        description: description || null,
        preview_icon: previewIcon,
        created_by: userId,
        is_public: isPublic,
        is_featured: isFeatured,
        status,
        theme_config: themeConfig,
        updated_at: new Date().toISOString(),
      })
      .select("id, name, description, preview_icon, created_by, is_public, is_featured, status, theme_config")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Invalidate theme caches
    cacheInvalidatePrefix("themes:").catch(() => {});

    return NextResponse.json({ theme: { ...data, creator_name: null } }, { status: 201 });
  } catch (error) {
    console.error("Create blog theme error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
