import { useEffect, useMemo, useState } from "react";
import { useApp, mutate, audit, uid, todayISO, fmtDate, fmtMoney, attStatus, DAYS, PERIODS, type DB, type Teacher } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, toast, printNow, PhotoPicker } from "../components/ui";
import { QR, personPhoto } from "../lib/media";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

function TeacherIDCard({ t, db }: { t: Teacher; db: DB }) {
  return (
    <div className="print-card mx-auto" style={{ width: "86mm" }}>
      <div className="rounded-xl overflow-hidden border border-ink-200 bg-white text-ink-900 shadow-lift" style={{ width: "86mm" }}>
        <div className="bg-ink-950 text-white px-4 py-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-sm">{(db.school.logoText || "V")[0]}</span>
          <div><div className="font-display font-bold text-[11px] leading-3">{db.school.name}</div><div className="text-[7px] tracking-[0.18em] uppercase text-gold-300">Staff ID card</div></div>
        </div>
        <div className="flex gap-3 p-3.5 items-center">
          <Avatar first={t.first} last={t.last} hue={t.hue} size={62} photo={personPhoto(t)} />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] leading-tight">{t.first} {t.last}</div>
            <div className="text-[9.5px] font-bold text-cobalt-700">{t.empNo} · Teacher</div>
            <div className="text-[9px] text-ink-500 mt-1">{t.specialization}</div>
            <div className="text-[8.5px] text-ink-400">Valid until: 07 / 2026</div>
          </div>
          <QR value={`VITECH|${t.empNo}|${db.school.website}`} size={56} />
        </div>
        <div className="h-2 bg-cobalt-600" />
      </div>
    </div>
  );
}

function TeacherForm({ open, onClose, t, db }: { open: boolean; onClose: () => void; t?: Teacher | null; db: DB }) {
  const tt = useT();
  const blank = { first: "", last: "", gender: "M" as "M" | "F", phone: "", email: "", qualification: "B.Ed", specialization: db.subjects[0]?.name ?? "Mathematics", hireDate: todayISO(), salary: 250000, bank: "", subjects: [] as string[], classIds: [] as string[], status: "active" as Teacher["status"], photo: "" };
  const [f, setF] = useState(() => t ? { ...t } : blank);
  useEffect(() => { if (open) setF(t ? { ...t } : blank); /* eslint-disable-line */ }, [open, t]);
  const save = () => {
    if (!f.first.trim() || !f.last.trim()) { toast("First and last name are required", "err"); return; }
    if (t) {
      mutate((d) => { const i = d.teachers.findIndex((x) => x.id === t.id); if (i >= 0) d.teachers[i] = { ...f, id: t.id, hue: t.hue, empNo: t.empNo, photo: f.photo || undefined }; });
      audit("UPDATE_TEACHER", "Teacher", `Updated ${f.first} ${f.last}`);
      toast("Teacher updated");
    } else {
      mutate((d) => d.teachers.unshift({ ...f, id: uid(), empNo: `EMP-${100 + d.teachers.length}`, hue: Math.floor(Math.random() * 360), photo: f.photo || undefined }));
      audit("CREATE_TEACHER", "Teacher", `Hired ${f.first} ${f.last} (${f.specialization})`);
      toast("Teacher added");
    }
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={t ? `${tt("Edit")} — ${t.first} ${t.last}` : "New teacher"} w="max-w-2xl"
      footer={<><button className="btn-o" onClick={onClose}>{tt("Cancel")}</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />{tt("Save")}</button></>}>
      <div className="mb-4"><PhotoPicker value={f.photo} onChange={(v) => setF((p) => ({ ...p, photo: v }))} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><input className="input" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name"><input className="input" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Gender"><select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></select></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Email"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Qualification"><select className="input" value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })}>{["B.Ed", "M.Sc", "B.Sc", "PGDE", "PhD"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Specialization"><select className="input" value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })}>{db.subjects.map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}</select></Field>
        <Field label="Hire date"><input type="date" className="input" value={f.hireDate} onChange={(e) => setF({ ...f, hireDate: e.target.value })} /></Field>
        <Field label={`Salary (${db.school.currency})`}><input type="number" className="input tnum" value={f.salary} onChange={(e) => setF({ ...f, salary: +e.target.value })} /></Field>
        <Field label="Bank account"><input className="input" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></Field>
        <Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Teacher["status"] })}><option value="active">Active</option><option value="leave">On leave</option></select></Field>
      </div>
    </Modal>
  );
}

