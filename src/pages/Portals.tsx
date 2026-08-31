import { useMemo, useState } from "react";
import { useApp, me, fmtDate, fmtMoney, paidBy, feeTotal, classOf, examAvg, gradeLetter, attStatus, lastSchoolDays, todayISO, attPct, DAYS, PERIODS } from "../lib/data";
import { Ic } from "../components/icons";
import { Avatar, Chip, Ring, Empty } from "../components/ui";
import { PageHead } from "./Dashboard";

function useMyStudent() {
  const s = useApp();
  const u = me(s);
  return s.db.students.find((x) => x.id === u?.linkId) ?? s.db.students[0];
}

export function StudentPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const db = s.db;
  const st = useMyStudent();
  const c = classOf(db, st);
  const cur = db.school.currency;
  const days = lastSchoolDays(15);
  const att = Math.round((days.filter((d) => ["P", "L"].includes(attStatus(db, d, st.id))).length / days.length) * 100);
  const exam = db.exams.find((e) => e.status === "completed")!;
  const grades = db.grades.filter((g) => g.examId === exam.id && g.studentId === st.id);
  const avg = examAvg(db, exam.id, st.id);
  const gl = gradeLetter(db, avg);
  const total = feeTotal(db, c?.level ?? 1); const paid = paidBy(db, st.id);
  const slots = db.timetable.filter((t) => t.classId === st.classId);
  return (
    <div>
      <div className="panel !rounded-2xl overflow-hidden mb-4">
        <div className="bg-ink-950 text-ink-100 px-6 py-6 flex flex-wrap items-center gap-5">
          <Avatar first={st.first} last={st.last} hue={st.hue} size={72} />
          <div className="flex-1 min-w-[200px]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-400">Student portal</div>
            <h1 className="font-display text-[26px] font-bold leading-tight">{st.first} {st.last}</h1>
            <p className="text-[13px] text-ink-300 font-semibold">{st.regNo} · {c?.name} {c?.section} · {db.school.academicYear}</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/[0.07] border border-white/10 px-5 py-3 text-center"><div className="font-display font-bold text-[22px] tnum" style={{ color: avg >= db.school.passMark ? "#34d399" : "#fb7185" }}>{avg ? gl.grade : "—"}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">Term grade</div></div>
            <div className="rounded-xl bg-white/[0.07] border border-white/10 px-5 py-3 text-center"><div className="font-display font-bold text-[22px] tnum">{avg ? avg.toFixed(1) : "—"}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">Average %</div></div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="panel p-5 flex items-center gap-5">
          <Ring value={att} color={att >= 90 ? "#10b981" : "#dca638"} size={96} />
          <div><h3 className="font-display font-bold text-[16px]">My attendance</h3><p className="text-[12.5px] text-ink-400 mt-1">Last 15 school days. Class average today: <b className="text-ink-700 dark:text-ink-100">{attPct(db, todayISO(), st.classId)}%</b>.</p></div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">Fees status</h3>
          <div className="flex justify-between text-[13px] font-semibold"><span>Annual fees</span><b className="tnum">{fmtMoney(total, cur)}</b></div>
          <div className="flex justify-between text-[13px] font-semibold mt-1"><span>Paid</span><b className="tnum text-emerald-600">{fmtMoney(paid, cur)}</b></div>
          <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mt-3"><div className={`h-full barx-anim ${total - paid > 0 ? "bg-gold-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (paid / Math.max(1, total)) * 100)}%` }} /></div>
          <p className={`text-[12.5px] font-bold mt-2 ${total - paid > 0 ? "text-rose-600" : "text-emerald-600"}`}>{total - paid > 0 ? `Balance: ${fmtMoney(total - paid, cur)}` : "Fully paid — well done!"}</p>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">Next exam</h3>
          {db.exams.filter((e) => e.status === "scheduled").map((e) => (
            <div key={e.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
              <b className="text-[13.5px]">{e.name}</b>
              <p className="text-[12px] text-ink-400 font-semibold">{fmtDate(e.date)} · {e.term}</p>
              <Chip tone="amber" className="mt-2"><Ic n="clock" size={11} />{Math.max(0, Math.round((new Date(e.date).getTime() - Date.now()) / 864e5))} days away</Chip>
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel overflow-hidden">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">My results — {exam.name}</h3><button className="btn-o btn-sm" onClick={() => nav("/app/reportcards")}><Ic n="award" size={14} />Report card</button></div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Subject</th><th className="!text-center">Mark</th><th>Grade</th></tr></thead>
              <tbody>
                {grades.map((g) => {
                  const sub = db.subjects.find((x) => x.id === g.subjectId);
                  const gg = gradeLetter(db, g.score);
                  return <tr key={g.id}><td className="font-semibold text-[13px]">{sub?.name}</td><td className="text-center font-display font-bold tnum">{g.score}</td><td><Chip tone={g.score >= db.school.passMark ? "green" : "red"}>{gg.grade}</Chip></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">My timetable</h3><Chip tone="blue">Room {c?.room}</Chip></div>
          <div className="overflow-x-auto">
            <table className="tbl !text-[12px]">
              <thead><tr><th>Time</th>{DAYS.map((d) => <th key={d} className="!text-center">{d.slice(0, 3)}</th>)}</tr></thead>
              <tbody>
                {PERIODS.slice(0, 5).map((per, p) => (
                  <tr key={p}>
                    <td className="font-mono font-bold text-[10.5px] text-ink-400 whitespace-nowrap">{per[0]}</td>
                    {DAYS.map((_, d) => {
                      const sl = slots.find((x) => x.day === d && x.start === per[0]);
                      const sub = sl ? db.subjects.find((x) => x.id === sl.subjectId) : null;
                      return <td key={d} className="text-center">{sub ? <span className="inline-block rounded bg-cobalt-50 dark:bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300 font-bold px-2 py-1 text-[10.5px]">{sub.code}</span> : <span className="text-ink-200">—</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="panel p-5 mt-4">
        <h3 className="font-display font-bold text-[16px] mb-3">Announcements</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {db.announcements.slice(0, 4).map((a) => (
            <div key={a.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3"><b className="text-[13.5px]">{a.title}</b><p className="text-[12.5px] text-ink-400 mt-1">{fmtDate(a.date)} · {a.audience}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ParentPortal() {
  const s = useApp();
  const db = s.db;
  const u = me(s);
  const cur = db.school.currency;
  const kids = useMemo(() => { const primary = db.students.find((x) => x.id === u?.linkId); const sib = db.students.find((x) => x.id !== primary?.id && x.parent.name === primary?.parent.name && x.status === "active"); return [primary, sib].filter(Boolean) as typeof db.students; }, [db.students, u]);
  const [sel, setSel] = useState(0);
  const st = kids[Math.min(sel, kids.length - 1)];
  if (!st) return <Empty icon="students" title="No children linked to this account" />;
  const c = classOf(db, st);
  const days = lastSchoolDays(15);
  const att = Math.round((days.filter((d) => ["P", "L"].includes(attStatus(db, d, st.id))).length / days.length) * 100);
  const exam = db.exams.find((e) => e.status === "completed")!;
  const avg = examAvg(db, exam.id, st.id);
  const gl = gradeLetter(db, avg);
  const total = feeTotal(db, c?.level ?? 1); const paid = paidBy(db, st.id);
  const recentPays = db.payments.filter((p) => p.studentId === st.id).slice(0, 4);
  return (
    <div>
      <PageHead title={`Welcome, ${u?.name}`} sub="Your children's progress, attendance and fees at a glance.">
        {kids.length > 1 && (
          <div className="panel !shadow-none p-1 flex gap-1">
            {kids.map((k, i) => <button key={k.id} onClick={() => setSel(i)} className={`px-4 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${sel === i ? "bg-cobalt-600 text-white" : "text-ink-400"}`}>{k.first}</button>)}
          </div>
        )}
      </PageHead>
      <div className="panel !rounded-2xl p-6 mb-4 flex flex-wrap items-center gap-5">
        <Avatar first={st.first} last={st.last} hue={st.hue} size={64} />
        <div className="flex-1 min-w-[180px]">
          <h2 className="font-display text-[22px] font-bold">{st.first} {st.last}</h2>
          <p className="text-[13px] text-ink-400 font-semibold">{st.regNo} · {c?.name} {c?.section} · Class teacher: {db.teachers.find((t) => t.id === c?.teacherId)?.first} {db.teachers.find((t) => t.id === c?.teacherId)?.last}</p>
        </div>
        <div className="flex gap-3">
          {[["Average", avg ? `${avg.toFixed(1)}%` : "—"], ["Grade", avg ? gl.grade : "—"], ["Attendance", `${att}%`]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-5 py-3 text-center"><div className="font-display font-bold text-[20px] tnum">{v}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">{k}</div></div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">Fees & balance</h3>
          <div className="flex justify-between text-[13px] font-semibold"><span>Annual fees</span><b className="tnum">{fmtMoney(total, cur)}</b></div>
          <div className="flex justify-between text-[13px] font-semibold mt-1"><span>Paid</span><b className="tnum text-emerald-600">{fmtMoney(paid, cur)}</b></div>
          <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mt-3"><div className={`h-full barx-anim ${total - paid > 0 ? "bg-gold-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (paid / Math.max(1, total)) * 100)}%` }} /></div>
          <p className={`text-[12.5px] font-bold mt-2 ${total - paid > 0 ? "text-rose-600" : "text-emerald-600"}`}>{total - paid > 0 ? `Please clear ${fmtMoney(total - paid, cur)}` : "No balance — thank you!"}</p>
          <div className="mt-4 space-y-1.5">
            {recentPays.map((p) => <div key={p.id} className="flex items-center justify-between text-[12px] rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2"><span className="font-mono font-bold text-[11px] text-cobalt-600 dark:text-cobalt-300">{p.receipt}</span><span className="text-ink-400">{fmtDate(p.date)}</span><b className="tnum">{fmtMoney(p.amount, cur)}</b></div>)}
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">Latest results</h3>
          {db.grades.filter((g) => g.examId === exam.id && g.studentId === st.id).slice(0, 7).map((g) => {
            const sub = db.subjects.find((x) => x.id === g.subjectId);
            const gg = gradeLetter(db, g.score);
            return (
              <div key={g.id} className="flex items-center gap-3 py-1.5 border-b border-ink-100/60 dark:border-ink-800/60 last:border-0 text-[13px]">
                <span className="font-semibold flex-1 truncate">{sub?.name}</span>
                <div className="w-24 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className={`h-full ${g.score >= db.school.passMark ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${g.score}%` }} /></div>
                <b className="tnum w-8 text-right">{g.score}</b>
                <Chip tone={g.score >= db.school.passMark ? "green" : "red"}>{gg.grade}</Chip>
              </div>
            );
          })}
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">School announcements</h3>
          <div className="space-y-2.5">
            {db.announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                <b className="text-[13px] block leading-snug">{a.title}</b>
                <p className="text-[11.5px] text-ink-400 mt-1">{fmtDate(a.date)} · {a.audience}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 px-4 py-3 mt-3 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 flex gap-2">
            <Ic n="whatsapp" size={15} className="shrink-0 mt-0.5" />You receive absence alerts, payment confirmations and exam reminders on WhatsApp & SMS.
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const db = s.db;
  const u = me(s);
  const t = db.teachers.find((x) => x.id === u?.linkId) ?? db.teachers[0];
  const mySlots = db.timetable.filter((x) => x.teacherId === t.id);
  const myClasses = [...new Set(mySlots.map((x) => x.classId))].map((id) => db.classes.find((c) => c.id === id)!).filter(Boolean);
  const mySubjects = db.subjects.filter((x) => x.teacherIds.includes(t.id));
  const myStudents = db.students.filter((x) => myClasses.some((c) => c.id === x.classId) && x.status === "active");
  return (
    <div>
      <div className="panel !rounded-2xl bg-ink-950 !text-ink-100 !border-ink-800 p-6 mb-4 flex flex-wrap items-center gap-5">
        <Avatar first={t.first} last={t.last} hue={t.hue} size={64} />
        <div className="flex-1 min-w-[200px]">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-400">Teacher portal</div>
          <h1 className="font-display text-[24px] font-bold">{t.first} {t.last}</h1>
          <p className="text-[13px] text-ink-300 font-semibold">{t.specialization} · {t.empNo} · you can access only your assigned classes.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="btn-gold" onClick={() => nav("/app/attendance")}><Ic n="attendance" size={15} />Take attendance</button>
          <button className="btn-o !bg-white/[0.07] !border-white/15 !text-white" onClick={() => nav("/app/grades")}><Ic n="grades" size={15} />Enter grades</button>
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
        {[["My classes", myClasses.length, "class"], ["My students", myStudents.length, "students"], ["Subjects", mySubjects.length, "subject"], ["Periods / week", mySlots.length, "timetable"]].map(([l, v, ic]) => (
          <div key={l as string} className="panel p-4 flex items-center gap-3.5"><span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n={ic as string} /></span><div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{l}</div><div className="font-display text-[20px] font-bold tnum">{v}</div></div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">My classes</h3>
          <div className="space-y-2.5">
            {myClasses.slice(0, 6).map((c) => {
              const n = db.students.filter((x) => x.classId === c.id && x.status === "active").length;
              return (
                <button key={c.id} onClick={() => nav("/app/attendance")} className="w-full flex items-center gap-3.5 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3 hover:border-cobalt-400 transition-colors text-left cursor-pointer">
                  <span className="w-10 h-10 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[13px]">{c.name[0]}{c.level}{c.section}</span>
                  <span className="flex-1"><b className="block text-[13.5px]">{c.name} — Section {c.section}</b><span className="text-[11.5px] text-ink-400 font-semibold">Room {c.room} · {n} students</span></span>
                  <Ic n="chevR" size={15} className="text-ink-300" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-3">Today's schedule</h3>
          <div className="space-y-2">
            {mySlots.filter((x) => x.day === (new Date().getDay() + 6) % 7).slice(0, 7).map((sl) => {
              const sub = db.subjects.find((x) => x.id === sl.subjectId);
              const c = db.classes.find((x) => x.id === sl.classId);
              return (
                <div key={sl.id} className="flex items-center gap-3.5 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-2.5">
                  <span className="font-mono text-[11.5px] font-bold text-cobalt-600 dark:text-cobalt-300 w-14">{sl.start}</span>
                  <span className="font-semibold text-[13.5px] flex-1">{sub?.name}</span>
                  <Chip tone="blue">{c?.name} {c?.section}</Chip>
                  <span className="text-[11.5px] text-ink-400 font-bold">{sl.room}</span>
                </div>
              );
            })}
            {mySlots.filter((x) => x.day === (new Date().getDay() + 6) % 7).length === 0 && <p className="text-[13px] text-ink-300 font-semibold py-4 text-center">No periods today — enjoy the free day.</p>}
          </div>
          <h3 className="font-display font-bold text-[16px] mt-5 mb-2">Announcements for staff</h3>
          {db.announcements.filter((a) => a.audience.includes("teacher") || a.audience === "Everyone").slice(0, 2).map((a) => (
            <div key={a.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-2.5 mb-2"><b className="text-[13px]">{a.title}</b><p className="text-[11.5px] text-ink-400">{fmtDate(a.date)}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
