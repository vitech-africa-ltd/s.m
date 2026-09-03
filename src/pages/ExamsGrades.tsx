import { useMemo, useState } from "react";
import { useApp, mutate, audit, uid, notify, daysAhead, fmtDate, gradeLetter, examAvg, classRanking, attStatus, lastSchoolDays, classOf, fmtMoney, todayISO, type Student } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Field, Chip, Avatar, toast, PrintPortal, Empty } from "../components/ui";
import { photoFor } from "../lib/media";
import { PageHead } from "./Dashboard";

/* ================= Exams ================= */
export function ExamsPage() {
  const s = useApp();
  const db = s.db;
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ name: "", term: "Term 2", date: daysAhead(14), levels: "1,2,3,4,5,6" });
  const create = () => {
    if (!f.name) { toast("Exam name is required", "err"); return; }
    mutate((db) => db.exams.push({ id: uid(), name: f.name, term: f.term, date: f.date, status: "scheduled", classLevels: f.levels.split(",").map((x) => +x.trim()).filter(Boolean), subjectIds: db.subjects.map((x) => x.id), maxScore: 100 }));
    audit("CREATE_EXAM", "Exam", `Scheduled ${f.name} (${f.term})`);
    toast("Exam scheduled"); setForm(false);
  };
  const tone = { completed: "green", ongoing: "blue", scheduled: "amber" } as const;
  return (
    <div>
      <PageHead title="Exams" sub="Term examinations, mid-terms and continuous assessment.">
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Schedule exam</button>
      </PageHead>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.exams.map((e) => {
          const graded = db.grades.filter((g) => g.examId === e.id).length;
          const avgAll = graded ? db.grades.filter((g) => g.examId === e.id).reduce((a, b) => a + b.score, 0) / graded : 0;
          return (
            <div key={e.id} className="panel p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <span className="w-11 h-11 rounded-xl bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center"><Ic n="exams" size={20} /></span>
                <Chip tone={tone[e.status]}>{e.status}</Chip>
              </div>
              <h3 className="font-display font-bold text-[17px] mt-3 leading-snug">{e.name}</h3>
              <p className="text-[12.5px] text-ink-400 font-semibold mt-0.5">{e.term} · {fmtDate(e.date)} · out of {e.maxScore}</p>
              <div className="flex gap-2 flex-wrap mt-3">
                <Chip tone="blue">{e.classLevels.map((l) => `S${l}`).join(" · ")}</Chip>
                <Chip tone="navy">{e.subjectIds.length} subjects</Chip>
              </div>
              {e.status !== "scheduled" ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-3 text-center"><div className="font-display font-bold text-lg tnum">{graded.toLocaleString()}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">Grades entered</div></div>
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-3 text-center"><div className="font-display font-bold text-lg tnum">{avgAll ? avgAll.toFixed(1) : "—"}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">School average</div></div>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-3.5 py-2.5 mt-4 text-[12px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2"><Ic n="clock" size={14} />Begins in {Math.max(0, Math.round((new Date(e.date).getTime() - Date.now()) / 864e5))} days — reminders queued</div>
              )}
            </div>
          );
        })}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Schedule examination" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={create}><Ic n="check" size={15} />Schedule</button></>}>
        <div className="space-y-4">
          <Field label="Exam name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="End of Term 2 Examination" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Term"><select className="input" value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })}>{db.school.terms.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Start date"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          </div>
          <Field label="Levels (comma separated)"><input className="input" value={f.levels} onChange={(e) => setF({ ...f, levels: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ================= Grades ================= */
export function GradesPage() {
  const s = useApp();
  const db = s.db;
  const exams = db.exams.filter((e) => e.status !== "scheduled");
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const [cls, setCls] = useState(db.classes[0]?.id ?? "");
  const [subId, setSubId] = useState(db.subjects[0]?.id ?? "");
  const [vals, setVals] = useState<Record<string, string>>({});
  const exam = db.exams.find((e) => e.id === examId);

  const students = useMemo(() => db.students.filter((x) => x.classId === cls && x.status === "active"), [db.students, cls]);
  const grade = (sid: string) => db.grades.find((g) => g.examId === examId && g.studentId === sid && g.subjectId === subId);
  const ranking = useMemo(() => classRanking(db, examId, cls).slice(0, 8), [db, examId, cls]);
  const avgAll = useMemo(() => { const gs = db.grades.filter((g) => g.examId === examId && g.subjectId === subId); return gs.length ? gs.reduce((a, b) => a + b.score, 0) / gs.length : 0; }, [db, examId, subId]);

  const saveAll = () => {
    const entries = Object.entries(vals);
    if (!entries.length) return;
    mutate((db) => entries.forEach(([sid, raw]) => {
      const score = Math.max(0, Math.min(100, Math.round(+raw || 0)));
      const i = db.grades.findIndex((g) => g.examId === examId && g.studentId === sid && g.subjectId === subId);
      if (i >= 0) db.grades[i].score = score;
      else db.grades.push({ id: uid(), examId, studentId: sid, subjectId: subId, score });
    }));
    audit("ENTER_GRADES", "Grades", `${db.subjects.find((x) => x.id === subId)?.name} — ${db.classes.find((c) => c.id === cls)?.name} (${entries.length} marks)`);
    notify("exam", "New grades published", `${db.subjects.find((x) => x.id === subId)?.name} · ${db.classes.find((c) => c.id === cls)?.name}`);
    toast(`${entries.length} marks saved & averages recomputed`);
    setVals({});
  };

  return (
    <div>
      <PageHead title="Grade entry" sub="Marks are validated 0–100 · averages, grades and ranks update automatically.">
        <button className="btn-p btn-sm" onClick={saveAll} disabled={!Object.keys(vals).length}><Ic n="check" size={15} />Save marks{Object.keys(vals).length ? ` (${Object.keys(vals).length})` : ""}</button>
      </PageHead>
      <div className="flex flex-wrap gap-2.5 mb-4">
        <select className="input !w-auto" value={examId} onChange={(e) => { setExamId(e.target.value); setVals({}); }} aria-label="Exam">
          {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select className="input !w-auto" value={cls} onChange={(e) => { setCls(e.target.value); setVals({}); }} aria-label="Class">
          {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        <select className="input !w-auto" value={subId} onChange={(e) => { setSubId(e.target.value); setVals({}); }} aria-label="Subject">
          {db.subjects.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <Chip tone="blue" className="!py-2 ml-auto">Subject average: <b className="tnum">{avgAll ? avgAll.toFixed(1) : "—"}</b></Chip>
      </div>
      <div className="grid lg:grid-cols-[1fr_290px] gap-4">
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>#</th><th>Student</th><th className="!text-center">Mark / 100</th><th>Grade</th><th className="!text-right">New mark</th></tr></thead>
              <tbody>
                {students.map((x, i) => {
                  const g = grade(x.id);
                  const gl = g ? gradeLetter(db, g.score) : null;
                  return (
                    <tr key={x.id}>
                      <td className="text-ink-300 font-bold text-[12px] tnum">{i + 1}</td>
                      <td><span className="flex items-center gap-2.5"><Avatar first={x.first} last={x.last} hue={x.hue} size={28} photo={photoFor(x.id)} /><b className="text-[13px]">{x.first} {x.last}</b></span></td>
                      <td className="text-center font-display font-bold tnum text-[15px]">{g?.score ?? "—"}</td>
                      <td>{gl ? <Chip tone={gl.grade === "A" ? "green" : gl.grade === "F" ? "red" : gl.grade === "E" ? "amber" : "blue"}>{gl.grade} · {gl.label}</Chip> : <Chip tone="gray">not marked</Chip>}</td>
                      <td><input type="number" min={0} max={100} className="input !h-8 !w-20 !text-center !ml-auto tnum" placeholder={g ? String(g.score) : "0"} value={vals[x.id] ?? ""}
                        onChange={(e) => setVals((p) => ({ ...p, [x.id]: e.target.value }))} aria-label={`New mark for ${x.first}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="award" size={16} className="text-gold-500" />Class ranking</h3>
            <div className="space-y-2">
              {ranking.length === 0 && <p className="text-[12.5px] text-ink-300 font-semibold">No grades for this exam yet.</p>}
              {ranking.map((r, i) => (
                <div key={r.s.id} className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold ${i === 0 ? "bg-gold-400 text-ink-950" : i === 1 ? "bg-ink-300 text-ink-950" : i === 2 ? "bg-amber-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}>{i + 1}</span>
                  <Avatar first={r.s.first} last={r.s.last} hue={r.s.hue} size={26} photo={photoFor(r.s.id)} />
                  <span className="text-[13px] font-bold truncate flex-1">{r.s.first} {r.s.last}</span>
                  <b className="tnum text-[13px]">{r.avg.toFixed(1)}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3">Grading scale</h3>
            {db.school.grading.map((g) => (
              <div key={g.grade} className="flex items-center gap-3 py-1.5 border-b border-ink-100/60 dark:border-ink-800/60 last:border-0 text-[13px]">
                <span className="w-7 h-7 rounded-md bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300 font-display font-bold flex items-center justify-center">{g.grade}</span>
                <span className="font-semibold">{g.label}</span><b className="ml-auto tnum text-ink-400">≥ {g.min}</b>
              </div>
            ))}
            <p className="text-[11.5px] text-ink-300 font-semibold mt-2.5">Fully configurable in Settings → Academic.</p>
          </div>
        </div>
      </div>
      <span className="hidden">{exam?.id}{todayISO()}</span>
    </div>
  );
}

/* ================= Report cards ================= */
const TEMPLATES = [
  { id: "classic", name: "Classic Navy", head: "#101d38", accent: "#dca638" },
  { id: "royal", name: "Royal Cobalt", head: "#1e49c9", accent: "#101d38" },
  { id: "green", name: "Emerald Crest", head: "#065f46", accent: "#c98f1b" },
];

function ReportCardDoc({ st, examId, tpl, comment, rank, of }: { st: Student; examId: string; tpl: typeof TEMPLATES[number]; comment: string; rank: number; of: number }) {
  const s = useApp();
  const db = s.db;
  const exam = db.exams.find((e) => e.id === examId);
  const c = classOf(db, st);
  const grades = db.grades.filter((g) => g.examId === examId && g.studentId === st.id);
  const avg = grades.length ? grades.reduce((a, b) => a + b.score, 0) / grades.length : 0;
  const gl = gradeLetter(db, avg);
  const days = lastSchoolDays(20);
  const att = Math.round((days.filter((d) => ["P", "L"].includes(attStatus(db, d, st.id))).length / days.length) * 100);
  const passed = grades.filter((g) => g.score >= db.school.passMark).length;
  return (
    <div className="print-card mx-auto max-w-[760px] bg-white text-ink-900 border border-ink-200 rounded-lg overflow-hidden">
      <div className="px-8 py-5 text-white flex items-center gap-4" style={{ background: tpl.head }}>
        <span className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-2xl shrink-0" style={{ background: tpl.accent, color: "#fff" }}>{(db.school.logoText || "V")[0]}</span>
        <div className="flex-1">
          <div className="font-display font-bold text-[19px] leading-tight">{db.school.name}</div>
          <div className="text-[10.5px] tracking-[0.2em] uppercase opacity-80">{db.school.motto}</div>
          <div className="text-[11px] opacity-75 mt-0.5">{db.school.address} · {db.school.phone}</div>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-[15px]">STUDENT REPORT</div>
          <div className="text-[11px] opacity-80">{exam?.name}</div>
          <div className="text-[11px] opacity-80">{db.school.academicYear} · {exam?.term}</div>
        </div>
      </div>
      <div className="px-8 py-4 flex items-center gap-4 border-b border-ink-100">
        <Avatar first={st.first} last={st.last} hue={st.hue} size={54} photo={photoFor(st.id)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 flex-1 text-[12px]">
          <div><span className="text-ink-400 font-bold uppercase text-[9.5px] tracking-wide block">Student</span><b>{st.first} {st.last}</b></div>
          <div><span className="text-ink-400 font-bold uppercase text-[9.5px] tracking-wide block">Reg No</span><b className="font-mono">{st.regNo}</b></div>
          <div><span className="text-ink-400 font-bold uppercase text-[9.5px] tracking-wide block">Class</span><b>{c?.name} {c?.section}</b></div>
          <div><span className="text-ink-400 font-bold uppercase text-[9.5px] tracking-wide block">Position</span><b className="tnum">{rank > 0 ? `${rank} of ${of}` : "—"}</b></div>
        </div>
      </div>
      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr style={{ background: tpl.head, color: "#fff" }}>
            <th className="text-left px-8 py-2 font-bold uppercase text-[10px] tracking-wider">Subject</th>
            <th className="text-center px-3 py-2 font-bold uppercase text-[10px] tracking-wider">Mark /100</th>
            <th className="text-center px-3 py-2 font-bold uppercase text-[10px] tracking-wider">Grade</th>
            <th className="text-left px-8 py-2 font-bold uppercase text-[10px] tracking-wider">Remark</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => {
            const sub = db.subjects.find((x) => x.id === g.subjectId);
            const gg = gradeLetter(db, g.score);
            return (
              <tr key={g.id} className="border-b border-ink-100">
                <td className="px-8 py-2 font-semibold">{sub?.name}</td>
                <td className="text-center px-3 py-2 tnum font-bold">{g.score}</td>
                <td className="text-center px-3 py-2"><span className="inline-block w-7 rounded font-display font-bold" style={{ color: g.score >= db.school.passMark ? tpl.head : "#e11d48" }}>{gg.grade}</span></td>
                <td className="px-8 py-2 text-ink-500">{gg.label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t-2" style={{ borderColor: tpl.head }}>
        {[["Average", `${avg.toFixed(1)}%`], ["Overall grade", `${gl.grade} — ${gl.label}`], ["Attendance", `${att}%`], ["Subjects passed", `${passed}/${grades.length}`]].map(([k, v]) => (
          <div key={k}><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">{k}</div><div className="font-display font-bold text-[15px]" style={{ color: tpl.head }}>{v}</div></div>
        ))}
      </div>
      <div className="px-8 pb-6 grid sm:grid-cols-2 gap-6 text-[12px]">
        <div><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400 mb-1">Class teacher's comment</div><p className="italic text-ink-600">“{comment}”</p><div className="mt-4 border-t border-ink-300 pt-1 text-ink-400 font-semibold">Signature & date</div></div>
        <div><div className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400 mb-1">Principal's comment</div><p className="italic text-ink-600">“A commendable result. We look forward to continued progress.”</p>
          <div className="mt-4 flex items-end justify-between"><div className="border-t border-ink-300 pt-1 text-ink-400 font-semibold flex-1 mr-4">Principal's signature</div>
            <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-[8px] font-extrabold uppercase tracking-wide text-center leading-tight shrink-0" style={{ borderColor: tpl.accent, color: tpl.accent }}>School<br />Stamp</div></div>
        </div>
      </div>
    </div>
  );
}

export function ReportCardsPage() {
  const s = useApp();
  const db = s.db;
  const exams = db.exams.filter((e) => e.status !== "scheduled");
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const [cls, setCls] = useState(db.classes[0]?.id ?? "");
  const [view, setView] = useState<Student | null>(null);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [comment, setComment] = useState("An excellent term — keep up the consistent effort.");
  const ranking = useMemo(() => classRanking(db, examId, cls), [db, examId, cls]);

  return (
    <div>
      <PageHead title="Report cards" sub="Professional, branded, print-ready — generated automatically from entered grades." />
      <div className="flex flex-wrap gap-2.5 mb-4">
        <select className="input !w-auto" value={examId} onChange={(e) => setExamId(e.target.value)} aria-label="Exam">{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <select className="input !w-auto" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Class">{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}</select>
        <div className="flex gap-1.5 items-center ml-auto">
          <span className="text-[12px] font-bold text-ink-400 uppercase tracking-wide mr-1">Template</span>
          {TEMPLATES.map((tp) => (
            <button key={tp.id} onClick={() => setTpl(tp)} title={tp.name} className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${tpl.id === tp.id ? "border-cobalt-500 scale-110" : "border-transparent opacity-70 hover:opacity-100"}`} style={{ background: `linear-gradient(135deg, ${tp.head} 55%, ${tp.accent} 55%)` }} aria-label={tp.name} />
          ))}
        </div>
      </div>
      <div className="panel overflow-hidden">
        {ranking.length === 0 ? <Empty icon="award" title="No grades recorded for this exam in this class" body="Enter grades first — report cards generate automatically." /> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Rank</th><th>Student</th><th>Subjects</th><th>Average</th><th>Grade</th><th className="!text-right">Report card</th></tr></thead>
              <tbody>
                {ranking.map((r, i) => {
                  const gl = gradeLetter(db, r.avg);
                  return (
                    <tr key={r.s.id}>
                      <td><span className={`inline-flex w-7 h-7 rounded-md items-center justify-center text-[12px] font-extrabold ${i === 0 ? "bg-gold-400 text-ink-950" : i < 3 ? "bg-ink-200 dark:bg-ink-700 text-ink-700 dark:text-ink-100" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}>{i + 1}</span></td>
                      <td><span className="flex items-center gap-2.5"><Avatar first={r.s.first} last={r.s.last} hue={r.s.hue} size={30} photo={photoFor(r.s.id)} /><b className="text-[13.5px]">{r.s.first} {r.s.last}</b></span></td>
                      <td className="font-bold tnum">{r.subjects}</td>
                      <td className="font-display font-bold tnum">{r.avg.toFixed(1)}%</td>
                      <td><Chip tone={gl.grade === "A" ? "green" : gl.grade === "F" ? "red" : "blue"}>{gl.grade}</Chip></td>
                      <td className="text-right"><button className="btn-o btn-sm" onClick={() => setView(r.s)}><Ic n="printer" size={14} />Open</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {view && (
        <Modal open onClose={() => setView(null)} title="Report card preview" w="max-w-3xl"
          footer={<>
            <input className="input !w-auto flex-1" value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Teacher comment" />
            <button className="btn-p" onClick={() => window.print()}><Ic n="printer" size={15} />Print / PDF</button>
          </>}>
          <ReportCardDoc st={view} examId={examId} tpl={tpl} comment={comment} rank={ranking.findIndex((r) => r.s.id === view.id) + 1} of={ranking.length} />
          <PrintPortal><ReportCardDoc st={view} examId={examId} tpl={tpl} comment={comment} rank={ranking.findIndex((r) => r.s.id === view.id) + 1} of={ranking.length} /></PrintPortal>
        </Modal>
      )}
      <span className="hidden">{fmtMoney(0, db.school.currency)}</span>
    </div>
  );
}
