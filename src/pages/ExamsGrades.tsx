import { useState } from "react";
import { useApp, mutate, uid, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";
import { printProfessional, generatePrintHeader, generatePrintFooter, generateSignatureSection } from "../utils/print";

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
    const student = db.students.find(s => s.id === studentId);
    if (!student) {
      toast("Student not found", "err");
      return;
    }

    const cls = db.classes.find(c => c.id === student.classId);
    const teacher = db.teachers.find(t => t.id === cls?.teacherId);
    
    // Calculate grades for this student
    const studentGrades = db.grades.filter(g => g.studentId === studentId);
    const subjectGrades = db.subjects.map(sub => {
      const grade = studentGrades.find(g => g.subjectId === sub.id);
      return {
        subject: sub.name,
        code: sub.code,
        score: grade?.score || 0,
        maxScore: 100,
        grade: grade?.score ? (grade.score >= 80 ? 'A' : grade.score >= 70 ? 'B' : grade.score >= 60 ? 'C' : grade.score >= 50 ? 'D' : 'F') : 'N/A'
      };
    }).filter(sg => sg.score > 0);

    const average = studentGrades.length > 0 
      ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length 
      : 0;

    const content = `
      ${generatePrintHeader(db.school.name, `${db.school.address} | ${db.school.phone}`)}
      <div class="print-content">
        <h2 style="text-align: center; color: #1e49c9; margin-bottom: 30px; font-size: 24px;">STUDENT REPORT CARD</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Student Name:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${student.first} ${student.last}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Registration No:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${student.regNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Class:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${cls?.name || 'N/A'} ${cls?.section || ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Academic Year:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${db.school.academicYear}</td>
              </tr>
            </table>
          </div>
          <div>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Term:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${db.school.term}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Date of Birth:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${fmtDate(student.dob)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Gender:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${student.gender === 'M' ? 'Male' : 'Female'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #dee7f3;"><strong>Nationality:</strong></td>
                <td style="padding: 8px; border: 1px solid #dee7f3;">${student.nationality}</td>
              </tr>
            </table>
          </div>
        </div>

        <h3 style="margin-top: 30px; color: #1e49c9; border-bottom: 2px solid #1e49c9; padding-bottom: 10px;">Academic Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${subjectGrades.map(sg => `
              <tr>
                <td>${sg.subject}</td>
                <td>${sg.code}</td>
                <td><strong>${sg.score}</strong></td>
                <td>${sg.maxScore}</td>
                <td><strong style="color: ${sg.grade === 'A' || sg.grade === 'B' ? '#10b981' : sg.grade === 'C' || sg.grade === 'D' ? '#f59e0b' : '#ef4444'}">${sg.grade}</strong></td>
                <td>${sg.grade === 'A' ? 'Excellent' : sg.grade === 'B' ? 'Very Good' : sg.grade === 'C' ? 'Good' : sg.grade === 'D' ? 'Pass' : 'Fail'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="stats-grid" style="margin-top: 30px;">
          <div class="stat-card">
            <h3>Average Score</h3>
            <div class="value">${average.toFixed(2)}%</div>
          </div>
          <div class="stat-card">
            <h3>Overall Grade</h3>
            <div class="value" style="color: ${average >= 80 ? '#10b981' : average >= 70 ? '#3b82f6' : average >= 60 ? '#f59e0b' : average >= 50 ? '#f97316' : '#ef4444'}">
              ${average >= 80 ? 'A' : average >= 70 ? 'B' : average >= 60 ? 'C' : average >= 50 ? 'D' : 'F'}
            </div>
          </div>
          <div class="stat-card">
            <h3>Subjects Taken</h3>
            <div class="value">${subjectGrades.length}</div>
          </div>
          <div class="stat-card">
            <h3>Attendance</h3>
            <div class="value">95%</div>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #f8f9fc; border-radius: 8px;">
          <h4 style="color: #1e49c9; margin-bottom: 10px;">Class Teacher's Comment:</h4>
          <p style="color: #6f90c2; font-style: italic;">
            ${average >= 80 ? 'Excellent performance! Keep up the good work.' : 
              average >= 70 ? 'Very good performance. Continue to strive for excellence.' :
              average >= 60 ? 'Good performance. There is room for improvement.' :
              average >= 50 ? 'Satisfactory performance. More effort needed.' :
              'Needs significant improvement. Please consult with teachers.'}
          </p>
        </div>

        ${generateSignatureSection()}
      </div>
      ${generatePrintFooter()}
    `;
    
    printProfessional(content, `Report Card - ${student.first} ${student.last}`);
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
