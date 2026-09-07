import { useEffect, useState } from "react";
import { useApp, setPrefs, fmtNum, attPct, todayISO, CURRENCY_MAP, convert, fxRateLabel, collectionRate } from "../lib/data";
import { Ic } from "../components/icons";
import { Reveal, useCountUp } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";

function useScrolled(threshold = 14) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function LiveTicker() {
  const s = useApp();
  const db = s.db;
  const cur = db.school.currency;
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 2800); return () => clearInterval(id); }, []);
  const att = Math.min(100, attPct(db, todayISO()) + ((tick * 7) % 3));
  const rev = db.payments.reduce((a, b) => a + b.amount, 0);
  const rows = [
    { label: "Attendance today", value: `${att}%`, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Fees collected", value: `${Math.round(rev).toLocaleString()} ${cur}`, tone: "text-cobalt-700 dark:text-cobalt-300" },
    { label: "Collection rate", value: `${collectionRate(db)}%`, tone: "text-gold-600 dark:text-gold-400" },
    { label: "Active students", value: fmtNum(db.students.filter((x) => x.status === "active").length), tone: "text-ink-900 dark:text-ink-100" },
  ];
  const feed = [
    "Payment received — Mobile Money",
    "Attendance register saved · Senior 4 A",
    "New admission application APP-2026-018",
    "Report card generated · Senior 6",
    "SMS reminder sent to 14 parents",
  ];
  const [feedIdx, setFeedIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setFeedIdx((i) => (i + 1) % feed.length), 3200); return () => clearInterval(id); }, [feed.length]);
  return (
    <div className="relative">
      <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full border-[14px] border-gold-300/50 dark:border-gold-500/20 dot-bg" aria-hidden="true" />
      <div className="relative panel !rounded-2xl !border-ink-800 !bg-ink-950 !text-ink-100 overflow-hidden shadow-pop">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 tick-pulse" /><span className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-300">Live · {db.school.name}</span></div>
          <span className="chip bg-white/[0.08] text-ink-300 !text-[10px]">{db.school.academicYear} · {db.school.term}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          {rows.map((r) => <StatMini key={r.label} label={r.label} value={r.value} tone={r.tone} />)}
        </div>
        <div className="px-5 pb-4">
          <div key={feedIdx} className="feed-in rounded-lg bg-white/[0.06] border border-white/[0.08] px-3.5 py-2.5 text-[12px] font-semibold flex items-center gap-2">
            <Ic n="check" size={13} sw={2.6} className="text-emerald-400 shrink-0" /><span className="truncate">{feed[feedIdx]}</span>
          </div>
        </div>
        <div className="h-1.5 bg-gradient-to-r from-cobalt-600 via-gold-400 to-cobalt-600" />
      </div>
    </div>
  );
}
function StatMini({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3">
      <div className={`font-display font-bold text-[19px] tnum leading-tight ${tone}`}>{value}</div>
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mt-0.5">{label}</div>
    </div>
  );
}

