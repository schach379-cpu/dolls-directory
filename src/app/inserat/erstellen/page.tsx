"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Plus, X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";

const DOLL_TAGS = [
  { name: "Material", options: ["Silikon", "TPE", "Hybrid"] },
  { name: "Größe", options: ["Klein (unter 155cm)", "Mittel (155-165cm)", "Groß (über 165cm)"] },
  { name: "Haarfarbe", options: ["Blond", "Braun", "Schwarz", "Rot", "Andere"] },
  { name: "Typ", options: ["Realistisch", "Anime/Manga", "BBW", "Athletisch"] },
];

export default function ErstellenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [tags, setTags] = useState<{ name: string; value: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") return null;
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  function toggleTag(name: string, value: string) {
    const exists = tags.find((t) => t.name === name && t.value === value);
    if (exists) {
      setTags(tags.filter((t) => !(t.name === name && t.value === value)));
    } else {
      const withoutName = tags.filter((t) => t.name !== name);
      setTags([...withoutName, { name, value }]);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 10) {
      setError("Maximal 10 Bilder erlaubt.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen.");
        urls.push(data.url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, city, zip, priceFrom, priceTo, tags, images }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fehler beim Erstellen.");
      } else {
        router.push("/anbieter/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white">Inserat erstellen</h1>
        <p className="text-zinc-500 text-sm mt-1">Wird nach Prüfung freigeschaltet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grunddaten */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Grunddaten</h2>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Titel *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="z.B. Silikon-Puppe Studio Berlin"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Beschreibung *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Beschreibe dein Angebot detailliert..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Bilder */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Bilder</h2>
          <p className="text-zinc-500 text-sm">Bis zu 10 Bilder, max. 10 MB pro Bild (JPEG, PNG, WebP)</p>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden">
                  <Image src={url} alt={`Bild ${i + 1}`} fill className="object-cover" sizes="200px" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                      Titelbild
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= 10}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 hover:border-rose-500 rounded-xl py-5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Wird hochgeladen...</>
              ) : (
                <><ImagePlus className="w-5 h-5" /> Bilder auswählen</>
              )}
            </button>
          </div>
        </div>

        {/* Standort */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Standort</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Stadt *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Berlin"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">PLZ</label>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="10115"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Preis */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Preis</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Preis ab (€)</label>
              <input
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="50"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Preis bis (€)</label>
              <input
                type="number"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                placeholder="200"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Eigenschaften</h2>
          {DOLL_TAGS.map(({ name, options }) => (
            <div key={name}>
              <p className="text-zinc-400 text-sm font-medium mb-2">{name}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const active = tags.some((t) => t.name === name && t.value === opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTag(name, opt)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        active
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Wird erstellt...</>
            ) : (
              <><Plus className="w-5 h-5" /> Inserat einreichen</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
