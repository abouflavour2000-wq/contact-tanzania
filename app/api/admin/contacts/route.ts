import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const search = (req.nextUrl.searchParams.get("search") || "").trim().slice(0, 80);
  let query = getSupabaseAdmin().from("contacts").select("id,name,phone,created_at").order("created_at", { ascending: false }).limit(500);
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ message: "Imeshindikana kupata washiriki." }, { status: 500 });
  return NextResponse.json({ contacts: data || [] });
}
