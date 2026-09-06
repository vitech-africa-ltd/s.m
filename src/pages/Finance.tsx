import { useMemo, useState } from "react";
import { useApp, mutate, audit, notify, logComm, uid, todayISO, fmtDate, fmtDateShort, fmtMoney, fmtNum, classOf, feeTotal, paidBy, monthKeys, monthLabel, collectionRate } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, Avatar, Pagination, toast, PrintPortal, printNow, DuoBars, HBars, Empty } from "../components/ui";
import { personPhoto } from "../lib/media";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

/* ================= Fees ================= */
export function FeesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [level, setLevel] = useState(1);
  const fs = db.feeStructures.find((f) => f.level === level);
  const [form, setForm] = useState<{ open: boolean; item?: { id?: string; name: string; amount: number } }>({ open: false });
  const [del, setDel] = useState<string | null>(null);
  const saveItem = () => {
    const it = form.item!;
    if (!it.name.trim() || it.amount < 0) { toast("Name and a valid amount are required", "err"); return; }
    mutate((db) => {
      let f = db.feeStructures.find((x) => x.level === level);
      if (!f) { f = { level, items: [] }; db.feeStructures.push(f); }
      if (it.id) { const i = f.items.findIndex((x) => x.id === it.id); if (i >= 0) f.items[i] = { id: it.id, name: it.name, amount: it.amount }; }
      else f.items.push({ id: uid(), name: it.name, amount: it.amount });
    });
    audit("UPDATE_FEE_STRUCTURE", "Fees", `Senior ${level} — ${it.name}: ${it.amount}`);
    toast("Fee structure saved"); setForm({ open: false });
  };
  const total = fs?.items.reduce((a, b) => a + b.amount, 0) ?? 0;
  return (
    <div>
      <PageHead title="Fees & Structures" sub="Define tuition, registration and examination fees per level.">
        <button className="btn-p btn-sm" onClick={() => setForm({ open: true, item: { name: "", amount: 0 } })}><Ic n="plus" size={15} />Add fee item</button>
      </PageHead>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={`chip !py-2 !px-4 cursor-pointer transition-all ${level === l ? "bg-cobalt-600 text-white scale-105" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>Senior {l}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Fee item</th><th className="!text-right">Amount</th><th className="!text-right">Actions</th></tr></thead>
              <tbody>
                {(fs?.items ?? []).map((it) => (
                  <tr key={it.id}>
                    <td><span className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-gold-100 dark:bg-gold-500/15 text-gold-600 flex items-center justify-center"><Ic n="coins" size={16} /></span><b className="text-[13.5px]">{it.name}</b></span></td>
                    <td className="text-right font-bold tnum">{fmtMoney(it.amount, cur)}</td>
                    <td className="text-right whitespace-nowrap">
                      <button className="btn-g btn-sm !px-2" onClick={() => setForm({ open: true, item: { ...it } })}><Ic n="pencil" size={14} /></button>
                      <button className="btn-g btn-sm !px-2 !text-rose-500" onClick={() => setDel(it.id)}><Ic n="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
                {(!fs || fs.items.length === 0) && <tr><td colSpan={3}><Empty icon="fees" title="No fees defined for this level" body="Add tuition, registration and examination fees." /></td></tr>}
              </tbody>
              {fs && fs.items.length > 0 && (
                <tfoot><tr className="!bg-ink-50 dark:!bg-ink-950/60"><td className="font-extrabold">Total — Senior {level}</td><td className="text-right font-display font-bold text-[16px] tnum text-cobalt-700 dark:text-cobalt-300">{fmtMoney(total, cur)}</td><td /></tr></tfoot>
              )}
            </table>
          </div>
        </div>
        <div className="panel p-5 h-fit">
          <h3 className="font-display font-bold text-[15px] mb-3">Collection overview</h3>
          <div className="text-center py-3">
            <div className="font-display font-bold text-[34px] tnum">{collectionRate(db)}%</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-400">of annual fees collected</div>
          </div>
          <p className="text-[12.5px] text-ink-400 leading-relaxed">Outstanding balance: <b className="text-rose-500 tnum">{fmtMoney(db.students.filter((x) => x.status === "active").reduce((a, x) => a + Math.max(0, feeTotal(db, classOf(db, x)?.level ?? 1) - paidBy(db, x.id)), 0), cur)}</b></p>
        </div>
      </div>
      <Modal open={form.open} onClose={() => setForm({ open: false })} title={form.item?.id ? "Edit fee item" : "Add fee item"} w="max-w-sm"
        footer={<><button className="btn-o" onClick={() => setForm({ open: false })}>Cancel</button><button className="btn-p" onClick={saveItem}><Ic n="check" size={15} />Save</button></>}>
        <div className="space-y-4">
          <Field label="Fee name"><input className="input" value={form.item?.name ?? ""} onChange={(e) => setForm({ ...form, item: { ...form.item!, name: e.target.value } })} placeholder="e.g. Tuition" /></Field>
          <Field label={`Amount (${cur})`}><input type="number" className="input tnum" value={form.item?.amount ?? 0} onChange={(e) => setForm({ ...form, item: { ...form.item!, amount: +e.target.value } })} /></Field>
        </div>
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title="Delete fee item?" body="This removes the item from the fee structure. Existing payments are kept."
        onYes={() => { if (del) { mutate((db) => { const f = db.feeStructures.find((x) => x.level === level); if (f) f.items = f.items.filter((x) => x.id !== del); }); audit("DELETE_FEE_ITEM", "Fees", `Senior ${level}`); toast("Fee item deleted", "info"); } }} />
    </div>
  );
}

/* ================= Payments ================= */
export function PaymentsPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [f, setF] = useState({ studentId: "", amount: 0, method: "Mobile Money", feeType: "Tuition", note: "" });
  const filtered = useMemo(() => db.payments.filter((p) => {
    const st = db.students.find((x) => x.id === p.studentId);
    const ql = q.trim().toLowerCase();
    return !ql || p.receipt.toLowerCase().includes(ql) || (st && `${st.first} ${st.last} ${st.regNo}`.toLowerCase().includes(ql));
  }).sort((a, b) => b.date.localeCompare(a.date)), [db.payments, db.students, q]);
  const per = 10; const pages = Math.max(1, Math.ceil(filtered.length / per));
  const shown = filtered.slice((page - 1) * per, page * per);
  const record = () => {
    const st = db.students.find((x) => x.id === f.studentId);
    if (!st || f.amount <= 0) { toast("Select a student and a valid amount", "err"); return; }
    const rc = `${db.school.receiptPrefix}-${todayISO().slice(2).replace(/-/g, "")}-${String(db.payments.length + 1).padStart(4, "0")}`;
    mutate((db) => db.payments.unshift({ id: uid(), receipt: rc, studentId: f.studentId, amount: f.amount, method: f.method, feeType: f.feeType, date: todayISO(), note: f.note }));
    const bal = Math.max(0, feeTotal(db, classOf(db, st)?.level ?? 1) - paidBy(db, st.id));
    logComm("SMS", st.parent.phone, `Payment of ${fmtMoney(f.amount, cur)} received for ${st.first} ${st.last}. Remaining balance: ${fmtMoney(bal, cur)}. — ${db.school.name}`);
    audit("RECORD_PAYMENT", "Payments", `${rc} · ${fmtMoney(f.amount, cur)} · ${st.first} ${st.last}`);
    notify("payment", "Payment received", `${rc} · ${fmtMoney(f.amount, cur)} — ${st.first} ${st.last}`);
    toast(`Payment recorded — receipt ${rc}`);
    setReceipt(rc); setForm(false); setF({ studentId: "", amount: 0, method: "Mobile Money", feeType: "Tuition", note: "" });
  };
  const rp = receipt ? db.payments.find((p) => p.receipt === receipt) : null;
  const rst = rp ? db.students.find((x) => x.id === rp.studentId) : null;
  return (
    <div>
      <PageHead title="Payments" sub={`${db.payments.length} payments recorded · official receipts generated automatically.`}>
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Record payment</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative max-w-sm"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Search receipt or student…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Receipt</th><th>Student</th><th className="hidden md:table-cell">Method</th><th className="hidden sm:table-cell">Date</th><th className="!text-right">Amount</th><th className="!text-right">Receipt</th></tr></thead>
            <tbody>
              {shown.map((p) => {
                const st = db.students.find((x) => x.id === p.studentId);
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 whitespace-nowrap">{p.receipt}</td>
                    <td><span className="flex items-center gap-2.5">{st && <Avatar first={st.first} last={st.last} hue={st.hue} size={30} photo={personPhoto(st)} />}<span><b className="block text-[13px]">{st?.first} {st?.last}</b><span className="block text-[11px] text-ink-400">{st?.regNo}</span></span></span></td>
                    <td className="hidden md:table-cell"><Chip tone={p.method === "Mobile Money" ? "gold" : p.method === "Cash" ? "green" : "blue"}>{p.method}</Chip></td>
                    <td className="hidden sm:table-cell text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDateShort(p.date)}</td>
                    <td className="text-right font-bold tnum whitespace-nowrap">{fmtMoney(p.amount, cur)}</td>
                    <td className="text-right"><button className="btn-o btn-sm" onClick={() => setReceipt(p.receipt)}><Ic n="printer" size={13} />View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} shown={shown.length} />
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Record payment" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={record}><Ic n="check" size={15} />Record & generate receipt</button></>}>
        <div className="space-y-4">
          <Field label="Student"><select className="input" value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })}><option value="">Select…</option>{db.students.filter((x) => x.status === "active").map((x) => <option key={x.id} value={x.id}>{x.first} {x.last} — {x.regNo}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Amount (${cur})`}><input type="number" className="input tnum" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></Field>
            <Field label="Method"><select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{["Mobile Money", "Cash", "Bank", "Card", "Transfer"].map((m) => <option key={m}>{m}</option>)}</select></Field>
          </div>
          <Field label="Fee type"><select className="input" value={f.feeType} onChange={(e) => setF({ ...f, feeType: e.target.value })}>{["Tuition", "Registration", "Examination", "Transport", "Other"].map((m) => <option key={m}>{m}</option>)}</select></Field>
        </div>
      </Modal>
      {rp && rst && (
        <Modal open onClose={() => setReceipt(null)} title={`Receipt ${rp.receipt}`} w="max-w-md"
          footer={<><button className="btn-o" onClick={() => setReceipt(null)}>Close</button><button className="btn-p" onClick={() => printNow(<ReceiptDoc receipt={rp.receipt} />)}><Ic n="printer" size={15} />Print</button></>}>
          <ReceiptDoc receipt={rp.receipt} />
        </Modal>
      )}
    </div>
  );
}

