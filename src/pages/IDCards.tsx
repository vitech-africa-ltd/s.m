import { useState } from "react";
import { useApp, mutate, uid, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast, printNow } from "../components/ui";
import { useT } from "../lib/i18n";
import { QR } from "../lib/media";

export default function IDCardsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [selectedType, setSelectedType] = useState<"student" | "teacher" | "staff">("student");
  const [selectedId, setSelectedId] = useState<string>("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [cardStyle, setCardStyle] = useState({
    bgColor: "#1e49c9",
    textColor: "#ffffff",
    accentColor: "#dca638",
    showQR: true,
    showPhoto: true,
    showExpiry: true,
  });

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

  const generateCard = async (person: any) => {
    const qrData = `VITECH-${selectedType.toUpperCase()}-${person.id}`;
    
    printNow(
      <div className="p-8 max-w-[400px] mx-auto">
        <div 
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${cardStyle.bgColor} 0%, ${cardStyle.bgColor}dd 100%)`,
            color: cardStyle.textColor
          }}
        >
          {/* Header */}
          <div className="p-6 text-center border-b-2" style={{ borderColor: cardStyle.accentColor }}>
            <div className="font-display font-bold text-[20px] mb-1">{db.school.name}</div>
            <div className="text-[11px] opacity-80">{db.school.motto}</div>
            <div className="text-[10px] opacity-60 mt-1">{db.school.address}</div>
          </div>
          
          {/* Card Type Badge */}
          <div className="px-6 py-2 text-center" style={{ backgroundColor: cardStyle.accentColor, color: "#101d38" }}>
            <div className="font-bold text-[12px] uppercase tracking-wider">
              {selectedType === "student" ? "Student ID" : selectedType === "teacher" ? "Teacher ID" : "Staff ID"}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {cardStyle.showPhoto && (
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-[28px] font-bold shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${person.hue} 55% 46%), hsl(${(person.hue + 40) % 360} 60% 34%))`,
                    color: "#fff"
                  }}
                >
                  {person.first[0]}{person.last[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="font-display font-bold text-[22px] leading-tight mb-1">
                  {person.first} {person.last}
                </div>
                <div className="text-[13px] opacity-80 font-mono mb-1">{person.idNumber}</div>
                <div className="text-[12px] opacity-70">{person.details}</div>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-[11px]">
              {person.phone && (
                <div>
                  <div className="opacity-60 mb-0.5">Phone</div>
                  <div className="font-semibold">{person.phone}</div>
                </div>
              )}
              {person.email && (
                <div>
                  <div className="opacity-60 mb-0.5">Email</div>
                  <div className="font-semibold truncate">{person.email}</div>
                </div>
              )}
              <div>
                <div className="opacity-60 mb-0.5">Issued</div>
                <div className="font-semibold">{fmtDate(todayISO())}</div>
              </div>
              {cardStyle.showExpiry && (
                <div>
                  <div className="opacity-60 mb-0.5">Valid Until</div>
                  <div className="font-semibold">{db.school.academicYear}</div>
                </div>
              )}
            </div>
            
            {/* Footer with QR */}
            {cardStyle.showQR && (
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${cardStyle.textColor}33` }}>
                <div className="text-[9px] opacity-60">
                  <div>If found, please return to:</div>
                  <div className="font-semibold">{db.school.name}</div>
                  <div>{db.school.phone}</div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <QR value={qrData} size={60} />
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
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("ID Cards")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Student cards" value={db.students.filter(s => s.status === "active").length} icon="students" />
        <Stat label="Teacher cards" value={db.teachers.filter(t => t.status === "active").length} icon="teacher" tone="blue" />
        <Stat label="Staff cards" value={db.staff.filter(s => s.status === "active").length} icon="briefcase" tone="gold" />
        <Stat label="Total cards" value={db.students.filter(s => s.status === "active").length + db.teachers.filter(t => t.status === "active").length + db.staff.filter(s => s.status === "active").length} icon="idcard" tone="green" />
      </div>

      <div className="panel p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[18px]">{tt("Generate ID Card")}</h2>
          <button className="btn-o btn-sm" onClick={() => setShowCustomize(true)}>
            <Ic n="settings" size={15} />{tt("Customize")}
          </button>
        </div>
        
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
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-[20px] font-bold shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${selectedPerson.hue} 55% 46%), hsl(${(selectedPerson.hue + 40) % 360} 60% 34%))`,
                    color: "#fff"
                  }}
                >
                  {selectedPerson.first[0]}{selectedPerson.last[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-[16px]">{selectedPerson.first} {selectedPerson.last}</h3>
                  <p className="text-[12px] text-ink-400">{selectedPerson.idNumber}</p>
                  <p className="text-[12px] text-ink-400">{selectedPerson.details}</p>
                </div>
              </div>
              <button className="btn-p w-full" onClick={() => generateCard(selectedPerson)}>
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
                <th>{tt("Details")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {people.slice(0, 20).map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${p.hue} 55% 46%), hsl(${(p.hue + 40) % 360} 60% 34%))`,
                          color: "#fff"
                        }}
                      >
                        {p.first[0]}{p.last[0]}
                      </div>
                      <span className="font-semibold text-[13px]">{p.first} {p.last}</span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">
                    {p.idNumber}
                  </td>
                  <td className="text-[12.5px]">{p.details}</td>
                  <td>
                    <Chip tone="green">{p.status}</Chip>
                  </td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => generateCard(p)}>
                      <Ic n="printer" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customize Modal */}
      <Modal open={showCustomize} onClose={() => setShowCustomize(false)} title={tt("Customize card design")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Background color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={cardStyle.bgColor} 
              onChange={(e) => setCardStyle({ ...cardStyle, bgColor: e.target.value })}
            />
          </Field>
          <Field label={tt("Text color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={cardStyle.textColor} 
              onChange={(e) => setCardStyle({ ...cardStyle, textColor: e.target.value })}
            />
          </Field>
          <Field label={tt("Accent color")}>
            <input 
              type="color" 
              className="input h-12" 
              value={cardStyle.accentColor} 
              onChange={(e) => setCardStyle({ ...cardStyle, accentColor: e.target.value })}
            />
          </Field>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={cardStyle.showQR} 
                onChange={(e) => setCardStyle({ ...cardStyle, showQR: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show QR code")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={cardStyle.showPhoto} 
                onChange={(e) => setCardStyle({ ...cardStyle, showPhoto: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show photo")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={cardStyle.showExpiry} 
                onChange={(e) => setCardStyle({ ...cardStyle, showExpiry: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]">{tt("Show expiry date")}</span>
            </label>
          </div>
          <button className="btn-p w-full" onClick={() => { setShowCustomize(false); toast("Card design saved"); }}>
            <Ic n="check" size={15} />{tt("Save design")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
