"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Summary = { total: number; remaining: number; settings: { registration_open: boolean; whatsapp_group_link: string | null } };
type Contact = { id: number; name: string; phone: string; created_at: string };

export default function AdminPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState(""); const [summary, setSummary] = useState<Summary | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]); const [search, setSearch] = useState("");
  const [groupLink, setGroupLink] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);

  async function api(path: string, init: RequestInit = {}) {
    return fetch(path, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${sessionToken}`, ...(init.body ? { "Content-Type": "application/json" } : {}) } });
  }

  const load = useCallback(async (token: string, query: string) => {
    const headers = { Authorization: `Bearer ${token}` };

    const [s, c] = await Promise.all([
      fetch("/api/admin/summary", { headers }),
      fetch(`/api/admin/contacts?search=${encodeURIComponent(query)}`, { headers }),
    ]);

    if (s.status === 401 || s.status === 403) {
      setSessionToken("");
      setSummary(null);
      setNotice("Session imeisha au akaunti hii si admin.");
      return;
    }

    const sd = await s.json();
    const cd = await c.json();

    if (s.ok) {
      setSummary(sd);
      setGroupLink(sd.settings.whatsapp_group_link || "");
    }

    if (c.ok) setContacts(cd.contacts || []);
  }, []);

  useEffect(() => {
    const client = supabaseBrowser();
    client.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) {
        setSessionToken(token);
        void load(token, "");
      }
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token || "";
      setSessionToken(token);
      if (token) void load(token, "");
      else setSummary(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [load]);

  useEffect(() => {
    if (!sessionToken) return;

    const t = setTimeout(() => {
      void load(sessionToken, search);
    }, 250);

    return () => clearTimeout(t);
  }, [search, sessionToken, load]);

  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) setNotice("Imeshindikana kuingia. Hakikisha email/password ni sahihi na email imeruhusiwa kuwa admin.");
    setBusy(false);
  }
  async function saveSettings() {
    setBusy(true); setNotice("");
    const res = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ groupLink, registrationOpen: summary?.settings.registration_open }) });
    const data = await res.json(); setNotice(res.ok ? "Mipangilio imehifadhiwa." : data.message); await load(sessionToken, search); setBusy(false);
  }
  async function toggleRegistration() {
    if (!summary) return;
    setBusy(true);
    const res = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ registrationOpen: !summary.settings.registration_open }) });
    const data = await res.json(); setNotice(res.ok ? "Hali ya usajili imebadilishwa." : data.message); await load(sessionToken, search); setBusy(false);
  }
  async function logout() { await supabaseBrowser().auth.signOut(); setSessionToken(""); setSummary(null); setContacts([]); }

  if (!sessionToken || !summary) return <main className="min-h-screen px-4 py-12"><div className="mx-auto max-w-md rounded-2xl border border-green-900 bg-[#0a1c10] p-7">
    <Link href="/" className="text-sm text-green-400">← Rudi mwanzo</Link><h1 className="mt-5 text-2xl font-black text-green-400">ADMIN LOGIN</h1>
    <p className="mt-2 text-sm text-slate-400">Ingia kwa akaunti iliyoidhinishwa na ADMIN_EMAIL.</p>
    <form onSubmit={login} className="mt-6 space-y-4">
      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" className="w-full rounded-lg border border-green-900 bg-[#051109] p-3" />
      <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-green-900 bg-[#051109] p-3" />
      <button disabled={busy} className="w-full rounded-lg bg-green-500 p-3 font-bold text-black disabled:opacity-50">{busy ? "INAINGIA..." : "INGIA"}</button>
    </form>{notice && <p className="mt-4 text-sm text-amber-300">{notice}</p>}
  </div></main>;

  return <main className="min-h-screen px-4 py-8"><div className="mx-auto max-w-6xl">
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm text-green-400">← Tovuti</Link><h1 className="mt-2 text-3xl font-black text-green-400">TANZANIA CONTACTS</h1><p className="text-slate-400">Admin Dashboard</p></div><button onClick={logout} className="rounded-lg border border-green-800 px-4 py-2 text-sm">Toka</button></header>
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat title="WASHIRIKI" value={`${summary.total} / 1000`} /><Stat title="NAFASI ZILIZOBAKI" value={`${summary.remaining}`} /><Stat title="HALI YA USAJILI" value={summary.settings.registration_open && summary.total < 1000 ? "WAZI" : "IMEFUNGWA"} />
    </div>
    <section className="mt-6 grid gap-5 rounded-2xl border border-green-900 bg-[#0a1c10] p-5 md:grid-cols-2">
      <div><h2 className="mb-3 text-lg font-bold">Mipangilio</h2><label className="block text-sm text-slate-300">WhatsApp Group Invite Link<input value={groupLink} onChange={e => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="mt-2 w-full rounded-lg border border-green-900 bg-[#051109] p-3" /></label><div className="mt-4 flex flex-wrap gap-3"><button onClick={saveSettings} disabled={busy} className="rounded-lg bg-green-500 px-4 py-2 font-bold text-black">Hifadhi link</button><button onClick={toggleRegistration} disabled={busy || (summary.total >= 1000 && summary.settings.registration_open)} className="rounded-lg border border-green-700 px-4 py-2">{summary.settings.registration_open ? "Funga usajili" : "Fungua usajili"}</button></div></div>
      <div><h2 className="mb-3 text-lg font-bold">Export contacts</h2><p className="text-sm text-slate-400">Pakua majina na namba za washiriki wote waliojisajili. Faili ni la VCF kwa simu.</p><a href="#" onClick={async e => { e.preventDefault(); const r = await api("/api/admin/export"); if (!r.ok) { setNotice("Imeshindikana kupakua faili."); return; } const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "Tanzania-Contacts.vcf"; a.click(); URL.revokeObjectURL(url); }} className="mt-4 inline-block rounded-lg bg-green-500 px-4 py-3 font-bold text-black">PAKUA Tanzania-Contacts.vcf</a></div>
    </section>
    {notice && <p role="status" className="mt-4 rounded-lg bg-slate-900 p-3 text-sm text-green-300">{notice}</p>}
    <section className="mt-7"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Historia / Orodha ya washiriki</h2><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tafuta jina au simu..." className="rounded-lg border border-green-900 bg-[#0a1c10] p-3 text-sm" /></div>
      <div className="overflow-x-auto rounded-xl border border-green-900"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#10251a] text-green-300"><tr><th className="p-3">Jina</th><th className="p-3">Namba</th><th className="p-3">Tarehe ya usajili</th></tr></thead><tbody>{contacts.map(c => <tr key={c.id} className="border-t border-green-950"><td className="p-3">{c.name}</td><td className="p-3">{c.phone}</td><td className="p-3">{new Date(c.created_at).toLocaleString("sw-TZ")}</td></tr>)}{contacts.length === 0 && <tr><td colSpan={3} className="p-5 text-center text-slate-400">Hakuna washiriki waliopatikana.</td></tr>}</tbody></table></div><p className="mt-2 text-xs text-slate-500">Orodha inaonyesha hadi rekodi 500 za karibuni; export hupakua hadi 1,000.</p>
    </section>
  </div></main>;
}
function Stat({ title, value }: { title: string; value: string }) { return <div className="rounded-xl border border-green-900 bg-[#0a1c10] p-5"><p className="text-xs text-slate-400">{title}</p><p className="mt-2 text-2xl font-black text-green-400">{value}</p></div>; }