function ReceiptDoc({ receipt }: { receipt: string }) {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const p = db.payments.find((x) => x.receipt === receipt);
  const st = p ? db.students.find((x) => x.id === p.studentId) : null;
  if (!p || !st) return null;
  const c = classOf(db, st);
  const bal = Math.max(0, feeTotal(db, c?.level ?? 1) - paidBy(db, st.id));
  return (
    <div className="print-card mx-auto max-w-[420px] bg-white text-ink-900 border border-ink-200 rounded-lg overflow-hidden">
      <div className="bg-ink-950 text-white px-5 py-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-lg bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-lg">{(db.school.logoText || "V")[0]}</span>
        <div><div className="font-display font-bold text-[15px]">{db.school.name}</div><div className="text-[10px] uppercase tracking-[0.16em] text-gold-300">Official receipt</div></div>
      </div>
      <div className="p-5">
        <div className="text-center font-mono font-bold text-[18px] text-cobalt-700 mb-3">{p.receipt}</div>
        <div className="space-y-2 text-[13px]">
          {[["Student", `${st.first} ${st.last} (${st.regNo})`], ["Class", `${c?.name} ${c?.section}`], ["Parent", st.parent.name], ["Fee type", p.feeType], ["Method", p.method], ["Date", fmtDate(p.date)]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><span className="text-ink-400 font-semibold">{k}</span><b className="text-right">{v}</b></div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t-2 border-ink-950 flex justify-between items-center">
          <span className="font-extrabold uppercase text-[12px]">Amount paid</span>
          <span className="font-display font-bold text-[24px] tnum">{fmtMoney(p.amount, cur)}</span>
        </div>
        <div className="mt-2 text-[12px] text-ink-400">Remaining balance: <b className="text-rose-500 tnum">{fmtMoney(bal, cur)}</b></div>
        <div className="mt-5 text-center text-[10px] text-ink-400">Thank you · {db.school.phone} · {db.school.email}</div>
      </div>
    </div>
  );
}

/* ================= Invoices ================= */
export function InvoicesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const rows = db.students.filter((x) => x.status === "active").map((st) => {
    const total = feeTotal(db, classOf(db, st)?.level ?? 1);
    const paid = paidBy(db, st.id);
    return { st, total, paid, bal: total - paid };
  }).sort((a, b) => b.bal - a.bal);
  const remind = (name: string, bal: number) => {
    logComm("SMS", "parent", `Fee reminder — outstanding balance ${fmtMoney(bal, cur)} for ${name}. — ${db.school.name}`);
    audit("SEND_REMINDER", "Invoices", `Fee reminder → ${name}`);
    toast(`Reminder sent to ${name}'s parent`);
  };
  return (
    <div>
      <PageHead title="Invoices" sub="Outstanding balances per student — send reminders in one click." />
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Student</th><th className="!text-right">Total fees</th><th className="!text-right">Paid</th><th className="!text-right">Balance</th><th className="!text-right">Action</th></tr></thead>
            <tbody>
              {rows.slice(0, 20).map(({ st, total, paid, bal }) => (
                <tr key={st.id}>
                  <td><span className="flex items-center gap-2.5"><Avatar first={st.first} last={st.last} hue={st.hue} size={30} photo={personPhoto(st)} /><span><b className="block text-[13px]">{st.first} {st.last}</b><span className="block text-[11px] text-ink-400">{classOf(db, st)?.name} {classOf(db, st)?.section}</span></span></span></td>
                  <td className="text-right tnum font-semibold whitespace-nowrap">{fmtMoney(total, cur)}</td>
                  <td className="text-right tnum text-emerald-600 whitespace-nowrap">{fmtMoney(paid, cur)}</td>
                  <td className={`text-right tnum font-bold whitespace-nowrap ${bal > 0 ? "text-rose-500" : "text-emerald-600"}`}>{fmtMoney(Math.max(0, bal), cur)}</td>
                  <td className="text-right">{bal > 0 ? <button className="btn-o btn-sm" onClick={() => remind(`${st.first} ${st.last}`, bal)}><Ic n="sms" size={13} />Remind</button> : <Chip tone="green">Settled</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= Expenses ================= */
export function ExpensesPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ category: "Supplies", desc: "", amount: 0, vendor: "", method: "Cash" });
  const add = () => {
    if (!f.desc.trim() || f.amount <= 0) { toast("Description and a valid amount are required", "err"); return; }
    mutate((db) => db.expenses.unshift({ id: uid(), category: f.category, desc: f.desc, amount: f.amount, date: todayISO(), vendor: f.vendor, method: f.method, by: "Jean Bosco" }));
    audit("RECORD_EXPENSE", "Expenses", `${f.category} · ${fmtMoney(f.amount, cur)}`);
    toast("Expense recorded"); setForm(false); setF({ category: "Supplies", desc: "", amount: 0, vendor: "", method: "Cash" });
  };
  const total = db.expenses.reduce((a, b) => a + b.amount, 0);
  const byCat = ["Salaries", "Electricity", "Internet", "Rent", "Maintenance", "Supplies", "Transport", "Equipment", "Other"].map((c) => ({ label: c, value: db.expenses.filter((e) => e.category === c).reduce((a, b) => a + b.amount, 0) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
  return (
    <div>
      <PageHead title="Expenses" sub={`${fmtNum(db.expenses.length)} expenses · total ${fmtMoney(total, cur)}`}>
        <button className="btn-p btn-sm" onClick={() => setForm(true)}><Ic n="plus" size={15} />Add expense</button>
      </PageHead>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Category</th><th>Description</th><th className="hidden sm:table-cell">Date</th><th className="!text-right">Amount</th></tr></thead>
              <tbody>
                {[...db.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map((e) => (
                  <tr key={e.id}>
                    <td><Chip tone="navy">{e.category}</Chip></td>
                    <td><b className="block text-[13px]">{e.desc}</b><span className="block text-[11px] text-ink-400">{e.vendor} · {e.method}</span></td>
                    <td className="hidden sm:table-cell text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDateShort(e.date)}</td>
                    <td className="text-right font-bold tnum text-rose-500 whitespace-nowrap">−{fmtMoney(e.amount, cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel p-5 h-fit">
          <h3 className="font-display font-bold text-[15px] mb-4">By category</h3>
          <HBars rows={byCat.slice(0, 6)} money={cur} />
        </div>
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Add expense" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setForm(false)}>Cancel</button><button className="btn-p" onClick={add}><Ic n="check" size={15} />Save expense</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Salaries", "Electricity", "Internet", "Rent", "Maintenance", "Supplies", "Transport", "Equipment", "Other"].map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label={`Amount (${cur})`}><input type="number" className="input tnum" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></Field>
          </div>
          <Field label="Description"><input className="input" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="e.g. Classroom repairs" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vendor"><input className="input" value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></Field>
            <Field label="Method"><select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{["Cash", "Bank", "Mobile Money"].map((m) => <option key={m}>{m}</option>)}</select></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= Financial Reports ================= */
export function FinReportsPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const mk = monthKeys(8);
  const revBy = mk.map((m) => db.payments.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const expBy = mk.map((m) => db.expenses.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const totRev = revBy.reduce((a, b) => a + b, 0);
  const totExp = expBy.reduce((a, b) => a + b, 0);
  const byMethod = ["Mobile Money", "Cash", "Bank", "Card", "Transfer"].map((m) => ({ label: m, value: db.payments.filter((p) => p.method === m).reduce((a, b) => a + b.amount, 0) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
  const printReport = () => printNow(
    <div className="p-2 max-w-[760px] mx-auto">
      <div className="flex items-end justify-between border-b-4 border-ink-950 pb-3 mb-4">
        <div><div className="font-display font-bold text-[22px]">{db.school.name}</div><div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Financial report — last 8 months</div></div>
        <div className="text-right text-[11px] text-ink-500">Generated {fmtDate(todayISO())}<br />{db.school.academicYear}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[["Total revenue", fmtMoney(totRev, cur)], ["Total expenses", fmtMoney(totExp, cur)], ["Net", fmtMoney(totRev - totExp, cur)]].map(([k, v]) => (
          <div key={k} className="border border-ink-300 rounded-lg p-3 text-center"><div className="font-display font-bold text-[16px] tnum">{v}</div><div className="text-[9.5px] font-extrabold uppercase text-ink-400">{k}</div></div>
        ))}
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead><tr><th className="border border-ink-300 bg-ink-100 px-2 py-1.5 text-left">Month</th><th className="border border-ink-300 bg-ink-100 px-2 py-1.5 text-right">Revenue</th><th className="border border-ink-300 bg-ink-100 px-2 py-1.5 text-right">Expenses</th><th className="border border-ink-300 bg-ink-100 px-2 py-1.5 text-right">Net</th></tr></thead>
        <tbody>{mk.map((m, i) => (<tr key={m}><td className="border border-ink-300 px-2 py-1.5">{monthLabel(m)}</td><td className="border border-ink-300 px-2 py-1.5 text-right tnum">{fmtMoney(revBy[i], cur)}</td><td className="border border-ink-300 px-2 py-1.5 text-right tnum">{fmtMoney(expBy[i], cur)}</td><td className="border border-ink-300 px-2 py-1.5 text-right tnum font-bold">{fmtMoney(revBy[i] - expBy[i], cur)}</td></tr>))}</tbody>
      </table>
    </div>
  );
  return (
    <div>
      <PageHead title="Financial Reports" sub="Revenue, expenses and profit — exportable and printable.">
        <button className="btn-o btn-sm" onClick={() => { const blob = new Blob([["Month,Revenue,Expenses,Net", ...mk.map((m, i) => [m, revBy[i], expBy[i], revBy[i] - expBy[i]].join(","))].join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "financial-report.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); toast("Report exported to CSV"); }}><Ic n="download" size={15} />Export CSV</button>
        <button className="btn-p btn-sm" onClick={printReport}><Ic n="printer" size={15} />Print report</button>
      </PageHead>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {[["Total revenue", totRev, "coins", "green" as const], ["Total expenses", totExp, "expenses", "red" as const], ["Net profit", totRev - totExp, "analytics", "blue" as const], ["Collection rate", collectionRate(db), "payment", "gold" as const]].map(([l, v, ic, tone]) => (
          <div key={l as string} className="panel p-4 flex items-center gap-3.5">
            <span className={`w-10 h-10 rounded-lg text-white flex items-center justify-center ${tone === "green" ? "bg-emerald-500" : tone === "red" ? "bg-rose-500" : tone === "gold" ? "bg-gold-400 !text-ink-950" : "bg-cobalt-600"}`}><Ic n={ic as string} /></span>
            <div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{l as string}</div><div className="font-display text-[19px] font-bold tnum">{(l as string) === "Collection rate" ? `${v}%` : fmtMoney(v as number, cur)}</div></div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel"><div className="panel-h"><h3 className="font-display font-bold text-[16px]">Revenue vs Expenses</h3><Chip tone="blue">{cur}</Chip></div><div className="px-5 pb-5"><DuoBars data={mk.map((m, i) => ({ label: monthLabel(m), a: Math.round(revBy[i] / 1000), b: Math.round(expBy[i] / 1000) }))} aLabel="Revenue" bLabel="Expenses" money="K" /></div></div>
        <div className="panel"><div className="panel-h"><h3 className="font-display font-bold text-[16px]">Revenue by method</h3></div><div className="px-5 pb-5"><HBars rows={byMethod} money={cur} /></div></div>
      </div>
    </div>
  );
}
