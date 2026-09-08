import { useState } from "react";
import { useApp, mutate, uid, todayISO, fmtDate, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function InvoicesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Generate invoices from fee structures
  const invoices = db.students
    .filter(st => st.status === "active")
    .map(st => {
      const cls = db.classes.find(c => c.id === st.classId);
      const feeStruct = db.feeStructures.find(f => f.level === cls?.level);
      const total = feeStruct?.items.reduce((a, i) => a + i.amount, 0) || 0;
      const paid = db.payments
        .filter(p => p.studentId === st.id)
        .reduce((a, p) => a + p.amount, 0);
      const balance = total - paid;
      
      return {
        id: `INV-${st.regNo}`,
        student: st,
        total,
        paid,
        balance,
        status: balance <= 0 ? "paid" : balance < total ? "partial" : "unpaid",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      };
    });

  const createInvoice = () => {
    if (!selectedStudent || !amount || !dueDate) {
      toast("Please fill all fields", "err");
      return;
    }

    const student = db.students.find(s => s.id === selectedStudent);
    if (!student) return;

    // Record as payment
    mutate((db) => {
      db.payments.push({
        id: uid(),
        receipt: `INV-${todayISO().replace(/-/g, "")}-${db.payments.length + 1}`,
        studentId: selectedStudent,
        amount: parseFloat(amount),
        method: "Invoice",
        feeType: "Tuition",
        date: todayISO(),
      });
    });

    toast("Invoice created successfully");
    setShowModal(false);
    setSelectedStudent("");
    setAmount("");
    setDueDate("");
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Invoice Management")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total invoices" value={invoices.length} icon="receipt" />
        <Stat label="Paid" value={invoices.filter(i => i.status === "paid").length} icon="check" tone="green" />
        <Stat label="Partial" value={invoices.filter(i => i.status === "partial").length} icon="clock" tone="gold" />
        <Stat label="Unpaid" value={invoices.filter(i => i.status === "unpaid").length} icon="alert" tone="red" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All invoices")}</h2>
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Create invoice")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Invoice")}</th>
                <th>{tt("Student")}</th>
                <th>{tt("Total")}</th>
                <th>{tt("Paid")}</th>
                <th>{tt("Balance")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Due date")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 20).map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{inv.id}</td>
                  <td>
                    <div className="font-bold text-[13px]">{inv.student.first} {inv.student.last}</div>
                    <div className="text-[11px] text-ink-400">{inv.student.regNo}</div>
                  </td>
                  <td className="font-bold tnum">{fmtMoney(inv.total, cur)}</td>
                  <td className="tnum text-emerald-600">{fmtMoney(inv.paid, cur)}</td>
                  <td className={`tnum font-bold ${inv.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {fmtMoney(inv.balance, cur)}
                  </td>
                  <td>
                    <Chip tone={inv.status === "paid" ? "green" : inv.status === "partial" ? "gold" : "red"}>
                      {inv.status}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(inv.dueDate)}</td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => toast("Invoice downloaded")}>
                      <Ic n="download" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Create invoice")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Student")}>
            <select className="input" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Select student...</option>
              {db.students.filter(s => s.status === "active").map(st => (
                <option key={st.id} value={st.id}>{st.first} {st.last} - {st.regNo}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Amount")}>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </Field>
          <Field label={tt("Due date")}>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <button className="btn-p w-full" onClick={createInvoice}>
            <Ic n="check" size={15} />{tt("Create invoice")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
