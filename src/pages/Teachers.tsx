import { useMemo, useState } from "react";
import { useApp, mutate, audit, uid, todayISO, fmtDate, fmtMoney, attStatus, type Teacher } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, toast } from "../components/ui";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

export default function TeachersPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ open: boolean; t?: Teacher | null }>({ open: false });
  const [del, setDel] = useState<Teacher | null>(null);
  const [view, setView] = useState<Teacher | null>(null);

  const list = useMemo(() => db.teachers.filter((t) => `${t.first} ${t.last} ${t.specialization} ${t.empNo}`.toLowerCase().includes(q.toLowerCase())), [db.teachers, q]);
  const today = todayISO();

  return (
    <div>
      <PageHead title="Teachers & staff" sub={`${db.teachers.length} teachers · payroll ${fmtMoney(db.teachers.reduce((a, b) => a + b.salary, 0), cur)}/month`}>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="plus" size={15} />New teacher</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative max-w-sm"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder={`${tt("Search")}…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>{tt("Teachers")}</th><th>Employee ID</th><th>Specialization</th><th className="hidden md:table-cell">Classes</th><th className="hidden lg:table-cell">Salary</th><th>Today</th><th className="!text-right">{tt("Actions")}</th></tr></thead>
            <tbody>
              {list.map((t) => {
                const st = t.status === "leave" ? "E" : attStatus(db, today + "T", t.id);
                return (
                  <tr key={t.id} className="cursor-pointer" onClick={() => setView(t)}>
                    <td><span className="flex items-center gap-3"><Avatar first={t.first} last={t.last} hue={t.hue} size={34} /><span><b className="block text-[13.5px]">{t.first} {t.last}</b><span className="block text-[11px] text-ink-400">{t.qualification} · {t.phone}</span></span></span></td>
                    <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{t.empNo}</td>
                    <td><Chip tone="blue">{t.specialization}</Chip></td>
                    <td className="hidden md:table-cell text-[12.5px] text-ink-400 whitespace-nowrap">{db.classes.filter((c) => t.classIds.includes(c.id)).map((c) => `${c.name[0]}${c.level}${c.section}`).join(", ") || "—"}</td>
                    <td className="hidden lg:table-cell font-bold tnum whitespace-nowrap">{fmtMoney(t.salary, cur)}</td>
                    <td><Chip tone={st === "P" ? "green" : st === "L" ? "gold" : st === "E" ? "gray" : "red"}>{st === "P" ? tt("Present") : st === "L" ? tt("Late") : st === "E" ? tt("Excused") : tt("Absent")}</Chip></td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-g btn-sm !px-2" title={tt("Edit")} onClick={() => setForm({ open: true, t })}><Ic n="pencil" size={14} /></button>
                      <button className="btn-g btn-sm !px-2 !text-rose-500" title={tt("Delete")} onClick={() => setDel(t)}><Ic n="trash" size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherForm open={form.open} onClose={() => setForm({ open: false })} t={form.t} />
      <Confirm open={!!del} onClose={() => setDel(null)} title={`${tt("Delete")} ${del?.first} ${del?.last}?`} body="This removes the teacher profile and unassigns their classes and subjects."
        onYes={() => { if (del) { mutate((db) => { db.teachers = db.teachers.filter((x) => x.id !== del.id); }); audit("DELETE_TEACHER", "Teacher", `Deleted ${del.first} ${del.last}`); toast("Teacher removed", "info"); } }} />
      {view && <TeacherDrawer t={view} onClose={() => setView(null)} />}
    </div>
  );
}

function TeacherForm({ open, onClose, t }: { open: boolean; onClose: () => void; t?: Teacher | null }) {
  const s = useApp();
  const db = s.db;
  const [f, setF] = useState(() => t ? { ...t } : { first: "", last: "", gender: "M" as "M" | "F", phone: "", email: "", qualification: "B.Ed", specialization: db.subjects[0]?.name ?? "Mathematics", salary: 250000, bank: "" });
  const save = () => {
    if (!f.first.trim() || !f.last.trim()) { toast("Name is required", "err"); return; }
    if (t) {
      mutate((db) => { const i = db.teachers.findIndex((x) => x.id === t.id); if (i >= 0) db.teachers[i] = { ...db.teachers[i], ...f }; });
      audit("UPDATE_TEACHER", "Teacher", `Updated ${f.first} ${f.last}`);
      toast("Teacher updated");
    } else {
      mutate((db) => db.teachers.unshift({ id: uid(), empNo: `EMP-${100 + db.teachers.length}`, ...f, hireDate: todayISO(), subjects: [f.specialization], classIds: [], status: "active", hue: Math.floor(Math.random() * 360) }));
      audit("CREATE_TEACHER", "Teacher", `Hired ${f.first} ${f.last} (${f.specialization})`);
      toast("Teacher hired");
    }
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={t ? `${t.first} ${t.last}` : "New teacher"} w="max-w-xl"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />Save</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><input className="input" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name"><input className="input" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Email"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Qualification"><select className="input" value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })}>{["B.Ed", "M.Sc", "B.Sc", "M.Ed", "PGDE"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Specialization"><select className="input" value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })}>{db.subjects.map((x) => <option key={x.id}>{x.name}</option>)}</select></Field>
        <Field label="Salary"><input type="number" className="input tnum" value={f.salary} onChange={(e) => setF({ ...f, salary: +e.target.value })} /></Field>
        <Field label="Bank account"><input className="input" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function TeacherDrawer({ t, onClose }: { t: Teacher; onClose: () => void }) {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const myClasses = db.classes.filter((c) => t.classIds.includes(c.id) || c.teacherId === t.id);
  const mySlots = db.timetable.filter((tt) => tt.teacherId === t.id);
  return (
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 bg-ink-950/45 fade-in" onClick={onClose} />
      <aside className="absolute right-0 inset-y-0 w-full sm:w-[420px] bg-white dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 shadow-pop pop-in overflow-y-auto">
        <div className="sticky top-0 bg-ink-950 text-ink-100 px-6 py-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar first={t.first} last={t.last} hue={t.hue} size={52} />
              <div>
                <h2 className="font-display text-[19px] font-bold leading-tight">{t.first} {t.last}</h2>
                <p className="text-[12px] text-ink-300 font-semibold">{t.empNo} · {t.qualification}</p>
                <Chip tone={t.status === "active" ? "green" : "amber"} className="mt-1.5">{t.status}</Chip>
              </div>
            </div>
            <button className="btn-g !text-ink-300 hover:!bg-white/10" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
            {[["Phone", t.phone || "—"], ["Email", t.email || "—"], ["Specialization", t.specialization], ["Hired", fmtDate(t.hireDate)], ["Salary", fmtMoney(t.salary, cur)], ["Bank", t.bank || "—"]].map(([k, v]) => (
              <div key={k}><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-300">{k}</div><div className="font-semibold truncate">{v}</div></div>
            ))}
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Assigned classes</h4>
            <div className="flex gap-2 flex-wrap">
              {myClasses.length === 0 && <p className="text-[12.5px] text-ink-400">No classes assigned yet.</p>}
              {myClasses.map((c) => <Chip key={c.id} tone="blue">{c.name} {c.section}</Chip>)}
            </div>
            <select className="input mt-3" defaultValue="" onChange={(e) => { if (!e.target.value) return; mutate((db) => { const x = db.teachers.find((y) => y.id === t.id)!; if (!x.classIds.includes(e.target.value)) x.classIds.push(e.target.value); }); audit("ASSIGN_CLASS", "Teacher", `${t.first} → ${db.classes.find((c) => c.id === e.target.value)?.name}`); toast("Class assigned"); e.target.value = ""; }}>
              <option value="" disabled>Assign a class…</option>
              {db.classes.filter((c) => !t.classIds.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Timetable ({mySlots.length} periods)</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {mySlots.slice(0, 12).map((sl) => {
                const c = db.classes.find((x) => x.id === sl.classId);
                const sub = db.subjects.find((x) => x.id === sl.subjectId);
                return (
                  <div key={sl.id} className="flex items-center justify-between text-[12.5px] rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2">
                    <b>{sub?.name}</b>
                    <span className="text-ink-400">{c?.name} {c?.section}</span>
                    <span className="font-mono text-[11px] text-ink-400">{["Mon", "Tue", "Wed", "Thu", "Fri"][sl.day]} {sl.start}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
