import { supabaseServer } from "@/lib/supabase";
import { HeroSearch } from "@/components/home/HeroSearch";
import { ListingCard } from "@/components/listings/ListingCard";
import { StatsBar } from "@/components/home/StatsBar";
import { CityLinks } from "@/components/home/CityLinks";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ListingWithImage } from "@/types";

async function getFeaturedListings(): Promise<ListingWithImage[]> {
  const { data } = await supabaseServer
    .from("listings")
    .select("*, listing_images(url, is_primary)")
    .eq("status", "AKTIV")
    .eq("is_featured", true)
    .order("view_count", { ascending: false })
    .limit(6);
  return (data ?? []).map((l) => ({
    ...l,
    isPremium: l.is_premium,
    isFeatured: l.is_featured,
    isVerified: l.is_verified,
    priceFrom: l.price_from,
    priceTo: l.price_to,
    viewCount: l.view_count,
    images: (l.listing_images ?? []).map((img: { url: string; is_primary: boolean }) => ({
      url: img.url,
      isPrimary: img.is_primary,
    })),
  }));
}

async function getNewListings(): Promise<ListingWithImage[]> {
  const { data } = await supabaseServer
    .from("listings")
    .select("*, listing_images(url, is_primary)")
    .eq("status", "AKTIV")
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []).map((l) => ({
    ...l,
    isPremium: l.is_premium,
    isFeatured: l.is_featured,
    isVerified: l.is_verified,
    priceFrom: l.price_from,
    priceTo: l.price_to,
    viewCount: l.view_count,
    images: (l.listing_images ?? []).map((img: { url: string; is_primary: boolean }) => ({
      url: img.url,
      isPrimary: img.is_primary,
    })),
  }));
}

async function getStats() {
  const { count: listings } = await supabaseServer
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "AKTIV");

  const { data: cities } = await supabaseServer
    .from("listings")
    .select("city")
    .eq("status", "AKTIV");

  const uniqueCities = new Set((cities ?? []).map((c: { city: string }) => c.city)).size;
  return { listings: listings ?? 0, cities: uniqueCities };
}

export default async function HomePage() {
  const [featured, newest, stats] = await Promise.all([
    getFeaturedListings(),
    getNewListings(),
    getStats(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-rose-600/10 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-rose-600/20 mb-5">
            #1 Sexpuppen-Verzeichnis in Deutschland
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Finde{" "}
            <span className="text-rose-500">Sexpuppen-Studios</span>{" "}
            in deiner Nähe
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            {stats.listings.toLocaleString("de-DE")} aktive Inserate in {stats.cities} Städten.
            Echte Anbieter, echte Bewertungen.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* Stats */}
      <StatsBar listings={stats.listings} cities={stats.cities} />

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Premium Inserate</h2>
            </div>
            <Link href="/suche?featured=true" className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">
              Alle ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isPremium />
            ))}
          </div>
        </section>
      )}

      {/* Newest */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Neu eingetragen</h2>
          </div>
          <Link href="/suche?sort=neu" className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">
            Alle ansehen →
          </Link>
        </div>
        {newest.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-4">Noch keine Inserate vorhanden.</p>
            <Link href="/auth/register?role=anbieter" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Jetzt erstes Inserat erstellen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* City Links */}
      <CityLinks />
    </>
  );
}
