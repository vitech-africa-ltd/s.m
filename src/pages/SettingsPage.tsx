import { useState } from "react";
import { useApp, mutate, audit, resetDemo, uid, todayISO, fmtDate, fmtMoney, fmtNum, COUNTRIES, CURRENCIES, CURRENCY_MAP, changeCurrency, fxRateLabel, roundBy, feeTotal, classOf, paidBy, type RoundingMode, type GradeScale } from "../lib/data";
import { Ic } from "../components/icons";
import { Modal, Confirm, Field, Chip, toast } from "../components/ui";
import { PageHead } from "./Dashboard";
import { useT } from "../lib/i18n";

const TABS = [
  { id: "school", label: "School", icon: "building" },
  { id: "academic", label: "Academic", icon: "award" },
  { id: "grading", label: "Grading", icon: "grades" },
  { id: "finance", label: "Finance & Currency", icon: "coins" },
  { id: "comm", label: "Communication", icon: "comm" },
  { id: "brand", label: "Branding", icon: "sparkles" },
  { id: "campuses", label: "Campuses", icon: "pin" },
  { id: "system", label: "System", icon: "database" },
];

export default function SettingsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [tab, setTab] = useState("school");
  const [school, setSchool] = useState({ ...db.school });
  const [grading, setGrading] = useState([...db.school.grading]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [curPick, setCurPick] = useState(false);
  const [curTarget, setCurTarget] = useState<string | null>(null);
  const [curSearch, setCurSearch] = useState("");
  const [curRate, setCurRate] = useState("");
  const [curRound, setCurRound] = useState<RoundingMode>("smart");
  const [convAmt, setConvAmt] = useState("150000");
  const [convTo, setConvTo] = useState("USD");
  const [spinning, setSpinning] = useState(false);
  const [newCampus, setNewCampus] = useState({ name: "", city: "" });

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
  const refreshRates = () => { setSpinning(true); setTimeout(() => { mutate((db) => { db.school.fxUpdatedAt = todayISO(); }); setSpinning(false); toast("Exchange rates refreshed"); }, 800); };
  const revertFx = () => {
    const lf = db.school.lastFx; if (!lf) return;
    const res = changeCurrency(lf.from);
    audit("CHANGE_CURRENCY", "Finance", `Reverted ${lf.to} → ${lf.from} · ${res.converted} records reconverted`);
    setSchool((p) => ({ ...p, currency: lf.from }));
    toast(`Currency reverted to ${lf.from} — ${res.converted.toLocaleString()} records reconverted`);
  };
  const doSwitch = () => {
    if (!curTarget) return;
    const rate = parseFloat(curRate) || undefined;
    const res = changeCurrency(curTarget, { rate, rounding: curRound });
    audit("CHANGE_CURRENCY", "Finance", `${res.from} → ${res.to} · ${res.converted} records at ${fxRateLabel(res.from, res.to)}`);
    setSchool((p) => ({ ...p, currency: curTarget }));
    toast(`${res.converted.toLocaleString()} amounts converted ${res.from} → ${curTarget}`);
    setCurPick(false); setCurTarget(null);
  };
  const ROUNDS: { id: RoundingMode; label: string; hint: string }[] = [
    { id: "smart", label: "Smart", hint: "Nearest 100 / 10 / cent by currency scale" },
    { id: "exact", label: "Exact", hint: "Keep precise amounts, 2 decimals" },
    { id: "hundred", label: "Nearest 100", hint: "Round every amount to hundreds" },
  ];
  const aggRate = parseFloat(curRate) || (curTarget ? stdRate(curTarget) : 1);
  const agg = (v: number) => curTarget ? fmtMoney(roundBy(v * aggRate, curRound, CURRENCY_MAP[curTarget]?.rate ?? 1), curTarget) : "";
  const convAmount = parseFloat(convAmt) || 0;
  const monthRev = db.payments.filter((p) => p.date.startsWith(todayISO().slice(0, 7))).reduce((a, b) => a + b.amount, 0);
  const outstanding = db.students.filter((x) => x.status === "active").reduce((a, x) => a + Math.max(0, feeTotal(db, classOf(db, x)?.level ?? 1) - paidBy(db, x.id)), 0);
  const ticker = ["RWF", "KES", "UGX", "TZS", "CDF", "NGN", "ZAR", "XAF", "EUR", "GBP"].map((code, i) => ({ code, val: CURRENCY_MAP[code]?.rate ?? 1, up: i % 3 !== 1 }));

  const saveGrading = () => {
    mutate((db) => { db.school.grading = [...grading].sort((a, b) => b.min - a.min); });
    audit("UPDATE_GRADING", "Settings", "Grading scale updated");
    toast("Grading scale saved");
  };
  const setGrade = (i: number, k: keyof GradeScale, v: string | number) => setGrading((g) => g.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addCampus = () => {
    if (!newCampus.name) { toast("Campus name is required", "err"); return; }
    mutate((db) => db.campuses.push({ id: uid(), name: newCampus.name, city: newCampus.city, active: true }));
    audit("CREATE_CAMPUS", "Campuses", `${newCampus.name} (${newCampus.city})`);
    toast("Campus added"); setNewCampus({ name: "", city: "" });
  };

  return (
    <div>
      <PageHead title="Settings" sub="School identity, academics, finance, communication and branding." />
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
              <Field label="Website"><input className="input" value={school.website} onChange={(e) => up("website", e.target.value)} /></Field>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Country & currency</h3>
            <div className="space-y-4">
              <Field label="Country (auto-configures currency & timezone)">
                <select className="input" value={school.country} onChange={(e) => setCountry(e.target.value)}>
                  {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Currency — exchange rate applied automatically">
                <button type="button" onClick={() => { setCurPick(true); setCurTarget(null); setCurSearch(""); }}
                  className="input flex items-center justify-between text-left cursor-pointer hover:border-cobalt-400 transition-colors">
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
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Academic year & terms</h3>
            <div className="space-y-4">
              <Field label="Academic year"><input className="input" value={school.academicYear} onChange={(e) => up("academicYear", e.target.value)} /></Field>
              <Field label="Terms (one per line)">
                <textarea className="input" rows={3} value={school.terms.join("\n")} onChange={(e) => up("terms", e.target.value.split("\n").filter(Boolean))} />
              </Field>
              <Field label="Current term"><select className="input" value={school.term} onChange={(e) => up("term", e.target.value)}>{school.terms.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Pass mark (%)"><input type="number" className="input tnum" value={school.passMark} onChange={(e) => up("passMark", +e.target.value)} /></Field>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />{tt("Save changes")}</button>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Current structure</h3>
            <div className="space-y-2.5">
              {[["Classes", db.classes.length, "class"], ["Subjects", db.subjects.length, "subject"], ["Exams", db.exams.length, "exams"], ["Fee structures", db.feeStructures.length, "fees"]].map(([l, v, ic]) => (
                <div key={l as string} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                  <span className="w-9 h-9 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n={ic as string} size={16} /></span>
                  <span className="font-bold text-[13.5px] flex-1">{l}</span><b className="font-display text-[17px] tnum">{v as number}</b>
                </div>
              ))}
            </div>
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
                <span className="text-[12px] font-bold text-ink-400 whitespace-nowrap">≥</span>
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
        <div className="max-w-5xl">
          <div className="panel !shadow-none overflow-hidden mb-4 flex items-stretch">
            <span className="shrink-0 px-3.5 flex items-center gap-1.5 bg-ink-950 dark:bg-cobalt-600 text-gold-400 text-[10px] font-extrabold uppercase tracking-[0.16em]"><Ic n="coins" size={12} />Live FX</span>
            <div className="overflow-hidden flex-1">
              <div className="marquee flex gap-9 w-max whitespace-nowrap py-2.5 text-[12px] font-bold">
                {[...ticker, ...ticker].map((tk, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-ink-400 font-extrabold">USD/{tk.code}</span>
                    <span className="tnum">{tk.val >= 100 ? Math.round(tk.val).toLocaleString("en-US") : tk.val.toFixed(2)}</span>
                    <span className={tk.up ? "text-emerald-500" : "text-rose-500"}>{tk.up ? "▲" : "▼"}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="font-display font-bold text-[16px]">Currency & exchange rate</h3>
                <div className="flex items-center gap-2">
                  <button className="btn-g btn-sm" onClick={refreshRates}><Ic n="refresh" size={14} className={spinning ? "animate-spin" : ""} />Refresh</button>
                  <Chip tone="green">Auto-conversion</Chip>
                </div>
              </div>
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
                <div className="rounded-lg border border-cobalt-200 dark:border-cobalt-800 bg-cobalt-50/60 dark:bg-cobalt-500/10 px-4 py-3 mt-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cobalt-600 text-white flex items-center justify-center shrink-0"><Ic n="swap" size={15} /></span>
                  <div className="min-w-0 flex-1 text-[12.5px]">
                    <b className="block">Last conversion — {db.school.lastFx.from} → {db.school.lastFx.to}</b>
                    <span className="text-ink-500 dark:text-ink-300">{fmtDate(db.school.lastFx.date)} · {db.school.lastFx.converted.toLocaleString()} records</span>
                  </div>
                  <button className="btn-o btn-sm shrink-0" onClick={revertFx}><Ic n="refresh" size={13} />Revert</button>
                </div>
              )}
              <p className="text-[12.5px] text-ink-400 leading-relaxed mt-4">When the currency changes, <b className="text-ink-600 dark:text-ink-200">{recCount.toLocaleString()} monetary records</b> — fees, payments, expenses, salaries and transport — are converted at the confirmed rate.</p>
            </div>
            <div className="panel p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">Live converter</h3>
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <Field label={`Amount in ${savedCur}`}><input type="number" className="input tnum" value={convAmt} onChange={(e) => setConvAmt(e.target.value)} /></Field>
                <Field label="Convert to">
                  <select className="input !w-[130px]" value={convTo} onChange={(e) => setConvTo(e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                </Field>
              </div>
              <div className="rounded-xl bg-cobalt-50 dark:bg-cobalt-500/10 border border-cobalt-200 dark:border-cobalt-800 px-5 py-4 mt-4 flex items-center justify-between gap-3">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-cobalt-500 dark:text-cobalt-300">Equivalent</span>
                <span className="font-display font-bold text-[24px] tnum text-cobalt-800 dark:text-cobalt-200">{fmtMoney(convAmount ? (convAmount / (CURRENCY_MAP[savedCur]?.rate ?? 1)) * (CURRENCY_MAP[convTo]?.rate ?? 1) : 0, convTo)}</span>
              </div>
              <p className="text-[11.5px] text-ink-400 font-semibold mt-2">{fxRateLabel(savedCur, convTo)}</p>
              <div className="border-t border-ink-100 dark:border-ink-800 mt-4 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Receipt prefix"><input className="input" value={school.receiptPrefix} onChange={(e) => up("receiptPrefix", e.target.value)} /></Field>
                  <Field label="Reg no prefix"><input className="input" value={school.regPrefix} onChange={(e) => up("regPrefix", e.target.value)} /></Field>
                </div>
                <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save finance settings</button>
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
            <p className="text-[12px] text-ink-400 font-semibold mt-4">SMS balance: <b className="text-ink-700 dark:text-ink-100">1,240 credits</b> · resets monthly</p>
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
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Preview</h3>
            <div className="rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700">
              <div className="px-5 py-4 text-white flex items-center gap-3" style={{ background: school.brandColor }}>
                <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold text-lg text-gold-300">{(school.logoText || "V")[0]}</span>
                <div><div className="font-display font-bold text-[16px]">{school.name}</div><div className="text-[10px] tracking-[0.18em] uppercase opacity-80">{school.motto}</div></div>
              </div>
              <div className="p-4 bg-white dark:bg-ink-950 text-[12px] text-ink-500">Branding applies to report cards, receipts, ID cards and certificates.</div>
            </div>
            <div className="mt-4"><button className="btn-o w-full" onClick={() => toast("Brand kit exported", "info")}><Ic n="download" size={15} />Export brand kit</button></div>
          </div>
        </div>
      )}

      {tab === "campuses" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Campuses ({db.campuses.length})</h3>
            <div className="space-y-2.5">
              {db.campuses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.active ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-400"}`}><Ic n="pin" size={16} /></span>
                  <span className="flex-1 min-w-0"><b className="block text-[13.5px]">{c.name}</b><span className="block text-[11.5px] text-ink-400">{c.city}</span></span>
                  <Chip tone={c.active ? "green" : "gray"}>{c.active ? "active" : "inactive"}</Chip>
                  <button className="btn-g btn-sm" onClick={() => { mutate((db) => { const x = db.campuses.find((y) => y.id === c.id)!; x.active = !x.active; }); toast(`${c.name} ${c.active ? "deactivated" : "activated"}`, "info"); }}><Ic n="swap" size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6 h-fit">
            <h3 className="font-display font-bold text-[16px] mb-4">Add campus</h3>
            <div className="space-y-4">
              <Field label="Campus name"><input className="input" value={newCampus.name} onChange={(e) => setNewCampus({ ...newCampus, name: e.target.value })} placeholder="e.g. Campus Musanze" /></Field>
              <Field label="City"><input className="input" value={newCampus.city} onChange={(e) => setNewCampus({ ...newCampus, city: e.target.value })} /></Field>
              <button className="btn-p w-full" onClick={addCampus}><Ic n="plus" size={15} />Add campus</button>
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
              <div><div className="font-display font-bold text-[18px]">VITECH School {db.system.version}</div><div className="text-[12px] text-ink-300">Stable channel · {db.system.channel}</div></div>
              {db.system.available && <Chip tone="gold" className="ml-auto">v{db.system.available} available</Chip>}
            </div>
            <div className="mt-4 space-y-2">
              {db.system.history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                  <Ic n="check" size={14} className="text-emerald-500" sw={2.5} />
                  <b className="tnum">{h.from} → {h.to}</b><span className="text-ink-400 flex-1">{fmtDate(h.date)}</span><span className="text-ink-400 tnum">{h.size}</span>
                </div>
              ))}
            </div>
            {db.system.available && <button className="btn-p w-full mt-4" onClick={() => { mutate((db) => { db.system.history.unshift({ id: uid(), from: db.system.version, to: db.system.available!, date: todayISO(), size: "5.2 MB", status: "ok" }); db.system.version = db.system.available!; db.system.available = null; }); audit("SYSTEM_UPDATED", "System", "Updated to latest version"); toast("System updated successfully"); }}><Ic n="download" size={15} />Update now</button>}
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
                    {curTarget && <span className="block text-[11px] font-bold tnum text-cobalt-700 dark:text-cobalt-300 mt-1.5">e.g. {agg(feeTotal(db, 4))}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-3.5 mt-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">Key amounts — before / after</span>
              <div className="mt-2 space-y-1.5">
                {([["Senior 4 tuition", feeTotal(db, 4)], ["Revenue this month", monthRev], ["Outstanding balance", outstanding]] as [string, number][]).map(([label, v]) => (
                  <div key={label} className="text-[12.5px]">
                    <span className="font-semibold text-ink-500 dark:text-ink-300 block">{label}</span>
                    <span className="font-bold tnum"><span className="text-ink-400 line-through decoration-rose-400/70 mr-2">{fmtMoney(v, savedCur)}</span>{agg(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[12px] text-ink-400 leading-relaxed mt-3.5 flex gap-2"><Ic n="shield" size={14} className="text-emerald-500 shrink-0 mt-0.5" />The conversion is logged, archived and reversible from this page.</p>
          </div>
        )}
      </Modal>

      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all demo data?"
        body="All changes (students, payments, settings) will be replaced with the original demonstration dataset."
        yes="Reset everything" onYes={() => { resetDemo(); toast("Demo data restored"); }} />
      <span className="hidden">{fmtNum(0)}</span>
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
