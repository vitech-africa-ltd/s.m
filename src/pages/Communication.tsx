import { useState } from "react";
import { useApp, mutate, audit, uid, notify, logComm, todayISO, fmtDate, fmtMoney, classOf, feeTotal, paidBy, getState, type Student } from "../lib/data";
import { Ic } from "../components/icons";
import { Chip, Field, toast } from "../components/ui";
import { PageHead } from "./Dashboard";

const fillVars = (tpl: string, st: Student | undefined) => {
  const s = getState();
  const db = s.db;
  const c = st ? classOf(db, st) : undefined;
  const bal = st ? Math.max(0, feeTotal(db, c?.level ?? 1) - paidBy(db, st.id)) : 0;
  return tpl
    .replace(/\[STUDENT_NAME\]/g, st ? `${st.first} ${st.last}` : "the student")
    .replace(/\[PARENT_NAME\]/g, st?.parent.name ?? "Parent")
    .replace(/\[CLASS\]/g, c ? `${c.name} ${c.section}` : "—")
    .replace(/\[AMOUNT\]/g, st ? fmtMoney(feeTotal(db, c?.level ?? 1), db.school.currency) : "—")
    .replace(/\[BALANCE\]/g, fmtMoney(bal, db.school.currency))
    .replace(/\[DATE\]/g, fmtDate(todayISO()))
    .replace(/\[SCHOOL_NAME\]/g, db.school.name)
    .replace(/\[MESSAGE\]/g, "Term 2 examinations begin next week. Timetables are posted.");
};

