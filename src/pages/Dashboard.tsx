import { useApp, fmtMoney, fmtNum, attPct, todayISO, collectionRate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, AreaChart, DuoBars, Donut, Ring, HBars, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function Dashboard({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  const totalRevenue = db.payments.reduce((a, b) => a + b.amount, 0);
  const totalExpenses = db.expenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const passRate = Math.round((db.grades.filter((g) => g.score >= db.school.passMark).length / Math.max(1, db.grades.length)) * 100);
  
  const handleExport = () => {
    const data = {
      students: db.students,
      payments: db.payments,
      expenses: db.expenses,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitech-export-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Data exported successfully");
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">{tt("Dashboard")}</h1>
        <div className="flex gap-2">
          <button className="btn-o btn-sm" onClick={handleExport}>
            <Ic n="download" size={15} />{tt("Export")}
          </button>
          <button className="btn-p btn-sm" onClick={() => nav("/app/students")}>
            <Ic n="plus" size={15} />{tt("New student")}
          </button>
        </div>
      </div>
      
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
            <AreaChart data={[12, 15, 18, 22, 25, 28, 32, 35]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]} h={120} id="dash1" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h3 className="font-display font-bold text-[16px]">{tt("Revenue vs Expenses")}</h3>
            <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              +{Math.round(((totalRevenue - totalExpenses) / Math.max(1, totalRevenue)) * 100)}% margin
            </span>
          </div>
          <div className="px-5 pb-5">
            <DuoBars 
              data={[
                { label: "Jan", a: 120, b: 80 },
                { label: "Feb", a: 135, b: 85 },
                { label: "Mar", a: 150, b: 90 },
                { label: "Apr", a: 165, b: 95 },
                { label: "May", a: 180, b: 100 },
                { label: "Jun", a: 195, b: 105 },
              ]} 
              aLabel="Revenue" 
              bLabel="Expenses" 
              money="K" 
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Attendance rate")}</h3>
          <div className="flex items-center gap-4">
            <Ring value={attPct(db, todayISO())} size={100} color="#10b981" />
            <div>
              <div className="font-display text-[24px] font-bold">{attPct(db, todayISO())}%</div>
              <div className="text-[12px] text-ink-400">{tt("Today")}</div>
            </div>
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Fee collection")}</h3>
          <div className="flex items-center gap-4">
            <Ring value={collectionRate(db)} size={100} color="#dca638" />
            <div>
              <div className="font-display text-[24px] font-bold">{collectionRate(db)}%</div>
              <div className="text-[12px] text-ink-400">{tt("Collected")}</div>
            </div>
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display font-bold text-[16px] mb-4">{tt("Academic success")}</h3>
          <div className="flex items-center gap-4">
            <Ring value={passRate} size={100} color="#1e49c9" />
            <div>
              <div className="font-display text-[24px] font-bold">{passRate}%</div>
              <div className="text-[12px] text-ink-400">{tt("Pass rate")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-6 mt-4">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Quick actions")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="btn-o" onClick={() => nav("/app/students")}>
            <Ic n="students" size={16} />{tt("Students")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/payments")}>
            <Ic n="payment" size={16} />{tt("Payments")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/attendance")}>
            <Ic n="attendance" size={16} />{tt("Attendance")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/exams")}>
            <Ic n="exams" size={16} />{tt("Exams")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/communication")}>
            <Ic n="comm" size={16} />{tt("Communication")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/calendar")}>
            <Ic n="calendar" size={16} />{tt("Calendar")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/reports")}>
            <Ic n="reports" size={16} />{tt("Reports")}
          </button>
          <button className="btn-o" onClick={() => nav("/app/settings")}>
            <Ic n="settings" size={16} />{tt("Settings")}
          </button>
        </div>
      </div>
    </div>
  );
}