export default function TeachersPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ open: boolean; t?: Teacher | null }>({ open: false });
  const [view, setView] = useState<Teacher | null>(null);
  const [card, setCard] = useState<Teacher | null>(null);
  const [del, setDel] = useState<Teacher | null>(null);

  const filtered = useMemo(() => db.teachers.filter((x) => `${x.first} ${x.last} ${x.empNo} ${x.specialization}`.toLowerCase().includes(q.trim().toLowerCase())), [db.teachers, q]);
  const slotsOf = (t: Teacher) => db.timetable.filter((x) => x.teacherId === t.id);

  return (
    <div>
      <PageHead title="Teachers & staff" sub={`${db.teachers.length} teachers · payroll ${fmtMoney(db.teachers.reduce((a, b) => a + b.salary, 0), cur)}/month`}>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="plus" size={15} />New teacher</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative max-w-sm">
            <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input className="input !pl-9" placeholder={`${tt("Search")}…`} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>{tt("Teachers")}</th><th>ID</th><th className="hidden sm:table-cell">Specialization</th><th className="hidden md:table-cell">Salary</th><th>{tt("Status")}</th><th className="!text-right">{tt("Actions")}</th></tr></thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id} className="cursor-pointer" onClick={() => setView(x)}>
                  <td><span className="flex items-center gap-3"><Avatar first={x.first} last={x.last} hue={x.hue} size={34} photo={personPhoto(x)} /><span className="min-w-0"><b className="block text-[13.5px] truncate">{x.first} {x.last}</b><span className="block text-[11px] text-ink-400">{x.qualification} · {slotsOf(x).length} periods/wk</span></span></span></td>
                  <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{x.empNo}</td>
                  <td className="hidden sm:table-cell text-[13px] font-semibold">{x.specialization}</td>
                  <td className="hidden md:table-cell font-bold tnum whitespace-nowrap">{fmtMoney(x.salary, cur)}</td>
                  <td><Chip tone={x.status === "active" ? "green" : "amber"}>{x.status}</Chip></td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-g btn-sm !px-2" title="ID card" onClick={() => setCard(x)}><Ic n="idcard" size={15} /></button>
                    <button className="btn-g btn-sm !px-2" title={tt("Edit")} onClick={() => setForm({ open: true, t: x })}><Ic n="pencil" size={14} /></button>
                    <button className="btn-g btn-sm !px-2 !text-rose-500" title={tt("Delete")} onClick={() => setDel(x)}><Ic n="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 z-[75]">
          <div className="absolute inset-0 bg-ink-950/45 fade-in" onClick={() => setView(null)} />
          <aside className="absolute right-0 inset-y-0 w-full sm:w-[460px] bg-white dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 shadow-pop pop-in overflow-y-auto">
            <div className="sticky top-0 bg-ink-950 text-ink-100 px-5 sm:px-6 py-5 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar first={view.first} last={view.last} hue={view.hue} size={56} photo={personPhoto(view)} />
                  <div>
                    <h2 className="font-display text-[20px] font-bold leading-tight">{view.first} {view.last}</h2>
                    <p className="text-[12px] text-ink-300 font-semibold">{view.empNo} · {view.specialization}</p>
                    <Chip tone={view.status === "active" ? "green" : "amber"} className="mt-1.5">{view.status}</Chip>
                  </div>
                </div>
                <button className="btn-g !text-ink-300 hover:!bg-white/10" onClick={() => setView(null)} aria-label="Close"><Ic n="x" /></button>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={() => { setForm({ open: true, t: view }); setView(null); }}><Ic n="pencil" size={13} />{tt("Edit")} / {tt("Photo")}</button>
                <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={() => setCard(view)}><Ic n="idcard" size={13} />ID card</button>
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-6">
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Profile</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                  {[["Phone", view.phone || "—"], ["Email", view.email || "—"], ["Qualification", view.qualification], ["Hired", fmtDate(view.hireDate)], ["Salary", fmtMoney(view.salary, cur)], ["Bank", view.bank || "—"]].map(([k, v]) => (
                    <div key={k}><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-300">{k}</div><div className="font-semibold truncate">{v}</div></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">{tt("Attendance")} — this week</h4>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => {
                    const st = view.status === "leave" ? "E" : attStatus(db, todayISO() + "T" + i, view.id);
                    return (
                      <div key={d} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`w-full h-7 rounded-md ${st === "P" ? "bg-emerald-500" : st === "L" ? "bg-gold-400" : st === "A" ? "bg-rose-500" : "bg-ink-300"}`} title={`${d}: ${st}`} />
                        <span className="text-[9px] font-bold text-ink-300">{d.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">{tt("Timetable")} ({slotsOf(view).length} periods)</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {slotsOf(view).slice(0, 14).map((sl) => {
                    const c = db.classes.find((x) => x.id === sl.classId);
                    const sub = db.subjects.find((x) => x.id === sl.subjectId);
                    return (
                      <div key={sl.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2 text-[12.5px]">
                        <span className="font-mono font-bold text-[11px] text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{DAYS[sl.day].slice(0, 3)} {sl.start}</span>
                        <b className="flex-1 truncate">{sub?.name}</b>
                        <span className="text-ink-400 whitespace-nowrap">{c?.name} {c?.section}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <TeacherForm open={form.open} onClose={() => setForm({ open: false })} t={form.t} db={db} />
      {card && (
        <Modal open onClose={() => setCard(null)} title="Teacher ID card" w="max-w-md"
          footer={<><button className="btn-o" onClick={() => setCard(null)}>{tt("Close")}</button><button className="btn-p" onClick={() => printNow(<div className="p-4 flex justify-center"><TeacherIDCard t={card} db={db} /></div>)}><Ic n="printer" size={15} />{tt("Print")}</button></>}>
          <TeacherIDCard t={card} db={db} />
        </Modal>
      )}
      <Confirm open={!!del} onClose={() => setDel(null)} title={`${tt("Delete")} ${del?.first} ${del?.last}?`}
        body="This removes the teacher and unassigns their classes. This action is logged."
        onYes={() => { if (del) { mutate((db) => { db.teachers = db.teachers.filter((x) => x.id !== del.id); }); audit("DELETE_TEACHER", "Teacher", `Deleted ${del.first} ${del.last}`); toast("Teacher deleted", "info"); } }} />
      <span className="hidden">{PERIODS.length}</span>
    </div>
  );
}
