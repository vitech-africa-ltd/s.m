import { useState } from "react";
import { useApp, mutate, audit, uid, todayISO, daysAgo, COUNTRIES, CURRENCIES, CURRENCY_MAP, fmtMoney } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, toast, Chip } from "../components/ui";

const STEPS = ["School info", "Academic year", "Classes", "Subjects", "Teachers", "Students", "Fee structure", "Finish"];
const SUBJECT_POOL = ["Mathematics", "English", "French", "Biology", "Chemistry", "Physics", "Geography", "History", "Computer Science", "Entrepreneurship", "Kinyarwanda", "Religious Education"];
const FN = ["Eric", "Sandrine", "Patrick", "Diane", "Yves", "Claudine", "Emmanuel", "Josiane", "Fabrice", "Ines", "Olivier", "Grace", "Kevin", "Nadine", "Bruno", "Alice"];
const LN = ["Niyonzima", "Mukamana", "Habimana", "Uwase", "Ndayisenga", "Ingabire", "Mugisha", "Umutoni", "Bizimana", "Iradukunda", "Nsengimana", "Uwimana"];

export default function SetupPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const db = s.db;
  const [step, setStep] = useState(0);
  const [school, setSchool] = useState({ name: db.school.name, motto: db.school.motto, address: db.school.address, phone: db.school.phone, email: db.school.email, website: db.school.website, country: db.school.country, currency: db.school.currency });
  const [year, setYear] = useState({ academicYear: db.school.academicYear, term: db.school.term });
  const [levels, setLevels] = useState<number[]>(Array.from(new Set(db.classes.map((c) => c.level))));
  const [sections, setSections] = useState(2);
  const [subs, setSubs] = useState<string[]>(db.subjects.map((x) => x.name));
  const [nTeachers, setNTeachers] = useState(0);
  const [nStudents, setNStudents] = useState(0);
  const [fee, setFee] = useState({ tuition: 150000, registration: 20000, exam: 10000 });
  const cur = CURRENCY_MAP[school.currency];

  const next = () => {
    // commit the current step to the DB before advancing
    if (step === 0) {
      mutate((d) => { Object.assign(d.school, school); });
      audit("SETUP_SCHOOL", "Settings", `School information configured — ${school.name}`);
    }
    if (step === 1) { mutate((d) => { d.school.academicYear = year.academicYear; d.school.term = year.term; }); audit("SETUP_YEAR", "Settings", `Academic year ${year.academicYear}`); }
    if (step === 2) {
      mutate((d) => {
        levels.forEach((lv) => Array.from({ length: sections }, (_, i) => {
          const sec = String.fromCharCode(65 + i);
          if (!d.classes.some((c) => c.name === `Senior ${lv}` && c.section === sec))
            d.classes.push({ id: uid(), name: `Senior ${lv}`, section: sec, level: lv, room: `R-${lv}0${i + 1}`, capacity: 40, teacherId: d.teachers[0]?.id ?? "" });
        }));
      });
      audit("SETUP_CLASSES", "Class", `${levels.length} levels × ${sections} sections`);
    }
    if (step === 3) {
      mutate((d) => subs.forEach((nm) => { if (!d.subjects.some((x) => x.name === nm)) d.subjects.push({ id: uid(), name: nm, code: nm.slice(0, 3).toUpperCase(), credits: 2, teacherIds: [], classLevels: levels.length ? levels : [1, 2, 3, 4, 5, 6] }); }));
      audit("SETUP_SUBJECTS", "Subject", `${subs.length} subjects configured`);
    }
    if (step === 4 && nTeachers > 0) {
      mutate((d) => Array.from({ length: nTeachers }, (_, i) => d.teachers.push({ id: uid(), empNo: `EMP-${String(d.teachers.length + i + 1).padStart(3, "0")}`, first: FN[(i * 3) % FN.length], last: LN[(i * 5 + 1) % LN.length], gender: i % 2 ? "F" : "M", phone: `+250 78${i} 000 000`, email: `teacher${d.teachers.length + i + 1}@school.edu`, qualification: "B.Ed", specialization: SUBJECT_POOL[i % SUBJECT_POOL.length], hireDate: daysAgo(30 + i), salary: 280000, bank: "Bank of Kigali", subjects: [SUBJECT_POOL[i % SUBJECT_POOL.length]], classIds: [], status: "active", hue: (i * 47) % 360 })));
      audit("SETUP_TEACHERS", "Teacher", `${nTeachers} teachers added`);
    }
    if (step === 5 && nStudents > 0) {
      mutate((d) => {
        const cls = d.classes;
        Array.from({ length: nStudents }, (_, i) => {
          const c = cls[i % cls.length];
          d.students.push({ id: uid(), regNo: `${d.school.regPrefix}-${String(d.students.length + i + 1).padStart(4, "0")}`, first: FN[(i * 7 + 2) % FN.length], last: LN[(i * 11 + 3) % LN.length], gender: i % 2 ? "F" : "M", dob: `${2010 - (i % 6)}-0${(i % 8) + 1}-15`, nationality: school.country, phone: "", email: "", address: "", prevSchool: "", admitted: daysAgo(i % 60), classId: c.id, status: "active", parent: { name: `${LN[(i * 13 + 1) % LN.length]} Family`, relation: i % 2 ? "Mother" : "Father", phone: `+250 72${i % 9} 000 000`, email: "", occupation: "", emergency: "" }, hue: (i * 61) % 360, ability: 50 + ((i * 17) % 45) });
        });
      });
      audit("SETUP_STUDENTS", "Student", `${nStudents} students imported`);
    }
    if (step === 6) {
      mutate((d) => {
        const lvs = levels.length ? levels : [1, 2, 3, 4, 5, 6];
        lvs.forEach((lv) => {
          const i = d.feeStructures.findIndex((f) => f.level === lv);
          const items = [
            { id: uid(), name: "Tuition", amount: fee.tuition + lv * 10000 }, { id: uid(), name: "Registration", amount: fee.registration }, { id: uid(), name: "Examination", amount: fee.exam },
          ];
          if (i >= 0) d.feeStructures[i].items = items; else d.feeStructures.push({ level: lv, items });
        });
      });
      audit("SETUP_FEES", "Fees", `Fee structure — tuition ${fmtMoney(fee.tuition, school.currency)}`);
    }
    setStep(step + 1);
  };
  const finish = () => {
    mutate((d) => { d.school.onboarded = true; });
    audit("SETUP_COMPLETED", "Settings", "Onboarding wizard completed");
    toast("Setup complete — your school is ready!");
    nav("/app");
  };

  const done = step > 0;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">Set up your school</h1>
          <p className="text-[13.5px] text-ink-400 mt-0.5">Step {Math.min(step + 1, 8)} of 8 — everything is saved as you go.</p>
        </div>
        <Chip tone="gold"><Ic n="sparkles" size={12} />Setup wizard</Chip>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-5">
        <div className="panel p-3 h-fit hidden lg:block">
          {STEPS.map((st, i) => (
            <div key={st} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-bold transition-colors ${i === step ? "bg-cobalt-600 text-white" : i < step ? "text-emerald-600 dark:text-emerald-400" : "text-ink-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 border ${i === step ? "border-white/40 bg-white/10" : i < step ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-ink-200 dark:border-ink-700"}`}>
                {i < step ? <Ic n="check" size={12} sw={2.6} /> : i + 1}
              </span>
              {st}
            </div>
          ))}
        </div>

        <div className="panel p-6 sm:p-7">
          {/* mobile progress */}
          <div className="lg:hidden mb-5"><div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className="h-full bg-cobalt-600 rounded-full transition-all duration-500" style={{ width: `${(Math.min(step, 7) / 7) * 100}%` }} /></div></div>

          {step === 0 && (
            <div className="space-y-4 fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="School name"><input className="input" value={school.name} onChange={(e) => setSchool({ ...school, name: e.target.value })} /></Field>
                <Field label="Motto / slogan"><input className="input" value={school.motto} onChange={(e) => setSchool({ ...school, motto: e.target.value })} /></Field>
              </div>
              <Field label="Address"><input className="input" value={school.address} onChange={(e) => setSchool({ ...school, address: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone"><input className="input" value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} /></Field>
                <Field label="Email"><input className="input" value={school.email} onChange={(e) => setSchool({ ...school, email: e.target.value })} /></Field>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Website"><input className="input" value={school.website} onChange={(e) => setSchool({ ...school, website: e.target.value })} /></Field>
                <Field label="Country">
                  <select className="input" value={school.country} onChange={(e) => { const cc = e.target.value; const inf = COUNTRIES[cc]; setSchool({ ...school, country: cc, currency: inf?.currency ?? school.currency }); if (inf) toast(`Currency → ${inf.currency}`, "info"); }}>
                    {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label="Currency">
                  <select className="input" value={school.currency} onChange={(e) => setSchool({ ...school, currency: e.target.value })}>
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                </Field>
              </div>
              <p className="text-[12.5px] text-ink-400 flex items-center gap-2"><Ic n="globe" size={14} className="text-cobalt-500" />Currency {cur?.flag} {school.currency} ({cur?.symbol}) applies to every amount in the system.</p>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4 fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Academic year"><input className="input" value={year.academicYear} onChange={(e) => setYear({ ...year, academicYear: e.target.value })} placeholder="2026–2027" /></Field>
                <Field label="Current term">
                  <select className="input" value={year.term} onChange={(e) => setYear({ ...year, term: e.target.value })}>{db.school.terms.map((tm) => <option key={tm}>{tm}</option>)}</select>
                </Field>
              </div>
              <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">Grading scale and passing marks stay configurable later in Settings → Academic.</div>
            </div>
          )}
          {step === 2 && (
            <div className="fade-in">
              <span className="label">Levels your school runs</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <button key={l} onClick={() => setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l].sort()))}
                    className={`rounded-xl border-2 px-2 py-3.5 text-center transition-all cursor-pointer ${levels.includes(l) ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/15" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                    <span className="block font-display font-bold text-lg">S{l}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5"><span className="label">Sections per level</span>
                <div className="flex gap-2">{[1, 2, 3].map((n) => <button key={n} onClick={() => setSections(n)} className={`chip cursor-pointer !py-2 !px-4 ${sections === n ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300"}`}>{String.fromCharCode(64 + n)} sections</button>)}</div>
              </div>
              <p className="text-[12.5px] text-ink-400 mt-4 font-semibold">{levels.length * sections} class sections will be created.</p>
            </div>
          )}
          {step === 3 && (
            <div className="fade-in">
              <span className="label">Subjects offered</span>
              <div className="grid sm:grid-cols-2 gap-2">
                {SUBJECT_POOL.map((nm) => (
                  <button key={nm} onClick={() => setSubs((p) => (p.includes(nm) ? p.filter((x) => x !== nm) : [...p, nm]))}
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-all cursor-pointer ${subs.includes(nm) ? "border-cobalt-400 bg-cobalt-50 dark:bg-cobalt-500/10 text-cobalt-800 dark:text-cobalt-200" : "border-ink-100 dark:border-ink-800 text-ink-500 hover:border-ink-300"}`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${subs.includes(nm) ? "bg-cobalt-600 text-white" : "border border-ink-300 dark:border-ink-600"}`}>{subs.includes(nm) && <Ic n="check" size={12} sw={2.6} />}</span>
                    {nm}
                  </button>
                ))}
              </div>
              <p className="text-[12.5px] text-ink-400 mt-3 font-semibold">{subs.length} subjects selected — teachers can be assigned later.</p>
            </div>
          )}
          {step === 4 && (
            <div className="fade-in space-y-4">
              <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">Teachers already in the system</span>
                <b className="font-display text-[17px] tnum">{db.teachers.length}</b>
              </div>
              <Field label="Add new teachers (demo profiles)">
                <input type="range" min={0} max={30} value={nTeachers} onChange={(e) => setNTeachers(+e.target.value)} className="w-full accent-cobalt-600" />
              </Field>
              <div className="text-center font-display font-bold text-[26px] tnum text-cobalt-700 dark:text-cobalt-300">{nTeachers}</div>
              <p className="text-[12.5px] text-ink-400 text-center font-semibold">Set to 0 to skip — you can add teachers anytime from the Teachers module.</p>
            </div>
          )}
          {step === 5 && (
            <div className="fade-in space-y-4">
              <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">Students already enrolled</span>
                <b className="font-display text-[17px] tnum">{db.students.length}</b>
              </div>
              <Field label="Generate demo students">
                <input type="range" min={0} max={200} step={10} value={nStudents} onChange={(e) => setNStudents(+e.target.value)} className="w-full accent-cobalt-600" />
              </Field>
              <div className="text-center font-display font-bold text-[26px] tnum text-cobalt-700 dark:text-cobalt-300">{nStudents}</div>
              <p className="text-[12.5px] text-ink-400 text-center font-semibold">They are spread across your classes with parents, fees and attendance. Replace or reset anytime.</p>
            </div>
          )}
          {step === 6 && (
            <div className="fade-in space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={`Base tuition (${school.currency})`}><input type="number" className="input tnum" value={fee.tuition} onChange={(e) => setFee({ ...fee, tuition: +e.target.value })} /></Field>
                <Field label="Registration"><input type="number" className="input tnum" value={fee.registration} onChange={(e) => setFee({ ...fee, registration: +e.target.value })} /></Field>
                <Field label="Examination"><input type="number" className="input tnum" value={fee.exam} onChange={(e) => setFee({ ...fee, exam: +e.target.value })} /></Field>
              </div>
              <div className="rounded-xl bg-cobalt-50 dark:bg-cobalt-500/10 border border-cobalt-200 dark:border-cobalt-800 px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-cobalt-500 dark:text-cobalt-300">Example — Senior {levels[0] ?? 4}</div>
                <div className="font-display font-bold text-[24px] tnum mt-1">{fmtMoney(fee.tuition + (levels[0] ?? 4) * 10000 + fee.registration + fee.exam, school.currency)}</div>
                <div className="text-[12px] text-ink-400 font-semibold">per student / year (tuition increases 10k per level)</div>
              </div>
            </div>
          )}
          {step === 7 && (
            <div className="fade-in text-center py-4">
              <span className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto"><Ic n="check" size={30} sw={2.4} /></span>
              <h3 className="font-display text-[22px] font-bold mt-4">{school.name} is configured</h3>
              <p className="text-[13.5px] text-ink-400 mt-1.5 max-w-sm mx-auto">Review your setup, then head to the dashboard. Every setting stays editable.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <Chip tone="blue">{levels.length * sections} classes</Chip>
                <Chip tone="blue">{subs.length} subjects</Chip>
                <Chip tone="blue">{db.teachers.length + nTeachers} teachers</Chip>
                <Chip tone="blue">{db.students.length + nStudents} students</Chip>
                <Chip tone="gold">{cur?.flag} {school.currency}</Chip>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-7">
            <button className="btn-o" onClick={() => (step === 0 ? nav("/app") : setStep(step - 1))}><Ic n="chevL" size={15} />Back</button>
            {step < 7 ? <button className="btn-p" onClick={next} disabled={step === 2 && !levels.length}>{step === 0 ? "Save & continue" : "Continue"}<Ic n="chevR" size={15} /></button>
              : <button className="btn-gold" onClick={finish}><Ic n="zap" size={15} />Finish setup</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
