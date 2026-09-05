import { useState } from "react";
import { useApp, setSession, setPrefs, mutate, audit, uid, todayISO, daysAgo, COUNTRIES, CURRENCY_MAP, campusesFor, type User, type Role } from "../lib/data";
import { Ic } from "../components/icons";
import { toast, Field, Chip } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";

function Brand({ nav }: { nav: (to: string) => void }) {
  return (
    <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0">
      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
      <span className="font-display font-bold text-[14.5px] sm:text-[16px] whitespace-nowrap hidden min-[380px]:block">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
    </button>
  );
}

function Shell({ nav, title, sub, children }: { nav: (to: string) => void; title: string; sub: string; children: React.ReactNode }) {
  const tt = useT();
  const s = useApp();
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Brand nav={nav} />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <label className="flex items-center gap-1.5 h-8 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-2 pr-1.5 cursor-pointer hover:border-cobalt-400 transition-colors" title={LANGS.find((l) => l.code === s.prefs.lang)?.native}>
            <Ic n="globe" size={13} className="text-cobalt-600 dark:text-cobalt-400 shrink-0" />
            <select className="bg-transparent border-0 outline-none text-[11px] font-bold text-ink-700 dark:text-ink-100 cursor-pointer" value={s.prefs.lang} onChange={(e) => { const lang = e.target.value as typeof s.prefs.lang; document.documentElement.lang = lang; setPrefs({ lang }); }} aria-label={tt("Language")}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}
            </select>
          </label>
          <button className="btn-o btn-sm hidden sm:inline-flex" onClick={() => nav("/")}><Ic n="chevL" size={14} />{tt("Back")}</button>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[26px] sm:text-[28px] font-bold tracking-tight">{tt(title)}</h1>
          <p className="text-[14px] text-ink-400 mt-1 mb-6">{tt(sub)}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

const DEMO_CODE = "123456";

