"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  listingTitle?: string;
  listingSlug?: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: { id: string; name: string } | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `${days} Tg.`;
}

function NachrichtenInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialReceiverId = searchParams.get("receiverId");
  const initialListingId = searchParams.get("listingId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialReceiverId);
  const [activePartnerName, setActivePartnerName] = useState<string>("");
  const [activeListingSlug, setActiveListingSlug] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/nachrichten");
    if (res.ok) {
      const data: Conversation[] = await res.json();
      setConversations(data);
      if (!activePartnerId && data.length > 0) {
        setActivePartnerId(data[0].partnerId);
        setActivePartnerName(data[0].partnerName);
        setActiveListingSlug(data[0].listingSlug);
      }
    }
    setLoadingConvs(false);
  }, [activePartnerId]);

  const loadMessages = useCallback(async (partnerId: string) => {
    setLoadingMsgs(true);
    const res = await fetch(`/api/nachrichten?partnerId=${partnerId}`);
    if (res.ok) {
      const data: Message[] = await res.json();
      setMessages(data);
    }
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") loadConversations();
  }, [status, loadConversations]);

  useEffect(() => {
    if (activePartnerId) loadMessages(activePartnerId);
  }, [activePartnerId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function selectConversation(conv: Conversation) {
    setActivePartnerId(conv.partnerId);
    setActivePartnerName(conv.partnerName);
    setActiveListingSlug(conv.listingSlug);
    setConversations((prev) =>
      prev.map((c) => (c.partnerId === conv.partnerId ? { ...c, unread: 0 } : c))
    );
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activePartnerId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const res = await fetch("/api/nachrichten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: activePartnerId,
        listingId: initialListingId ?? null,
        content,
      }),
    });

    if (res.ok) {
      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) => {
        const existing = prev.find((c) => c.partnerId === activePartnerId);
        if (existing) {
          return [
            { ...existing, lastMessage: content, lastAt: msg.created_at },
            ...prev.filter((c) => c.partnerId !== activePartnerId),
          ];
        }
        return [
          {
            partnerId: activePartnerId,
            partnerName: activePartnerName,
            lastMessage: content,
            lastAt: msg.created_at,
            unread: 0,
          },
          ...prev,
        ];
      });
    }
    setSending(false);
  }

  if (status === "loading") return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" suppressHydrationWarning>
      <h1 className="text-2xl font-black text-white mb-6">Nachrichten</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex h-[600px]">
        {/* Conversation list */}
        <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gespräche</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-zinc-600 text-sm">Noch keine Gespräche</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 ${
                    activePartnerId === conv.partnerId ? "bg-zinc-800" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-medium truncate">{conv.partnerName}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {conv.unread > 0 && (
                        <span className="bg-rose-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {conv.unread}
                        </span>
                      )}
                      <span className="text-zinc-600 text-xs">{timeAgo(conv.lastAt)}</span>
                    </div>
                  </div>
                  {conv.listingTitle && (
                    <p className="text-zinc-600 text-xs truncate mb-0.5">📌 {conv.listingTitle}</p>
                  )}
                  <p className="text-zinc-500 text-xs truncate">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {activePartnerId ? (
            <>
              {/* Header */}
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{activePartnerName}</p>
                  {activeListingSlug && (
                    <Link
                      href={`/inserat/${activeListingSlug}`}
                      className="text-rose-400 hover:text-rose-300 text-xs transition-colors"
                    >
                      Inserat ansehen →
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                    Noch keine Nachrichten. Schreib die erste!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-rose-600 text-white rounded-br-sm"
                              : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-rose-200" : "text-zinc-500"}`}>
                            {timeAgo(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-zinc-800 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <MessageCircle className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-zinc-500">Wähle ein Gespräch aus oder kontaktiere</p>
              <p className="text-zinc-600 text-sm mt-1">einen Anbieter über ein Inserat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NachrichtenPage() {
  return (
    <Suspense fallback={null}>
      <NachrichtenInner />
    </Suspense>
  );
}
