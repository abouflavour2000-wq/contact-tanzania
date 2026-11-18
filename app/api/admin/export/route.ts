import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { makeVCard } from "@/lib/vcard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data, error } = await getSupabaseAdmin().from("contacts").select("name,phone").order("created_at", { ascending: true }).limit(1000);
  if (error) return NextResponse.json({ message: "Imeshindikana kuandaa faili." }, { status: 500 });
  const vcf = makeVCard(data || []);
  return new NextResponse(vcf, { headers: {
    "Content-Type": "text/vcard; charset=utf-8",
    "Content-Disposition": 'attachment; filename="Tanzania-Contacts.vcf"',
    "Cache-Control": "no-store"
  }});
}
