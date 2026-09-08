import { useState } from "react";
import { useApp, mutate, uid, fmtDate, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Avatar, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function TeachersPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    first: "", last: "", gender: "M" as "M" | "F", phone: "", email: "",
    qualification: "", specialization: "", salary: 0, bank: ""
  });

  const openModal = (teacher?: any) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        first: teacher.first,
        last: teacher.last,
        gender: teacher.gender,
        phone: teacher.phone,
        email: teacher.email,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        salary: teacher.salary,
        bank: teacher.bank,
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        first: "", last: "", gender: "M", phone: "", email: "",
        qualification: "", specialization: "", salary: 0, bank: ""
      });
    }
    setShowModal(true);
  };

  const saveTeacher = () => {
    if (!formData.first || !formData.last) {
      toast("Please fill required fields", "err");
      return;
    }

    mutate((db) => {
      if (editingTeacher) {
        const idx = db.teachers.findIndex(t => t.id === editingTeacher.id);
        if (idx >= 0) {
          db.teachers[idx] = { ...db.teachers[idx], ...formData };
        }
      } else {
        db.teachers.unshift({
          id: uid(),
          empNo: `EMP-${db.teachers.length + 1}`,
          ...formData,
          hireDate: new Date().toISOString().slice(0, 10),
          subjects: [],
          classIds: [],
          status: "active",
          hue: Math.floor(Math.random() * 360),
        });
      }
    });

    toast(editingTeacher ? "Teacher updated" : "Teacher added");
    setShowModal(false);
  };

  const deleteTeacher = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      mutate((db) => {
        db.teachers = db.teachers.filter(t => t.id !== id);
      });
      toast("Teacher deleted");
    }
  };

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
          <button className="btn-p btn-sm" onClick={() => openModal()}>
            <Ic n="plus" size={15} />{tt("Add teacher")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Teacher")}</th>
                <th>{tt("Employee No")}</th>
                <th>{tt("Specialization")}</th>
                <th>{tt("Qualification")}</th>
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
                        <div className="text-[11px] text-ink-400">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{t.empNo}</td>
                  <td className="text-[12.5px]">{t.specialization}</td>
                  <td className="text-[12px] text-ink-400">{t.qualification}</td>
                  <td>
                    <Chip tone={t.status === "active" ? "green" : "gold"}>
                      {t.status}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(t.hireDate)}</td>
                  <td className="font-bold tnum">{fmtMoney(t.salary, db.school.currency)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-g btn-sm" onClick={() => openModal(t)}>
                        <Ic n="pencil" size={14} />
                      </button>
                      <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteTeacher(t.id)}>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingTeacher ? tt("Edit teacher") : tt("Add teacher")} w="max-w-2xl">
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
            <Field label={tt("Phone")}>
              <input type="text" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </Field>
            <Field label={tt("Email")}>
              <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Field>
            <Field label={tt("Qualification")}>
              <input type="text" className="input" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} placeholder="e.g. B.Ed, M.Sc" />
            </Field>
            <Field label={tt("Specialization")}>
              <input type="text" className="input" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. Mathematics, Physics" />
            </Field>
            <Field label={tt("Salary")}>
              <input type="number" className="input" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })} />
            </Field>
          </div>
          <Field label={tt("Bank account")}>
            <input type="text" className="input" value={formData.bank} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} placeholder="Bank account number" />
          </Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-ink-100 dark:border-ink-800">
            <button className="btn-o" onClick={() => setShowModal(false)}>{tt("Cancel")}</button>
            <button className="btn-p" onClick={saveTeacher}>
              <Ic n="check" size={15} />{editingTeacher ? tt("Update") : tt("Create")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
