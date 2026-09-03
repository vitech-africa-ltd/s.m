import { useEffect, useMemo, useState } from "react";
import { useApp, mutate, audit, notify, uid, todayISO, daysAgo, fmtDate, fmtDateShort, fmtMoney, classOf, feeTotal, paidBy, attStatus, lastSchoolDays, examAvg, gradeLetter, initials, COUNTRIES, type DB, type Student } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, Pagination, toast, PrintPortal, printNow } from "../components/ui";
import { QR, photoFor } from "../lib/media";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

const emptyForm = (regPrefix: string) => ({
  first: "", last: "", gender: "M" as "M" | "F", dob: "2010-01-01", nationality: "Rwandan", phone: "", email: "",
  address: "", prevSchool: "", classId: "", status: "active" as Student["status"],
  parent: { name: "", relation: "Father", phone: "", email: "", occupation: "", emergency: "" },
  regNo: `${regPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
});

function StudentForm({ open, onClose, st, db }: { open: boolean; onClose: () => void; st?: Student | null; db: DB }) {
  const tt = useT();
  const [f, setF] = useState(() => st ? { ...st, parent: { ...st.parent } } : emptyForm(db.school.regPrefix));
  const [errs, setErrs] = useState<Record<string, string>>({});
  useEffect(() => { if (open) { setF(st ? { ...st, parent: { ...st.parent } } : emptyForm(db.school.regPrefix)); setErrs({}); } }, [open, st, db.school.regPrefix]);
  const save = () => {
    const e: Record<string, string> = {};
    if (!f.first.trim()) e.first = "Required";
    if (!f.last.trim()) e.last = "Required";
    if (!f.classId) e.classId = "Required";
    if (!f.parent.name.trim()) e.pname = "Required";
    setErrs(e);
    if (Object.keys(e).length) return;
    if (st) {
      mutate((d) => { const i = d.students.findIndex((x) => x.id === st.id); if (i >= 0) d.students[i] = { ...f, id: st.id, hue: st.hue, admitted: st.admitted, email: f.email }; });
      audit("UPDATE_STUDENT", "Student", `Updated ${f.first} ${f.last} (${f.regNo})`);
      toast("Student updated");
    } else {
      const nid = uid();
      mutate((d) => d.students.unshift({ ...f, id: nid, hue: Math.floor(Math.random() * 360), admitted: todayISO(), email: f.email }));
      audit("CREATE_STUDENT", "Student", `Admitted ${f.first} ${f.last} (${f.regNo})`);
      notify("admission", "New admission", `${f.first} ${f.last} enrolled with ${f.regNo}`);
      toast("Student registered");
    }
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={st ? `${tt("Edit")} — ${st.first} ${st.last}` : tt("New student")} w="max-w-2xl"
      footer={<><button className="btn-o" onClick={onClose}>{tt("Cancel")}</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />{tt("Save")}</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Registration no"><input className="input font-mono" value={f.regNo} onChange={(e) => setF({ ...f, regNo: e.target.value })} /></Field>
        <Field label="Class"><select className={`input ${errs.classId ? "input-err" : ""}`} value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })}><option value="">Select…</option>{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}</select></Field>
        <Field label="First name" err={errs.first}><input className={`input ${errs.first ? "input-err" : ""}`} value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name" err={errs.last}><input className={`input ${errs.last ? "input-err" : ""}`} value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Gender"><select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></select></Field>
        <Field label="Date of birth"><input type="date" className="input" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Nationality"><select className="input" value={f.nationality} onChange={(e) => setF({ ...f, nationality: e.target.value })}>{["Rwandan", "Congolese", "Burundian", "Ugandan", "Kenyan", "Tanzanian", "Nigerian", "Other"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={COUNTRIES[db.school.country]?.phone} /></Field>
        <Field label="Address"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="Previous school"><input className="input" value={f.prevSchool} onChange={(e) => setF({ ...f, prevSchool: e.target.value })} /></Field>
        <Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Student["status"] })}>{["active", "inactive", "graduated", "archived"].map((x) => <option key={x}>{x}</option>)}</select></Field>
      </div>
      <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3">Parent / guardian</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Parent name" err={errs.pname}><input className={`input ${errs.pname ? "input-err" : ""}`} value={f.parent.name} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, name: e.target.value } }))} /></Field>
          <Field label="Relationship"><select className="input" value={f.parent.relation} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, relation: e.target.value } }))}>{["Father", "Mother", "Guardian", "Uncle", "Aunt"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Parent phone"><input className="input" value={f.parent.phone} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, phone: e.target.value } }))} /></Field>
          <Field label="Occupation"><input className="input" value={f.parent.occupation} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, occupation: e.target.value } }))} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function IDCard({ st, db }: { st: Student; db: DB }) {
  const c = classOf(db, st);
  return (
    <div className="print-card mx-auto" style={{ width: "86mm" }}>
      <div className="rounded-xl overflow-hidden border border-ink-200 bg-white text-ink-900 shadow-lift" style={{ width: "86mm" }}>
        <div className="bg-ink-950 text-white px-4 py-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-sm">{(db.school.logoText || "V")[0]}</span>
          <div><div className="font-display font-bold text-[11px] leading-3">{db.school.name}</div><div className="text-[7px] tracking-[0.18em] uppercase text-gold-300">{db.school.motto}</div></div>
        </div>
        <div className="flex gap-3 p-3.5 items-center">
          <Avatar first={st.first} last={st.last} hue={st.hue} size={62} photo={photoFor(st.id)} />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] leading-tight">{st.first} {st.last}</div>
            <div className="text-[9.5px] font-bold text-cobalt-700">{st.regNo} · Student ID</div>
            <div className="text-[9px] text-ink-500 mt-1">{c?.name} {c?.section} · {db.school.academicYear}</div>
            <div className="text-[8.5px] text-ink-400">Valid until: 07 / 2026</div>
          </div>
          <QR value={`VITECH|${st.regNo}|${db.school.website}`} size={56} />
        </div>
        <div className="h-2 bg-gold-400" />
      </div>
    </div>
  );
}

function DetailDrawer({ st, onClose, onEdit, onCard }: { st: Student; onClose: () => void; onEdit: () => void; onCard: () => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const c = classOf(db, st);
  const total = feeTotal(db, c?.level ?? 1);
  const paid = paidBy(db, st.id);
  const bal = total - paid;
  const pays = db.payments.filter((p) => p.studentId === st.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const days = lastSchoolDays(10);
  const present = days.filter((dd) => ["P", "L"].includes(attStatus(db, dd, st.id))).length;
  const ex = db.exams.find((e) => e.status === "completed");
  const avg = ex ? examAvg(db, ex.id, st.id) : 0;
  const gl = gradeLetter(db, avg);
  const tone = (x: string) => (x === "P" ? "bg-emerald-500" : x === "L" ? "bg-gold-400" : x === "A" ? "bg-rose-500" : "bg-ink-300");
  return (
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 bg-ink-950/45 fade-in" onClick={onClose} />
      <PrintPortal>
        <div className="p-6 max-w-[700px] mx-auto bg-white text-ink-900">
          <div className="border-b-4 border-ink-950 pb-4 flex items-center justify-between">
            <div><div className="font-display font-bold text-[22px]">{db.school.name}</div><div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Student profile — {db.school.academicYear}</div></div>
            <Avatar first={st.first} last={st.last} hue={st.hue} size={64} photo={photoFor(st.id)} />
          </div>
          <div className="py-4">
            <div className="font-display font-bold text-[26px]">{st.first} {st.last}</div>
            <div className="font-mono font-bold text-cobalt-700">{st.regNo} · {c?.name} {c?.section}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[12.5px]">
              {[["Date of birth", fmtDate(st.dob)], ["Gender", st.gender === "M" ? "Male" : "Female"], ["Nationality", st.nationality], ["Address", st.address || "—"], ["Previous school", st.prevSchool || "—"], ["Admitted", fmtDate(st.admitted)], ["Parent", `${st.parent.name} (${st.parent.relation})`], ["Parent phone", st.parent.phone], ["Occupation", st.parent.occupation], ["Emergency", st.parent.emergency]].map(([k, v]) => (
                <div key={k}><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">{k}</div><div className="font-semibold">{v}</div></div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[["Attendance (10d)", `${Math.round((present / days.length) * 100)}%`], ["Term average", avg ? avg.toFixed(1) + "%" : "—"], ["Fees balance", fmtMoney(Math.max(0, bal), cur)]].map(([k, v]) => (
                <div key={k} className="border border-ink-200 rounded-lg py-3"><div className="font-display font-bold text-[17px]">{v}</div><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">{k}</div></div>
              ))}
            </div>
            <p className="text-[10.5px] text-ink-400 mt-5">Generated by VITECH School Management System · {fmtDate(todayISO())} · {db.school.phone}</p>
          </div>
        </div>
      </PrintPortal>
      <aside className="absolute right-0 inset-y-0 w-full sm:w-[460px] bg-white dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 shadow-pop pop-in overflow-y-auto">
        <div className="sticky top-0 bg-ink-950 text-ink-100 px-6 py-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar first={st.first} last={st.last} hue={st.hue} size={56} photo={photoFor(st.id)} />
              <div>
                <h2 className="font-display text-[20px] font-bold leading-tight">{st.first} {st.last}</h2>
                <p className="text-[12px] text-ink-300 font-semibold">{st.regNo} · {c?.name} {c?.section}</p>
                <Chip tone={st.status === "active" ? "green" : st.status === "pending" ? "amber" : "gray"} className="mt-1.5">{st.status}</Chip>
              </div>
            </div>
            <button className="btn-g !text-ink-300 hover:!bg-white/10" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={onEdit}><Ic n="pencil" size={13} />{tt("Edit")}</button>
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={onCard}><Ic n="idcard" size={13} />ID card</button>
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={() => window.print()}><Ic n="printer" size={13} />{tt("Print")}</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Profile</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
              {[["Date of birth", fmtDate(st.dob)], ["Gender", st.gender === "M" ? "Male" : "Female"], ["Nationality", st.nationality], ["Phone", st.phone || "—"], ["Address", st.address || "—"], ["Admitted", fmtDate(st.admitted)]].map(([k, v]) => (
                <div key={k}><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-300">{k}</div><div className="font-semibold truncate">{v}</div></div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Parent / guardian</h4>
            <div className="panel !shadow-none p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gold-100 dark:bg-gold-500/15 text-gold-600 flex items-center justify-center font-display font-bold text-sm">{initials(st.parent.name.split(" ")[0] ?? "P", st.parent.name.split(" ").pop() ?? "")}</span>
              <div className="min-w-0 text-[12.5px]">
                <b className="block">{st.parent.name}</b>
                <span className="text-ink-400">{st.parent.relation} · {st.parent.occupation}</span>
                <span className="block text-[11.5px] text-cobalt-600 dark:text-cobalt-300 font-semibold">{st.parent.phone}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Attendance — last 10 days</h4>
            <div className="flex gap-1.5">
              {days.map((dd) => { const stt = attStatus(db, dd, st.id); return (
                <div key={dd} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`w-full h-7 rounded-md ${tone(stt)}`} title={`${dd}: ${stt}`} />
                  <span className="text-[9px] font-bold text-ink-300 tnum">{dd.slice(8, 10)}</span>
                </div>); })}
            </div>
            <p className="text-[11.5px] text-ink-400 font-semibold mt-2">{Math.round((present / days.length) * 100)}% attendance rate</p>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Academics</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="panel !shadow-none py-3"><div className="font-display font-bold text-lg tnum">{avg ? avg.toFixed(1) : "—"}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Average</div></div>
              <div className="panel !shadow-none py-3"><div className="font-display font-bold text-lg">{gl.grade}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Grade</div></div>
              <div className="panel !shadow-none py-3"><div className={`font-display font-bold text-lg ${bal > 0 ? "text-rose-500" : "text-emerald-600"}`}>{bal > 0 ? "Due" : "Clear"}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Fees</div></div>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Payments</h4>
            <div className="space-y-1.5">
              {pays.length === 0 && <p className="text-[12.5px] text-ink-400">No payments yet.</p>}
              {pays.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[12.5px] rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2">
                  <span className="font-mono font-bold text-[11px] text-cobalt-600 dark:text-cobalt-300">{p.receipt}</span>
                  <span className="text-ink-400">{fmtDateShort(p.date)} · {p.method}</span>
                  <b className="tnum">{fmtMoney(p.amount, cur)}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            {st.status === "active" && <button className="btn-o btn-sm flex-1" onClick={() => { mutate((db) => { const x = db.students.find((y) => y.id === st.id)!; x.status = "graduated"; }); audit("GRADUATE_STUDENT", "Student", `${st.first} ${st.last} graduated`); toast(`${st.first} marked as graduated`); }}><Ic n="award" size={14} />Graduate</button>}
            <button className="btn-o btn-sm flex-1" onClick={() => { mutate((db) => { const x = db.students.find((y) => y.id === st.id)!; x.status = "archived"; }); audit("ARCHIVE_STUDENT", "Student", `${st.first} ${st.last} archived`); toast("Student archived", "info"); onClose(); }}><Ic n="folder" size={14} />Archive</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ImportModal({ open, onClose, db }: { open: boolean; onClose: () => void; db: DB }) {
  const [text, setText] = useState("");
  const rows = useMemo(() => text.split(/\r?\n/).map((l) => l.split(",").map((x) => x.trim())).filter((r) => r.length >= 4 && r[0] && !/^RegNo/i.test(r[0])), [text]);
  const dupes = rows.filter((r) => db.students.some((x) => x.regNo.toLowerCase() === r[0].toLowerCase()));
  const doImport = () => {
    const fresh = rows.filter((r) => !db.students.some((x) => x.regNo.toLowerCase() === r[0].toLowerCase()));
    mutate((db) => fresh.forEach((r) => db.students.unshift({
      id: uid(), regNo: r[0], first: r[1], last: r[2], gender: (r[3] || "M") as "M" | "F", dob: r[4] || "2010-01-01",
      nationality: "Rwandan", phone: "", email: "", address: "", prevSchool: "", admitted: todayISO(),
      classId: db.classes[0].id, status: "active", hue: Math.floor(Math.random() * 360),
      parent: { name: r[5] || "Parent", relation: "Guardian", phone: "", email: "", occupation: "", emergency: "" },
    })));
    audit("IMPORT_STUDENTS", "Students", `Imported ${fresh.length} students (${dupes.length} duplicates skipped)`);
    toast(`${fresh.length} imported · ${dupes.length} duplicates skipped`);
    onClose(); setText("");
  };
  return (
    <Modal open={open} onClose={onClose} title="Import students from CSV" w="max-w-xl"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={doImport} disabled={!rows.length}><Ic n="upload" size={15} />Import {rows.length} rows</button></>}>
      <p className="text-[13px] text-ink-400 mb-3">Format: <code className="kbd">RegNo, First, Last, Gender(M/F), DOB, Parent</code> — duplicates are detected automatically.</p>
      <label className="btn-o btn-sm cursor-pointer mb-3 inline-flex"><Ic n="upload" size={14} />Choose .csv file
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then(setText); }} />
      </label>
      <textarea className="input font-mono !text-[12px]" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={"VA-2026-0901, Kevin, Mugisha, M, 2011-05-12, Mr Mugisha"} />
      {rows.length > 0 && (
        <div className={`mt-3 rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold ${dupes.length ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
          {rows.length} rows parsed · {rows.length - dupes.length} new · {dupes.length} duplicates will be skipped
        </div>
      )}
    </Modal>
  );
}

