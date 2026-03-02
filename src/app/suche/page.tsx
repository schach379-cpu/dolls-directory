import { supabaseServer } from "@/lib/supabase";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchFilters } from "@/components/listings/SearchFilters";
import type { ListingWithImage } from "@/types";

interface SearchParams {
  q?: string;
  stadt?: string;
  preisMin?: string;
  preisMax?: string;
  featured?: string;
  sort?: string;
  seite?: string;
}

const PAGE_SIZE = 16;

async function searchListings(params: SearchParams) {
  const page = parseInt(params.seite ?? "1");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabaseServer
    .from("listings")
    .select("*, listing_images(url, is_primary)", { count: "exact" })
    .eq("status", "AKTIV");

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%,city.ilike.%${params.q}%`
    );
  }
  if (params.stadt) query = query.ilike("city", `%${params.stadt}%`);
  if (params.featured === "true") query = query.eq("is_featured", true);
  if (params.preisMin) query = query.gte("price_from", parseInt(params.preisMin));
  if (params.preisMax) query = query.lte("price_from", parseInt(params.preisMax));

  if (params.sort === "neu") query = query.order("created_at", { ascending: false });
  else if (params.sort === "preis-asc") query = query.order("price_from", { ascending: true });
  else if (params.sort === "preis-desc") query = query.order("price_from", { ascending: false });
  else query = query.order("is_featured", { ascending: false });

  query = query.range(from, to);

  const { data, count } = await query;

  const listings: ListingWithImage[] = (data ?? []).map((l) => ({
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

  const total = count ?? 0;
  return { listings, total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

export default async function SuchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { listings, total, page, pages } = await searchListings(params);

  const title = params.stadt
    ? `Inserate in ${params.stadt}`
    : params.q
    ? `Suche: "${params.q}"`
    : "Alle Inserate";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 flex-shrink-0">
          <SearchFilters initialParams={params} />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {total.toLocaleString("de-DE")} Inserate gefunden
              </p>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-lg mb-2">Keine Inserate gefunden</p>
              <p className="text-sm">Versuche es mit anderen Suchbegriffen.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                    const sp = new URLSearchParams(params as Record<string, string>);
                    sp.set("seite", String(p));
                    return (
                      <a
                        key={p}
                        href={`/suche?${sp.toString()}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-rose-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        {p}
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
