import { useState, useEffect } from "react";
import { useApp, me, setPrefs, can } from "../lib/data";
import { Ic } from "../components/icons";
import { useT, LANGS } from "../lib/i18n";
import { Avatar } from "../components/ui";

export default function Shell({ nav, path, children, onLogout }: { nav: (to: string) => void; path: string; children: React.ReactNode; onLogout: () => void }) {
  const s = useApp();
  const tt = useT();
  const user = me(s);
  const lang = s.prefs.lang;
  const [drawer, setDrawer] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearch(true); }
      if (e.key === "Escape") { setSearch(false); setUserMenu(false); setDrawer(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!user) return null;

  const role = user.role;
  interface NavItem {
    to: string;
    icon: string;
    label: string;
    short?: string;
    perm?: string;
    portalOnly?: boolean;
    superOnly?: boolean;
  }
  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const NAV: NavGroup[] = [
    { title: "Overview", items: [
      { to: "/app", icon: "dashboard", label: "Dashboard", short: "Home", perm: "dashboard" },
      { to: "/app/portal", icon: "user", label: "My Portal", short: "Portal", portalOnly: true },
      { to: "/app/analytics", icon: "analytics", label: "Analytics", short: "Stats", perm: "analytics" },
    ]},
    { title: "People", items: [
      { to: "/app/students", icon: "students", label: "Students", short: "Students", perm: "students" },
      { to: "/app/admissions", icon: "userplus", label: "Admissions", short: "Admit", perm: "admissions" },
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
      { to: "/app/elearning", icon: "learn", label: "E-Learning", short: "Learn", perm: "elearning" },
    ]},
    { title: "Finance", items: [
      { to: "/app/fees", icon: "fees", label: "Fees & Structures", short: "Fees", perm: "fees" },
      { to: "/app/payments", icon: "payment", label: "Payments", short: "Pay", perm: "payments" },
      { to: "/app/invoices", icon: "receipt", label: "Invoices", short: "Inv", perm: "payments" },
      { to: "/app/expenses", icon: "expenses", label: "Expenses", short: "Exp", perm: "expenses" },
      { to: "/app/finreports", icon: "reports", label: "Financial Reports", short: "Fin", perm: "fin_reports" },
    ]},
    { title: "Engagement", items: [
      { to: "/app/communication", icon: "comm", label: "Communication", short: "Comm", perm: "communication" },
      { to: "/app/chat", icon: "chat", label: "Messages", short: "Chat", perm: "chat" },
      { to: "/app/announcements", icon: "megaphone", label: "Announcements", short: "News", perm: "communication" },
      { to: "/app/calendar", icon: "calendar", label: "Calendar", short: "Cal" },
      { to: "/app/library", icon: "book", label: "Library", short: "Lib", perm: "library" },
      { to: "/app/transport", icon: "bus", label: "Transport", short: "Bus", perm: "transport" },
    ]},
    { title: "Management", items: [
      { to: "/app/documents", icon: "folder", label: "Documents", short: "Docs", perm: "documents" },
      { to: "/app/certificates", icon: "award", label: "Certificates", short: "Certs", perm: "certificates" },
      { to: "/app/idcards", icon: "idcard", label: "ID cards", short: "IDs", perm: "idcards" },
      { to: "/app/audit", icon: "audit", label: "Audit logs", short: "Audit", perm: "audit" },
      { to: "/app/backups", icon: "database", label: "Backups", short: "Back", perm: "backups" },
      { to: "/app/settings", icon: "settings", label: "Settings", short: "Set", perm: "settings" },
      { to: "/app/profile", icon: "user", label: "Profile", short: "Profile", perm: "profile" },
      { to: "/app/platform", icon: "globe", label: "Platform (SaaS)", short: "SaaS", perm: "dashboard", superOnly: true },
      { to: "/app/help", icon: "help", label: "Help & Support", short: "Help" },
    ]},
  ];

  const isOn = (to: string) => path === to || (to !== "/app" && path.startsWith(to));
  const visibleItems = NAV.flatMap((g) => g.items.filter((it) => {
    if (it.portalOnly && user.role !== "student" && user.role !== "parent" && user.role !== "teacher") return false;
    if (it.superOnly && user.role !== "super") return false;
    if (it.perm && !can(role, it.perm) && user.role !== "super" && user.role !== "admin") return false;
    return true;
  }));

  const SideContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex items-center gap-2.5 border-b border-white/[0.08]">
        <span className="w-9 h-9 rounded-lg bg-gold-400 text-ink-950 flex items-center justify-center font-display font-bold text-lg shrink-0">V</span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-[14.5px] truncate">{s.db.school.name}</div>
          <div className="text-[10px] text-ink-400 truncate">{s.db.school.academicYear} · {s.db.school.term}</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {NAV.map((g) => {
          const items = g.items.filter((it) => {
            if (it.portalOnly && user.role !== "student" && user.role !== "parent" && user.role !== "teacher") return false;
            if (it.superOnly && user.role !== "super") return false;
            if (it.perm && !can(role, it.perm) && user.role !== "super" && user.role !== "admin") return false;
            return true;
          });
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <div className="side-h">{tt(g.title)}</div>
              {items.map((it) => (
                <button key={it.to} onClick={() => { nav(it.to); setDrawer(false); }} className={`nav-i w-full mb-0.5 ${isOn(it.to) ? "on" : ""}`} aria-current={isOn(it.to) ? "page" : undefined}>
                  <Ic n={it.icon} size={17} />
                  <span className="flex-1 text-left truncate">{tt(it.label)}</span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.08] p-3 flex items-center gap-2">
        <select value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label={tt("Language")}
          className="flex-1 h-9 rounded-lg bg-white/[0.07] border border-white/[0.1] text-[12px] font-bold text-ink-200 px-2 focus:outline-none focus:border-cobalt-500 cursor-pointer">
          {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-ink-900">{l.native}</option>)}
        </select>
        <button className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/[0.1] text-ink-200 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors" onClick={() => setPrefs({ theme: s.prefs.theme === "dark" ? "light" : "dark" })} aria-label="Toggle dark mode">
          <Ic n={s.prefs.theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col side-bg text-ink-100 z-40">
        {SideContent}
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-ink-950/60 fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] flex flex-col side-bg shadow-pop pop-in">
            <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/[0.08] text-ink-300 hover:text-white hover:bg-white/15 flex items-center justify-center cursor-pointer transition-colors" onClick={() => setDrawer(false)} aria-label="Close menu"><Ic n="x" size={16} /></button>
            <div className="flex-1 flex flex-col min-h-0">{SideContent}</div>
          </aside>
        </div>
      )}

      {/* topbar */}
      <div className="lg:pl-[248px]">
        <header className={`sticky top-0 z-50 h-14 lg:h-16 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 border-b transition-all duration-300 ${"bg-white/95 dark:bg-ink-900/95 backdrop-blur-md shadow-panel border-ink-200/70 dark:border-ink-800"}`}>
          <button className="lg:hidden btn-g !px-2" onClick={() => setDrawer(true)} aria-label="Open menu"><Ic n="menu" /></button>

          <button onClick={() => nav("/app")} className="lg:hidden flex items-center gap-2.5 min-w-0 cursor-pointer group" aria-label={tt("Dashboard")}>
            <span className="w-8 h-8 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[14px] shrink-0 group-hover:scale-105 transition-transform">{(s.db.school.logoText || "V")[0]}</span>
            <span className="min-w-0 text-left leading-tight flex-1">
              <span className="block font-display font-bold text-[13.5px] truncate group-hover:text-cobalt-700 dark:group-hover:text-cobalt-300 transition-colors">{tt(visibleItems.find((it) => isOn(it.to))?.label ?? "Dashboard")}</span>
              <span className="hidden sm:block text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink-400 truncate">{s.db.school.short} · {s.db.school.term}</span>
            </span>
          </button>

          <button onClick={() => setSearch(true)} aria-label={tt("Search anything…")} title={`${tt("Search anything…")} (Ctrl+K)`}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer">
            <Ic n="search" size={17} />
          </button>
          <button onClick={() => setSearch(true)} className="hidden lg:flex items-center gap-2.5 h-10 px-3.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-[13px] font-semibold text-ink-400 hover:border-cobalt-400 hover:shadow-panel transition-all cursor-pointer w-64 xl:w-80">
            <Ic n="search" size={16} /><span className="truncate">{tt("Search anything…")}</span>
            <span className="ml-auto flex gap-1"><span className="kbd">Ctrl</span><span className="kbd">K</span></span>
          </button>

          <span className="hidden xl:inline-flex chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 !px-3 ml-1">{s.db.school.term} · {s.db.school.academicYear}</span>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" onClick={() => setPrefs({ theme: s.prefs.theme === "dark" ? "light" : "dark" })} aria-label="Toggle dark mode" title={s.prefs.theme === "dark" ? "Light mode" : "Dark mode"}>
              <Ic n={s.prefs.theme === "dark" ? "sun" : "moon"} size={17} />
            </button>
            <div className="relative">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-300 hover:bg-ink-100/80 dark:hover:bg-ink-800 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" aria-label={tt("Notifications")}>
                <Ic n="bell" size={17} />
              </button>
            </div>
            <span className="hidden sm:block w-px h-6 bg-ink-200 dark:bg-ink-700 mx-1" aria-hidden="true" />
            <div className="relative">
              <button className="flex items-center gap-2 pl-1 pr-1.5 h-11 rounded-lg hover:bg-ink-100/70 dark:hover:bg-ink-800 transition-colors cursor-pointer" onClick={() => setUserMenu(!userMenu)} aria-label="User menu">
                {user && <Avatar first={user.name.split(" ")[0]} last={user.name.split(" ")[1] ?? "V"} hue={user.hue} size={32} />}
                <span className="hidden xl:block text-left leading-tight">
                  <span className="block text-[12.5px] font-bold">{user?.name}</span>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wide text-ink-400">{user?.role}</span>
                </span>
                <Ic n="chevD" size={13} className={`text-ink-400 transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`} />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 panel pop-in shadow-pop overflow-hidden py-1.5">
                    <div className="px-4 py-2.5 border-b border-ink-100 dark:border-ink-800">
                      <div className="font-display font-bold text-[13.5px]">{user?.name}</div>
                      <div className="text-[11.5px] text-ink-400 truncate">{s.db.users.find((u) => u.id === user?.id)?.email}</div>
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer" onClick={() => { setUserMenu(false); nav("/app/settings"); }}><Ic n="settings" size={15} />{tt("Settings")}</button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer text-rose-600" onClick={onLogout}><Ic n="logout" size={15} />{tt("Sign out")}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-6 py-5 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ink-100 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md shadow-[0_-8px_24px_-12px_rgb(10_18_38/0.18)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Mobile navigation">
        <div className="grid grid-cols-5">
          {visibleItems.slice(0, 5).map((tb) => {
            const on = isOn(tb.to);
            return (
              <button key={tb.to} onClick={() => nav(tb.to)} aria-current={on ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 cursor-pointer group">
                {on && <span className="absolute top-0 inset-x-4 h-[2.5px] rounded-b-full bg-cobalt-600 dark:bg-cobalt-400" />}
                <span className={`w-10 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${on ? "bg-cobalt-600/12 dark:bg-cobalt-400/15 text-cobalt-700 dark:text-cobalt-300 scale-105" : "text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-200 group-active:scale-90"}`}>
                  <Ic n={tb.icon} size={19} />
                </span>
                <span className={`w-full px-0.5 truncate text-center text-[9.5px] font-extrabold tracking-wide transition-colors ${on ? "text-cobalt-700 dark:text-cobalt-300" : "text-ink-400"}`}>{tt(tb.short ?? tb.label)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* search modal */}
      {search && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm fade-in" onClick={() => setSearch(false)} />
          <div className="relative w-full max-w-2xl panel pop-in shadow-pop overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-100 dark:border-ink-800">
              <Ic n="search" size={18} className="text-ink-400 shrink-0" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tt("Search anything…")} className="flex-1 bg-transparent outline-none text-[15px]" />
              <button className="btn-g !px-2" onClick={() => setSearch(false)} aria-label="Close"><Ic n="x" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {q.trim() ? (
                <div className="p-4">
                  <p className="text-[13px] text-ink-400">Search results for "{q}"</p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-[13px] text-ink-400">Start typing to search…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
