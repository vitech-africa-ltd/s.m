import { useMemo, useState } from "react";
import { useApp, me, fmtDate, fmtMoney, paidBy, feeTotal, classOf, examAvg, gradeLetter, attStatus, lastSchoolDays, todayISO, attPct, DAYS, PERIODS } from "../lib/data";
import { Ic } from "../components/icons";
import { Avatar, Chip, Ring, Empty } from "../components/ui";
import { photoFor } from "../lib/media";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

export function StudentPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const user = me(s);
  const st = db.students.find((x) => `${x.first} ${x.last}`.toLowerCase() === (user?.name ?? "").toLowerCase()) ?? db.students[0];
  const c = classOf(db, st);
  const lvl = c?.level ?? 1;
  const total = feeTotal(db, lvl);
  const paid = paidBy(db, st.id);
  const ex = db.exams.find((e) => e.status === "completed");
  const avg = ex ? examAvg(db, ex.id, st.id) : 0;
  const gl = gradeLetter(db, avg);
  const days = lastSchoolDays(10);
  const present = days.filter((d) => ["P", "L"].includes(attStatus(db, d, st.id))).length;
  const grades = ex ? db.grades.filter((g) => g.examId === ex.id && g.studentId === st.id) : [];
  const mySlots = db.timetable.filter((t) => t.classId === st.classId);
  const [tab, setTab] = useState<"grades" | "timetable" | "fees">("grades");
  return (
    <div>
      <PageHead title="Student portal" sub={`Welcome back, ${st.first}`} />
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="panel p-5 h-fit">
          <div className="text-center">
            <Avatar first={st.first} last={st.last} hue={st.hue} size={84} photo={photoFor(st.id)} />
            <h2 className="font-display font-bold text-[20px] mt-3">{st.first} {st.last}</h2>
            <p className="text-[12.5px] text-ink-400 font-semibold">{st.regNo}</p>
            <Chip tone="blue" className="mt-2">{c?.name} {c?.section}</Chip>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 text-center">
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 py-3"><div className="font-display font-bold text-lg tnum">{avg ? avg.toFixed(1) : "—"}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Average</div></div>
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 py-3"><div className="font-display font-bold text-lg">{gl.grade}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Grade</div></div>
          </div>
          <div className="mt-5"><Ring value={Math.round((present / days.length) * 100)} size={100} color="#10b981" /><p className="text-[11.5px] text-ink-400 font-bold text-center mt-1">{tt("Attendance")} — 10 {tt("days") ?? "days"}</p></div>
        </div>
        <div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {([["grades", "My results", "grades"], ["timetable", "My timetable", "timetable"], ["fees", "Fees status", "fees"]] as const).map(([id, label, ic]) => (
              <button key={id} onClick={() => setTab(id)} className={`chip !py-2.5 !px-4 cursor-pointer transition-all ${tab === id ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}><Ic n={ic} size={14} />{tt(label)}</button>
            ))}
          </div>
          {tab === "grades" && (
            <div className="panel overflow-hidden">
              <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{ex?.name}</h3><Chip tone="green">Average {avg ? avg.toFixed(1) : "—"}%</Chip></div>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Subject</th><th className="!text-center">Mark</th><th>Grade</th></tr></thead>
                  <tbody>
                    {grades.map((g) => {
                      const sub = db.subjects.find((x) => x.id === g.subjectId);
                      const gg = gradeLetter(db, g.score);
                      return <tr key={g.id}><td className="font-semibold">{sub?.name}</td><td className="text-center font-display font-bold tnum">{g.score}</td><td><Chip tone={gg.grade === "A" ? "green" : gg.grade === "F" ? "red" : "blue"}>{gg.grade} · {gg.label}</Chip></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4"><button className="btn-o btn-sm" onClick={() => nav("/app/reportcards")}><Ic n="award" size={14} />View report card</button></div>
            </div>
          )}
          {tab === "timetable" && (
            <div className="panel overflow-x-auto">
              <table className="tbl !text-[12.5px]">
                <thead><tr><th>Time</th>{DAYS.map((d) => <th key={d} className="!text-center">{d}</th>)}</tr></thead>
                <tbody>
                  {PERIODS.map((per, p) => (
                    <tr key={p}>
                      <td className="font-mono font-bold text-[11px] text-ink-400 whitespace-nowrap">{per[0]}<br />{per[1]}</td>
                      {DAYS.map((_, day) => {
                        const slot = mySlots.find((t) => t.day === day && t.start === per[0]);
                        const sub = slot && db.subjects.find((x) => x.id === slot.subjectId);
                        return <td key={day} className="!p-1.5 min-w-[110px]">{slot ? <div className="rounded-lg px-2.5 py-2 bg-cobalt-50 border border-cobalt-100 dark:bg-cobalt-500/10 dark:border-cobalt-900 text-[11.5px]"><b className="block">{sub?.name}</b><span className="text-[10px] text-ink-300 font-bold">{slot.room}</span></div> : null}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "fees" && (
            <div className="panel p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-[16px]">{tt("Fees status")}</h3><Chip tone={paid >= total ? "green" : "amber"}>{paid >= total ? "Fully paid" : "Balance due"}</Chip></div>
              <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-2"><div className="h-full bg-emerald-500 barx-anim" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} /></div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[["Annual fees", fmtMoney(total, cur)], ["Paid", fmtMoney(paid, cur)], ["Balance", fmtMoney(Math.max(0, total - paid), cur)]].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-ink-100 dark:border-ink-800 py-3"><div className="font-display font-bold text-[15px] tnum">{v}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">{k}</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentPortal() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const kids = db.students.filter((x) => x.parent.name.includes("Niyonzima")).slice(0, 2);
  const list = kids.length ? kids : db.students.slice(0, 2);
  const [sel, setSel] = useState(0);
  const st = list[Math.min(sel, list.length - 1)];
  const c = st ? classOf(db, st) : undefined;
  const ex = db.exams.find((e) => e.status === "completed");
  return (
    <div>
      <PageHead title="Parent portal" sub={tt("My children")} />
      <div className="flex gap-2.5 flex-wrap mb-4">
        {list.map((k, i) => (
          <button key={k.id} onClick={() => setSel(i)} className={`panel !shadow-none px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all ${i === sel ? "!border-cobalt-500 shadow-lift" : "hover:border-cobalt-300"}`}>
            <Avatar first={k.first} last={k.last} hue={k.hue} size={36} photo={photoFor(k.id)} />
            <span className="text-left"><b className="block text-[13.5px]">{k.first} {k.last}</b><span className="block text-[11px] text-ink-400">{classOf(db, k)?.name} {classOf(db, k)?.section}</span></span>
          </button>
        ))}
      </div>
      {st ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="panel p-5 text-center">
            <Avatar first={st.first} last={st.last} hue={st.hue} size={72} photo={photoFor(st.id)} />
            <h3 className="font-display font-bold text-[18px] mt-3">{st.first} {st.last}</h3>
            <p className="text-[12px] text-ink-400 font-semibold">{st.regNo} · {c?.name} {c?.section}</p>
            <p className="text-[12px] text-ink-400 mt-1">{tt("Attendance today")}: <b className={["P", "L"].includes(attStatus(db, todayISO(), st.id)) ? "text-emerald-600" : "text-rose-500"}>{["P", "L"].includes(attStatus(db, todayISO(), st.id)) ? tt("Present") : tt("Absent")}</b></p>
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="grades" size={15} className="text-cobalt-500" />{tt("Their grades")}</h3>
            {ex ? (
              <>
                <div className="text-center py-2"><div className="font-display font-bold text-[34px] tnum">{examAvg(db, ex.id, st.id).toFixed(1)}%</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">{ex.name}</div></div>
                <div className="space-y-1.5 mt-2">
                  {db.grades.filter((g) => g.examId === ex.id && g.studentId === st.id).slice(0, 4).map((g) => {
                    const sub = db.subjects.find((x) => x.id === g.subjectId);
                    return <div key={g.id} className="flex justify-between text-[12.5px]"><span className="text-ink-500 dark:text-ink-300">{sub?.name}</span><b className="tnum">{g.score}</b></div>;
                  })}
                </div>
              </>
            ) : <Empty icon="grades" title="No grades yet" />}
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="fees" size={15} className="text-gold-500" />{tt("Fees status")}</h3>
            {(() => {
              const total = feeTotal(db, c?.level ?? 1); const paid = paidBy(db, st.id);
              return (
                <>
                  <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-3"><div className="h-full bg-emerald-500 barx-anim" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} /></div>
                  <div className="space-y-1.5 text-[12.5px]">
                    <div className="flex justify-between"><span className="text-ink-400">Annual fees</span><b className="tnum">{fmtMoney(total, cur)}</b></div>
                    <div className="flex justify-between"><span className="text-ink-400">Paid</span><b className="tnum text-emerald-600">{fmtMoney(paid, cur)}</b></div>
                    <div className="flex justify-between"><span className="text-ink-400">Balance</span><b className={`tnum ${total - paid > 0 ? "text-rose-500" : "text-emerald-600"}`}>{fmtMoney(Math.max(0, total - paid), cur)}</b></div>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2"><Ic n="megaphone" size={15} className="text-rose-500" />{tt("School news")}</h3>
            <div className="space-y-2.5">
              {db.announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5">
                  <b className="block text-[12.5px] leading-snug">{a.title}</b>
                  <span className="block text-[11px] text-ink-400 mt-0.5">{fmtDate(a.date)} · {a.audience}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : <Empty icon="students" title="No children linked" />}
      <span className="hidden">{attPct(db, todayISO())}</span>
    </div>
  );
}

export function TeacherPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);
  const t = db.teachers.find((x) => `${x.first} ${x.last}`.toLowerCase() === (user?.name ?? "").toLowerCase()) ?? db.teachers[0];
  const myClasses = db.classes.filter((c) => c.teacherId === t.id);
  const myStudents = useMemo(() => db.students.filter((x) => myClasses.some((c) => c.id === x.classId) && x.status === "active"), [db.students, myClasses]);
  const mySlots = db.timetable.filter((x) => x.teacherId === t.id);
  return (
    <div>
      <PageHead title="Teacher portal" sub={`${t.specialization} · ${myClasses.length} ${tt("Classes").toLowerCase()}`} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
        {[["My classes", myClasses.length, "class", "/app/classes"], ["My students", myStudents.length, "students", "/app/students"], ["Periods / week", mySlots.length, "timetable", "/app/timetable"], ["Exams to grade", db.exams.filter((e) => e.status === "scheduled").length, "exams", "/app/exams"]].map(([l, v, ic, to]) => (
          <button key={l as string} onClick={() => nav(to as string)} className="panel p-4 flex items-center gap-3.5 hover:shadow-lift hover:-translate-y-0.5 transition-all text-left cursor-pointer group">
            <span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center group-hover:bg-cobalt-600 group-hover:text-white transition-colors"><Ic n={ic as string} /></span>
            <span><span className="block font-display font-bold text-xl tnum">{v}</span><span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">{l}</span></span>
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("My classes")}</h3><button className="btn-g btn-sm" onClick={() => nav("/app/attendance")}>{tt("Mark attendance")}<Ic n="chevR" size={13} /></button></div>
          <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
            {myClasses.map((c) => {
              const n = db.students.filter((x) => x.classId === c.id && x.status === "active").length;
              return (
                <div key={c.id} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 hover:border-cobalt-300 dark:hover:border-cobalt-700 transition-colors">
                  <div className="flex items-center justify-between"><b className="font-display text-[15px]">{c.name} {c.section}</b><Chip tone="blue">{n} {tt("students")}</Chip></div>
                  <p className="text-[11.5px] text-ink-400 font-semibold mt-1">Room {c.room} · {db.subjects.find((x) => x.teacherIds.includes(t.id))?.name ?? t.specialization}</p>
                </div>
              );
            })}
            {myClasses.length === 0 && <p className="text-[12.5px] text-ink-400 col-span-2">No class teacher assignment yet — you teach {mySlots.length} periods across the school.</p>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("My timetable")}</h3><Chip tone="navy">{mySlots.length} {tt("periods") ?? "periods"}</Chip></div>
          <div className="px-4 pb-4 space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {mySlots.slice(0, 14).map((sl) => {
              const c = db.classes.find((x) => x.id === sl.classId);
              const sub = db.subjects.find((x) => x.id === sl.subjectId);
              return (
                <div key={sl.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                  <span className="font-mono font-bold text-[11px] text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{DAYS[sl.day].slice(0, 3)} {sl.start}</span>
                  <b className="flex-1 truncate">{sub?.name}</b>
                  <span className="text-ink-400 whitespace-nowrap">{c?.name} {c?.section} · {sl.room}</span>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button className="btn-p btn-sm flex-1" onClick={() => nav("/app/grades")}><Ic n="grades" size={14} />{tt("Enter grades")}</button>
            <button className="btn-o btn-sm flex-1" onClick={() => nav("/app/attendance")}><Ic n="attendance" size={14} />{tt("Mark attendance")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
