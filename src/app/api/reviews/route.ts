import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { listingId, rating, comment } = await req.json();
  if (!listingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const { data: existing } = await supabaseServer
    .from("reviews")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Du hast dieses Inserat bereits bewertet." }, { status: 409 });
  }

  const { data: review, error } = await supabaseServer
    .from("reviews")
    .insert({
      listing_id: listingId,
      user_id:    session.user.id,
      rating:     parseInt(rating),
      comment:    comment ?? null,
    })
    .select("*, users(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 });
  }

  return NextResponse.json({
    id:        review.id,
    rating:    review.rating,
    comment:   review.comment,
    createdAt: review.created_at,
    user:      { name: (review.users as { name: string } | null)?.name ?? null },
  }, { status: 201 });
}
