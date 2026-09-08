import { useState } from "react";
import { useApp, setSession, setPrefs, mutate, audit, uid, todayISO, COUNTRIES, CURRENCY_MAP, campusesFor, fxRateLabel, getState } from "../lib/data";
import { Ic } from "../components/icons";
import { toast, Field } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";
import { OAuthLoginButtons } from "../components/OAuthLoginButton";
import { AITranslationPanel } from "../components/AITranslationPanel";

export function Login({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const s = useApp();
  const tt = useT();
  const [email, setEmail] = useState("admin@vitech.academy");
  const [pass, setPass] = useState("demo1234");
  const [step, setStep] = useState<"creds" | "2fa">("creds");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const lang = s.prefs.lang;

  const submit = (em?: string, pw?: string) => {
    if (locked && !em) return;
    const u = s.db.users.find((x) => x.email.toLowerCase() === (em ?? email).trim().toLowerCase());
    if (!u || u.pass !== (pw ?? pass)) {
      setErr("Invalid credentials");
      toast("Invalid email or password", "err");
      return;
    }
    if (u.twoFA) {
      setStep("2fa");
      setErr("");
      return;
    }
    setSession({ userId: u.id });
    audit("LOGIN", "Auth", `${u.name} signed in`);
    toast(`${tt("Welcome back")}, ${u.name.split(" ")[0]}`);
    onDone();
  };

  const verify2FA = () => {
    if (code !== "123456") {
      setErr("Invalid code. Try 123456");
      toast("Invalid 2FA code", "err");
      return;
    }
    const u = s.db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return;
    setSession({ userId: u.id });
    audit("LOGIN_2FA", "Auth", `${u.name} signed in with 2FA`);
    toast(`${tt("Welcome back")}, ${u.name.split(" ")[0]}`);
    onDone();
  };

  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
          <span className="font-display font-bold text-[14.5px] sm:text-[16px] whitespace-nowrap hidden min-[380px]:block">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
        </button>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 h-9 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-2.5 pr-1.5 cursor-pointer hover:border-cobalt-400 transition-colors">
            <Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-400 shrink-0" />
            <select className="bg-transparent border-0 outline-none text-[11.5px] sm:text-[12.5px] font-bold text-ink-700 dark:text-ink-100 cursor-pointer max-w-[76px] sm:max-w-none truncate pr-0.5" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
          </label>
          <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />{tt("Back to site")}</button>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight">{tt("Sign in to your school")}</h1>
            <p className="text-[13px] sm:text-[14px] text-ink-400 mt-1">{tt("Secure access with role-based permissions.")}</p>
          </div>
          
          {/* AI Translation Panel */}
          <div className="flex justify-end">
            <AITranslationPanel 
              text="Sign in to your school" 
              targetLang={lang}
              onTranslation={(translated) => {
                // Could update UI with translated text
              }}
            />
          </div>
          
          <div className="panel p-4 sm:p-6">
            {step === "creds" ? (
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
                <Field label={tt("Email address")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required /></Field>
                <Field label={tt("Password")}>
                  <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" required />
                </Field>
                {err && <p className="text-[12.5px] font-bold text-rose-600">{err}</p>}
                {locked && <p className="text-[12.5px] font-bold text-amber-600 flex items-center gap-1.5"><Ic n="clock" size={14} />{tt("Account locked — try again in 30 seconds.")}</p>}
                <div className="flex items-center justify-between text-[13px] font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-cobalt-600 w-4 h-4" />{tt("Remember me")}</label>
                  <button type="button" className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/forgot")}>{tt("Forgot password?")}</button>
                </div>
                <button className="btn-p w-full" disabled={busy || locked} onClick={() => { setBusy(true); setTimeout(() => { submit(); setBusy(false); }, 600); }} type="submit">{busy ? tt("Verifying…") : tt("Sign in")}<Ic n="arrowUR" size={15} /></button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); verify2FA(); }} className="space-y-4">
                <div className="text-center mb-4">
                  <span className="w-14 h-14 rounded-2xl bg-cobalt-600 text-white flex items-center justify-center mx-auto"><Ic n="shield" size={24} /></span>
                  <h2 className="font-display font-bold text-[18px] mt-3">{tt("Two-factor authentication")}</h2>
                  <p className="text-[13px] text-ink-400 mt-1">{tt("Enter the 6-digit code from your authenticator app.")}</p>
                </div>
                <Field label={tt("6-digit code")}><input className="input text-center font-display text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></Field>
                {err && <p className="text-[12.5px] font-bold text-rose-600">{err}</p>}
                <button className="btn-p w-full" type="submit">{tt("Verify & continue")}</button>
                <button type="button" className="btn-g w-full" onClick={() => setStep("creds")}><Ic n="chevL" size={15} />{tt("Back")}</button>
              </form>
            )}
            
            {/* OAuth Login Buttons */}
            {step === "creds" && (
              <div className="mt-6">
                <OAuthLoginButtons 
                  onSuccess={(userData) => {
                    toast(`Logged in with ${userData.provider}`);
                    // In production, this would create or find the user and log them in
                    onDone();
                  }}
                  onError={(error) => {
                    toast(`OAuth login failed: ${error.message}`, 'err');
                  }}
                />
              </div>
            )}
          </div>
          <div className="panel p-5 mt-5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3 flex items-center gap-2"><Ic n="zap" size={13} className="text-gold-500" />{tt("Demo accounts — password")} <code className="kbd">demo1234</code></div>
            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {s.db.users.slice(0, 12).map((u) => (
                <button key={u.id} onClick={() => { setEmail(u.email); setPass("demo1234"); setStep("creds"); setErr(""); submit(u.email, "demo1234"); }}
                  className="text-left rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2 hover:border-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 transition-colors cursor-pointer active:scale-[0.98]">
                  <b className="block text-[12.5px] truncate">{u.name}</b>
                  <span className="block text-[10.5px] text-ink-400 truncate">{u.email}</span>
                  <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 !text-[9.5px] mt-1">{u.role}</span>
                </button>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-400 font-semibold mt-3">{tt("Free 14-day trial · no card required")}</p>
          </div>
          <p className="text-center text-[13px] text-ink-400 mt-5">{tt("Don't have an account?")} <button onClick={() => nav("/register")} className="text-cobalt-600 dark:text-cobalt-400 font-bold hover:underline cursor-pointer">{tt("Create one")}</button></p>
        </div>
      </main>
    </div>
  );
}

export function Register({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const tt = useT();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [pass, setPass] = useState("");
  const [country, setCountry] = useState("Rwanda");
  const [currency, setCurrency] = useState("RWF");
  const [phone, setPhone] = useState("+250 7XX XXX XXX");
  const [levels, setLevels] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const create = () => {
    if (!name.trim()) { toast("School name is required", "err"); return; }
    if (!adminName.trim()) { toast("Admin name is required", "err"); return; }
    if (!adminEmail.trim()) { toast("Admin email is required", "err"); return; }
    if (pass.length < 8) { toast("Password must be at least 8 characters", "err"); return; }
    const db = getState().db;
    mutate((db) => {
      db.school.name = name || "My New Academy";
      db.school.country = country;
      db.school.currency = currency;
      db.school.phone = phone;
      db.school.onboarded = false;
      db.campuses = campusesFor(country);
      const uid_new = uid();
      db.users.unshift({ id: uid_new, name: adminName, email: adminEmail, pass, role: "admin", twoFA: false, hue: Math.floor(Math.random() * 360) });
      db.school.academicYear = "2025–2026";
      db.school.term = "Term 1";
    });
    setSession({ userId: getState().db.users[0].id });
    audit("CREATE_SCHOOL", "Setup", `Created ${name} in ${country}`);
    toast("School created successfully");
    onDone();
  };

  const steps = ["School information", "Academic year", "Levels", "Finish"];
  const c = COUNTRIES[country];

  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
          <span className="font-display font-bold text-[14.5px] sm:text-[16px] whitespace-nowrap hidden min-[380px]:block">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
        </button>
        <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />{steps[step]}</button>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <h1 className="font-display text-[28px] font-bold tracking-tight">{tt("Create your school")}</h1>
          <p className="text-[14px] text-ink-400 mt-1 mb-6">{steps[step]}</p>
          <div className="flex items-center gap-2 mb-6">
            {steps.map((st, i) => (
              <div key={st} className="flex items-center gap-2 flex-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === step ? "bg-cobalt-600 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-400"}`}>{i < step ? "✓" : i + 1}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{st}</span>
                {i < steps.length - 1 && <span className={`flex-1 h-0.5 ${i < step ? "bg-emerald-500" : "bg-ink-100 dark:bg-ink-800"}`} />}
              </div>
            ))}
          </div>
          <div className="panel p-6">
            {step === 0 && (
              <div className="space-y-4">
                <Field label={tt("School name")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hilltop International Academy" /></Field>
                <Field label={tt("Admin full name")}><input className="input" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Jane Doe" /></Field>
                <Field label={tt("Admin email")}><input className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" /></Field>
                <Field label={tt("Password")}><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 8 characters" /></Field>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <Field label={tt("Country")}>
                  <select className="input" value={country} onChange={(e) => { const cc = e.target.value; setCountry(cc); const inf = COUNTRIES[cc]; if (inf) { setPhone(inf.phone); setCurrency(inf.currency); toast(`Currency ${inf.currency} · ${inf.tz} auto-configured`, "info"); } }}>
                    {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label={tt("Phone")}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
                <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300"><Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-300" />{tt("Auto-detected:")}</span>
                  <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">{CURRENCY_MAP[currency]?.flag} {currency} — {CURRENCY_MAP[currency]?.symbol}</span>
                  <span className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 font-mono !text-[10.5px]">{fxRateLabel("USD", currency)}</span>
                  <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300">{c?.tz}</span>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <span className="label">{tt("Which levels does your school run?")}</span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <button key={l} onClick={() => setLevels((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])}
                      className={`rounded-xl border-2 px-4 py-3 text-[14px] font-bold transition-all cursor-pointer ${levels.includes(l) ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-300" : "border-ink-100 dark:border-ink-800 text-ink-400 hover:border-cobalt-300"}`}>
                      Senior {l}
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-ink-400 font-semibold mt-3">{levels.length} {tt("levels selected")}</p>
              </div>
            )}
            {step === 3 && (
              <div className="text-center py-4">
                <span className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto"><Ic n="check" size={28} sw={3} /></span>
                <h2 className="font-display font-bold text-[20px] mt-4">{tt("Ready to launch!")}</h2>
                <p className="text-[13px] text-ink-400 mt-2 max-w-sm mx-auto">{name || "Your school"} will be created with {levels.length} levels, {campusesFor(country).length} campuses, and demo data.</p>
                <div className="grid grid-cols-2 gap-3 mt-5 text-left">
                  {[["School", name || "—"], ["Country", country], ["Currency", `${CURRENCY_MAP[currency]?.flag} ${currency}`], ["Admin", adminName || "—"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-3 py-2.5">
                      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">{k}</div>
                      <div className="text-[13px] font-bold truncate">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-7">
            <button className="btn-o" onClick={() => (step === 0 ? nav("/") : setStep(step - 1))}><Ic n="chevL" size={15} />{tt("Back")}</button>
            {step < 3 ? <button className="btn-p" onClick={() => setStep(step + 1)}>{tt("Continue")}<Ic n="chevR" size={15} /></button>
              : <button className="btn-p" onClick={create}><Ic n="zap" size={15} />{tt("Launch my school")}</button>}
          </div>
        </div>
      </main>
    </div>
  );
}

export function Forgot({ nav, reset }: { nav: (to: string) => void; reset?: boolean }) {
  const tt = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
          <span className="font-display font-bold text-[14.5px] sm:text-[16px] whitespace-nowrap hidden min-[380px]:block">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
        </button>
        <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />{tt("Back to site")}</button>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[28px] font-bold tracking-tight">{reset ? tt("Set a new password") : tt("Reset your password")}</h1>
          <p className="text-[14px] text-ink-400 mt-1 mb-6">{reset ? tt("Enter your new password below.") : tt("We'll email you a secure reset link.")}</p>
          <div className="panel p-6">
            {sent && !reset ? (
              <div className="text-center py-4">
                <span className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto"><Ic n="check" size={24} sw={3} /></span>
                <h3 className="font-display font-bold text-[19px] mt-4">{tt("Check your inbox")}</h3>
                <p className="text-[13.5px] text-ink-400 mt-1.5">If <b>{email}</b> exists, a reset link is on its way. It expires in 30 minutes.</p>
                <button className="btn-p mt-5" onClick={() => nav("/reset")}>{tt("Open reset link (demo)")}</button>
              </div>
            ) : reset ? (
              <form onSubmit={(e) => { e.preventDefault(); if (p1 !== p2) { toast("Passwords don't match", "err"); return; } if (p1.length < 8) { toast("Password must be at least 8 characters", "err"); return; } toast("Password updated"); nav("/login"); }} className="space-y-4">
                <Field label={tt("New password")}><input className="input" type="password" required value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
                <Field label={tt("Confirm password")}><input className="input" type="password" required value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
                <div className="text-[12px] font-semibold text-ink-400 flex items-center gap-2"><Ic n="shield" size={14} className="text-emerald-500" />{tt("Passwords are hashed with bcrypt — never stored in plain text.")}</div>
                <button className="btn-p w-full" type="submit">{tt("Update password")}</button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <Field label={tt("Email address")}><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></Field>
                <button className="btn-p w-full" type="submit"><Ic n="send" size={15} />{tt("Send reset link")}</button>
                <button type="button" className="btn-g w-full" onClick={() => nav("/login")}><Ic n="chevL" size={15} />{tt("Back to login")}</button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
