"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "anbieter" ? "ANBIETER" : "KUNDE";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"KUNDE" | "ANBIETER">(defaultRole);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registrierung fehlgeschlagen."); }
      else { router.push("/auth/login"); }
    } finally { setLoading(false); }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Konto erstellen</h1>
        <p className="text-zinc-500 text-sm">Kostenlos registrieren</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <div className="flex rounded-xl bg-zinc-800 p-1 mb-5">
          {(["KUNDE", "ANBIETER"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${role === r ? "bg-rose-600 text-white" : "text-zinc-400 hover:text-white"}`}>
              {r === "KUNDE" ? "Als Kunde" : "Als Anbieter"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Dein Name oder Studioname"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors" />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">E-Mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="deine@email.de"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors" />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Passwort</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={8} placeholder="Mindestens 8 Zeichen"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 pr-11 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            <UserPlus className="w-5 h-5" />
            {loading ? "Wird registriert..." : "Konto erstellen"}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-5">
          Bereits registriert?{" "}
          <Link href="/auth/login" className="text-rose-400 hover:text-rose-300 font-medium transition-colors">Jetzt anmelden</Link>
        </p>
      </div>
    </div>
  );
}
