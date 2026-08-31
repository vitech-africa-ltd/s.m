import { useEffect, useMemo, useState } from "react";
import { useApp, mutate, audit, notify, uid, todayISO, fmtDate, fmtMoney, paidBy, feeTotal, classOf, examAvg, gradeLetter, attStatus, lastSchoolDays, initials, type Student, type DB } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, Pagination, Empty, toast, PrintPortal } from "../components/ui";
import { PageHead } from "./Dashboard";

const PER = 12;

function StudentForm({ init, onClose }: { init?: Student; onClose: () => void }) {
  const s = useApp();
  const [f, setF] = useState(() => init ? { ...init, parent: { ...init.parent } } : {
    id: "", regNo: "", first: "", last: "", gender: "M" as "M" | "F", dob: "2010-01-01", nationality: "Rwandan", phone: "", email: "",
    address: "", prevSchool: "", admitted: todayISO(), classId: s.db.classes[0].id, status: "active" as Student["status"],
    parent: { name: "", relation: "Father", phone: "", email: "", occupation: "", emergency: "" }, hue: Math.floor(Math.random() * 360), ability: 60,
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const up = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const save = () => {
    const e: Record<string, string> = {};
    if (!f.first.trim()) e.first = "First name is required";
    if (!f.last.trim()) e.last = "Last name is required";
    if (!f.parent.name.trim()) e.pname = "Parent name is required";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Invalid email";
    setErrs(e);
    if (Object.keys(e).length) { toast("Please fix the highlighted fields", "err"); return; }
    if (init) {
      mutate((db) => { const i = db.students.findIndex((x) => x.id === init.id); db.students[i] = f as Student; });
      audit("UPDATE_STUDENT", "Student", `Updated profile — ${f.first} ${f.last} (${f.regNo || init.regNo})`);
      toast("Student updated");
    } else {
      const regNo = `${s.db.school.regPrefix}-2026-${String(s.db.students.length + 1).padStart(4, "0")}`;
      mutate((db) => db.students.unshift({ ...(f as Student), id: uid(), regNo }));
      audit("CREATE_STUDENT", "Student", `Registered ${f.first} ${f.last} — ${regNo}`);
      notify("admission", "New student registered", `${f.first} ${f.last} joined ${classOf(s.db, f as Student)?.name}`);
      toast(`${f.first} ${f.last} registered`);
    }
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={init ? `Edit ${init.first} ${init.last}` : "Register new student"} w="max-w-2xl"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />{init ? "Save changes" : "Register student"}</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name" err={errs.first}><input className={`input ${errs.first ? "input-err" : ""}`} value={f.first} onChange={(e) => up("first", e.target.value)} /></Field>
        <Field label="Last name" err={errs.last}><input className={`input ${errs.last ? "input-err" : ""}`} value={f.last} onChange={(e) => up("last", e.target.value)} /></Field>
        <Field label="Gender"><select className="input" value={f.gender} onChange={(e) => up("gender", e.target.value)}><option value="M">Male</option><option value="F">Female</option></select></Field>
        <Field label="Date of birth"><input type="date" className="input" value={f.dob} onChange={(e) => up("dob", e.target.value)} /></Field>
        <Field label="Nationality"><input className="input" value={f.nationality} onChange={(e) => up("nationality", e.target.value)} /></Field>
        <Field label="Class">
          <select className="input" value={f.classId} onChange={(e) => up("classId", e.target.value)}>
            {s.db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} — Section {c.section}</option>)}
          </select>
        </Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => up("phone", e.target.value)} placeholder="+250 7XX XXX XXX" /></Field>
        <Field label="Email" err={errs.email}><input className={`input ${errs.email ? "input-err" : ""}`} value={f.email} onChange={(e) => up("email", e.target.value)} /></Field>
        <Field label="Address"><input className="input" value={f.address} onChange={(e) => up("address", e.target.value)} /></Field>
        <Field label="Previous school"><input className="input" value={f.prevSchool} onChange={(e) => up("prevSchool", e.target.value)} /></Field>
        <Field label="Admission date"><input type="date" className="input" value={f.admitted} onChange={(e) => up("admitted", e.target.value)} /></Field>
        <Field label="Status"><select className="input" value={f.status} onChange={(e) => up("status", e.target.value)}>{["active", "pending", "graduated", "archived", "transferred"].map((x) => <option key={x} value={x}>{x}</option>)}</select></Field>
      </div>
      <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3">Parent / guardian</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Parent name" err={errs.pname}><input className={`input ${errs.pname ? "input-err" : ""}`} value={f.parent.name} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, name: e.target.value } }))} /></Field>
          <Field label="Relationship"><select className="input" value={f.parent.relation} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, relation: e.target.value } }))}>{["Father", "Mother", "Guardian", "Uncle", "Aunt"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Parent phone"><input className="input" value={f.parent.phone} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, phone: e.target.value } }))} /></Field>
          <Field label="Occupation"><input className="input" value={f.parent.occupation} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, occupation: e.target.value } }))} /></Field>
          <Field label="Parent email"><input className="input" value={f.parent.email} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, email: e.target.value } }))} /></Field>
          <Field label="Emergency contact"><input className="input" value={f.parent.emergency} onChange={(e) => setF((p) => ({ ...p, parent: { ...p.parent, emergency: e.target.value } }))} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function IDCard({ st, db }: { st: Student; db: DB }) {
  const c = classOf(db, st);
  return (
    <div className="print-card mx-auto" style={{ width: "86mm", minHeight: "54mm", padding: 0 }}>
      <div className="rounded-xl overflow-hidden border border-ink-200 bg-white text-ink-900 shadow-lift" style={{ width: "86mm" }}>
        <div className="bg-ink-950 text-white px-4 py-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-sm">V</span>
          <div><div className="font-display font-bold text-[11px] leading-3">{db.school.name}</div><div className="text-[7px] tracking-[0.18em] uppercase text-gold-300">{db.school.motto}</div></div>
        </div>
        <div className="flex gap-3 p-3.5 items-center">
          <Avatar first={st.first} last={st.last} hue={st.hue} size={62} />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] leading-tight">{st.first} {st.last}</div>
            <div className="text-[9.5px] font-bold text-cobalt-700">{st.regNo} · Student ID</div>
            <div className="text-[9px] text-ink-500 mt-1">{c?.name} {c?.section} · {db.school.academicYear}</div>
            <div className="text-[8.5px] text-ink-400">Valid until: 07 / 2026</div>
          </div>
          <svg viewBox="0 0 21 21" width="42" height="42" className="text-ink-900" aria-label="QR code">
            {Array.from({ length: 44 }, (_, i) => { const x = (i * 7 + st.id.length * 3) % 21; const y = (i * 11 + 5) % 21; return <rect key={i} x={x} y={y} width="1.2" height="1.2" fill="currentColor" />; })}
            <rect x="0" y="0" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.2" /><rect x="16" y="0" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.2" /><rect x="0" y="16" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="h-2 bg-gold-400" />
      </div>
    </div>
  );
}

