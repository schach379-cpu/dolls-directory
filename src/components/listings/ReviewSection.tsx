"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null };
}

interface Props {
  listingId: string;
  reviews: Review[];
  avgRating: number | null;
  totalReviews: number;
}

export function ReviewSection({ listingId, reviews, avgRating, totalReviews }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, rating, comment }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setLocalReviews([newReview, ...localReviews]);
        setRating(0);
        setComment("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-white">Bewertungen</h2>
        {avgRating && (
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <span className="text-white font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-zinc-500 text-sm">({totalReviews})</span>
          </div>
        )}
      </div>

      {/* Write Review */}
      {session && (
        <form onSubmit={submit} className="mb-6 pb-6 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-300 mb-3">Bewertung schreiben</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    s <= (hoverRating || rating)
                      ? "text-amber-400 fill-current"
                      : "text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Deine Erfahrung (optional)..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none mb-3"
          />
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {submitting ? "Wird gespeichert..." : "Bewertung senden"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {localReviews.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-4">Noch keine Bewertungen.</p>
      ) : (
        <div className="space-y-4">
          {localReviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {review.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{review.user.name ?? "Nutzer"}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-current" : "text-zinc-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-zinc-600 text-xs">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
