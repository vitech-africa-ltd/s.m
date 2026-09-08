import { useState } from "react";
import { useApp, me, fmtMoney, feeTotal, paidBy, classOf, examAvg, gradeLetter, attStatus, lastSchoolDays, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Avatar, Chip, Ring, Stat } from "../components/ui";
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
  const balance = total - paid;
  const ex = db.exams.find(e => e.status === "completed");
  const avg = ex ? examAvg(db, ex.id, st.id) : 0;
  const gl = gradeLetter(db, avg);
  const days = lastSchoolDays(10);
  const present = days.filter(d => ["P", "L"].includes(attStatus(db, d, st.id))).length;
  const attendanceRate = Math.round((present / days.length) * 100);
  
  const [activeTab, setActiveTab] = useState<"overview" | "grades" | "attendance" | "fees" | "timetable" | "courses">("overview");
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Student Portal")}</h1>
      
      {/* Profile Card */}
      <div className="panel p-6 mb-5">
        <div className="flex items-center gap-4">
          <Avatar first={st.first} last={st.last} hue={st.hue} size={80} />
          <div className="flex-1">
            <h2 className="font-display font-bold text-[22px]">{st.first} {st.last}</h2>
            <p className="text-ink-400 text-[13px]">{st.regNo} · {c?.name} {c?.section}</p>
            <div className="flex gap-2 mt-2">
              <Chip tone="blue">{tt("Student")}</Chip>
              <Chip tone={st.status === "active" ? "green" : "gray"}>{st.status}</Chip>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Average" value={avg ? Math.round(avg) : 0} sub={gl.grade} icon="grades" tone="blue" />
        <Stat label="Attendance" value={attendanceRate} sub={`${present}/${days.length} days`} icon="attendance" tone="green" />
        <Stat label="Fees paid" value={paid} sub={`${Math.round((paid / total) * 100)}%`} icon="payment" tone="green" money={cur} />
        <Stat label="Balance" value={Math.max(0, balance)} sub={balance > 0 ? tt("Due") : tt("Clear")} icon="coins" tone={balance > 0 ? "red" : "green"} money={cur} />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-fit max-w-full mb-5">
        {[
          { id: "overview", label: "Overview", icon: "dashboard" },
          { id: "grades", label: "Grades", icon: "grades" },
          { id: "attendance", label: "Attendance", icon: "attendance" },
          { id: "fees", label: "Fees", icon: "payment" },
          { id: "timetable", label: "Timetable", icon: "timetable" },
          { id: "courses", label: "Courses", icon: "learn" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id 
                ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-panel" 
                : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
            }`}
          >
            <Ic n={tab.icon} size={15} />{tt(tab.label)}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">{tt("Academic performance")}</h3>
            <div className="flex items-center gap-4">
              <Ring value={avg} size={100} color={avg >= 80 ? "#10b981" : avg >= 60 ? "#dca638" : "#f43f5e"} />
              <div>
                <div className="font-display font-bold text-[24px] tnum">{avg ? avg.toFixed(1) : "—"}</div>
                <div className="text-[12px] text-ink-400">{tt("Average score")}</div>
                <Chip tone={gl.grade === "A" || gl.grade === "B" ? "green" : gl.grade === "C" ? "gold" : "red"} className="mt-2">
                  {gl.grade} - {gl.label}
                </Chip>
              </div>
            </div>
          </div>
          
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">{tt("Attendance rate")}</h3>
            <div className="flex items-center gap-4">
              <Ring value={attendanceRate} size={100} color={attendanceRate >= 90 ? "#10b981" : attendanceRate >= 75 ? "#dca638" : "#f43f5e"} />
              <div>
                <div className="font-display font-bold text-[24px] tnum">{attendanceRate}%</div>
                <div className="text-[12px] text-ink-400">{tt("Last 10 days")}</div>
                <Chip tone={attendanceRate >= 90 ? "green" : attendanceRate >= 75 ? "gold" : "red"} className="mt-2">
                  {present} {tt("present")}
                </Chip>
              </div>
            </div>
          </div>
          
          <div className="panel p-5 lg:col-span-2">
            <h3 className="font-display font-bold text-[16px] mb-3">{tt("Recent announcements")}</h3>
            <div className="space-y-3">
              {db.announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[14px]">{ann.title}</h4>
                    <span className="text-[11px] text-ink-400">{fmtDate(ann.date)}</span>
                  </div>
                  <p className="text-[13px] text-ink-500 dark:text-ink-300">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === "grades" && (
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("My grades")}</h3>
          {ex ? (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{tt("Subject")}</th>
                    <th>{tt("Score")}</th>
                    <th>{tt("Grade")}</th>
                    <th>{tt("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {db.grades.filter(g => g.examId === ex.id && g.studentId === st.id).map((g) => {
                    const subject = db.subjects.find(s => s.id === g.subjectId);
                    const grade = gradeLetter(db, g.score);
                    return (
                      <tr key={g.id}>
                        <td className="font-bold">{subject?.name}</td>
                        <td className="tnum font-bold">{g.score}/100</td>
                        <td>
                          <Chip tone={grade.grade === "A" || grade.grade === "B" ? "green" : grade.grade === "C" ? "gold" : "red"}>
                            {grade.grade}
                          </Chip>
                        </td>
                        <td>
                          <Chip tone={g.score >= db.school.passMark ? "green" : "red"}>
                            {g.score >= db.school.passMark ? tt("Pass") : tt("Fail")}
                          </Chip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-ink-400 text-center py-8">{tt("No grades available yet")}</p>
          )}
        </div>
      )}
      
      {activeTab === "attendance" && (
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Attendance history")}</h3>
          <div className="grid grid-cols-10 gap-2 mb-4">
            {days.map((d, i) => {
              const status = attStatus(db, d, st.id);
              return (
                <div key={d} className="text-center">
                  <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    status === "P" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                    status === "L" ? "bg-gold-100 dark:bg-gold-500/15 text-gold-700 dark:text-gold-300" :
                    status === "A" ? "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300" :
                    "bg-ink-100 dark:bg-ink-800 text-ink-400"
                  }`}>
                    {d.slice(8, 10)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
              <div className="font-display font-bold text-[20px] text-emerald-600">{days.filter(d => attStatus(db, d, st.id) === "P").length}</div>
              <div className="text-[11px] text-ink-400">{tt("Present")}</div>
            </div>
            <div className="rounded-lg bg-gold-50 dark:bg-gold-500/10 p-3 text-center">
              <div className="font-display font-bold text-[20px] text-gold-600">{days.filter(d => attStatus(db, d, st.id) === "L").length}</div>
              <div className="text-[11px] text-ink-400">{tt("Late")}</div>
            </div>
            <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 p-3 text-center">
              <div className="font-display font-bold text-[20px] text-rose-600">{days.filter(d => attStatus(db, d, st.id) === "A").length}</div>
              <div className="text-[11px] text-ink-400">{tt("Absent")}</div>
            </div>
            <div className="rounded-lg bg-ink-50 dark:bg-ink-800 p-3 text-center">
              <div className="font-display font-bold text-[20px]">{attendanceRate}%</div>
              <div className="text-[11px] text-ink-400">{tt("Rate")}</div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === "fees" && (
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Fees status")}</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-ink-500 dark:text-ink-300">{tt("Progress")}</span>
              <span className="font-bold">{Math.round((paid / total) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
              <div className="text-[11px] text-ink-400 mb-1">{tt("Total fees")}</div>
              <div className="font-display font-bold text-[18px] tnum">{fmtMoney(total, cur)}</div>
            </div>
            <div className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
              <div className="text-[11px] text-ink-400 mb-1">{tt("Paid")}</div>
              <div className="font-display font-bold text-[18px] tnum text-emerald-600">{fmtMoney(paid, cur)}</div>
            </div>
            <div className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
              <div className="text-[11px] text-ink-400 mb-1">{tt("Balance")}</div>
              <div className={`font-display font-bold text-[18px] tnum ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {fmtMoney(Math.max(0, balance), cur)}
              </div>
            </div>
          </div>
          
          <h4 className="font-display font-bold text-[15px] mt-6 mb-3">{tt("Payment history")}</h4>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{tt("Date")}</th>
                  <th>{tt("Amount")}</th>
                  <th>{tt("Method")}</th>
                  <th>{tt("Receipt")}</th>
                </tr>
              </thead>
              <tbody>
                {db.payments.filter(p => p.studentId === st.id).slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td className="text-[12px]">{fmtDate(p.date)}</td>
                    <td className="font-bold tnum">{fmtMoney(p.amount, cur)}</td>
                    <td><Chip tone={p.method === "Mobile Money" ? "gold" : p.method === "Cash" ? "green" : "blue"}>{p.method}</Chip></td>
                    <td className="font-mono text-[11px] text-cobalt-600 dark:text-cobalt-400">{p.receipt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === "timetable" && (
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("My timetable")}</h3>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{tt("Day")}</th>
                  <th>{tt("Time")}</th>
                  <th>{tt("Subject")}</th>
                  <th>{tt("Teacher")}</th>
                  <th>{tt("Room")}</th>
                </tr>
              </thead>
              <tbody>
                {db.timetable.filter((t) => t.classId === st.classId).slice(0, 15).map((t) => {
                  const subject = db.subjects.find(s => s.id === t.subjectId);
                  const teacher = db.teachers.find(t2 => t2.id === t.teacherId);
                  return (
                    <tr key={t.id}>
                      <td className="font-bold">{["Mon", "Tue", "Wed", "Thu", "Fri"][t.day]}</td>
                      <td className="tnum text-[12px]">{t.start} - {t.end}</td>
                      <td>{subject?.name}</td>
                      <td>{teacher ? `${teacher.first} ${teacher.last}` : "—"}</td>
                      <td>{t.room}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === "courses" && (
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("My courses")}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Mathematics S6", progress: 75, lessons: 12 },
              { title: "Physics S5", progress: 45, lessons: 10 },
              { title: "Computer Science", progress: 90, lessons: 8 },
            ].map((course, i) => (
              <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                <h4 className="font-display font-bold text-[15px] mb-2">{course.title}</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-ink-400">{course.lessons} lessons</span>
                  <span className="text-[12px] font-bold">{course.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-3">
                  <div className="h-full bg-cobalt-500" style={{ width: `${course.progress}%` }} />
                </div>
                <button className="btn-o btn-sm w-full" onClick={() => nav("/app/elearning")}>
                  {tt("Continue")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [selectedKid, setSelectedKid] = useState(0);
  const st = list[selectedKid];
  
  if (!st) {
    return (
      <div>
        <h1 className="font-display text-[26px] font-bold mb-5">{tt("Parent Portal")}</h1>
        <div className="panel p-8 text-center">
          <Ic n="students" size={48} className="mx-auto mb-4 text-ink-300" />
          <p className="text-ink-400">{tt("No children linked to this account")}</p>
        </div>
      </div>
    );
  }
  
  const c = classOf(db, st);
  const total = feeTotal(db, c?.level ?? 1);
  const paid = paidBy(db, st.id);
  const balance = total - paid;
  const avg = db.exams.find(e => e.status === "completed") ? examAvg(db, db.exams.find(e => e.status === "completed")!.id, st.id) : 0;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Parent Portal")}</h1>
      
      {/* Children Selector */}
      <div className="flex gap-2.5 flex-wrap mb-5">
        {list.map((k, i) => (
          <button
            key={k.id}
            onClick={() => setSelectedKid(i)}
            className={`panel !shadow-none px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all ${
              i === selectedKid ? "!border-cobalt-500 shadow-lift" : "hover:border-cobalt-300"
            }`}
          >
            <Avatar first={k.first} last={k.last} hue={k.hue} size={36} />
            <span className="text-left">
              <b className="block text-[13.5px]">{k.first} {k.last}</b>
              <span className="block text-[11px] text-ink-400">{classOf(db, k)?.name} {classOf(db, k)?.section}</span>
            </span>
          </button>
        ))}
      </div>
      
      {/* Child Overview */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <div className="panel p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar first={st.first} last={st.last} hue={st.hue} size={48} />
            <div>
              <h3 className="font-display font-bold text-[16px]">{st.first} {st.last}</h3>
              <p className="text-[12px] text-ink-400">{c?.name} {c?.section}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Ring value={avg} size={60} color={avg >= 80 ? "#10b981" : avg >= 60 ? "#dca638" : "#f43f5e"} />
            <div>
              <div className="font-display font-bold text-[20px] tnum">{avg ? avg.toFixed(1) : "—"}</div>
              <div className="text-[11px] text-ink-400">{tt("Average")}</div>
            </div>
          </div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("Fees status")}</h4>
          <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-2">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} />
          </div>
          <div className="space-y-1.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-ink-400">{tt("Total")}</span><b className="tnum">{fmtMoney(total, cur)}</b></div>
            <div className="flex justify-between"><span className="text-ink-400">{tt("Paid")}</span><b className="tnum text-emerald-600">{fmtMoney(paid, cur)}</b></div>
            <div className="flex justify-between"><span className="text-ink-400">{tt("Balance")}</span><b className={`tnum ${balance > 0 ? "text-rose-500" : "text-emerald-600"}`}>{fmtMoney(Math.max(0, balance), cur)}</b></div>
          </div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("Recent activity")}</h4>
          <div className="space-y-2">
            {db.payments.filter(p => p.studentId === st.id).slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-[12px]">
                <span className="text-ink-400">{fmtDate(p.date)}</span>
                <span className="font-bold tnum text-emerald-600">{fmtMoney(p.amount, cur)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("Announcements")}</h4>
          <div className="space-y-2">
            {db.announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="text-[12px]">
                <b className="block">{ann.title}</b>
                <span className="text-ink-400">{fmtDate(ann.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed View */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Academic performance")}</h3>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{tt("Subject")}</th>
                  <th>{tt("Score")}</th>
                  <th>{tt("Grade")}</th>
                </tr>
              </thead>
              <tbody>
                {db.grades.filter(g => g.studentId === st.id).slice(0, 6).map((g) => {
                  const subject = db.subjects.find(s => s.id === g.subjectId);
                  const grade = gradeLetter(db, g.score);
                  return (
                    <tr key={g.id}>
                      <td className="font-bold">{subject?.name}</td>
                      <td className="tnum font-bold">{g.score}/100</td>
                      <td>
                        <Chip tone={grade.grade === "A" || grade.grade === "B" ? "green" : grade.grade === "C" ? "gold" : "red"}>
                          {grade.grade}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Contact information")}</h3>
          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-ink-400 mb-1">{tt("Student")}</div>
              <div className="font-bold">{st.first} {st.last}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-400 mb-1">{tt("Class")}</div>
              <div className="font-bold">{c?.name} {c?.section}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-400 mb-1">{tt("Phone")}</div>
              <div className="font-bold">{st.phone || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-400 mb-1">{tt("Email")}</div>
              <div className="font-bold">{st.email || "—"}</div>
            </div>
          </div>
        </div>
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
  const teacher = db.teachers.find(t => `${t.first} ${t.last}`.toLowerCase() === (user?.name ?? "").toLowerCase()) ?? db.teachers[0];
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Teacher Portal")}</h1>
      
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <div className="panel p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar first={teacher.first} last={teacher.last} hue={teacher.hue} size={48} />
            <div>
              <h3 className="font-display font-bold text-[16px]">{teacher.first} {teacher.last}</h3>
              <p className="text-[12px] text-ink-400">{teacher.specialization}</p>
            </div>
          </div>
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span className="text-ink-400">{tt("Phone")}</span><b>{teacher.phone}</b></div>
            <div className="flex justify-between"><span className="text-ink-400">{tt("Email")}</span><b>{teacher.email}</b></div>
          </div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("My classes")}</h4>
          <div className="font-display font-bold text-[24px]">{db.classes.length}</div>
          <div className="text-[11px] text-ink-400">{tt("classes assigned")}</div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("My subjects")}</h4>
          <div className="font-display font-bold text-[24px]">{teacher.subjects.length}</div>
          <div className="text-[11px] text-ink-400">{tt("subjects assigned")}</div>
        </div>
        
        <div className="panel p-5">
          <h4 className="font-display font-bold text-[14px] mb-3">{tt("Quick actions")}</h4>
          <div className="space-y-2">
            <button className="btn-o w-full" onClick={() => nav("/app/attendance")}>
              <Ic n="attendance" size={15} />{tt("Take attendance")}
            </button>
            <button className="btn-o w-full" onClick={() => nav("/app/grades")}>
              <Ic n="grades" size={15} />{tt("Enter grades")}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("My classes")}</h3>
          <div className="space-y-3">
            {db.classes.slice(0, 5).map((cls) => (
              <div key={cls.id} className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[14px]">{cls.name} {cls.section}</h4>
                  <span className="text-[11px] text-ink-400">{tt("Room")} {cls.room}</span>
                </div>
                <div className="text-[12px] text-ink-400">{db.students.filter(s => s.classId === cls.id).length} {tt("students")}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Recent announcements")}</h3>
          <div className="space-y-3">
            {db.announcements.slice(0, 5).map((ann) => (
              <div key={ann.id} className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-[14px]">{ann.title}</h4>
                  <span className="text-[11px] text-ink-400">{fmtDate(ann.date)}</span>
                </div>
                <p className="text-[13px] text-ink-500 dark:text-ink-300">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
