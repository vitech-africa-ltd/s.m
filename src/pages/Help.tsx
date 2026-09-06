import { useState } from "react";
import { useApp, audit, notify, uid } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, toast, Chip } from "../components/ui";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

const FAQ = [
  { q: "How do I record a payment?", a: "Go to Payments → Record payment, choose the student, amount and method. An official receipt is generated automatically and the parent is notified by SMS." },
  { q: "How do I enter grades?", a: "Go to Grade entry, select the exam, class and subject, then type marks (0–100). Averages, letter grades and class ranks are computed instantly." },
  { q: "How do I print report cards?", a: "Open Report cards, pick the exam and class, then click Open on any student. Choose a template and press Print / PDF." },
  { q: "Can parents see their child's fees?", a: "Yes. The Parent portal shows grades, attendance, fee balance and school announcements for each linked child." },
  { q: "How do I change the school currency?", a: "Settings → Finance & Currency → Change. All fees, payments and salaries are converted automatically at the exchange rate." },
  { q: "Is my data backed up?", a: "Automatic nightly backups run by default. You can also create a manual backup from Settings → System and restore any snapshot." },
];

export default function HelpPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ subject: "", body: "" });
  const send = () => {
    if (!f.subject.trim() || !f.body.trim()) { toast("Subject and message are required", "err"); return; }
    audit("SUPPORT_TICKET", "Help", `Ticket opened — ${f.subject}`);
    notify("system", "Support ticket sent", f.subject);
    toast("Ticket sent — our team replies within 24h");
    setSent(true); setF({ subject: "", body: "" });
  };
  return (
    <div>
      <PageHead title="Help & Support" sub="Guides, shortcuts and direct contact with the VITECH team." />
      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-3">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-4">Frequently asked questions</h3>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
                  <button className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-950/60 transition-colors" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                    <b className="text-[14px]">{item.q}</b>
                    <Ic n="chevD" size={15} className={`text-ink-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
                  </button>
                  {open === i && <p className="px-4 pb-4 text-[13.5px] text-ink-500 dark:text-ink-300 leading-relaxed fade-in">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-4">Keyboard shortcuts</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[["Ctrl + K", "Global search"], ["Esc", "Close dialogs"], ["Ctrl + P", "Print current document"]].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                  <span className="kbd !h-7 !px-2.5 !text-[12px]">{k}</span>
                  <span className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-4">Contact support</h3>
            {sent ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2"><Ic n="check" size={18} sw={2.6} /></span>
                <b className="block text-[14px] text-emerald-700 dark:text-emerald-300">Ticket sent</b>
                <p className="text-[12.5px] text-ink-400 mt-1">We'll get back to you within 24 hours.</p>
                <button className="btn-o btn-sm mt-3" onClick={() => setSent(false)}>Send another</button>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Subject"><input className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Payment receipt issue" /></Field>
                <Field label="Message"><textarea className="input" rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Describe your problem…" /></Field>
                <button className="btn-p w-full" onClick={send}><Ic n="send" size={15} />Send ticket</button>
              </div>
            )}
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">System status</h3>
            <div className="space-y-2.5 text-[13px]">
              {[["Version", `v${db.system.version} (${db.system.channel})`], ["Uptime (30d)", "99.98%"], ["Last backup", db.backups[0]?.date ?? "—"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2"><span className="font-semibold text-ink-500 dark:text-ink-300">{k}</span><Chip tone="green">{v}</Chip></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
