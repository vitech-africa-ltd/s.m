import { useMemo, useState } from "react";
import { useApp, getState, mutate, audit, uid, notify, logComm, todayISO, fmtMoney, fmtDate, classOf, feeTotal, paidBy, type Student } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Field, Chip, Empty, toast } from "../components/ui";
import { PageHead } from "./Dashboard";

const VARS = ["[STUDENT_NAME]", "[PARENT_NAME]", "[CLASS]", "[AMOUNT]", "[BALANCE]", "[DATE]", "[SCHOOL_NAME]", "[MESSAGE]"];
const fill = (tpl: string, st?: Student) => {
  const s = getState();
  const c = st ? classOf(s.db, st) : undefined;
  const total = st && c ? feeTotal(s.db, c.level) : 0;
  const paid = st ? paidBy(s.db, st.id) : 0;
  return tpl
    .replace(/\[STUDENT_NAME\]/g, st ? `${st.first} ${st.last}` : "the student")
    .replace(/\[PARENT_NAME\]/g, st?.parent.name ?? "Parent")
    .replace(/\[CLASS\]/g, c ? `${c.name} ${c.section}` : "their class")
    .replace(/\[AMOUNT\]/g, fmtMoney(50000, s.db.school.currency))
    .replace(/\[BALANCE\]/g, fmtMoney(Math.max(0, total - paid), s.db.school.currency))
    .replace(/\[DATE\]/g, fmtDate(todayISO()))
    .replace(/\[SCHOOL_NAME\]/g, s.db.school.name);
};

