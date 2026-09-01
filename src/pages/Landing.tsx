import { useEffect, useState } from "react";
import { useApp, fmtMoney, fmtNum, attPct, todayISO, CURRENCIES, CURRENCY_MAP, fmtMoneyConv, fxRateLabel } from "../lib/data";
import { Ic } from "../components/icons";
import { Reveal, AreaChart } from "../components/ui";
import { LANGS, useT } from "../lib/i18n";
import { setPrefs } from "../lib/data";

const FEED = [
  { ic: "payment", tone: "text-emerald-500", text: "90,000 RWF received — Mobile Money" },
  { ic: "attendance", tone: "text-cobalt-500", text: "S4 A attendance marked · 96%" },
  { ic: "userplus", tone: "text-gold-500", text: "New admission — APP-2026-049" },
  { ic: "exams", tone: "text-rose-500", text: "Mid-Term report cards published" },
  { ic: "sms", tone: "text-emerald-500", text: "Absence alert sent to 3 parents" },
  { ic: "receipt", tone: "text-cobalt-500", text: "Receipt RC-2026-9204 issued" },
];

function LiveConsole() {
  const s = useApp();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 2600);
    return () => clearInterval(i);
  }, []);
  const feed = Array.from({ length: 4 }, (_, i) => FEED[(tick + i) % FEED.length]);
  const att = attPct(s.db, todayISO());
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const rev = [4.1, 5.2, 4.8, 3.2, 6.1, 7.4, 6.8, 8.2];
  return (
    <div className="relative">
      <div className="absolute -inset-6 dot-bg opacity-60 -z-10 rounded-3xl" />
      <div className="panel !rounded-2xl shadow-pop overflow-hidden border-ink-800 !bg-ink-950 text-ink-100 float-y">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.04]">
          <span className="w-2 h-2 rounded-full bg-rose-400" /><span className="w-2 h-2 rounded-full bg-gold-400" /><span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-bold tracking-[0.14em] uppercase text-ink-400">Live operations — VITECH Academy</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-400"><i className="w-1.5 h-1.5 rounded-full bg-emerald-400 tick-pulse" />LIVE</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/10">
          <div className="p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Students</div>
            <div className="font-display text-2xl font-bold tnum text-white">1,240</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-0.5">▲ 4.2% this term</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Attendance</div>
            <div className="font-display text-2xl font-bold tnum text-white">{att}%</div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-400 rounded-full barx-anim" style={{ width: `${att}%` }} /></div>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400">Collected</div>
            <div className="font-display text-2xl font-bold tnum text-white">92%</div>
            <div className="text-[11px] text-gold-400 font-bold mt-0.5">of Term 2 fees</div>
          </div>
        </div>
        <div className="px-4 pb-2 pt-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-1">Revenue · 8 months (M RWF)</div>
          <div className="flex items-end gap-1.5 h-16">
            {rev.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-[3px] bar-anim ${i === rev.length - 1 ? "bg-gold-400" : "bg-cobalt-500"}`} style={{ height: `${(v / 9) * 56}px`, animationDelay: `${i * 60}ms` }} />
                <span className="text-[8.5px] font-bold text-ink-500">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-3 space-y-2 bg-white/[0.03]">
          {feed.map((f, i) => (
            <div key={`${tick}-${i}`} className={`flex items-center gap-2.5 text-[12px] ${i === 0 ? "feed-in text-white" : "text-ink-400"}`}>
              <span className={`w-5 h-5 rounded-md bg-white/[0.07] flex items-center justify-center ${f.tone}`}><Ic n={f.ic} size={11} /></span>
              <span className="truncate">{f.text}</span>
              <span className="ml-auto text-[10px] text-ink-500 tnum shrink-0">{i === 0 ? "now" : `${i * 2}m`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const { school, plans } = s.db;
  const lang = s.prefs.lang;
  const tt = useT();
  const [priceCur, setPriceCur] = useState("USD");

  const features: { ic: string; title: string; body: string; big?: boolean }[] = [
    { ic: "students", title: "Student Management", body: "Complete profiles, admissions workflow, ID cards, transfers, archives and parent links — every record one click away.", big: true },
    { ic: "teacher", title: "Teacher Management", body: "Qualifications, assignments, salaries and performance in one place." },
    { ic: "attendance", title: "Attendance", body: "One-tap class registers with automatic parent alerts on absence." },
    { ic: "grades", title: "Grades & Exams", body: "Configurable grading scales, automatic averages, ranks and GPA." },
    { ic: "fees", title: "Fees & Payments", body: "Fee structures per level, receipts, mobile money, balances and reminders.", big: true },
    { ic: "timetable", title: "Timetable", body: "Conflict-free schedules for classes, teachers and rooms." },
    { ic: "receipt", title: "Report Cards", body: "Print-ready, branded report cards with ranks and comments." },
    { ic: "comm", title: "Parent Communication", body: "SMS, WhatsApp and email with dynamic templates." },
    { ic: "analytics", title: "Analytics & Reports", body: "Enrollment, collection and performance dashboards." },
    { ic: "folder", title: "Documents", body: "Secure storage with role-based access control." },
    { ic: "shield", title: "Security & Audit", body: "RBAC permissions, audit trails, backups and 2FA." },
  ];

  const roles = ["Super Admin", "School Admin", "Principal", "Accountant", "Teacher", "Student", "Parent", "Registrar", "Receptionist", "Librarian", "Transport Mgr", "HR Manager"];

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 dark:border-ink-800 bg-paper/85 dark:bg-ink-950/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer">
            <span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-lg">V</span>
            <span className="font-display font-bold text-[17px] tracking-tight">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-semibold text-ink-500 dark:text-ink-300">
            <a href="#features" className="hover:text-ink-900 dark:hover:text-white transition-colors">{tt("Features")}</a>
            <a href="#roles" className="hover:text-ink-900 dark:hover:text-white transition-colors">{tt("Roles")}</a>
            <a href="#pricing" className="hover:text-ink-900 dark:hover:text-white transition-colors">{tt("Pricing")}</a>
            <a href="#security" className="hover:text-ink-900 dark:hover:text-white transition-colors">{tt("Security")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <select className="input !w-auto !h-9 !text-[12.5px] font-semibold" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
            <button className="btn-o btn-sm hidden sm:inline-flex" onClick={() => nav("/login")}>{tt("Login")}</button>
            <button className="btn-p btn-sm" onClick={() => nav("/register")}>{tt("Get Started")}</button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3.5 py-1.5 text-[12px] font-bold text-ink-500 dark:text-ink-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />
                School ERP · Multi-campus SaaS · {school.country}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display font-bold text-[40px] sm:text-[54px] leading-[1.04] tracking-tight mt-5">
                {(() => { const words = tt("Complete School Management System").split(" "); const last = words[words.length - 1]; return (
                  <>{words.slice(0, -1).join(" ")}{" "}<span className="relative inline-block">{last}<svg viewBox="0 0 220 12" className="absolute -bottom-1.5 left-0 w-full" aria-hidden="true"><path d="M3 9c40-6 140-6 214-2" fill="none" stroke="#dca638" strokeWidth="5" strokeLinecap="round" /></svg></span></>
                ); })()}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[16.5px] leading-relaxed text-ink-500 dark:text-ink-300 mt-6 max-w-xl">
                {tt("Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-wrap gap-3 mt-8">
                <button className="btn-p !h-12 !px-6 !text-[15px]" onClick={() => nav("/register")}><Ic n="zap" />{tt("Get Started free")}</button>
                <button className="btn-o !h-12 !px-6 !text-[15px]" onClick={() => nav("/login")}>{tt("Request a Demo")}</button>
                <button className="btn-g !h-12 !px-4 !text-[15px]" onClick={() => nav("/login")}>{tt("Login")}<Ic n="arrowUR" size={16} /></button>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 text-[13px] font-semibold text-ink-400">
                <span className="flex items-center gap-2"><Ic n="check" size={15} className="text-emerald-500" sw={2.5} />{tt("14-day free trial")}</span>
                <span className="flex items-center gap-2"><Ic n="check" size={15} className="text-emerald-500" sw={2.5} />{tt("No card required")}</span>
                <span className="flex items-center gap-2"><Ic n="check" size={15} className="text-emerald-500" sw={2.5} />{tt("Multi-campus ready")}</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}><LiveConsole /></Reveal>
        </div>
        <div className="border-y border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 py-4 overflow-hidden">
          <div className="marquee flex gap-14 w-max px-7 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-300 dark:text-ink-600 whitespace-nowrap">
            {["VITECH Academy", "Groupe Scolaire Lumumba", "Green Hills Academy", "Lakeview College", "Excellence Institute", "Sunrise Schools", "Uhuru Academy", "VITECH Academy", "Groupe Scolaire Lumumba", "Green Hills Academy", "Lakeview College", "Excellence Institute", "Sunrise Schools", "Uhuru Academy"].map((c, i) => <span key={i} className="flex items-center gap-14">{c}<i className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" /></span>)}
          </div>
        </div>
      </section>

      {/* numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { v: fmtNum(s.db.students.length * 5), l: "Students managed", ic: "students" },
          { v: fmtNum(s.db.teachers.length * 20), l: "Teachers onboard", ic: "teacher" },
          { v: fmtMoney(s.db.payments.reduce((a, b) => a + b.amount, 0) / 1000, "M") , l: "Fees collected (demo)", ic: "coins" },
          { v: fmtNum(s.db.classes.length) + " × 2", l: "Classes & sections", ic: "class" },
        ].map((x, i) => (
          <Reveal key={i} delay={i * 70}>
            <div className="panel p-5 text-center hover:-translate-y-1 hover:shadow-lift transition-all duration-200">
              <Ic n={x.ic} size={22} className="mx-auto text-cobalt-600 dark:text-cobalt-400" />
              <div className="font-display text-[26px] font-bold tnum mt-2">{x.v}</div>
              <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-400">{tt(x.l)}</div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* features bento */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
            <div>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Everything a school runs on")}</div>
              <h2 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight mt-2">{tt("One platform. Every operation.")}</h2>
            </div>
            <p className="text-[14.5px] text-ink-400 max-w-sm">{tt("Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.")}</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Reveal key={i} delay={(i % 4) * 70} className={f.big ? "sm:col-span-2" : ""}>
              <div className={`panel p-5 h-full group hover:-translate-y-1 hover:shadow-lift hover:border-cobalt-300 dark:hover:border-cobalt-700 transition-all duration-200 ${f.big ? "bg-gradient-to-br from-ink-950 to-cobalt-950 !text-ink-100 !border-ink-800" : ""}`}>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 ${f.big ? "bg-gold-400 text-ink-950" : "bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300"}`}><Ic n={f.ic} size={20} /></div>
                <h3 className="font-display font-bold text-[17px]">{tt(f.title)}</h3>
                <p className={`text-[13.5px] leading-relaxed mt-1.5 ${f.big ? "text-ink-300" : "text-ink-400"}`}>{tt(f.body)}</p>
                {f.big && i === 0 && (
                  <div className="mt-4"><AreaChart data={[12, 18, 15, 24, 31, 29, 38, 46]} labels={["S1", "S2", "S3", "S4", "S5", "S6", "T2", "T3"]} h={90} color="#dca638" id="hero2" /></div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* roles */}
      <section id="roles" className="bg-ink-950 text-ink-100 py-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <Reveal>
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-400">{tt("Role-based access")}</div>
                <h2 className="font-display text-[32px] sm:text-[38px] font-bold tracking-tight mt-2">{tt("A portal for every person in your school")}</h2>
                <p className="text-ink-300 text-[14.5px] mt-4 leading-relaxed">{tt("Twelve roles, each with its own dashboard and granular permissions. Teachers see only their classes, parents only their children, accountants only finance.")}</p>
                <button className="btn-gold mt-6" onClick={() => nav("/login")}><Ic n="shield" />{tt("Explore role permissions")}</button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {roles.map((r, i) => (
                  <Reveal key={r} delay={i * 45}>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[13.5px] font-bold hover:bg-cobalt-600 hover:border-cobalt-500 transition-colors cursor-default"><Ic n={i % 3 === 0 ? "user" : i % 3 === 1 ? "shield" : "star"} size={14} className="text-gold-400" />{r}</span>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Pricing")}</div>
            <h2 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight mt-2">{tt("Plans that scale with your school")}</h2>
            <p className="text-ink-400 text-[14.5px] mt-3">{tt("Prices, limits and features are fully editable by the platform owner — in any currency.")}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">{tt("Show prices in")}</span>
              {["USD", "EUR", "RWF", "KES", "XAF", "NGN"].map((cc) => (
                <button key={cc} onClick={() => setPriceCur(cc)}
                  className={`chip cursor-pointer !py-1.5 !px-3 transition-all ${priceCur === cc ? "bg-ink-950 text-white dark:bg-ink-100 dark:text-ink-900 shadow-panel" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 hover:bg-cobalt-100 dark:hover:bg-cobalt-500/15"}`}>
                  {CURRENCY_MAP[cc]?.flag} {cc}
                </button>
              ))}
            </div>
            {priceCur !== "USD" && <div className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 font-mono mx-auto mt-3 !py-1.5">{fxRateLabel("USD", priceCur)} · {tt("converted automatically")}</div>}
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <div className={`panel p-7 h-full flex flex-col relative ${p.highlight ? "!bg-ink-950 !text-ink-100 !border-cobalt-700 shadow-pop md:-translate-y-3" : "hover:shadow-lift hover:-translate-y-1 transition-all duration-200"}`}>
                {p.highlight && <span className="absolute -top-3 left-6 chip bg-gold-400 text-ink-950 !px-3 !py-1">{tt("Most popular")}</span>}
                <h3 className="font-display font-bold text-[20px]">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-display text-[42px] font-bold tnum leading-none">{fmtMoneyConv(p.price, "USD", priceCur)}</span>
                  <span className="text-[13px] font-semibold text-ink-400">{tt(p.period)}</span>
                </div>
                {priceCur !== "USD" && <div className={`text-[11.5px] font-bold tnum mt-1 ${p.highlight ? "text-ink-400" : "text-ink-300"}`}>≈ ${p.price} USD</div>}
                <div className={`text-[12.5px] font-bold mt-2 ${p.highlight ? "text-gold-400" : "text-cobalt-600 dark:text-cobalt-400"}`}>
                  {p.students === "Unlimited" ? tt("Unlimited students") : `${tt("Up to")} ${fmtNum(p.students)} ${tt("students")}`} · {p.teachers === "Unlimited" ? tt("unlimited teachers") : `${p.teachers} ${tt("teachers")}`} · {p.storage}
                </div>
                <ul className="mt-5 space-y-2.5 text-[13.5px] flex-1">
                  {p.features.map((f) => <li key={f} className="flex gap-2.5"><Ic n="check" size={15} sw={2.6} className={p.highlight ? "text-gold-400" : "text-emerald-500"} />{f}</li>)}
                </ul>
                <button className={`mt-6 ${p.highlight ? "btn-gold" : "btn-p"} w-full`} onClick={() => nav("/register")}>{i === 0 ? tt("Start free trial") : i === 1 ? tt("Start 14-day trial") : tt("Contact sales")}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* security */}
      <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <Reveal>
          <div className="panel !rounded-2xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Security first")}</div>
              <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight mt-2">{tt("Built to protect your school's data")}</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-6 text-[13.5px]">
                {["Hashed passwords & 2FA", "Granular RBAC permissions", "Full audit trail with IP & device", "Automatic nightly backups", "Rate limiting & account lockout", "White-label & multi-tenant"].map((x) => (
                  <span key={x} className="flex gap-2.5 items-start"><span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5"><Ic n="shield" size={13} /></span><b>{tt(x)}</b></span>
                ))}
              </div>
            </div>
            <div className="bg-ink-950 text-ink-100 p-8 sm:p-10 flex flex-col justify-center gap-3">
              {[["UPDATE_STUDENT", "Updated profile — Keza Uwase"], ["CREATE_PAYMENT", "Receipt RC-2026-9204 · 90,000 RWF"], ["LOGIN_SUCCESS", "admin@vitech.academy · 2FA verified"], ["BACKUP_CREATED", "Nightly snapshot · 48.2 MB"]].map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <Ic n="audit" size={15} className="text-gold-400" />
                  <span className="font-mono text-[11px] font-bold text-cobalt-300 shrink-0">{a[0]}</span>
                  <span className="text-[12.5px] text-ink-300 truncate">{a[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA + footer */}
      <section className="bg-ink-950 text-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-[1fr_auto] items-center gap-8">
          <div>
            <h2 className="font-display text-[30px] sm:text-[38px] font-bold tracking-tight">{tt("Ready to run your school on VITECH?")}</h2>
            <p className="text-ink-300 mt-2 text-[15px]">{tt("Deploy in minutes. Import your students from Excel. Go paperless this term.")}</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-gold !h-12 !px-7" onClick={() => nav("/register")}>{tt("Create your school")}</button>
            <button className="btn-o !h-12 !px-6 !border-ink-700 !bg-transparent !text-ink-100" onClick={() => nav("/verify")}>{tt("Verify a certificate")}</button>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-ink-400">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-md bg-gold-400 text-ink-950 flex items-center justify-center font-display font-bold text-sm">V</span>
              <span>© 2026 VITECH School Management System — {tt("white-label ready")}</span>
            </div>
            <div className="flex gap-5 font-semibold">
              <button className="hover:text-white transition-colors cursor-pointer" onClick={() => nav("/login")}>{tt("Login")}</button>
              <button className="hover:text-white transition-colors cursor-pointer" onClick={() => nav("/verify")}>{tt("Verify certificate")}</button>
              <button className="hover:text-white transition-colors cursor-pointer" onClick={() => nav("/register")}>{tt("Pricing")}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
