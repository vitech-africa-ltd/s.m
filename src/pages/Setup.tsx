import { useState } from "react";
import { useApp, mutate, audit, uid, COUNTRIES, CURRENCY_MAP } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, toast } from "../components/ui";

const STEPS = ["School information", "Academic year", "Classes", "Subjects", "Teachers", "Students", "Fee structure", "Finish"];

export default function SetupPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const db = s.db;
  const [step, setStep] = useState(0);
  const [school, setSchool] = useState({ name: db.school.name, country: db.school.country, phone: db.school.phone, email: db.school.email, motto: db.school.motto });
  const [year, setYear] = useState({ academicYear: db.school.academicYear, term: db.school.term });
  const [levels, setLevels] = useState([1, 2, 3, 4, 5, 6]);
  const [fee, setFee] = useState({ tuition: 150000, registration: 20000, exam: 10000 });
  const cur = CURRENCY_MAP[db.school.currency];

  const finish = () => {
    mutate((d) => {
      d.school = { ...d.school, name: school.name, country: school.country, phone: school.phone, email: school.email, motto: school.motto, academicYear: year.academicYear, term: year.term, onboarded: true };
      /* classes */
      levels.forEach((lv) => ["A", "B"].forEach((sec) => {
        if (!d.classes.some((c) => c.name === `Senior ${lv}` && c.section === sec)) {
          d.classes.push({ id: uid(), name: `Senior ${lv}`, section: sec, level: lv, room: `R-${lv}0${sec === "A" ? 1 : 2}`, capacity: 42, teacherId: d.teachers[0]?.id ?? "" });
        }
      }));
      /* fee structures for each level */
      levels.forEach((lv) => {
        const i = d.feeStructures.findIndex((f) => f.level === lv);
        const items = [
          { id: uid(), name: "Tuition", amount: fee.tuition + lv * 10000 },
          { id: uid(), name: "Registration", amount: fee.registration },
          { id: uid(), name: "Examination", amount: fee.exam },
        ];
        if (i >= 0) d.feeStructures[i].items = items; else d.feeStructures.push({ level: lv, items });
      });
    });
    audit("COMPLETE_SETUP", "Setup", `School “${school.name}” configured (${levels.length} levels)`);
    toast("Setup complete — welcome to VITECH School!");
    nav("/app");
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-4xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-lg">V</span>
          <span className="font-display font-bold text-[16px]">School setup</span>
        </div>
        <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">Step {step + 1} / {STEPS.length}</span>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* progress */}
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((st, i) => (
              <div key={st} className="flex-1 flex flex-col items-center gap-1.5">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-cobalt-600 text-white scale-110 shadow-lift" : "bg-ink-100 dark:bg-ink-800 text-ink-400"}`}>
                  {i < step ? <Ic n="check" size={14} sw={2.6} /> : i + 1}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{st}</span>
              </div>
            ))}
          </div>

          <div className="panel p-6 sm:p-8">
            <h1 className="font-display text-[24px] font-bold tracking-tight mb-1">{STEPS[step]}</h1>
            <p className="text-[13.5px] text-ink-400 mb-6">
              {step === 0 && "Tell us about your school."}
              {step === 1 && "Set the academic calendar."}
              {step === 2 && "Choose the levels your school runs."}
              {step === 3 && "We'll seed the standard curriculum — you can edit subjects later."}
              {step === 4 && "Teachers are imported from your existing staff."}
              {step === 5 && "Students will be created from admissions."}
              {step === 6 && `Define base fees in ${db.school.currency}.`}
              {step === 7 && "You're ready to go."}
            </p>

            {step === 0 && (
              <div className="space-y-4">
                <Field label="School name"><input className="input" value={school.name} onChange={(e) => setSchool({ ...school, name: e.target.value })} /></Field>
                <Field label="Country"><select className="input" value={school.country} onChange={(e) => setSchool({ ...school, country: e.target.value })}>{Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}</select></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone"><input className="input" value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} /></Field>
                  <Field label="Email"><input className="input" value={school.email} onChange={(e) => setSchool({ ...school, email: e.target.value })} /></Field>
                </div>
                <Field label="Motto"><input className="input" value={school.motto} onChange={(e) => setSchool({ ...school, motto: e.target.value })} /></Field>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Academic year"><input className="input" value={year.academicYear} onChange={(e) => setYear({ ...year, academicYear: e.target.value })} /></Field>
                <Field label="Current term"><select className="input" value={year.term} onChange={(e) => setYear({ ...year, term: e.target.value })}>{db.school.terms.map((t) => <option key={t}>{t}</option>)}</select></Field>
              </div>
            )}
            {step === 2 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((lv) => {
                  const on = levels.includes(lv);
                  return (
                    <button key={lv} onClick={() => setLevels((p) => (on ? p.filter((x) => x !== lv) : [...p, lv].sort()))}
                      className={`rounded-xl border-2 py-4 text-center transition-all cursor-pointer ${on ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10" : "border-ink-100 dark:border-ink-800 opacity-60"}`}>
                      <b className="block font-display text-[16px]">S{lv}</b>
                      <span className="text-[10px] text-ink-400 font-semibold">Senior {lv}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {(step === 3 || step === 4 || step === 5) && (
              <div className="rounded-xl bg-cobalt-50 dark:bg-cobalt-500/10 border border-cobalt-200 dark:border-cobalt-800 p-5 flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-cobalt-600 text-white flex items-center justify-center shrink-0"><Ic n={step === 3 ? "subject" : step === 4 ? "teacher" : "students"} size={22} /></span>
                <div>
                  <b className="block text-[14px]">{step === 3 ? `${db.subjects.length} subjects ready` : step === 4 ? `${db.teachers.length} teachers ready` : `${db.students.length} students ready`}</b>
                  <span className="text-[12.5px] text-ink-400">{step === 3 ? "Standard curriculum loaded — edit anytime in Subjects." : step === 4 ? "Your teaching staff is imported — assign classes anytime." : "Student records will sync from the admissions pipeline."}</span>
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <Field label={`Tuition (${db.school.currency})`}><input type="number" className="input tnum" value={fee.tuition} onChange={(e) => setFee({ ...fee, tuition: +e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={`Registration (${db.school.currency})`}><input type="number" className="input tnum" value={fee.registration} onChange={(e) => setFee({ ...fee, registration: +e.target.value })} /></Field>
                  <Field label={`Examination (${db.school.currency})`}><input type="number" className="input tnum" value={fee.exam} onChange={(e) => setFee({ ...fee, exam: +e.target.value })} /></Field>
                </div>
                <p className="text-[12px] text-ink-400">Tuition increases by 10,000 {db.school.currency} per level. Symbol: {cur?.symbol}</p>
              </div>
            )}
            {step === 7 && (
              <div className="space-y-3">
                {[["School", school.name], ["Academic year", year.academicYear], ["Levels", levels.map((l) => `S${l}`).join(", ")], ["Base tuition", `${fee.tuition.toLocaleString()} ${db.school.currency}`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3 text-[13.5px]"><span className="font-semibold text-ink-400">{k}</span><b>{v}</b></div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button className="btn-o" onClick={() => (step === 0 ? nav("/app") : setStep(step - 1))} disabled={step === 0 && false}><Ic n="chevL" size={15} />Back</button>
              {step < STEPS.length - 1 ? <button className="btn-p" onClick={() => setStep(step + 1)}>Continue<Ic n="chevR" size={15} /></button>
                : <button className="btn-p" onClick={finish}><Ic n="check" size={15} />Finish setup</button>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
