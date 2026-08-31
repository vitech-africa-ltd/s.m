import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useApp, can, me, mutate, setPrefs, fmtDateShort } from "../lib/data";
import { Ic } from "../components/icons";
import { t, LANGS } from "../lib/i18n";
import { Avatar } from "../components/ui";

export interface NavItem { to: string; icon: string; label: string; perm?: string; superOnly?: boolean; portalOnly?: boolean }
export interface NavGroup { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { title: "overview", items: [
    { to: "/app", icon: "dashboard", label: "dashboard" },
    { to: "/app/portal", icon: "user", label: "portal", portalOnly: true },
    { to: "/app/analytics", icon: "analytics", label: "analytics", perm: "analytics" },
  ]},
  { title: "people", items: [
    { to: "/app/students", icon: "students", label: "students", perm: "students" },
    { to: "/app/admissions", icon: "userplus", label: "admissions", perm: "admissions" },
    { to: "/app/teachers", icon: "teacher", label: "teachers", perm: "teachers" },
    { to: "/app/hr", icon: "briefcase", label: "hr", perm: "hr" },
  ]},
  { title: "academics", items: [
    { to: "/app/classes", icon: "class", label: "classes", perm: "classes" },
    { to: "/app/subjects", icon: "subject", label: "subjects", perm: "classes" },
    { to: "/app/timetable", icon: "timetable", label: "timetable", perm: "timetable" },
    { to: "/app/attendance", icon: "attendance", label: "attendance", perm: "attendance" },
    { to: "/app/exams", icon: "exams", label: "exams", perm: "exams" },
    { to: "/app/grades", icon: "grades", label: "grades", perm: "grades" },
    { to: "/app/reportcards", icon: "award", label: "reports_cards", perm: "reports_cards" },
  ]},
  { title: "finance", items: [
    { to: "/app/fees", icon: "fees", label: "fees", perm: "fees" },
    { to: "/app/payments", icon: "payment", label: "payments", perm: "payments" },
    { to: "/app/invoices", icon: "receipt", label: "invoices", perm: "payments" },
    { to: "/app/expenses", icon: "expenses", label: "expenses", perm: "expenses" },
    { to: "/app/finreports", icon: "reports", label: "fin_reports", perm: "fin_reports" },
  ]},
  { title: "engagement", items: [
    { to: "/app/communication", icon: "comm", label: "communication", perm: "communication" },
    { to: "/app/announcements", icon: "megaphone", label: "announcements", perm: "communication" },
    { to: "/app/calendar", icon: "calendar", label: "calendar" },
    { to: "/app/library", icon: "book", label: "library", perm: "library" },
    { to: "/app/transport", icon: "bus", label: "transport", perm: "transport" },
  ]},
  { title: "management", items: [
    { to: "/app/documents", icon: "folder", label: "documents", perm: "documents" },
    { to: "/app/certificates", icon: "award", label: "certificates", perm: "certificates" },
    { to: "/app/idcards", icon: "idcard", label: "idcards", perm: "idcards" },
    { to: "/app/audit", icon: "audit", label: "audit", perm: "audit" },
    { to: "/app/backups", icon: "database", label: "backups", perm: "backups" },
    { to: "/app/settings", icon: "settings", label: "settings", perm: "settings" },
    { to: "/app/platform", icon: "globe", label: "platform", perm: "dashboard", superOnly: true },
  ]},
];

