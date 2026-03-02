import Link from "next/link";

const CITIES = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt",
  "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
  "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg",
];

export function CityLinks() {
  return (
    <section className="bg-zinc-900 border-t border-zinc-800 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-white font-bold text-lg mb-6">Inserate nach Stadt</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <Link
              key={city}
              href={`/suche?stadt=${encodeURIComponent(city)}`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-sm rounded-lg transition-all"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
