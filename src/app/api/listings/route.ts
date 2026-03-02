import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, city, zip, priceFrom, priceTo, tags } = body;

  if (!title || !description || !city) {
    return NextResponse.json({ error: "Titel, Beschreibung und Stadt sind erforderlich." }, { status: 400 });
  }

  let slug = slugify(title);
  const { data: existing } = await supabaseServer
    .from("listings")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) slug = `${slug}-${Date.now()}`;

  const { data: listing, error } = await supabaseServer
    .from("listings")
    .insert({
      user_id:     session.user.id,
      title,
      description,
      city,
      zip:         zip ?? null,
      price_from:  priceFrom ? parseInt(priceFrom) : null,
      price_to:    priceTo   ? parseInt(priceTo)   : null,
      slug,
      status:      "AUSSTEHEND",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Fehler beim Erstellen." }, { status: 500 });
  }

  // Insert tags
  if (tags?.length > 0) {
    await supabaseServer.from("listing_tags").insert(
      tags.map((t: { name: string; value: string }) => ({
        listing_id: listing.id,
        name: t.name,
        value: t.value,
      }))
    );
  }

  return NextResponse.json(listing, { status: 201 });
}
