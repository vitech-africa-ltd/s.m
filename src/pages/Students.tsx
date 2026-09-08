import { useState } from "react";
import { useApp, mutate, uid, fmtDate, COUNTRIES } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar, Modal, Field, Pagination, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function StudentsPage({ nav, query }: { nav: (to: string) => void; query: string }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(query);
  const perPage = 12;

  const [formData, setFormData] = useState({
    first: "", last: "", gender: "M" as "M" | "F", dob: "", nationality: "Rwandan",
    phone: "", email: "", address: "", prevSchool: "", classId: "", parent: { name: "", relation: "Father", phone: "", email: "", occupation: "", emergency: "" }
  });

  const filtered = db.students.filter(st => 
    `${st.first} ${st.last} ${st.regNo}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.ceil(filtered.length / perPage);

  const openModal = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        first: student.first,
        last: student.last,
        gender: student.gender,
        dob: student.dob,
        nationality: student.nationality,
        phone: student.phone,
        email: student.email,
        address: student.address,
        prevSchool: student.prevSchool || "",
        classId: student.classId,
        parent: { ...student.parent }
      });
    } else {
      setEditingStudent(null);
      setFormData({
        first: "", last: "", gender: "M", dob: "", nationality: "Rwandan",
        phone: "", email: "", address: "", prevSchool: "", classId: db.classes[0]?.id || "",
        parent: { name: "", relation: "Father", phone: "", email: "", occupation: "", emergency: "" }
      });
    }
    setShowModal(true);
  };

  const saveStudent = () => {
    if (!formData.first || !formData.last || !formData.classId) {
      toast("Please fill required fields", "err");
      return;
    }

    mutate((db) => {
      if (editingStudent) {
        const idx = db.students.findIndex(s => s.id === editingStudent.id);
        if (idx >= 0) {
          db.students[idx] = { ...db.students[idx], ...formData };
        }
      } else {
        const regNo = `${db.school.regPrefix}-${new Date().getFullYear()}-${String(db.students.length + 1).padStart(4, "0")}`;
        db.students.unshift({
          id: uid(),
          regNo,
          ...formData,
          admitted: new Date().toISOString().slice(0, 10),
          status: "active",
          hue: Math.floor(Math.random() * 360),
          prevSchool: formData.prevSchool || "",
        });
      }
    });

    toast(editingStudent ? "Student updated" : "Student added");
    setShowModal(false);
  };

  const deleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      mutate((db) => {
        db.students = db.students.filter(s => s.id !== id);
      });
      toast("Student deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Students")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total students" value={db.students.length} icon="students" />
        <Stat label="Active" value={db.students.filter(s => s.status === "active").length} icon="check" tone="green" />
        <Stat label="Pending" value={db.admissions.filter(a => a.stage === "application").length} icon="clock" tone="gold" />
        <Stat label="Graduated" value={db.students.filter(s => s.status === "graduated").length} icon="award" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Ic n="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                type="text"
                className="input !pl-9"
                placeholder={tt("Search students...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-p btn-sm" onClick={() => openModal()}>
            <Ic n="plus" size={15} />{tt("Add student")}
          </button>
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
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((st) => {
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
                      <Chip tone={st.status === "active" ? "green" : st.status === "graduated" ? "blue" : "gray"}>
                        {st.status}
                      </Chip>
                    </td>
                    <td className="text-[12px] text-ink-400">{fmtDate(st.admitted)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-g btn-sm" onClick={() => openModal(st)}>
                          <Ic n="pencil" size={14} />
                        </button>
                        <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteStudent(st.id)}>
                          <Ic n="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} shown={paginated.length} />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStudent ? tt("Edit student") : tt("Add student")} w="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={tt("First name")}>
              <input type="text" className="input" value={formData.first} onChange={(e) => setFormData({ ...formData, first: e.target.value })} />
            </Field>
            <Field label={tt("Last name")}>
              <input type="text" className="input" value={formData.last} onChange={(e) => setFormData({ ...formData, last: e.target.value })} />
            </Field>
            <Field label={tt("Gender")}>
              <select className="input" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as "M" | "F" })}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>
            <Field label={tt("Date of birth")}>
              <input type="date" className="input" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
            </Field>
            <Field label={tt("Nationality")}>
              <input type="text" className="input" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} />
            </Field>
            <Field label={tt("Class")}>
              <select className="input" value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                <option value="">Select class...</option>
                {db.classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                ))}
              </select>
            </Field>
            <Field label={tt("Phone")}>
              <input type="text" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </Field>
            <Field label={tt("Email")}>
              <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Field>
          </div>
          <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
            <h3 className="font-bold text-[14px] mb-3">{tt("Parent/Guardian Information")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label={tt("Parent name")}>
                <input type="text" className="input" value={formData.parent.name} onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, name: e.target.value } })} />
              </Field>
              <Field label={tt("Relationship")}>
                <select className="input" value={formData.parent.relation} onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, relation: e.target.value } })}>
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
                </select>
              </Field>
              <Field label={tt("Parent phone")}>
                <input type="text" className="input" value={formData.parent.phone} onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, phone: e.target.value } })} />
              </Field>
              <Field label={tt("Parent email")}>
                <input type="email" className="input" value={formData.parent.email} onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, email: e.target.value } })} />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-ink-100 dark:border-ink-800">
            <button className="btn-o" onClick={() => setShowModal(false)}>{tt("Cancel")}</button>
            <button className="btn-p" onClick={saveStudent}>
              <Ic n="check" size={15} />{editingStudent ? tt("Update") : tt("Create")}
            </button>
          </div>
        </div>
      </Modal>
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
                <th>{tt("Actions")}</th>
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
                    <Chip tone={adm.stage === "enrolled" ? "green" : adm.stage === "approved" ? "blue" : adm.stage === "rejected" ? "red" : "gold"}>
                      {adm.stage}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(adm.date)}</td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => toast("Application details opened")}>
                      <Ic n="eye" size={14} />
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
