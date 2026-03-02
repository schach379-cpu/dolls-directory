"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("stadt", city);
    router.push(`/suche?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
    >
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stichwort, Puppentyp..."
          className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>
      <div className="relative sm:w-48">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Stadt oder PLZ"
          className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors whitespace-nowrap"
      >
        Suchen
      </button>
    </form>
  );
}