export default function StudentsPage({ query }: { nav: (to: string) => void; query: string }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [q, setQ] = useState(query);
  useEffect(() => setQ(query), [query]);
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; st?: Student | null }>({ open: false });
  const [view, setView] = useState<Student | null>(null);
  const [card, setCard] = useState<Student | null>(null);
  const [imp, setImp] = useState(false);
  const [del, setDel] = useState<Student | null>(null);

  const filtered = useMemo(() => db.students.filter((x) => {
    if (cls !== "all" && x.classId !== cls) return false;
    if (status !== "all" && x.status !== status) return false;
    const ql = q.trim().toLowerCase();
    if (ql && !`${x.first} ${x.last} ${x.regNo} ${x.parent.name}`.toLowerCase().includes(ql)) return false;
    return true;
  }).sort((a, b) => a.first.localeCompare(b.first)), [db.students, q, cls, status]);

  const per = 12;
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const shown = filtered.slice((page - 1) * per, page * per);
  useEffect(() => setPage(1), [q, cls, status]);

  const exportCSV = () => {
    const head = "RegNo,First,Last,Gender,DOB,Class,Parent,ParentPhone,Status";
    const rows = filtered.map((x) => { const c = classOf(db, x); return [x.regNo, x.first, x.last, x.gender, x.dob, `${c?.name} ${c?.section}`, `"${x.parent.name}"`, x.parent.phone, x.status].join(","); });
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "students.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    audit("EXPORT_STUDENTS", "Students", `Exported ${filtered.length} students to CSV`);
    toast(`Exported ${filtered.length} students to CSV`);
  };
  const printCard = (st: Student) => printNow(<div className="p-4 flex justify-center"><IDCard st={st} db={db} /></div>);

  return (
    <div>
      <PageHead title="Students & registration" sub={`${db.students.length} students · ${db.students.filter((x) => x.status === "active").length} active`}>
        <button className="btn-o btn-sm" onClick={() => setImp(true)}><Ic n="upload" size={15} />{tt("Import")}</button>
        <button className="btn-o btn-sm" onClick={exportCSV}><Ic n="download" size={15} />{tt("Export")} CSV</button>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="plus" size={15} />{tt("New student")}</button>
      </PageHead>

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2.5 p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative flex-1 min-w-[180px]">
            <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input className="input !pl-9" placeholder={`${tt("Search")}…`} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input !w-auto" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Class">
            <option value="all">{tt("All")} · {tt("Classes")}</option>
            {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={tt("Status")}>
            {["all", "active", "inactive", "graduated", "archived"].map((x) => <option key={x} value={x}>{x === "all" ? tt("All") : x}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>{tt("Student")}</th><th>Reg No</th><th>{tt("Class")}</th><th>{tt("Status")}</th><th className="hidden md:table-cell">Balance</th><th className="!text-right">{tt("Actions")}</th></tr></thead>
            <tbody>
              {shown.map((x) => {
                const c = classOf(db, x);
                const bal = Math.max(0, feeTotal(db, c?.level ?? 1) - paidBy(db, x.id));
                return (
                  <tr key={x.id} className="cursor-pointer" onClick={() => setView(x)}>
                    <td><span className="flex items-center gap-3"><Avatar first={x.first} last={x.last} hue={x.hue} size={34} photo={photoFor(x.id)} /><span><b className="block text-[13.5px]">{x.first} {x.last}</b><span className="block text-[11px] text-ink-400">{x.gender === "M" ? "Male" : "Female"} · {x.nationality}</span></span></span></td>
                    <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{x.regNo}</td>
                    <td className="whitespace-nowrap">{c?.name} {c?.section}</td>
                    <td><Chip tone={x.status === "active" ? "green" : x.status === "graduated" ? "gold" : x.status === "archived" ? "gray" : "amber"}>{x.status}</Chip></td>
                    <td className={`hidden md:table-cell font-bold tnum whitespace-nowrap ${bal > 0 ? "text-rose-500" : "text-emerald-600"}`}>{bal > 0 ? fmtMoney(bal, cur) : "—"}</td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-g btn-sm !px-2" title="ID card" onClick={() => setCard(x)}><Ic n="idcard" size={15} /></button>
                      <button className="btn-g btn-sm !px-2" title={tt("Edit")} onClick={() => setForm({ open: true, st: x })}><Ic n="pencil" size={14} /></button>
                      <button className="btn-g btn-sm !px-2 !text-rose-500" title={tt("Delete")} onClick={() => setDel(x)}><Ic n="trash" size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} shown={shown.length} />
      </div>

      <StudentForm open={form.open} onClose={() => setForm({ open: false })} st={form.st} db={db} />
      <ImportModal open={imp} onClose={() => setImp(false)} db={db} />
      {view && <DetailDrawer st={view} onClose={() => setView(null)} onEdit={() => { setForm({ open: true, st: view }); setView(null); }} onCard={() => { setCard(view); }} />}
      {card && (
        <Modal open onClose={() => setCard(null)} title="Student ID card" w="max-w-md"
          footer={<><button className="btn-o" onClick={() => setCard(null)}>{tt("Close")}</button><button className="btn-p" onClick={() => printCard(card)}><Ic n="printer" size={15} />{tt("Print")}</button></>}>
          <IDCard st={card} db={db} />
        </Modal>
      )}
      <Confirm open={!!del} onClose={() => setDel(null)} title={`${tt("Delete")} ${del?.first} ${del?.last}?`}
        body="This permanently removes the student record, including grades and payment history. This action is logged."
        onYes={() => { if (del) { mutate((db) => { db.students = db.students.filter((x) => x.id !== del.id); }); audit("DELETE_STUDENT", "Student", `Deleted ${del.first} ${del.last} (${del.regNo})`); toast("Student deleted", "info"); } }} />
      <span className="hidden">{daysAgo(0)}</span>
    </div>
  );
}

/* ================= Admissions ================= */
export function AdmissionsPage() {
  const s = useApp();
  const db = s.db;
  const [stage, setStage] = useState("all");
  const stages = ["application", "review", "approved", "enrolled", "rejected"];
  const list = db.admissions.filter((a) => stage === "all" || a.stage === stage);
  const advance = (a: { id: string; stage: string; first: string; last: string; gender: "M" | "F"; level: number; parent: string; phone: string; appNo: string }) => {
    if (a.stage === "approved") {
      mutate((db) => {
        const adm = db.admissions.find((x) => x.id === a.id)!; adm.stage = "enrolled";
        db.students.unshift({ id: uid(), regNo: `${db.school.regPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`, first: a.first, last: a.last, gender: a.gender, dob: `${2025 - a.level - 13}-06-15`, nationality: "Rwandan", phone: "", email: "", address: "", prevSchool: "", admitted: todayISO(), classId: db.classes.find((c) => c.level === a.level)?.id ?? db.classes[0].id, status: "active", hue: Math.floor(Math.random() * 360), parent: { name: a.parent, relation: "Guardian", phone: a.phone, email: "", occupation: "", emergency: "" } });
      });
      audit("ENROLL_STUDENT", "Admissions", `${a.appNo} → enrolled (${a.first} ${a.last})`);
      notify("admission", "New admission", `${a.first} ${a.last} enrolled — student account created`);
      toast(`${a.first} enrolled & student account created`);
    } else {
      const next = stages[stages.indexOf(a.stage) + 1] as "application" | "review" | "approved" | "enrolled" | "rejected";
      mutate((db) => { const adm = db.admissions.find((x) => x.id === a.id)!; adm.stage = next; });
      audit("ADVANCE_ADMISSION", "Admissions", `${a.appNo} → ${next}`);
      toast(`${a.appNo} moved to ${next}`);
    }
  };
  const tone: Record<string, "amber" | "blue" | "green" | "gray" | "red"> = { application: "amber", review: "blue", approved: "gold" as never, enrolled: "green", rejected: "red" };
  return (
    <div>
      <PageHead title="Admissions pipeline" sub="Application → Review → Approval → Enrollment → Student account" />
      <div className="flex gap-1.5 flex-wrap mb-4">
        {["all", ...stages].map((st) => (
          <button key={st} onClick={() => setStage(st)} className={`chip cursor-pointer !py-2 !px-3.5 capitalize transition-all ${stage === st ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>
            {st} {st !== "all" && <b className="tnum">({db.admissions.filter((a) => a.stage === st).length})</b>}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((a) => (
          <div key={a.id} className="panel p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <Avatar first={a.first} last={a.last} hue={(a.first.length * 47) % 360} size={42} />
              <Chip tone={tone[a.stage] ?? "gray"}>{a.stage}</Chip>
            </div>
            <h3 className="font-display font-bold text-[16px] mt-3">{a.first} {a.last}</h3>
            <p className="text-[12px] text-ink-400 font-semibold">{a.appNo} · Senior {a.level} · {fmtDateShort(a.date)}</p>
            <p className="text-[12px] text-ink-400 mt-1">{a.parent} · {a.phone}</p>
            <div className="flex gap-2 mt-4">
              {a.stage !== "enrolled" && a.stage !== "rejected" && (
                <button className="btn-p btn-sm flex-1" onClick={() => advance(a)}>{a.stage === "approved" ? "Enroll & create account" : `Move to ${stages[stages.indexOf(a.stage) + 1]}`}</button>
              )}
              {a.stage !== "enrolled" && a.stage !== "rejected" && (
                <button className="btn-o btn-sm" onClick={() => { mutate((db) => { const adm = db.admissions.find((x) => x.id === a.id)!; adm.stage = "rejected"; }); audit("REJECT_ADMISSION", "Admissions", a.appNo); toast("Application rejected", "info"); }}><Ic n="x" size={14} /></button>
              )}
              {(a.stage === "enrolled" || a.stage === "rejected") && <Chip tone={a.stage === "enrolled" ? "green" : "red"} className="!py-2">Final: {a.stage}</Chip>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
