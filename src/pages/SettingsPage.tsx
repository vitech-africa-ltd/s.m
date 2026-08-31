import { useState } from "react";
import { useApp, mutate, audit, resetDemo, COUNTRIES, CURRENCIES, CURRENCY_MAP, changeCurrency, fxRateLabel, fmtMoney, fmtMoneyConv, feeTotal, type GradeScale } from "../lib/data";
import { Ic } from "../components/icons";
import { Field, Chip, toast, Confirm, Modal } from "../components/ui";
import { PageHead } from "./Dashboard";

export default function SettingsPage() {
  const s = useApp();
  const db = s.db;
  const [tab, setTab] = useState("school");
  const [school, setSchool] = useState({ ...db.school });
  const [reset, setReset] = useState(false);
  const [curPick, setCurPick] = useState(false);
  const [curSearch, setCurSearch] = useState("");
  const [curTarget, setCurTarget] = useState<string | null>(null);
  const [convAmt, setConvAmt] = useState("150000");
  const [convTo, setConvTo] = useState("USD");
  const savedCur = db.school.currency;
  const savedDef = CURRENCY_MAP[savedCur];
  const curAmount = parseFloat(convAmt) || 0;
  const recCount = db.feeStructures.reduce((a, f) => a + f.items.length, 0) + db.payments.length + db.expenses.length + db.teachers.length + db.staff.length + db.routes.length;
  const up = (k: string, v: string | number) => setSchool((p) => ({ ...p, [k]: v }));
  const saveSchool = () => {
    mutate((db) => { db.school = { ...school }; });
    audit("UPDATE_SETTINGS", "Settings", `School settings updated (${school.name})`);
    toast("School settings saved — applied across the platform");
  };
  const setCountry = (c: string) => {
    const inf = COUNTRIES[c];
    setSchool((p) => ({ ...p, country: c, currency: inf?.currency ?? p.currency, timezone: inf?.tz ?? p.timezone, phone: inf?.phone ?? p.phone }));
    if (inf) toast(`Country set — currency ${inf.currency}, timezone ${inf.tz}`, "info");
  };
  const tabs = [["school", "School", "building"], ["academic", "Academic", "teacher"], ["finance", "Finance", "coins"], ["comm", "Communication", "comm"], ["brand", "Branding", "sparkles"], ["campus", "Campuses", "globe"], ["system", "System", "settings"]] as const;

  return (
    <div>
      <PageHead title="Settings" sub="Everything about your school is configurable — nothing is hardcoded." />
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-fit max-w-full mb-5">
        {tabs.map(([id, label, ic]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${tab === id ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-panel" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"}`}><Ic n={ic} size={14} />{label}</button>
        ))}
      </div>

      {tab === "school" && (
        <div className="panel p-6 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="School name"><input className="input" value={school.name} onChange={(e) => up("name", e.target.value)} /></Field>
            <Field label="Short name / logo text"><input className="input" value={school.logoText} onChange={(e) => up("logoText", e.target.value)} /></Field>
            <Field label="Motto"><input className="input" value={school.motto} onChange={(e) => up("motto", e.target.value)} /></Field>
            <Field label="Website"><input className="input" value={school.website} onChange={(e) => up("website", e.target.value)} /></Field>
            <Field label="Email"><input className="input" value={school.email} onChange={(e) => up("email", e.target.value)} /></Field>
            <Field label="Phone"><input className="input" value={school.phone} onChange={(e) => up("phone", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><input className="input" value={school.address} onChange={(e) => up("address", e.target.value)} /></Field></div>
            <Field label="Country">
              <select className="input" value={school.country} onChange={(e) => setCountry(e.target.value)}>{Object.keys(COUNTRIES).map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Currency — exchange rate applied automatically">
              <button type="button" onClick={() => { setCurPick(true); setCurTarget(null); setCurSearch(""); }}
                className="input flex items-center justify-between text-left cursor-pointer hover:border-cobalt-400 transition-colors group">
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[16px] leading-none">{savedDef?.flag}</span>
                  <b className="font-display text-[15px]">{savedCur}</b>
                  <span className="text-ink-400 text-[12px] truncate">{savedDef?.symbol} · {savedDef?.name}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0 text-cobalt-600 dark:text-cobalt-300 text-[12px] font-bold">Change<Ic n="chevR" size={13} /></span>
              </button>
            </Field>
            <Field label="Timezone (auto)"><input className="input" value={school.timezone} onChange={(e) => up("timezone", e.target.value)} /></Field>
            <Field label="Date format"><select className="input" value={school.dateFormat} onChange={(e) => up("dateFormat", e.target.value)}>{["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((d) => <option key={d}>{d}</option>)}</select></Field>
          </div>
          <div className="flex justify-end mt-6"><button className="btn-p" onClick={saveSchool}><Ic n="check" size={15} />Save school settings</button></div>
        </div>
      )}

      {tab === "academic" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Academic year & terms</h3>
            <div className="space-y-4">
              <Field label="Current academic year"><input className="input" value={school.academicYear} onChange={(e) => up("academicYear", e.target.value)} /></Field>
              <Field label="Active term"><select className="input" value={school.term} onChange={(e) => up("term", e.target.value)}>{school.terms.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Pass mark (%)"><input type="number" className="input" value={school.passMark} onChange={(e) => up("passMark", +e.target.value)} /></Field>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save academic settings</button>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-1">Grading scale</h3>
            <p className="text-[12.5px] text-ink-400 mb-4">Letters, labels and minimum marks — fully editable.</p>
            <div className="space-y-2.5">
              {school.grading.map((g: GradeScale, i: number) => (
                <div key={g.grade} className="grid grid-cols-[60px_1fr_90px_32px] gap-2 items-center">
                  <input className="input !text-center font-display font-bold" value={g.grade} onChange={(e) => setSchool((p) => ({ ...p, grading: p.grading.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)) }))} />
                  <input className="input" value={g.label} onChange={(e) => setSchool((p) => ({ ...p, grading: p.grading.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))} />
                  <input type="number" className="input !text-center tnum" value={g.min} onChange={(e) => setSchool((p) => ({ ...p, grading: p.grading.map((x, j) => (j === i ? { ...x, min: +e.target.value } : x)) }))} />
                  <button className="btn-g !px-1.5 !text-rose-500" onClick={() => setSchool((p) => ({ ...p, grading: p.grading.filter((_, j) => j !== i) }))} aria-label="Remove grade"><Ic n="trash" size={14} /></button>
                </div>
              ))}
              <button className="btn-o btn-sm w-full" onClick={() => setSchool((p) => ({ ...p, grading: [...p.grading, { grade: "G", min: 0, label: "New grade" }] }))}><Ic n="plus" size={14} />Add grade band</button>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save grading scale</button>
            </div>
          </div>
        </div>
      )}

      {tab === "finance" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[16px]">Currency & exchange rate</h3>
              <Chip tone="green"><i className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />Auto-conversion</Chip>
            </div>
            <div className="rounded-xl bg-ink-950 text-white p-5 flex items-center gap-4">
              <span className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-bold text-gold-400 text-[17px] shrink-0">{savedDef?.symbol.trim()}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><b className="font-display text-[21px] leading-none">{savedCur}</b><span className="text-[15px]">{savedDef?.flag}</span></div>
                <div className="text-[12px] text-ink-300 mt-1 truncate">{savedDef?.name} · {savedDef?.symbol}</div>
              </div>
              <button className="btn-gold btn-sm ml-auto shrink-0" onClick={() => { setCurPick(true); setCurTarget(null); setCurSearch(""); }}><Ic n="swap" size={14} />Change</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Base rate</div>
                <div className="font-display font-bold text-[15px] tnum mt-0.5">{fxRateLabel("USD", savedCur)}</div>
              </div>
              <div className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Inverse</div>
                <div className="font-display font-bold text-[15px] tnum mt-0.5">{fxRateLabel(savedCur, "USD")}</div>
              </div>
            </div>
            <p className="text-[12.5px] text-ink-400 leading-relaxed mt-4">When the currency changes, <b className="text-ink-600 dark:text-ink-200">{recCount.toLocaleString()} monetary records</b> — fee structures, payments, expenses, salaries and transport fees — are converted automatically at the exchange rate. Nothing is lost or left in the old currency.</p>
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
              <span className="font-display font-bold text-[24px] tnum text-cobalt-800 dark:text-cobalt-200">{fmtMoneyConv(curAmount, savedCur, convTo)}</span>
            </div>
            <p className="text-[11.5px] text-ink-400 font-semibold mt-2">{fxRateLabel(savedCur, convTo)}</p>
            <div className="border-t border-ink-100 dark:border-ink-800 mt-4 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Receipt prefix"><input className="input" value={school.receiptPrefix} onChange={(e) => up("receiptPrefix", e.target.value)} /></Field>
                <Field label="Registration number prefix"><input className="input" value={school.regPrefix} onChange={(e) => up("regPrefix", e.target.value)} /></Field>
              </div>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save finance settings</button>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Payment methods</h3>
            <div className="space-y-2.5">
              {[["Cash", true, "coins"], ["Mobile Money — MTN / Airtel", true, "phone"], ["Bank transfer", true, "bank"], ["Card — Visa / Mastercard", true, "payment"], ["Stripe (online)", false, "globe"], ["PayPal (online)", false, "globe"]].map(([n, on, ic]) => (
                <div key={n as string} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                  <Ic n={ic as string} size={16} className={on ? "text-cobalt-500" : "text-ink-300"} />
                  <span className="text-[13.5px] font-semibold">{n}</span>
                  <Chip tone={on ? "green" : "gray"} className="ml-auto">{on ? "Enabled" : "Coming soon"}</Chip>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-ink-400 font-semibold mt-3">Gateway APIs (MTN MoMo, Airtel Money, Stripe, bank APIs) plug into the same payment pipeline.</p>
          </div>
        </div>
      )}

      {tab === "comm" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
          {[["SMS provider", "Twilio", [["Account SID", "AC••••••••"], ["Auth token", "••••••••"], ["Sender ID", "VITECH"]]], ["WhatsApp Business API", "Meta Cloud", [["Phone number ID", "102••••••"], ["Access token", "EAAG••••••"], ["Business account", "VITECH Group"]]], ["Email (SMTP)", "SendGrid", [["SMTP host", "smtp.sendgrid.net"], ["Port", "587"], ["From address", school.email]]], ["Notifications", "In-app + Push", [["Default absence alert", "SMS + WhatsApp"], ["Payment confirmation", "WhatsApp + Email"], ["Fee reminders", "Weekly — Mondays"]]]].map(([title, provider, fields]) => (
            <div key={title as string} className="panel p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-[16px]">{title}</h3><Chip tone="green"><i className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />{provider}</Chip></div>
              <div className="space-y-3">
                {(fields as string[][]).map(([k, v]) => <Field key={k} label={k}><input className="input font-mono !text-[12.5px]" defaultValue={v} /></Field>)}
              </div>
              <button className="btn-o btn-sm mt-4" onClick={() => { audit("UPDATE_SETTINGS", "Settings", `${title} configuration updated`); toast("Provider configuration saved"); }}><Ic n="check" size={14} />Save configuration</button>
            </div>
          ))}
        </div>
      )}

      {tab === "brand" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Brand identity</h3>
            <div className="space-y-4">
              <Field label="Logo text (monogram)"><input className="input" value={school.logoText} onChange={(e) => up("logoText", e.target.value)} /></Field>
              <div>
                <span className="label">Brand colour</span>
                <div className="flex gap-2">
                  {["#1e49c9", "#0e7490", "#065f46", "#7c2d12", "#9f1239", "#4c1d95"].map((c) => (
                    <button key={c} onClick={() => { setSchool((p) => ({ ...p, brandColor: c })); toast("Brand colour applied", "info"); }} className={`w-10 h-10 rounded-lg border-4 transition-transform cursor-pointer hover:scale-110 ${school.brandColor === c ? "border-ink-900 dark:border-white scale-110" : "border-transparent"}`} style={{ background: c }} aria-label={`Colour ${c}`} />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
                <div className="px-5 py-4 text-white flex items-center gap-3" style={{ background: school.brandColor }}>
                  <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold">{school.logoText[0]}</span>
                  <div><div className="font-display font-bold text-[15px]">{school.name}</div><div className="text-[10px] uppercase tracking-[0.16em] opacity-75">{school.motto}</div></div>
                </div>
                <div className="px-5 py-3 text-[12px] text-ink-400 font-semibold">Report cards, receipts, ID cards and certificates all use this header.</div>
              </div>
              <button className="btn-p w-full" onClick={saveSchool}><Ic n="check" size={15} />Save branding</button>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">White-label</h3>
            <p className="text-[13.5px] text-ink-500 dark:text-ink-300 leading-relaxed">Every document generated by VITECH carries <b>your</b> school's name, logo, colours and motto — never ours. The platform name itself can be changed by the Super Admin for full white-labelling.</p>
            <div className="mt-4 space-y-2">
              {["Report card header & stamp", "Receipt header & footer", "ID card design", "Certificate border & seal", "Login screen greeting", "Email & SMS signatures"].map((x) => (
                <div key={x} className="flex items-center gap-2.5 text-[13px] font-semibold"><Ic n="check" size={15} sw={2.6} className="text-emerald-500" />{x}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "campus" && (
        <div className="panel p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-display font-bold text-[16px]">VITECH Education Group</h3><p className="text-[12.5px] text-ink-400">Multi-establishment management — each campus keeps its own data.</p></div>
            <Chip tone="gold">Enterprise feature</Chip>
          </div>
          <div className="space-y-2.5">
            {db.campuses.map((c) => (
              <div key={c.id} className="flex items-center gap-3.5 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                <span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center"><Ic n="building" size={16} /></span>
                <div><b className="block text-[13.5px]">{c.name}</b><span className="text-[11.5px] text-ink-400">{c.city}</span></div>
                <Chip tone={c.active ? "green" : "gray"} className="ml-auto">{c.active ? "Active" : "Inactive"}</Chip>
                <button className="btn-g btn-sm" onClick={() => { mutate((db) => { const x = db.campuses.find((y) => y.id === c.id)!; x.active = !x.active; }); toast(`${c.name} ${c.active ? "deactivated" : "activated"}`, "info"); }}>{c.active ? "Deactivate" : "Activate"}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Demo data</h3>
            <p className="text-[13.5px] text-ink-500 dark:text-ink-300 leading-relaxed">Restore the original demonstration dataset — 240 students, 18 teachers, a full year of payments, attendance and grades.</p>
            <button className="btn-d mt-4" onClick={() => setReset(true)}><Ic n="refresh" size={15} />Reset demo data</button>
          </div>
          <div className="panel p-6">
            <h3 className="font-display font-bold text-[16px] mb-4">Security posture</h3>
            <div className="space-y-2">
              {[["Password hashing", "bcrypt · cost 12"], ["Two-factor authentication", "Enabled for admin roles"], ["Session management", "HttpOnly · 12h expiry"], ["Rate limiting", "5 attempts / 30s lockout"], ["RBAC", "12 roles · 30+ permissions"], ["Audit trail", "Every mutation logged"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 text-[13px]"><span className="font-semibold flex items-center gap-2"><Ic n="shield" size={14} className="text-emerald-500" />{k}</span><b className="text-ink-400">{v}</b></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ---- Currency picker & conversion ---- */}
      <Modal open={curPick} onClose={() => { setCurPick(false); setCurTarget(null); }}
        title={curTarget ? `Switch currency to ${curTarget}` : "Select currency"} w={curTarget ? "max-w-md" : "max-w-xl"}
        footer={curTarget ? (
          <>
            <button className="btn-o" onClick={() => setCurTarget(null)}><Ic n="chevL" size={14} />Back</button>
            <button className="btn-p" onClick={() => {
              const from = savedCur;
              const res = changeCurrency(curTarget);
              audit("CHANGE_CURRENCY", "Finance", `${from} → ${curTarget} · ${res.converted} monetary records converted at ${fxRateLabel(from, curTarget)}`);
              setSchool((p) => ({ ...p, currency: curTarget }));
              toast(`${res.converted.toLocaleString()} amounts converted ${from} → ${curTarget}`);
              setCurPick(false); setCurTarget(null);
            }}><Ic n="refresh" size={15} />Convert {recCount.toLocaleString()} records</button>
          </>
        ) : undefined}>
        {!curTarget ? (
          <div>
            <div className="relative mb-3">
              <Ic n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input autoFocus className="input !pl-9" placeholder="Search 18 currencies — code, name or symbol…" value={curSearch} onChange={(e) => setCurSearch(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[46vh] overflow-y-auto pr-1">
              {CURRENCIES.filter((c) => `${c.code} ${c.name} ${c.symbol}`.toLowerCase().includes(curSearch.toLowerCase())).map((c) => {
                const current = c.code === savedCur;
                return (
                  <button key={c.code} onClick={() => (current ? setCurPick(false) : setCurTarget(c.code))}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all cursor-pointer hover:-translate-y-0.5 ${current ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-500/10" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300 dark:hover:border-cobalt-700 hover:shadow-panel"}`}>
                    <span className="text-[19px] leading-none">{c.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><b className="font-display text-[14.5px]">{c.code}</b><span className="text-[12px] text-ink-400 truncate">{c.name}</span></span>
                      <span className="block text-[10.5px] font-bold text-ink-300 tnum mt-0.5">{c.code === "USD" ? "Base currency" : fxRateLabel("USD", c.code)}</span>
                    </span>
                    <span className="w-9 h-9 rounded-lg bg-ink-50 dark:bg-ink-800 flex items-center justify-center font-display font-bold text-[11px] text-ink-600 dark:text-ink-200 shrink-0">{c.symbol.trim().slice(0, 4)}</span>
                    {current && <Chip tone="green" className="shrink-0"><Ic n="check" size={11} />Active</Chip>}
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-ink-400 font-semibold mt-3 flex items-center gap-1.5"><Ic n="info" size={13} />Rates update against the US Dollar. Switching converts every amount in the system automatically.</p>
          </div>
        ) : (
          <div>
            <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-5 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="font-display font-bold text-[22px]">{CURRENCY_MAP[savedCur]?.flag} {savedCur}</span>
                <span className="w-10 h-10 rounded-full bg-cobalt-600 text-white flex items-center justify-center"><Ic n="chevR" size={18} /></span>
                <span className="font-display font-bold text-[22px]">{CURRENCY_MAP[curTarget]?.flag} {curTarget}</span>
              </div>
              <div className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 mx-auto mt-3 !py-1.5 font-mono">{fxRateLabel(savedCur, curTarget)}</div>
            </div>
            <div className="space-y-2 mt-4 text-[13px]">
              {[
                ["Senior 4 tuition", feeTotal(db, 4)],
                ["Sample payment", db.payments[0]?.amount ?? 0],
                ["Average teacher salary", Math.round(db.teachers.reduce((a, b) => a + b.salary, 0) / Math.max(1, db.teachers.length))],
              ].map(([label, v]) => (
                <div key={label as string} className="flex items-center justify-between rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5">
                  <span className="font-semibold text-ink-500 dark:text-ink-300">{label}</span>
                  <span className="font-bold tnum"><span className="text-ink-400 line-through decoration-rose-400/70 mr-2">{fmtMoney(v as number, savedCur)}</span>{fmtMoneyConv(v as number, savedCur, curTarget)}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-ink-400 leading-relaxed mt-3.5 flex gap-2"><Ic n="shield" size={14} className="text-emerald-500 shrink-0 mt-0.5" />All {recCount.toLocaleString()} fee items, payments, expenses, salaries and transport fees will be converted. The change is recorded in the audit log.</p>
          </div>
        )}
      </Modal>

      <Confirm open={reset} onClose={() => setReset(false)} title="Reset all demo data?" body="All changes you made (students, payments, settings) will be replaced with the original demonstration dataset." yes="Reset everything"
        onYes={() => { resetDemo(); toast("Demo data restored"); }} />
    </div>
  );
}
