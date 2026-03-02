import { auth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Eye, Edit, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_CONFIG = {
  AKTIV:      { label: "Aktiv",      icon: CheckCircle, color: "text-emerald-400" },
  AUSSTEHEND: { label: "Ausstehend", icon: Clock,       color: "text-amber-400"  },
  INAKTIV:    { label: "Inaktiv",    icon: XCircle,     color: "text-zinc-500"   },
  GESPERRT:   { label: "Gesperrt",   icon: XCircle,     color: "text-red-400"    },
} as const;

type ListingStatus = keyof typeof STATUS_CONFIG;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { data: listings } = await supabaseServer
    .from("listings")
    .select("*, listing_images(url, is_primary)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const rows = listings ?? [];
  const stats = {
    total: rows.length,
    active: rows.filter((l) => l.status === "AKTIV").length,
    views: rows.reduce((s: number, l: { view_count: number }) => s + (l.view_count ?? 0), 0),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Mein Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Verwalte deine Inserate</p>
        </div>
        <Link
          href="/inserat/erstellen"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neues Inserat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Inserate gesamt",  value: stats.total },
          { label: "Aktive Inserate",  value: stats.active },
          { label: "Gesamtaufrufe",    value: stats.views.toLocaleString("de-DE") },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Meine Inserate</h2>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="mb-4">Noch keine Inserate vorhanden.</p>
            <Link href="/inserat/erstellen" className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
              Erstes Inserat erstellen
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {rows.map((listing) => {
              const status = (listing.status ?? "AUSSTEHEND") as ListingStatus;
              const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.AUSSTEHEND;
              const StatusIcon = sc.icon;
              const primaryImg = (listing.listing_images ?? []).find(
                (i: { is_primary: boolean }) => i.is_primary
              ) ?? (listing.listing_images ?? [])[0];

              return (
                <div key={listing.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="w-16 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                    {primaryImg ? (
                      <img src={primaryImg.url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">–</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-zinc-500 text-xs">{listing.city}</span>
                      {listing.price_from && (
                        <span className="text-zinc-500 text-xs">ab {formatPrice(listing.price_from)}</span>
                      )}
                      <span className="text-zinc-600 text-xs">{formatDate(new Date(listing.created_at))}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium ${sc.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {sc.label}
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    {(listing.view_count ?? 0).toLocaleString("de-DE")}
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/inserat/${listing.slug}`} className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/inserat/${listing.slug}/bearbeiten`} className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
