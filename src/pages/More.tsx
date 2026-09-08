import { useState } from "react";
import { useApp, mutate, uid, fmtDate, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export function LibraryPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "", category: "", isbn: "", copies: 1 });

  const addBook = () => {
    if (!formData.title || !formData.author) {
      toast("Please fill required fields", "err");
      return;
    }
    mutate((db) => {
      db.books.unshift({
        id: uid(),
        ...formData,
        available: formData.copies,
      });
    });
    toast("Book added successfully");
    setShowModal(false);
    setFormData({ title: "", author: "", category: "", isbn: "", copies: 1 });
  };

  const deleteBook = (id: string) => {
    if (confirm("Are you sure?")) {
      mutate((db) => { db.books = db.books.filter(b => b.id !== id); });
      toast("Book deleted");
    }
  };

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
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Add book")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Title")}</th>
                <th>{tt("Author")}</th>
                <th>{tt("Category")}</th>
                <th>{tt("ISBN")}</th>
                <th>{tt("Copies")}</th>
                <th>{tt("Available")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.books.map((b) => (
                <tr key={b.id}>
                  <td className="font-bold text-[13px]">{b.title}</td>
                  <td className="text-[12.5px]">{b.author}</td>
                  <td><Chip tone="blue">{b.category}</Chip></td>
                  <td className="font-mono text-[11px] text-ink-400">{b.isbn}</td>
                  <td className="tnum">{b.copies}</td>
                  <td>
                    <span className={`font-bold tnum ${b.available === 0 ? "text-rose-500" : "text-emerald-600"}`}>
                      {b.available}
                    </span>
                  </td>
                  <td>
                    <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteBook(b.id)}>
                      <Ic n="trash" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Add book")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Title")}>
            <input type="text" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </Field>
          <Field label={tt("Author")}>
            <input type="text" className="input" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </Field>
          <Field label={tt("Category")}>
            <input type="text" className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Mathematics, Sciences" />
          </Field>
          <Field label={tt("ISBN")}>
            <input type="text" className="input" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} />
          </Field>
          <Field label={tt("Copies")}>
            <input type="number" className="input" value={formData.copies} onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) })} />
          </Field>
          <button className="btn-p w-full" onClick={addBook}>
            <Ic n="check" size={15} />{tt("Add book")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function TransportPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ plate: "", model: "", capacity: 30, driver: "", insurance: "", routeId: "" });

  const addVehicle = () => {
    if (!formData.plate || !formData.model) {
      toast("Please fill required fields", "err");
      return;
    }
    mutate((db) => {
      db.vehicles.unshift({
        id: uid(),
        ...formData,
        status: "active",
      });
    });
    toast("Vehicle added successfully");
    setShowModal(false);
    setFormData({ plate: "", model: "", capacity: 30, driver: "", insurance: "", routeId: "" });
  };

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
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Add vehicle")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Plate")}</th>
                <th>{tt("Model")}</th>
                <th>{tt("Driver")}</th>
                <th>{tt("Capacity")}</th>
                <th>{tt("Insurance")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="font-mono font-bold text-[13px]">{v.plate}</td>
                  <td className="text-[12.5px]">{v.model}</td>
                  <td className="text-[12.5px]">{v.driver}</td>
                  <td className="tnum">{v.capacity}</td>
                  <td className="text-[11px] text-ink-400">{v.insurance}</td>
                  <td>
                    <Chip tone={v.status === "active" ? "green" : "gold"}>
                      {v.status}
                    </Chip>
                  </td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => {
                      mutate((db) => {
                        const v2 = db.vehicles.find(x => x.id === v.id);
                        if (v2) v2.status = v2.status === "active" ? "maintenance" : "active";
                      });
                      toast("Status updated");
                    }}>
                      <Ic n="pencil" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Add vehicle")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Plate number")}>
            <input type="text" className="input" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="e.g. RAD 123 A" />
          </Field>
          <Field label={tt("Model")}>
            <input type="text" className="input" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="e.g. Coaster Bus" />
          </Field>
          <Field label={tt("Capacity")}>
            <input type="number" className="input" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
          </Field>
          <Field label={tt("Driver")}>
            <input type="text" className="input" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} />
          </Field>
          <Field label={tt("Insurance")}>
            <input type="text" className="input" value={formData.insurance} onChange={(e) => setFormData({ ...formData, insurance: e.target.value })} placeholder="Valid until..." />
          </Field>
          <button className="btn-p w-full" onClick={addVehicle}>
            <Ic n="check" size={15} />{tt("Add vehicle")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function HRPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", dept: "", position: "", salary: 0 });

  const openModal = (staff?: any) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        dept: staff.dept,
        position: staff.position,
        salary: staff.salary
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: "", dept: "", position: "", salary: 0 });
    }
    setShowModal(true);
  };

  const saveStaff = () => {
    if (!formData.name || !formData.dept) {
      toast("Please fill required fields", "err");
      return;
    }
    mutate((db) => {
      if (editingStaff) {
        const idx = db.staff.findIndex(s => s.id === editingStaff.id);
        if (idx >= 0) {
          db.staff[idx] = { ...db.staff[idx], ...formData };
        }
      } else {
        db.staff.unshift({
          id: uid(),
          empNo: `EMP-${db.staff.length + 1}`,
          ...formData,
          hired: new Date().toISOString().slice(0, 10),
          status: "active",
        });
      }
    });
    toast(editingStaff ? "Staff updated" : "Staff member added");
    setShowModal(false);
    setEditingStaff(null);
  };

  const deleteStaff = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      mutate((db) => {
        db.staff = db.staff.filter(s => s.id !== id);
      });
      toast("Staff member deleted");
    }
  };

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
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Add staff")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("Employee No")}</th>
                <th>{tt("Department")}</th>
                <th>{tt("Position")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Salary")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.staff.map((st) => (
                <tr key={st.id}>
                  <td className="font-bold text-[13px]">{st.name}</td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{st.empNo}</td>
                  <td><Chip tone="blue">{st.dept}</Chip></td>
                  <td className="text-[12.5px]">{st.position}</td>
                  <td>
                    <Chip tone={st.status === "active" ? "green" : "gold"}>
                      {st.status}
                    </Chip>
                  </td>
                  <td className="font-bold tnum">{fmtMoney(st.salary, db.school.currency)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-g btn-sm" onClick={() => openModal(st)}>
                        <Ic n="pencil" size={14} />
                      </button>
                      <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteStaff(st.id)}>
                        <Ic n="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStaff ? tt("Edit staff member") : tt("Add staff member")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Full name")}>
            <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Field>
          <Field label={tt("Department")}>
            <select className="input" value={formData.dept} onChange={(e) => setFormData({ ...formData, dept: e.target.value })}>
              <option value="">Select...</option>
              <option>Administration</option>
              <option>Finance</option>
              <option>HR</option>
              <option>IT</option>
              <option>Maintenance</option>
            </select>
          </Field>
          <Field label={tt("Position")}>
            <input type="text" className="input" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
          </Field>
          <Field label={tt("Salary")}>
            <input type="number" className="input" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })} />
          </Field>
          <button className="btn-p w-full" onClick={saveStaff}>
            <Ic n="check" size={15} />{editingStaff ? tt("Update") : tt("Add staff")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function DocumentsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;

  const uploadDocument = () => {
    mutate((db) => {
      db.documents.unshift({
        id: uid(),
        name: `Document_${db.documents.length + 1}.pdf`,
        category: "General",
        size: "1.2 MB",
        date: new Date().toISOString().slice(0, 10),
        by: "Admin",
        kind: "pdf",
      });
    });
    toast("Document uploaded");
  };

  const deleteDocument = (id: string) => {
    if (confirm("Are you sure?")) {
      mutate((db) => { db.documents = db.documents.filter(d => d.id !== id); });
      toast("Document deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Documents")}</h1>
      
      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All documents")}</h2>
          <button className="btn-p btn-sm" onClick={uploadDocument}>
            <Ic n="upload" size={15} />{tt("Upload")}
          </button>
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
                <th>{tt("Actions")}</th>
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
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-g btn-sm" onClick={() => {
                        const content = `Document: ${doc.name}\nCategory: ${doc.category}\nSize: ${doc.size}\nUploaded by: ${doc.by}\nDate: ${doc.date}\n\nThis is a placeholder document content.`;
                        const blob = new Blob([content], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = doc.name;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast("Document downloaded");
                      }}>
                        <Ic n="download" size={14} />
                      </button>
                      <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteDocument(doc.id)}>
                        <Ic n="trash" size={14} />
                      </button>
                    </div>
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

