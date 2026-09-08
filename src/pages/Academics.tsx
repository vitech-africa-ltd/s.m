import { useState } from "react";
import { useApp, mutate, uid, todayISO } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export function ClassesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", section: "", level: 1, room: "", capacity: 40, teacherId: "" });

  const openModal = (cls?: any) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        section: cls.section,
        level: cls.level,
        room: cls.room,
        capacity: cls.capacity,
        teacherId: cls.teacherId
      });
    } else {
      setEditingClass(null);
      setFormData({ name: "", section: "", level: 1, room: "", capacity: 40, teacherId: "" });
    }
    setShowModal(true);
  };

  const saveClass = () => {
    if (!formData.name || !formData.section) {
      toast("Please fill all required fields", "err");
      return;
    }

    mutate((db) => {
      if (editingClass) {
        const idx = db.classes.findIndex(c => c.id === editingClass.id);
        if (idx >= 0) {
          db.classes[idx] = { ...editingClass, ...formData };
        }
      } else {
        db.classes.push({
          id: uid(),
          ...formData
        });
      }
    });

    toast(editingClass ? "Class updated" : "Class created");
    setShowModal(false);
  };

  const deleteClass = (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      mutate((db) => {
        db.classes = db.classes.filter(c => c.id !== id);
      });
      toast("Class deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Classes Management")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total classes" value={db.classes.length} icon="class" />
        <Stat label="Total capacity" value={db.classes.reduce((a, c) => a + c.capacity, 0)} icon="students" tone="blue" />
        <Stat label="Average size" value={Math.round(db.classes.reduce((a, c) => a + c.capacity, 0) / Math.max(1, db.classes.length))} icon="analytics" tone="gold" />
        <Stat label="Active teachers" value={db.teachers.filter(t => t.status === "active").length} icon="teacher" tone="green" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All classes")}</h2>
          <button className="btn-p btn-sm" onClick={() => openModal()}>
            <Ic n="plus" size={15} />{tt("Add class")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("Section")}</th>
                <th>{tt("Level")}</th>
                <th>{tt("Room")}</th>
                <th>{tt("Capacity")}</th>
                <th>{tt("Teacher")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.classes.map((cls) => {
                const teacher = db.teachers.find(t => t.id === cls.teacherId);
                return (
                  <tr key={cls.id}>
                    <td className="font-bold">{cls.name}</td>
                    <td>{cls.section}</td>
                    <td>Senior {cls.level}</td>
                    <td>{cls.room}</td>
                    <td className="tnum">{cls.capacity}</td>
                    <td>{teacher ? `${teacher.first} ${teacher.last}` : "—"}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-g btn-sm" onClick={() => openModal(cls)}>
                          <Ic n="pencil" size={14} />
                        </button>
                        <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteClass(cls.id)}>
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
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingClass ? tt("Edit class") : tt("Add class")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Class name")}>
            <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Senior 1" />
          </Field>
          <Field label={tt("Section")}>
            <input type="text" className="input" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="e.g. A" />
          </Field>
          <Field label={tt("Level")}>
            <select className="input" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6].map(l => (
                <option key={l} value={l}>Senior {l}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Room")}>
            <input type="text" className="input" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="e.g. R-101" />
          </Field>
          <Field label={tt("Capacity")}>
            <input type="number" className="input" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
          </Field>
          <Field label={tt("Class teacher")}>
            <select className="input" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
              <option value="">Select teacher...</option>
              {db.teachers.filter(t => t.status === "active").map(t => (
                <option key={t.id} value={t.id}>{t.first} {t.last}</option>
              ))}
            </select>
          </Field>
          <button className="btn-p w-full" onClick={saveClass}>
            <Ic n="check" size={15} />{editingClass ? tt("Update") : tt("Create")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function SubjectsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", code: "", credits: 2, classLevels: [1, 2, 3, 4, 5, 6], teacherIds: [] as string[] });

  const openModal = (subj?: any) => {
    if (subj) {
      setEditingSubject(subj);
      setFormData({
        name: subj.name,
        code: subj.code,
        credits: subj.credits,
        classLevels: subj.classLevels,
        teacherIds: subj.teacherIds
      });
    } else {
      setEditingSubject(null);
      setFormData({ name: "", code: "", credits: 2, classLevels: [1, 2, 3, 4, 5, 6], teacherIds: [] });
    }
    setShowModal(true);
  };

  const saveSubject = () => {
    if (!formData.name || !formData.code) {
      toast("Please fill all required fields", "err");
      return;
    }

    mutate((db) => {
      if (editingSubject) {
        const idx = db.subjects.findIndex(s => s.id === editingSubject.id);
        if (idx >= 0) {
          db.subjects[idx] = { ...editingSubject, ...formData };
        }
      } else {
        db.subjects.push({
          id: uid(),
          ...formData
        });
      }
    });

    toast(editingSubject ? "Subject updated" : "Subject created");
    setShowModal(false);
  };

  const deleteSubject = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      mutate((db) => {
        db.subjects = db.subjects.filter(s => s.id !== id);
      });
      toast("Subject deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Subjects Management")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total subjects" value={db.subjects.length} icon="subject" />
        <Stat label="Total credits" value={db.subjects.reduce((a, s) => a + s.credits, 0)} icon="analytics" tone="blue" />
        <Stat label="Active teachers" value={db.teachers.filter(t => t.status === "active").length} icon="teacher" tone="green" />
        <Stat label="Average credits" value={Math.round(db.subjects.reduce((a, s) => a + s.credits, 0) / Math.max(1, db.subjects.length))} icon="grades" tone="gold" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All subjects")}</h2>
          <button className="btn-p btn-sm" onClick={() => openModal()}>
            <Ic n="plus" size={15} />{tt("Add subject")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Name")}</th>
                <th>{tt("Code")}</th>
                <th>{tt("Credits")}</th>
                <th>{tt("Levels")}</th>
                <th>{tt("Teachers")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.subjects.map((subj) => {
                const teachers = db.teachers.filter(t => subj.teacherIds.includes(t.id));
                return (
                  <tr key={subj.id}>
                    <td className="font-bold">{subj.name}</td>
                    <td className="font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400">{subj.code}</td>
                    <td className="tnum">{subj.credits}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {subj.classLevels.map(l => (
                          <Chip key={l} tone="blue" className="!text-[10px]">S{l}</Chip>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="text-[12px]">
                        {teachers.length > 0 ? teachers.map(t => `${t.first} ${t.last}`).join(", ") : "—"}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-g btn-sm" onClick={() => openModal(subj)}>
                          <Ic n="pencil" size={14} />
                        </button>
                        <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteSubject(subj.id)}>
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
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSubject ? tt("Edit subject") : tt("Add subject")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Subject name")}>
            <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Mathematics" />
          </Field>
          <Field label={tt("Subject code")}>
            <input type="text" className="input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. MATH" />
          </Field>
          <Field label={tt("Credits")}>
            <input type="number" className="input" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} />
          </Field>
          <Field label={tt("Class levels")}>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map(l => (
                <label key={l} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.classLevels.includes(l)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, classLevels: [...formData.classLevels, l] });
                      } else {
                        setFormData({ ...formData, classLevels: formData.classLevels.filter(x => x !== l) });
                      }
                    }}
                  />
                  S{l}
                </label>
              ))}
            </div>
          </Field>
          <Field label={tt("Teachers")}>
            <select
              multiple
              className="input h-32"
              value={formData.teacherIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, o => o.value);
                setFormData({ ...formData, teacherIds: selected });
              }}
            >
              {db.teachers.filter(t => t.status === "active").map(t => (
                <option key={t.id} value={t.id}>{t.first} {t.last}</option>
              ))}
            </select>
            <p className="text-[11px] text-ink-400 mt-1">Hold Ctrl/Cmd to select multiple teachers</p>
          </Field>
          <button className="btn-p w-full" onClick={saveSubject}>
            <Ic n="check" size={15} />{editingSubject ? tt("Update") : tt("Create")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function TimetablePage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [selectedClass, setSelectedClass] = useState(db.classes[0]?.id || "");
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [formData, setFormData] = useState({ day: 0, start: "", end: "", subjectId: "", teacherId: "", room: "" });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const classTimetable = db.timetable.filter(t => t.classId === selectedClass);

  const openModal = (slot?: any) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        room: slot.room
      });
    } else {
      setEditingSlot(null);
      setFormData({ day: 0, start: "08:00", end: "09:00", subjectId: "", teacherId: "", room: "" });
    }
    setShowModal(true);
  };

  const saveSlot = () => {
    if (!formData.subjectId || !formData.teacherId) {
      toast("Please fill all required fields", "err");
      return;
    }

    mutate((db) => {
      if (editingSlot) {
        const idx = db.timetable.findIndex(t => t.id === editingSlot.id);
        if (idx >= 0) {
          db.timetable[idx] = { ...editingSlot, ...formData, classId: selectedClass };
        }
      } else {
        db.timetable.push({
          id: uid(),
          ...formData,
          classId: selectedClass
        });
      }
    });

    toast(editingSlot ? "Slot updated" : "Slot created");
    setShowModal(false);
  };

  const deleteSlot = (id: string) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      mutate((db) => {
        db.timetable = db.timetable.filter(t => t.id !== id);
      });
      toast("Slot deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Timetable Management")}</h1>

      <div className="panel p-4 mb-5">
        <div className="flex items-center gap-4">
          <label className="label mb-0">{tt("Select class")}:</label>
          <select className="input !w-auto" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {db.classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} {cls.section}</option>
            ))}
          </select>
          <button className="btn-p btn-sm ml-auto" onClick={() => openModal()}>
            <Ic n="plus" size={15} />{tt("Add slot")}
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Day")}</th>
                <th>{tt("Time")}</th>
                <th>{tt("Subject")}</th>
                <th>{tt("Teacher")}</th>
                <th>{tt("Room")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIdx) => {
                const daySlots = classTimetable.filter(t => t.day === dayIdx).sort((a, b) => a.start.localeCompare(b.start));
                return daySlots.map((slot, idx) => {
                  const subject = db.subjects.find(s => s.id === slot.subjectId);
                  const teacher = db.teachers.find(t => t.id === slot.teacherId);
                  return (
                    <tr key={slot.id}>
                      <td className="font-bold">{idx === 0 ? day : ""}</td>
                      <td className="tnum">{slot.start} - {slot.end}</td>
                      <td>{subject?.name || "—"}</td>
                      <td>{teacher ? `${teacher.first} ${teacher.last}` : "—"}</td>
                      <td>{slot.room}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-g btn-sm" onClick={() => openModal(slot)}>
                            <Ic n="pencil" size={14} />
                          </button>
                          <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteSlot(slot.id)}>
                            <Ic n="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSlot ? tt("Edit slot") : tt("Add slot")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Day")}>
            <select className="input" value={formData.day} onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}>
              {days.map((day, idx) => (
                <option key={idx} value={idx}>{day}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tt("Start time")}>
              <input type="time" className="input" value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} />
            </Field>
            <Field label={tt("End time")}>
              <input type="time" className="input" value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })} />
            </Field>
          </div>
          <Field label={tt("Subject")}>
            <select className="input" value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}>
              <option value="">Select subject...</option>
              {db.subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Teacher")}>
            <select className="input" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
              <option value="">Select teacher...</option>
              {db.teachers.filter(t => t.status === "active").map(t => (
                <option key={t.id} value={t.id}>{t.first} {t.last}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Room")}>
            <input type="text" className="input" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="e.g. R-101" />
          </Field>
          <button className="btn-p w-full" onClick={saveSlot}>
            <Ic n="check" size={15} />{editingSlot ? tt("Update") : tt("Create")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
