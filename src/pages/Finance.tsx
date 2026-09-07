import { useApp, fmtDate, fmtMoney, feeTotal, paidBy, classOf } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar } from "../components/ui";
import { useT } from "../lib/i18n";

export function FeesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Fees & Structures")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Fee structures" value={db.feeStructures.length} icon="fees" />
        <Stat label="Total expected" value={db.students.filter(x => x.status === "active").reduce((a, x) => a + feeTotal(db, classOf(db, x)?.level ?? 1), 0)} icon="coins" money={cur} />
        <Stat label="Total collected" value={db.payments.reduce((a, p) => a + p.amount, 0)} icon="payment" tone="green" money={cur} />
        <Stat label="Outstanding" value={db.students.filter(x => x.status === "active").reduce((a, x) => a + Math.max(0, feeTotal(db, classOf(db, x)?.level ?? 1) - paidBy(db, x.id)), 0)} icon="alert" tone="red" money={cur} />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Fee structures by level")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Level")}</th>
                <th>{tt("Items")}</th>
                <th>{tt("Total")}</th>
              </tr>
            </thead>
            <tbody>
              {db.feeStructures.map((fs) => (
                <tr key={fs.level}>
                  <td className="font-bold">Senior {fs.level}</td>
                  <td>
                    <div className="space-y-1">
                      {fs.items.map((item) => (
                        <div key={item.id} className="text-[12px]">
                          <span className="text-ink-500 dark:text-ink-300">{item.name}:</span>{" "}
                          <span className="font-semibold">{fmtMoney(item.amount, cur)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-bold tnum">{fmtMoney(fs.items.reduce((a, i) => a + i.amount, 0), cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Payments")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total payments" value={db.payments.length} icon="payment" />
        <Stat label="Total collected" value={db.payments.reduce((a, p) => a + p.amount, 0)} icon="coins" tone="green" money={cur} />
        <Stat label="This month" value={db.payments.filter(p => p.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, p) => a + p.amount, 0)} icon="calendar" tone="blue" money={cur} />
        <Stat label="Mobile Money" value={db.payments.filter(p => p.method === "Mobile Money").reduce((a, p) => a + p.amount, 0)} icon="sms" tone="gold" money={cur} />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Recent payments")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Record payment")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Receipt")}</th>
                <th>{tt("Student")}</th>
                <th>{tt("Amount")}</th>
                <th>{tt("Method")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.payments.slice(0, 20).map((p) => {
                const st = db.students.find(x => x.id === p.studentId);
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{p.receipt}</td>
                    <td>
                      {st ? (
                        <div className="flex items-center gap-2">
                          <Avatar first={st.first} last={st.last} hue={st.hue} size={28} />
                          <span className="font-semibold text-[13px]">{st.first} {st.last}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="font-bold tnum">{fmtMoney(p.amount, cur)}</td>
                    <td>
                      <Chip tone={p.method === "Mobile Money" ? "gold" : p.method === "Cash" ? "green" : "blue"}>
                        {p.method}
                      </Chip>
                    </td>
                    <td className="text-[12px] text-ink-400">{fmtDate(p.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Invoices")}</h1>
      <div className="panel p-6">
        <p className="text-ink-400">{tt("Invoice management - Coming soon")}</p>
      </div>
    </div>
  );
}

export function ExpensesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Expenses")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total expenses" value={db.expenses.length} icon="expenses" />
        <Stat label="Total spent" value={db.expenses.reduce((a, e) => a + e.amount, 0)} icon="coins" tone="red" money={cur} />
        <Stat label="This month" value={db.expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, e) => a + e.amount, 0)} icon="calendar" tone="gold" money={cur} />
        <Stat label="Categories" value={new Set(db.expenses.map(e => e.category)).size} icon="folder" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Recent expenses")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Add expense")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Category")}</th>
                <th>{tt("Description")}</th>
                <th>{tt("Amount")}</th>
                <th>{tt("Vendor")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.expenses.slice(0, 20).map((e) => (
                <tr key={e.id}>
                  <td><Chip tone="gray">{e.category}</Chip></td>
                  <td className="text-[12.5px]">{e.desc}</td>
                  <td className="font-bold tnum text-rose-600 dark:text-rose-400">{fmtMoney(e.amount, cur)}</td>
                  <td className="text-[12.5px]">{e.vendor}</td>
                  <td className="text-[12px] text-ink-400">{fmtDate(e.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FinReportsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  const totalRevenue = db.payments.reduce((a, p) => a + p.amount, 0);
  const totalExpenses = db.expenses.reduce((a, e) => a + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Financial Reports")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total revenue" value={totalRevenue} icon="payment" tone="green" money={cur} />
        <Stat label="Total expenses" value={totalExpenses} icon="expenses" tone="red" money={cur} />
        <Stat label="Net profit" value={netProfit} icon="analytics" tone={netProfit >= 0 ? "green" : "red"} money={cur} />
        <Stat label="Profit margin" value={Math.round((netProfit / totalRevenue) * 100)} icon="chart" tone="blue" />
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
        </div>
      </div>
    </div>
  );
}