export default function CommunicationPage() {
  const s = useApp();
  const db = s.db;
  const [tab, setTab] = useState<"compose" | "announcements" | "templates" | "logs">("compose");
  const [audience, setAudience] = useState("All parents");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp" | "Email" | "Push">("SMS");
  const [tplId, setTplId] = useState(db.templates[0]?.id ?? "");
  const [body, setBody] = useState(db.templates[0]?.body ?? "");
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState("");
  const [sendCount, setSendCount] = useState(0);
  const [editTpl, setEditTpl] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState(false);
  const [ann, setAnn] = useState({ title: "", body: "", audience: "Everyone", scheduled: "" });
  const [chFilter, setChFilter] = useState("all");

  const audiences = ["All parents", "All students", "All teachers", "Everyone", ...db.classes.map((c) => `${c.name} ${c.section}`)];
  const estRecipients = audience === "Everyone" ? db.students.length + db.teachers.length : audience === "All parents" ? db.students.length : audience === "All students" ? db.students.length : audience === "All teachers" ? db.teachers.length : db.students.filter((x) => `${classOf(db, x)?.name} ${classOf(db, x)?.section}` === audience).length;

  const sample = useMemo(() => {
    const st = db.students.find((x) => x.status === "active");
    return fill(body, st);
  }, [body, db.students]);

  const send = () => {
    if (!body.trim()) { toast("Message is empty", "err"); return; }
    logComm(channel, `${audience} · ${estRecipients} recipients`, body.slice(0, 60) + (body.length > 60 ? "…" : ""), "sent");
    audit("SEND_MESSAGE", "Communication", `${channel} blast to ${audience} (${estRecipients} recipients)`);
    notify("system", `${channel} campaign sent`, `${estRecipients} recipients · ${audience}`);
    setSendCount((c) => c + 1);
    toast(`Queued to ${estRecipients.toLocaleString()} recipients via ${channel}`);
  };
  const postAnnouncement = () => {
    if (!ann.title || !ann.body) { toast("Title and message are required", "err"); return; }
    mutate((db) => db.announcements.unshift({ id: uid(), title: ann.title, body: ann.body, audience: ann.audience, date: schedule || todayISO(), scheduled: schedule || undefined, by: "Jean Bosco", pinned: false }));
    audit("CREATE_ANNOUNCEMENT", "Announcement", schedule ? `“${ann.title}” scheduled for ${schedule}` : `“${ann.title}” published to ${ann.audience}`);
    notify("announcement", "New announcement", ann.title);
    toast(schedule ? "Announcement scheduled" : "Announcement published");
    setAnnForm(false); setAnn({ title: "", body: "", audience: "Everyone", scheduled: "" });
  };

  return (
    <div>
      <PageHead title="Communication Center" sub="SMS, WhatsApp, Email and push — with templates and delivery logs.">
        <div className="panel !shadow-none p-1 flex gap-1">
          {([["compose", "Compose", "send"], ["announcements", "Announcements", "megaphone"], ["templates", "Templates", "file"], ["logs", "Delivery logs", "audit"]] as const).map(([id, label, ic]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${tab === id ? "bg-cobalt-600 text-white" : "text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"}`}><Ic n={ic} size={14} />{label}</button>
          ))}
        </div>
      </PageHead>

      {tab === "compose" && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <div className="panel p-5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Audience"><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>{audiences.map((a) => <option key={a}>{a}</option>)}</select></Field>
              <Field label="Channel">
                <div className="grid grid-cols-4 gap-1.5">
                  {([["SMS", "sms"], ["WhatsApp", "whatsapp"], ["Email", "mail"], ["Push", "bell"]] as const).map(([ch, ic]) => (
                    <button key={ch} onClick={() => setChannel(ch)} className={`rounded-lg border-2 py-2 text-[11px] font-extrabold transition-all cursor-pointer ${channel === ch ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300" : "border-ink-100 dark:border-ink-800 text-ink-400"}`}><Ic n={ic} size={14} className="mx-auto mb-0.5" />{ch}</button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Start from template">
              <select className="input" value={tplId} onChange={(e) => { setTplId(e.target.value); const t = db.templates.find((x) => x.id === e.target.value); if (t) setBody(t.body); }}>
                {db.templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>)}
              </select>
            </Field>
            <div className="mt-4">
              <span className="label">Message</span>
              <textarea className="input" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {VARS.map((v) => <button key={v} onClick={() => setBody((b) => (b.includes("[MESSAGE]") ? b.replace("[MESSAGE]", v) : b + " " + v))} className="chip bg-ink-100 dark:bg-ink-800 text-cobalt-600 dark:text-cobalt-300 font-mono !text-[10.5px] hover:bg-cobalt-100 dark:hover:bg-cobalt-500/20 cursor-pointer transition-colors">{v}</button>)}
            </div>
            <div className="flex items-center justify-between mt-5">
              <div className="text-[12.5px] font-semibold text-ink-400"><b className="text-ink-700 dark:text-ink-100">{estRecipients.toLocaleString()}</b> recipients · est. cost <b className="text-ink-700 dark:text-ink-100">{fmtMoney(estRecipients * 25, "RWF")}</b></div>
              <div className="flex gap-2">
                <input type="date" className="input !w-auto" value={schedule} onChange={(e) => setSchedule(e.target.value)} aria-label="Schedule date" title="Leave empty to send now" />
                <button className="btn-p" onClick={send}><Ic n="send" size={15} />{schedule ? "Schedule" : "Send now"}</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="panel p-5">
              <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="eye" size={16} className="text-cobalt-500" />Live preview</h3>
              {channel === "WhatsApp" ? (
                <div className="rounded-xl bg-[#e7f6ec] dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900 p-3.5 text-[12.5px] leading-relaxed whitespace-pre-line">{sample}<div className="text-right text-[10px] text-emerald-600 font-bold mt-1">✓✓ 09:41</div></div>
              ) : channel === "Email" ? (
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4"><div className="text-[11px] font-bold text-ink-400 mb-2">From: {db.school.email}</div><p className="text-[12.5px] whitespace-pre-line leading-relaxed">{sample}</p></div>
              ) : (
                <div className="rounded-xl bg-ink-950 text-ink-100 p-3.5 text-[12.5px] leading-relaxed">{sample}<div className="text-[10px] text-ink-400 font-bold mt-1.5">SMS · 1 segment</div></div>
              )}
            </div>
            <div className="panel p-5">
              <h3 className="font-display font-bold text-[15px] mb-3">Gateway status</h3>
              {[["Twilio SMS", "connected", "green"], ["WhatsApp Business API", "connected", "green"], ["SMTP (SendGrid)", "connected", "green"], ["Push (FCM)", "connected", "green"]].map(([n, st, tone]) => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 text-[13px]">
                  <span className="font-semibold">{n}</span><Chip tone={tone as "green"}><i className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />{st}</Chip>
                </div>
              ))}
              <p className="text-[11.5px] text-ink-300 font-semibold mt-2.5">Configure providers in Settings → Communication.</p>
            </div>
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div>
          <div className="flex justify-end mb-4"><button className="btn-p btn-sm" onClick={() => setAnnForm(true)}><Ic n="plus" size={15} />New announcement</button></div>
          <div className="grid md:grid-cols-2 gap-4">
            {db.announcements.map((a) => (
              <div key={a.id} className={`panel p-5 ${a.pinned ? "!border-gold-300 dark:!border-gold-700" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-[16px] leading-snug">{a.pinned && <Ic n="star" size={14} className="inline text-gold-500 mr-1.5" />}{a.title}</h3>
                  <Chip tone={a.scheduled ? "amber" : "green"}>{a.scheduled ? `Scheduled ${fmtDate(a.scheduled)}` : "Published"}</Chip>
                </div>
                <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-2 leading-relaxed">{a.body}</p>
                <div className="flex items-center gap-2.5 mt-3.5 text-[12px] font-semibold text-ink-400">
                  <Chip tone="blue">{a.audience}</Chip><span>{fmtDate(a.date)}</span><span className="ml-auto">by {a.by}</span>
                </div>
              </div>
            ))}
          </div>
          <Modal open={annForm} onClose={() => setAnnForm(false)} title="Publish announcement" w="max-w-lg"
            footer={<><button className="btn-o" onClick={() => setAnnForm(false)}>Cancel</button><button className="btn-p" onClick={postAnnouncement}><Ic n="megaphone" size={15} />Publish</button></>}>
            <div className="space-y-4">
              <Field label="Title"><input className="input" value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} /></Field>
              <Field label="Message"><textarea className="input" rows={4} value={ann.body} onChange={(e) => setAnn({ ...ann, body: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Audience"><select className="input" value={ann.audience} onChange={(e) => setAnn({ ...ann, audience: e.target.value })}>{audiences.map((a) => <option key={a}>{a}</option>)}</select></Field>
                <Field label="Schedule (optional)"><input type="date" className="input" value={ann.scheduled} onChange={(e) => setAnn({ ...ann, scheduled: e.target.value })} /></Field>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {tab === "templates" && (
        <div className="grid md:grid-cols-2 gap-4">
          {db.templates.map((tp) => (
            <div key={tp.id} className="panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[16px] flex items-center gap-2"><Ic n={tp.channel === "SMS" ? "sms" : tp.channel === "WhatsApp" ? "whatsapp" : "mail"} size={16} className={tp.channel === "WhatsApp" ? "text-emerald-500" : "text-cobalt-500"} />{tp.name}</h3>
                <Chip tone="navy">{tp.channel}</Chip>
              </div>
              {editTpl === tp.id ? (
                <div className="mt-3">
                  <textarea className="input" rows={4} value={tp.body} onChange={(e) => mutate((db) => { const x = db.templates.find((y) => y.id === tp.id)!; x.body = e.target.value; })} />
                  <div className="flex justify-end gap-2 mt-2"><button className="btn-p btn-sm" onClick={() => { setEditTpl(null); audit("UPDATE_TEMPLATE", "Communication", `Template “${tp.name}” updated`); toast("Template saved"); }}><Ic n="check" size={13} />Done</button></div>
                </div>
              ) : (
                <>
                  <p className="mt-3 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 text-[12.5px] font-mono leading-relaxed text-ink-500 dark:text-ink-300">{tp.body}</p>
                  <button className="btn-g btn-sm mt-2" onClick={() => setEditTpl(tp.id)}><Ic n="pencil" size={13} />Edit template</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="panel overflow-hidden">
          <div className="flex gap-2 flex-wrap p-4 border-b border-ink-100 dark:border-ink-800">
            {["all", "SMS", "WhatsApp", "Email", "Push"].map((c) => <button key={c} onClick={() => setChFilter(c)} className={`chip cursor-pointer !py-2 !px-3.5 ${chFilter === c ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>{c}</button>)}
            <span className="ml-auto text-[12.5px] font-bold text-ink-400 self-center">{db.commLogs.length} messages this term</span>
          </div>
          {db.commLogs.filter((l) => chFilter === "all" || l.channel === chFilter).length === 0 ? <Empty icon="comm" title="No messages in this channel yet" /> : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Channel</th><th>To</th><th>Message</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {db.commLogs.filter((l) => chFilter === "all" || l.channel === chFilter).map((l) => (
                    <tr key={l.id}>
                      <td><Chip tone={l.channel === "WhatsApp" ? "green" : l.channel === "SMS" ? "gold" : l.channel === "Email" ? "blue" : "navy"}><Ic n={l.channel === "WhatsApp" ? "whatsapp" : l.channel === "SMS" ? "sms" : l.channel === "Email" ? "mail" : "bell"} size={12} />{l.channel}</Chip></td>
                      <td className="font-semibold text-[12.5px] whitespace-nowrap">{l.to}</td>
                      <td className="text-[12.5px] text-ink-500 dark:text-ink-300 max-w-[340px] truncate">{l.body}</td>
                      <td className="text-[12px] text-ink-400 whitespace-nowrap">{fmtDate(l.date)}</td>
                      <td><Chip tone={l.status === "delivered" ? "green" : l.status === "sent" ? "blue" : "red"}>{l.status}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnnouncementsPage() {
  const s = useApp();
  return (
    <div>
      <PageHead title="Announcements" sub="Everything published to students, parents and staff." />
      <div className="grid md:grid-cols-2 gap-4">
        {s.db.announcements.map((a) => (
          <div key={a.id} className="panel p-5">
            <div className="flex items-start justify-between"><h3 className="font-display font-bold text-[16px]">{a.pinned && <Ic n="star" size={14} className="inline text-gold-500 mr-1.5" />}{a.title}</h3><Chip tone="blue">{a.audience}</Chip></div>
            <p className="text-[13.5px] text-ink-500 dark:text-ink-300 mt-2 leading-relaxed">{a.body}</p>
            <p className="text-[12px] font-semibold text-ink-400 mt-3">{fmtDate(a.date)} · by {a.by}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
