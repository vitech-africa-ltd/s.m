import { useApp, fmtMoney, fmtNum, attPct, todayISO, monthKeys, monthLabel, collectionRate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, AreaChart, DuoBars, Donut, Ring, HBars } from "../components/ui";
import { useT } from "../lib/i18n";

export default function Dashboard({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const mk = monthKeys(8);
  
  const enroll = mk.map((m) => db.students.filter((x) => x.admitted.startsWith(m)).length);
  const revBy = mk.map((m) => db.payments.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const expBy = mk.map((m) => db.expenses.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const passRate = Math.round((db.grades.filter((g) => g.score >= db.school.passMark).length / Math.max(1, db.grades.length)) * 100);
  
  const totalRevenue = db.payments.reduce((a, b) => a + b.amount, 0);
  const totalExpenses = db.expenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const revenueByMethod = db.payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">{tt("Dashboard")}</h1>
          <p className="text-ink-400 text-[13px] mt-1">{tt("Welcome back")}, {db.school.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-o btn-sm" onClick={() => {
            const data = JSON.stringify(db, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vitech-data-${todayISO()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Ic n="download" size={15} />{tt("Export data")}
          </button>
          <button className="btn-p btn-sm" onClick={() => nav("/app/students")}>
            <Ic n="plus" size={15} />{tt("New student")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total students" value={db.students.length} sub={`${db.students.filter(x => x.status === "active").length} active`} icon="students" />
        <Stat label="Teachers" value={db.teachers.length} sub={`${db.teachers.filter(t => t.status === "active").length} active`} icon="teacher" tone="blue" />
        <Stat label="Attendance today" value={attPct(db, todayISO())} sub={`${tt("Present")}: ${attPct(db, todayISO())}%`} icon="attendance" tone="green" />
        <Stat label="Classes" value={db.classes.length} sub={`${db.subjects.length} subjects`} icon="class" tone="gold" />
        <Stat label="Payments today" value={db.payments.filter(p => p.date === todayISO()).reduce((a, b) => a + b.amount, 0)} icon="payment" tone="green" money={cur} />
        <Stat label="Monthly revenue" value={revBy[revBy.length - 1]} sub={`▲ vs ${fmtMoney(revBy[revBy.length - 2], cur)}`} icon="coins" />
        <Stat label="Pending fees" value={db.students.filter(x => x.status === "active").reduce((a, x) => {
          const classLevel = db.classes.find(c => c.id === x.classId)?.level ?? 1;
          const totalFees = db.feeStructures.find(f => f.level === classLevel)?.items.reduce((sum, i) => sum + i.amount, 0) ?? 0;
          const paidAmount = db.payments.filter(p => p.studentId === x.id).reduce((sum, p) => sum + p.amount, 0);
          return a + Math.max(0, totalFees - paidAmount);
        }, 0)} sub={`${db.students.filter(x => {
          const classLevel = db.classes.find(c => c.id === x.classId)?.level ?? 1;
          const totalFees = db.feeStructures.find(f => f.level === classLevel)?.items.reduce((sum, i) => sum + i.amount, 0) ?? 0;
          const paidAmount = db.payments.filter(p => p.studentId === x.id).reduce((sum, p) => sum + p.amount, 0);
          return x.status === "active" && paidAmount < totalFees;
        }).length} unpaid`} icon="alert" tone="red" money={cur} />
        <Stat label="Net profit" value={netProfit} sub={`${tt("Expenses")}: ${fmtMoney(totalExpenses, cur)}`} icon="analytics" tone="navy" money={cur} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Enrollment growth")}</h3>
            <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">admissions / month</span>
          </div>
          <div className="px-5 pb-5">
            <AreaChart data={enroll.map((x) => x || 1)} labels={mk.map(monthLabel)} h={120} id="enroll" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Revenue vs Expenses")}</h3>
            <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              +{Math.round(((revBy[revBy.length - 1] - expBy[expBy.length - 1]) / Math.max(1, revBy[revBy.length - 1])) * 100)}% {tt("margin")}
            </span>
          </div>
          <div className="px-5 pb-5">
            <DuoBars 
              data={mk.map((m, i) => ({ label: monthLabel(m), a: Math.round(revBy[i] / 1000), b: Math.round(expBy[i] / 1000) }))} 
              aLabel={tt("Revenue")} 
              bLabel={tt("Expenses")} 
              money="K" 
            />
          </div>
        </div>
      </div>

      {/* More Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Performance distribution")}</h3>
          <Donut 
            label={`${passRate}%`} 
            sub={tt("pass rate")} 
            segments={[
              { value: passRate, color: "#10b981", name: tt("Pass") }, 
              { value: 100 - passRate, color: "#f43f5e", name: tt("Below pass mark") }
            ]} 
            size={120} 
          />
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Revenue by payment method")}</h3>
          <HBars 
            rows={Object.entries(revenueByMethod).map(([method, amount]) => ({ 
              label: method, 
              value: Math.round(amount / 1000),
              color: method === "Mobile Money" ? "#dca638" : method === "Cash" ? "#10b981" : "#1e49c9"
            }))} 
            money="K" 
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h3 className="font-display font-bold text-[16px] mb-4">{tt("Quick actions")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Students", icon: "students", to: "/app/students", tone: "blue" },
            { label: "Teachers", icon: "teacher", to: "/app/teachers", tone: "blue" },
            { label: "Classes", icon: "class", to: "/app/classes", tone: "blue" },
            { label: "Attendance", icon: "attendance", to: "/app/attendance", tone: "green" },
            { label: "Exams", icon: "exams", to: "/app/exams", tone: "gold" },
            { label: "Payments", icon: "payment", to: "/app/payments", tone: "green" },
            { label: "Reports", icon: "reports", to: "/app/finreports", tone: "blue" },
            { label: "Settings", icon: "settings", to: "/app/settings", tone: "navy" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => nav(action.to)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-cobalt-300 dark:hover:border-cobalt-700 hover:shadow-panel transition-all cursor-pointer group"
            >
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                action.tone === "blue" ? "bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300" :
                action.tone === "green" ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" :
                action.tone === "gold" ? "bg-gold-50 dark:bg-gold-500/15 text-gold-600 dark:text-gold-300" :
                "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300"
              } group-hover:scale-110 transition-transform`}>
                <Ic n={action.icon} size={20} />
              </span>
              <span className="text-[11px] font-bold text-ink-600 dark:text-ink-300">{tt(action.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="panel p-6 mt-4">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Summary")}</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
            <span className="text-ink-500 dark:text-ink-300">{tt("Total payments received")}</span>
            <span className="font-bold tnum text-emerald-600">{fmtMoney(totalRevenue, cur)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
            <span className="text-ink-500 dark:text-ink-300">{tt("Total expenses")}</span>
            <span className="font-bold tnum text-rose-600">{fmtMoney(totalExpenses, cur)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-ink-200 dark:border-ink-700">
            <span className="font-bold text-[15px]">{tt("Net profit")}</span>
            <span className={`font-bold tnum text-[18px] ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmtMoney(netProfit, cur)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
            <span className="text-ink-500 dark:text-ink-300">{tt("Attendance rate")}</span>
            <span className="font-bold tnum text-cobalt-600">{attPct(db, todayISO())}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
            <span className="text-ink-500 dark:text-ink-300">{tt("Fee collection rate")}</span>
            <span className="font-bold tnum text-cobalt-600">{collectionRate(db)}%</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-ink-500 dark:text-ink-300">{tt("Academic success rate")}</span>
            <span className="font-bold tnum text-emerald-600">{passRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
