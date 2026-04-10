import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyAdminSessionCookie } from "@/lib/admin-auth";
import { auth } from "@clerk/nextjs/server";

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profile?.role === "admin") return userId;
    }
  } catch {}
  const adminData = verifyAdminSessionCookie(req);
  if (adminData) return adminData;
  return null;
}

export async function GET(req: NextRequest) {
  const adminId = await verifyAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ tickets: [] });
    }

    return NextResponse.json({ tickets: tickets || [] });
  } catch {
    return NextResponse.json({ tickets: [] });
  }
}

export async function POST(req: NextRequest) {
  const adminId = await verifyAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId, reply, status } = await req.json();
    const supabase = await createClient();

    const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
    if (reply) updateData.admin_reply = reply;
    if (status) updateData.status = status;

    const { error } = await supabase.from("support_tickets").update(updateData).eq("id", ticketId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminId = await verifyAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId, status } = await req.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
