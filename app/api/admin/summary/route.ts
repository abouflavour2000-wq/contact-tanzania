import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const [{ count, error }, { data: settings, error: settingsError }] = await Promise.all([
    supabaseAdmin.from("contacts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("app_settings").select("*").eq("id", 1).single()
  ]);
  if (error || settingsError) return NextResponse.json({ message: "Imeshindikana kupata taarifa." }, { status: 500 });
  return NextResponse.json({ total: count ?? 0, remaining: Math.max(1000 - (count ?? 0), 0), settings });
}
