import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß (max 10MB)." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPEG, PNG, WebP oder GIF erlaubt." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabaseServer.storage
    .from("listing-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabaseServer.storage
    .from("listing-images")
    .getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
