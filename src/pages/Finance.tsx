import { useMemo, useState } from "react";
import { useApp, mutate, audit, notify, logComm, uid, todayISO, fmtMoney, fmtDate, monthKeys, monthLabel, feeTotal, paidBy, classOf, type Payment } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, Pagination, toast, PrintPortal, DuoBars, HBars } from "../components/ui";
import { PageHead } from "./Dashboard";

/* ============ Receipt document ============ */
export function ReceiptDoc({ p }: { p: Payment }) {
  const s = useApp();
  const db = s.db;
  const st = db.students.find((x) => x.id === p.studentId);
  const c = st ? classOf(db, st) : undefined;
  const total = c ? feeTotal(db, c.level) : 0;
  const bal = total - paidBy(db, p.studentId);
  return (
    <div className="print-card mx-auto max-w-[560px] bg-white text-ink-900 border border-ink-200 rounded-lg overflow-hidden">
      <div className="bg-ink-950 text-white px-7 py-5 flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-lg bg-gold-400 text-ink-950 font-display font-bold text-xl flex items-center justify-center">{db.school.logoText[0]}</span>
        <div className="flex-1">
          <div className="font-display font-bold text-[17px]">{db.school.name}</div>
          <div className="text-[10.5px] opacity-75">{db.school.address} · {db.school.phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-gold-300">Official Receipt</div>
          <div className="font-mono font-bold text-[14px]">{p.receipt}</div>
        </div>
      </div>
      <div className="px-7 py-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
          {[["Received from", st ? `${st.first} ${st.last} (${st.regNo})` : "—"], ["Class", c ? `${c.name} ${c.section}` : "—"], ["Parent / guardian", st?.parent.name ?? "—"], ["Payment method", p.method], ["Fee type", p.feeType], ["Date", fmtDate(p.date)], ["Received by", p.by]].map(([k, v]) => (
            <div key={k}><span className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400 block">{k}</span><b>{v}</b></div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border-2 border-dashed border-gold-300 bg-gold-50 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold-700">Amount received</div>
            <div className="font-display font-bold text-[30px] tnum leading-tight">{fmtMoney(p.amount, db.school.currency)}</div>
          </div>
          <div className="text-right text-[12px]">
            <div className="text-ink-500">Annual fees: <b className="tnum">{fmtMoney(total, db.school.currency)}</b></div>
            <div className={bal > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>Remaining balance: <span className="tnum">{fmtMoney(Math.max(0, bal), db.school.currency)}</span></div>
          </div>
        </div>
        <p className="text-[11px] text-ink-400 mt-4">This is a computer-generated receipt. Verify authenticity at {db.school.website} · Thank you for your payment.</p>
      </div>
      <div className="h-2.5 bg-gold-400" />
    </div>
  );
}

/* ============ Payments page ============ */
export function PaymentsPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const PER = 10;

  const filtered = useMemo(() => [...db.payments].sort((a, b) => b.date.localeCompare(a.date)).filter((p) => {
    if (method !== "all" && p.method !== method) return false;
    if (q) { const st = db.students.find((x) => x.id === p.studentId); if (!`${p.receipt} ${st?.first} ${st?.last} ${st?.regNo}`.toLowerCase().includes(q.toLowerCase())) return false; }
    return true;
  }), [db.payments, db.students, q, method]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice((page - 1) * PER, page * PER);
  const todayTotal = db.payments.filter((p) => p.date === todayISO()).reduce((a, b) => a + b.amount, 0);

  return (
    <div>
      <PageHead title="Payments" sub={`${db.payments.length.toLocaleString()} payments recorded · today ${fmtMoney(todayTotal, cur)}`}>
        <button className="btn-o btn-sm" onClick={() => { const rows = filtered.map((p) => { const st = db.students.find((x) => x.id === p.studentId); return [p.receipt, `${st?.first} ${st?.last}`, p.method, p.feeType, p.date, p.amount].join(","); }); const blob = new Blob([["Receipt,Student,Method,FeeType,Date,Amount", ...rows].join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "payments.csv"; a.click(); toast("Payments exported to CSV"); }}><Ic n="download" size={15} />Export</button>
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Record payment</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2.5 p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative flex-1 min-w-[200px]"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Search receipt, student…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <select className="input !w-auto" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter method">
            <option value="all">All methods</option>{["Cash", "Bank", "Mobile Money", "Card", "Transfer"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Receipt</th><th>Student</th><th>Method</th><th>Fee type</th><th>Date</th><th className="!text-right">Amount</th><th className="!text-right">Receipt</th></tr></thead>
            <tbody>
              {shown.map((p) => {
                const st = db.students.find((x) => x.id === p.studentId);
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{p.receipt}</td>
                    <td><span className="flex items-center gap-2.5">{st && <Avatar first={st.first} last={st.last} hue={st.hue} size={28} />}<span><b className="block text-[13px]">{st?.first} {st?.last}</b><span className="block text-[11px] text-ink-400">{st?.regNo}</span></span></span></td>
                    <td><Chip tone={p.method === "Mobile Money" ? "gold" : p.method === "Cash" ? "green" : "blue"}>{p.method}</Chip></td>
                    <td className="text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">{p.feeType}</td>
                    <td className="text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDate(p.date)}</td>
                    <td className="text-right font-bold tnum whitespace-nowrap">{fmtMoney(p.amount, cur)}</td>
                    <td className="text-right"><button className="btn-g btn-sm !px-2" title="View receipt" onClick={() => setReceipt(p)}><Ic n="printer" size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} shown={shown.length} />
      </div>
      {form && <RecordPayment onClose={() => setForm(false)} onDone={setReceipt} />}
      {receipt && (
        <Modal open onClose={() => setReceipt(null)} title={`Receipt ${receipt.receipt}`} w="max-w-2xl"
          footer={<><button className="btn-o" onClick={() => setReceipt(null)}>Close</button><button className="btn-p" onClick={() => window.print()}><Ic n="printer" size={15} />Print / PDF</button></>}>
          <ReceiptDoc p={receipt} />
          <PrintPortal><ReceiptDoc p={receipt} /></PrintPortal>
        </Modal>
      )}
    </div>
  );
}

function RecordPayment({ onClose, onDone }: { onClose: () => void; onDone: (p: Payment) => void }) {
  const s = useApp();
  const db = s.db;
  const [sid, setSid] = useState(db.students[0]?.id ?? "");
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState<Payment["method"]>("Mobile Money");
  const [feeType, setFeeType] = useState("Tuition");
  const st = db.students.find((x) => x.id === sid);
  const c = st ? classOf(db, st) : undefined;
  const bal = st && c ? feeTotal(db, c.level) - paidBy(db, st.id) : 0;
  const save = () => {
    if (!st || amount <= 0) { toast("Enter a valid amount", "err"); return; }
    const p: Payment = { id: uid(), receipt: `${db.school.receiptPrefix}-${todayISO().slice(0, 4)}-${String(9300 + db.payments.length)}`, studentId: sid, amount, method, feeType, date: todayISO(), by: "Claudine U." };
    mutate((db) => db.payments.unshift(p));
    audit("CREATE_PAYMENT", "Payment", `${fmtMoney(amount, db.school.currency)} — ${p.receipt} (${st.first} ${st.last})`);
    notify("payment", "Payment received", `${fmtMoney(amount, db.school.currency)} — ${st.first} ${st.last} (${method})`);
    logComm("WhatsApp", st.parent.phone || "+250 7XX", `Dear ${st.parent.name}, a payment of ${fmtMoney(amount, db.school.currency)} has been received for ${st.first} ${st.last}. Remaining balance: ${fmtMoney(Math.max(0, bal - amount), db.school.currency)}. Thank you — ${db.school.name}`);
    toast(`Payment recorded — receipt ${p.receipt}`);
    onClose(); onDone(p);
  };
  return (
    <Modal open onClose={onClose} title="Record payment" w="max-w-lg"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />Save & issue receipt</button></>}>
      <div className="space-y-4">
        <Field label="Student">
          <select className="input" value={sid} onChange={(e) => setSid(e.target.value)}>
            {db.students.slice(0, 80).map((x) => <option key={x.id} value={x.id}>{x.first} {x.last} — {x.regNo}</option>)}
          </select>
        </Field>
        {st && c && (
          <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 grid grid-cols-3 gap-2 text-center text-[12px]">
            <div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Class</div><b>{c.name} {c.section}</b></div>
            <div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Fees total</div><b className="tnum">{fmtMoney(feeTotal(db, c.level), db.school.currency)}</b></div>
            <div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">Balance</div><b className={`tnum ${bal > 0 ? "text-rose-600" : "text-emerald-600"}`}>{fmtMoney(Math.max(0, bal), db.school.currency)}</b></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Amount (${db.school.currency})`}><input type="number" className="input tnum" value={amount} onChange={(e) => setAmount(+e.target.value)} /></Field>
          <Field label="Fee type"><select className="input" value={feeType} onChange={(e) => setFeeType(e.target.value)}>{["Tuition", "Registration", "Examination", "Laboratory & ICT", "Transport", "Library", "PTA & Insurance", "Other"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <div>
          <span className="label">Payment method</span>
          <div className="grid grid-cols-3 gap-2">
            {(["Cash", "Mobile Money", "Bank", "Card", "Transfer"] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)} className={`rounded-lg border-2 px-2 py-2.5 text-[12px] font-bold transition-all cursor-pointer ${method === m ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300" : "border-ink-100 dark:border-ink-800 text-ink-400 hover:border-cobalt-300"}`}>
                <Ic n={m === "Cash" ? "coins" : m === "Mobile Money" ? "phone" : m === "Bank" ? "bank" : m === "Card" ? "payment" : "swap"} size={15} className="mx-auto mb-1" />{m}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-ink-400 font-semibold flex items-center gap-2"><Ic n="whatsapp" size={14} className="text-emerald-500" />A confirmation with the remaining balance is sent to the parent automatically.</p>
      </div>
    </Modal>
  );
}

/* ============ Fees page ============ */
export function FeesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [editLvl, setEditLvl] = useState<number | null>(null);
  return (
    <div>
      <PageHead title="Fee structures" sub={`Annual fee schedules per level — ${db.school.academicYear}. Totals, balances and invoices are computed automatically.`} />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.feeStructures.map((fs) => {
          const total = fs.items.reduce((a, b) => a + b.amount, 0);
          const enrolled = db.students.filter((x) => x.status === "active" && classOf(db, x)?.level === fs.level).length;
          return (
            <div key={fs.level} className="panel p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-xl bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold">S{fs.level}</span>
                <button className="btn-g btn-sm" onClick={() => setEditLvl(fs.level)}><Ic n="pencil" size={14} />Edit</button>
              </div>
              <h3 className="font-display font-bold text-[17px] mt-3">Senior {fs.level}</h3>
              <p className="text-[12px] text-ink-400 font-semibold">{enrolled} students enrolled</p>
              <div className="mt-3.5 space-y-1.5">
                {fs.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-[12.5px]"><span className="text-ink-500 dark:text-ink-300">{it.name}</span><b className="tnum">{fmtMoney(it.amount, cur)}</b></div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t-2 border-dashed border-ink-100 dark:border-ink-800 flex justify-between items-center">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Total / student</span>
                <span className="font-display font-bold text-[19px] tnum">{fmtMoney(total, cur)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {editLvl !== null && <EditFees level={editLvl} onClose={() => setEditLvl(null)} />}
    </div>
  );
}

function EditFees({ level, onClose }: { level: number; onClose: () => void }) {
  const s = useApp();
  const fs = s.db.feeStructures.find((f) => f.level === level)!;
  const [items, setItems] = useState(fs.items.map((i) => ({ ...i })));
  const [nName, setNName] = useState(""); const [nAmt, setNAmt] = useState(0);
  const total = items.reduce((a, b) => a + b.amount, 0);
  const save = () => {
    mutate((db) => { const f = db.feeStructures.find((x) => x.level === level)!; f.items = items; });
    audit("UPDATE_FEES", "Fees", `Fee structure S${level} updated — total ${total}`);
    toast(`Senior ${level} fee structure saved`); onClose();
  };
  return (
    <Modal open onClose={onClose} title={`Edit fee structure — Senior ${level}`} w="max-w-md"
      footer={<><button className="btn-o" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />Save structure</button></>}>
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-2">
            <input className="input flex-1" value={it.name} onChange={(e) => setItems((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input type="number" className="input !w-32 tnum" value={it.amount} onChange={(e) => setItems((p) => p.map((x, j) => (j === i ? { ...x, amount: +e.target.value } : x)))} />
            <button className="btn-g !px-2 !text-rose-500" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} aria-label="Remove item"><Ic n="trash" size={15} /></button>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 border-t border-ink-100 dark:border-ink-800">
          <input className="input flex-1" placeholder="New fee item" value={nName} onChange={(e) => setNName(e.target.value)} />
          <input type="number" className="input !w-32 tnum" placeholder="0" value={nAmt || ""} onChange={(e) => setNAmt(+e.target.value)} />
          <button className="btn-o !px-3" onClick={() => { if (nName) { setItems((p) => [...p, { id: uid(), name: nName, amount: nAmt }]); setNName(""); setNAmt(0); } }} aria-label="Add item"><Ic n="plus" size={15} /></button>
        </div>
        <div className="flex justify-between pt-3 font-display font-bold text-[17px]"><span>Total</span><span className="tnum">{fmtMoney(total, s.db.school.currency)}</span></div>
      </div>
    </Modal>
  );
}

/* ============ Invoices page ============ */
export function InvoicesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [filter, setFilter] = useState<"all" | "unpaid" | "partial" | "paid">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => db.students.filter((x) => x.status === "active").map((x) => {
    const c = classOf(db, x)!; const total = feeTotal(db, c.level); const paid = paidBy(db, x.id);
    return { x, c, total, paid, bal: total - paid, state: paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid" } as const;
  }).filter((r) => {
    if (filter !== "all" && r.state !== filter) return false;
    if (q && !`${r.x.first} ${r.x.last} ${r.x.regNo}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.bal - a.bal), [db, filter, q]);
  const totals = useMemo(() => ({ billed: rows.reduce((a, r) => a + r.total, 0), paid: rows.reduce((a, r) => a + r.paid, 0), due: rows.reduce((a, r) => a + Math.max(0, r.bal), 0) }), [rows]);

  const remind = (name: string, bal: number, phone: string) => {
    logComm("SMS", phone || "+250 7XX", `Dear parent, a friendly reminder: ${bal > 0 ? fmtMoney(bal, cur) : "fees"} outstanding for ${name}. Kindly clear before month end. — ${db.school.name}`);
    toast(`Reminder sent for ${name}`);
  };

  return (
    <div>
      <PageHead title="Invoices & balances" sub="Every active student's billed, paid and outstanding amounts — live.">
        <button className="btn-o btn-sm" onClick={() => { rows.filter((r) => r.bal > 0).slice(0, 20).forEach((r) => logComm("SMS", r.x.parent.phone || "+250 7XX", `Fee reminder — ${r.x.first} ${r.x.last}: ${fmtMoney(r.bal, cur)} outstanding. — ${db.school.name}`)); audit("SEND_REMINDERS", "Invoices", `Bulk reminders to ${Math.min(20, rows.filter((r) => r.bal > 0).length)} parents`); toast("Bulk reminders queued via SMS"); }}><Ic n="sms" size={15} />Remind all unpaid</button>
      </PageHead>
      <div className="grid sm:grid-cols-3 gap-3.5 mb-4">
        {[["Total billed", totals.billed, "fees", "blue"], ["Collected", totals.paid, "check", "green"], ["Outstanding", Math.max(0, totals.due), "alert", "red"]].map(([l, v, ic, tone]) => (
          <div key={l as string} className="panel p-4 flex items-center gap-3.5">
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${tone === "red" ? "bg-rose-500" : tone === "green" ? "bg-emerald-500" : "bg-cobalt-600"}`}><Ic n={ic as string} /></span>
            <div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{l}</div><div className="font-display text-[19px] font-bold tnum">{fmtMoney(v as number, cur)}</div></div>
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2.5 p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative flex-1 min-w-[200px]"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Search student…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {(["all", "unpaid", "partial", "paid"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip cursor-pointer !py-2 !px-3.5 capitalize transition-colors ${filter === f ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>{f}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Student</th><th>Class</th><th className="!text-right">Billed</th><th className="!text-right">Paid</th><th className="!text-right">Balance</th><th>Status</th><th className="!text-right">Action</th></tr></thead>
            <tbody>
              {rows.slice(0, 40).map((r) => (
                <tr key={r.x.id}>
                  <td><span className="flex items-center gap-2.5"><Avatar first={r.x.first} last={r.x.last} hue={r.x.hue} size={30} /><span><b className="block text-[13px]">{r.x.first} {r.x.last}</b><span className="block text-[11px] text-ink-400 font-mono">{r.x.regNo}</span></span></span></td>
                  <td className="font-semibold text-[13px] whitespace-nowrap">{r.c.name} {r.c.section}</td>
                  <td className="text-right tnum font-semibold">{fmtMoney(r.total, cur)}</td>
                  <td className="text-right tnum font-semibold text-emerald-600">{fmtMoney(r.paid, cur)}</td>
                  <td className={`text-right tnum font-bold ${r.bal > 0 ? "text-rose-600" : "text-ink-300"}`}>{fmtMoney(Math.max(0, r.bal), cur)}</td>
                  <td><Chip tone={r.state === "paid" ? "green" : r.state === "partial" ? "amber" : "red"}>{r.state}</Chip></td>
                  <td className="text-right">{r.bal > 0 && <button className="btn-g btn-sm" onClick={() => remind(`${r.x.first} ${r.x.last}`, r.bal, r.x.parent.phone)}><Ic n="sms" size={14} />Remind</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 40 && <p className="text-[12px] text-ink-400 font-semibold px-4 py-3">Showing 40 of {rows.length} — refine with filters.</p>}
      </div>
    </div>
  );
}

/* ============ Expenses ============ */
export function ExpensesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [form, setForm] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [f, setF] = useState({ category: "Supplies", desc: "", amount: 0, vendor: "", method: "Cash", date: todayISO() });
  const [cat, setCat] = useState("all");
  const rows = db.expenses.filter((e) => cat === "all" || e.category === cat).sort((a, b) => b.date.localeCompare(a.date));
  const total = rows.reduce((a, b) => a + b.amount, 0);
  const save = () => {
    if (!f.desc || f.amount <= 0) { toast("Description and amount are required", "err"); return; }
    mutate((db) => db.expenses.unshift({ id: uid(), ...f, by: "Claudine U." }));
    audit("CREATE_EXPENSE", "Expense", `${f.category} — ${fmtMoney(f.amount, cur)}`);
    toast("Expense recorded"); setForm(false); setF({ category: "Supplies", desc: "", amount: 0, vendor: "", method: "Cash", date: todayISO() });
  };
  const cats = ["Salaries", "Electricity", "Internet", "Rent", "Maintenance", "Supplies", "Transport", "Equipment"];
  return (
    <div>
      <PageHead title="Expenses" sub={`${rows.length} records · total ${fmtMoney(total, cur)}`}>
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Record expense</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="flex gap-2 flex-wrap p-4 border-b border-ink-100 dark:border-ink-800">
          <button className={`chip cursor-pointer !py-2 !px-3.5 ${cat === "all" ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`} onClick={() => setCat("all")}>All</button>
          {cats.map((c) => <button key={c} className={`chip cursor-pointer !py-2 !px-3.5 ${cat === c ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Category</th><th>Description</th><th>Vendor</th><th>Method</th><th>Date</th><th className="!text-right">Amount</th><th className="!text-right">Actions</th></tr></thead>
            <tbody>
              {rows.slice(0, 25).map((e) => (
                <tr key={e.id}>
                  <td><Chip tone="navy">{e.category}</Chip></td>
                  <td className="font-semibold text-[13px]">{e.desc}</td>
                  <td className="text-[12.5px] text-ink-400">{e.vendor}</td>
                  <td className="text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">{e.method}</td>
                  <td className="text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDate(e.date)}</td>
                  <td className="text-right font-bold tnum text-rose-600">−{fmtMoney(e.amount, cur)}</td>
                  <td className="text-right"><button className="btn-g btn-sm !px-2 !text-rose-500" onClick={() => setDel(e.id)}><Ic n="trash" size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Record expense" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={save}><Ic n="check" size={15} />Save expense</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label={`Amount (${cur})`}><input type="number" className="input tnum" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></Field>
          <div className="col-span-2"><Field label="Description"><input className="input" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="e.g. REG electricity bill — March" /></Field></div>
          <Field label="Vendor"><input className="input" value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></Field>
          <Field label="Method"><select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{["Cash", "Bank", "Mobile Money", "Transfer"].map((m) => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        </div>
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title="Delete expense?" body="This expense record will be permanently removed from the ledger."
        onYes={() => { mutate((db) => { db.expenses = db.expenses.filter((x) => x.id !== del); }); audit("DELETE_EXPENSE", "Expense", "Expense record deleted"); toast("Expense deleted", "info"); }} />
    </div>
  );
}

/* ============ Financial reports ============ */
export function FinReportsPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const mk = monthKeys(8);
  const revBy = mk.map((m) => db.payments.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const expBy = mk.map((m) => db.expenses.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const byMethod = ["Cash", "Mobile Money", "Bank", "Card", "Transfer"].map((m) => ({ label: m, value: db.payments.filter((p) => p.method === m).reduce((a, b) => a + b.amount, 0) })).filter((x) => x.value > 0);
  const byClass = db.classes.map((c) => ({ label: `${c.name.slice(0, 2)}${c.level}${c.section}`, value: db.students.filter((x) => x.classId === c.id).reduce((a, x) => a + paidBy(db, x.id), 0) })).sort((a, b) => b.value - a.value).slice(0, 7);
  const byFeeType = ["Tuition", "Registration", "Examination", "Laboratory & ICT"].map((ft) => ({ label: ft, value: db.payments.filter((p) => p.feeType === ft).reduce((a, b) => a + b.amount, 0) }));
  const exportCSV = (name: string, rows: { label: string; value: number }[]) => {
    const blob = new Blob([["Category,Amount", ...rows.map((r) => `${r.label},${r.value}`)].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); toast("Report exported");
  };
  return (
    <div>
      <PageHead title="Financial reports" sub={`Revenue, expenses and collections — ${db.school.academicYear}.`}>
        <button className="btn-o btn-sm" onClick={() => exportCSV("revenue_by_month.csv", mk.map((m, i) => ({ label: m, value: revBy[i] })))}><Ic n="download" size={15} />CSV</button>
        <button className="btn-o btn-sm" onClick={() => window.print()}><Ic n="printer" size={15} />Print report</button>
      </PageHead>
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">Revenue vs expenses</h3><Chip tone="green">8 months</Chip></div>
          <div className="px-5 pb-5"><DuoBars data={mk.map((m, i) => ({ label: monthLabel(m), a: Math.round(revBy[i] / 1000), b: Math.round(expBy[i] / 1000) }))} aLabel="Revenue (K)" bLabel="Expenses (K)" money="K" /></div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">Net profit trend</h3><button className="btn-g btn-sm" onClick={() => exportCSV("profit.csv", mk.map((m, i) => ({ label: m, value: revBy[i] - expBy[i] })))}><Ic n="download" size={14} /></button></div>
          <div className="px-5 pb-5 space-y-2.5">
            {mk.map((m, i) => {
              const net = revBy[i] - expBy[i]; const max = Math.max(...mk.map((_, j) => Math.abs(revBy[j] - expBy[j])), 1);
              return (
                <div key={m} className="flex items-center gap-3 text-[12.5px]">
                  <span className="w-9 font-bold text-ink-400 uppercase text-[11px]">{monthLabel(m)}</span>
                  <div className="flex-1 h-4 rounded bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className={`h-full barx-anim ${net >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${(Math.abs(net) / max) * 100}%` }} /></div>
                  <b className={`tnum w-28 text-right ${net >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{net >= 0 ? "+" : "−"}{fmtMoney(Math.abs(net), "")}</b>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5"><div className="panel-h !px-0 !pt-0"><h3 className="font-display font-bold text-[16px]">By payment method</h3><button className="btn-g btn-sm" onClick={() => exportCSV("by_method.csv", byMethod)}><Ic n="download" size={14} /></button></div><HBars rows={byMethod} /></div>
        <div className="panel p-5"><div className="panel-h !px-0 !pt-0"><h3 className="font-display font-bold text-[16px]">Revenue by class</h3><button className="btn-g btn-sm" onClick={() => exportCSV("by_class.csv", byClass)}><Ic n="download" size={14} /></button></div><HBars rows={byClass} /></div>
        <div className="panel p-5"><div className="panel-h !px-0 !pt-0"><h3 className="font-display font-bold text-[16px]">By fee type</h3><button className="btn-g btn-sm" onClick={() => exportCSV("by_fee_type.csv", byFeeType)}><Ic n="download" size={14} /></button></div><HBars rows={byFeeType} /></div>
      </div>
      <p className="text-[12px] text-ink-400 font-semibold mt-4">Amounts in {cur}. Figures update in real time as payments and expenses are recorded.</p>
    </div>
  );
}