export default function Landing({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const db = s.db;
  const tt = useT();
  const lang = s.prefs.lang;
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [priceCur, setPriceCur] = useState("USD");
  const goTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const studentsN = useCountUp(db.students.length, 1100);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-ink-900/95 backdrop-blur-md shadow-panel" : "bg-paper/85 dark:bg-ink-950/85 backdrop-blur"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-5">
          <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0" aria-label="VITECH School">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
            <span className="font-display font-bold text-[14px] sm:text-[17px] hidden min-[400px]:block whitespace-nowrap truncate">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-ink-500 dark:text-ink-300">
            <button onClick={() => goTo("features")} className="hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer">{tt("Features")}</button>
            <button onClick={() => goTo("roles")} className="hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer">{tt("Roles")}</button>
            <button onClick={() => goTo("pricing")} className="hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer">{tt("Pricing")}</button>
            <button onClick={() => goTo("security")} className="hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer">{tt("Security")}</button>
            <button onClick={() => nav("/download")} className="flex items-center gap-1.5 font-bold text-cobalt-700 dark:text-cobalt-300 hover:text-gold-600 dark:hover:text-gold-300 transition-colors cursor-pointer">
              <Ic n="download" size={15} />{tt("Desktop app")}
            </button>
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            <label className="flex items-center gap-1.5 h-9 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-2.5 pr-1.5 cursor-pointer hover:border-cobalt-400 transition-colors focus-within:border-cobalt-500">
              <Ic n="globe" size={15} className="text-cobalt-600 dark:text-cobalt-400 shrink-0" />
              <select className="bg-transparent border-0 outline-none text-[11.5px] sm:text-[12.5px] font-bold text-ink-700 dark:text-ink-100 cursor-pointer max-w-[76px] sm:max-w-none truncate pr-0.5" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}>
                {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            </label>
            <button onClick={() => nav("/login")} aria-label={tt("Login")} title={tt("Login")}
              className="md:hidden w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 flex items-center justify-center text-ink-600 dark:text-ink-200 hover:border-cobalt-400 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-all active:scale-95 cursor-pointer">
              <Ic n="user" size={16} />
            </button>
            <button className="btn-o btn-sm hidden md:inline-flex" onClick={() => nav("/login")}><Ic n="user" size={14} />{tt("Login")}</button>
            <button onClick={() => nav("/register")} className="btn-p !h-9 sm:!h-10 !px-2.5 sm:!px-4 !text-[12px] sm:!text-sm !gap-1.5 min-w-0" aria-label={tt("Get Started")}>
              <Ic n="zap" size={14} className="shrink-0" /><span className="truncate max-w-[86px] min-[420px]:max-w-none">{tt("Get Started")}</span>
            </button>
            <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-600 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors active:scale-95 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
              <Ic n={menuOpen ? "x" : "menu"} size={19} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lift pop-in">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col" aria-label="Mobile">
              <button onClick={() => { nav("/login"); setMenuOpen(false); }} className="mb-1.5 flex items-center gap-3 px-3 py-3 rounded-lg text-[14.5px] font-bold text-cobalt-700 dark:text-cobalt-300 bg-cobalt-50 dark:bg-cobalt-500/10 hover:bg-cobalt-100 dark:hover:bg-cobalt-500/20 transition-colors cursor-pointer text-left">
                <Ic n="user" size={17} />{tt("Login")}<Ic n="arrowUR" size={14} className="ml-auto opacity-60" />
              </button>
              {[["features", "Features", "sparkles"], ["roles", "Roles", "idcard"], ["pricing", "Pricing", "coins"], ["security", "Security", "shield"]].map(([id, label, ic]) => (
                <button key={id} onClick={() => goTo(id)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-[14.5px] font-bold text-ink-700 dark:text-ink-100 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 hover:text-cobalt-700 dark:hover:text-cobalt-300 transition-colors cursor-pointer text-left">
                  <Ic n={ic} size={17} className="text-ink-400" />{tt(label)}
                </button>
              ))}
              <button onClick={() => { nav("/download"); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-[14.5px] font-bold text-cobalt-700 dark:text-cobalt-300 hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 transition-colors cursor-pointer text-left">
                <Ic n="download" size={17} />{tt("Desktop app")}
              </button>
            </nav>
          </div>
        )}
      </header>

      <section className="grid-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cobalt-50/60 via-transparent to-transparent dark:from-cobalt-950/40" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
          <div>
            <Reveal>
              <span className="chip bg-ink-950 dark:bg-cobalt-600 text-gold-400 !py-1.5 !px-3.5"><Ic n="zap" size={13} />School ERP · Multi-campus SaaS</span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display font-bold text-[38px] sm:text-[50px] leading-[1.05] tracking-tight mt-5">
                {(() => { const words = tt("Complete School Management System").split(" "); const last = words[words.length - 1]; return (
                  <>{words.slice(0, -1).join(" ")}{" "}<span className="relative inline-block">{last}<svg viewBox="0 0 220 12" className="absolute -bottom-1.5 left-0 w-full" aria-hidden="true"><path d="M3 9c40-6 140-6 214-2" fill="none" stroke="#dca638" strokeWidth="5" strokeLinecap="round" /></svg></span></>
                ); })()}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[16px] sm:text-[17px] leading-relaxed text-ink-500 dark:text-ink-300 mt-5 max-w-xl">
                {tt("Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-wrap gap-3 mt-7">
                <button className="btn-p !h-12 !px-6 !text-[15px]" onClick={() => nav("/register")}><Ic n="zap" />{tt("Get Started")}</button>
                <button className="btn-o !h-12 !px-6 !text-[15px]" onClick={() => nav("/login")}>{tt("Request a Demo")}</button>
                <button className="btn-g !h-12 !px-4 !text-[15px]" onClick={() => nav("/login")}>{tt("Login")}<Ic n="arrowUR" size={16} /></button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}><LiveTicker /></Reveal>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Features")}</div>
            <h2 className="font-display text-[30px] sm:text-[38px] font-bold tracking-tight mt-2">{tt("Everything a school runs on")}</h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[["students", "Student Management", "Complete student records with documents, parents, transfers and ID cards."], ["teacher", "Teacher Management", "Profiles, assignments, salaries and performance in one place."], ["attendance", "Attendance & Alerts", "One-tap registers; parents get an SMS the moment a child is absent."], ["grades", "Grades & Report Cards", "Configurable grading, automatic ranks and print-ready report cards."], ["timetable", "Classes & Timetable", "Sections, rooms and schedules with automatic conflict detection."], ["coins", "Fees & Payments", "Fee structures, Mobile Money, official receipts and balance tracking."], ["comm", "Parent Communication", "SMS, WhatsApp and email templates with dynamic variables."], ["reports", "Financial Reports", "Daily to annual revenue, expenses and profit — exportable."], ["shield", "Secure by Design", "RBAC, audit logs, 2FA and encrypted backups."]].map(([ic, title, body], i) => (
            <Reveal key={title} delay={(i % 3) * 70}>
              <div className="panel p-5 h-full hover:-translate-y-1 hover:shadow-lift transition-all duration-200">
                <span className="w-11 h-11 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center"><Ic n={ic} size={20} /></span>
                <h3 className="font-display font-bold text-[17px] mt-4">{tt(title)}</h3>
                <p className="text-[13.5px] leading-relaxed mt-1.5 text-ink-400">{tt(body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Pricing")}</div>
            <h2 className="font-display text-[30px] sm:text-[38px] font-bold tracking-tight mt-2">{tt("Plans that scale with your school")}</h2>
            <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">{tt("Show prices in")}</span>
              {["USD", "EUR", "RWF", "KES", "XAF", "NGN"].map((c) => (
                <button key={c} onClick={() => setPriceCur(c)} className={`chip cursor-pointer !py-1.5 transition-all ${priceCur === c ? "bg-ink-950 dark:bg-cobalt-600 text-gold-400" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 hover:bg-cobalt-100"}`}>{CURRENCY_MAP[c]?.flag} {c}</button>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {db.plans.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <div className={`relative panel p-6 h-full flex flex-col ${p.highlight ? "!bg-ink-950 !text-ink-100 !border-gold-400/60 shadow-pop" : ""}`}>
                {p.highlight && <span className="absolute -top-3 left-6 chip bg-gold-400 text-ink-950 !px-3 !py-1">{tt("Most popular")}</span>}
                <h3 className="font-display font-bold text-[20px]">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-display text-[40px] font-bold tnum leading-none">{Math.round(convert(p.price, "USD", priceCur)).toLocaleString()} {priceCur}</span>
                  <span className="text-[13px] font-semibold text-ink-400">/ {tt("month")}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-[13.5px] flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${p.highlight ? "bg-gold-400/20 text-gold-400" : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}><Ic n="check" size={11} sw={3} /></span>
                      <span className={p.highlight ? "text-ink-200" : "text-ink-600 dark:text-ink-300"}>{tt(f)}</span>
                    </li>
                  ))}
                </ul>
                <button className={`mt-6 ${p.highlight ? "btn-gold" : "btn-p"} w-full`} onClick={() => nav("/register")}>{i === 0 ? tt("Start free trial") : i === 1 ? tt("Start 14-day trial") : tt("Contact sales")}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 text-ink-100 px-8 sm:px-12 py-12 flex flex-wrap items-center gap-6 justify-between">
            <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight">{tt("Ready to run your school on VITECH?")}</h2>
              <p className="text-ink-300 mt-2 text-[15px]">{tt("Deploy in minutes. Import your students from Excel. Go paperless this term.")}</p>
            </div>
            <div className="relative flex gap-3">
              <button className="btn-gold !h-12 !px-7" onClick={() => nav("/register")}>{tt("Create your school")}</button>
              <button className="btn-o !h-12 !px-6 !border-ink-700 !bg-transparent !text-ink-100" onClick={() => nav("/verify")}>{tt("Verify a certificate")}</button>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8 text-[13px]">
          <div>
            <div className="flex items-center gap-2.5 mb-3"><span className="w-8 h-8 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold">V</span><b className="font-display text-[15px]">VITECH School</b></div>
            <p className="text-ink-400 leading-relaxed">{db.school.motto}</p>
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3">{tt("Product")}</div>
            <div className="flex flex-col gap-2 font-semibold text-ink-500 dark:text-ink-300">
              <button onClick={() => goTo("features")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Features")}</button>
              <button onClick={() => goTo("pricing")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Pricing")}</button>
              <button onClick={() => nav("/download")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Desktop app")}</button>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400 mb-3">{tt("Platform")}</div>
            <div className="flex flex-col gap-2 font-semibold text-ink-500 dark:text-ink-300">
              <button onClick={() => nav("/login")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Login")}</button>
              <button onClick={() => nav("/register")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Get Started")}</button>
              <button onClick={() => nav("/verify")} className="text-left hover:text-cobalt-600 dark:hover:text-cobalt-300 cursor-pointer">{tt("Verify certificate")}</button>
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 dark:border-ink-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-400">
            <span>© 2026 VITECH School Management System — {tt("white-label ready")}</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 tick-pulse" />All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
