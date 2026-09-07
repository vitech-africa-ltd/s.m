import { useApp, me, feeTotal, paidBy, classOf, examAvg, gradeLetter, attStatus, lastSchoolDays } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Avatar, Chip, Ring } from "../components/ui";
import { useT } from "../lib/i18n";

export function StudentPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);
  const cur = db.school.currency;
  
  // Find the student associated with this user
  const st = db.students.find(x => `${x.first} ${x.last}`.toLowerCase() === (user?.name ?? "").toLowerCase()) ?? db.students[0];
  const c = classOf(db, st);
  const total = feeTotal(db, c?.level ?? 1);
  const paid = paidBy(db, st.id);
  const ex = db.exams.find(e => e.status === "completed");
  const avg = ex ? examAvg(db, ex.id, st.id) : 0;
  const gl = gradeLetter(db, avg);
  const days = lastSchoolDays(10);
  const present = days.filter(d => ["P", "L"].includes(attStatus(db, d, st.id))).length;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Student Portal")}</h1>
      
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="panel p-5">
          <div className="text-center">
            <Avatar first={st.first} last={st.last} hue={st.hue} size={84} />
            <h2 className="font-display font-bold text-[20px] mt-3">{st.first} {st.last}</h2>
            <p className="text-[12.5px] text-ink-400 font-semibold">{st.regNo}</p>
            <Chip tone="blue" className="mt-2">{c?.name} {c?.section}</Chip>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 text-center">
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 py-3">
              <div className="font-display font-bold text-lg tnum">{avg ? avg.toFixed(1) : "—"}</div>
              <div className="text-[9.5px] font-extrabold uppercase text-ink-400">Average</div>
            </div>
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 py-3">
              <div className="font-display font-bold text-lg">{gl.grade}</div>
              <div className="text-[9.5px] font-extrabold uppercase text-ink-400">Grade</div>
            </div>
          </div>
          <div className="mt-5">
            <Ring value={Math.round((present / days.length) * 100)} size={100} color="#10b981" />
            <p className="text-[11.5px] text-ink-400 font-bold text-center mt-1">{tt("Attendance")} — 10 {tt("days") ?? "days"}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">{tt("Fees status")}</h3>
            <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-2">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="rounded-lg border border-ink-100 dark:border-ink-800 py-3">
                <div className="font-display font-bold text-[15px] tnum">{total.toLocaleString()}</div>
                <div className="text-[9.5px] font-extrabold uppercase text-ink-400">Total</div>
              </div>
              <div className="rounded-lg border border-ink-100 dark:border-ink-800 py-3">
                <div className="font-display font-bold text-[15px] tnum text-emerald-600">{paid.toLocaleString()}</div>
                <div className="text-[9.5px] font-extrabold uppercase text-ink-400">Paid</div>
              </div>
              <div className="rounded-lg border border-ink-100 dark:border-ink-800 py-3">
                <div className="font-display font-bold text-[15px] tnum text-rose-500">{Math.max(0, total - paid).toLocaleString()}</div>
                <div className="text-[9.5px] font-extrabold uppercase text-ink-400">Balance</div>
              </div>
            </div>
          </div>
          
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">{tt("Recent grades")}</h3>
            <p className="text-ink-400 text-[13px]">{tt("Your grades will appear here")}</p>
          </div>
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
  
  // Find students associated with this parent
  const kids = db.students.filter(x => x.parent.name.includes("Niyonzima")).slice(0, 2);
  const list = kids.length ? kids : db.students.slice(0, 2);
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Parent Portal")}</h1>
      
      <div className="flex gap-2.5 flex-wrap mb-4">
        {list.map((k, i) => (
          <button key={k.id} className="panel !shadow-none px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all hover:border-cobalt-300">
            <Avatar first={k.first} last={k.last} hue={k.hue} size={36} />
            <span className="text-left">
              <b className="block text-[13.5px]">{k.first} {k.last}</b>
              <span className="block text-[11px] text-ink-400">{classOf(db, k)?.name} {classOf(db, k)?.section}</span>
            </span>
          </button>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {list.map((st) => {
          const c = classOf(db, st);
          const total = feeTotal(db, c?.level ?? 1);
          const paid = paidBy(db, st.id);
          return (
            <div key={st.id} className="panel p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar first={st.first} last={st.last} hue={st.hue} size={48} />
                <div>
                  <h3 className="font-display font-bold text-[16px]">{st.first} {st.last}</h3>
                  <p className="text-[12px] text-ink-400">{c?.name} {c?.section}</p>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-3">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} />
              </div>
              <div className="space-y-1.5 text-[12.5px]">
                <div className="flex justify-between"><span className="text-ink-400">Total</span><b className="tnum">{total.toLocaleString()} {cur}</b></div>
                <div className="flex justify-between"><span className="text-ink-400">Paid</span><b className="tnum text-emerald-600">{paid.toLocaleString()} {cur}</b></div>
                <div className="flex justify-between"><span className="text-ink-400">Balance</span><b className={`tnum ${total - paid > 0 ? "text-rose-500" : "text-emerald-600"}`}>{Math.max(0, total - paid).toLocaleString()} {cur}</b></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TeacherPortal({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);
  
  // Find the teacher associated with this user
  const t = db.teachers.find(x => `${x.first} ${x.last}`.toLowerCase() === (user?.name ?? "").toLowerCase()) ?? db.teachers[0];
  const myClasses = db.classes.filter(c => c.teacherId === t.id);
  const mySlots = db.timetable.filter(x => x.teacherId === t.id);
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Teacher Portal")}</h1>
      
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
        <div className="panel p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n="class" /></span>
          <span>
            <span className="block font-display font-bold text-xl tnum">{myClasses.length}</span>
            <span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">My classes</span>
          </span>
        </div>
        <div className="panel p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n="timetable" /></span>
          <span>
            <span className="block font-display font-bold text-xl tnum">{mySlots.length}</span>
            <span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">Periods / week</span>
          </span>
        </div>
        <div className="panel p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n="exams" /></span>
          <span>
            <span className="block font-display font-bold text-xl tnum">{db.exams.filter(e => e.status === "scheduled").length}</span>
            <span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">Upcoming exams</span>
          </span>
        </div>
        <div className="panel p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n="subject" /></span>
          <span>
            <span className="block font-display font-bold text-xl tnum">{t.specialization}</span>
            <span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">Specialization</span>
          </span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("My classes")}</h3>
          </div>
          <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
            {myClasses.map((c) => {
              const n = db.students.filter(x => x.classId === c.id && x.status === "active").length;
              return (
                <div key={c.id} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                  <div className="flex items-center justify-between">
                    <b className="font-display text-[15px]">{c.name} {c.section}</b>
                    <Chip tone="blue">{n} students</Chip>
                  </div>
                  <p className="text-[11.5px] text-ink-400 font-semibold mt-1">Room {c.room}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("My timetable")}</h3>
          </div>
          <div className="px-4 pb-4 space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {mySlots.slice(0, 14).map((sl) => {
              const c = db.classes.find(x => x.id === sl.classId);
              const sub = db.subjects.find(x => x.id === sl.subjectId);
              return (
                <div key={sl.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                  <span className="font-mono font-bold text-[11px] text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"][sl.day]} {sl.start}
                  </span>
                  <b className="flex-1 truncate">{sub?.name}</b>
                  <span className="text-ink-400 whitespace-nowrap">{c?.name} {c?.section} · {sl.room}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
