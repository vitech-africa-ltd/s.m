import { useState } from "react";
import { useApp, mutate, COUNTRIES, campusesFor } from "../lib/data";
import { Ic } from "../components/icons";
import { Field } from "../components/ui";
import { useT } from "../lib/i18n";

export default function SetupPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [step, setStep] = useState(0);
  const [schoolName, setSchoolName] = useState(db.school.name);
  const [country, setCountry] = useState(db.school.country);
  const [currency, setCurrency] = useState(db.school.currency);
  
  const steps = ["School info", "Academic year", "Classes", "Subjects", "Teachers", "Students", "Fee structure", "Finish"];
  
  const finish = () => {
    mutate((db) => {
      db.school.name = schoolName;
      db.school.country = country;
      db.school.currency = currency;
      db.school.onboarded = true;
      db.campuses = campusesFor(country);
    });
    nav("/app");
  };
  
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-[28px] font-bold mb-2">{tt("Setup Wizard")}</h1>
        <p className="text-ink-400 mb-6">{tt("Configure your school in 8 steps")}</p>
        
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${i === step ? "bg-cobalt-600 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-400"}`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{s}</span>
              {i < steps.length - 1 && <span className={`w-8 h-0.5 ${i < step ? "bg-emerald-500" : "bg-ink-100 dark:bg-ink-800"}`} />}
            </div>
          ))}
        </div>
        
        <div className="panel p-6">
          {step === 0 && (
            <div className="space-y-4">
              <Field label={tt("School name")}>
                <input className="input" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </Field>
              <Field label={tt("Country")}>
                <select className="input" value={country} onChange={(e) => { setCountry(e.target.value); setCurrency(COUNTRIES[e.target.value]?.currency ?? currency); }}>
                  {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <Field label={tt("Currency")}>
                <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </Field>
            </div>
          )}
          
          {step === 7 && (
            <div className="text-center py-8">
              <span className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4">
                <Ic n="check" size={32} sw={3} />
              </span>
              <h2 className="font-display font-bold text-[22px] mb-2">{tt("Setup complete!")}</h2>
              <p className="text-ink-400 mb-6">{tt("Your school is ready to use")}</p>
              <button className="btn-p" onClick={finish}>{tt("Go to dashboard")}</button>
            </div>
          )}
          
          {step > 0 && step < 7 && (
            <div className="text-center py-8">
              <p className="text-ink-400">{tt("Step")} {step + 1}: {steps[step]}</p>
            </div>
          )}
        </div>
        
        {step < 7 && (
          <div className="flex justify-between mt-6">
            <button className="btn-o" onClick={() => step > 0 ? setStep(step - 1) : nav("/app")} disabled={step === 0}>
              <Ic n="chevL" size={15} />{tt("Back")}
            </button>
            <button className="btn-p" onClick={() => step < 7 ? setStep(step + 1) : finish()}>
              {step === 6 ? tt("Finish") : tt("Next")}<Ic n="chevR" size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
