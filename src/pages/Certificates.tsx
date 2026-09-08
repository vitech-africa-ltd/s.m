import { useState } from "react";
import { useApp, mutate, audit, uid, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast, printNow } from "../components/ui";
import { useT } from "../lib/i18n";
import { QR } from "../lib/media";

export default function CertificatesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showIssue, setShowIssue] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [certStyle, setCertStyle] = useState({
    bgColor: "#ffffff",
    borderColor: "#1e49c9",
    accentColor: "#dca638",
    textColor: "#101d38",
    showQR: true,
    showStamp: true,
    showSignature: true,
  });
  const [formData, setFormData] = useState({
    type: "Certificate of Completion",
    recipient: "",
    course: "",
    date: todayISO(),
    note: "",
  });

  const issueCertificate = () => {
    if (!formData.recipient.trim()) {
      toast("Recipient name is required", "err");
      return;
    }

    const code = `VTC-${todayISO().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    mutate((db) => {
      db.certificates.unshift({
        id: uid(),
        code,
        type: formData.type,
        recipient: formData.recipient,
        date: formData.date,
        note: formData.note,
        valid: true,
      });
    });

    audit("ISSUE_CERTIFICATE", "Certificate", `${formData.type} — ${formData.recipient} (${code})`);
    toast(`Certificate issued · verify code ${code}`);
    setShowIssue(false);
    setFormData({ type: "Certificate of Completion", recipient: "", course: "", date: todayISO(), note: "" });
  };

  const printCertificate = (cert: any) => {
    printNow(
      <div className="p-8 max-w-[800px] mx-auto">
        <div 
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ 
            background: certStyle.bgColor,
            border: `8px double ${certStyle.borderColor}`,
            color: certStyle.textColor
          }}
        >
          {/* Header */}
          <div className="p-8 text-center border-b-4" style={{ borderColor: certStyle.accentColor }}>
            <div className="font-display font-bold text-[32px] mb-2" style={{ color: certStyle.borderColor }}>
              {db.school.name}
            </div>
            <div className="text-[14px] italic opacity-80 mb-2">{db.school.motto}</div>
            <div className="text-[12px] opacity-60">{db.school.address}</div>
          </div>
          
          {/* Certificate Type */}
          <div className="px-8 py-6 text-center">
            <div className="text-[14px] uppercase tracking-wider opacity-60 mb-2">This is to certify that</div>
            <div className="font-display font-bold text-[36px] mb-4" style={{ color: certStyle.borderColor }}>
              {cert.recipient}
            </div>
            <div className="text-[16px] leading-relaxed max-w-[600px] mx-auto">
              has successfully completed the requirements for
            </div>
            <div className="font-display font-bold text-[24px] mt-3" style={{ color: certStyle.accentColor }}>
              {cert.type}
            </div>
            {cert.note && (
              <div className="text-[14px] mt-4 italic opacity-80">
                {cert.note}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-8 py-6 border-t-2" style={{ borderColor: certStyle.accentColor }}>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-[12px] opacity-60 mb-1">Date Issued</div>
                <div className="font-bold text-[14px]">{fmtDate(cert.date)}</div>
              </div>
              
              {certStyle.showSignature && (
                <div className="text-center">
                  <div className="text-[12px] opacity-60 mb-1">Authorized Signature</div>
                  <div className="font-bold text-[14px] italic">Dr. Uwase Solange</div>
                  <div className="text-[11px] opacity-60">Principal</div>
                </div>
              )}
              
              {certStyle.showStamp && (
                <div className="text-center">
                  <div 
                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-[10px] font-bold uppercase tracking-wide text-center leading-tight"
                    style={{ borderColor: certStyle.accentColor, color: certStyle.accentColor }}
                  >
                    Official<br />School<br />Stamp
                  </div>
                </div>
              )}
            </div>
            
            {certStyle.showQR && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: `${certStyle.borderColor}33` }}>
                <div className="text-[10px] opacity-60">
                  <div>Certificate Code: <span className="font-mono font-bold">{cert.code}</span></div>
                  <div>Verify at: {db.school.website}/verify</div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <QR value={`VITECH-CERT-${cert.code}`} size={60} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">{tt("Certificates")}</h1>
          <p className="text-ink-400 text-[13px] mt-1">{tt("Issue and manage certificates")}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-o btn-sm" onClick={() => setShowCustomize(true)}>
            <Ic n="settings" size={15} />{tt("Customize")}
          </button>
          <button className="btn-p btn-sm" onClick={() => setShowIssue(true)}>
            <Ic n="plus" size={15} />{tt("Issue certificate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total certificates" value={db.certificates.length} icon="award" />
        <Stat label="Valid" value={db.certificates.filter(c => c.valid).length} icon="check" tone="green" />
        <Stat label="Revoked" value={db.certificates.filter(c => !c.valid).length} icon="alert" tone="red" />
        <Stat label="This year" value={db.certificates.filter(c => c.date.startsWith(new Date().getFullYear().toString())).length} icon="calendar" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Issued certificates")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Code")}</th>
                <th>{tt("Type")}</th>
                <th>{tt("Recipient")}</th>
                <th>{tt("Date")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.certificates.map((cert) => (
                <tr key={cert.id}>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{cert.code}</td>
                  <td className="font-bold text-[13px]">{cert.type}</td>
                  <td className="text-[12.5px]">{cert.recipient}</td>
                  <td className="text-[12px] text-ink-400">{fmtDate(cert.date)}</td>
                  <td>
                    <Chip tone={cert.valid ? "green" : "red"}>
                      {cert.valid ? "Valid" : "Revoked"}
                    </Chip>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-g btn-sm" onClick={() => printCertificate(cert)}>
                        <Ic n="printer" size={14} />
                      </button>
                      <button 
                        className="btn-g btn-sm" 
                        onClick={() => {
                          mutate((db) => {
                            const c = db.certificates.find(x => x.id === cert.id);
                            if (c) c.valid = !c.valid;
                          });
                          toast(cert.valid ? "Certificate revoked" : "Certificate reactivated");
                        }}
                      >
                        <Ic n={cert.valid ? "x" : "check"} size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      <Modal open={showIssue} onClose={() => setShowIssue(false)} title={tt("Issue certificate")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Certificate type")}>
            <select 
              className="input" 
              value={formData.type} 
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option>Certificate of Completion</option>
              <option>Certificate of Graduation</option>
              <option>Attendance Certificate</option>
              <option>Training Certificate</option>
              <option>Achievement Certificate</option>
              <option>Certificate of Excellence</option>
            </select>
          </Field>
          <Field label={tt("Recipient name")}>
            <input 
              type="text" 
              className="input" 
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="Full name"
            />
          </Field>
          <Field label={tt("Course/Program (optional)")}>
            <input 
              type="text" 
              className="input" 
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              placeholder="e.g. Advanced Mathematics"
            />
          </Field>
          <Field label={tt("Issue date")}>
            <input 
              type="date" 
              className="input" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </Field>
          <Field label={tt("Additional note (optional)")}>
            <textarea 
              className="input" 
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="e.g. Senior 6 — Class of 2026"
            />
          </Field>
          <button className="btn-p w-full" onClick={issueCertificate}>
            <Ic n="award" size={15} />{tt("Issue certificate")}
          </button>
        </div>
      </Modal>

      {/* Customize Modal */}
      <Modal open={showCustomize} onClose={() => setShowCustomize(false)} title={tt("Customize certificate design")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Background color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={certStyle.bgColor} 
              onChange={(e) => setCertStyle({ ...certStyle, bgColor: e.target.value })}
            />
          </Field>
          <Field label={tt("Border color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={certStyle.borderColor} 
              onChange={(e) => setCertStyle({ ...certStyle, borderColor: e.target.value })}
            />
          </Field>
          <Field label={tt("Accent color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={certStyle.accentColor} 
              onChange={(e) => setCertStyle({ ...certStyle, accentColor: e.target.value })}
            />
          </Field>
          <Field label={tt("Text color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={certStyle.textColor} 
              onChange={(e) => setCertStyle({ ...certStyle, textColor: e.target.value })}
            />
          </Field>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={certStyle.showQR} 
                onChange={(e) => setCertStyle({ ...certStyle, showQR: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show QR code")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={certStyle.showStamp} 
                onChange={(e) => setCertStyle({ ...certStyle, showStamp: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show official stamp")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={certStyle.showSignature} 
                onChange={(e) => setCertStyle({ ...certStyle, showSignature: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show signature")}</span>
            </label>
          </div>
          <button className="btn-p w-full" onClick={() => { setShowCustomize(false); toast("Certificate design saved"); }}>
            <Ic n="check" size={15} />{tt("Save design")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
