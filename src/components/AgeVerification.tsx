"use client";

import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function AgeVerification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("age_verified");
    if (!verified) setShow(true);
  }, []);

  function confirm() {
    localStorage.setItem("age_verified", "1");
    setShow(false);
  }

  function deny() {
    window.location.href = "https://www.google.de";
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-rose-600/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">
          Altersverifikation
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Diese Website enthält Inhalte, die nur für Personen ab{" "}
          <strong className="text-white">18 Jahren</strong> geeignet sind.
          Bitte bestätige, dass du volljährig bist.
        </p>

        <div className="space-y-3">
          <button
            onClick={confirm}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Ja, ich bin 18 Jahre oder älter
          </button>
          <button
            onClick={deny}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
          >
            Nein, ich bin unter 18 Jahren
          </button>
        </div>

        <p className="text-zinc-600 text-xs mt-5">
          Mit dem Zugang stimmst du unseren{" "}
          <a href="/agb" className="underline hover:text-zinc-400">AGB</a> und der{" "}
          <a href="/datenschutz" className="underline hover:text-zinc-400">Datenschutzerklärung</a> zu.
        </p>
      </div>
    </div>
  );
}
