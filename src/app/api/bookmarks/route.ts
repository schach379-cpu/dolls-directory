import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { listingId } = await req.json();

  const { data: existing } = await supabaseServer
    .from("bookmarks")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("listing_id", listingId)
    .single();

  if (!existing) {
    await supabaseServer.from("bookmarks").insert({
      user_id:    session.user.id,
      listing_id: listingId,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { listingId } = await req.json();

  await supabaseServer
    .from("bookmarks")
    .delete()
    .eq("user_id", session.user.id)
    .eq("listing_id", listingId);

  return NextResponse.json({ ok: true });
}
