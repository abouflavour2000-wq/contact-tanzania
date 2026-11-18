import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const [{ count, error }, { data: settings, error: settingsError }] = await Promise.all([
    supabaseAdmin.from("contacts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("app_settings").select("registration_open").eq("id", 1).maybeSingle()
  ]);
  if (error || settingsError) return NextResponse.json({ message: "Imeshindikana kusoma hali ya usajili." }, { status: 500 });
  const totalUsers = count ?? 0;
  return NextResponse.json({ totalUsers, registrationOpen: Boolean(settings?.registration_open) && totalUsers < 1000 });
}
