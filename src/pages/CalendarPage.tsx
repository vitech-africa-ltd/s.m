import { useMemo, useState } from "react";
import { useApp, mutate, audit, uid, fmtDate, todayISO, type SchoolEvent } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Field, Chip, toast } from "../components/ui";
import { PageHead } from "./Dashboard";

const KINDS = [
  { id: "exam", label: "Exams", cls: "bg-rose-500" },
  { id: "holiday", label: "Holidays", cls: "bg-emerald-500" },
  { id: "meeting", label: "Meetings", cls: "bg-cobalt-500" },
  { id: "sports", label: "Sports", cls: "bg-gold-400" },
  { id: "event", label: "School events", cls: "bg-amber-500" },
  { id: "graduation", label: "Graduation", cls: "bg-ink-900 dark:bg-ink-100" },
];

export default function CalendarPage() {
  const s = useApp();
  const db = s.db;
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [filter, setFilter] = useState<string[]>([]);
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ title: "", date: todayISO(), kind: "event", note: "" });

  const cells = useMemo(() => {
    const first = new Date(ym.y, ym.m, 1);
    const startDow = (first.getDay() + 6) % 7;
    const daysIn = new Date(ym.y, ym.m + 1, 0).getDate();
    const out: (null | { day: number; iso: string })[] = Array.from({ length: startDow }, () => null);
    for (let d = 1; d <= daysIn; d++) out.push({ day: d, iso: `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
    return out;
  }, [ym]);
  const monthName = new Date(ym.y, ym.m).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const eventsFor = (iso: string) => db.events.filter((e) => e.date === iso && (filter.length === 0 || filter.includes(e.kind)));
  const todayIso = todayISO();
  const upcoming = db.events.filter((e) => e.date >= todayIso && (filter.length === 0 || filter.includes(e.kind))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  const addEvent = () => {
    if (!f.title) { toast("Event title is required", "err"); return; }
    mutate((db) => db.events.push({ id: uid(), ...f, kind: f.kind as SchoolEvent["kind"] }));
    audit("CREATE_EVENT", "Calendar", `“${f.title}” on ${f.date}`);
    toast("Event added to calendar"); setForm(false); setF({ title: "", date: todayISO(), kind: "event", note: "" });
  };

  return (
    <div>
      <PageHead title="School calendar" sub="Exams, holidays, meetings, sports and ceremonies.">
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Add event</button>
      </PageHead>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {KINDS.map((k) => (
          <button key={k.id} onClick={() => setFilter((p) => (p.includes(k.id) ? p.filter((x) => x !== k.id) : [...p, k.id]))}
            className={`chip cursor-pointer !py-2 !px-3.5 transition-all ${filter.length === 0 || filter.includes(k.id) ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900" : "bg-ink-100 dark:bg-ink-800 text-ink-400 line-through opacity-60"}`}>
            <i className={`w-2 h-2 rounded-full ${k.cls}`} />{k.label}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800">
            <h3 className="font-display font-bold text-[18px]">{monthName}</h3>
            <div className="flex gap-1">
              <button className="btn-g btn-sm !px-2.5" onClick={() => setYm((p) => ({ y: p.m === 0 ? p.y - 1 : p.y, m: p.m === 0 ? 11 : p.m - 1 }))} aria-label="Previous month"><Ic n="chevL" size={15} /></button>
              <button className="btn-o btn-sm" onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>Today</button>
              <button className="btn-g btn-sm !px-2.5" onClick={() => setYm((p) => ({ y: p.m === 11 ? p.y + 1 : p.y, m: p.m === 11 ? 0 : p.m + 1 }))} aria-label="Next month"><Ic n="chevR" size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-950/40">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="px-2 py-2.5 text-center text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-ink-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => (
              <div key={i} className={`min-h-[86px] border-b border-r border-ink-100/70 dark:border-ink-800/70 p-1.5 ${!c ? "bg-ink-50/40 dark:bg-ink-950/30" : ""} ${c?.iso === todayIso ? "bg-cobalt-500/[0.07]" : ""}`}>
                {c && (
                  <>
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-[12px] font-bold ${c.iso === todayIso ? "bg-cobalt-600 text-white" : "text-ink-400"}`}>{c.day}</span>
                    <div className="space-y-1 mt-0.5">
                      {eventsFor(c.iso).map((e) => {
                        const k = KINDS.find((x) => x.id === e.kind)!;
                        return <div key={e.id} title={`${e.title}${e.note ? " — " + e.note : ""}`} className={`text-[10px] font-bold text-white truncate rounded px-1.5 py-0.5 ${k.cls} cursor-default hover:opacity-85 transition-opacity`}>{e.title}</div>;
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5 h-fit">
          <h3 className="font-display font-bold text-[15px] mb-3">Upcoming</h3>
          <div className="space-y-2.5">
            {upcoming.length === 0 && <p className="text-[12.5px] text-ink-300 font-semibold">Nothing scheduled.</p>}
            {upcoming.map((e) => {
              const k = KINDS.find((x) => x.id === e.kind)!;
              return (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${k.cls}`} />
                  <div className="min-w-0"><b className="block text-[13px] truncate">{e.title}</b><span className="text-[11.5px] text-ink-400">{fmtDate(e.date)}{e.note ? ` · ${e.note}` : ""}</span></div>
                  <button className="btn-g btn-sm !px-1.5 ml-auto !text-rose-500" aria-label={`Delete ${e.title}`} onClick={() => { mutate((db) => { db.events = db.events.filter((x) => x.id !== e.id); }); toast("Event removed", "info"); }}><Ic n="trash" size={13} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Add calendar event" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={addEvent}><Ic n="check" size={15} />Add event</button></>}>
        <div className="space-y-4">
          <Field label="Title"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Parent–teacher meeting" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <Field label="Type"><select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select></Field>
          </div>
          <Field label="Note (optional)"><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Location, time…" /></Field>
        </div>
      </Modal>
    </div>
  );
}
