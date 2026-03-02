import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(req.url);
  const partnerId = url.searchParams.get("partnerId");

  if (partnerId) {
    // Load a specific conversation + mark as read
    const { data } = await supabaseServer
      .from("messages")
      .select("*, sender:users!messages_sender_id_fkey(id, name)")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    await supabaseServer
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", userId)
      .eq("sender_id", partnerId)
      .is("read_at", null);

    return NextResponse.json(data ?? []);
  }

  // Load conversation list: latest message per partner
  const { data: sent } = await supabaseServer
    .from("messages")
    .select("id, content, created_at, read_at, receiver_id, sender_id, listing_id, other:users!messages_receiver_id_fkey(id, name), listings(title, slug)")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  const { data: received } = await supabaseServer
    .from("messages")
    .select("id, content, created_at, read_at, receiver_id, sender_id, listing_id, other:users!messages_sender_id_fkey(id, name), listings(title, slug)")
    .eq("receiver_id", userId)
    .order("created_at", { ascending: false });

  type ConvEntry = {
    partnerId: string;
    partnerName: string;
    lastMessage: string;
    lastAt: string;
    unread: number;
    listingTitle?: string;
    listingSlug?: string;
  };

  const convMap = new Map<string, ConvEntry>();

  function upsert(
    partnerId: string,
    partnerName: string,
    msg: { content: string; created_at: string; read_at: string | null },
    isUnread: boolean,
    listing: { title: string; slug: string } | null
  ) {
    const existing = convMap.get(partnerId);
    if (!existing || msg.created_at > existing.lastAt) {
      convMap.set(partnerId, {
        partnerId,
        partnerName,
        lastMessage: msg.content,
        lastAt: msg.created_at,
        unread: existing ? existing.unread + (isUnread ? 1 : 0) : isUnread ? 1 : 0,
        listingTitle: listing?.title,
        listingSlug: listing?.slug,
      });
    } else if (isUnread) {
      convMap.set(partnerId, { ...existing, unread: existing.unread + 1 });
    }
  }

  for (const msg of sent ?? []) {
    const partner = (msg.other as unknown) as { id: string; name: string } | null;
    const listing = (msg.listings as unknown) as { title: string; slug: string } | null;
    if (!partner) continue;
    upsert(partner.id, partner.name ?? "Unbekannt", msg, false, listing);
  }

  for (const msg of received ?? []) {
    const partner = (msg.other as unknown) as { id: string; name: string } | null;
    const listing = (msg.listings as unknown) as { title: string; slug: string } | null;
    if (!partner) continue;
    upsert(partner.id, partner.name ?? "Unbekannt", msg, !msg.read_at, listing);
  }

  const conversations = Array.from(convMap.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body = await req.json();
  const { receiverId, listingId, content } = body;

  if (!receiverId || !content?.trim()) {
    return NextResponse.json(
      { error: "Empfänger und Nachricht erforderlich." },
      { status: 400 }
    );
  }

  if (receiverId === session.user.id) {
    return NextResponse.json(
      { error: "Du kannst dir selbst keine Nachricht senden." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("messages")
    .insert({
      sender_id: session.user.id,
      receiver_id: receiverId,
      listing_id: listingId ?? null,
      content: content.trim(),
    })
    .select("*, sender:users!messages_sender_id_fkey(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Fehler beim Senden." }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
