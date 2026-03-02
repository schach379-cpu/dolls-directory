import { supabaseServer } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Eye, Star, Shield, Crown } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { ContactButton } from "@/components/listings/ContactButton";
import { BookmarkButton } from "@/components/listings/BookmarkButton";
import { ReviewSection } from "@/components/listings/ReviewSection";

async function getListing(slug: string) {
  const { data: listing } = await supabaseServer
    .from("listings")
    .select(`
      *,
      listing_images(*),
      listing_tags(*),
      users(id, name, created_at),
      reviews(*, users(name))
    `)
    .eq("slug", slug)
    .eq("status", "AKTIV")
    .single();

  if (!listing) notFound();

  // Increment view count
  await supabaseServer
    .from("listings")
    .update({ view_count: (listing.view_count ?? 0) + 1 })
    .eq("id", listing.id);

  return listing;
}

export default async function InseratPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);

  const reviews = listing.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
      : null;

  const images: { id: string; url: string; is_primary: boolean }[] = listing.listing_images ?? [];
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const galleryImages = images.filter((i) => !i.is_primary);
  const tags: { id: string; name: string; value: string }[] = listing.listing_tags ?? [];
  const owner = listing.users as { id: string; name: string; created_at: string } | null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="space-y-3">
            {primaryImage ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800">
                <Image src={primaryImage.url} alt={listing.title} fill className="object-cover" priority />
                {listing.is_premium && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-500 text-black text-sm font-bold px-3 py-1 rounded-lg">
                    <Crown className="w-4 h-4" />
                    Premium
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600">Kein Foto vorhanden</span>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.slice(0, 4).map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
                    <Image src={img.url} alt={listing.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{listing.title}</h1>
              <BookmarkButton listingId={listing.id} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="w-4 h-4" />
                {listing.city}{listing.zip && `, ${listing.zip}`}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Eye className="w-4 h-4" />
                {(listing.view_count ?? 0).toLocaleString("de-DE")} Aufrufe
              </div>
              {avgRating && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  {avgRating.toFixed(1)} ({reviews.length} Bewertungen)
                </div>
              )}
              {listing.is_verified && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  Verifiziert
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag.id} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-lg">
                  <span className="text-zinc-500">{tag.name}:</span> {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Beschreibung</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Reviews */}
          <ReviewSection
            listingId={listing.id}
            reviews={reviews.map((r: { id: string; rating: number; comment: string | null; created_at: string; users: { name: string | null } | null }) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              createdAt: new Date(r.created_at),
              user: { name: r.users?.name ?? null },
            }))}
            avgRating={avgRating}
            totalReviews={reviews.length}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-24">
            {listing.price_from && (
              <div className="mb-5 pb-5 border-b border-zinc-800">
                <p className="text-zinc-500 text-sm mb-1">Preis ab</p>
                <p className="text-3xl font-black text-rose-400">
                  {formatPrice(listing.price_from)}
                </p>
                {listing.price_to && (
                  <p className="text-zinc-400 text-sm mt-0.5">
                    bis {formatPrice(listing.price_to)}
                  </p>
                )}
              </div>
            )}
            <ContactButton listingId={listing.id} ownerId={listing.user_id} />
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-zinc-600 text-xs text-center">
                Inseriert am {formatDate(new Date(listing.created_at))}
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-3 text-sm">Anbieter</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold">
                {owner?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{owner?.name ?? "Anbieter"}</p>
                {owner?.created_at && (
                  <p className="text-zinc-500 text-xs">
                    Mitglied seit {formatDate(new Date(owner.created_at))}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
