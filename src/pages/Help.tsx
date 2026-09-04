import { useState } from "react";
import { useApp, audit, uid, todayISO } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, Chip, toast } from "../components/ui";
import { PageHead } from "./Dashboard";

const FAQ = [
  { q: "How do I record a payment and print the receipt?", a: "Go to Payments → Record payment, select the student, amount and method. The official receipt is generated automatically — open it and use Print / PDF. The student's balance updates everywhere instantly." },
  { q: "How are parents alerted when a child is absent?", a: "When you save an attendance register that contains absent students, the system queues the Absence SMS template to each parent and logs it in the Communication Center delivery log." },
  { q: "Can I change my currency after entering data?", a: "Yes. Settings → Finance → Change currency. Every fee, payment, expense and salary is converted automatically at the exchange rate, and the change is written to the audit log." },
  { q: "How do report cards get their grades and ranks?", a: "Grades entered under Grades feed the report card generator. Averages, letter grades, position in class and attendance are computed automatically — you only add the comments." },
  { q: "How do I import students from Excel?", a: "Students → Import. Download the CSV template, fill it, then upload. The wizard validates rows, flags duplicates and shows a preview before anything is saved." },
  { q: "How do roles and permissions work?", a: "Each of the 12 roles has configurable permissions (view_students, enter_grades, manage_payments…). Admins and Super Admin can create custom roles under Settings. Users only ever see the modules they are allowed to open." },
];

const SHORTCUTS: [string, string][] = [
  ["Open global search", "Ctrl + K"], ["Close dialogs", "Esc"], ["Toggle dark mode", "Top bar icon"],
  ["Switch language", "Top bar select"], ["Print any document", "Its Print button"], ["Mark all present", "Attendance → header"],
];

export default function HelpPage() {
  const s = useApp();
  const [openFaq, setOpenFaq] = useState(0);
  const [ticket, setTicket] = useState({ topic: "Billing & subscription", subject: "", body: "" });
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!ticket.subject.trim()) { toast("Please add a short subject", "err"); return; }
    audit("SUPPORT_TICKET", "Support", `#${1000 + s.db.audits.length} — ${ticket.topic}: ${ticket.subject}`);
    setSent(true);
    toast("Ticket submitted — our team replies within 24h");
  };
  return (
    <div>
      <PageHead title="Help & Support" sub="Guides, keyboard shortcuts and direct access to the support team.">
        <Chip tone="green"><i className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />All systems operational</Chip>
      </PageHead>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3.5">Frequently asked questions</h3>
            <div className="space-y-2">
              {FAQ.map((f, i) => (
                <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-950/60 transition-colors">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}><Ic n="info" size={14} /></span>
                    <span className="font-bold text-[14px] flex-1">{f.q}</span>
                    <Ic n="chevD" size={14} className={`text-ink-300 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && <div className="px-4 pb-3.5 pl-14 text-[13.5px] text-ink-500 dark:text-ink-300 leading-relaxed pop-in">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3.5">Keyboard shortcuts</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {SHORTCUTS.map(([label, keys]) => (
                <div key={label} className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink-500 dark:text-ink-300">{label}</span>
                  <span className="flex gap-1">{keys.split(" + ").map((k) => <span key={k} className="kbd !h-6 !px-2">{k}</span>)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-1">Contact support</h3>
            <p className="text-[12.5px] text-ink-400 mb-4">Average first response: under 4 hours.</p>
            {sent ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 p-4 text-center pop-in">
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto"><Ic n="check" size={18} sw={2.6} /></span>
                <b className="block mt-2 text-[14px]">Ticket received</b>
                <p className="text-[12px] text-ink-400 mt-1">Reference #TK-{1000 + s.db.audits.length}. We've emailed a confirmation.</p>
                <button className="btn-o btn-sm mt-3" onClick={() => { setSent(false); setTicket({ topic: ticket.topic, subject: "", body: "" }); }}>New ticket</button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <Field label="Topic">
                  <select className="input" value={ticket.topic} onChange={(e) => setTicket({ ...ticket, topic: e.target.value })}>
                    {["Billing & subscription", "Students & admissions", "Payments & receipts", "Report cards & grades", "SMS / WhatsApp", "Something else"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Subject"><input className="input" value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} placeholder="Short summary" /></Field>
                <Field label="Describe the issue"><textarea className="input" rows={4} value={ticket.body} onChange={(e) => setTicket({ ...ticket, body: e.target.value })} placeholder="What happened, and what did you expect?" /></Field>
                <button className="btn-p w-full" onClick={submit}><Ic n="send" size={15} />Submit ticket</button>
              </div>
            )}
          </div>

          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">Direct channels</h3>
            {[["mail", "support@vitech.school", "Email"], ["sms", "+250 788 000 222", "Phone / WhatsApp"], ["globe", "docs.vitech.school", "Documentation"]].map(([ic, v, l]) => (
              <div key={l} className="flex items-center gap-3 py-2.5 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <span className="w-9 h-9 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n={ic} size={16} /></span>
                <div><div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-400">{l}</div><div className="text-[13px] font-bold">{v}</div></div>
              </div>
            ))}
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-2.5"><h3 className="font-display font-bold text-[15px]">Platform status</h3><span className="text-[11px] font-bold text-ink-300">{todayISO()}</span></div>
            {[["Web application", "Operational"], ["SMS gateway", "Operational"], ["Email delivery", "Operational"], ["Backups", "Last run 02:00"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 text-[12.5px]">
                <span className="font-semibold text-ink-500 dark:text-ink-300">{k}</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400"><i className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
