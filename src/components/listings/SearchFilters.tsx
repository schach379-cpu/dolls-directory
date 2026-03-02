"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";

interface Props {
  initialParams: {
    q?: string;
    stadt?: string;
    preisMin?: string;
    preisMax?: string;
    sort?: string;
  };
}

export function SearchFilters({ initialParams }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialParams.q ?? "");
  const [stadt, setStadt] = useState(initialParams.stadt ?? "");
  const [preisMin, setPreisMin] = useState(initialParams.preisMin ?? "");
  const [preisMax, setPreisMax] = useState(initialParams.preisMax ?? "");
  const [sort, setSort] = useState(initialParams.sort ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (stadt) params.set("stadt", stadt);
    if (preisMin) params.set("preisMin", preisMin);
    if (preisMax) params.set("preisMax", preisMax);
    if (sort) params.set("sort", sort);
    router.push(`/suche?${params.toString()}`);
  }

  function reset() {
    setQ(""); setStadt(""); setPreisMin(""); setPreisMax(""); setSort("");
    router.push("/suche");
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-400" />
          <h2 className="font-semibold text-white text-sm">Filter</h2>
        </div>
        <button onClick={reset} className="text-zinc-500 hover:text-white text-xs transition-colors">
          Zurücksetzen
        </button>
      </div>

      {/* Suche */}
      <div>
        <label className="text-zinc-400 text-xs font-medium block mb-2">Stichwort</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suchen..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      {/* Stadt */}
      <div>
        <label className="text-zinc-400 text-xs font-medium block mb-2">Stadt</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={stadt}
            onChange={(e) => setStadt(e.target.value)}
            placeholder="z.B. Berlin"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Preis */}
      <div>
        <label className="text-zinc-400 text-xs font-medium block mb-2">Preis (ab €)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={preisMin}
            onChange={(e) => setPreisMin(e.target.value)}
            placeholder="Min"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          <input
            type="number"
            value={preisMax}
            onChange={(e) => setPreisMax(e.target.value)}
            placeholder="Max"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Sortierung */}
      <div>
        <label className="text-zinc-400 text-xs font-medium block mb-2">Sortierung</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
        >
          <option value="">Standard</option>
          <option value="neu">Neueste zuerst</option>
          <option value="preis-asc">Preis aufsteigend</option>
          <option value="preis-desc">Preis absteigend</option>
        </select>
      </div>

      <button
        onClick={apply}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
      >
        Filter anwenden
      </button>
    </div>
  );
}