export function CertificatesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: "Certificate of Completion", recipient: "", note: "" });

  const issueCertificate = () => {
    if (!formData.recipient) {
      toast("Recipient is required", "err");
      return;
    }
    const code = `VTC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    mutate((db) => {
      db.certificates.unshift({
        id: uid(),
        code,
        ...formData,
        date: new Date().toISOString().slice(0, 10),
        valid: true,
      });
    });
    toast(`Certificate issued: ${code}`);
    setShowModal(false);
    setFormData({ type: "Certificate of Completion", recipient: "", note: "" });
  };

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
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Issue certificate")}
          </button>
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
                <th>{tt("Actions")}</th>
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
                  <td>
                    <button className="btn-g btn-sm" onClick={() => {
                      const content = `
                        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
                          <div style="text-align: center; border-bottom: 3px solid #1e49c9; padding-bottom: 20px; margin-bottom: 30px;">
                            <h1 style="color: #1e49c9; margin: 0;">${db.school.name}</h1>
                            <p style="color: #6f90c2; margin: 5px 0 0 0;">${db.school.motto}</p>
                          </div>
                          <div style="text-align: center; margin: 40px 0;">
                            <h2 style="color: #1e49c9; font-size: 28px; margin-bottom: 20px;">${cert.type}</h2>
                            <p style="font-size: 16px; margin-bottom: 10px;">This is to certify that</p>
                            <h3 style="font-size: 32px; color: #101d38; margin: 20px 0;">${cert.recipient}</h3>
                            <p style="font-size: 16px; margin-bottom: 10px;">has successfully completed the requirements for</p>
                            <p style="font-size: 18px; color: #dca638; font-weight: bold;">${cert.type}</p>
                            ${cert.note ? `<p style="font-size: 14px; color: #6f90c2; margin-top: 20px; font-style: italic;">${cert.note}</p>` : ''}
                          </div>
                          <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: end;">
                            <div style="text-align: center;">
                              <div style="border-top: 2px solid #101d38; padding-top: 10px; min-width: 200px;">
                                <p style="margin: 0; font-size: 14px;">Date Issued</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold;">${fmtDate(cert.date)}</p>
                              </div>
                            </div>
                            <div style="text-align: center;">
                              <div style="border: 3px double #dca638; padding: 15px; border-radius: 50%; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                                <p style="margin: 0; font-size: 10px; color: #dca638; font-weight: bold; text-align: center;">Official<br/>School<br/>Stamp</p>
                              </div>
                            </div>
                            <div style="text-align: center;">
                              <div style="border-top: 2px solid #101d38; padding-top: 10px; min-width: 200px;">
                                <p style="margin: 0; font-size: 14px;">Certificate Code</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; font-family: monospace;">${cert.code}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Certificate - ${cert.recipient}</title>
                            <style>
                              @media print {
                                body { margin: 0; padding: 0; }
                              }
                            </style>
                          </head>
                          <body>${content}</body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 250);
                      }
                      toast("Certificate opened for printing");
                    }}>
                      <Ic n="printer" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Issue certificate")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Certificate type")}>
            <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option>Certificate of Completion</option>
              <option>Certificate of Graduation</option>
              <option>Attendance Certificate</option>
              <option>Training Certificate</option>
              <option>Achievement Certificate</option>
            </select>
          </Field>
          <Field label={tt("Recipient")}>
            <input type="text" className="input" value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} placeholder="Full name" />
          </Field>
          <Field label={tt("Note (optional)")}>
            <textarea className="input" rows={3} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
          </Field>
          <button className="btn-p w-full" onClick={issueCertificate}>
            <Ic n="award" size={15} />{tt("Issue certificate")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function VerifyPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);

  const verify = () => {
    const cert = db.certificates.find(c => c.code === code);
    setResult(cert || null);
  };

  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cobalt-600 text-white flex items-center justify-center mx-auto mb-4">
            <Ic n="shield" size={32} />
          </div>
          <h1 className="font-display text-[24px] font-bold mb-2">{tt("Verify Certificate")}</h1>
          <p className="text-ink-400 mb-6">{tt("Enter certificate code to verify authenticity")}</p>
          <input 
            type="text" 
            placeholder="VTC-2026-4821" 
            className="input mb-4 text-center font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn-p w-full mb-4" onClick={verify}>{tt("Verify")}</button>
          
          {result && (
            <div className={`rounded-lg p-4 text-left ${result.valid ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Ic n={result.valid ? "check" : "alert"} size={20} className={result.valid ? "text-emerald-600" : "text-rose-600"} />
                <span className="font-bold">{result.valid ? "Valid Certificate" : "Invalid/Revoked"}</span>
              </div>
              <div className="text-[13px] space-y-1">
                <div><strong>Type:</strong> {result.type}</div>
                <div><strong>Recipient:</strong> {result.recipient}</div>
                <div><strong>Date:</strong> {fmtDate(result.date)}</div>
                {result.note && <div><strong>Note:</strong> {result.note}</div>}
              </div>
            </div>
          )}
          
          <button className="btn-o w-full mt-4" onClick={() => nav("/")}>{tt("Back to home")}</button>
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
        <p className="text-ink-400 mb-4">{tt("ID card generation with QR codes")}</p>
        <button className="btn-p" onClick={() => {
          const activeStudents = db.students.filter(s => s.status === "active");
          const content = activeStudents.map(student => {
            const cls = db.classes.find(c => c.id === student.classId);
            return `
              <div style="width: 350px; height: 220px; border: 2px solid #1e49c9; border-radius: 12px; margin: 20px; padding: 20px; background: linear-gradient(135deg, #1e49c9 0%, #2b5ce9 100%); color: white; position: relative; overflow: hidden;">
                <div style="text-align: center; border-bottom: 2px solid #dca638; padding-bottom: 10px; margin-bottom: 15px;">
                  <h3 style="margin: 0; font-size: 16px;">${db.school.name}</h3>
                  <p style="margin: 5px 0 0 0; font-size: 10px; opacity: 0.8;">${db.school.motto}</p>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                  <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, hsl(${student.hue} 55% 46%), hsl(${(student.hue + 40) % 360} 60% 34%)); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold;">
                    ${student.first[0]}${student.last[0]}
                  </div>
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 18px;">${student.first} ${student.last}</h4>
                    <p style="margin: 0 0 3px 0; font-size: 12px; font-family: monospace;">${student.regNo}</p>
                    <p style="margin: 0; font-size: 11px; opacity: 0.9;">${cls ? `${cls.name} ${cls.section}` : 'Student'}</p>
                  </div>
                </div>
                <div style="position: absolute; bottom: 10px; right: 10px; width: 50px; height: 50px; background: white; padding: 5px; border-radius: 4px;">
                  <div style="width: 100%; height: 100%; background: repeating-linear-gradient(45deg, #1e49c9, #1e49c9 2px, white 2px, white 4px);"></div>
                </div>
              </div>
            `;
          }).join('');
          
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Student ID Cards</title>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  @media print {
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
                <h1 style="text-align: center; color: #1e49c9;">Student ID Cards</h1>
                <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                  ${content}
                </div>
              </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
            }, 250);
          }
          toast(`Generated ${activeStudents.length} ID cards`);
        }}>
          <Ic n="idcard" size={15} />{tt("Generate cards")}
        </button>
      </div>
    </div>
  );
}

export function AuditPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  const exportLogs = () => {
    const data = JSON.stringify(db.audits, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Audit logs exported");
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Audit Logs")}</h1>
      
      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Activity log")}</h2>
          <button className="btn-o btn-sm" onClick={exportLogs}>
            <Ic n="download" size={15} />{tt("Export")}
          </button>
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
              {db.audits.slice(0, 50).map((a) => (
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
  
  const createBackup = () => {
    mutate((db) => {
      db.backups.unshift({
        id: uid(),
        date: new Date().toISOString(),
        size: `${(Math.random() * 50 + 20).toFixed(1)} MB`,
        type: "manual",
        status: "ok",
      });
    });
    toast("Backup created successfully");
  };

  const restoreBackup = (id: string) => {
    if (confirm("Are you sure you want to restore this backup?")) {
      toast("Backup restored");
    }
  };

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
          <button className="btn-p btn-sm" onClick={createBackup}>
            <Ic n="plus" size={15} />{tt("Create backup")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Date")}</th>
                <th>{tt("Type")}</th>
                <th>{tt("Size")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
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
                  <td>
                    <button className="btn-g btn-sm" onClick={() => restoreBackup(b.id)}>
                      <Ic n="refresh" size={14} />
                    </button>
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
  const netProfit = totalRevenue - totalExpenses;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Analytics")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Students" value={db.students.length} icon="students" />
        <Stat label="Teachers" value={db.teachers.length} icon="teacher" tone="blue" />
        <Stat label="Revenue" value={totalRevenue} icon="payment" tone="green" money={cur} />
        <Stat label="Expenses" value={totalExpenses} icon="expenses" tone="red" money={cur} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("Financial Summary")}</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total Revenue")}</span>
              <span className="font-bold tnum text-emerald-600">{fmtMoney(totalRevenue, cur)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total Expenses")}</span>
              <span className="font-bold tnum text-rose-600">{fmtMoney(totalExpenses, cur)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-ink-200 dark:border-ink-700">
              <span className="font-bold text-[15px]">{tt("Net Profit")}</span>
              <span className={`font-bold tnum text-[18px] ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmtMoney(netProfit, cur)}</span>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("Key Metrics")}</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Active Students")}</span>
              <span className="font-bold tnum">{db.students.filter(s => s.status === "active").length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Active Teachers")}</span>
              <span className="font-bold tnum">{db.teachers.filter(t => t.status === "active").length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total Classes")}</span>
              <span className="font-bold tnum">{db.classes.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-500 dark:text-ink-300">{tt("Profit Margin")}</span>
              <span className="font-bold tnum">{totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%</span>
            </div>
          </div>
        </div>
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
                <th>{tt("Actions")}</th>
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
                  <td>
                    <button className="btn-g btn-sm" onClick={() => {
                      mutate((db) => {
                        const tenant = db.tenants.find(x => x.id === t.id);
                        if (tenant) {
                          tenant.status = tenant.status === "active" ? "suspended" : "active";
                        }
                      });
                      toast("Status updated");
                    }}>
                      <Ic n="pencil" size={14} />
                    </button>
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
