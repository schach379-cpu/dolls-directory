import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen lang sein." }, { status: 400 });
  }

  const { data: existing } = await supabaseServer
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits registriert." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userRole = role === "ANBIETER" ? "ANBIETER" : "KUNDE";

  const { data: user, error } = await supabaseServer
    .from("users")
    .insert({ name, email, password: hashedPassword, role: userRole })
    .select("id, email")
    .single();

  if (error) {
    return NextResponse.json({ error: "Registrierung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json(user, { status: 201 });
}
