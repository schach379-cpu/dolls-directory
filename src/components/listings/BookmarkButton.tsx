"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  listingId: string;
}

export function BookmarkButton({ listingId }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) setSaved(!saved);
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "p-2.5 rounded-xl border transition-colors",
        saved
          ? "bg-rose-600 border-rose-600 text-white"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
      )}
    >
      <Heart className={cn("w-5 h-5", saved && "fill-current")} />
    </button>
  );
}
