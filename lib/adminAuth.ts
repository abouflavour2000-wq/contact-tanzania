import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function requireAdmin(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { error: NextResponse.json({ message: "Huruhusiwi." }, { status: 401 }) };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  const expected = process.env.ADMIN_EMAIL?.toLowerCase();
  if (error || !email || !expected || email !== expected) {
    return { error: NextResponse.json({ message: "Ruhusa ya admin inahitajika." }, { status: 403 }) };
  }
  return { user: data.user };
}
