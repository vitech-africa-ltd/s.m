import { useApp, fmtDate, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar } from "../components/ui";
import { useT } from "../lib/i18n";

export default function TeachersPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const activeTeachers = db.teachers.filter(t => t.status === "active");
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Teachers")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total teachers" value={db.teachers.length} icon="teacher" />
        <Stat label="Active" value={activeTeachers.length} icon="check" tone="green" />
        <Stat label="On leave" value={db.teachers.filter(t => t.status === "leave").length} icon="clock" tone="gold" />
        <Stat label="Total payroll" value={db.teachers.reduce((a, t) => a + t.salary, 0)} icon="coins" money={db.school.currency} />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Teacher list")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Add teacher")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Teacher")}</th>
                <th>{tt("Employee No")}</th>
                <th>{tt("Specialization")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Hired")}</th>
                <th>{tt("Salary")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.teachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar first={t.first} last={t.last} hue={t.hue} size={36} />
                      <div>
                        <div className="font-bold text-[13px]">{t.first} {t.last}</div>
                        <div className="text-[11px] text-ink-400">{t.qualification}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{t.empNo}</td>
                  <td className="text-[12.5px]">{t.specialization}</td>
                  <td>
                    <Chip tone={t.status === "active" ? "green" : "gold"}>
                      {t.status}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(t.hireDate)}</td>
                  <td className="font-bold tnum">{fmtMoney(t.salary, db.school.currency)}</td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => alert("Edit teacher - Coming soon")}>
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
