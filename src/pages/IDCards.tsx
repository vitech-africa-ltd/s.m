import { useState } from "react";
import { useApp, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar, toast, printNow } from "../components/ui";
import { useT } from "../lib/i18n";
import QRCode from "qrcode";

export default function IDCardsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [selectedType, setSelectedType] = useState<"student" | "teacher" | "staff">("student");
  const [selectedId, setSelectedId] = useState<string>("");

  const generateQR = async (data: string) => {
    try {
      return await QRCode.toDataURL(data, { width: 120, margin: 1 });
    } catch (err) {
      return "";
    }
  };

  const printCard = async (person: any) => {
    const qrData = `VITECH-${selectedType.toUpperCase()}-${person.id}`;
    const qrCode = await generateQR(qrData);
    
    printNow(
      <div className="p-8 max-w-[400px] mx-auto">
        <div className="border-2 border-ink-900 dark:border-ink-100 rounded-lg p-6 bg-white dark:bg-ink-900">
          <div className="text-center mb-4">
            <h1 className="font-display text-[20px] font-bold">{db.school.name}</h1>
            <p className="text-[12px] text-ink-400">{db.school.address}</p>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Avatar first={person.first} last={person.last} hue={person.hue} size={80} />
            <div className="flex-1">
              <h2 className="font-display text-[18px] font-bold">{person.first} {person.last}</h2>
              <p className="text-[12px] text-ink-400">{person.idNumber}</p>
              <p className="text-[12px] text-ink-400">{person.details}</p>
            </div>
          </div>

          <div className="border-t border-ink-200 dark:border-ink-700 pt-4 mb-4">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong>ID:</strong> {person.idNumber}</div>
              <div><strong>Valid:</strong> {db.school.academicYear}</div>
              <div><strong>Phone:</strong> {person.phone || "N/A"}</div>
              <div><strong>Email:</strong> {person.email || "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[10px] text-ink-400">
              <p>Issued: {fmtDate(new Date().toISOString().slice(0, 10))}</p>
              <p>If found, please return to school</p>
            </div>
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="w-20 h-20" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const getPeople = () => {
    switch (selectedType) {
      case "student":
        return db.students.filter(s => s.status === "active").map(s => ({
          id: s.id,
          first: s.first,
          last: s.last,
          hue: s.hue,
          idNumber: s.regNo,
          phone: s.phone,
          email: s.email,
          details: `${db.classes.find(c => c.id === s.classId)?.name} ${db.classes.find(c => c.id === s.classId)?.section}`,
          status: s.status
        }));
      case "teacher":
        return db.teachers.filter(t => t.status === "active").map(t => ({
          id: t.id,
          first: t.first,
          last: t.last,
          hue: t.hue,
          idNumber: t.empNo,
          phone: t.phone,
          email: t.email,
          details: t.specialization,
          status: t.status
        }));
      case "staff":
        return db.staff.filter(s => s.status === "active").map(s => ({
          id: s.id,
          first: s.name.split(" ")[0],
          last: s.name.split(" ").slice(1).join(" "),
          hue: 200,
          idNumber: s.empNo,
          phone: "",
          email: "",
          details: s.position,
          status: s.status
        }));
      default:
        return [];
    }
  };

  const people = getPeople();
  const selectedPerson = people.find(p => p.id === selectedId);

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("ID Cards")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Student cards" value={db.students.filter(s => s.status === "active").length} icon="students" />
        <Stat label="Teacher cards" value={db.teachers.filter(t => t.status === "active").length} icon="teacher" tone="blue" />
        <Stat label="Staff cards" value={db.staff.filter(s => s.status === "active").length} icon="briefcase" tone="gold" />
        <Stat label="Total cards" value={db.students.filter(s => s.status === "active").length + db.teachers.filter(t => t.status === "active").length + db.staff.filter(s => s.status === "active").length} icon="idcard" tone="green" />
      </div>

      <div className="panel p-6 mb-5">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Generate ID Card")}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">{tt("Card type")}</label>
            <div className="flex gap-2">
              <button
                className={`btn-o flex-1 ${selectedType === "student" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                onClick={() => { setSelectedType("student"); setSelectedId(""); }}
              >
                <Ic n="students" size={16} />
                {tt("Student")}
              </button>
              <button
                className={`btn-o flex-1 ${selectedType === "teacher" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                onClick={() => { setSelectedType("teacher"); setSelectedId(""); }}
              >
                <Ic n="teacher" size={16} />
                {tt("Teacher")}
              </button>
              <button
                className={`btn-o flex-1 ${selectedType === "staff" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                onClick={() => { setSelectedType("staff"); setSelectedId(""); }}
              >
                <Ic n="briefcase" size={16} />
                {tt("Staff")}
              </button>
            </div>
          </div>

          <div>
            <label className="label">{tt("Select person")}</label>
            <select className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select {selectedType}...</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first} {p.last} - {p.idNumber}
                </option>
              ))}
            </select>
          </div>

          {selectedPerson && (
            <div className="border border-ink-200 dark:border-ink-700 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar first={selectedPerson.first} last={selectedPerson.last} hue={selectedPerson.hue} size={64} />
                <div>
                  <h3 className="font-display font-bold text-[16px]">{selectedPerson.first} {selectedPerson.last}</h3>
                  <p className="text-[12px] text-ink-400">
                    {selectedPerson.idNumber}
                  </p>
                </div>
              </div>
              <button className="btn-p w-full" onClick={() => printCard(selectedPerson)}>
                <Ic n="printer" size={16} />
                {tt("Print ID Card")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All")} {selectedType} {tt("cards")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("ID")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {people.slice(0, 20).map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar first={p.first} last={p.last} hue={p.hue} size={32} />
                      <span className="font-semibold text-[13px]">{p.first} {p.last}</span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">
                    {p.idNumber}
                  </td>
                  <td>
                    <Chip tone="green">{p.status}</Chip>
                  </td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => printCard(p)}>
                      <Ic n="printer" size={14} />
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
