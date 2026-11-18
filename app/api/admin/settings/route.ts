import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { validGroupLink } from "@/lib/validation";
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  try {
    const body = await req.json();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.registrationOpen === "boolean") update.registration_open = body.registrationOpen;
    if (typeof body.groupLink === "string") {
      if (body.groupLink && !validGroupLink(body.groupLink)) return NextResponse.json({ message: "Tumia WhatsApp group invite link halali ya https://chat.whatsapp.com/..." }, { status: 400 });
      update.whatsapp_group_link = body.groupLink.trim();
    }
    const { error } = await supabaseAdmin.from("app_settings").update(update).eq("id", 1);
    if (error) return NextResponse.json({ message: "Imeshindikana kuhifadhi mipangilio." }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ message: "Ombi si sahihi." }, { status: 400 }); }
}