function DetailDrawer({ st, onClose, onEdit, onCard }: { st: Student; onClose: () => void; onEdit: () => void; onCard: () => void }) {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const c = classOf(db, st);
  const lvl = c?.level ?? 1;
  const total = feeTotal(db, lvl);
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
            <Avatar first={st.first} last={st.last} hue={st.hue} size={64} />
          </div>
          <div className="py-4">
            <div className="font-display font-bold text-[26px]">{st.first} {st.last}</div>
            <div className="font-mono font-bold text-cobalt-700">{st.regNo} · {c?.name} {c?.section}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[12.5px]">
              {[["Date of birth", fmtDate(st.dob)], ["Gender", st.gender === "M" ? "Male" : "Female"], ["Nationality", st.nationality], ["Phone", st.phone || "—"], ["Email", st.email || "—"], ["Address", st.address || "—"], ["Previous school", st.prevSchool || "—"], ["Admitted", fmtDate(st.admitted)], ["Parent", `${st.parent.name} (${st.parent.relation})`], ["Parent phone", st.parent.phone], ["Occupation", st.parent.occupation], ["Emergency", st.parent.emergency]].map(([k, v]) => (
                <div key={k}><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">{k}</div><div className="font-semibold">{v}</div></div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[["Attendance (10d)", `${Math.round((present / days.length) * 100)}%`], ["Term average", avg ? avg.toFixed(1) + "%" : "—"], ["Fees balance", fmtMoney(Math.max(0, bal), db.school.currency)]].map(([k, v]) => (
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
              <Avatar first={st.first} last={st.last} hue={st.hue} size={56} />
              <div>
                <h2 className="font-display text-[20px] font-bold leading-tight">{st.first} {st.last}</h2>
                <p className="text-[12px] text-ink-300 font-semibold">{st.regNo} · {c?.name} {c?.section}</p>
                <Chip tone={st.status === "active" ? "green" : st.status === "pending" ? "amber" : "gray"} className="mt-1.5">{st.status}</Chip>
              </div>
            </div>
            <button className="btn-g !text-ink-300 hover:!bg-white/10" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={onEdit}><Ic n="pencil" size={13} />Edit</button>
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={onCard}><Ic n="idcard" size={13} />ID card</button>
            <button className="btn-o btn-sm !bg-white/[0.08] !border-white/15 !text-white hover:!border-gold-400" onClick={() => window.print()}><Ic n="printer" size={13} />Print</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Profile</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
              {[["Date of birth", fmtDate(st.dob)], ["Gender", st.gender === "M" ? "Male" : "Female"], ["Nationality", st.nationality], ["Phone", st.phone || "—"], ["Email", st.email || "—"], ["Address", st.address || "—"], ["Previous school", st.prevSchool || "—"], ["Admitted", fmtDate(st.admitted)]].map(([k, v]) => (
                <div key={k}><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-300">{k}</div><div className="font-semibold truncate">{v}</div></div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Parent / guardian</h4>
            <div className="panel !shadow-none p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gold-100 dark:bg-gold-500/15 text-gold-600 flex items-center justify-center font-display font-bold text-sm">{initials(st.parent.name.replace(/^(Mr|Mrs)\. /, "").split(" ")[0] ?? "P", st.parent.name.split(" ").pop() ?? "")}</span>
              <div className="min-w-0 text-[12.5px]">
                <b className="block">{st.parent.name}</b>
                <span className="text-ink-400">{st.parent.relation} · {st.parent.occupation}</span>
                <span className="block text-ink-400">{st.parent.phone}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="panel !shadow-none p-3.5 text-center"><div className="font-display text-xl font-bold tnum">{Math.round((present / days.length) * 100)}%</div><div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">Attendance</div></div>
            <div className="panel !shadow-none p-3.5 text-center"><div className="font-display text-xl font-bold tnum">{avg ? avg.toFixed(1) : "—"}</div><div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">Avg score</div></div>
            <div className="panel !shadow-none p-3.5 text-center"><div className="font-display text-xl font-bold" style={{ color: avg >= db.school.passMark ? "#10b981" : "#f43f5e" }}>{avg ? gl.grade : "—"}</div><div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-400">Grade</div></div>
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Fees — {c?.name}</h4>
            <div className="panel !shadow-none p-4">
              <div className="flex justify-between text-[13px] font-semibold mb-1"><span>Billed ({db.school.academicYear})</span><b className="tnum">{fmtMoney(total, cur)}</b></div>
              <div className="flex justify-between text-[13px] font-semibold mb-2"><span>Paid</span><b className="tnum text-emerald-600">{fmtMoney(paid, cur)}</b></div>
              <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-2"><div className={`h-full rounded-full barx-anim ${bal > 0 ? "bg-gold-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (paid / Math.max(1, total)) * 100)}%` }} /></div>
              <div className={`text-[12.5px] font-bold ${bal > 0 ? "text-rose-600" : "text-emerald-600"}`}>{bal > 0 ? `Balance due: ${fmtMoney(bal, cur)}` : "Fully paid ✓"}</div>
            </div>
            {pays.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {pays.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 text-[12.5px] rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2">
                    <Ic n="payment" size={14} className="text-cobalt-500" /><span className="font-mono font-bold text-[11.5px]">{p.receipt}</span>
                    <span className="text-ink-400">{p.method}</span><b className="ml-auto tnum">{fmtMoney(p.amount, cur)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2.5">Attendance — last 10 school days</h4>
            <div className="flex gap-1.5">
              {days.map((dd) => { const stt = attStatus(db, dd, st.id); return (
                <div key={dd} className="flex-1 text-center">
                  <div className={`h-9 rounded-md ${tone(stt)} opacity-80`} title={`${dd}: ${stt}`} />
                  <span className="text-[9px] font-bold text-ink-300">{dd.slice(8, 10)}</span>
                </div>); })}
            </div>
            <div className="flex gap-3 mt-2 text-[10.5px] font-bold text-ink-400"><span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-emerald-500" />Present</span><span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-gold-400" />Late</span><span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-rose-500" />Absent</span></div>
          </div>
          <div className="flex gap-2">
            <button className="btn-o flex-1 btn-sm" onClick={() => { mutate((db) => { const x = db.students.find((y) => y.id === st.id)!; x.status = x.status === "graduated" ? "active" : "graduated"; }); audit("GRADUATE_STUDENT", "Student", `${st.first} ${st.last} status changed`); toast("Status updated"); onClose(); }}><Ic n="award" size={14} />Graduate</button>
            <button className="btn-o flex-1 btn-sm" onClick={() => { mutate((db) => { const x = db.students.find((y) => y.id === st.id)!; x.status = "transferred"; }); audit("TRANSFER_STUDENT", "Student", `${st.first} ${st.last} transferred out`); toast("Student transferred"); onClose(); }}><Ic n="swap" size={14} />Transfer</button>
            <button className="btn-o flex-1 btn-sm !text-rose-600" onClick={() => { mutate((db) => { const x = db.students.find((y) => y.id === st.id)!; x.status = "archived"; }); audit("ARCHIVE_STUDENT", "Student", `${st.first} ${st.last} archived`); toast("Student archived", "info"); onClose(); }}><Ic n="folder" size={14} />Archive</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function StudentsPage({ nav, query }: { nav: (to: string) => void; query: string }) {
  const s = useApp();
  const db = s.db;
  const [q, setQ] = useState(query);
  useEffect(() => setQ(query), [query]);
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [gender, setGender] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; st?: Student }>({ open: false });
  const [detail, setDetail] = useState<Student | null>(null);
  const [del, setDel] = useState<Student | null>(null);
  const [card, setCard] = useState<Student | null>(null);
  const [imp, setImp] = useState(false);

  const filtered = useMemo(() => db.students.filter((x) => {
    const n = q.trim().toLowerCase();
    if (n && !`${x.first} ${x.last} ${x.regNo} ${x.parent.name}`.toLowerCase().includes(n)) return false;
    if (cls !== "all" && x.classId !== cls) return false;
    if (status !== "all" && x.status !== status) return false;
    if (gender !== "all" && x.gender !== gender) return false;
    return true;
  }), [db.students, q, cls, status, gender]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice((page - 1) * PER, page * PER);

  const exportCSV = () => {
    const head = "RegNo,First,Last,Gender,DOB,Class,Status,Parent,ParentPhone";
    const rows = filtered.map((x) => [x.regNo, x.first, x.last, x.gender, x.dob, `${classOf(db, x)?.name} ${classOf(db, x)?.section}`, x.status, x.parent.name, x.parent.phone].join(","));
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "students.csv"; a.click();
    audit("EXPORT_STUDENTS", "Students", `Exported ${filtered.length} students to CSV`);
    toast(`Exported ${filtered.length} students to CSV`);
  };

  return (
    <div>
      <PageHead title="Students" sub={`${db.students.length} total · ${db.students.filter((x) => x.status === "active").length} active this year`}>
        <button className="btn-o btn-sm" onClick={() => setImp(true)}><Ic n="upload" size={15} />Import</button>
        <button className="btn-o btn-sm" onClick={exportCSV}><Ic n="download" size={15} />Export CSV</button>
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true })}><Ic n="userplus" size={15} />New student</button>
      </PageHead>

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2.5 p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative flex-1 min-w-[200px]">
            <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input className="input !pl-9" placeholder="Search name, reg no, parent…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <select className="input !w-auto" value={cls} onChange={(e) => { setCls(e.target.value); setPage(1); }} aria-label="Filter by class">
            <option value="all">All classes</option>
            {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <select className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
            <option value="all">All statuses</option>{["active", "pending", "graduated", "archived", "transferred"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <select className="input !w-auto" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }} aria-label="Filter by gender">
            <option value="all">All genders</option><option value="M">Male</option><option value="F">Female</option>
          </select>
        </div>
        {shown.length === 0 ? (
          <Empty icon="students" title="No students match your filters" body="Try a different search term or clear the filters." action={<button className="btn-o btn-sm" onClick={() => { setQ(""); setCls("all"); setStatus("all"); setGender("all"); }}>Clear filters</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Student</th><th>Reg No</th><th>Class</th><th>Parent</th><th>Fees status</th><th>Status</th><th className="!text-right">Actions</th></tr></thead>
              <tbody>
                {shown.map((x) => {
                  const c = classOf(db, x);
                  const tot = feeTotal(db, c?.level ?? 1); const paid = paidBy(db, x.id);
                  return (
                    <tr key={x.id} className="cursor-pointer" onClick={() => setDetail(x)}>
                      <td><span className="flex items-center gap-3"><Avatar first={x.first} last={x.last} hue={x.hue} size={34} /><span><b className="block text-[13.5px]">{x.first} {x.last}</b><span className="block text-[11px] text-ink-400">{x.gender === "M" ? "Male" : "Female"} · {x.nationality}</span></span></span></td>
                      <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{x.regNo}</td>
                      <td className="whitespace-nowrap font-semibold text-[13px]">{c?.name} {c?.section}</td>
                      <td><span className="block text-[12.5px] font-semibold">{x.parent.name}</span><span className="block text-[11px] text-ink-400">{x.parent.phone}</span></td>
                      <td>{paid >= tot ? <Chip tone="green">Paid</Chip> : paid > 0 ? <Chip tone="amber">Partial</Chip> : <Chip tone="red">Unpaid</Chip>}</td>
                      <td><Chip tone={x.status === "active" ? "blue" : x.status === "pending" ? "amber" : "gray"}>{x.status}</Chip></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button className="btn-g btn-sm !px-2" title="View profile" onClick={() => setDetail(x)}><Ic n="eye" size={15} /></button>
                          <button className="btn-g btn-sm !px-2" title="Edit" onClick={() => setForm({ open: true, st: x })}><Ic n="pencil" size={15} /></button>
                          <button className="btn-g btn-sm !px-2 !text-rose-500" title="Delete" onClick={() => setDel(x)}><Ic n="trash" size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} shown={shown.length} />
      </div>

      {form.open && <StudentForm init={form.st} onClose={() => setForm({ open: false })} />}
      {detail && <DetailDrawer st={detail} onClose={() => setDetail(null)} onEdit={() => { setForm({ open: true, st: detail }); setDetail(null); }} onCard={() => setCard(detail)} />}
      {card && (
        <Modal open onClose={() => setCard(null)} title="Student ID card" w="max-w-md"
          footer={<><button className="btn-o" onClick={() => setCard(null)}>Close</button><button className="btn-p" onClick={() => window.print()}><Ic n="printer" size={15} />Print card</button></>}>
          <IDCard st={card} db={db} />
          <PrintPortal><div className="p-4"><IDCard st={card} db={db} /></div></PrintPortal>
        </Modal>
      )}
      <ImportModal open={imp} onClose={() => setImp(false)} />
      <Confirm open={!!del} onClose={() => setDel(null)} title="Delete student?" body={`${del?.first} ${del?.last} (${del?.regNo}) and all linked records will be removed. Consider archiving instead.`}
        onYes={() => { if (del) { mutate((db) => { db.students = db.students.filter((x) => x.id !== del.id); }); audit("DELETE_STUDENT", "Student", `Deleted ${del.first} ${del.last} (${del.regNo})`); toast("Student deleted", "info"); } }} />
    </div>
  );
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useApp();
  const [text, setText] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");
  const rows = useMemo(() => text.trim().split("\n").filter(Boolean).map((l) => l.split(",").map((x) => x.trim())).filter((r) => r.length >= 2), [text]);
  const dupe = rows.filter((r) => s.db.students.some((x) => x.regNo.toLowerCase() === (r[0] ?? "").toLowerCase()));
  const doImport = () => {
    mutate((db) => rows.forEach((r) => {
      if (db.students.some((x) => x.regNo.toLowerCase() === (r[0] ?? "").toLowerCase())) return;
      db.students.unshift({ id: uid(), regNo: r[0] || `VA-IMP-${db.students.length + 1}`, first: r[1] ?? "Imported", last: r[2] ?? "Student", gender: (r[3] === "F" ? "F" : "M"), dob: r[4] || "2010-01-01", nationality: "Rwandan", phone: "", email: "", address: "", prevSchool: "", admitted: todayISO(), classId: db.classes[0].id, status: "active", parent: { name: r[5] || "—", relation: "Guardian", phone: "", email: "", occupation: "", emergency: "" }, hue: Math.floor(Math.random() * 360), ability: 55 });
    }));
    audit("IMPORT_STUDENTS", "Students", `Imported ${rows.length - dupe.length} students (skipped ${dupe.length} duplicates)`);
    toast(`Imported ${Math.max(0, rows.length - dupe.length)} students · ${dupe.length} duplicates skipped`);
    onClose(); setText(""); setStep("input");
  };
  return (
    <Modal open={open} onClose={onClose} title="Import students from CSV" w="max-w-xl"
      footer={step === "input"
        ? <><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" disabled={!rows.length} onClick={() => setStep("preview")}>Validate & preview</button></>
        : <><button className="btn-o" onClick={() => setStep("input")}><Ic n="chevL" size={14} />Back</button><button className="btn-p" onClick={doImport}><Ic n="upload" size={15} />Import {rows.length} rows</button></>}>
      {step === "input" ? (
        <div className="space-y-3">
          <p className="text-[13px] text-ink-400">Paste CSV rows or use a file. Format: <code className="kbd">RegNo, First, Last, Gender(M/F), DOB, Parent</code></p>
          <textarea className="input font-mono !text-[12px]" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={"VA-2026-0901, Ama, Keza, F, 2011-04-12, Mrs. Keza\nVA-2026-0902, Bob, Mugisha, M, 2010-09-30, Mr. Mugisha"} />
          <label className="btn-o btn-sm cursor-pointer"><Ic n="upload" size={14} />Choose .csv file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then(setText); }} />
          </label>
          <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-2.5 text-[12px] font-semibold text-ink-400"><Ic n="download" size={13} className="inline mr-1.5" />Download the <b>import template</b> from Documents to prepare your file.</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2.5 flex-wrap">
            <Chip tone="green">{rows.length} rows parsed</Chip>
            <Chip tone={dupe.length ? "amber" : "gray"}>{dupe.length} duplicates detected</Chip>
            <Chip tone="blue">0 invalid rows</Chip>
          </div>
          <div className="rounded-lg border border-ink-100 dark:border-ink-800 overflow-hidden max-h-64 overflow-y-auto">
            <table className="tbl">
              <thead><tr><th>Reg No</th><th>Name</th><th>Gender</th><th>Parent</th><th>Result</th></tr></thead>
              <tbody>{rows.map((r, i) => {
                const isD = dupe.includes(r);
                return <tr key={i}><td className="font-mono text-[12px]">{r[0]}</td><td className="font-semibold">{r[1]} {r[2]}</td><td>{r[3]}</td><td>{r[5] ?? "—"}</td><td>{isD ? <Chip tone="amber">Duplicate — skipped</Chip> : <Chip tone="green">Will import</Chip>}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ================= Admissions pipeline ================= */
export function AdmissionsPage() {
  const s = useApp();
  const stages = [
    { id: "applied", label: "Application", tone: "blue" as const }, { id: "review", label: "Review", tone: "amber" as const },
    { id: "interview", label: "Interview", tone: "gold" as const }, { id: "approved", label: "Approved", tone: "green" as const },
    { id: "enrolled", label: "Enrolled", tone: "navy" as const },
  ];
  const move = (id: string, dir: 1 | -1) => {
    mutate((db) => {
      const a = db.admissions.find((x) => x.id === id)!;
      const order = ["applied", "review", "interview", "approved", "enrolled"];
      const i = order.indexOf(a.stage as string);
      const next = order[Math.min(4, Math.max(0, i + dir))];
      a.stage = next as typeof a.stage;
      if (next === "enrolled") {
        db.students.unshift({ id: uid(), regNo: `${db.school.regPrefix}-2026-${String(db.students.length + 1).padStart(4, "0")}`, first: a.first, last: a.last, gender: a.gender, dob: a.dob, nationality: "Rwandan", phone: a.phone, email: "", address: "", prevSchool: a.prevSchool, admitted: todayISO(), classId: db.classes.find((c) => c.name === a.applyClass)?.id ?? db.classes[0].id, status: "active", parent: { name: a.parent, relation: "Guardian", phone: a.phone, email: "", occupation: "", emergency: "" }, hue: Math.floor(Math.random() * 360), ability: 58 });
        notify("admission", "Admission completed", `${a.first} ${a.last} enrolled in ${a.applyClass}`);
      }
      audit("UPDATE_ADMISSION", "Admission", `${a.appNo} moved to ${next}`);
    });
    toast("Application stage updated");
  };
  const [form, setForm] = useState(false);
  return (
    <div>
      <PageHead title="Admissions" sub="Application → Review → Approval → Enrollment — the full pipeline.">
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="userplus" size={15} />New application</button>
      </PageHead>
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3.5">
        {stages.map((stg) => {
          const items = s.db.admissions.filter((a) => a.stage === stg.id);
          return (
            <div key={stg.id} className="panel p-3.5">
              <div className="flex items-center justify-between mb-3"><span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">{stg.label}</span><Chip tone={stg.tone}>{items.length}</Chip></div>
              <div className="space-y-2.5 min-h-[60px]">
                {items.length === 0 && <div className="text-[12px] text-ink-300 text-center py-4 font-semibold border border-dashed border-ink-200 dark:border-ink-700 rounded-lg">Empty</div>}
                {items.map((a) => (
                  <div key={a.id} className="rounded-lg border border-ink-100 dark:border-ink-800 p-3 hover:border-cobalt-300 dark:hover:border-cobalt-700 hover:shadow-panel transition-all">
                    <div className="flex items-center gap-2.5">
                      <Avatar first={a.first} last={a.last} hue={(a.first.length * 47) % 360} size={30} />
                      <div className="min-w-0"><b className="block text-[13px] truncate">{a.first} {a.last}</b><span className="text-[10.5px] font-mono text-ink-400">{a.appNo}</span></div>
                    </div>
                    <div className="text-[11.5px] text-ink-400 mt-2 space-y-0.5">
                      <div className="flex justify-between"><span>Applying for</span><b className="text-ink-600 dark:text-ink-200">{a.applyClass}</b></div>
                      <div className="flex justify-between"><span>Parent</span><b className="text-ink-600 dark:text-ink-200 truncate ml-2">{a.parent}</b></div>
                      <div className="flex justify-between"><span>Applied</span><b className="text-ink-600 dark:text-ink-200">{fmtDate(a.date)}</b></div>
                    </div>
                    <div className="flex gap-1.5 mt-2.5">
                      {a.stage !== "applied" && <button className="btn-g btn-sm !px-2 flex-1" onClick={() => move(a.id, -1)}><Ic n="chevL" size={13} /></button>}
                      {a.stage !== "enrolled" && <button className="btn-p btn-sm flex-1" onClick={() => move(a.id, 1)}>{a.stage === "approved" ? "Enroll" : "Advance"}<Ic n="chevR" size={13} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {form && <NewAdmission onClose={() => setForm(false)} />}
    </div>
  );
}

function NewAdmission({ onClose }: { onClose: () => void }) {
  const s = useApp();
  const [f, setF] = useState({ first: "", last: "", gender: "M", dob: "2012-01-01", applyClass: "Senior 1", parent: "", phone: "", prevSchool: "" });
  const save = () => {
    if (!f.first || !f.last || !f.parent) { toast("Name and parent are required", "err"); return; }
    mutate((db) => db.admissions.unshift({ id: uid(), appNo: `APP-2026-${String(50 + db.admissions.length).padStart(3, "0")}`, ...f, gender: f.gender as "M" | "F", date: todayISO(), stage: "applied", note: "" }));
    audit("CREATE_ADMISSION", "Admission", `New application — ${f.first} ${f.last} (${f.applyClass})`);
    notify("admission", "New admission application", `${f.first} ${f.last} applied for ${f.applyClass}`);
    toast("Application received");
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Online admission application" w="max-w-lg"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="send" size={15} />Submit application</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><input className="input" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name"><input className="input" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Gender"><select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option value="M">Male</option><option value="F">Female</option></select></Field>
        <Field label="Date of birth"><input type="date" className="input" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Applying for"><select className="input" value={f.applyClass} onChange={(e) => setF({ ...f, applyClass: e.target.value })}>{["Senior 1", "Senior 2", "Senior 3", "Senior 4", "Senior 5", "Senior 6"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Previous school"><input className="input" value={f.prevSchool} onChange={(e) => setF({ ...f, prevSchool: e.target.value })} /></Field>
        <Field label="Parent / guardian name"><input className="input" value={f.parent} onChange={(e) => setF({ ...f, parent: e.target.value })} /></Field>
        <Field label="Parent phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+250 7XX XXX XXX" /></Field>
      </div>
      <p className="text-[12px] text-ink-400 mt-4 font-semibold">An application number will be generated automatically. The office will contact the family to schedule the interview.</p>
    </Modal>
  );
}
