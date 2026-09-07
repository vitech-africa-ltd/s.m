import { useApp, fmtDate, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar } from "../components/ui";
import { useT } from "../lib/i18n";

export function LibraryPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Library")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total books" value={db.books.reduce((a, b) => a + b.copies, 0)} icon="book" />
        <Stat label="Titles" value={db.books.length} icon="folder" tone="blue" />
        <Stat label="On loan" value={db.loans.filter(l => !l.returned).length} icon="swap" tone="gold" />
        <Stat label="Overdue" value={db.loans.filter(l => !l.returned && l.due < new Date().toISOString().slice(0, 10)).length} icon="alert" tone="red" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Book catalog")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Title")}</th>
                <th>{tt("Author")}</th>
                <th>{tt("Category")}</th>
                <th>{tt("Copies")}</th>
                <th>{tt("Available")}</th>
              </tr>
            </thead>
            <tbody>
              {db.books.map((b) => (
                <tr key={b.id}>
                  <td className="font-bold text-[13px]">{b.title}</td>
                  <td className="text-[12.5px]">{b.author}</td>
                  <td><Chip tone="blue">{b.category}</Chip></td>
                  <td className="tnum">{b.copies}</td>
                  <td>
                    <span className={`font-bold tnum ${b.available === 0 ? "text-rose-500" : "text-emerald-600"}`}>
                      {b.available}
                    </span>
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

export function TransportPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Transport")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Vehicles" value={db.vehicles.length} icon="bus" />
        <Stat label="Active" value={db.vehicles.filter(v => v.status === "active").length} icon="check" tone="green" />
        <Stat label="Routes" value={db.routes.length} icon="pin" tone="blue" />
        <Stat label="Students" value={db.routes.reduce((a, r) => a + r.students, 0)} icon="students" tone="gold" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Vehicles")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Plate")}</th>
                <th>{tt("Model")}</th>
                <th>{tt("Driver")}</th>
                <th>{tt("Capacity")}</th>
                <th>{tt("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {db.vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="font-mono font-bold text-[13px]">{v.plate}</td>
                  <td className="text-[12.5px]">{v.model}</td>
                  <td className="text-[12.5px]">{v.driver}</td>
                  <td className="tnum">{v.capacity}</td>
                  <td>
                    <Chip tone={v.status === "active" ? "green" : "gold"}>
                      {v.status}
                    </Chip>
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

export function HRPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("HR & Staff")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total staff" value={db.staff.length} icon="briefcase" />
        <Stat label="Active" value={db.staff.filter(s => s.status === "active").length} icon="check" tone="green" />
        <Stat label="On leave" value={db.leaves.filter(l => l.status === "approved").length} icon="clock" tone="gold" />
        <Stat label="Pending requests" value={db.leaves.filter(l => l.status === "pending").length} icon="alert" tone="red" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Staff members")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("Department")}</th>
                <th>{tt("Position")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Salary")}</th>
              </tr>
            </thead>
            <tbody>
              {db.staff.map((st) => (
                <tr key={st.id}>
                  <td className="font-bold text-[13px]">{st.name}</td>
                  <td><Chip tone="blue">{st.dept}</Chip></td>
                  <td className="text-[12.5px]">{st.position}</td>
                  <td>
                    <Chip tone={st.status === "active" ? "green" : "gold"}>
                      {st.status}
                    </Chip>
                  </td>
                  <td className="font-bold tnum">{fmtMoney(st.salary, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Documents")}</h1>
      
      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All documents")}</h2>
          <button className="btn-p btn-sm"><Ic n="upload" size={15} />{tt("Upload")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("Category")}</th>
                <th>{tt("Size")}</th>
                <th>{tt("Uploaded by")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Ic n="file" size={16} className="text-cobalt-500" />
                      <span className="font-bold text-[13px]">{doc.name}</span>
                    </div>
                  </td>
                  <td><Chip tone="blue">{doc.category}</Chip></td>
                  <td className="text-[12px] text-ink-400">{doc.size}</td>
                  <td className="text-[12.5px]">{doc.by}</td>
                  <td className="text-[12px] text-ink-400">{fmtDate(doc.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CertificatesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Certificates")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total certificates" value={db.certificates.length} icon="award" />
        <Stat label="Valid" value={db.certificates.filter(c => c.valid).length} icon="check" tone="green" />
        <Stat label="Revoked" value={db.certificates.filter(c => !c.valid).length} icon="alert" tone="red" />
        <Stat label="This year" value={db.certificates.filter(c => c.date.startsWith(new Date().getFullYear().toString())).length} icon="calendar" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Issued certificates")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Issue certificate")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Code")}</th>
                <th>{tt("Type")}</th>
                <th>{tt("Recipient")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.certificates.map((cert) => (
                <tr key={cert.id}>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{cert.code}</td>
                  <td className="font-bold text-[13px]">{cert.type}</td>
                  <td className="text-[12.5px]">{cert.recipient}</td>
                  <td>
                    <Chip tone={cert.valid ? "green" : "red"}>
                      {cert.valid ? "Valid" : "Revoked"}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(cert.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function VerifyPage({ nav }: { nav: (to: string) => void }) {
  const tt = useT();
  
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cobalt-600 text-white flex items-center justify-center mx-auto mb-4">
            <Ic n="shield" size={32} />
          </div>
          <h1 className="font-display text-[24px] font-bold mb-2">{tt("Verify Certificate")}</h1>
          <p className="text-ink-400 mb-6">{tt("Enter certificate code to verify authenticity")}</p>
          <input type="text" placeholder="VTC-2026-4821" className="input mb-4 text-center font-mono" />
          <button className="btn-p w-full">{tt("Verify")}</button>
          <button className="btn-o w-full mt-2" onClick={() => nav("/")}>{tt("Back to home")}</button>
        </div>
      </div>
    </div>
  );
}

export function IDCardsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("ID Cards")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Student cards" value={db.students.filter(s => s.status === "active").length} icon="students" />
        <Stat label="Teacher cards" value={db.teachers.filter(t => t.status === "active").length} icon="teacher" tone="blue" />
        <Stat label="Staff cards" value={db.staff.filter(s => s.status === "active").length} icon="briefcase" tone="gold" />
        <Stat label="Total cards" value={db.students.filter(s => s.status === "active").length + db.teachers.filter(t => t.status === "active").length + db.staff.filter(s => s.status === "active").length} icon="idcard" tone="green" />
      </div>

      <div className="panel p-6">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Generate ID Cards")}</h2>
        <p className="text-ink-400 mb-4">{tt("ID card generation with QR codes - Coming soon")}</p>
      </div>
    </div>
  );
}

export function AuditPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Audit Logs")}</h1>
      
      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Activity log")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("User")}</th>
                <th>{tt("Action")}</th>
                <th>{tt("Entity")}</th>
                <th>{tt("Details")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.audits.slice(0, 20).map((a) => (
                <tr key={a.id}>
                  <td>
                    <div>
                      <div className="font-bold text-[13px]">{a.user}</div>
                      <div className="text-[11px] text-ink-400">{a.role}</div>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{a.action}</td>
                  <td className="text-[12.5px]">{a.entity}</td>
                  <td className="text-[12px] max-w-[300px] truncate">{a.detail}</td>
                  <td className="text-[12px] text-ink-400 whitespace-nowrap">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function BackupsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Backups")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total backups" value={db.backups.length} icon="database" />
        <Stat label="Auto backups" value={db.backups.filter(b => b.type === "auto").length} icon="clock" tone="blue" />
        <Stat label="Manual backups" value={db.backups.filter(b => b.type === "manual").length} icon="upload" tone="gold" />
        <Stat label="Successful" value={db.backups.filter(b => b.status === "ok").length} icon="check" tone="green" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Backup history")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Create backup")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Date")}</th>
                <th>{tt("Type")}</th>
                <th>{tt("Size")}</th>
                <th>{tt("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {db.backups.map((b) => (
                <tr key={b.id}>
                  <td className="text-[12.5px]">{b.date}</td>
                  <td>
                    <Chip tone={b.type === "auto" ? "blue" : "gold"}>
                      {b.type}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{b.size}</td>
                  <td>
                    <Chip tone={b.status === "ok" ? "green" : "red"}>
                      {b.status}
                    </Chip>
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

export function AnalyticsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const cur = db.school.currency;
  
  const totalRevenue = db.payments.reduce((a, p) => a + p.amount, 0);
  const totalExpenses = db.expenses.reduce((a, e) => a + e.amount, 0);
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Analytics")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Students" value={db.students.length} icon="students" />
        <Stat label="Teachers" value={db.teachers.length} icon="teacher" tone="blue" />
        <Stat label="Revenue" value={totalRevenue} icon="payment" tone="green" money={cur} />
        <Stat label="Expenses" value={totalExpenses} icon="expenses" tone="red" money={cur} />
      </div>

      <div className="panel p-6">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Overview")}</h2>
        <p className="text-ink-400">{tt("Advanced analytics and charts - Coming soon")}</p>
      </div>
    </div>
  );
}

export function PlatformPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Platform (SaaS)")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total schools" value={db.tenants.length} icon="building" />
        <Stat label="Active" value={db.tenants.filter(t => t.status === "active").length} icon="check" tone="green" />
        <Stat label="Trial" value={db.tenants.filter(t => t.status === "trial").length} icon="clock" tone="gold" />
        <Stat label="Suspended" value={db.tenants.filter(t => t.status === "suspended").length} icon="alert" tone="red" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Tenant schools")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("School")}</th>
                <th>{tt("City")}</th>
                <th>{tt("Plan")}</th>
                <th>{tt("Students")}</th>
                <th>{tt("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {db.tenants.map((t) => (
                <tr key={t.id}>
                  <td className="font-bold text-[13px]">{t.name}</td>
                  <td className="text-[12.5px]">{t.city}</td>
                  <td><Chip tone={t.plan === "Enterprise" ? "gold" : t.plan === "Professional" ? "blue" : "gray"}>{t.plan}</Chip></td>
                  <td className="tnum">{t.students}</td>
                  <td>
                    <Chip tone={t.status === "active" ? "green" : t.status === "trial" ? "gold" : "red"}>
                      {t.status}
                    </Chip>
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