export function Login({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const s = useApp();
  const tt = useT();
  const [email, setEmail] = useState("admin@vitech.academy");
  const [pass, setPass] = useState("demo1234");
  const [step, setStep] = useState<"creds" | "2fa">("creds");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<User | null>(null);
  const [err, setErr] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (em?: string, pw?: string) => {
    if (locked && !em) return;
    const e = em ?? email; const p = pw ?? pass;
    const u = s.db.users.find((x) => x.email.toLowerCase() === e.trim().toLowerCase());
    if (!u || u.pass !== p) {
      const n = attempts + 1;
      setAttempts(n);
      if (n >= 5) {
        setLocked(true);
        audit("ACCOUNT_LOCKED", "Auth", `Account locked after 5 attempts (${e})`);
        setTimeout(() => { setLocked(false); setAttempts(0); }, 30000);
      }
      setErr(n >= 5 ? "" : `Invalid credentials — attempt ${n} of 5`);
      return;
    }
    if (u.twoFA) { setPending(u); setStep("2fa"); setCode(""); setErr(""); return; }
    setBusy(true);
    setTimeout(() => {
      audit("LOGIN", "Auth", `${u.name} signed in (${u.role})`);
      setSession({ userId: u.id });
      toast(`${tt("Welcome back")}, ${u.name.split(" ")[0]}`);
      onDone();
    }, 500);
  };
  const verify2FA = () => {
    if (code === DEMO_CODE && pending) {
      audit("LOGIN_2FA", "Auth", `${pending.name} verified 2FA`);
      setSession({ userId: pending.id });
      toast(`${tt("Welcome back")}, ${pending.name.split(" ")[0]}`);
      onDone();
    } else setErr("Invalid code — demo code is 123456");
  };
  const demoRoles: { role: Role; label: string; icon: string }[] = [
    { role: "admin", label: "Administrator", icon: "shield" },
    { role: "principal", label: "Principal", icon: "award" },
    { role: "accountant", label: "Accountant", icon: "coins" },
    { role: "teacher", label: "Teacher", icon: "teacher" },
    { role: "student", label: "Student", icon: "students" },
    { role: "parent", label: "Parent", icon: "comm" },
  ];
  return (
    <Shell nav={nav} title="Sign in" sub="Secure access with role-based permissions.">
      {step === "creds" ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
            <Field label={tt("Email address")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required /></Field>
            <Field label={tt("Password")}>
              <div className="relative">
                <input className="input !pr-10" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="demo1234" required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300"><Ic n="shield" size={15} /></span>
              </div>
            </Field>
            {err && <p className="text-[12.5px] font-bold text-rose-600">{err}</p>}
            {locked && <p className="text-[12.5px] font-bold text-amber-600 flex items-center gap-1.5"><Ic n="clock" size={14} />{tt("Account locked — try again in 30 seconds.")}</p>}
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-cobalt-600 w-4 h-4" />{tt("Remember me")}</label>
              <button type="button" className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/forgot")}>{tt("Forgot password?")}</button>
            </div>
            <button className="btn-p w-full" disabled={busy || locked} type="submit">{busy ? tt("Verifying…") : tt("Sign in")}<Ic n="arrowUR" size={15} /></button>
          </form>
          <div className="mt-6">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3 flex items-center gap-2"><Ic n="zap" size={13} className="text-gold-500" />{tt("Demo accounts — password")} <code className="kbd">demo1234</code></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoRoles.map((d) => {
                const u = s.db.users.find((x) => x.role === d.role);
                if (!u) return null;
                return (
                  <button key={u.id} onClick={() => { setEmail(u.email); setPass("demo1234"); setStep("creds"); setErr(""); submit(u.email, "demo1234"); }}
                    className="text-left rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2.5 hover:border-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 active:scale-[0.97] transition-all cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-bold"><Ic n={d.icon} size={13} className="text-cobalt-600 dark:text-cobalt-300" />{d.label}</span>
                    <span className="block text-[10.5px] text-ink-400 truncate mt-0.5">{u.email}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-ink-400 mt-3 text-center">{tt("Don't have an account?")} <button className="font-bold text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/register")}>{tt("Create one")}</button></p>
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verify2FA(); }} className="space-y-4 panel p-6">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n="shield" size={20} /></span>
            <div><h2 className="font-display font-bold text-[17px]">{tt("Two-factor authentication")}</h2><p className="text-[12.5px] text-ink-400">{tt("Enter the 6-digit code from your authenticator app.")}</p></div>
          </div>
          <Field label={tt("6-digit code")}><input className="input text-center font-display text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></Field>
          <p className="text-[12px] text-ink-400 font-semibold">Demo code: <code className="kbd">123456</code></p>
          {err && <p className="text-[12.5px] font-bold text-rose-600">{err}</p>}
          <button className="btn-p w-full" type="submit">{tt("Verify & continue")}</button>
          <button type="button" className="btn-g w-full" onClick={() => setStep("creds")}><Ic n="chevL" size={15} />{tt("Back")}</button>
        </form>
      )}
    </Shell>
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
  const [phone, setPhone] = useState(COUNTRIES.Rwanda.phone);
  const [year, setYear] = useState("2026–2027");
  const [terms, setTerms] = useState("Term 1, Term 2, Term 3");
  const [levels, setLevels] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const c = COUNTRIES[country];
  const steps = ["School information", "Academic year", "Levels", "Finish"];
  const create = () => {
    mutate((db) => {
      db.school.name = name || "My New Academy"; db.school.short = (name || "My New Academy").split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
      db.school.country = country; db.school.currency = currency; db.school.phone = phone;
      db.school.academicYear = year; db.school.terms = terms.split(",").map((x) => x.trim()).filter(Boolean); db.school.term = db.school.terms[0];
      db.school.onboarded = false; db.school.fxUpdatedAt = todayISO();
      db.campuses = campusesFor(country);
      db.classes = db.classes.filter((cl) => levels.includes(cl.level));
      const uid_ = uid();
      db.users.push({ id: uid_, name: adminName || "School Admin", email: adminEmail || "admin@myschool.edu", pass: pass || "demo1234", role: "admin", twoFA: false, hue: 215 });
    });
    audit("CREATE_SCHOOL", "Onboarding", `${name || "My New Academy"} created (${country}, ${currency})`);
    const u = { email: adminEmail || "admin@myschool.edu" };
    const full = useAppSnapshot();
    const created = full.db.users.find((x) => x.email === u.email);
    if (created) setSession({ userId: created.id });
    toast("Welcome aboard — finish setup in the wizard");
    onDone();
  };
  return (
    <Shell nav={nav} title="Create your school" sub={steps[step]}>
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((st, i) => (
          <div key={st} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "bg-cobalt-600" : "bg-ink-200 dark:bg-ink-800"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block mt-1 ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{tt(st)}</span>
          </div>
        ))}
      </div>
      {step === 0 && (
        <div className="space-y-4">
          <Field label={tt("School name")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hilltop International Academy" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={tt("Admin full name")}><input className="input" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Jane Doe" /></Field>
            <Field label={tt("Admin email")}><input className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" /></Field>
          </div>
          <Field label={tt("Password")}><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 8 characters" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={tt("Country")}>
              <select className="input" value={country} onChange={(e) => { const cc = e.target.value; setCountry(cc); const inf = COUNTRIES[cc]; if (inf) { setPhone(inf.phone); setCurrency(inf.currency); toast(`${inf.currency} · ${inf.tz} auto-configured`, "info"); } }}>
                {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label={tt("Phone")}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          </div>
          <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300"><Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-300" />{tt("Auto-detected:")}</span>
            <Chip tone="blue">{CURRENCY_MAP[currency]?.flag} {currency} — {CURRENCY_MAP[currency]?.symbol}</Chip>
            <Chip tone="gold" className="font-mono !text-[10.5px]">1 USD = {(CURRENCY_MAP[currency]?.rate ?? 1) >= 100 ? Math.round(CURRENCY_MAP[currency]?.rate ?? 1).toLocaleString() : (CURRENCY_MAP[currency]?.rate ?? 1)} {currency}</Chip>
            <Chip tone="gray">{c?.tz}</Chip>
            <select className="input !h-8 !w-auto !text-[12px] ml-auto" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Override currency">
              {Object.keys(CURRENCY_MAP).map((cur) => <option key={cur} value={cur}>{CURRENCY_MAP[cur].flag} {cur} · {CURRENCY_MAP[cur].name}</option>)}
            </select>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <Field label={tt("Academic year")}><input className="input" value={year} onChange={(e) => setYear(e.target.value)} /></Field>
          <Field label={`${tt("Academic year")} — terms`}><textarea className="input" rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} /></Field>
        </div>
      )}
      {step === 2 && (
        <div>
          <span className="label">{tt("Select the levels your school offers.")}</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <button key={l} onClick={() => setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]))}
                className={`h-14 rounded-xl border-2 font-display font-bold text-[15px] transition-all cursor-pointer active:scale-95 ${levels.includes(l) ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300" : "border-ink-100 dark:border-ink-800 text-ink-400"}`}>S{l}</button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          {[["School", name || "My New Academy"], ["Admin", adminName || "School Admin"], ["Country", `${country} · ${currency}`], ["Academic year", year], ["Levels", levels.map((l) => `S${l}`).join(" · ")], ["Plan", "Professional — 14-day trial"]].map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3 text-[13px]">
              <span className="font-bold text-ink-400 uppercase tracking-wide text-[10.5px] self-center">{k}</span><b>{v}</b>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-7">
        <button className="btn-o" onClick={() => (step === 0 ? nav("/") : setStep(step - 1))}><Ic n="chevL" size={15} />{tt("Back")}</button>
        {step < 3 ? <button className="btn-p" onClick={() => setStep(step + 1)}>{tt("Continue")}<Ic n="chevR" size={15} /></button>
          : <button className="btn-p" onClick={create}><Ic n="zap" size={15} />{tt("Launch my school")}</button>}
      </div>
    </Shell>
  );
}

function useAppSnapshot() { return useApp(); }

export function Forgot({ nav, reset }: { nav: (to: string) => void; reset?: boolean }) {
  const tt = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [p1, setP1] = useState(""); const [p2, setP2] = useState("");
  if (reset) {
    return (
      <Shell nav={nav} title="Reset your password" sub="Enter your new password below.">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (p1.length < 8) { toast("Password must be at least 8 characters", "err"); return; } if (p1 !== p2) { toast("Passwords do not match", "err"); return; } audit("RESET_PASSWORD", "Auth", "Password updated"); toast("Password updated — sign in"); nav("/login"); }}>
          <Field label={tt("New password")}><input className="input" type="password" required value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
          <Field label={tt("Confirm password")}><input className="input" type="password" required value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
          <div className="text-[12px] font-semibold text-ink-400 flex items-center gap-2"><Ic n="shield" size={14} className="text-emerald-500" />{tt("Passwords are hashed with bcrypt — never stored in plain text.")}</div>
          <button className="btn-p w-full" type="submit">{tt("Update password")}</button>
        </form>
      </Shell>
    );
  }
  return (
    <Shell nav={nav} title="Reset password" sub="We'll email you a secure reset link.">
      {sent ? (
        <div className="panel p-6 text-center">
          <span className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto"><Ic n="check" size={26} sw={2.4} /></span>
          <h3 className="font-display font-bold text-[19px] mt-4">{tt("Check your inbox")}</h3>
          <p className="text-[13.5px] text-ink-400 mt-1.5">If <b>{email}</b> exists, a reset link is on its way. It expires in 30 minutes.</p>
          <button className="btn-p mt-5" onClick={() => nav("/reset")}>{tt("Open reset link (demo)")}</button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); audit("REQUEST_RESET", "Auth", `Reset link requested for ${email}`); setSent(true); }}>
          <Field label={tt("Email address")}><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></Field>
          <button className="btn-p w-full" type="submit"><Ic n="send" size={15} />{tt("Send reset link")}</button>
          <button type="button" className="btn-g w-full" onClick={() => nav("/login")}><Ic n="chevL" size={15} />{tt("Back to login")}</button>
        </form>
      )}
      <span className="hidden">{daysAgo(0)}</span>
    </Shell>
  );
}
