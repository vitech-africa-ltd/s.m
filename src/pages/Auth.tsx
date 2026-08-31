import { useState } from "react";
import { useApp, setSession, mutate, audit, uid, todayISO, COUNTRIES, CURRENCIES, CURRENCY_MAP, fxRateLabel, getState, type User, type Role } from "../lib/data";
import { Ic } from "../components/icons";
import { toast, Field } from "../components/ui";

const ROLE_LABEL: Record<Role, string> = { super: "Super Admin", admin: "School Admin", principal: "Principal", accountant: "Accountant", teacher: "Teacher", student: "Student", parent: "Parent", registrar: "Registrar", reception: "Reception", librarian: "Librarian", transport: "Transport", hr: "HR" };

function Brand({ nav }: { nav: (to: string) => void }) {
  return (
    <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer">
      <span className="w-10 h-10 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-xl">V</span>
      <span className="text-left">
        <span className="block font-display font-bold text-[17px] leading-5">VITECH School</span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Management System</span>
      </span>
    </button>
  );
}

export function Login({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const s = useApp();
  const [email, setEmail] = useState("admin@vitech.academy");
  const [pass, setPass] = useState("demo1234");
  const [step, setStep] = useState<"creds" | "2fa">("creds");
  const [code, setCode] = useState("");
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pending, setPending] = useState<User | null>(null);
  const locked = Date.now() < lockUntil;
  const [, force] = useState(0);

  const submit = () => {
    if (locked) return;
    setBusy(true); setErr("");
    setTimeout(() => {
      const u = s.db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
      if (!u || u.pass !== pass) {
        const f = fails + 1; setFails(f);
        if (f >= 5) { setLockUntil(Date.now() + 30000); setFails(0); toast("Too many attempts — account locked for 30s", "err"); audit("LOGIN_LOCKED", "Auth", `5 failed attempts for ${email}`); }
        else { setErr(`Invalid credentials. ${5 - f} attempts remaining.`); toast("Invalid email or password", "err"); }
        setBusy(false); return;
      }
      if (u.twoFA) { setPending(u); setStep("2fa"); setBusy(false); return; }
      finish(u);
    }, 650);
  };
  const finish = (u: User) => {
    mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; x.lastLogin = todayISO(); db.audits.unshift({ id: uid(), user: u.name, role: u.role, action: "LOGIN_SUCCESS", entity: "Auth", detail: `${u.email} signed in (session created)`, date: `${todayISO()} ${new Date().toTimeString().slice(0, 5)}`, ip: "197.243.44.18", device: "Chrome · Web" }); });
    setSession({ userId: u.id });
    toast(`Welcome back, ${u.name.split(" ")[0]}`);
    onDone();
  };
  const verify2fa = () => {
    if (code === "123456" && pending) { audit("2FA_VERIFIED", "Auth", `${pending.email} passed 2FA`); finish(pending); }
    else { setErr("Invalid code — use 123456 for the demo."); toast("Invalid 2FA code", "err"); }
  };

  return (
    <Shell nav={nav} title="Sign in to your school" sub="Secure access with role-based permissions.">
      <div className="panel p-6 sm:p-7 fade-in">
        {step === "creds" ? (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
            <Field label="Email address"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required /></Field>
            <Field label="Password">
              <div className="relative"><input className="input pr-10" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300"><Ic n="lock" size={16} /></span></div>
            </Field>
            {err && <p className="text-[12.5px] font-bold text-rose-600 flex items-center gap-1.5"><Ic n="alert" size={14} />{err}</p>}
            {locked && <p className="text-[12.5px] font-bold text-amber-600 flex items-center gap-1.5"><Ic n="clock" size={14} />Account locked — try again in 30 seconds.</p>}
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-cobalt-600 w-4 h-4" />Remember me</label>
              <button type="button" className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => nav("/forgot")}>Forgot password?</button>
            </div>
            <button className="btn-p w-full" disabled={busy || locked} onClick={() => force(1)} type="submit">{busy ? "Verifying…" : "Sign in"}<Ic n="arrowUR" size={15} /></button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); verify2fa(); }} className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/10 border border-cobalt-200 dark:border-cobalt-800 px-4 py-3">
              <Ic n="shield" className="text-cobalt-600 dark:text-cobalt-300" />
              <p className="text-[13px] font-semibold text-cobalt-800 dark:text-cobalt-200">Two-factor authentication required for administrators. Demo code: <b>123456</b></p>
            </div>
            <Field label="6-digit code"><input className="input text-center font-display text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></Field>
            {err && <p className="text-[12.5px] font-bold text-rose-600">{err}</p>}
            <button className="btn-p w-full" type="submit">Verify & continue</button>
            <button type="button" className="btn-g w-full" onClick={() => setStep("creds")}><Ic n="chevL" size={15} />Back</button>
          </form>
        )}
      </div>

      <div className="panel p-5 mt-4">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3 flex items-center gap-2"><Ic n="zap" size={13} className="text-gold-500" />Demo accounts — password <code className="kbd">demo1234</code></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {s.db.users.slice(0, 9).map((u) => (
            <button key={u.id} onClick={() => { setEmail(u.email); setPass("demo1234"); setStep("creds"); setErr(""); }}
              className="text-left rounded-lg border border-ink-100 dark:border-ink-800 px-3 py-2 hover:border-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 transition-colors cursor-pointer">
              <span className="block text-[12.5px] font-bold truncate">{ROLE_LABEL[u.role]}</span>
              <span className="block text-[11px] text-ink-400 truncate">{u.email}</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function Register({ nav, onDone }: { nav: (to: string) => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Rwanda");
  const [currency, setCurrency] = useState("RWF");
  const [phone, setPhone] = useState("+250 788 000 000");
  const [emailS, setEmailS] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [pass, setPass] = useState("");
  const [year, setYear] = useState("2026–2027");
  const [levels, setLevels] = useState([1, 2, 3, 4, 5, 6]);
  const c = COUNTRIES[country] ?? COUNTRIES.Rwanda;
  const steps = ["School information", "Academic year", "Classes", "Finish"];

  const create = () => {
    mutate((db) => {
      db.school.name = name || "My New Academy"; db.school.country = country; db.school.currency = currency;
      db.school.timezone = c.tz; db.school.phone = phone; db.school.email = emailS; db.school.academicYear = year;
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
                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>{st}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded mb-4 ${i < step ? "bg-emerald-500" : "bg-ink-100 dark:bg-ink-800"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 fade-in">
            <Field label="School name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hilltop International Academy" /></Field>
            <Field label="Admin full name"><input className="input" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Jane Doe" /></Field>
            <Field label="Admin email"><input className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" /></Field>
            <Field label="Password"><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 8 characters" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Country">
                <select className="input" value={country} onChange={(e) => { const cc = e.target.value; setCountry(cc); const inf = COUNTRIES[cc]; if (inf) { setPhone(inf.phone); setCurrency(inf.currency); toast(`Currency ${inf.currency} · ${inf.tz} auto-configured`, "info"); } }}>
                  {Object.keys(COUNTRIES).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Phone"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <div className="rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300"><Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-300" />Auto-detected:</span>
              <span className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300">{CURRENCY_MAP[currency]?.flag} {currency} — {CURRENCY_MAP[currency]?.symbol}</span>
              <span className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 font-mono !text-[10.5px]">{fxRateLabel("USD", currency)}</span>
              <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300">{c.tz}</span>
              <select className="input !h-8 !w-auto !text-[12px] ml-auto" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Override currency">
                {CURRENCIES.map((cur) => <option key={cur.code} value={cur.code}>{cur.flag} {cur.code} · {cur.name}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4 fade-in">
            <Field label="Academic year"><input className="input" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026–2027" /></Field>
            <div>
              <span className="label">Terms</span>
              <div className="flex gap-2">{["Term 1", "Term 2", "Term 3"].map((tm) => <span key={tm} className="chip bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300 !px-3 !py-1.5">{tm}</span>)}</div>
            </div>
            <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-4 py-3 text-[12.5px] font-semibold text-ink-500 dark:text-ink-300">Grading scale, passing marks and ranking can be customised later in Settings → Academic.</div>
          </div>
        )}
        {step === 2 && (
          <div className="fade-in">
            <span className="label">Which levels does your school run?</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <button key={l} onClick={() => setLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l])}
                  className={`rounded-xl border-2 px-3 py-4 text-center transition-all cursor-pointer ${levels.includes(l) ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/15" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                  <span className="block font-display font-bold text-lg">S{l}</span>
                  <span className="block text-[11px] font-bold text-ink-400">Senior {l} · A & B</span>
                </button>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-400 mt-3 font-semibold">{levels.length * 2} class sections will be created with demo students you can replace.</p>
          </div>
        )}
        {step === 3 && (
          <div className="fade-in text-center py-4">
            <span className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto"><Ic n="check" size={30} sw={2.4} /></span>
            <h3 className="font-display text-[22px] font-bold mt-4">{name || "My New Academy"} is ready</h3>
            <p className="text-[13.5px] text-ink-400 mt-1.5 max-w-sm mx-auto">Demo students, teachers, fees and one full academic year of data are preloaded so you can explore every module immediately. Replace them anytime — or reset from Settings.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">{["14-day trial", "Professional plan", `${levels.length * 2} classes`, `${CURRENCY_MAP[currency]?.flag} ${currency}`].map((x) => <span key={x} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-200">{x}</span>)}</div>
          </div>
        )}

        <div className="flex justify-between mt-7">
          <button className="btn-o" onClick={() => (step === 0 ? nav("/") : setStep(step - 1))}><Ic n="chevL" size={15} />Back</button>
          {step < 3 ? <button className="btn-p" onClick={() => setStep(step + 1)}>Continue<Ic n="chevR" size={15} /></button>
            : <button className="btn-p" onClick={create}><Ic n="zap" size={15} />Launch my school</button>}
        </div>
      </div>
    </Shell>
  );
}

export function Forgot({ nav, reset }: { nav: (to: string) => void; reset?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  return (
    <Shell nav={nav} title={reset ? "Set a new password" : "Reset your password"} sub={reset ? "Enter your new password below." : "We'll email you a secure reset link."}>
      <div className="panel p-6 sm:p-7">
        {!reset ? (
          sent ? (
            <div className="text-center py-4 fade-in">
              <span className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto"><Ic n="mail" size={24} /></span>
              <h3 className="font-display font-bold text-[19px] mt-4">Check your inbox</h3>
              <p className="text-[13.5px] text-ink-400 mt-1.5">If <b>{email}</b> exists, a reset link is on its way. It expires in 30 minutes.</p>
              <button className="btn-p mt-5" onClick={() => nav("/reset")}>Open reset link (demo)</button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); toast("Reset link sent", "info"); }}>
              <Field label="Email address"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></Field>
              <button className="btn-p w-full" type="submit"><Ic n="send" size={15} />Send reset link</button>
              <button type="button" className="btn-g w-full" onClick={() => nav("/login")}><Ic n="chevL" size={15} />Back to login</button>
            </form>
          )
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (p1.length < 8 || p1 !== p2) { toast("Passwords must match (min 8 chars)", "err"); return; } toast("Password updated — sign in"); nav("/login"); }}>
            <Field label="New password"><input className="input" type="password" required value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
            <Field label="Confirm password"><input className="input" type="password" required value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
            <div className="text-[12px] font-semibold text-ink-400 flex items-center gap-2"><Ic n="shield" size={14} className="text-emerald-500" />Passwords are hashed with bcrypt — never stored in plain text.</div>
            <button className="btn-p w-full" type="submit">Update password</button>
          </form>
        )}
      </div>
    </Shell>
  );
}

function Shell({ nav, title, sub, children }: { nav: (to: string) => void; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex flex-col">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Brand nav={nav} />
        <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />Back to site</button>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[28px] font-bold tracking-tight">{title}</h1>
          <p className="text-[14px] text-ink-400 mt-1 mb-6">{sub}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