function GlobalSearch({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: (to: string) => void }) {
  const s = useApp();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => ref.current?.focus(), 30); } }, [open]);
  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (n.length < 2) return [];
    const out: { group: string; icon: string; title: string; sub: string; to: string }[] = [];
    s.db.students.filter((x) => `${x.first} ${x.last} ${x.regNo}`.toLowerCase().includes(n)).slice(0, 5)
      .forEach((x) => out.push({ group: "Students", icon: "students", title: `${x.first} ${x.last}`, sub: x.regNo, to: `/app/students?q=${encodeURIComponent(x.first + " " + x.last)}` }));
    s.db.teachers.filter((x) => `${x.first} ${x.last} ${x.empNo}`.toLowerCase().includes(n)).slice(0, 4)
      .forEach((x) => out.push({ group: "Teachers", icon: "teacher", title: `${x.first} ${x.last}`, sub: x.specialization, to: "/app/teachers" }));
    s.db.classes.filter((x) => `${x.name} ${x.section}`.toLowerCase().includes(n)).slice(0, 3)
      .forEach((x) => out.push({ group: "Classes", icon: "class", title: `${x.name} ${x.section}`, sub: `Room ${x.room}`, to: "/app/classes" }));
    s.db.payments.filter((x) => x.receipt.toLowerCase().includes(n)).slice(0, 4)
      .forEach((x) => { const st = s.db.students.find((y) => y.id === x.studentId); out.push({ group: "Payments", icon: "payment", title: x.receipt, sub: `${st?.first} ${st?.last} · ${x.amount.toLocaleString()} ${s.db.school.currency}`, to: "/app/payments" }); });
    s.db.documents.filter((x) => x.name.toLowerCase().includes(n)).slice(0, 3)
      .forEach((x) => out.push({ group: "Documents", icon: "folder", title: x.name, sub: x.category, to: "/app/documents" }));
    s.db.books.filter((x) => `${x.title} ${x.author}`.toLowerCase().includes(n)).slice(0, 3)
      .forEach((x) => out.push({ group: "Library", icon: "book", title: x.title, sub: x.author, to: "/app/library" }));
    return out.slice(0, 14);
  }, [q, s.db]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Global search">
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px] fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl panel pop-in overflow-hidden shadow-pop">
        <div className="flex items-center gap-3 px-4 border-b border-ink-100 dark:border-ink-800">
          <Ic n="search" className="text-ink-300" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students, teachers, receipts, documents…" className="flex-1 h-13 py-4 bg-transparent outline-none text-[15px]" onKeyDown={(e) => { if (e.key === "Enter" && results[0]) { nav(results[0].to); onClose(); } }} />
          <span className="kbd">ESC</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <div className="px-4 py-6 text-center text-[13px] text-ink-400 font-semibold">Type at least 2 characters — try “Keza”, “RC-2026” or “Physics”</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-ink-400 font-semibold">No matches for “{q}”</div>
          ) : results.map((r, i) => (
            <button key={i} onClick={() => { nav(r.to); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cobalt-50 dark:hover:bg-cobalt-500/10 transition-colors text-left cursor-pointer">
              <span className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 flex items-center justify-center shrink-0"><Ic n={r.icon} size={15} /></span>
              <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-bold truncate">{r.title}</span><span className="block text-[11.5px] text-ink-400 truncate">{r.sub}</span></span>
              <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-400">{r.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bell({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const [open, setOpen] = useState(false);
  const unread = s.db.notifications.filter((n) => !n.read).length;
  const icons: Record<string, string> = { payment: "payment", absent: "alert", admission: "userplus", fee: "coins", exam: "exams", system: "database" };
  return (
    <div className="relative">
      <button className="btn-g !px-2.5 relative" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Ic n="bell" size={19} />
        {unread > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center px-1">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-[340px] panel pop-in shadow-pop overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <b className="font-display text-[15px]">{t(s.prefs.lang, "notifications")}</b>
              <button className="text-[12px] font-bold text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer" onClick={() => mutate((db) => db.notifications.forEach((n) => (n.read = true)))}>Mark all read</button>
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {s.db.notifications.slice(0, 8).map((n) => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-ink-100/60 dark:border-ink-800/60 ${!n.read ? "bg-cobalt-500/[0.05]" : ""}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-ink-100 dark:bg-ink-800 text-ink-400" : "bg-cobalt-600 text-white"}`}><Ic n={icons[n.type] ?? "bell"} size={14} /></span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight">{n.title}</p>
                    <p className="text-[12px] text-ink-400 truncate">{n.body}</p>
                    <p className="text-[11px] text-ink-300 mt-0.5 font-semibold">{fmtDateShort(n.date)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-cobalt-500 mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 text-[12.5px] font-bold text-cobalt-600 dark:text-cobalt-400 hover:bg-ink-50 dark:hover:bg-ink-950 transition-colors cursor-pointer" onClick={() => { setOpen(false); nav("/app/communication"); }}>Open Communication Center</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Shell({ nav, path, children, onLogout }: { nav: (to: string) => void; path: string; children: ReactNode; onLogout: () => void }) {
  const s = useApp();
  const user = me(s);
  const lang = s.prefs.lang;
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [campus, setCampus] = useState(s.db.campuses.find((c) => c.active)?.name ?? "Campus Kigali");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((x) => !x); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { setDrawer(false); }, [path]);

  const role = user?.role;
  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((it) => {
    if (it.superOnly && role !== "super") return false;
    if (it.portalOnly && !["student", "parent"].includes(role ?? "") && !(role === "teacher")) return false;
    if (it.perm && role && role !== "super" && role !== "admin") { if (!can(role, it.perm)) return false; }
    if (["student", "parent"].includes(role ?? "") && !it.portalOnly && it.to !== "/app") return false;
    return true;
  }) })).filter((g) => g.items.length > 0);

  const isOn = (to: string) => (to === "/app" ? path === "/app" : path === to || path.startsWith(to + "/"));

  const SideContent = (
    <>
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/[0.07]">
        <span className="w-9 h-9 rounded-lg bg-gold-400 flex items-center justify-center text-ink-950 font-display font-bold text-lg">{(s.db.school.logoText || "V")[0]}</span>
        <div className="min-w-0">
          <div className="font-display font-bold text-[14.5px] text-white leading-tight truncate">{s.db.school.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">{s.db.school.academicYear} · {s.db.school.term}</div>
        </div>
      </div>
      <div className="px-3 pt-3">
        <div className="relative">
          <Ic n="building" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <select value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Campus"
            className="w-full h-9 pl-8 pr-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[12.5px] font-bold text-ink-200 appearance-none cursor-pointer focus:outline-none focus:border-cobalt-500">
            {s.db.campuses.filter((c) => c.active).map((c) => <option key={c.id} value={c.name} className="bg-ink-900">{c.name}</option>)}
          </select>
          <Ic n="chevD" size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="side-h">{t(lang, g.title)}</div>
            {g.items.map((it) => (
              <button key={it.to} onClick={() => nav(it.to)} className={`nav-i w-full mb-0.5 ${isOn(it.to) ? "on" : ""}`} aria-current={isOn(it.to) ? "page" : undefined}>
                <Ic n={it.icon} size={17} />{t(lang, it.label)}
                {it.to === "/app/admissions" && s.db.admissions.filter((a) => !["enrolled", "rejected"].includes(a.stage)).length > 0 &&
                  <span className="ml-auto chip !px-1.5 !py-0 bg-gold-400 text-ink-950">{s.db.admissions.filter((a) => !["enrolled", "rejected"].includes(a.stage)).length}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-bold text-ink-200"><Ic n="sparkles" size={14} className="text-gold-400" />Professional plan</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[62%] rounded-full bg-gold-400" /></div>
          <div className="text-[10.5px] text-ink-400 font-semibold mt-1.5">620 / 1,000 students · renews in 19 days</div>
        </div>
      </div>
    </>
  );

  const mobileTabs = [
    { to: "/app", icon: "dashboard", label: "Home" },
    { to: "/app/students", icon: "students", label: "Students", perm: "students" },
    { to: "/app/attendance", icon: "attendance", label: "Attendance", perm: "attendance" },
    { to: "/app/payments", icon: "payment", label: "Payments", perm: "payments" },
    { to: "/app/communication", icon: "comm", label: "Messages", perm: "communication" },
  ].filter((tb) => !tb.perm || can(role, tb.perm) || role === "super" || role === "admin");

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col side-bg border-r border-ink-800 z-40">{SideContent}</aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-ink-950/60 fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] flex flex-col side-bg shadow-pop pop-in">{SideContent}</aside>
        </div>
      )}

      {/* topbar */}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-50 h-16 flex items-center gap-2 px-4 sm:px-6 border-b border-ink-100 dark:border-ink-800 bg-paper/90 dark:bg-ink-950/90 backdrop-blur">
          <button className="lg:hidden btn-g !px-2" onClick={() => setDrawer(true)} aria-label="Open menu"><Ic n="menu" /></button>
          <button onClick={() => setSearch(true)} className="flex items-center gap-2.5 h-10 px-3.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-[13px] font-semibold text-ink-400 hover:border-cobalt-400 transition-colors cursor-pointer min-w-0 flex-1 max-w-md">
            <Ic n="search" size={16} /><span className="hidden sm:inline truncate">{t(lang, "search")}</span>
            <span className="ml-auto hidden sm:flex gap-1"><span className="kbd">Ctrl</span><span className="kbd">K</span></span>
          </button>
          <span className="hidden md:inline-flex chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 !px-3">{s.db.school.term} · {s.db.school.academicYear}</span>
          <div className="ml-auto flex items-center gap-1">
            <select className="input !w-auto !h-9 !text-[12px] font-bold hidden sm:block" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as typeof lang })} aria-label="Language">
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button className="btn-g !px-2.5" onClick={() => setPrefs({ theme: s.prefs.theme === "dark" ? "light" : "dark" })} aria-label="Toggle dark mode">
              <Ic n={s.prefs.theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <Bell nav={nav} />
            <div className="relative">
              <button className="flex items-center gap-2.5 pl-1.5 pr-1 h-11 rounded-lg hover:bg-ink-100/70 dark:hover:bg-ink-800 transition-colors cursor-pointer" onClick={() => setUserMenu(!userMenu)} aria-label="User menu">
                {user && <Avatar first={user.name.split(" ")[0]} last={user.name.split(" ")[1] ?? "V"} hue={user.hue} size={32} />}
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-[12.5px] font-bold">{user?.name}</span>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wide text-ink-400">{user?.role}</span>
                </span>
                <Ic n="chevD" size={13} className="text-ink-400" />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 panel pop-in shadow-pop overflow-hidden py-1.5">
                    <div className="px-4 py-2.5 border-b border-ink-100 dark:border-ink-800">
                      <div className="text-[13px] font-bold">{user?.name}</div>
                      <div className="text-[11.5px] text-ink-400">{user?.email}</div>
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer" onClick={() => { setUserMenu(false); nav("/app/settings"); }}><Ic n="settings" size={15} />Settings</button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer text-rose-600" onClick={onLogout}><Ic n="logout" size={15} />{t(lang, "logout")}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-6 pb-24 lg:pb-8 max-w-[1500px] mx-auto">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 grid grid-cols-5" aria-label="Mobile navigation">
        {mobileTabs.slice(0, 5).map((tb) => (
          <button key={tb.to} onClick={() => nav(tb.to)} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors cursor-pointer ${isOn(tb.to) ? "text-cobalt-600 dark:text-cobalt-300" : "text-ink-400"}`}>
            <Ic n={tb.icon} size={19} />{tb.label}
            {isOn(tb.to) && <span className="w-1 h-1 rounded-full bg-gold-400" />}
          </button>
        ))}
      </nav>

      <GlobalSearch open={search} onClose={() => setSearch(false)} nav={nav} />
    </div>
  );
}
