import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;

  const { data: listing } = await supabaseServer
    .from("listings")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Inserat nicht gefunden." }, { status: 404 });
  }
  if (listing.user_id !== session.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, city, zip, priceFrom, priceTo, tags, images } = body;

  if (!title || !description || !city) {
    return NextResponse.json(
      { error: "Titel, Beschreibung und Stadt sind erforderlich." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("listings")
    .update({
      title,
      description,
      city,
      zip: zip ?? null,
      price_from: priceFrom ? parseInt(priceFrom) : null,
      price_to: priceTo ? parseInt(priceTo) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 });
  }

  // Replace tags
  await supabaseServer.from("listing_tags").delete().eq("listing_id", id);
  if (tags?.length > 0) {
    await supabaseServer.from("listing_tags").insert(
      tags.map((t: { name: string; value: string }) => ({
        listing_id: id,
        name: t.name,
        value: t.value,
      }))
    );
  }

  // Replace images
  await supabaseServer.from("listing_images").delete().eq("listing_id", id);
  if (images?.length > 0) {
    await supabaseServer.from("listing_images").insert(
      images.map((url: string, i: number) => ({
        listing_id: id,
        url,
        is_primary: i === 0,
        order: i,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
