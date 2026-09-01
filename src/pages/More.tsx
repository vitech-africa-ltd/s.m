import { useMemo, useState } from "react";
import { useApp, mutate, audit, notify, uid, todayISO, fmtDate, fmtMoney, fmtNum, monthKeys, monthLabel, attPct, collectionRate, type Plan } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Field, Chip, Avatar, Empty, toast, AreaChart, Donut, HBars, PrintPortal, Ring, printNow } from "../components/ui";
import { PageHead } from "./Dashboard";
import { useCountUp } from "../components/ui";

/* ================= Library ================= */
export function LibraryPage() {
  const s = useApp();
  const db = s.db;
  const [q, setQ] = useState("");
  const [borrow, setBorrow] = useState<string | null>(null);
  const [who, setWho] = useState(db.students[0]?.id ?? "");
  const books = db.books.filter((b) => `${b.title} ${b.author} ${b.category} ${b.isbn}`.toLowerCase().includes(q.toLowerCase()));
  const activeLoans = db.loans.filter((l) => !l.returned);
  const doBorrow = () => {
    if (!borrow) return;
    const st = db.students.find((x) => x.id === who);
    mutate((db) => {
      const b = db.books.find((x) => x.id === borrow)!;
      b.available = Math.max(0, b.available - 1);
      db.loans.unshift({ id: uid(), bookId: borrow, borrower: st ? `${st.first} ${st.last}` : "Guest", type: "student", date: todayISO(), due: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10), fine: 0 });
    });
    audit("BORROW_BOOK", "Library", `“${db.books.find((b) => b.id === borrow)?.title}” → ${st?.first} ${st?.last}`);
    toast("Book issued — due in 14 days"); setBorrow(null);
  };
  const ret = (id: string) => {
    mutate((db) => {
      const l = db.loans.find((x) => x.id === id)!; l.returned = todayISO();
      const b = db.books.find((x) => x.id === l.bookId); if (b) b.available++;
    });
    audit("RETURN_BOOK", "Library", "Book returned"); toast("Book returned");
  };
  return (
    <div>
      <PageHead title="Library" sub={`${db.books.reduce((a, b) => a + b.copies, 0)} copies · ${activeLoans.length} on loan · ${activeLoans.filter((l) => l.due < todayISO()).length} overdue`}>
        <button className="btn-o btn-sm" onClick={() => toast("Catalogue exported", "info")}><Ic n="download" size={15} />Catalogue</button>
      </PageHead>
      <div className="grid sm:grid-cols-4 gap-3.5 mb-4">
        {[["Titles", db.books.length, "book"], ["Total copies", db.books.reduce((a, b) => a + b.copies, 0), "folder"], ["On loan", activeLoans.length, "swap"], ["Overdue fines", fmtMoney(activeLoans.reduce((a, l) => a + l.fine, 0), db.school.currency), "coins"]].map(([l, v, ic]) => (
          <div key={l as string} className="panel p-4 flex items-center gap-3.5"><span className="w-10 h-10 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n={ic as string} /></span><div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{l}</div><div className="font-display text-[18px] font-bold tnum">{v}</div></div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-ink-100 dark:border-ink-800"><div className="relative max-w-sm"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Search title, author, ISBN…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Title</th><th>Category</th><th>ISBN</th><th>Copies</th><th className="!text-right">Action</th></tr></thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <td><span className="flex items-center gap-3"><span className="w-8 h-10 rounded bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center text-[9px] font-display font-bold shrink-0">{b.category.slice(0, 3).toUpperCase()}</span><span><b className="block text-[13px]">{b.title}</b><span className="block text-[11px] text-ink-400">{b.author}</span></span></span></td>
                    <td><Chip tone="blue">{b.category}</Chip></td>
                    <td className="font-mono text-[11.5px] text-ink-400">{b.isbn}</td>
                    <td><b className="tnum">{b.available}</b><span className="text-ink-300 text-[12px]"> / {b.copies}</span></td>
                    <td className="text-right"><button className="btn-o btn-sm" disabled={b.available === 0} onClick={() => setBorrow(b.id)}><Ic n="swap" size={13} />Issue</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel p-5 h-fit">
          <h3 className="font-display font-bold text-[15px] mb-3">Active loans</h3>
          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {activeLoans.length === 0 && <p className="text-[12.5px] text-ink-300 font-semibold">No books on loan.</p>}
            {activeLoans.map((l) => {
              const b = db.books.find((x) => x.id === l.bookId);
              const over = l.due < todayISO();
              return (
                <div key={l.id} className={`rounded-lg border px-3 py-2.5 ${over ? "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-500/5" : "border-ink-100 dark:border-ink-800"}`}>
                  <div className="flex items-center justify-between gap-2"><b className="text-[12.5px] truncate">{b?.title}</b>{over ? <Chip tone="red">overdue</Chip> : <Chip tone="green">due {fmtDate(l.due).slice(0, 6)}</Chip>}</div>
                  <div className="flex items-center justify-between mt-1 text-[11.5px] text-ink-400"><span>{l.borrower} ({l.type})</span>{over && <b className="text-rose-500 tnum">fine {fmtMoney(l.fine, db.school.currency)}</b>}</div>
                  <button className="btn-g btn-sm mt-1.5 w-full" onClick={() => ret(l.id)}><Ic n="check" size={13} />Mark returned</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Modal open={!!borrow} onClose={() => setBorrow(null)} title="Issue book" w="max-w-sm"
        footer={<><button className="btn-o" onClick={() => setBorrow(null)}>Cancel</button><button className="btn-p" onClick={doBorrow}><Ic n="check" size={15} />Issue book</button></>}>
        <Field label="Borrower (student)">
          <select className="input" value={who} onChange={(e) => setWho(e.target.value)}>{db.students.slice(0, 80).map((x) => <option key={x.id} value={x.id}>{x.first} {x.last} — {x.regNo}</option>)}</select>
        </Field>
        <p className="text-[12px] text-ink-400 font-semibold mt-3">Loan period is 14 days. A fine of 500 {db.school.currency}/day applies after the due date.</p>
      </Modal>
    </div>
  );
}

/* ================= Transport ================= */
export function TransportPage() {
  const s = useApp();
  const db = s.db;
  return (
    <div>
      <PageHead title="School transport" sub={`${db.vehicles.length} vehicles · ${db.routes.length} routes · ${db.routes.reduce((a, r) => a + r.students, 0)} subscribers`} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3.5">
          <h3 className="font-display font-bold text-[16px]">Fleet</h3>
          {db.vehicles.map((v) => {
            const r = db.routes.find((x) => x.id === v.routeId);
            return (
              <div key={v.id} className="panel p-4 flex items-center gap-4 hover:shadow-lift transition-shadow">
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${v.status === "active" ? "bg-cobalt-600 text-white" : "bg-amber-100 dark:bg-amber-500/15 text-amber-600"}`}><Ic n="bus" size={22} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><b className="font-display text-[15px]">{v.model}</b><Chip tone="navy" className="font-mono">{v.plate}</Chip><Chip tone={v.status === "active" ? "green" : "amber"}>{v.status}</Chip></div>
                  <p className="text-[12px] text-ink-400 font-semibold mt-0.5">Driver: {v.driver} · {v.capacity} seats · {r?.name}</p>
                  <p className="text-[11.5px] text-ink-300 font-semibold">Insurance: {v.insurance}</p>
                </div>
                <button className="btn-g btn-sm" onClick={() => { mutate((db) => { const x = db.vehicles.find((y) => y.id === v.id)!; x.status = x.status === "active" ? "maintenance" : "active"; }); toast(`${v.plate} → ${v.status === "active" ? "maintenance" : "active"}`, "info"); }}><Ic n="settings" size={14} /></button>
              </div>
            );
          })}
        </div>
        <div className="space-y-3.5">
          <h3 className="font-display font-bold text-[16px]">Routes & stops</h3>
          {db.routes.map((r) => (
            <div key={r.id} className="panel p-4">
              <div className="flex items-center justify-between"><b className="font-display text-[15px]">{r.name}</b><Chip tone="gold">{fmtMoney(r.fee, db.school.currency)}/term</Chip></div>
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {r.stops.map((st, i) => (
                  <span key={st} className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink-500 dark:text-ink-300">
                    <span className="w-2 h-2 rounded-full bg-cobalt-500" />{st}{i < r.stops.length - 1 && <span className="w-4 h-px bg-ink-200 dark:bg-ink-700" />}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-[12px] font-semibold text-ink-400"><span>{r.students} students subscribed</span><button className="btn-g btn-sm" onClick={() => toast("Route manifest exported", "info")}><Ic n="download" size={13} />Manifest</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= HR ================= */
export function HRPage() {
  const s = useApp();
  const db = s.db;
  const [tab, setTab] = useState<"staff" | "leaves">("staff");
  const decide = (id: string, st: "approved" | "rejected") => { mutate((db) => { const l = db.leaves.find((x) => x.id === id)!; l.status = st; }); audit("UPDATE_LEAVE", "HR", `Leave ${st}`); toast(`Leave ${st}`); };
  return (
    <div>
      <PageHead title="HR & Staff" sub={`${db.staff.length} non-teaching staff · payroll ${fmtMoney(db.staff.reduce((a, b) => a + b.salary, 0), db.school.currency)}/month`}>
        <div className="panel !shadow-none p-1 flex gap-1">
          {([["staff", "Staff"], ["leaves", `Leave requests (${db.leaves.filter((l) => l.status === "pending").length})`]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${tab === id ? "bg-cobalt-600 text-white" : "text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"}`}>{label}</button>
          ))}
        </div>
      </PageHead>
      {tab === "staff" ? (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Hired</th><th>Salary</th><th>Status</th></tr></thead>
              <tbody>
                {db.staff.map((x) => (
                  <tr key={x.id}>
                    <td><span className="flex items-center gap-3"><Avatar first={x.name.split(" ")[0]} last={x.name.split(" ")[1] ?? ""} hue={(x.name.length * 31) % 360} size={32} /><span><b className="block text-[13px]">{x.name}</b><span className="block text-[11px] text-ink-400 font-mono">{x.empNo}</span></span></span></td>
                    <td><Chip tone="blue">{x.dept}</Chip></td>
                    <td className="font-semibold text-[13px]">{x.position}</td>
                    <td className="text-[12.5px] text-ink-400 whitespace-nowrap">{fmtDate(x.hired)}</td>
                    <td className="font-bold tnum">{fmtMoney(x.salary, db.school.currency)}</td>
                    <td><Chip tone={x.status === "active" ? "green" : "amber"}>{x.status}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {db.leaves.map((l) => (
            <div key={l.id} className="panel p-5">
              <div className="flex items-center justify-between"><b className="font-display text-[15px]">{l.staffName}</b><Chip tone={l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "amber"}>{l.status}</Chip></div>
              <p className="text-[13px] font-semibold text-ink-500 dark:text-ink-300 mt-1">{l.type}</p>
              <p className="text-[12.5px] text-ink-400 mt-2">{fmtDate(l.from)} → {fmtDate(l.to)}</p>
              {l.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button className="btn-p btn-sm flex-1" onClick={() => decide(l.id, "approved")}><Ic n="check" size={13} />Approve</button>
                  <button className="btn-d btn-sm flex-1" onClick={() => decide(l.id, "rejected")}><Ic n="x" size={13} />Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= Documents ================= */
export function DocumentsPage() {
  const s = useApp();
  const db = s.db;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = ["all", ...new Set(db.documents.map((d) => d.category))];
  const docs = db.documents.filter((d) => (cat === "all" || d.category === cat) && d.name.toLowerCase().includes(q.toLowerCase()));
  const kindIc = { pdf: "file", img: "eye", xls: "grades", doc: "exams" } as const;
  return (
    <div>
      <PageHead title="Documents" sub="Central storage with role-based access control.">
        <button className="btn-p btn-sm" onClick={() => { mutate((db) => db.documents.unshift({ id: uid(), name: `Upload ${db.documents.length + 1}.pdf`, category: "School policies", size: "1.1 MB", date: todayISO(), by: "Jean Bosco", kind: "pdf" })); audit("UPLOAD_DOCUMENT", "Documents", "New file uploaded"); toast("Document uploaded"); }}><Ic n="upload" size={15} />Upload</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2.5 p-4 border-b border-ink-100 dark:border-ink-800">
          <div className="relative flex-1 min-w-[200px]"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip cursor-pointer !py-2 !px-3.5 capitalize ${cat === c ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>{c}</button>)}
        </div>
        {docs.length === 0 ? <Empty icon="folder" title="No documents found" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4">
            {docs.map((d) => (
              <div key={d.id} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 hover:border-cobalt-300 dark:hover:border-cobalt-700 hover:shadow-panel transition-all group">
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform"><Ic n={kindIc[d.kind]} size={18} /></span>
                  <Chip tone="gray">{d.size}</Chip>
                </div>
                <b className="block text-[13.5px] mt-3 leading-snug">{d.name}</b>
                <p className="text-[11.5px] text-ink-400 font-semibold mt-0.5">{d.category} · {fmtDate(d.date)} · {d.by}</p>
                <div className="flex gap-1.5 mt-3">
                  <button className="btn-g btn-sm flex-1" onClick={() => toast(`Preview — ${d.name}`, "info")}><Ic n="eye" size={13} />View</button>
                  <button className="btn-g btn-sm flex-1" onClick={() => { audit("DOWNLOAD_DOCUMENT", "Documents", d.name); toast(`Downloading ${d.name}`); }}><Ic n="download" size={13} />Get</button>
                  <button className="btn-g btn-sm !px-2 !text-rose-500" onClick={() => { mutate((db) => { db.documents = db.documents.filter((x) => x.id !== d.id); }); toast("Document deleted", "info"); }} aria-label="Delete"><Ic n="trash" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Certificates ================= */
export function CertificatesPage() {
  const s = useApp();
  const db = s.db;
  const [issue, setIssue] = useState(false);
  const [f, setF] = useState({ type: "Certificate of Completion", recipient: "", note: "" });
  const doIssue = () => {
    if (!f.recipient) { toast("Recipient is required", "err"); return; }
    const code = `VTC-${todayISO().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    mutate((db) => db.certificates.unshift({ id: uid(), code, type: f.type, recipient: f.recipient, date: todayISO(), note: f.note, valid: true }));
    audit("ISSUE_CERTIFICATE", "Certificate", `${f.type} — ${f.recipient} (${code})`);
    toast(`Certificate issued · verify code ${code}`); setIssue(false); setF({ type: "Certificate of Completion", recipient: "", note: "" });
  };
  return (
    <div>
      <PageHead title="Certificates" sub="Generated with QR verification codes — anyone can verify authenticity.">
        <button className="btn-p btn-sm" onClick={() => setIssue(true)}><Ic n="plus" size={15} />Issue certificate</button>
      </PageHead>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.certificates.map((c) => (
          <div key={c.id} className={`panel p-5 relative overflow-hidden ${!c.valid ? "opacity-60" : ""}`}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[10px] border-gold-200 dark:border-gold-800/40" />
            <div className="flex items-center justify-between"><Ic n="award" size={22} className="text-gold-500" /><Chip tone={c.valid ? "green" : "red"}>{c.valid ? "Valid" : "Revoked"}</Chip></div>
            <h3 className="font-display font-bold text-[16px] mt-3">{c.type}</h3>
            <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-0.5">Awarded to <b className="text-ink-800 dark:text-ink-100">{c.recipient}</b></p>
            {c.note && <p className="text-[12px] text-ink-400 mt-1">{c.note}</p>}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-ink-200 dark:border-ink-700">
              <span className="font-mono text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300">{c.code}</span>
              <span className="text-[11.5px] text-ink-400 font-semibold">{fmtDate(c.date)}</span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="btn-o btn-sm flex-1" onClick={() => printNow(
                <div className="max-w-[720px] mx-auto p-8">
                  <div className="border-[3px] border-ink-950 p-1.5">
                    <div className="border border-gold-500 px-10 py-12 text-center relative">
                      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-gold-500" /><div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-gold-500" />
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-gold-500" /><div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-gold-500" />
                      <div className="flex items-center justify-center gap-3"><span className="w-10 h-10 rounded-lg bg-ink-950 text-gold-400 flex items-center justify-center font-display font-bold">{db.school.logoText[0]}</span><span className="font-display font-bold text-[15px] uppercase tracking-[0.2em]">{db.school.name}</span></div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400 mt-6">This is to certify that</div>
                      <div className="font-display font-bold text-[34px] mt-2">{c.recipient}</div>
                      <div className="text-[12px] text-ink-500 mt-3 max-w-md mx-auto">has been awarded the</div>
                      <div className="font-display font-bold text-[22px] text-cobalt-800 mt-1">{c.type}</div>
                      {c.note && <div className="text-[12px] text-ink-500 mt-2">{c.note}</div>}
                      <div className="flex items-end justify-between mt-10 px-4">
                        <div className="text-center"><div className="border-t border-ink-400 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 w-36">Principal</div></div>
                        <div className="text-center"><div className="font-display font-bold text-[13px]">{fmtDate(c.date)}</div><div className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mt-1">Date</div></div>
                        <div className="text-center"><div className="border-t border-ink-400 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 w-36">Registrar</div></div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-6 text-[10px] font-mono font-bold text-ink-400">Verify: {db.school.website}/#/verify · Code {c.code}</div>
                    </div>
                  </div>
                </div>
              )}><Ic n="printer" size={13} />Print</button>
              <button className="btn-g btn-sm !px-2.5" onClick={() => { mutate((db) => { const x = db.certificates.find((y) => y.id === c.id)!; x.valid = !x.valid; }); audit("REVOKE_CERTIFICATE", "Certificate", `${c.code} ${c.valid ? "revoked" : "restored"}`); toast(c.valid ? "Certificate revoked" : "Certificate restored", "info"); }} aria-label="Toggle validity"><Ic n="shield" size={13} /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={issue} onClose={() => setIssue(false)} title="Issue certificate" w="max-w-md"
        footer={<><button className="btn-o" onClick={() => setIssue(false)}>Cancel</button><button className="btn-p" onClick={doIssue}><Ic n="award" size={15} />Issue with QR code</button></>}>
        <div className="space-y-4">
          <Field label="Certificate type"><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["Certificate of Completion", "Certificate of Graduation", "Attendance Certificate", "Training Certificate", "Achievement Certificate"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Recipient"><input className="input" value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Note"><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Senior 6 — Class of 2026" /></Field>
        </div>
      </Modal>
    </div>
  );
}

export function VerifyPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | "ok" | "bad" | "none">(null);
  const found = s.db.certificates.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  const check = () => setResult(!found ? "none" : found.valid ? "ok" : "bad");
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer"><span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-lg">V</span><span className="font-display font-bold text-[16px]">VITECH School</span></button>
        <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />Back</button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md text-center">
          <span className="w-16 h-16 rounded-2xl bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center mx-auto"><Ic n="qr" size={30} /></span>
          <h1 className="font-display text-[28px] font-bold mt-5">Verify a certificate</h1>
          <p className="text-[14px] text-ink-400 mt-1.5">Enter the code printed on the certificate or scan its QR code.</p>
          <div className="panel p-6 mt-6 text-left">
            <Field label="Certificate code"><input className="input font-mono text-center tracking-widest" placeholder="VTC-2026-4821" value={code} onChange={(e) => { setCode(e.target.value); setResult(null); }} onKeyDown={(e) => e.key === "Enter" && check()} /></Field>
            <button className="btn-p w-full mt-4" onClick={check} disabled={!code.trim()}><Ic n="shield" size={15} />Verify authenticity</button>
            {result === "ok" && found && (
              <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 p-4 pop-in">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300"><Ic n="check" size={16} sw={2.6} />Authentic certificate</div>
                <div className="text-[13px] mt-2 space-y-1"><b>{found.type}</b><div className="text-ink-500 dark:text-ink-300">Awarded to <b>{found.recipient}</b> · {fmtDate(found.date)}</div><div className="text-ink-400">{found.note}</div></div>
              </div>
            )}
            {result === "bad" && found && <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800 p-4 pop-in text-[13px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2"><Ic n="alert" size={16} />This certificate has been revoked by the issuer.</div>}
            {result === "none" && <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 p-4 pop-in text-[13px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2"><Ic n="info" size={16} />No certificate found with this code. Try VTC-2026-4821.</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= ID Cards ================= */
export function IDCardsPage() {
  const s = useApp();
  const db = s.db;
  const [type, setType] = useState<"student" | "teacher">("student");
  const [cls, setCls] = useState(db.classes[0]?.id ?? "");
  const list = type === "student" ? db.students.filter((x) => x.classId === cls && x.status === "active").slice(0, 8) : db.teachers.slice(0, 8);
  return (
    <div>
      <PageHead title="ID cards" sub="Batch-generate printable CR80 cards with QR verification.">
        <button className="btn-p btn-sm" onClick={() => { audit("PRINT_ID_CARDS", "ID Cards", `Batch of ${list.length} ${type} cards`); window.print(); }}><Ic n="printer" size={15} />Print batch ({list.length})</button>
      </PageHead>
      <div className="flex gap-2.5 mb-4">
        <div className="panel !shadow-none p-1 flex gap-1">
          {(["student", "teacher"] as const).map((t) => <button key={t} onClick={() => setType(t)} className={`px-4 h-9 rounded-lg text-[13px] font-bold capitalize transition-colors cursor-pointer ${type === t ? "bg-cobalt-600 text-white" : "text-ink-400"}`}>{t} cards</button>)}
        </div>
        {type === "student" && <select className="input !w-auto" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Class">{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}</select>}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {list.map((p) => {
          const isSt = type === "student";
          const c = isSt ? db.classes.find((x) => x.id === (p as { classId: string }).classId) : undefined;
          return (
            <div key={p.id} className="print-card rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-panel hover:shadow-lift hover:-translate-y-0.5 transition-all">
              <div className="bg-ink-950 text-white px-4 py-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-[13px]">{db.school.logoText[0]}</span>
                <div className="min-w-0"><div className="font-display font-bold text-[11.5px] truncate">{db.school.name}</div><div className="text-[7.5px] tracking-[0.16em] uppercase text-gold-300">{isSt ? "Student ID" : "Staff ID"}</div></div>
              </div>
              <div className="p-4 flex items-center gap-3.5">
                <Avatar first={p.first} last={p.last} hue={p.hue} size={56} />
                <div className="min-w-0 flex-1">
                  <b className="block font-display text-[14.5px] leading-tight truncate">{p.first} {p.last}</b>
                  <span className="text-[10.5px] font-mono font-bold text-cobalt-600 dark:text-cobalt-300">{isSt ? (p as { regNo: string }).regNo : (p as { empNo: string }).empNo}</span>
                  <span className="block text-[10px] text-ink-400 font-semibold mt-0.5">{isSt ? `${c?.name} ${c?.section}` : (p as { specialization: string }).specialization}</span>
                </div>
                <svg viewBox="0 0 21 21" width="38" height="38" aria-label="QR"><rect x="0" y="0" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.1" /><rect x="16" y="0" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.1" /><rect x="0" y="16" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1.1" />{Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 7 + p.id.length * 3) % 21} y={(i * 11 + 5) % 21} width="1.1" height="1.1" fill="currentColor" />)}</svg>
              </div>
              <div className="h-1.5 bg-gold-400" />
            </div>
          );
        })}
      </div>
      <PrintPortal><div className="grid grid-cols-2 gap-4 p-4">{list.map((p) => { const isSt = type === "student"; const c = isSt ? db.classes.find((x) => x.id === (p as { classId: string }).classId) : undefined; return (
        <div key={p.id} className="print-card rounded-lg overflow-hidden border border-ink-300 bg-white text-ink-900">
          <div className="bg-ink-950 text-white px-4 py-2 flex items-center gap-2"><span className="w-5 h-5 rounded bg-gold-400 text-ink-950 font-display font-bold flex items-center justify-center text-[11px]">V</span><span className="font-display font-bold text-[10.5px]">{db.school.name}</span></div>
          <div className="p-3 flex items-center gap-3"><Avatar first={p.first} last={p.last} hue={p.hue} size={46} /><div><b className="block text-[13px]">{p.first} {p.last}</b><span className="text-[10px] font-mono font-bold">{isSt ? (p as { regNo: string }).regNo : (p as { empNo: string }).empNo}</span><span className="block text-[9.5px] text-ink-500">{isSt ? `${c?.name} ${c?.section}` : (p as { specialization: string }).specialization}</span></div></div>
        </div>); })}</div></PrintPortal>
    </div>
  );
}

/* ================= Audit ================= */
export function AuditPage() {
  const s = useApp();
  const [q, setQ] = useState("");
  const rows = s.db.audits.filter((a) => `${a.user} ${a.action} ${a.detail}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead title="Audit logs" sub="Every significant action — who, what, when, from where.">
        <button className="btn-o btn-sm" onClick={() => { const blob = new Blob([["User,Action,Entity,Detail,Date,IP,Device", ...rows.map((a) => [a.user, a.action, a.entity, `"${a.detail}"`, a.date, a.ip, a.device].join(","))].join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "audit-log.csv"; a.click(); toast("Audit log exported"); }}><Ic n="download" size={15} />Export</button>
      </PageHead>
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800"><div className="relative max-w-sm"><Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><input className="input !pl-9" placeholder="Filter by user or action…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Actor</th><th>Action</th><th>Detail</th><th>IP address</th><th>Device</th><th>When</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><span className="flex items-center gap-2.5"><Avatar first={a.user.split(" ")[0]} last={a.user.split(" ")[1] ?? "S"} hue={(a.user.length * 37) % 360} size={28} /><span><b className="block text-[12.5px]">{a.user}</b><span className="block text-[10.5px] text-ink-400 uppercase font-bold">{a.role}</span></span></span></td>
                  <td><span className="font-mono text-[11px] font-bold text-cobalt-600 dark:text-cobalt-300 bg-cobalt-50 dark:bg-cobalt-500/10 rounded px-2 py-1 whitespace-nowrap">{a.action}</span></td>
                  <td className="text-[12.5px] max-w-[320px] truncate">{a.detail}</td>
                  <td className="font-mono text-[11.5px] text-ink-400 whitespace-nowrap">{a.ip}</td>
                  <td className="text-[12px] text-ink-400 whitespace-nowrap">{a.device}</td>
                  <td className="text-[12px] text-ink-400 whitespace-nowrap">{fmtDate(a.date.slice(0, 10))} {a.date.slice(11)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= Backups ================= */
export function BackupsPage() {
  const s = useApp();
  const db = s.db;
  const [auto, setAuto] = useState(true);
  return (
    <div>
      <PageHead title="Backups & restore" sub="Automatic nightly snapshots plus on-demand manual backups.">
        <button className="btn-p btn-sm" onClick={() => { mutate((db) => db.backups.unshift({ id: uid(), date: `${todayISO()} ${new Date().toTimeString().slice(0, 5)}`, size: `${(48 + Math.random() * 2).toFixed(1)} MB`, type: "manual", status: "ok" })); audit("BACKUP_CREATED", "Backup", "Manual backup created"); notify("system", "Backup completed", "Manual snapshot stored safely"); toast("Backup created successfully"); }}><Ic n="database" size={15} />Backup now</button>
      </PageHead>
      <div className="grid sm:grid-cols-3 gap-3.5 mb-4">
        <div className="panel p-4 flex items-center gap-3.5"><span className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><Ic n="check" /></span><div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">Last backup</div><div className="font-display text-[16px] font-bold">{db.backups[0]?.date}</div></div></div>
        <div className="panel p-4 flex items-center gap-3.5"><span className="w-10 h-10 rounded-lg bg-cobalt-600 text-white flex items-center justify-center"><Ic n="database" /></span><div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">Latest size</div><div className="font-display text-[16px] font-bold">{db.backups[0]?.size}</div></div></div>
        <div className="panel p-4 flex items-center gap-3.5"><span className="w-10 h-10 rounded-lg bg-gold-400 text-ink-950 flex items-center justify-center"><Ic n="clock" /></span><div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">Automatic backups</div>
          <button onClick={() => setAuto(!auto)} className={`flex items-center gap-2 font-display text-[15px] font-bold cursor-pointer ${auto ? "text-emerald-600" : "text-ink-400"}`}><span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${auto ? "bg-emerald-500" : "bg-ink-300"}`}><span className={`block w-4 h-4 rounded-full bg-white transition-transform ${auto ? "translate-x-4" : ""}`} /></span>{auto ? "Daily · 02:00" : "Disabled"}</button>
        </div></div>
      </div>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Type</th><th>Size</th><th>Status</th><th className="!text-right">Actions</th></tr></thead>
            <tbody>
              {db.backups.map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold text-[13px] whitespace-nowrap">{b.date}</td>
                  <td><Chip tone={b.type === "auto" ? "blue" : "gold"}>{b.type}</Chip></td>
                  <td className="tnum font-semibold">{b.size}</td>
                  <td><Chip tone="green"><Ic n="check" size={11} />completed</Chip></td>
                  <td className="text-right">
                    <button className="btn-g btn-sm" onClick={() => { toast("Snapshot downloaded", "info"); audit("DOWNLOAD_BACKUP", "Backup", `Restored snapshot from ${b.date}`); }}><Ic n="download" size={13} />Download</button>
                    <button className="btn-o btn-sm ml-1" onClick={() => { audit("RESTORE_BACKUP", "Backup", `Restore point ${b.date} selected`); toast(`Restore point ${b.date} queued`, "info"); }}><Ic n="refresh" size={13} />Restore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= Analytics ================= */
export function AnalyticsPage() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [period, setPeriod] = useState(3);
  const spans = [1, 1, 2, 4, 8, 8];
  const mkAll = monthKeys(8);
  const mk = mkAll.slice(-spans[period]);
  const enroll = mk.map((m) => db.students.filter((x) => x.admitted.startsWith(m)).length);
  const revBy = mk.map((m) => db.payments.filter((p) => p.date.startsWith(m)).reduce((a, b) => a + b.amount, 0));
  const revTotal = revBy.reduce((a, b) => a + b, 0);
  const passRate = useMemo(() => { const gs = db.grades; return Math.round((gs.filter((g) => g.score >= db.school.passMark).length / Math.max(1, gs.length)) * 100); }, [db]);
  const BigStat = ({ label, value }: { label: string; value: string }) => { const n = parseFloat(value.replace(/[^\d.]/g, "")) || 0; const v = useCountUp(n); return <div className="panel p-5 text-center"><div className="font-display text-[30px] font-bold tnum">{value.includes("%") ? `${Math.round(v)}%` : fmtNum(Math.round(v))}</div><div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mt-1">{label}</div></div>; };
  return (
    <div>
      <PageHead title="Analytics" sub="Enrollment, attendance, collection and academic success — with period filters.">
        <Chip tone="blue" className="!py-2">Revenue in period: <b className="tnum">{fmtMoney(revTotal, cur)}</b></Chip>
      </PageHead>
      <div className="flex gap-1.5 flex-wrap mb-4">{["Today", "This week", "This month", "This term", "This year", "Custom…"].map((p, i) => <button key={p} onClick={() => { setPeriod(i); toast(`Period: ${p}`, "info"); }} className={`chip cursor-pointer !py-2 !px-3.5 transition-all ${period === i ? "bg-cobalt-600 text-white scale-105" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 hover:bg-cobalt-100"}`}>{p}</button>)}</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <BigStat label="Enrollment growth" value={`${Math.round(((db.students.length - 200) / 200) * 100)}%`} />
        <BigStat label="Attendance rate" value={`${attPct(db, todayISO())}%`} />
        <BigStat label="Fee collection" value={`${collectionRate(db)}%`} />
        <BigStat label="Academic success" value={`${passRate}%`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="panel"><div className="panel-h"><h3 className="font-display font-bold text-[16px]">Enrollment growth</h3><Chip tone="blue">admissions / month</Chip></div><div className="px-5 pb-5"><AreaChart key={`e${period}`} data={enroll.map((x) => x || 1)} labels={mk.map(monthLabel)} h={120} id="an1" /></div></div>
        <div className="panel"><div className="panel-h"><h3 className="font-display font-bold text-[16px]">Monthly revenue</h3><Chip tone="green">{cur}</Chip></div><div className="px-5 pb-5"><AreaChart key={`r${period}`} data={revBy} labels={mk.map(monthLabel)} h={120} color="#c98f1b" id="an2" /></div></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5"><h3 className="font-display font-bold text-[16px] mb-4">Performance distribution</h3>
          <Donut label={`${passRate}%`} sub="pass rate" segments={[{ value: passRate, color: "#10b981", name: "Pass (≥50)" }, { value: 100 - passRate, color: "#f43f5e", name: "Below pass mark" }]} size={120} /></div>
        <div className="panel p-5"><h3 className="font-display font-bold text-[16px] mb-4">Top classes by collection</h3>
          <HBars rows={db.classes.map((c) => ({ label: `${c.name} ${c.section}`, value: db.students.filter((x) => x.classId === c.id).length })).sort((a, b) => b.value - a.value).slice(0, 5)} /></div>
        <div className="panel p-5"><h3 className="font-display font-bold text-[16px] mb-4">Teacher attendance</h3>
          <div className="flex items-center gap-4"><Ring value={94} size={92} color="#1e49c9" /><p className="text-[12.5px] text-ink-400 leading-relaxed">of teaching staff present this term. 1 on approved leave, covered by substitute arrangements.</p></div></div>
      </div>
    </div>
  );
}

/* ================= Platform (Super Admin) ================= */
export function PlatformPage() {
  const s = useApp();
  const db = s.db;
  const mrr = db.tenants.reduce((a, t) => a + t.mrr, 0);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [pf, setPf] = useState({ name: "", price: 0, students: "500" });
  const savePlan = () => {
    if (!editPlan) return;
    mutate((db) => { const p = db.plans.find((x) => x.id === editPlan.id)!; p.name = pf.name; p.price = pf.price; p.students = pf.students === "Unlimited" ? "Unlimited" : +pf.students || 500; });
    audit("UPDATE_PLAN", "Platform", `Plan ${pf.name} → $${pf.price}`);
    toast("Plan updated — reflected on the public pricing page"); setEditPlan(null);
  };
  return (
    <div>
      <PageHead title="Platform control" sub="Super Admin — schools, subscriptions, MRR and plan configuration.">
        <Chip tone="gold"><Ic n="star" size={12} />Super Admin only</Chip>
      </PageHead>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
        {[["Total schools", db.tenants.length, "building", "blue"], ["Active subscriptions", db.tenants.filter((t) => t.status === "active").length, "check", "green"], ["Trial accounts", db.tenants.filter((t) => t.status === "trial").length, "clock", "gold"], ["Monthly recurring revenue", `$${mrr}`, "coins", "navy"]].map(([l, v, ic, tone]) => (
          <div key={l as string} className="panel p-4 flex items-center gap-3.5">
            <span className={`w-10 h-10 rounded-lg text-white flex items-center justify-center ${tone === "green" ? "bg-emerald-500" : tone === "gold" ? "bg-gold-400 !text-ink-950" : tone === "navy" ? "bg-ink-900 dark:bg-ink-700" : "bg-cobalt-600"}`}><Ic n={ic as string} /></span>
            <div><div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{l}</div><div className="font-display text-[20px] font-bold tnum">{v}</div></div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="panel overflow-hidden">
          <div className="panel-h"><h3 className="font-display font-bold text-[16px]">Schools on the platform</h3><Chip tone="blue">{db.tenants.length} tenants</Chip></div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>School</th><th>Plan</th><th>Students</th><th>MRR</th><th>Status</th><th className="!text-right">Action</th></tr></thead>
              <tbody>
                {db.tenants.map((t) => (
                  <tr key={t.id}>
                    <td><span className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[13px]">{t.name[0]}</span><span><b className="block text-[13px]">{t.name}</b><span className="block text-[11px] text-ink-400">{t.city}</span></span></span></td>
                    <td><Chip tone={t.plan === "Enterprise" ? "gold" : t.plan === "Professional" ? "blue" : "gray"}>{t.plan}</Chip></td>
                    <td className="tnum font-semibold">{t.students.toLocaleString()}</td>
                    <td className="tnum font-bold">{t.mrr ? `$${t.mrr}` : "—"}</td>
                    <td><Chip tone={t.status === "active" ? "green" : t.status === "trial" ? "amber" : "red"}>{t.status}</Chip></td>
                    <td className="text-right">
                      <button className="btn-g btn-sm" onClick={() => { mutate((db) => { const x = db.tenants.find((y) => y.id === t.id)!; x.status = x.status === "suspended" ? "active" : "suspended"; }); audit(x2(t), "Platform", `${t.name} ${t.status === "suspended" ? "reactivated" : "suspended"}`); toast(`${t.name} ${t.status === "suspended" ? "reactivated" : "suspended"}`, "info"); }}>{t.status === "suspended" ? "Reactivate" : "Suspend"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-1">Pricing plans</h3>
            <p className="text-[12px] text-ink-400 mb-3.5">Edits appear instantly on the public pricing page.</p>
            {db.plans.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-3 mb-2">
                <div className="flex-1"><b className="block text-[13.5px]">{p.name}</b><span className="text-[11.5px] text-ink-400">{p.students === "Unlimited" ? "Unlimited" : `${fmtNum(p.students)} students`} · {p.storage}</span></div>
                <b className="font-display text-[17px] tnum">${p.price}</b>
                <button className="btn-g btn-sm !px-2" onClick={() => { setEditPlan(p); setPf({ name: p.name, price: p.price, students: String(p.students) }); }} aria-label={`Edit ${p.name}`}><Ic n="pencil" size={14} /></button>
              </div>
            ))}
          </div>
          <div className="panel p-5">
            <h3 className="font-display font-bold text-[16px] mb-3">System health</h3>
            {[["API uptime (30d)", "99.98%"], ["Avg response", "142 ms"], ["Queue depth", "0 jobs"], ["Storage used", "61% of 100 GB"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 text-[13px]"><span className="font-semibold text-ink-500 dark:text-ink-300">{k}</span><b className="tnum">{v}</b></div>
            ))}
          </div>
        </div>
      </div>
      <Modal open={!!editPlan} onClose={() => setEditPlan(null)} title={`Edit plan — ${editPlan?.name}`} w="max-w-sm"
        footer={<><button className="btn-o" onClick={() => setEditPlan(null)}>Cancel</button><button className="btn-p" onClick={savePlan}><Ic n="check" size={15} />Save plan</button></>}>
        <div className="space-y-4">
          <Field label="Plan name"><input className="input" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /></Field>
          <Field label="Price (USD / month)"><input type="number" className="input tnum" value={pf.price} onChange={(e) => setPf({ ...pf, price: +e.target.value })} /></Field>
          <Field label="Student limit (or “Unlimited”)"><input className="input" value={pf.students} onChange={(e) => setPf({ ...pf, students: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
const x2 = (_t: unknown) => "UPDATE_TENANT";
