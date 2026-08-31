import { useMemo, useState } from "react";
import { useApp, mutate, audit, uid, findConflicts, DAYS, PERIODS, type ClassSec, type Subject } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Field, Chip, Avatar, Empty, toast, Ring } from "../components/ui";
import { PageHead } from "./Dashboard";

/* ===================== Classes ===================== */
export function ClassesPage() {
  const s = useApp();
  const db = s.db;
  const [roster, setRoster] = useState<ClassSec | null>(null);
  const [form, setForm] = useState(false);
  const [nf, setNf] = useState({ name: "Senior 1", section: "A", room: "R-101", capacity: 40, teacherId: db.teachers[0]?.id ?? "" });
  const addClass = () => {
    if (db.classes.some((c) => c.name === nf.name && c.section === nf.section)) { toast("This class section already exists", "err"); return; }
    mutate((db) => db.classes.push({ id: uid(), name: nf.name, section: nf.section, level: +nf.name.replace(/\D/g, "") || 1, room: nf.room, capacity: nf.capacity, teacherId: nf.teacherId }));
    audit("CREATE_CLASS", "Class", `Created ${nf.name} ${nf.section} (room ${nf.room})`);
    toast("Class created"); setForm(false);
  };
  return (
    <div>
      <PageHead title="Classes & Sections" sub={`${db.classes.length} sections across ${new Set(db.classes.map((c) => c.name)).size} levels`}>
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />New class</button>
      </PageHead>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {db.classes.map((c) => {
          const students = db.students.filter((x) => x.classId === c.id && x.status === "active");
          const t = db.teachers.find((x) => x.id === c.teacherId);
          const pct = Math.round((students.length / c.capacity) * 100);
          return (
            <button key={c.id} onClick={() => setRoster(c)} className="panel p-5 text-left hover:-translate-y-1 hover:shadow-lift hover:border-cobalt-300 dark:hover:border-cobalt-700 transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between">
                <span className="w-11 h-11 rounded-xl bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[15px] group-hover:scale-105 transition-transform">{c.name.slice(0, 2)}{c.level}<span className="text-[10px]">{c.section}</span></span>
                <Chip tone={pct >= 95 ? "red" : pct >= 75 ? "amber" : "green"}>{students.length}/{c.capacity}</Chip>
              </div>
              <h3 className="font-display font-bold text-[17px] mt-3">{c.name} — Section {c.section}</h3>
              <p className="text-[12px] text-ink-400 font-semibold mt-0.5 flex items-center gap-1.5"><Ic n="pin" size={12} />Room {c.room}</p>
              {t && (
                <p className="flex items-center gap-2 mt-3 text-[12.5px] font-semibold">
                  <Avatar first={t.first} last={t.last} hue={t.hue} size={24} />{t.first} {t.last}<span className="text-ink-300 font-bold text-[10.5px] uppercase tracking-wide ml-auto">Class teacher</span>
                </p>
              )}
              <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mt-3"><div className="h-full bg-cobalt-500 rounded-full barx-anim" style={{ width: `${Math.min(100, pct)}%` }} /></div>
            </button>
          );
        })}
      </div>
      {roster && (
        <Modal open onClose={() => setRoster(null)} title={`${roster.name} ${roster.section} — student roster`} w="max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip tone="blue">{db.students.filter((x) => x.classId === roster.id).length} students</Chip>
            <Chip tone="gold">Room {roster.room}</Chip>
            <Chip tone="green">Capacity {roster.capacity}</Chip>
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-ink-100 dark:border-ink-800">
            <table className="tbl">
              <thead><tr><th>#</th><th>Student</th><th>Reg No</th><th>Move to…</th></tr></thead>
              <tbody>
                {db.students.filter((x) => x.classId === roster.id).map((x, i) => (
                  <tr key={x.id}>
                    <td className="text-ink-300 font-bold text-[12px]">{i + 1}</td>
                    <td><span className="flex items-center gap-2.5"><Avatar first={x.first} last={x.last} hue={x.hue} size={28} /><b className="text-[13px]">{x.first} {x.last}</b></span></td>
                    <td className="font-mono text-[11.5px] font-bold text-cobalt-600 dark:text-cobalt-300">{x.regNo}</td>
                    <td>
                      <select className="input !h-8 !text-[12px] !w-auto" value={x.classId} aria-label={`Move ${x.first}`}
                        onChange={(e) => { mutate((db) => { const st = db.students.find((y) => y.id === x.id)!; st.classId = e.target.value; }); audit("TRANSFER_STUDENT", "Student", `${x.first} ${x.last} moved to ${db.classes.find((c) => c.id === e.target.value)?.name}`); toast("Student moved"); }}>
                        {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      <Modal open={form} onClose={() => setForm(false)} title="Create class section" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={addClass}><Ic n="check" size={15} />Create</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Level"><select className="input" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })}>{[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={`Senior ${l}`}>Senior {l}</option>)}</select></Field>
          <Field label="Section"><select className="input" value={nf.section} onChange={(e) => setNf({ ...nf, section: e.target.value })}>{["A", "B", "C"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Room"><input className="input" value={nf.room} onChange={(e) => setNf({ ...nf, room: e.target.value })} /></Field>
          <Field label="Capacity"><input type="number" className="input" value={nf.capacity} onChange={(e) => setNf({ ...nf, capacity: +e.target.value })} /></Field>
        </div>
        <div className="mt-4"><Field label="Class teacher"><select className="input" value={nf.teacherId} onChange={(e) => setNf({ ...nf, teacherId: e.target.value })}>{db.teachers.map((t) => <option key={t.id} value={t.id}>{t.first} {t.last}</option>)}</select></Field></div>
      </Modal>
    </div>
  );
}

/* ===================== Subjects ===================== */
export function SubjectsPage() {
  const s = useApp();
  const db = s.db;
  const [form, setForm] = useState<{ open: boolean; sub?: Subject }>({ open: false });
  const [f, setF] = useState({ name: "", code: "", credits: 2, levels: "4,5,6" });
  const save = () => {
    if (!f.name || !f.code) { toast("Name and code are required", "err"); return; }
    mutate((db) => db.subjects.push({ id: uid(), name: f.name, code: f.code.toUpperCase(), credits: f.credits, teacherIds: [], classLevels: f.levels.split(",").map((x) => +x.trim()).filter((x) => x >= 1 && x <= 6) }));
    audit("CREATE_SUBJECT", "Subject", `Created ${f.name} (${f.code})`);
    toast("Subject created"); setForm({ open: false }); setF({ name: "", code: "", credits: 2, levels: "4,5,6" });
  };
  return (
    <div>
      <PageHead title="Subjects" sub={`${db.subjects.length} subjects in the ${db.school.academicYear} curriculum`}>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="plus" size={15} />New subject</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Subject</th><th>Code</th><th>Credits</th><th>Levels</th><th>Lead teacher</th><th>Assign teacher</th></tr></thead>
            <tbody>
              {db.subjects.map((x) => {
                const lead = db.teachers.find((t) => x.teacherIds.includes(t.id));
                return (
                  <tr key={x.id}>
                    <td><span className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center font-display font-bold text-[11px]">{x.code.slice(0, 3)}</span><b className="text-[13.5px]">{x.name}</b></span></td>
                    <td className="font-mono text-[12px] font-bold text-ink-400">{x.code}</td>
                    <td><Chip tone="navy">{x.credits} cr</Chip></td>
                    <td><div className="flex gap-1 flex-wrap">{x.classLevels.map((l) => <span key={l} className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300">S{l}</span>)}</div></td>
                    <td>{lead ? <span className="flex items-center gap-2"><Avatar first={lead.first} last={lead.last} hue={lead.hue} size={26} /><span className="text-[13px] font-semibold">{lead.first} {lead.last}</span></span> : <Chip tone="amber">Unassigned</Chip>}</td>
                    <td>
                      <select className="input !h-8 !text-[12px] !w-auto" defaultValue="" aria-label={`Assign teacher to ${x.name}`}
                        onChange={(e) => { if (!e.target.value) return; mutate((db) => { const sub = db.subjects.find((y) => y.id === x.id)!; if (!sub.teacherIds.includes(e.target.value)) sub.teacherIds.push(e.target.value); }); const tt = db.teachers.find((t) => t.id === e.target.value); audit("ASSIGN_TEACHER", "Subject", `${tt ? tt.first + " " + tt.last : "Teacher"} → ${x.name}`); toast("Teacher assigned"); e.target.value = ""; }}>
                        <option value="" disabled>Assign…</option>
                        {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.first} {t.last}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={form.open} onClose={() => setForm({ open: false })} title="New subject" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm({ open: false })}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />Create subject</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Subject name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Literature" /></Field>
          <Field label="Code"><input className="input" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="LIT" /></Field>
          <Field label="Credits"><input type="number" className="input" value={f.credits} onChange={(e) => setF({ ...f, credits: +e.target.value })} /></Field>
          <Field label="Levels (comma separated)"><input className="input" value={f.levels} onChange={(e) => setF({ ...f, levels: e.target.value })} placeholder="1,2,3" /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ===================== Timetable ===================== */
export function TimetablePage() {
  const s = useApp();
  const db = s.db;
  const [cls, setCls] = useState(db.classes[0]?.id ?? "");
  const [mode, setMode] = useState<"class" | "teacher">("class");
  const [tch, setTch] = useState(db.teachers[0]?.id ?? "");
  const [add, setAdd] = useState<{ day: number; p: number } | null>(null);
  const [nf, setNf] = useState({ subjectId: db.subjects[0]?.id ?? "", room: "R-101" });
  const conflicts = useMemo(() => findConflicts(db), [db]);

  const cell = (day: number, p: number) => {
    const slot = db.timetable.find((tt) => (mode === "class" ? tt.classId === cls : tt.teacherId === tch) && tt.day === day && tt.start === PERIODS[p][0]);
    if (!slot) return null;
    const sub = db.subjects.find((x) => x.id === slot.subjectId);
    const conflict = conflicts.some((c) => c.teacherId === slot.teacherId && c.day === day && c.start === slot.start);
    return { slot, sub, conflict };
  };
  const saveSlot = () => {
    if (!add) return;
    mutate((db) => {
      db.timetable = db.timetable.filter((tt) => !(tt.classId === cls && tt.day === add.day && tt.start === PERIODS[add.p][0]));
      const sub = db.subjects.find((x) => x.id === nf.subjectId)!;
      db.timetable.push({ id: uid(), classId: cls, subjectId: nf.subjectId, teacherId: sub.teacherIds[0] ?? "", room: nf.room, day: add.day, start: PERIODS[add.p][0], end: PERIODS[add.p][1] });
    });
    audit("UPDATE_TIMETABLE", "Timetable", `Slot updated — ${DAYS[add.day]} ${PERIODS[add.p][0]}`);
    toast("Timetable updated"); setAdd(null);
  };
  const shown = mode === "class" ? db.classes.find((c) => c.id === cls) : null;

  return (
    <div>
      <PageHead title="Timetable" sub="Class, teacher and room schedules — conflicts detected automatically.">
        <button className="btn-o btn-sm" onClick={() => window.print()}><Ic n="printer" size={15} />Print</button>
      </PageHead>
      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="panel !shadow-none p-1 flex gap-1">
          {(["class", "teacher"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-4 h-9 rounded-lg text-[13px] font-bold capitalize transition-colors cursor-pointer ${mode === m ? "bg-cobalt-600 text-white" : "text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"}`}>{m} view</button>
          ))}
        </div>
        {mode === "class" ? (
          <select className="input !w-auto" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Select class">
            {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
        ) : (
          <select className="input !w-auto" value={tch} onChange={(e) => setTch(e.target.value)} aria-label="Select teacher">
            {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.first} {t.last}</option>)}
          </select>
        )}
        {conflicts.length > 0 ? <Chip tone="red" className="!py-2"><Ic n="alert" size={13} />{conflicts.length} teacher conflicts detected</Chip> : <Chip tone="green" className="!py-2"><Ic n="check" size={13} />No conflicts</Chip>}
      </div>
      <div className="panel overflow-x-auto">
        <table className="tbl !text-[12.5px]">
          <thead><tr><th className="!w-20">Time</th>{DAYS.map((d) => <th key={d} className="!text-center">{d}</th>)}</tr></thead>
          <tbody>
            {PERIODS.map((per, p) => (
              <tr key={p}>
                <td className="font-mono font-bold text-[11px] text-ink-400 whitespace-nowrap">{per[0]}<br />{per[1]}</td>
                {DAYS.map((_, day) => {
                  const c = cell(day, p);
                  return (
                    <td key={day} className="!p-1.5 min-w-[120px]">
                      {c ? (
                        <div className={`rounded-lg px-2.5 py-2 border text-[11.5px] leading-tight ${c.conflict ? "bg-rose-50 border-rose-300 dark:bg-rose-500/10 dark:border-rose-700" : "bg-cobalt-50 border-cobalt-100 dark:bg-cobalt-500/10 dark:border-cobalt-900"}`}>
                          <b className="block text-[12px]">{c.sub?.name}</b>
                          <span className="text-ink-400 font-semibold">{mode === "class" ? `${db.teachers.find((t) => t.id === c.slot.teacherId)?.last ?? "—"}` : `${db.classes.find((x) => x.id === c.slot.classId)?.name} ${db.classes.find((x) => x.id === c.slot.classId)?.section}`}</span>
                          <span className="block text-[10px] text-ink-300 font-bold">{c.slot.room}{c.conflict && <span className="text-rose-500"> · CONFLICT</span>}</span>
                        </div>
                      ) : (
                        <button onClick={() => { if (mode === "class") setAdd({ day, p }); }} className={`w-full h-full min-h-[46px] rounded-lg border border-dashed border-ink-200 dark:border-ink-700 text-ink-200 transition-colors ${mode === "class" ? "hover:border-cobalt-400 hover:text-cobalt-500 cursor-pointer" : "cursor-default"}`}>+</button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown && <p className="text-[12px] text-ink-400 font-semibold mt-3">Click an empty cell to assign a subject. Printing produces an A4 sheet for the notice board.</p>}
      {conflicts.length > 0 && (
        <div className="panel mt-4 p-4 !border-amber-300 dark:!border-amber-700">
          <h4 className="font-display font-bold text-[14px] flex items-center gap-2"><Ic n="alert" size={16} className="text-amber-500" />Teacher schedule conflicts</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
            {conflicts.map((c, i) => (
              <div key={i} className="rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2.5 text-[12.5px]">
                <b>{db.teachers.find((t) => t.id === c.teacherId)?.first} {db.teachers.find((t) => t.id === c.teacherId)?.last}</b>
                <span className="block text-ink-400">{DAYS[c.day]} {c.start} — {c.classes.map((cid) => { const k = db.classes.find((x) => x.id === cid); return `${k?.name[0]}${k?.level}${k?.section}`; }).join(" vs ")}</span>
              </div>
            ))}
          </div>
          <button className="btn-o btn-sm mt-3" onClick={() => { toast("Conflict report exported to Documents", "info"); audit("EXPORT_TIMETABLE", "Timetable", "Conflict report exported"); }}><Ic n="download" size={14} />Export conflict report</button>
        </div>
      )}
      <Modal open={!!add} onClose={() => setAdd(null)} title={`Assign period — ${add ? DAYS[add.day] : ""} ${add ? PERIODS[add.p][0] : ""}`} w="max-w-sm"
        footer={<><button className="btn-o" onClick={() => setAdd(null)}>Cancel</button><button className="btn-p" onClick={saveSlot}><Ic n="check" size={15} />Assign</button></>}>
        <div className="space-y-4">
          <Field label="Subject">
            <select className="input" value={nf.subjectId} onChange={(e) => setNf({ ...nf, subjectId: e.target.value })}>
              {db.subjects.map((x) => <option key={x.id} value={x.id}>{x.name} — {db.teachers.find((t) => x.teacherIds.includes(t.id))?.last ?? "no teacher"}</option>)}
            </select>
          </Field>
          <Field label="Room"><input className="input" value={nf.room} onChange={(e) => setNf({ ...nf, room: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}

