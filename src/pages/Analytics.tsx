import { useApp, fmtMoney, fmtNum, attPct, todayISO, monthKeys, monthLabel, collectionRate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, AreaChart, DuoBars, Donut, Ring, HBars } from "../components/ui";
import { useT } from "../lib/i18n";

export default function AnalyticsPage() {
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
  
  const expensesByCategory = db.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Analytics")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Students" value={db.students.length} icon="students" />
        <Stat label="Teachers" value={db.teachers.length} icon="teacher" tone="blue" />
        <Stat label="Revenue" value={totalRevenue} icon="payment" tone="green" money={cur} />
        <Stat label="Expenses" value={totalExpenses} icon="expenses" tone="red" money={cur} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Enrollment growth")}</h3>
            <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">admissions / month</span>
          </div>
          <div className="px-5 pb-5">
            <AreaChart data={enroll.map((x) => x || 1)} labels={mk.map(monthLabel)} h={120} id="an1" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Monthly revenue")}</h3>
            <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{cur}</span>
          </div>
          <div className="px-5 pb-5">
            <AreaChart data={revBy} labels={mk.map(monthLabel)} h={120} color="#c98f1b" id="an2" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Revenue vs Expenses")}</h3>
            <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">
              +{Math.round(((revBy[revBy.length - 1] - expBy[expBy.length - 1]) / Math.max(1, revBy[revBy.length - 1])) * 100)}% margin
            </span>
          </div>
          <div className="px-5 pb-5">
            <DuoBars 
              data={mk.map((m, i) => ({ label: monthLabel(m), a: Math.round(revBy[i] / 1000), b: Math.round(expBy[i] / 1000) }))} 
              aLabel="Revenue" 
              bLabel="Expenses" 
              money="K" 
            />
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Performance distribution")}</h3>
          <Donut 
            label={`${passRate}%`} 
            sub="pass rate" 
            segments={[
              { value: passRate, color: "#10b981", name: "Pass" }, 
              { value: 100 - passRate, color: "#f43f5e", name: "Below pass mark" }
            ]} 
            size={120} 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
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
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Expenses by category")}</h3>
          <HBars 
            rows={Object.entries(expensesByCategory).map(([category, amount]) => ({ 
              label: category, 
              value: Math.round(amount / 1000),
              color: "#f43f5e"
            }))} 
            money="K" 
          />
        </div>
      </div>

      <div className="panel p-6">
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
