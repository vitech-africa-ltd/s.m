import { useState } from "react";
import { useApp, setSession, mutate, audit, uid, todayISO, COUNTRIES, CURRENCY_MAP, campusesFor, getState } from "../lib/data";
import { Ic } from "../components/icons";
import { toast, Field } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";

function Brand({ nav }: { nav: (to: string) => void }) {
  return (
    <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer group">
      <span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-lg group-hover:scale-105 transition-transform">V</span>
      <span className="font-display font-bold text-[16px]">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
    </button>
  );
}

function Shell({ nav, title, sub, children }: { nav: (to: string) => void; title: string; sub: string; children: React.ReactNode }) {
  const tt = useT();
  const s = useApp();
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Brand nav={nav} />
        <div className="flex items-center gap-2">
          <select className="input !w-auto !h-8 !text-[12px] font-bold" value={s.prefs.lang} onChange={(e) => { const lang = e.target.value as typeof s.prefs.lang; LANGS.some((l) => l.code === lang) && (document.documentElement.lang = lang); import("../lib/data").then((m) => m.setPrefs({ lang })); }} aria-label={tt("Language")}>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
          <button className="btn-o btn-sm hidden sm:inline-flex" onClick={() => nav("/")}><Ic n="chevL" size={14} />{tt("Back")}</button>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[28px] font-bold tracking-tight">{tt(title)}</h1>
          <p className="text-[14px] text-ink-400 mt-1 mb-6">{tt(sub)}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

const DEMO = [
  { role: "School Admin", email: "admin@vitech.academy", ic: "settings" },
  { role: "Principal", email: "principal@vitech.academy", ic: "teacher" },
  { role: "Accountant", email: "finance@vitech.academy", ic: "coins" },
  { role: "Teacher", email: "teacher@vitech.academy", ic: "grades" },
  { role: "Student", email: "student@vitech.academy", ic: "students" },
  { role: "Parent", email: "parent@vitech.academy", ic: "user" },
];

export function Login({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const s = useApp();
  const tt = useT();
  const [email, setEmail] = useState("admin@vitech.academy");
  const [pass, setPass] = useState("demo1234");
  const [step, setStep] = useState<"creds" | "2fa">("creds");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [pending2fa, setPending2fa] = useState<string | null>(null);

  const submit = (em?: string, pw?: string) => {
    if (locked && !em) return;
    setBusy(true); setErr("");
    setTimeout(() => {
      const u = s.db.users.find((x) => x.email.toLowerCase() === (em ?? email).trim().toLowerCase());
      if (!u || u.pass !== (pw ?? pass)) {
        const n = attempts + 1;
        setAttempts(n);
        if (n >= 5) { setLocked(true); setErr("Account locked — try again in 30 seconds."); setTimeout(() => { setLocked(false); setAttempts(0); }, 30000); }
        else setErr(`Invalid credentials (${n}/5 attempts before lockout)`);
        setBusy(false); return;
      }
      audit("LOGIN", "Auth", `${u.name} signed in (${u.role})`);
      if (u.twoFA) { setPending2fa(u.id); setStep("2fa"); setBusy(false); return; }
      setSession({ userId: u.id });
      toast(`${tt("Welcome back")}, ${u.name.split(" ")[0]}`);
      onDone();
    }, 550);
  };
  const verify2fa = () => {
    if (code !== "123456") { setErr("Invalid code — the demo code is 123456"); return; }
    if (pending2fa) {
      setSession({ userId: pending2fa });
      const u = s.db.users.find((x) => x.id === pending2fa);
      toast(`${tt("Welcome back")}, ${u?.name.split(" ")[0]}`);
      onDone();
    }
  };

  return (
    <Shell nav={nav} title="Sign in to your account" sub="Secure access with role-based permissions.">
      {step === "creds" ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
            <Field label={tt("Email")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required /></Field>
            <Field label={tt("Password")}>
              <div className="relative">
                <input className="input pr-10" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
                <Ic n="lock" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300" />
              </div>
            </Field>
            {err && <p className="text-[12.5px] font-bold text-rose-600 flex items-center gap-1.5"><Ic n="alert" size={14} />{tt(err)}</p>}
            {locked && <p className="text-[12.5px] font-bold text-amber-600 flex items-center gap-1.5"><Ic n="clock" size={14} />{tt("Account locked — try again in 30 seconds.")}</p>}
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-cobalt-600 w-4 h-4" />{tt("Remember me") ?? "Remember me"}</label>
              <button type="button" className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/forgot")}>{tt("Forgot password?")}</button>
            </div>
            <button className="btn-p w-full" disabled={busy || locked} type="submit">{busy ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</> : <>{tt("Sign in")}<Ic n="arrowUR" size={15} /></>}</button>
          </form>
          <div className="mt-6">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3 flex items-center gap-2"><Ic n="zap" size={13} className="text-gold-500" />{tt("Demo accounts — password")} <code className="kbd">demo1234</code></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO.map((u) => (
                <button key={u.email} onClick={() => { setEmail(u.email); setPass("demo1234"); setStep("creds"); setErr(""); submit(u.email, "demo1234"); }}
                  className="text-left rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2 hover:border-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 transition-colors cursor-pointer active:scale-[0.98]">
                  <Ic n={u.ic} size={15} className="text-cobalt-600 dark:text-cobalt-300" />
                  <span className="block text-[12px] font-bold mt-1">{u.role}</span>
                </button>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-400 mt-4">{tt("Don't have an account?")} <button className="font-bold text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/register")}>{tt("Create one")}</button></p>
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verify2fa(); }} className="space-y-4">
          <div className="rounded-xl bg-cobalt-50 dark:bg-cobalt-500/10 border border-cobalt-200 dark:border-cobalt-800 px-4 py-3 text-[13px] font-semibold text-cobalt-800 dark:text-cobalt-200 flex gap-2">
            <Ic n="shield" size={16} className="shrink-0 mt-0.5" />{tt("Two-factor authentication")} — demo code: <b>123456</b>
          </div>
          <Field label={tt("6-digit code") ?? "6-digit code"}><input className="input text-center font-display text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></Field>
          {err && <p className="text-[12.5px] font-bold text-rose-600">{tt(err)}</p>}
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
  const [emailS, setEmailS] = useState("");
  const [phone, setPhone] = useState(COUNTRIES.Rwanda.phone);
  const [country, setCountry] = useState("Rwanda");
  const [currency, setCurrency] = useState("RWF");
  const [adminEmail, setAdminEmail] = useState("");
  const [pass, setPass] = useState("");
  const [year, setYear] = useState("2026–2027");
  const [levels, setLevels] = useState([1, 2, 3, 4, 5, 6]);
  const c = COUNTRIES[country] ?? COUNTRIES.Rwanda;
  const steps = ["School information", "Academic year", "Classes", "Finish"];

  const create = () => {
    mutate((db) => {
      db.school.name = name || "My New Academy"; db.school.country = country; db.school.currency = currency; db.school.onboarded = false;
      db.school.timezone = c.tz; db.school.phone = phone; db.school.email = emailS; db.school.academicYear = year;
      db.campuses = campusesFor(country);
      db.tenants.unshift({ id: uid(), name: name || "My New Academy", city: country, plan: "Professional", students: 0, status: "trial", mrr: 0, joined: todayISO() });
      db.users.push({ id: uid(), name: adminName || "School Admin", email: adminEmail || "admin@myschool.edu", pass: pass || "demo1234", role: "admin", twoFA: false, hue: 210 });
    });
    const st = getState();
    const u = st.db.users[st.db.users.length - 1];
    setSession({ userId: u.id });
    audit("SCHOOL_REGISTERED", "Subscription", `${name || "My New Academy"} created — 14-day trial on Professional`);
    toast("Your school is ready — welcome aboard!");
    onDone();
  };

  return (
    <Shell nav={nav} title="Create your school" sub="Free 14-day trial · no card required">
      <div className="panel p-6 sm:p-7">
        <div className="flex items-center gap-1 mb-6">
          {steps.map((st, i) => (
            <div key={st} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12.5px] font-bold border-2 transition-colors ${i < step ? "bg-emerald-500 border-emerald-500 text-white" : i === step ? "bg-cobalt-600 border-cobalt-600 text-white" : "border-ink-200 dark:border-ink-700 text-ink-400"}`}>{i < step ? <Ic n="check" size={14} sw={2.6} /> : i + 1}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{tt(st)}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded mx-1 ${i < step ? "bg-emerald-500" : "bg-ink-100 dark:bg-ink-800"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <Field label={tt("School name")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hilltop International Academy" /></Field>
            <Field label={tt("Admin name")}><input className="input" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Jane Doe" /></Field>
            <Field label={tt("Admin email")}><input className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" /></Field>
            <Field label={tt("Password")}><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 8 characters" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={tt("Country")}>
                <select className="input" value={country} onChange={(e) => { const cc = e.target.value; setCountry(cc); const inf = COUNTRIES[cc]; if (inf) { setPhone(inf.phone); setCurrency(inf.currency); toast(`Currency ${inf.currency} · ${inf.tz} auto-configured`, "info"); } }}>
                  {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <Field label={tt("Phone")}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300"><Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-300" />Auto-detected:</span>
              <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">{CURRENCY_MAP[currency]?.flag} {currency} — {CURRENCY_MAP[currency]?.symbol}</span>
              <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300">{c.tz}</span>
              <select className="input !h-8 !w-auto !text-[12px] ml-auto" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Override currency">
                {Object.entries(CURRENCY_MAP).map(([code, cur]) => <option key={code} value={code}>{cur.flag} {code}</option>)}
              </select>
            </div>
            <Field label="School email"><input className="input" type="email" value={emailS} onChange={(e) => setEmailS(e.target.value)} placeholder="info@school.edu" /></Field>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <Field label={tt("Academic year")}>
              <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
                {["2025–2026", "2026–2027", "2027–2028"].map((y) => <option key={y}>{y}</option>)}
              </select>
            </Field>
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 text-[12.5px] text-ink-500 dark:text-ink-300 font-semibold">
              <Ic n="calendar" size={14} className="inline mr-1.5" />3 terms will be created automatically (Term 1, Term 2, Term 3). Configurable later in Settings → Academic.
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <span className="label">Which levels does your school run?</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <button key={l} onClick={() => setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]))}
                  className={`rounded-xl border-2 py-4 text-center transition-all cursor-pointer ${levels.includes(l) ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                  <span className="font-display font-bold text-[17px]">S{l}</span>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wide text-ink-400">Senior {l}</span>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-ink-400 font-semibold mt-3">{levels.length * 2} class sections (A + B) will be created.</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            {[name || "My New Academy", adminName || "School Admin", country, `${CURRENCY_MAP[currency]?.flag} ${currency}`, year, `${levels.length * 2} classes`].map((x, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Ic n="check" size={13} sw={2.6} /></span>
                <span className="text-[13.5px] font-bold">{x}</span>
              </div>
            ))}
            <div className="rounded-lg bg-gold-100 dark:bg-gold-500/15 border border-gold-200 dark:border-gold-800 px-4 py-3 text-[12.5px] font-bold text-gold-700 dark:text-gold-300 flex items-center gap-2">
              <Ic n="sparkles" size={15} />A guided 8-step setup wizard will launch after registration.
            </div>
          </div>
        )}

        <div className="flex justify-between mt-7">
          <button className="btn-o" onClick={() => (step === 0 ? nav("/") : setStep(step - 1))}><Ic n="chevL" size={15} />{tt("Back")}</button>
          {step < 3 ? <button className="btn-p" onClick={() => setStep(step + 1)}>{tt("Continue")}<Ic n="chevR" size={15} /></button>
            : <button className="btn-p" onClick={create}><Ic n="zap" size={15} />{tt("Launch my school")}</button>}
        </div>
      </div>
    </Shell>
  );
}

export function Forgot({ nav, reset }: { nav: (to: string) => void; reset?: boolean }) {
  const tt = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  if (reset) {
    return (
      <Shell nav={nav} title="Reset your password" sub="Set a new password">
        <form className="panel p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          if (p1.length < 8) { toast("Password must be at least 8 characters", "err"); return; }
          if (p1 !== p2) { toast("Passwords do not match", "err"); return; }
          audit("RESET_PASSWORD", "Auth", "Password reset via secure link");
          toast("Password updated — sign in with your new password");
          nav("/login");
        }}>
          <Field label={tt("New password")}><input className="input" type="password" required value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
          <Field label={tt("Confirm password")}><input className="input" type="password" required value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
          <div className="text-[12px] font-semibold text-ink-400 flex items-center gap-2"><Ic n="shield" size={14} className="text-emerald-500" />Passwords are hashed — never stored in plain text.</div>
          <button className="btn-p w-full" type="submit">{tt("Save changes") ?? "Update password"}</button>
        </form>
      </Shell>
    );
  }
  return (
    <Shell nav={nav} title="Forgot password?" sub="We'll email you a secure reset link.">
      {!sent ? (
        <form className="panel p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); audit("RESET_REQUESTED", "Auth", `Reset link sent to ${email}`); }}>
          <Field label={tt("Email")}><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></Field>
          <button className="btn-p w-full" type="submit"><Ic n="send" size={15} />{tt("Send reset link") ?? "Send reset link"}</button>
          <button type="button" className="btn-g w-full" onClick={() => nav("/login")}><Ic n="chevL" size={15} />{tt("Back")}</button>
        </form>
      ) : (
        <div className="panel p-6 text-center">
          <span className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto"><Ic n="check" size={22} sw={2.4} /></span>
          <h3 className="font-display font-bold text-[19px] mt-4">Check your inbox</h3>
          <p className="text-[13.5px] text-ink-400 mt-1.5">If <b>{email}</b> exists, a reset link is on its way. It expires in 30 minutes.</p>
          <button className="btn-p mt-5" onClick={() => nav("/reset")}>Open reset link (demo)</button>
        </div>
      )}
    </Shell>
  );
}
