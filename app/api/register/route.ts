import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cleanName, cleanPhone } from "@/lib/validation";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = cleanName(body.name);
    const phone = cleanPhone(body.phone);
    if (name.length < 2) return NextResponse.json({ message: "Tafadhali weka jina halali." }, { status: 400 });
    if (!phone) return NextResponse.json({ message: "Namba lazima iwe na tarakimu 9 na ianze na 6 au 7." }, { status: 400 });
    if (body.consent !== true) return NextResponse.json({ message: "Lazima ukubali masharti ya matumizi ya taarifa." }, { status: 400 });

    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { data, error } = await supabaseAdmin.rpc("register_contact", {
      p_name: name, p_phone: phone, p_ip_hint: forwarded.slice(0, 64)
    });
    if (error) {
      console.error("register_contact error:", error.message);
      return NextResponse.json({ message: "Usajili haukufanikiwa. Tafadhali jaribu tena." }, { status: 500 });
    }
    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.success) {
      const messages: Record<string, string> = {
        closed: "Usajili umefungwa.", full: "Samahani, nafasi zote 1,000 zimejazwa.",
        duplicate: "Namba hii tayari imesajiliwa."
      };
      return NextResponse.json({ message: messages[result?.code] || "Usajili haukufanikiwa." }, { status: 409 });
    }
    const { data: settings } = await supabaseAdmin.from("app_settings").select("whatsapp_group_link").eq("id", 1).single();
    return NextResponse.json({ success: true, groupLink: settings?.whatsapp_group_link || "" });
  } catch {
    return NextResponse.json({ message: "Ombi si sahihi." }, { status: 400 });
  }
}
