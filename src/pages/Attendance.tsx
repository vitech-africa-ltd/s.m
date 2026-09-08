import { useState } from "react";
import { useApp, mutate, uid, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function AttendancePage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [selectedClass, setSelectedClass] = useState(db.classes[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [attendance, setAttendance] = useState<Record<string, "P" | "A" | "L" | "E">>({});

  const students = db.students.filter(s => s.classId === selectedClass && s.status === "active");

  const markAll = (status: "P" | "A" | "L" | "E") => {
    const newAttendance: Record<string, "P" | "A" | "L" | "E"> = {};
    students.forEach(s => { newAttendance[s.id] = status; });
    setAttendance(newAttendance);
  };

  const saveAttendance = () => {
    if (Object.keys(attendance).length === 0) {
      toast("Please mark attendance first", "err");
      return;
    }

    mutate((db) => {
      Object.entries(attendance).forEach(([studentId, status]) => {
        db.attendanceOverrides[`${selectedDate}:${studentId}`] = status;
      });
    });

    toast("Attendance saved successfully");
    setAttendance({});
  };

  const present = Object.values(attendance).filter(s => s === "P").length;
  const absent = Object.values(attendance).filter(s => s === "A").length;
  const late = Object.values(attendance).filter(s => s === "L").length;

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Attendance")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Present" value={present} icon="check" tone="green" />
        <Stat label="Absent" value={absent} icon="x" tone="red" />
        <Stat label="Late" value={late} icon="clock" tone="gold" />
        <Stat label="Total students" value={students.length} icon="students" tone="blue" />
      </div>

      <div className="panel p-5 mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <Field label={tt("Class")}>
            <select className="input !w-auto" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {db.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Date")}>
            <input type="date" className="input !w-auto" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <button className="btn-o btn-sm" onClick={() => markAll("P")}>
              <Ic n="check" size={14} />{tt("Mark all present")}
            </button>
            <button className="btn-o btn-sm" onClick={() => markAll("A")}>
              <Ic n="x" size={14} />{tt("Mark all absent")}
            </button>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Mark attendance")}</h2>
          <button className="btn-p btn-sm" onClick={saveAttendance}>
            <Ic n="check" size={15} />{tt("Save attendance")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Student")}</th>
                <th>{tt("Reg No")}</th>
                <th>{tt("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div className="font-bold text-[13px]">{st.first} {st.last}</div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{st.regNo}</td>
                  <td>
                    <div className="flex gap-2">
                      {(["P", "A", "L", "E"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setAttendance({ ...attendance, [st.id]: status })}
                          className={`btn-sm ${
                            attendance[st.id] === status
                              ? status === "P" ? "btn-p !bg-emerald-500"
                              : status === "A" ? "btn-p !bg-rose-500"
                              : status === "L" ? "btn-p !bg-gold-500"
                              : "btn-p !bg-ink-500"
                              : "btn-o"
                          }`}
                        >
                          {status === "P" ? "Present" : status === "A" ? "Absent" : status === "L" ? "Late" : "Excused"}
                        </button>
                      ))}
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