export default function CommunicationPage() {
  const s = useApp();
  const db = s.db;
  const [channel, setChannel] = useState<"SMS" | "WhatsApp" | "Email">("SMS");
  const [tplId, setTplId] = useState(db.templates[0]?.id ?? "");
  const [to, setTo] = useState("All parents");
  const [custom, setCustom] = useState("");
  const tpl = db.templates.find((t) => t.id === tplId);
  const sample = db.students[0];
  const preview = tpl ? fillVars(channel === "Email" && custom ? custom : tpl.body, sample) : custom;
  const send = () => {
    const body = preview || custom;
    if (!body.trim()) { toast("Nothing to send", "err"); return; }
    const n = to === "All parents" ? 120 : to === "All students" ? 240 : 38;
    logComm(channel, to, body);
    audit("SEND_BROADCAST", "Communication", `${channel} → ${to} (${n} recipients)`);
    notify("system", `${channel} broadcast sent`, `${n} recipients · ${channel}`);
    toast(`${channel} queued to ${n} recipients`);
  };
  const chanTone: Record<string, "blue" | "green" | "gold" | "gray"> = { SMS: "gold", WhatsApp: "green", Email: "blue" };
  return (
    <div>
      <PageHead title="Communication Center" sub="SMS, WhatsApp and Email with dynamic variables and delivery logs." />
      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">Compose message</h3>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Field label="Channel">
              <div className="flex gap-1.5">
                {(["SMS", "WhatsApp", "Email"] as const).map((c) => (
                  <button key={c} onClick={() => setChannel(c)} className={`chip !py-2 !px-3 cursor-pointer transition-all ${channel === c ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>{c}</button>
                ))}
              </div>
            </Field>
            <Field label="Template">
              <select className="input" value={tplId} onChange={(e) => { setTplId(e.target.value); setCustom(""); }}>
                {db.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Audience">
              <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
                {["All parents", "All students", "All teachers", "Senior 4", "Senior 5", "Senior 6"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Message (variables auto-filled)">
            <textarea className="input" rows={5} value={custom || tpl?.body || ""} onChange={(e) => setCustom(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["[STUDENT_NAME]", "[PARENT_NAME]", "[CLASS]", "[AMOUNT]", "[BALANCE]", "[DATE]", "[SCHOOL_NAME]"].map((v) => (
              <button key={v} className="chip bg-ink-100 dark:bg-ink-800 text-cobalt-700 dark:text-cobalt-300 font-mono !text-[10.5px] cursor-pointer hover:bg-cobalt-100 dark:hover:bg-cobalt-500/20" onClick={() => setCustom((custom || tpl?.body || "") + " " + v)}>{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button className="btn-p" onClick={send}><Ic n="send" size={15} />Send via {channel}</button>
            <span className="text-[12px] text-ink-400 font-semibold">≈ {to === "All parents" ? 120 : to === "All students" ? 240 : 38} recipients</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="eye" size={15} className="text-cobalt-500" />Live preview — {channel}</h3>
            {channel === "WhatsApp" ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                <div className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 mb-1.5">WhatsApp · {sample?.parent.name}</div>
                <div className="bg-white dark:bg-ink-800 rounded-lg rounded-tl-none px-3.5 py-2.5 text-[12.5px] shadow-panel whitespace-pre-line">{preview}</div>
                <div className="text-right text-[10px] text-emerald-600 mt-1 font-bold">✓✓ delivered</div>
              </div>
            ) : channel === "Email" ? (
              <div className="rounded-xl border border-ink-200 dark:border-ink-700 overflow-hidden">
                <div className="bg-ink-50 dark:bg-ink-950/60 px-3.5 py-2.5 text-[11px] space-y-0.5 border-b border-ink-100 dark:border-ink-800"><div><b>From:</b> {db.school.email}</div><div><b>To:</b> {sample?.parent.email || "parent@mail.com"}</div><div><b>Subject:</b> Message from {db.school.name}</div></div>
                <div className="p-3.5 text-[12.5px] whitespace-pre-line">{preview}</div>
              </div>
            ) : (
              <div className="rounded-xl bg-ink-950 text-white px-4 py-3.5">
                <div className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-1">SMS · {sample?.parent.phone}</div>
                <div className="text-[12.5px] leading-relaxed">{preview}</div>
                <div className="text-[10px] text-ink-400 mt-1.5 text-right">{preview.length} chars</div>
              </div>
            )}
          </div>
          <div className="panel overflow-hidden">
            <div className="panel-h"><h3 className="font-display font-bold text-[15px]">Delivery log</h3><Chip tone="blue">{db.commLogs.length}</Chip></div>
            <div className="max-h-72 overflow-y-auto">
              {db.commLogs.map((l) => (
                <div key={l.id} className="px-4 py-2.5 border-b border-ink-100/60 dark:border-ink-800/60 text-[12px]">
                  <div className="flex items-center gap-2"><Chip tone={chanTone[l.channel] ?? "gray"}>{l.channel}</Chip><b className="truncate">{l.to}</b><Chip tone={l.status === "sent" ? "green" : "amber"} className="ml-auto">{l.status}</Chip></div>
                  <p className="text-ink-400 truncate mt-1">{l.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsPage() {
  const s = useApp();
  const db = s.db;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All students");
  const publish = () => {
    if (!title.trim()) { toast("Title is required", "err"); return; }
    mutate((db) => db.announcements.unshift({ id: uid(), title, body, audience, date: todayISO(), by: "Jean Bosco", pinned: false }));
    audit("PUBLISH_ANNOUNCEMENT", "Announcements", `“${title}” → ${audience}`);
    notify("system", "Announcement published", `${title} → ${audience}`);
    toast("Announcement published"); setTitle(""); setBody("");
  };
  return (
    <div>
      <PageHead title="Announcements" sub="Publish to students, parents, teachers or specific classes." />
      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="panel p-5 h-fit">
          <h3 className="font-display font-bold text-[16px] mb-4">New announcement</h3>
          <div className="space-y-4">
            <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sports day" /></Field>
            <Field label="Audience"><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>{["All students", "All parents", "All teachers", "Senior 4", "Senior 5", "Senior 6"].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Body"><textarea className="input" rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            <button className="btn-p w-full" onClick={publish}><Ic n="megaphone" size={15} />Publish</button>
          </div>
        </div>
        <div className="space-y-3.5">
          {db.announcements.map((a) => (
            <div key={a.id} className="panel p-5 hover:shadow-lift transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.pinned ? "bg-gold-400 text-ink-950" : "bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300"}`}><Ic n={a.pinned ? "star" : "megaphone"} size={18} /></span>
                  <div>
                    <h3 className="font-display font-bold text-[16px] leading-snug">{a.title}</h3>
                    <p className="text-[13px] text-ink-400 mt-1">{a.body}</p>
                    <div className="flex gap-2 mt-2.5"><Chip tone="blue">{a.audience}</Chip><Chip tone="gray">{fmtDate(a.date)} · {a.by}</Chip></div>
                  </div>
                </div>
                <button className="btn-g btn-sm shrink-0" onClick={() => { mutate((db) => { const x = db.announcements.find((y) => y.id === a.id)!; x.pinned = !x.pinned; }); toast(a.pinned ? "Unpinned" : "Pinned to top", "info"); }} title={a.pinned ? "Unpin" : "Pin"}><Ic n="star" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
