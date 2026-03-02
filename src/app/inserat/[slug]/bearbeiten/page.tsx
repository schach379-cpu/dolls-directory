import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { BearbeitenForm } from "./BearbeitenForm";

async function getListing(slug: string, userId: string) {
  const { data } = await supabaseServer
    .from("listings")
    .select("id, title, description, city, zip, price_from, price_to, user_id, listing_images(url, is_primary, order), listing_tags(name, value)")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  if (data.user_id !== userId) notFound();

  return data;
}

export default async function BearbeitenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { slug } = await params;
  const listing = await getListing(slug, session.user.id);

  return <BearbeitenForm listing={listing} />;
}
