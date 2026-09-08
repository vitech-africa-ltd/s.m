import { useState } from "react";
import { useApp, mutate, COUNTRIES, CURRENCIES, setPrefs } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, toast } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";

export default function SettingsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [school, setSchool] = useState({ ...db.school });

  const saveSettings = () => {
    mutate((db) => {
      db.school = { ...db.school, ...school };
    });
    toast("Settings saved successfully");
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Settings")}</h1>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* School Information */}
        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("School Information")}</h2>
          <div className="space-y-4">
            <Field label={tt("School name")}>
              <input type="text" className="input" value={school.name} onChange={(e) => setSchool({ ...school, name: e.target.value })} />
            </Field>
            <Field label={tt("Short name")}>
              <input type="text" className="input" value={school.short} onChange={(e) => setSchool({ ...school, short: e.target.value })} />
            </Field>
            <Field label={tt("Motto")}>
              <input type="text" className="input" value={school.motto} onChange={(e) => setSchool({ ...school, motto: e.target.value })} />
            </Field>
            <Field label={tt("Address")}>
              <textarea className="input" rows={2} value={school.address} onChange={(e) => setSchool({ ...school, address: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={tt("Phone")}>
                <input type="text" className="input" value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} />
              </Field>
              <Field label={tt("Email")}>
                <input type="email" className="input" value={school.email} onChange={(e) => setSchool({ ...school, email: e.target.value })} />
              </Field>
            </div>
            <Field label={tt("Website")}>
              <input type="text" className="input" value={school.website} onChange={(e) => setSchool({ ...school, website: e.target.value })} />
            </Field>
          </div>
        </div>

        {/* Academic Settings */}
        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("Academic Settings")}</h2>
          <div className="space-y-4">
            <Field label={tt("Country")}>
              <select className="input" value={school.country} onChange={(e) => {
                const country = e.target.value;
                const currency = COUNTRIES[country]?.currency || "USD";
                setSchool({ ...school, country, currency });
              }}>
                {Object.keys(COUNTRIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={tt("Currency")}>
              <select className="input" value={school.currency} onChange={(e) => setSchool({ ...school, currency: e.target.value })}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={tt("Academic year")}>
                <input type="text" className="input" value={school.academicYear} onChange={(e) => setSchool({ ...school, academicYear: e.target.value })} />
              </Field>
              <Field label={tt("Current term")}>
                <select className="input" value={school.term} onChange={(e) => setSchool({ ...school, term: e.target.value })}>
                  {school.terms.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={tt("Pass mark (%)")}>
              <input type="number" className="input" value={school.passMark} onChange={(e) => setSchool({ ...school, passMark: parseInt(e.target.value) })} />
            </Field>
          </div>
        </div>

        {/* Appearance */}
        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("Appearance")}</h2>
          <div className="space-y-4">
            <Field label={tt("Language")}>
              <select className="input" value={s.prefs.lang} onChange={(e) => setPrefs({ lang: e.target.value as any })}>
                {LANGS.map(l => (
                  <option key={l.code} value={l.code}>{l.native}</option>
                ))}
              </select>
            </Field>
            <Field label={tt("Theme")}>
              <div className="flex gap-2">
                <button
                  className={`btn-o flex-1 ${s.prefs.theme === "light" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                  onClick={() => setPrefs({ theme: "light" })}
                >
                  <Ic n="sun" size={16} />{tt("Light")}
                </button>
                <button
                  className={`btn-o flex-1 ${s.prefs.theme === "dark" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                  onClick={() => setPrefs({ theme: "dark" })}
                >
                  <Ic n="moon" size={16} />{tt("Dark")}
                </button>
              </div>
            </Field>
          </div>
        </div>

        {/* System Info */}
        <div className="panel p-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("System Information")}</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Version")}</span>
              <span className="font-bold">{db.system.version}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Channel")}</span>
              <span className="font-bold">{db.system.channel}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total students")}</span>
              <span className="font-bold">{db.students.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total teachers")}</span>
              <span className="font-bold">{db.teachers.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-500 dark:text-ink-300">{tt("Total classes")}</span>
              <span className="font-bold">{db.classes.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn-p" onClick={saveSettings}>
          <Ic n="check" size={15} />{tt("Save settings")}
        </button>
      </div>
    </div>
  );
}
