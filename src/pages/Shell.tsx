import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useApp, can, me, mutate, setPrefs, fmtDateShort, changeCurrency, COUNTRIES, CURRENCY_MAP, audit } from "../lib/data";
import { Ic } from "../components/icons";
import { useT, LANGS } from "../lib/i18n";
import { Avatar, toast } from "../components/ui";

interface NavItem { to: string; icon: string; label: string; short: string; perm?: string; superOnly?: boolean; portalOnly?: boolean }
interface NavGroup { title: string; items: NavItem[] }
export const NAV: NavGroup[] = [
  { title: "Overview", items: [
    { to: "/app", icon: "dashboard", label: "Dashboard", short: "Home" },
    { to: "/app/portal", icon: "user", label: "My Portal", short: "Portal", portalOnly: true },
    { to: "/app/analytics", icon: "analytics", label: "Analytics", short: "Stats", perm: "analytics" },
  ]},
  { title: "People", items: [
    { to: "/app/students", icon: "students", label: "Students", short: "Students", perm: "students" },
    { to: "/app/admissions", icon: "userplus", label: "Admissions", short: "Admis.", perm: "admissions" },
    { to: "/app/teachers", icon: "teacher", label: "Teachers", short: "Teachers", perm: "teachers" },
    { to: "/app/hr", icon: "briefcase", label: "HR & Staff", short: "HR", perm: "hr" },
  ]},
  { title: "Academics", items: [
    { to: "/app/classes", icon: "class", label: "Classes", short: "Classes", perm: "classes" },
    { to: "/app/subjects", icon: "subject", label: "Subjects", short: "Subjects", perm: "classes" },
    { to: "/app/timetable", icon: "timetable", label: "Timetable", short: "Time", perm: "timetable" },
    { to: "/app/attendance", icon: "attendance", label: "Attendance", short: "Attend.", perm: "attendance" },
    { to: "/app/exams", icon: "exams", label: "Exams", short: "Exams", perm: "exams" },
    { to: "/app/grades", icon: "grades", label: "Grades", short: "Grades", perm: "grades" },
    { to: "/app/reportcards", icon: "award", label: "Report cards", short: "Cards", perm: "reports_cards" },
  ]},
  { title: "Finance", items: [
    { to: "/app/fees", icon: "fees", label: "Fees & Structures", short: "Fees", perm: "fees" },
    { to: "/app/payments", icon: "payment", label: "Payments", short: "Payments", perm: "payments" },
    { to: "/app/invoices", icon: "receipt", label: "Invoices", short: "Invoices", perm: "payments" },
    { to: "/app/expenses", icon: "expenses", label: "Expenses", short: "Expenses", perm: "expenses" },
    { to: "/app/finreports", icon: "reports", label: "Financial Reports", short: "Reports", perm: "fin_reports" },
  ]},
  { title: "Engagement", items: [
    { to: "/app/communication", icon: "comm", label: "Communication", short: "Messages", perm: "communication" },
    { to: "/app/announcements", icon: "megaphone", label: "Announcements", short: "News", perm: "communication" },
    { to: "/app/calendar", icon: "calendar", label: "Calendar", short: "Cal." },
    { to: "/app/library", icon: "book", label: "Library", short: "Library", perm: "library" },
    { to: "/app/transport", icon: "bus", label: "Transport", short: "Bus", perm: "transport" },
  ]},
  { title: "Management", items: [
    { to: "/app/documents", icon: "folder", label: "Documents", short: "Files", perm: "documents" },
    { to: "/app/certificates", icon: "award", label: "Certificates", short: "Certs", perm: "certificates" },
    { to: "/app/idcards", icon: "idcard", label: "ID cards", short: "IDs", perm: "idcards" },
    { to: "/app/audit", icon: "audit", label: "Audit logs", short: "Audit", perm: "audit" },
    { to: "/app/backups", icon: "database", label: "Backups", short: "Backups", perm: "backups" },
    { to: "/app/settings", icon: "settings", label: "Settings", short: "Settings", perm: "settings" },
    { to: "/app/platform", icon: "globe", label: "Platform (SaaS)", short: "SaaS", perm: "dashboard", superOnly: true },
    { to: "/app/help", icon: "info", label: "Help & Support", short: "Help" },
  ]},
];

