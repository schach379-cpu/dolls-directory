"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Heart, MessageCircle, User, LogOut, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-rose-500">Dolls</span>
          <span className="text-2xl font-black text-white">Directory</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/suche" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            Alle Inserate
          </Link>
          <Link href="/suche?featured=true" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            Top Angebote
          </Link>
          <Link href="/suche?sort=neu" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            Neu eingetragen
          </Link>
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/inserat/erstellen"
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Inserat erstellen
              </Link>

              <Link href="/nachrichten" className="p-2 text-zinc-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </Link>

              <Link href="/merkliste" className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-sm font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-xl border border-zinc-700 shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-700">
                      <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{session.user?.email}</p>
                    </div>
                    {session.user?.role === "ANBIETER" || session.user?.role === "ADMIN" ? (
                      <Link
                        href="/anbieter/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                    ) : null}
                    <Link
                      href="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mein Profil
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-zinc-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2"
              >
                Anmelden
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-zinc-400"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-3">
          <Link href="/suche" className="block text-sm text-zinc-300 py-2" onClick={() => setMobileOpen(false)}>
            Alle Inserate
          </Link>
          <Link href="/suche?featured=true" className="block text-sm text-zinc-300 py-2" onClick={() => setMobileOpen(false)}>
            Top Angebote
          </Link>
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            {session ? (
              <>
                <Link href="/inserat/erstellen" className="block bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                  Inserat erstellen
                </Link>
                <Link href="/nachrichten" className="block text-sm text-zinc-300 py-2" onClick={() => setMobileOpen(false)}>
                  Nachrichten
                </Link>
                <Link href="/anbieter/dashboard" className="block text-sm text-zinc-300 py-2" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="block w-full text-left text-sm text-rose-400 py-2">
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-sm text-zinc-300 py-2" onClick={() => setMobileOpen(false)}>
                  Anmelden
                </Link>
                <Link href="/auth/register" className="block bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
