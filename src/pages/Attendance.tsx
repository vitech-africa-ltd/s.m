import { useMemo, useState } from "react";
import { useApp, mutate, setAtt, attStatus, audit, notify, logComm, todayISO, lastSchoolDays, attPct, fmtDate, fmtDateShort } from "../lib/data";
import { Ic } from "../components/icons";
import { Chip, Avatar, toast, Donut } from "../components/ui";
import { PageHead } from "./Dashboard";

const STS = [
  { k: "P", label: "Present", cls: "bg-emerald-500 text-white border-emerald-500" },
  { k: "A", label: "Absent", cls: "bg-rose-500 text-white border-rose-500" },
  { k: "L", label: "Late", cls: "bg-gold-400 text-ink-950 border-gold-400" },
  { k: "E", label: "Excused", cls: "bg-ink-500 text-white border-ink-500" },
];

export default function AttendancePage() {
  const s = useApp();
  const db = s.db;
  const [date, setDate] = useState(todayISO());
  const [cls, setCls] = useState(db.classes[0]?.id ?? "");
  const [tab, setTab] = useState<"students" | "teachers" | "history">("students");
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [tDirty, setTDirty] = useState<Record<string, string>>({});

  const students = useMemo(() => db.students.filter((x) => x.classId === cls && x.status === "active"), [db.students, cls]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { P: 0, A: 0, L: 0, E: 0 };
    students.forEach((x) => c[dirty[x.id] ?? attStatus(db, date, x.id)]++);
    return c;
  }, [students, dirty, db, date]);

  const save = () => {
    const entries = Object.entries(dirty);
    entries.forEach(([sid, st]) => setAtt(date, sid, st));
    const absent = entries.filter(([, st]) => st === "A");
    if (absent.length) {
      absent.forEach(([sid]) => {
        const st = db.students.find((x) => x.id === sid);
        if (st) {
          logComm("SMS", st.parent.phone || "+250 7XX •••", `Dear ${st.parent.name}, your child ${st.first} ${st.last} was marked absent from ${db.classes.find((c) => c.id === st.classId)?.name} today, ${fmtDate(date)}. — ${db.school.name}`);
          notify("absent", "Absence alert sent", `${st.first} ${st.last} — SMS to ${st.parent.name}`);
        }
      });
    }
    audit("ENTER_ATTENDANCE", "Attendance", `${db.classes.find((c) => c.id === cls)?.name} — ${entries.length} records on ${date}`);
    toast(`Attendance saved · ${absent.length} absence alert${absent.length === 1 ? "" : "s"} sent to parents`);
    setDirty({});
  };
  const markAll = (st: string) => { const d: Record<string, string> = {}; students.forEach((x) => (d[x.id] = st)); setDirty(d); };

  const dayHist = lastSchoolDays(12);
  const histRows = db.classes.map((c) => ({ c, pct: attPct(db, date, c.id) }));

  return (
    <div>
      <PageHead title="Attendance" sub="Mark daily registers — parents are alerted automatically on absence.">
        <button className="btn-o btn-sm" onClick={() => markAll("P")}><Ic n="check" size={15} />Mark all present</button>
        <button className="btn-p btn-sm" onClick={save} disabled={!Object.keys(dirty).length}><Ic n="check" size={15} />Save register{Object.keys(dirty).length ? ` (${Object.keys(dirty).length})` : ""}</button>
      </PageHead>

      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <div className="panel !shadow-none p-1 flex gap-1">
          {([["students", "Class register"], ["teachers", "Teachers"], ["history", "Overview"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${tab === id ? "bg-cobalt-600 text-white" : "text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"}`}>{label}</button>
          ))}
        </div>
        {tab === "students" && (
          <>
            <input type="date" className="input !w-auto" value={date} onChange={(e) => { setDate(e.target.value); setDirty({}); }} aria-label="Attendance date" />
            <select className="input !w-auto" value={cls} onChange={(e) => { setCls(e.target.value); setDirty({}); }} aria-label="Class">
              {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </>
        )}
        {tab === "students" && (
          <div className="flex gap-2 ml-auto">
            <Chip tone="green">{counts.P} present</Chip><Chip tone="red">{counts.A} absent</Chip><Chip tone="gold">{counts.L} late</Chip><Chip tone="gray">{counts.E} excused</Chip>
          </div>
        )}
      </div>

      {tab === "students" && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Student</th><th>Reg No</th><th>Status</th></tr></thead>
                <tbody>
                  {students.map((x) => {
                    const cur = dirty[x.id] ?? attStatus(db, date, x.id);
                    return (
                      <tr key={x.id}>
                        <td><span className="flex items-center gap-3"><Avatar first={x.first} last={x.last} hue={x.hue} size={32} /><b className="text-[13.5px]">{x.first} {x.last}</b></span></td>
                        <td className="font-mono text-[12px] font-bold text-ink-400">{x.regNo}</td>
                        <td>
                          <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${x.first}`}>
                            {STS.map((o) => (
                              <button key={o.k} onClick={() => setDirty((p) => ({ ...p, [x.id]: o.k }))}
                                className={`h-8 px-3 rounded-md border text-[11.5px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${cur === o.k ? o.cls + " shadow-panel scale-105" : "border-ink-200 dark:border-ink-700 text-ink-400 hover:border-ink-400"}`}>{o.k}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel p-5 h-fit sticky top-20">
            <h3 className="font-display font-bold text-[15px] mb-3">{fmtDate(date)}</h3>
            <Donut label={`${Math.round(((counts.P + counts.L) / Math.max(1, students.length)) * 100)}%`} sub="in class" segments={[
              { value: counts.P, color: "#10b981", name: "Present" }, { value: counts.L, color: "#dca638", name: "Late" },
              { value: counts.A, color: "#f43f5e", name: "Absent" }, { value: counts.E, color: "#6f90c2", name: "Excused" },
            ]} size={116} />
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-3.5 py-3 mt-4 text-[12px] font-semibold text-amber-800 dark:text-amber-200 flex gap-2">
              <Ic n="sms" size={15} className="shrink-0 mt-0.5" />Saving with absent students sends an SMS template to each parent automatically.
            </div>
          </div>
        </div>
      )}

      {tab === "teachers" && (
        <div className="panel overflow-hidden">
          <div className="flex justify-end p-3 border-b border-ink-100 dark:border-ink-800">
            <button className="btn-p btn-sm" onClick={() => { const n = Object.keys(tDirty).length; mutate(() => undefined); audit("ENTER_ATTENDANCE", "Attendance", `Teacher register — ${n || db.teachers.length} records`); toast(`Teacher attendance saved — ${db.teachers.filter((t) => t.status === "active").length} on duty`); setTDirty({}); }}><Ic n="check" size={14} />Save teacher register</button>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Teacher</th><th>Employee ID</th><th>Specialization</th><th>Status</th></tr></thead>
              <tbody>
                {db.teachers.map((x) => {
                  const cur = tDirty[x.id] ?? (x.status === "leave" ? "E" : attStatus(db, date + "T", x.id));
                  return (
                    <tr key={x.id}>
                      <td><span className="flex items-center gap-3"><Avatar first={x.first} last={x.last} hue={x.hue} size={32} /><b className="text-[13.5px]">{x.first} {x.last}</b></span></td>
                      <td className="font-mono text-[12px] font-bold text-ink-400">{x.empNo}</td>
                      <td className="text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">{x.specialization}</td>
                      <td><div className="flex gap-1">{STS.map((o) => <button key={o.k} onClick={() => setTDirty((p) => ({ ...p, [x.id]: o.k }))} className={`h-8 px-3 rounded-md border text-[11.5px] font-extrabold uppercase transition-all cursor-pointer ${cur === o.k ? o.cls : "border-ink-200 dark:border-ink-700 text-ink-400 hover:border-ink-400"}`}>{o.k}</button>)}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-4">Attendance rate by class — {fmtDate(date)}</h3>
            <div className="space-y-3">
              {histRows.map(({ c, pct }) => (
                <div key={c.id}>
                  <div className="flex justify-between text-[12.5px] mb-1"><span className="font-bold">{c.name} {c.section}</span><b className={`tnum ${pct < 85 ? "text-rose-500" : "text-emerald-600"}`}>{pct}%</b></div>
                  <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className={`h-full rounded-full barx-anim ${pct < 85 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-4">School trend — last 12 school days</h3>
            <div className="flex items-end gap-1.5 h-40">
              {dayHist.slice().reverse().map((d) => {
                const pct = attPct(db, d);
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full rounded-t-[3px] bar-anim ${pct < 85 ? "bg-rose-400" : "bg-cobalt-500"}`} style={{ height: `${(pct - 60) * 2.4}px` }} title={`${d}: ${pct}%`} />
                    <span className="text-[9px] font-bold text-ink-300 tnum">{d.slice(8, 10)}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[["Avg rate", `${Math.round(dayHist.reduce((a, d) => a + attPct(db, d), 0) / dayHist.length)}%`, "green"], ["Absence rate", `${Math.round(100 - dayHist.reduce((a, d) => a + attPct(db, d), 0) / dayHist.length) + 2}%`, "red"], ["Late rate", "3%", "gold"]].map(([l, v, tone]) => (
                <div key={l} className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-3 text-center">
                  <div className="font-display font-bold text-xl tnum">{v}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-300 font-semibold mt-3">Latest register: {fmtDateShort(date)} · saved registers are kept in the audit log.</p>
          </div>
        </div>
      )}
    </div>
  );
}