function GlobalSearch({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => ref.current?.focus(), 60); } }, [open]);
  const db = s.db;
  const ql = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!ql) return [];
    const out: { type: string; title: string; sub: string; to: string }[] = [];
    db.students.filter((x) => `${x.first} ${x.last} ${x.regNo}`.toLowerCase().includes(ql)).slice(0, 5).forEach((x) => out.push({ type: "Student", title: `${x.first} ${x.last}`, sub: x.regNo, to: `/app/students?q=${encodeURIComponent(x.regNo)}` }));
    db.teachers.filter((x) => `${x.first} ${x.last} ${x.empNo}`.toLowerCase().includes(ql)).slice(0, 3).forEach((x) => out.push({ type: "Teacher", title: `${x.first} ${x.last}`, sub: x.specialization, to: "/app/teachers" }));
    db.payments.filter((x) => x.receipt.toLowerCase().includes(ql)).slice(0, 3).forEach((x) => out.push({ type: "Receipt", title: x.receipt, sub: `${x.amount.toLocaleString()} ${db.school.currency}`, to: "/app/payments" }));
    db.classes.filter((x) => `${x.name} ${x.section}`.toLowerCase().includes(ql)).slice(0, 3).forEach((x) => out.push({ type: "Class", title: `${x.name} ${x.section}`, sub: `Room ${x.room}`, to: "/app/classes" }));
    db.exams.filter((x) => x.name.toLowerCase().includes(ql)).slice(0, 3).forEach((x) => out.push({ type: "Exam", title: x.name, sub: fmtDateShort(x.date), to: "/app/exams" }));
    db.documents.filter((x) => x.name.toLowerCase().includes(ql)).slice(0, 3).forEach((x) => out.push({ type: "Document", title: x.name, sub: x.category, to: "/app/documents" }));
    return out.slice(0, 12);
  }, [ql, db]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px] fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl panel pop-in shadow-pop overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-ink-100 dark:border-ink-800">
          <Ic n="search" size={18} className="text-ink-400" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder={tt("Search anything…")} className="flex-1 h-13 py-4 bg-transparent outline-none text-[15px]"
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && results[0]) { nav(results[0].to); onClose(); } }} />
          <span className="kbd">Esc</span>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {ql && results.length === 0 && <p className="px-5 py-8 text-center text-[13.5px] text-ink-400 font-semibold">No results for “{q}”</p>}
          {!ql && <p className="px-5 py-6 text-center text-[12.5px] text-ink-400">{tt("Search")} — students, receipts, classes, exams, documents…</p>}
          {results.map((r, i) => (
            <button key={i} onClick={() => { nav(r.to); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left cursor-pointer">
              <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 shrink-0">{r.type}</span>
              <span className="min-w-0"><b className="block text-[13.5px] truncate">{r.title}</b><span className="block text-[11.5px] text-ink-400 truncate">{r.sub}</span></span>
              <Ic n="chevR" size={14} className="ml-auto text-ink-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bell({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const [open, setOpen] = useState(false);
  const unread = s.db.notifications.filter((n) => !n.read).length;
  const icons: Record<string, string> = { payment: "payment", fee: "alert", absent: "sms", admission: "userplus", exam: "exams", system: "info", grade: "grades" };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label={tt("Notifications")}
        className="relative w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors active:scale-90 cursor-pointer">
        <Ic n="bell" size={18} />
        {unread > 0 && <span className="absolute top-1 right-1 w-4 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9.5px] font-extrabold flex items-center justify-center px-1">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-3 top-[62px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[340px] z-50 panel pop-in shadow-pop overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <b className="font-display text-[15px]">{tt("Notifications")}</b>
              <button className="text-[12px] font-bold text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => mutate((db) => db.notifications.forEach((n) => (n.read = true)))}>{tt("Mark all read")}</button>
            </div>
            <div className="max-h-[46vh] overflow-y-auto">
              {s.db.notifications.map((n) => (
                <button key={n.id} onClick={() => { mutate((db) => { const x = db.notifications.find((y) => y.id === n.id)!; x.read = true; }); setOpen(false); nav(n.type === "payment" || n.type === "fee" ? "/app/payments" : "/app"); }}
                  className={`w-full flex gap-3 px-4 py-3 text-left border-b border-ink-100/60 dark:border-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer ${n.read ? "opacity-60" : ""}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-ink-100 dark:bg-ink-800 text-ink-400" : "bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300"}`}><Ic n={icons[n.type] ?? "info"} size={15} /></span>
                  <span className="min-w-0"><b className="block text-[13px] truncate">{n.title}</b><span className="block text-[12px] text-ink-400 truncate">{n.body}</span><span className="block text-[10.5px] text-ink-300 font-bold mt-0.5">{fmtDateShort(n.date)}</span></span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-cobalt-500 mt-2 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CurrencySwitch({ compact = false }: { compact?: boolean }) {
  const s = useApp();
  const tt = useT();
  const [open, setOpen] = useState(false);
  const cur = s.db.school.currency;
  const local = COUNTRIES[s.db.school.country]?.currency ?? "RWF";
  const options = Array.from(new Set(["USD", local]));
  const def = CURRENCY_MAP[cur];
  const pick = (code: string) => {
    setOpen(false);
    if (code === cur) return;
    const res = changeCurrency(code);
    audit("CHANGE_CURRENCY", "Finance", `Quick switch ${cur} → ${code} (${res.converted} records)`);
    toast(`${tt("Currency")}: ${code} — ${res.converted.toLocaleString()} ${tt("records converted") ?? "records converted"}`);
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label={tt("Currency")} title={`${tt("Currency")}: ${cur}`}
        className={`${compact ? "w-full justify-between px-3" : "px-2.5 gap-1.5"} h-9 flex items-center rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-[12px] font-bold hover:border-cobalt-400 transition-colors cursor-pointer`}>
        <span className="flex items-center gap-1.5"><Ic n="coins" size={14} className="text-gold-500" /><span>{cur}</span></span>
        <Ic n="chevD" size={12} className="text-ink-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-48 panel pop-in shadow-pop overflow-hidden py-1">
            {options.map((code) => (
              <button key={code} onClick={() => pick(code)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${code === cur ? "text-cobalt-600 dark:text-cobalt-300 bg-cobalt-50 dark:bg-cobalt-500/10" : "hover:bg-ink-50 dark:hover:bg-ink-800"}`}>
                <span className="text-[14px]">{CURRENCY_MAP[code]?.flag}</span>{code}
                <span className="ml-auto text-[10.5px] font-semibold text-ink-400">{code === "USD" ? "Dollar" : "Local"}</span>
                {code === cur && <Ic n="check" size={13} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Shell({ nav, path, children, onLogout }: { nav: (to: string) => void; path: string; children: ReactNode; onLogout: () => void }) {
  const s = useApp();
  const tt = useT();
  const user = me(s);
  const lang = s.prefs.lang;
  const role = user?.role ?? "student";
  const mtOn = s.prefs.mt !== false;
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setDrawer(false); setUserMenu(false); }, [path]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);

  const isOn = (to: string) => (to === "/app" ? path === "/app" : path === to || path.startsWith(to + "/"));
  const groups = useMemo(() => NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => {
      if (it.superOnly && role !== "super") return false;
      if (it.portalOnly && !["student", "parent", "teacher"].includes(role)) return false;
      if (it.perm && role !== "super" && role !== "admin" && !can(role, it.perm)) return false;
      return true;
    }),
  })).filter((g) => g.items.length > 0), [role]);

  const sectionLabel = useMemo(() => {
    for (const g of NAV) for (const it of g.items) if (path === it.to || (it.to !== "/app" && path.startsWith(it.to))) return it.label;
    return "Dashboard";
  }, [path]);

  const toggleMT = () => {
    setPrefs({ mt: !mtOn });
    toast(!mtOn ? "AI translation enabled" : "AI translation disabled", "info");
  };

  const headerBlock = (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-lg bg-gold-400 text-ink-950 flex items-center justify-center font-display font-bold text-lg shrink-0">{(s.db.school.logoText || "V")[0]}</span>
        <div className="min-w-0">
          <div className="font-display font-bold text-[14px] text-white truncate">{s.db.school.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">{s.db.school.academicYear} · {s.db.school.term}</div>
        </div>
      </div>
    </div>
  );
  const campusBlock = (
    <div className="px-4 pb-3">
      <select className="w-full h-8 rounded-lg bg-white/[0.07] border border-white/[0.1] text-[11.5px] font-bold text-ink-200 px-2 focus:outline-none focus:border-cobalt-500 cursor-pointer" aria-label="Campus"
        defaultValue={s.db.campuses.find((c) => c.active)?.name ?? ""}>
        {s.db.campuses.filter((c) => c.active).map((c) => <option key={c.id} value={c.name} className="bg-ink-900">{c.name} — {c.city}</option>)}
      </select>
    </div>
  );
  const drawerFooter = (
    <div className="px-4 py-3.5 border-t border-white/[0.08] space-y-2.5">
      <div className="flex items-center gap-2">
        <select value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}
          className="flex-1 h-9 rounded-lg bg-white/[0.07] border border-white/[0.1] text-[12px] font-bold text-ink-200 px-2 focus:outline-none focus:border-cobalt-500 cursor-pointer">
          {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-ink-900">{l.native}</option>)}
        </select>
        <button className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/[0.1] text-ink-200 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors" onClick={() => setPrefs({ theme: s.prefs.theme === "dark" ? "light" : "dark" })} aria-label="Toggle dark mode">
          <Ic n={s.prefs.theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
        <button className={`w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${mtOn ? "bg-gold-400/20 border-gold-400/40 text-gold-400" : "bg-white/[0.07] border-white/[0.1] text-ink-300 hover:bg-white/15"}`} onClick={toggleMT} aria-label={tt("AI translation")} title={tt("AI translation")}>
          <Ic n="sparkles" size={15} />
        </button>
      </div>
      <CurrencySwitch compact />
    </div>
  );

  const mobileTabs = [
    { to: "/app", icon: "dashboard", label: "Dashboard" },
    { to: "/app/students", icon: "students", label: "Students", perm: "students" },
    { to: "/app/attendance", icon: "attendance", label: "Attendance", perm: "attendance" },
    { to: "/app/payments", icon: "payment", label: "Payments", perm: "payments" },
    { to: "/app/communication", icon: "comm", label: "Communication", perm: "communication" },
  ].filter((tb) => !tb.perm || can(role, tb.perm) || role === "super" || role === "admin");

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col side-bg border-r border-ink-800 z-40">
        {headerBlock}{campusBlock}
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="side-h">{tt(g.title)}</div>
              {g.items.map((it) => (
                <button key={it.to} onClick={() => nav(it.to)} className={`nav-i w-full mb-0.5 ${isOn(it.to) ? "on" : ""}`} aria-current={isOn(it.to) ? "page" : undefined}>
                  <Ic n={it.icon} size={17} />{tt(it.label)}
                  {it.to === "/app/admissions" && s.db.admissions.filter((a) => !["enrolled", "rejected"].includes(a.stage)).length > 0 && (
                    <span className="ml-auto chip !px-1.5 !py-0 bg-gold-400 text-ink-950">{s.db.admissions.filter((a) => !["enrolled", "rejected"].includes(a.stage)).length}</span>)}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-4 py-3.5 border-t border-white/[0.08]">
          <button className="w-full flex items-center gap-2.5 px-2 h-10 rounded-lg hover:bg-white/[0.07] transition-colors cursor-pointer text-left" onClick={() => nav("/app/settings")}>
            <span className="w-8 h-8 rounded-lg bg-white/[0.08] text-gold-400 flex items-center justify-center"><Ic n="settings" size={15} /></span>
            <span className="min-w-0"><span className="block text-[12.5px] font-bold text-white truncate">{tt("Settings")}</span><span className="block text-[10px] text-ink-400">v{s.db.system.version} · {s.db.system.channel}</span></span>
          </button>
        </div>
      </aside>

      {/* mobile drawer — icon tiles */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-ink-950/60 fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[300px] max-w-[86vw] flex flex-col side-bg shadow-pop pop-in">
            <button className="absolute top-3.5 right-3 z-10 w-9 h-9 rounded-lg bg-white/[0.08] text-ink-300 hover:text-white hover:bg-white/15 flex items-center justify-center cursor-pointer transition-colors" onClick={() => setDrawer(false)} aria-label="Close menu"><Ic n="x" size={16} /></button>
            {headerBlock}{campusBlock}
            <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Mobile navigation">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="side-h">{tt(g.title)}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {g.items.map((it) => {
                      const badge = it.to === "/app/admissions" ? s.db.admissions.filter((a) => !["enrolled", "rejected"].includes(a.stage)).length : 0;
                      return (
                        <button key={it.to} onClick={() => nav(it.to)} aria-current={isOn(it.to) ? "page" : undefined}
                          className={`relative flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 transition-all cursor-pointer active:scale-95 ${isOn(it.to) ? "bg-cobalt-600 text-white shadow-[0_10px_24px_-10px_rgb(30_73_201/.9)]" : "text-ink-300 hover:bg-white/[0.07] hover:text-white"}`}>
                          <Ic n={it.icon} size={19} />
                          <span className="text-[10px] font-bold leading-none truncate w-full text-center">{tt(it.short)}</span>
                          {badge > 0 && <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-gold-400 text-ink-950 text-[9.5px] font-extrabold flex items-center justify-center">{badge}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            {drawerFooter}
          </aside>
        </div>
      )}

      {/* topbar */}
      <div className="lg:pl-[248px]">
        <header className={`sticky top-0 z-50 h-14 lg:h-16 flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 border-b transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-ink-900/95 backdrop-blur-md shadow-panel border-ink-200/70 dark:border-ink-800" : "bg-paper/85 dark:bg-ink-950/85 backdrop-blur border-ink-100 dark:border-ink-800"}`}>
          <button onClick={() => setDrawer(true)} aria-label={tt("Menu")}
            className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-ink-600 dark:text-ink-200 hover:bg-ink-100/80 dark:hover:bg-ink-800 active:scale-90 transition-all cursor-pointer shrink-0">
            <Ic n="menu" size={19} />
          </button>
          <button onClick={() => nav("/app")} className="flex items-center gap-2 min-w-0 flex-1 lg:flex-none lg:max-w-[240px] cursor-pointer group text-left" aria-label={tt("Dashboard")} title={tt(sectionLabel)}>
            <span className="w-8 h-8 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[14px] shrink-0 group-hover:scale-105 transition-transform">{(s.db.school.logoText || "V")[0]}</span>
            <span className="min-w-0 leading-tight">
              <span className="block font-display font-bold text-[13px] sm:text-[13.5px] truncate group-hover:text-cobalt-700 dark:group-hover:text-cobalt-300 transition-colors">{tt(sectionLabel)}</span>
              <span className="hidden min-[420px]:block text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink-400 truncate">{s.db.school.short} · {s.db.school.term}</span>
            </span>
          </button>
          <button onClick={() => setSearch(true)} aria-label={tt("Search anything…")}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 active:scale-90 transition-all cursor-pointer shrink-0 lg:hidden">
            <Ic n="search" size={17} />
          </button>
          <button onClick={() => setSearch(true)} className="hidden lg:flex items-center gap-2.5 h-10 px-3.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-[13px] font-semibold text-ink-400 hover:border-cobalt-400 hover:shadow-panel transition-all cursor-pointer w-64 xl:w-80 shrink-0">
            <Ic n="search" size={16} /><span className="truncate">{tt("Search anything…")}</span>
            <span className="ml-auto flex gap-1"><span className="kbd">Ctrl</span><span className="kbd">K</span></span>
          </button>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 shrink-0">
            <span className="hidden xl:block"><CurrencySwitch /></span>
            <button onClick={toggleMT} aria-label={tt("AI translation")} title={`${tt("AI translation")} — ${mtOn ? "ON" : "OFF"}`}
              className={`hidden md:flex w-10 h-10 rounded-lg items-center justify-center transition-all cursor-pointer active:scale-90 ${mtOn ? "bg-gold-100 dark:bg-gold-500/15 text-gold-600 dark:text-gold-300 shadow-[inset_0_0_0_1px_rgb(220_166_56/.4)]" : "text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800"}`}>
              <Ic n="sparkles" size={16} />
            </button>
            <select className="input !w-auto !h-9 !text-[12px] font-bold hidden md:block cursor-pointer" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
            <button className="hidden md:flex w-10 h-10 rounded-lg items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-all active:scale-90 cursor-pointer" onClick={() => setPrefs({ theme: s.prefs.theme === "dark" ? "light" : "dark" })} aria-label="Toggle dark mode">
              <Ic n={s.prefs.theme === "dark" ? "sun" : "moon"} size={17} />
            </button>
            <Bell nav={nav} />
            <span className="hidden sm:block w-px h-6 bg-ink-200 dark:bg-ink-700 mx-0.5" aria-hidden="true" />
            <div className="relative shrink-0">
              <button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-ink-100/70 dark:hover:bg-ink-800 active:scale-95 transition-all cursor-pointer" onClick={() => setUserMenu(!userMenu)} aria-label="User menu">
                {user && <Avatar first={user.name.split(" ")[0]} last={user.name.split(" ")[1] ?? "V"} hue={user.hue} size={32} />}
                <Ic n="chevD" size={12} className={`hidden min-[440px]:block text-ink-400 transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`} />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="fixed inset-x-3 top-[62px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-56 z-50 panel pop-in shadow-pop overflow-hidden py-1.5">
                    <div className="px-4 py-2.5 border-b border-ink-100 dark:border-ink-800">
                      <div className="text-[13px] font-bold">{user?.name}</div>
                      <div className="text-[11.5px] text-ink-400">{user?.email}</div>
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer" onClick={() => { setUserMenu(false); nav("/app/settings"); }}><Ic n="settings" size={15} />{tt("Settings")}</button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer text-rose-600" onClick={onLogout}><Ic n="logout" size={15} />{tt("Sign out")}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="px-3 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-8 max-w-[1500px] mx-auto">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ink-100 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md shadow-[0_-8px_24px_-12px_rgb(10_18_38/0.18)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Mobile navigation">
        <div className="grid grid-cols-5">
          {mobileTabs.slice(0, 5).map((tb) => {
            const on = isOn(tb.to);
            return (
              <button key={tb.to} onClick={() => nav(tb.to)} aria-current={on ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 cursor-pointer group">
                {on && <span className="absolute top-0 inset-x-4 h-[2.5px] rounded-b-full bg-cobalt-600 dark:bg-cobalt-400" />}
                <span className={`w-10 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${on ? "bg-cobalt-600/15 dark:bg-cobalt-400/15 text-cobalt-700 dark:text-cobalt-300 scale-105" : "text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-200 group-active:scale-90"}`}>
                  <Ic n={tb.icon} size={19} />
                </span>
                <span className={`w-full px-0.5 truncate text-center text-[9.5px] font-extrabold tracking-wide transition-colors ${on ? "text-cobalt-700 dark:text-cobalt-300" : "text-ink-400"}`}>{tt(tb.label)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <GlobalSearch open={search} onClose={() => setSearch(false)} nav={nav} />
    </div>
  );
}
