import { useMemo, useState } from "react";
import { useApp, mutate, audit, uid, fmtMoney, fmtDate, type Teacher } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, Empty, toast } from "../components/ui";
import { PageHead } from "./Dashboard";

function TeacherForm({ init, onClose }: { init?: Teacher; onClose: () => void }) {
  const s = useApp();
  const [f, setF] = useState<Teacher>(() => init ? { ...init, subjects: [...init.subjects], classIds: [...init.classIds] } : {
    id: "", empNo: `EMP-${200 + s.db.teachers.length}`, first: "", last: "", gender: "M", phone: "", email: "",
    qualification: "B.Ed", specialization: "", hireDate: new Date().toISOString().slice(0, 10), salary: 300000,
    bank: "Bank of Kigali", subjects: [], classIds: [], status: "active", hue: Math.floor(Math.random() * 360),
  });
  const save = () => {
    if (!f.first.trim() || !f.last.trim()) { toast("Name is required", "err"); return; }
    if (init) {
      mutate((db) => { const i = db.teachers.findIndex((x) => x.id === init.id); db.teachers[i] = f; });
      audit("UPDATE_TEACHER", "Teacher", `Updated ${f.first} ${f.last} (${f.empNo})`);
      toast("Teacher updated");
    } else {
      mutate((db) => db.teachers.unshift({ ...f, id: uid() }));
      audit("CREATE_TEACHER", "Teacher", `Hired ${f.first} ${f.last} — ${f.specialization || "General"}`);
      toast("Teacher added");
    }
    onClose();
  };
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <Modal open onClose={onClose} title={init ? `Edit ${init.first} ${init.last}` : "Add teacher"} w="max-w-2xl"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />{init ? "Save changes" : "Add teacher"}</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><input className="input" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name"><input className="input" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Gender"><select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></select></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Email"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Qualification"><input className="input" value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })} /></Field>
        <Field label="Specialization"><input className="input" value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })} /></Field>
        <Field label="Hire date"><input type="date" className="input" value={f.hireDate} onChange={(e) => setF({ ...f, hireDate: e.target.value })} /></Field>
        <Field label={`Monthly salary (${s.db.school.currency})`}><input type="number" className="input" value={f.salary} onChange={(e) => setF({ ...f, salary: +e.target.value })} /></Field>
        <Field label="Bank"><select className="input" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })}>{["Bank of Kigali", "I&M Bank", "Equity Bank", "GT Bank", "Access Bank"].map((b) => <option key={b}>{b}</option>)}</select></Field>
      </div>
      <div className="mt-4">
        <span className="label">Assigned subjects</span>
        <div className="flex flex-wrap gap-2">
          {s.db.subjects.map((sub) => (
            <button key={sub.id} onClick={() => setF({ ...f, subjects: toggle(f.subjects, sub.id) })}
              className={`chip cursor-pointer transition-colors ${f.subjects.includes(sub.id) ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 hover:bg-cobalt-100"}`}>{sub.name}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function TeachersPage() {
  const s = useApp();
  const db = s.db;
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ open: boolean; t?: Teacher }>({ open: false });
  const [del, setDel] = useState<Teacher | null>(null);
  const [view, setView] = useState<Teacher | null>(null);

  const list = useMemo(() => db.teachers.filter((x) => `${x.first} ${x.last} ${x.empNo} ${x.specialization}`.toLowerCase().includes(q.toLowerCase())), [db.teachers, q]);
  const payroll = db.teachers.reduce((a, b) => a + b.salary, 0);

  return (
    <div>
      <PageHead title="Teachers" sub={`${db.teachers.length} staff · monthly payroll ${fmtMoney(payroll, db.school.currency)}`}>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="plus" size={15} />Add teacher</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative max-w-sm">
            <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input className="input !pl-9" placeholder="Search teachers…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {list.length === 0 ? <Empty icon="teacher" title="No teachers found" /> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Teacher</th><th>Employee ID</th><th>Specialization</th><th>Subjects</th><th>Classes</th><th>Salary</th><th>Status</th><th className="!text-right">Actions</th></tr></thead>
              <tbody>
                {list.map((x) => {
                  const classes = db.classes.filter((c) => x.classIds.includes(c.id) || x.subjects.some((sid) => db.subjects.find((ss) => ss.id === sid)?.teacherIds.includes(x.id)));
                  return (
                    <tr key={x.id}>
                      <td><button className="flex items-center gap-3 cursor-pointer" onClick={() => setView(x)}><Avatar first={x.first} last={x.last} hue={x.hue} size={34} /><span className="text-left"><b className="block text-[13.5px]">{x.first} {x.last}</b><span className="block text-[11px] text-ink-400">{x.qualification}</span></span></button></td>
                      <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300">{x.empNo}</td>
                      <td className="font-semibold text-[13px]">{x.specialization || "—"}</td>
                      <td><div className="flex flex-wrap gap-1">{x.subjects.map((sid) => <Chip key={sid} tone="blue">{db.subjects.find((y) => y.id === sid)?.code ?? sid}</Chip>)}</div></td>
                      <td className="text-[12.5px] font-semibold text-ink-500 dark:text-ink-300 whitespace-nowrap">{db.classes.filter((c) => db.timetable.some((tt) => tt.classId === c.id && tt.teacherId === x.id)).slice(0, 3).map((c) => `${c.name[0]}${c.level}${c.section}`).join(", ") || "—"}</td>
                      <td className="font-bold tnum whitespace-nowrap">{fmtMoney(x.salary, db.school.currency)}</td>
                      <td><Chip tone={x.status === "active" ? "green" : "amber"}>{x.status}</Chip></td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button className="btn-g btn-sm !px-2" onClick={() => setView(x)}><Ic n="eye" size={15} /></button>
                          <button className="btn-g btn-sm !px-2" onClick={() => setForm({ open: true, t: x })}><Ic n="pencil" size={15} /></button>
                          <button className="btn-g btn-sm !px-2 !text-rose-500" onClick={() => setDel(x)}><Ic n="trash" size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {form.open && <TeacherForm init={form.t} onClose={() => setForm({ open: false })} />}
      {view && (
        <Modal open onClose={() => setView(null)} title="Teacher profile" w="max-w-xl">
          <div className="flex items-center gap-4 mb-5">
            <Avatar first={view.first} last={view.last} hue={view.hue} size={64} />
            <div>
              <h3 className="font-display text-[20px] font-bold">{view.first} {view.last}</h3>
              <p className="text-[13px] text-ink-400 font-semibold">{view.specialization} · {view.qualification}</p>
              <div className="flex gap-2 mt-1.5"><Chip tone="blue">{view.empNo}</Chip><Chip tone={view.status === "active" ? "green" : "amber"}>{view.status}</Chip></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3 text-[13px]">
            {[["Phone", view.phone || "—"], ["Email", view.email || "—"], ["Hired", fmtDate(view.hireDate)], ["Bank", view.bank], ["Monthly salary", fmtMoney(view.salary, db.school.currency)], ["Annual cost", fmtMoney(view.salary * 12, db.school.currency)]].map(([k, v]) => (
              <div key={k}><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-300">{k}</div><div className="font-semibold">{v}</div></div>
            ))}
          </div>
          <div className="mt-4">
            <span className="label">Weekly load</span>
            <div className="flex gap-2 flex-wrap">
              <Chip tone="blue">{db.timetable.filter((tt) => tt.teacherId === view.id).length} periods / week</Chip>
              <Chip tone="gold">{new Set(db.timetable.filter((tt) => tt.teacherId === view.id).map((tt) => tt.classId)).size} classes</Chip>
              <Chip tone="green">{view.subjects.length} subjects</Chip>
            </div>
          </div>
        </Modal>
      )}
      <Confirm open={!!del} onClose={() => setDel(null)} title="Remove teacher?" body={`${del?.first} ${del?.last} will be removed from the roster. Timetable slots remain for reassignment.`}
        onYes={() => { if (del) { mutate((db) => { db.teachers = db.teachers.filter((x) => x.id !== del.id); }); audit("DELETE_TEACHER", "Teacher", `Removed ${del.first} ${del.last}`); toast("Teacher removed", "info"); } }} />
    </div>
  );
}
