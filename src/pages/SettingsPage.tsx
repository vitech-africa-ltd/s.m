import { useState } from "react";
import { useApp, mutate, audit, resetDemo, todayISO, fmtDate, fmtMoney, COUNTRIES, CURRENCIES, CURRENCY_MAP, changeCurrency, fxRateLabel, feeTotal, classOf, paidBy, DEFAULT_RC, type RoundingMode, type GradeScale } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, toast, Toggle } from "../components/ui";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";
import { RC_TEMPLATES } from "./ExamsGrades";

const TABS = [
  { id: "school", label: "School", icon: "building" },
  { id: "academic", label: "Academic", icon: "award" },
  { id: "grading", label: "Grading", icon: "grades" },
  { id: "finance", label: "Finance & Currency", icon: "coins" },
  { id: "reportcard", label: "Report cards", icon: "exams" },
  { id: "comm", label: "Communication", icon: "comm" },
  { id: "brand", label: "Branding", icon: "sparkles" },
  { id: "system", label: "System", icon: "database" },
];

export default function SettingsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [tab, setTab] = useState("school");
  const [school, setSchool] = useState({ ...db.school });
  const [grading, setGrading] = useState<GradeScale[]>([...db.school.grading]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [curPick, setCurPick] = useState(false);
  const [curTarget, setCurTarget] = useState<string | null>(null);
  const [curSearch, setCurSearch] = useState("");
  const [curRate, setCurRate] = useState("");
  const [curRound, setCurRound] = useState<RoundingMode>("smart");
  const [rc, setRc] = useState({ ...(db.school.reportCard ?? DEFAULT_RC) });

  const savedCur = db.school.currency;
  const savedDef = CURRENCY_MAP[savedCur];
  const recCount = db.feeStructures.reduce((a, f) => a + f.items.length, 0) + db.payments.length + db.expenses.length + db.teachers.length + db.staff.length + db.routes.length;
  const up = (k: string, v: unknown) => setSchool((p) => ({ ...p, [k]: v }));
  const saveSchool = () => { mutate((db) => { db.school = { ...db.school, ...school }; }); audit("UPDATE_SETTINGS", "Settings", "School settings saved"); toast("School settings saved"); };

  const setCountry = (c: string) => {
    const inf = COUNTRIES[c];
    setSchool((p) => ({ ...p, country: c, currency: inf?.currency ?? p.currency, timezone: inf?.tz ?? p.timezone, phone: inf?.phone ?? p.phone }));
    if (inf) toast(`Country set — currency ${inf.currency}, timezone ${inf.tz}`, "info");
  };
  const stdRate = (to: string) => (CURRENCY_MAP[to]?.rate ?? 1) / (CURRENCY_MAP[savedCur]?.rate ?? 1);
  const openTarget = (code: string) => { setCurTarget(code); setCurRate(String(+stdRate(code).toPrecision(6))); setCurRound("smart"); };
  const doSwitch = () => {
    if (!curTarget) return;
    const rate = parseFloat(curRate) || undefined;
    const res = changeCurrency(curTarget, { rate, rounding: curRound });
    audit("CHANGE_CURRENCY", "Finance", `${res.from} → ${res.to} · ${res.converted} records`);
    setSchool((p) => ({ ...p, currency: curTarget }));
    toast(`${res.converted.toLocaleString()} amounts converted ${res.from} → ${curTarget}`);
    setCurPick(false); setCurTarget(null);
  };
  const ROUNDS: { id: RoundingMode; label: string; hint: string }[] = [
    { id: "smart", label: "Smart", hint: "Nearest 100 / 10 / cent by currency scale" },
    { id: "exact", label: "Exact", hint: "Keep precise amounts, 2 decimals" },
    { id: "hundred", label: "Nearest 100", hint: "Round every amount to hundreds" },
  ];
  const saveGrading = () => { mutate((db) => { db.school.grading = [...grading].sort((a, b) => b.min - a.min); }); audit("UPDATE_GRADING", "Settings", "Grading scale updated"); toast("Grading scale saved"); };
  const setGrade = (i: number, k: keyof GradeScale, v: string | number) => setGrading((g) => g.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const saveRc = () => { mutate((db) => { db.school.reportCard = { ...rc }; }); audit("UPDATE_REPORT_CARD", "Settings", "Report card design updated"); toast("Report card design saved"); };
  const setRcv = (k: string, v: unknown) => setRc((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <PageHead title="Settings" sub="School identity, academics, finance, report cards and branding." />
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-fit max-w-full mb-5">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${tab === tb.id ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-panel" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"}`}>
            <Ic n={tb.icon} size={14} />{tb.label}
          </button>
        ))}
      </div>

      {tab === "school" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">School identity</h3>
            <div className="space-y-4">
              <Field label="School name"><input className="input" value={school.name} onChange={(e) => up("name", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Short name"><input className="input" value={school.short} onChange={(e) => up("short", e.target.value)} /></Field>
                <Field label="Logo text"><input className="input" value={school.logoText} onChange={(e) => up("logoText", e.target.value)} /></Field>
              </div>
              <Field label="Motto"><input className="input" value={school.motto} onChange={(e) => up("motto", e.target.value)} /></Field>
              <Field label="Address"><input className="input" value={school.address} onChange={(e) => up("address", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone"><input className="input" value={school.phone} onChange={(e) => up("phone", e.target.value)} /></Field>
                <Field label="Email"><input className="input" value={school.email} onChange={(e) => up("email", e.target.value)} /></Field>
              </div>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Country & currency</h3>
            <div className="space-y-4">
              <Field label="Country (auto-configures currency & timezone)">
                <select className="input" value={school.country} onChange={(e) => setCountry(e.target.value)}>{Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}</select>
              </Field>
              <Field label="Currency — exchange rate applied automatically">
                <button type="button" onClick={() => { setCurPick(true); setCurTarget(null); setCurSearch(""); }} className="input flex items-center justify-between text-left cursor-pointer hover:border-cobalt-400 transition-colors">
                  <span className="flex items-center gap-2.5 min-w-0"><span className="text-[16px] leading-none">{savedDef?.flag}</span><b className="font-display text-[15px]">{savedCur}</b><span className="text-ink-400 text-[12px] truncate">{savedDef?.symbol} · {savedDef?.name}</span></span>
                  <span className="text-cobalt-600 dark:text-cobalt-300 text-[12px] font-bold">Change</span>
                </button>
              </Field>
              <Field label="Timezone"><input className="input" value={school.timezone} onChange={(e) => up("timezone", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Academic year"><input className="input" value={school.academicYear} onChange={(e) => up("academicYear", e.target.value)} /></Field>
                <Field label="Current term"><select className="input" value={school.term} onChange={(e) => up("term", e.target.value)}>{school.terms.map((t) => <option key={t}>{t}</option>)}</select></Field>
              </div>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />{tt("Save changes")}</button>
            </div>
          </div>
        </div>
      )}

      {tab === "academic" && (
        <div className="panel p-6 max-w-2xl">
          <h3 className="font-display font-bold text-[16px] mb-4">Academic year & terms</h3>
          <div className="space-y-4">
            <Field label="Academic year"><input className="input" value={school.academicYear} onChange={(e) => up("academicYear", e.target.value)} /></Field>
            <Field label="Terms (one per line)"><textarea className="input" rows={3} value={school.terms.join("\n")} onChange={(e) => up("terms", e.target.value.split("\n").filter(Boolean))} /></Field>
            <Field label="Pass mark (%)"><input type="number" className="input tnum" value={school.passMark} onChange={(e) => up("passMark", +e.target.value)} /></Field>
            <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />{tt("Save changes")}</button>
          </div>
        </div>
      )}

      {tab === "grading" && (
        <div className="panel p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-[16px]">Grading scale</h3>
            <Chip tone="blue">Pass mark ≥ {school.passMark}%</Chip>
          </div>
          <div className="space-y-2.5">
            {grading.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <input className="input !w-16 !text-center font-display font-bold" value={g.grade} onChange={(e) => setGrade(i, "grade", e.target.value.toUpperCase())} />
                <input className="input flex-1" value={g.label} onChange={(e) => setGrade(i, "label", e.target.value)} />
                <span className="text-[12px] font-bold text-ink-400">≥</span>
                <input type="number" className="input !w-20 !text-center tnum" value={g.min} onChange={(e) => setGrade(i, "min", +e.target.value)} />
                <span className="text-[12px] font-bold text-ink-400">%</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <button className="btn-o" onClick={() => setGrading((g) => [...g, { grade: String.fromCharCode(65 + g.length), label: "New grade", min: 0 }])}><Ic n="plus" size={15} />Add grade</button>
            <button className="btn-p ml-auto" onClick={saveGrading}><Ic n="check" size={15} />Save scale</button>
          </div>
        </div>
      )}

      {tab === "finance" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Currency & exchange rate</h3>
            <div className="rounded-xl bg-ink-950 text-white p-5 flex items-center gap-4">
              <span className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-bold text-gold-400 text-[17px] shrink-0">{savedDef?.symbol.trim()}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><b className="font-display text-[21px] leading-none">{savedCur}</b><span className="text-[15px]">{savedDef?.flag}</span></div>
                <div className="text-[12px] text-ink-300 mt-1 truncate">{savedDef?.name} · {savedDef?.symbol}</div>
              </div>
              <button className="btn-gold btn-sm ml-auto shrink-0" onClick={() => { setCurPick(true); setCurTarget(null); setCurSearch(""); }}><Ic n="swap" size={14} />Change</button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {[["Base rate", fxRateLabel("USD", savedCur)], ["Inverse", fxRateLabel(savedCur, "USD")], ["Updated", fmtDate(db.school.fxUpdatedAt ?? todayISO())]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2.5">
                  <div className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{k}</div>
                  <div className="font-display font-bold text-[12px] tnum mt-0.5 truncate">{v}</div>
                </div>
              ))}
            </div>
            {db.school.lastFx && (
              <div className="rounded-lg border border-cobalt-200 dark:border-cobalt-800 bg-cobalt-50/60 dark:bg-cobalt-500/10 px-4 py-3 mt-4 text-[12.5px]">
                <b className="block">Last conversion — {db.school.lastFx.from} → {db.school.lastFx.to}</b>
                <span className="text-ink-500 dark:text-ink-300">{fmtDate(db.school.lastFx.date)} · {db.school.lastFx.converted.toLocaleString()} records</span>
              </div>
            )}
            <p className="text-[12.5px] text-ink-400 leading-relaxed mt-4">Changing the currency converts <b className="text-ink-600 dark:text-ink-200">{recCount.toLocaleString()} monetary records</b> at the confirmed rate.</p>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Receipts & numbering</h3>
            <div className="space-y-4">
              <Field label="Receipt prefix"><input className="input" value={school.receiptPrefix} onChange={(e) => up("receiptPrefix", e.target.value)} /></Field>
              <Field label="Registration no prefix"><input className="input" value={school.regPrefix} onChange={(e) => up("regPrefix", e.target.value)} /></Field>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save finance settings</button>
            </div>
          </div>
        </div>
      )}

      {tab === "reportcard" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Report card design</h3>
            <div className="space-y-4">
              <Field label="Template">
                <div className="flex gap-2">
                  {RC_TEMPLATES.map((tp) => (
                    <button key={tp.id} onClick={() => setRcv("templateId", tp.id)} title={tp.name} className={`w-12 h-12 rounded-lg border-2 transition-all cursor-pointer ${rc.templateId === tp.id ? "border-cobalt-500 scale-110" : "border-transparent opacity-70 hover:opacity-100"}`} style={{ background: `linear-gradient(135deg, ${tp.head} 55%, ${tp.accent} 55%)` }} aria-label={tp.name} />
                  ))}
                </div>
              </Field>
              <div className="space-y-3">
                <Toggle on={rc.showAttendance} onChange={(v) => setRcv("showAttendance", v)} label="Show attendance rate" />
                <Toggle on={rc.showPosition} onChange={(v) => setRcv("showPosition", v)} label="Show class position / rank" />
                <Toggle on={rc.showStamp} onChange={(v) => setRcv("showStamp", v)} label="Show school stamp" />
              </div>
              <Field label="Teacher comment"><textarea className="input" rows={2} value={rc.teacherComment} onChange={(e) => setRcv("teacherComment", e.target.value)} /></Field>
              <Field label="Principal comment"><textarea className="input" rows={2} value={rc.principalComment} onChange={(e) => setRcv("principalComment", e.target.value)} /></Field>
              <button className="btn-p w-full" onClick={saveRc}><Ic n="check" size={15} />Save report card design</button>
            </div>
          </div>
          <div className="panel p-6 h-fit">
            <h3 className="font-display font-bold text-[16px] mb-4">Live preview</h3>
            <div className="rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700">
              <div className="px-4 py-3 text-white flex items-center gap-3" style={{ background: (RC_TEMPLATES.find((t) => t.id === rc.templateId) ?? RC_TEMPLATES[0]).head }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold" style={{ background: (RC_TEMPLATES.find((t) => t.id === rc.templateId) ?? RC_TEMPLATES[0]).accent }}>{(db.school.logoText || "V")[0]}</span>
                <div><div className="font-display font-bold text-[13px]">{db.school.name}</div><div className="text-[9px] uppercase tracking-widest opacity-80">{db.school.motto}</div></div>
              </div>
              <div className="p-4 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-ink-400">Student</span><b>Eric Niyonzima</b></div>
                <div className="flex justify-between"><span className="text-ink-400">Average</span><b>82.4%</b></div>
                {rc.showAttendance && <div className="flex justify-between"><span className="text-ink-400">Attendance</span><b>96%</b></div>}
                {rc.showPosition && <div className="flex justify-between"><span className="text-ink-400">Position</span><b>3 of 42</b></div>}
                <div className="pt-2 border-t border-ink-100 dark:border-ink-800 italic text-ink-500 dark:text-ink-300">“{rc.teacherComment}”</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "comm" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Providers</h3>
            <div className="space-y-3">
              {[["SMS provider", "Twilio", "sms"], ["WhatsApp Business", "Meta Cloud API", "comm"], ["Email SMTP", "smtp.vitech.academy:587", "email"]].map(([k, v, ic]) => (
                <div key={k} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Ic n={ic as string} size={16} /></span>
                  <span className="font-bold text-[13.5px] flex-1">{k}</span><Chip tone="green">connected</Chip>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Notification preferences</h3>
            <div className="space-y-3">
              {["Absence alerts to parents", "Payment confirmations", "Fee overdue reminders", "Exam reminders", "Admission updates"].map((x, i) => (
                <ToggleRow key={x} label={x} def={i !== 2} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "brand" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Brand colors</h3>
            <div className="flex gap-3 flex-wrap mb-5">
              {["#1e49c9", "#0c7c59", "#b45309", "#9f1239", "#4338ca", "#0e7490"].map((colr) => (
                <button key={colr} onClick={() => { mutate((db) => { db.school.brandColor = colr; }); toast("Brand color updated"); }}
                  className={`w-12 h-12 rounded-xl transition-all cursor-pointer hover:scale-110 ${school.brandColor === colr ? "ring-4 ring-offset-2 ring-ink-300 dark:ring-ink-600 dark:ring-offset-ink-900 scale-110" : ""}`} style={{ background: colr }} aria-label={`Color ${colr}`} />
              ))}
            </div>
            <Field label="Motto"><input className="input" value={school.motto} onChange={(e) => up("motto", e.target.value)} /></Field>
            <div className="mt-4"><button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Apply branding</button></div>
          </div>
          <div className="panel p-6 h-fit">
            <h3 className="font-display font-bold text-[16px] mb-4">Preview</h3>
            <div className="rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700">
              <div className="px-5 py-4 text-white flex items-center gap-3" style={{ background: school.brandColor }}>
                <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold text-lg text-gold-300">{(school.logoText || "V")[0]}</span>
                <div><div className="font-display font-bold text-[16px]">{school.name}</div><div className="text-[10px] tracking-[0.18em] uppercase opacity-80">{school.motto}</div></div>
              </div>
              <div className="p-4 text-[12px] text-ink-500">Branding applies to report cards, receipts, ID cards and certificates.</div>
            </div>
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">System updates</h3>
            <div className="rounded-xl bg-ink-950 text-white p-5 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-gold-400 text-ink-950 flex items-center justify-center font-display font-bold text-lg">v</span>
              <div><div className="font-display font-bold text-[18px]">VITECH School {db.system.version}</div><div className="text-[12px] text-ink-300">Stable channel</div></div>
              {db.system.available && <Chip tone="gold" className="ml-auto">v{db.system.available} available</Chip>}
            </div>
            {db.system.available && <button className="btn-p w-full mt-4" onClick={() => { mutate((db) => { db.system.history.unshift({ id: Math.random().toString(36).slice(2, 10), from: db.system.version, to: db.system.available!, date: todayISO(), size: "5.2 MB", status: "ok" }); db.system.version = db.system.available!; db.system.available = null; }); audit("SYSTEM_UPDATED", "System", "Updated to latest version"); toast("System updated successfully"); }}><Ic n="download" size={15} />Update now</button>}
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Data & storage</h3>
            <div className="space-y-3">
              {[["Students", db.students.length], ["Payments", db.payments.length], ["Grades", db.grades.length], ["Audit entries", db.audits.length]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-[13px]"><span className="font-semibold text-ink-500 dark:text-ink-300">{k}</span><b className="tnum">{(v as number).toLocaleString()}</b></div>
              ))}
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-4 py-3 mt-5 text-[12.5px] font-semibold text-amber-800 dark:text-amber-200 flex gap-2">
              <Ic n="alert" size={15} className="shrink-0 mt-0.5" />Resetting restores the original demonstration dataset.
            </div>
            <button className="btn-d w-full mt-4" onClick={() => setConfirmReset(true)}><Ic n="refresh" size={15} />Reset demo data</button>
          </div>
        </div>
      )}

      {/* Currency picker */}
      <Modal open={curPick} onClose={() => { setCurPick(false); setCurTarget(null); }}
        title={curTarget ? `Switch currency to ${curTarget}` : "Select currency"} w={curTarget ? "max-w-md" : "max-w-xl"}
        footer={curTarget ? (<>
          <button className="btn-o" onClick={() => setCurTarget(null)}><Ic n="chevL" size={14} />Back</button>
          <button className="btn-p" onClick={doSwitch}><Ic n="refresh" size={15} />Convert {recCount.toLocaleString()} records</button>
        </>) : undefined}>
        {!curTarget ? (
          <div>
            <div className="relative mb-3">
              <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input autoFocus className="input !pl-9" placeholder="Search currencies…" value={curSearch} onChange={(e) => setCurSearch(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[46vh] overflow-y-auto pr-1">
              {CURRENCIES.filter((c) => `${c.code} ${c.name} ${c.symbol}`.toLowerCase().includes(curSearch.toLowerCase())).map((c) => {
                const current = c.code === savedCur;
                return (
                  <button key={c.code} onClick={() => (current ? setCurPick(false) : openTarget(c.code))}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all cursor-pointer hover:-translate-y-0.5 ${current ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-500/10" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300 dark:hover:border-cobalt-700 hover:shadow-panel"}`}>
                    <span className="text-[19px] leading-none">{c.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><b className="font-display text-[14.5px]">{c.code}</b><span className="text-[12px] text-ink-400 truncate">{c.name}</span></span>
                      <span className="block text-[10.5px] font-bold text-ink-300 tnum mt-0.5">{c.code === "USD" ? "Base currency" : fxRateLabel("USD", c.code)}</span>
                    </span>
                    {current && <Chip tone="green" className="shrink-0"><Ic n="check" size={11} />Active</Chip>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="font-display font-bold text-[20px]">{CURRENCY_MAP[savedCur]?.flag} {savedCur}</span>
                <span className="w-9 h-9 rounded-full bg-cobalt-600 text-white flex items-center justify-center"><Ic n="chevR" size={16} /></span>
                <span className="font-display font-bold text-[20px]">{CURRENCY_MAP[curTarget]?.flag} {curTarget}</span>
              </div>
            </div>
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 mt-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">Exchange rate</span>
                <button className="text-[12px] font-bold text-cobalt-600 dark:text-cobalt-300 hover:underline cursor-pointer" onClick={() => setCurRate(String(+stdRate(curTarget).toPrecision(6)))}>Use standard rate</button>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-200 !py-1.5">1 {savedCur}</span>
                <span className="text-ink-300 font-bold">=</span>
                <input type="number" step="any" min="0" className="input !w-36 !text-center font-bold tnum" value={curRate} onChange={(e) => setCurRate(e.target.value)} aria-label="Exchange rate" />
                <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-200 !py-1.5">{curTarget}</span>
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400 block mb-2">Rounding policy</span>
              <div className="grid sm:grid-cols-3 gap-2">
                {ROUNDS.map((r) => (
                  <button key={r.id} onClick={() => setCurRound(r.id)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer ${curRound === r.id ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                    <b className="text-[13px] block">{r.label}</b>
                    <span className="block text-[10.5px] text-ink-400 mt-1 leading-snug">{r.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[12px] text-ink-400 leading-relaxed mt-3.5 flex gap-2"><Ic n="shield" size={14} className="text-emerald-500 shrink-0 mt-0.5" />The conversion is logged, archived and reversible.</p>
          </div>
        )}
      </Modal>

      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all demo data?"
        body="All changes (students, payments, settings) will be replaced with the original demonstration dataset."
        yes="Reset everything" onYes={() => { resetDemo(); toast("Demo data restored"); }} />
    </div>
  );
}

function ToggleRow({ label, def = true }: { label: string; def?: boolean }) {
  const [on, setOn] = useState(def);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13.5px] font-semibold">{label}</span>
      <button onClick={() => { setOn(!on); toast(`${label} ${on ? "disabled" : "enabled"}`, "info"); }} aria-label={label}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${on ? "bg-emerald-500" : "bg-ink-300 dark:bg-ink-700"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
