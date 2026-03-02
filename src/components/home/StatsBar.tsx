import { ListChecks, MapPin, Star, Shield } from "lucide-react";

interface Props {
  listings: number;
  cities: number;
}

export function StatsBar({ listings, cities }: Props) {
  const stats = [
    { icon: ListChecks, label: "Aktive Inserate", value: listings.toLocaleString("de-DE") },
    { icon: MapPin, label: "Städte", value: cities.toLocaleString("de-DE") },
    { icon: Star, label: "Bewertungen", value: "1.200+" },
    { icon: Shield, label: "Verifizierte Anbieter", value: "100%" },
  ];

  return (
    <div className="bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
