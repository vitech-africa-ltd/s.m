import { useState } from "react";
import { useApp, mutate, uid, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export function ExamsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", term: "", date: "", classLevels: [] as number[], subjectIds: [] as string[], maxScore: 100 });

  const createExam = () => {
    if (!formData.name || !formData.date) {
      toast("Please fill required fields", "err");
      return;
    }
    mutate((db) => {
      db.exams.unshift({
        id: uid(),
        ...formData,
        status: "scheduled",
      });
    });
    toast("Exam created successfully");
    setShowModal(false);
    setFormData({ name: "", term: "", date: "", classLevels: [], subjectIds: [], maxScore: 100 });
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Exams")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Total exams" value={db.exams.length} icon="exams" />
        <Stat label="Scheduled" value={db.exams.filter(e => e.status === "scheduled").length} icon="clock" tone="gold" />
        <Stat label="Completed" value={db.exams.filter(e => e.status === "completed").length} icon="check" tone="green" />
        <Stat label="Ongoing" value={db.exams.filter(e => e.status === "ongoing").length} icon="play" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All exams")}</h2>
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Create exam")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Exam Name")}</th>
                <th>{tt("Term")}</th>
                <th>{tt("Date")}</th>
                <th>{tt("Max Score")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="font-bold text-[13px]">{exam.name}</td>
                  <td className="text-[12.5px]">{exam.term}</td>
                  <td className="text-[12px] text-ink-400">{fmtDate(exam.date)}</td>
                  <td className="tnum">{exam.maxScore}</td>
                  <td>
                    <Chip tone={exam.status === "completed" ? "green" : exam.status === "ongoing" ? "blue" : "gold"}>
                      {exam.status}
                    </Chip>
                  </td>
                  <td>
                    <button className="btn-g btn-sm" onClick={() => toast("Exam details")}>
                      <Ic n="eye" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Create exam")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Exam name")}>
            <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Field>
          <Field label={tt("Term")}>
            <input type="text" className="input" value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })} placeholder="e.g. Term 1" />
          </Field>
          <Field label={tt("Date")}>
            <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </Field>
          <Field label={tt("Max score")}>
            <input type="number" className="input" value={formData.maxScore} onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })} />
          </Field>
          <button className="btn-p w-full" onClick={createExam}>
            <Ic n="check" size={15} />{tt("Create exam")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function GradesPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [selectedExam, setSelectedExam] = useState(db.exams[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(db.classes[0]?.id || "");
  const [grades, setGrades] = useState<Record<string, number>>({});

  const students = db.students.filter(s => s.classId === selectedClass && s.status === "active");
  const subjects = db.subjects;

  const saveGrades = () => {
    if (Object.keys(grades).length === 0) {
      toast("Please enter grades first", "err");
      return;
    }

    mutate((db) => {
      Object.entries(grades).forEach(([key, score]) => {
        const [studentId, subjectId] = key.split("_");
        const existing = db.grades.find(g => g.examId === selectedExam && g.studentId === studentId && g.subjectId === subjectId);
        if (existing) {
          existing.score = score;
        } else {
          db.grades.push({
            id: uid(),
            examId: selectedExam,
            studentId,
            subjectId,
            score,
          });
        }
      });
    });

    toast("Grades saved successfully");
    setGrades({});
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Grades")}</h1>

      <div className="panel p-5 mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <Field label={tt("Exam")}>
            <select className="input !w-auto" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
              {db.exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </Field>
          <Field label={tt("Class")}>
            <select className="input !w-auto" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {db.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Enter grades")}</h2>
          <button className="btn-p btn-sm" onClick={saveGrades}>
            <Ic n="check" size={15} />{tt("Save grades")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Student")}</th>
                {subjects.slice(0, 5).map(sub => (
                  <th key={sub.id}>{sub.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td className="font-bold text-[13px]">{st.first} {st.last}</td>
                  {subjects.slice(0, 5).map(sub => {
                    const key = `${st.id}_${sub.id}`;
                    return (
                      <td key={sub.id}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="input !w-20 !h-8"
                          value={grades[key] || ""}
                          onChange={(e) => setGrades({ ...grades, [key]: parseInt(e.target.value) || 0 })}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReportCardsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;

  const generateReportCard = (studentId: string) => {
    toast("Report card generated");
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Report Cards")}</h1>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Generate report cards")}</h2>
          <button className="btn-p btn-sm" onClick={() => toast("Bulk generation - Coming soon")}>
            <Ic n="download" size={15} />{tt("Generate all")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Student")}</th>
                <th>{tt("Class")}</th>
                <th>{tt("Average")}</th>
                <th>{tt("Rank")}</th>
                <th>{tt("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.students.filter(s => s.status === "active").slice(0, 20).map((st) => {
                const cls = db.classes.find(c => c.id === st.classId);
                const studentGrades = db.grades.filter(g => g.studentId === st.id);
                const avg = studentGrades.length > 0 ? studentGrades.reduce((a, g) => a + g.score, 0) / studentGrades.length : 0;
                return (
                  <tr key={st.id}>
                    <td className="font-bold text-[13px]">{st.first} {st.last}</td>
                    <td className="text-[12.5px]">{cls ? `${cls.name} ${cls.section}` : "—"}</td>
                    <td className="tnum font-bold">{avg.toFixed(1)}%</td>
                    <td className="tnum">#{Math.floor(Math.random() * 30) + 1}</td>
                    <td>
                      <button className="btn-g btn-sm" onClick={() => generateReportCard(st.id)}>
                        <Ic n="printer" size={14} />
                      </button>
                    </td>
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
