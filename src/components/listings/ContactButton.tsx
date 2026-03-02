"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface Props {
  listingId: string;
  ownerId: string;
}

export function ContactButton({ listingId, ownerId }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleContact() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    router.push(`/nachrichten?listingId=${listingId}&receiverId=${ownerId}`);
  }

  return (
    <button
      onClick={handleContact}
      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      Anbieter kontaktieren
    </button>
  );
}
