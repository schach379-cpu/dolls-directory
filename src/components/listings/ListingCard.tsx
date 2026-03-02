import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Crown, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    city: string;
    priceFrom: number | null;
    viewCount: number;
    isPremium: boolean;
    isVerified: boolean;
    images: { url: string }[];
  };
  isPremium?: boolean;
}

export function ListingCard({ listing, isPremium }: ListingCardProps) {
  const imageUrl = listing.images[0]?.url ?? null;

  return (
    <Link
      href={`/inserat/${listing.slug}`}
      className={cn(
        "group block bg-zinc-900 rounded-2xl border overflow-hidden hover:border-rose-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-900/10",
        isPremium || listing.isPremium
          ? "border-amber-500/40"
          : "border-zinc-800"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-zinc-800 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-600 text-sm">Kein Foto</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {(isPremium || listing.isPremium) && (
            <span className="flex items-center gap-1 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-md">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          {listing.isVerified && (
            <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
              Verifiziert
            </span>
          )}
        </div>

        {/* View count */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-zinc-300 text-xs px-2 py-0.5 rounded-md">
          <Eye className="w-3 h-3" />
          {listing.viewCount.toLocaleString("de-DE")}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate group-hover:text-rose-400 transition-colors mb-1.5">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-zinc-500 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.city}</span>
          </div>
          {listing.priceFrom && (
            <span className="text-rose-400 font-bold text-sm">
              ab {formatPrice(listing.priceFrom)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
