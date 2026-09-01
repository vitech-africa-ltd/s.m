import { useMemo } from "react";
import { useApp, me, fmtMoney, fmtNum, attPct, attStatus, todayISO, feeTotal, paidBy, classOf, monthKeys, monthLabel, fmtDateShort, uiLocale } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, AreaChart, DuoBars, Donut, Ring, HBars, Avatar, Reveal, Chip } from "../components/ui";
import { useT } from "../lib/i18n";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  const tt = useT();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">{tt(title)}</h1>
        {sub && <p className="text-[13.5px] text-ink-400 mt-0.5">{tt(sub)}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export default function Dashboard({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);
  const cur = db.school.currency;
  const today = todayISO();

  const d = useMemo(() => {
    const active = db.students.filter((x) => x.status === "active");
    const outstanding = active.reduce((a, x) => a + Math.max(0, feeTotal(db, classOf(db, x)?.level ?? 1) - paidBy(db, x.id)), 0);
    const unpaidCount = active.filter((x) => paidBy(db, x.id) < feeTotal(db, classOf(db, x)?.level ?? 1)).length;
    const payToday = db.payments.filter((p) => p.date === today).reduce((a, b) => a + b.amount, 0);
    const mk = monthKeys(8);
    const revBy = mk.map((m) => db.payments.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
    const expBy = mk.map((m) => db.expenses.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
    const mRev = revBy[revBy.length - 1];
    const mExp = expBy[expBy.length - 1];
    const att = attPct(db, today);
    const statuses = { P: 0, L: 0, A: 0, E: 0 } as Record<string, number>;
    active.forEach((x) => { statuses[attStatus(db, today, x.id)]++; });
    const enroll = mk.map((m) => db.students.filter((x) => x.admitted.startsWith(m)).length);
    const byClass = db.classes.map((c) => ({ label: `${c.name.slice(0, 2)}${c.level} ${c.section}`, value: db.students.filter((x) => x.classId === c.id).reduce((a, x) => a + Math.min(paidBy(db, x.id), feeTotal(db, c.level)), 0) })).sort((a, b) => b.value - a.value).slice(0, 6);
    const recentAdm = [...db.students].sort((a, b) => b.admitted.localeCompare(a.admitted)).slice(0, 5);
    return { active: active.length, outstanding, unpaidCount, payToday, mk, revBy, expBy, mRev, mExp, att, statuses, enroll, byClass, recentAdm };
  }, [db, today]);

  const events = db.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const kindTone: Record<string, "blue" | "gold" | "green" | "red" | "amber"> = { exam: "red", holiday: "green", meeting: "blue", sports: "gold", event: "amber", graduation: "gold" };

  return (
    <div>
      {db.school.onboarded === false && (
        <div className="panel mb-5 p-4 flex flex-wrap items-center gap-3.5 !border-gold-300 dark:!border-gold-700 bg-gold-50/60 dark:bg-gold-500/[0.06]">
          <span className="w-10 h-10 rounded-xl bg-gold-400 text-ink-950 flex items-center justify-center shrink-0"><Ic n="sparkles" size={18} /></span>
          <div className="min-w-[200px] flex-1">
            <b className="block font-display text-[15px]">Finish setting up {db.school.name}</b>
            <span className="text-[12.5px] text-ink-500 dark:text-ink-300">Run the 8-step wizard to configure classes, subjects, teachers, students and fees.</span>
          </div>
          <button className="btn-gold btn-sm" onClick={() => nav("/app/setup")}>{tt("Setup wizard")}<Ic n="chevR" size={14} /></button>
        </div>
      )}
      <div className="relative overflow-hidden panel !rounded-2xl p-6 mb-5 bg-ink-950 !text-ink-100 !border-ink-800">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-400">{db.school.motto}</div>
            <h1 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight mt-1">
              {new Date().getHours() < 12 ? tt("Good morning") : tt("Good afternoon")}, {user?.name.split(" ")[0]}
            </h1>
            <p className="text-[13.5px] text-ink-300 mt-1">{tt("Here's what's happening at")} {db.school.name} {tt("today")} — {new Date().toLocaleDateString(uiLocale(), { weekday: "long", day: "numeric", month: "long" })}.</p>
          </div>
          <div className="flex gap-2.5">
            <button className="btn-gold" onClick={() => nav("/app/students")}><Ic n="userplus" size={16} />{tt("New admission")}</button>
            <button className="btn-o !bg-white/[0.06] !border-white/15 !text-white hover:!border-gold-400 hover:!text-gold-300" onClick={() => nav("/app/payments")}><Ic n="payment" size={16} />{tt("Record payment")}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total students" value={db.students.length} sub={`${fmtNum(d.active)} ${tt("active")}`} icon="students" />
        <Stat label="Teachers" value={db.teachers.length} sub={`${db.teachers.filter((x) => x.status === "active").length} ${tt("on duty")}`} icon="teacher" tone="navy" />
        <Stat label="Attendance today" value={d.att} sub={`${d.statuses.A} ${tt("absent")} · ${d.statuses.L} ${tt("late")}`} icon="attendance" tone="green" count />
        <Stat label="Classes" value={db.classes.length} sub={`${db.subjects.length} ${tt("subjects")}`} icon="class" tone="gold" />
        <Stat label="Payments today" value={d.payToday} money={cur} icon="payment" tone="green" />
        <Stat label="Monthly revenue" value={d.mRev} money={cur} sub={`▲ vs ${fmtMoney(d.revBy[d.revBy.length - 2], "")}`} icon="coins" />
        <Stat label="Pending fees" value={d.outstanding} money={cur} sub={`${d.unpaidCount} ${tt("unpaid students")}`} icon="alert" tone="red" />
        <Stat label="Net position" value={d.mRev - d.mExp} money={cur} sub={`${tt("Expenses")} ${fmtMoney(d.mExp, cur)}`} icon="analytics" tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Reveal className="lg:col-span-2">
          <div className="panel h-full">
            <div className="panel-h">
              <div><h3 className="font-display font-bold text-[16px]">{tt("Revenue vs Expenses")}</h3><p className="text-[12px] text-ink-400">{tt("Last 8 months")} · {cur}</p></div>
              <Chip tone="green">+{Math.round(((d.mRev - d.mExp) / Math.max(1, d.mRev)) * 100)}% {tt("margin")}</Chip>
            </div>
            <div className="px-5 pb-5"><DuoBars data={d.mk.map((m, i) => ({ label: monthLabel(m), a: Math.round(d.revBy[i] / 1000), b: Math.round(d.expBy[i] / 1000) }))} aLabel={tt("Revenue vs Expenses").split(" ")[0]} bLabel={tt("Expenses")} money="K" /></div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel h-full">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Attendance today")}</h3><Chip tone="blue">{d.active} {tt("students")}</Chip></div>
            <div className="px-5 pb-5 flex justify-center">
              <Donut label={`${d.att}%`} sub={tt("present")} segments={[
                { value: d.statuses.P, color: "#10b981", name: tt("Present") },
                { value: d.statuses.L, color: "#dca638", name: tt("Late") },
                { value: d.statuses.A, color: "#f43f5e", name: tt("Absent") },
                { value: d.statuses.E, color: "#6f90c2", name: tt("Excused") },
              ]} />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Reveal>
          <div className="panel h-full">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Student enrollment")}</h3><Ic n="arrowUR" className="text-cobalt-500" /></div>
            <div className="px-5 pb-5"><AreaChart data={d.enroll.map((x) => x || 1)} labels={d.mk.map(monthLabel)} h={110} id="enroll" /></div>
          </div>
        </Reveal>
        <Reveal delay={70}>
          <div className="panel h-full">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Fee collection")}</h3><button className="btn-g btn-sm" onClick={() => nav("/app/finreports")}>{tt("Report")}<Ic n="chevR" size={13} /></button></div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-4 mb-4">
                <Ring value={Math.min(100, Math.round((db.payments.reduce((a, b) => a + b.amount, 0) / Math.max(1, db.students.filter((x) => x.status === "active").reduce((a, x) => a + feeTotal(db, classOf(db, x)?.level ?? 1), 0))) * 100))} size={92} color="#c98f1b" />
                <div className="text-[13px] space-y-1.5">
                  <p className="font-bold">{tt("of annual fees collected")}</p>
                  <p className="text-ink-400 text-[12.5px]">{fmtMoney(d.outstanding, cur)} {tt("still outstanding across")} <b className="text-rose-500">{d.unpaidCount} {tt("students")}</b></p>
                </div>
              </div>
              <HBars rows={d.byClass.map((c, i) => ({ ...c, value: Math.round(c.value / 1000), color: ["#1e49c9", "#2b5ce9", "#4f7df3", "#dca638", "#c98f1b", "#6f90c2"][i] }))} money="K" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="panel h-full">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Upcoming events")}</h3><button className="btn-g btn-sm" onClick={() => nav("/app/calendar")}>{tt("Calendar")}<Ic n="chevR" size={13} /></button></div>
            <div className="px-3 pb-4">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-950/60 transition-colors">
                  <div className="w-11 text-center shrink-0 rounded-lg bg-ink-100 dark:bg-ink-800 py-1.5">
                    <div className="font-display font-bold text-[15px] leading-none tnum">{e.date.slice(8, 10)}</div>
                    <div className="text-[9px] font-extrabold uppercase tracking-wide text-ink-400">{fmtDateShort(e.date).split(" ")[1]}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold truncate">{e.title}</p>
                    {e.note && <p className="text-[11.5px] text-ink-400 truncate">{e.note}</p>}
                  </div>
                  <Chip tone={kindTone[e.kind] ?? "gray"} className="ml-auto">{e.kind}</Chip>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Reveal className="lg:col-span-2">
          <div className="panel">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Recent payments")}</h3><button className="btn-g btn-sm" onClick={() => nav("/app/payments")}>{tt("View all")}<Ic n="chevR" size={13} /></button></div>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>{tt("Receipt")}</th><th>{tt("Student")}</th><th>{tt("Method")}</th><th>{tt("Date")}</th><th className="!text-right">{tt("Amount")}</th></tr></thead>
                <tbody>
                  {[...db.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7).map((p) => {
                    const st = db.students.find((x) => x.id === p.studentId);
                    return (
                      <tr key={p.id}>
                        <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300">{p.receipt}</td>
                        <td><span className="flex items-center gap-2.5">{st && <Avatar first={st.first} last={st.last} hue={st.hue} size={28} />}<span><span className="block font-bold text-[13px]">{st?.first} {st?.last}</span><span className="block text-[11px] text-ink-400">{st?.regNo}</span></span></span></td>
                        <td><Chip tone={p.method === "Mobile Money" ? "gold" : p.method === "Cash" ? "green" : "blue"}>{p.method}</Chip></td>
                        <td className="text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDateShort(p.date)}</td>
                        <td className="text-right font-bold tnum whitespace-nowrap">{fmtMoney(p.amount, cur)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel h-full">
            <div className="panel-h"><h3 className="font-display font-bold text-[16px]">{tt("Recent registrations")}</h3><button className="btn-g btn-sm" onClick={() => nav("/app/students")}>{tt("All")}<Ic n="chevR" size={13} /></button></div>
            <div className="px-4 pb-4 space-y-1">
              {d.recentAdm.map((x) => {
                const c = classOf(db, x);
                return (
                  <button key={x.id} onClick={() => nav("/app/students")} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-950/60 transition-colors text-left cursor-pointer">
                    <Avatar first={x.first} last={x.last} hue={x.hue} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold truncate">{x.first} {x.last}</span>
                      <span className="block text-[11px] text-ink-400">{c?.name} {c?.section} · {tt("admitted")} {fmtDateShort(x.admitted)}</span>
                    </span>
                    <Ic n="chevR" size={14} className="text-ink-300" />
                  </button>
                );
              })}
            </div>
            <div className="border-t border-ink-100 dark:border-ink-800 px-4 py-3.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-2">{tt("Recent activity")}</h4>
              {db.audits.slice(0, 4).map((a) => (
                <div key={a.id} className="flex gap-2.5 py-1.5 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                  <span className="text-ink-500 dark:text-ink-300 min-w-0"><b className="text-ink-800 dark:text-ink-100">{a.user}</b> · {a.detail}<span className="block text-[10.5px] text-ink-300">{a.action}</span></span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {[
          { l: "New admissions (30d)", v: db.admissions.length, ic: "userplus", to: "/app/admissions" },
          { l: "Upcoming exams", v: db.exams.filter((e) => e.status === "scheduled").length, ic: "exams", to: "/app/exams" },
          { l: "Library loans active", v: db.loans.filter((l) => !l.returned).length, ic: "book", to: "/app/library" },
          { l: "Absent alerts sent", v: d.statuses.A, ic: "sms", to: "/app/communication" },
        ].map((x, i) => (
          <Reveal key={i} delay={i * 60}>
            <button onClick={() => nav(x.to)} className="panel w-full p-4 flex items-center gap-3.5 hover:shadow-lift hover:-translate-y-0.5 transition-all text-left cursor-pointer group">
              <span className="w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 flex items-center justify-center group-hover:bg-cobalt-600 group-hover:text-white transition-colors"><Ic n={x.ic} /></span>
              <span><span className="block font-display font-bold text-xl tnum">{x.v}</span><span className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-400">{tt(x.l)}</span></span>
              <Ic n="arrowUR" size={15} className="ml-auto text-ink-300 group-hover:text-cobalt-500 transition-colors" />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
