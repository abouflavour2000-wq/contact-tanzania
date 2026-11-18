"use client";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupLink, setGroupLink] = useState("");

  async function refresh() {
    try {
      const res = await fetch("/api/public-status", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) { setTotal(data.totalUsers); setOpen(data.registrationOpen && data.totalUsers < 1000); }
    } catch { /* keep last known display */ }
  }
  useEffect(() => { refresh(); const timer = setInterval(refresh, 15000); return () => clearInterval(timer); }, []);

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage(""); setGroupLink("");
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, consent })
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Usajili haukufanikiwa."); return; }
      setMessage("Hongera! Usajili umefanikiwa. Jiunge na WhatsApp group kupitia kiungo hapa chini.");
      setGroupLink(data.groupLink || "");
      setName(""); setPhone(""); setConsent(false); await refresh();
    } catch { setMessage("Tatizo la mtandao. Tafadhali jaribu tena."); }
    finally { setLoading(false); }
  }

  const percentage = Math.min((total / 1000) * 100, 100);
  return <main className="min-h-screen px-4 py-10 sm:py-16">
    <div className="mx-auto w-full max-w-lg">
      <header className="mb-9 text-center">
        <div className="mb-3 text-5xl">🇹🇿</div>
        <h1 className="text-3xl font-black tracking-tight text-green-400 sm:text-4xl">TANZANIA CONTACTS</h1>
        <p className="mt-3 text-sm text-slate-400">Sajili namba yako kwa ajili ya Tanzania Status Views</p>
      </header>
      <section className="rounded-2xl border border-green-900 bg-[#0a1c10] p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-2 text-sm">
          <span className="text-slate-300">HALI YA USAJILI</span>
          <span className={open ? "font-bold text-green-400" : "font-bold text-red-400"}>{open ? "● USAJILI WAZI" : "● USAJILI UMEFUNGWA"}</span>
        </div>
        <div className="mb-2 flex justify-between text-sm"><span>Washiriki</span><strong className="text-green-400">{total}/1000</strong></div>
        <div className="mb-7 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${percentage}%` }} /></div>
        {open ? <form onSubmit={register} className="space-y-5">
          <label className="block text-sm text-green-300">JINA KAMILI
            <input required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Andika jina lako kamili" className="mt-2 w-full rounded-lg border border-green-900 bg-[#051109] p-4 text-white outline-none focus:border-green-400" />
          </label>
          <label className="block text-sm text-green-300">NAMBA YA SIMU
            <div className="mt-2 flex">
              <span className="rounded-l-lg bg-green-900 px-4 py-4 text-white">🇹🇿 +255</span>
              <input required type="tel" inputMode="numeric" maxLength={9} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="712345678" className="min-w-0 flex-1 rounded-r-lg border border-green-900 bg-[#051109] p-4 text-white outline-none focus:border-green-400" />
            </div>
          </label>
          <label className="flex gap-3 text-sm leading-6 text-slate-300">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 accent-green-500" />
            Nakubali namba yangu kuhifadhiwa na kushirikishwa na washiriki wengine kwa madhumuni ya Status Views. Naelewa kuwa naweza kuwasiliana na msimamizi kuhusu taarifa zangu.
          </label>
          {message && <p role="status" className="rounded-lg bg-slate-900 p-3 text-center text-sm text-green-300">{message}</p>}
          {groupLink && <a href={groupLink} target="_blank" rel="noreferrer" className="block rounded-lg bg-green-900 p-3 text-center font-bold text-green-100 underline">JIUNGE NA WHATSAPP GROUP</a>}
          <button disabled={loading || !consent || phone.length !== 9} className="w-full rounded-lg bg-green-500 p-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "INASAJILI..." : "SAJILI SASA"}</button>
        </form> : <div className="py-8 text-center font-bold text-red-400">USAJILI UMEFUNGWA<p className="mt-3 text-sm font-normal text-slate-400">Usajili umefungwa au nafasi zote 1,000 zimejazwa.</p></div>}
      </section>
      <footer className="mt-7 flex justify-center gap-8 text-sm"><a href="/admin" className="text-green-400 hover:underline">ADMIN LOGIN</a></footer>
      <p className="mt-8 text-center text-xs text-slate-600">TANZANIA CONTACTS © 2026</p>
    </div>
  </main>;
}
