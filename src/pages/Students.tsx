import { useApp, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Avatar, Chip } from "../components/ui";
import { useT } from "../lib/i18n";

export default function StudentsPage({ nav, query }: { nav: (to: string) => void; query: string }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const activeStudents = db.students.filter(x => x.status === "active");
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Students")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total students" value={db.students.length} icon="students" />
        <Stat label="Active" value={activeStudents.length} icon="check" tone="green" />
        <Stat label="Pending" value={db.admissions.filter(a => a.stage === "application").length} icon="clock" tone="gold" />
        <Stat label="Graduated" value={db.students.filter(x => x.status === "graduated").length} icon="award" tone="gold" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Student list")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("Add student")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Student")}</th>
                <th>{tt("Reg No")}</th>
                <th>{tt("Class")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Admitted")}</th>
              </tr>
            </thead>
            <tbody>
              {db.students.slice(0, 20).map((st) => {
                const cls = db.classes.find(c => c.id === st.classId);
                return (
                  <tr key={st.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar first={st.first} last={st.last} hue={st.hue} size={36} />
                        <div>
                          <div className="font-bold text-[13px]">{st.first} {st.last}</div>
                          <div className="text-[11px] text-ink-400">{st.gender === "M" ? "Male" : "Female"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{st.regNo}</td>
                    <td>{cls ? `${cls.name} ${cls.section}` : "—"}</td>
                    <td>
                      <Chip tone={st.status === "active" ? "green" : st.status === "graduated" ? "gold" : "gray"}>
                        {st.status}
                      </Chip>
                    </td>
                    <td className="text-[12px] text-ink-400">{fmtDate(st.admitted)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdmissionsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Admissions")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total applications" value={db.admissions.length} icon="userplus" />
        <Stat label="Pending" value={db.admissions.filter(a => a.stage === "application").length} icon="clock" tone="gold" />
        <Stat label="Approved" value={db.admissions.filter(a => a.stage === "approved").length} icon="check" tone="green" />
        <Stat label="Enrolled" value={db.admissions.filter(a => a.stage === "enrolled").length} icon="check" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Admission applications")}</h2>
          <button className="btn-p btn-sm"><Ic n="plus" size={15} />{tt("New application")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("App No")}</th>
                <th>{tt("Student")}</th>
                <th>{tt("Level")}</th>
                <th>{tt("Parent")}</th>
                <th>{tt("Stage")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.admissions.map((adm) => (
                <tr key={adm.id}>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{adm.appNo}</td>
                  <td className="font-bold text-[13px]">{adm.first} {adm.last}</td>
                  <td>Senior {adm.level}</td>
                  <td>
                    <div className="text-[12.5px]">{adm.parent}</div>
                    <div className="text-[11px] text-ink-400">{adm.phone}</div>
                  </td>
                  <td>
                    <Chip tone={adm.stage === "enrolled" ? "green" : adm.stage === "approved" ? "blue" : adm.stage === "rejected" ? "red" : "amber"}>
                      {adm.stage}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(adm.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
