import { useState } from "react";
import { useApp, mutate, uid, fmtDate, fmtMoney, feeTotal, paidBy, classOf } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";
import { printProfessional, generatePrintHeader, generatePrintFooter, generateSignatureSection } from "../utils/print";

export function FeesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(0);
  const [items, setItems] = useState<{ name: string; amount: number }[]>([]);

  const openEdit = (level: number) => {
    const fs = db.feeStructures.find(f => f.level === level);
    setEditingLevel(level);
    setItems(fs?.items.map(i => ({ name: i.name, amount: i.amount })) || []);
    setShowModal(true);
  };

  const saveFeeStructure = () => {
    if (!editingLevel || items.length === 0) {
      toast("Please add at least one fee item", "err");
      return;
    }

    mutate((db) => {
      const idx = db.feeStructures.findIndex(f => f.level === editingLevel);
      const feeItems = items.map(item => ({
        id: uid(),
        name: item.name,
        amount: item.amount,
      }));

      if (idx >= 0) {
        db.feeStructures[idx].items = feeItems;
      } else {
        db.feeStructures.push({ level: editingLevel, items: feeItems });
      }
    });

    toast("Fee structure saved successfully");
    setShowModal(false);
    setEditingLevel(0);
    setItems([]);
  };

  const addItem = () => {
    setItems([...items, { name: "", amount: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: "name" | "amount", value: string | number) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };
  
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
                <th>{tt("Actions")}</th>
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
                  <td>
                    <button className="btn-g btn-sm" onClick={() => openEdit(fs.level)}>
                      <Ic n="pencil" size={14} />{tt("Edit")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`${tt("Edit fee structure")} - Senior ${editingLevel}`} w="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Fee name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                />
                <input
                  type="number"
                  className="input w-32"
                  placeholder="Amount"
                  value={item.amount || ""}
                  onChange={(e) => updateItem(idx, "amount", parseFloat(e.target.value) || 0)}
                />
                <button className="btn-g btn-sm !text-rose-500" onClick={() => removeItem(idx)}>
                  <Ic n="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn-o btn-sm" onClick={addItem}>
            <Ic n="plus" size={14} />{tt("Add item")}
          </button>
          <div className="flex justify-end gap-2 pt-4 border-t border-ink-100 dark:border-ink-800">
            <button className="btn-o" onClick={() => setShowModal(false)}>{tt("Cancel")}</button>
            <button className="btn-p" onClick={saveFeeStructure}>
              <Ic n="check" size={15} />{tt("Save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function PaymentsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [feeType, setFeeType] = useState("Tuition");

  const createPayment = () => {
    if (!selectedStudent || !amount) {
      toast("Please fill all required fields", "err");
      return;
    }

    mutate((db) => {
      db.payments.unshift({
        id: uid(),
        receipt: `RC-${new Date().toISOString().replace(/-/g, "").slice(0, 8)}-${db.payments.length + 1}`,
        studentId: selectedStudent,
        amount: parseFloat(amount),
        method,
        feeType,
        date: new Date().toISOString().slice(0, 10),
      });
    });

    toast("Payment recorded successfully");
    setShowModal(false);
    setSelectedStudent("");
    setAmount("");
  };

  const printReceipt = (payment: any) => {
    const student = db.students.find(x => x.id === payment.studentId);
    const content = `
      ${generatePrintHeader(db.school.name, `${db.school.address} | ${db.school.phone}`)}
      <div class="print-content">
        <h2 style="text-align: center; color: #1e49c9; margin-bottom: 30px;">PAYMENT RECEIPT</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Receipt Number</h3>
            <div class="value" style="font-size: 18px;">${payment.receipt}</div>
          </div>
          <div class="stat-card">
            <h3>Date</h3>
            <div class="value" style="font-size: 18px;">${fmtDate(payment.date)}</div>
          </div>
          <div class="stat-card">
            <h3>Amount</h3>
            <div class="value">${fmtMoney(payment.amount, cur)}</div>
          </div>
          <div class="stat-card">
            <h3>Payment Method</h3>
            <div class="value" style="font-size: 18px;">${payment.method}</div>
          </div>
        </div>
        <table>
          <tr>
            <th colspan="2">Student Information</th>
          </tr>
          <tr>
            <td><strong>Name:</strong></td>
            <td>${student ? `${student.first} ${student.last}` : 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Registration No:</strong></td>
            <td>${student ? student.regNo : 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Class:</strong></td>
            <td>${student ? `${db.classes.find(c => c.id === student.classId)?.name || 'N/A'} ${db.classes.find(c => c.id === student.classId)?.section || ''}` : 'N/A'}</td>
          </tr>
          <tr>
            <th colspan="2">Payment Details</th>
          </tr>
          <tr>
            <td><strong>Fee Type:</strong></td>
            <td>${payment.feeType}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong></td>
            <td>${payment.method}</td>
          </tr>
          <tr>
            <td><strong>Amount Paid:</strong></td>
            <td><strong>${fmtMoney(payment.amount, cur)}</strong></td>
          </tr>
        </table>
        ${generateSignatureSection()}
      </div>
      ${generatePrintFooter()}
    `;
    printProfessional(content, `Receipt ${payment.receipt}`);
  };

  const printFinancialReport = () => {
    const totalRevenue = db.payments.reduce((a, p) => a + p.amount, 0);
    const totalExpenses = db.expenses.reduce((a, e) => a + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const content = `
      ${generatePrintHeader(db.school.name, `${db.school.address} | ${db.school.phone}`)}
      <div class="print-content">
        <h2 style="text-align: center; color: #1e49c9; margin-bottom: 30px;">FINANCIAL REPORT</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Revenue</h3>
            <div class="value">${fmtMoney(totalRevenue, cur)}</div>
          </div>
          <div class="stat-card">
            <h3>Total Expenses</h3>
            <div class="value">${fmtMoney(totalExpenses, cur)}</div>
          </div>
          <div class="stat-card">
            <h3>Net Profit</h3>
            <div class="value" style="color: ${netProfit >= 0 ? '#10b981' : '#ef4444'}">${fmtMoney(netProfit, cur)}</div>
          </div>
          <div class="stat-card">
            <h3>Total Payments</h3>
            <div class="value">${db.payments.length}</div>
          </div>
        </div>
        <h3 style="margin-top: 30px; color: #1e49c9;">Recent Payments</h3>
        <table>
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${db.payments.slice(0, 10).map(p => {
              const student = db.students.find(x => x.id === p.studentId);
              return `
                <tr>
                  <td>${p.receipt}</td>
                  <td>${student ? `${student.first} ${student.last}` : 'N/A'}</td>
                  <td>${fmtMoney(p.amount, cur)}</td>
                  <td>${p.method}</td>
                  <td>${fmtDate(p.date)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${generateSignatureSection()}
      </div>
      ${generatePrintFooter()}
    `;
    printProfessional(content, "Financial Report");
  };
  
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
          <div className="flex gap-2">
            <button className="btn-o btn-sm" onClick={printFinancialReport}>
              <Ic n="printer" size={15} />{tt("Print Report")}
            </button>
            <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
              <Ic n="plus" size={15} />{tt("Record payment")}
            </button>
          </div>
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
                <th>{tt("Actions")}</th>
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
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-g btn-sm" onClick={() => printReceipt(p)} title="Print Receipt">
                          <Ic n="printer" size={14} />
                        </button>
                        <button className="btn-g btn-sm" onClick={() => toast("Payment details opened")}>
                          <Ic n="eye" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Record payment")} w="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="label">{tt("Student")}</label>
            <select className="input" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Select student...</option>
              {db.students.filter(s => s.status === "active").map(st => (
                <option key={st.id} value={st.id}>{st.first} {st.last} - {st.regNo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{tt("Amount")}</label>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="label">{tt("Payment method")}</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div>
            <label className="label">{tt("Fee type")}</label>
            <select className="input" value={feeType} onChange={(e) => setFeeType(e.target.value)}>
              <option value="Tuition">Tuition</option>
              <option value="Registration">Registration</option>
              <option value="Examination">Examination</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button className="btn-p w-full" onClick={createPayment}>
            <Ic n="check" size={15} />{tt("Record payment")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function ExpensesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");

  const createExpense = () => {
    if (!category || !amount) {
      toast("Please fill required fields", "err");
      return;
    }

    mutate((db) => {
      db.expenses.unshift({
        id: uid(),
        category,
        desc: desc || category,
        amount: parseFloat(amount),
        date: new Date().toISOString().slice(0, 10),
        vendor: vendor || "N/A",
        method: "Cash",
        by: "Admin",
      });
    });

    toast("Expense recorded successfully");
    setShowModal(false);
    setCategory("");
    setDesc("");
    setAmount("");
    setVendor("");
  };
  
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
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Add expense")}
          </button>
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
                <th>{tt("Actions")}</th>
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
                  <td>
                    <button className="btn-g btn-sm" onClick={() => toast("Expense details opened")}>
                      <Ic n="eye" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Add expense")} w="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="label">{tt("Category")}</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              <option value="Salaries">Salaries</option>
              <option value="Utilities">Utilities</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supplies">Supplies</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">{tt("Description")}</label>
            <input type="text" className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Expense description" />
          </div>
          <div>
            <label className="label">{tt("Amount")}</label>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="label">{tt("Vendor")}</label>
            <input type="text" className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor name" />
          </div>
          <button className="btn-p w-full" onClick={createExpense}>
            <Ic n="check" size={15} />{tt("Add expense")}
          </button>
        </div>
      </Modal>
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
        <Stat label="Profit margin" value={totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0} icon="chart" tone="blue" />
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
