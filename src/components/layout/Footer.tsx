import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-3">DollsDirectory</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Das führende Verzeichnis für Sexpuppen-Studios in Deutschland.
            </p>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-3">Suche</h4>
            <ul className="space-y-2">
              <li><Link href="/suche" className="text-zinc-500 hover:text-white text-sm transition-colors">Alle Inserate</Link></li>
              <li><Link href="/suche?featured=true" className="text-zinc-500 hover:text-white text-sm transition-colors">Top Angebote</Link></li>
              <li><Link href="/suche?sort=neu" className="text-zinc-500 hover:text-white text-sm transition-colors">Neue Inserate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-3">Anbieter</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/register?role=anbieter" className="text-zinc-500 hover:text-white text-sm transition-colors">Jetzt inserieren</Link></li>
              <li><Link href="/anbieter/dashboard" className="text-zinc-500 hover:text-white text-sm transition-colors">Mein Dashboard</Link></li>
              <li><Link href="/preise" className="text-zinc-500 hover:text-white text-sm transition-colors">Preise & Pakete</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-3">Rechtliches</h4>
            <ul className="space-y-2">
              <li><Link href="/impressum" className="text-zinc-500 hover:text-white text-sm transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="text-zinc-500 hover:text-white text-sm transition-colors">Datenschutz</Link></li>
              <li><Link href="/agb" className="text-zinc-500 hover:text-white text-sm transition-colors">AGB</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} DollsDirectory. Nur für Personen ab 18 Jahren.
          </p>
          <p className="text-zinc-600 text-xs">
            Alle Inhalte sind legal. Kein Menschenhandel. Ausschließlich für Sexpuppen-Anbieter.
          </p>
        </div>
      </div>
    </footer>
  );
}
