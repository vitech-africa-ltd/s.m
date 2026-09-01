import { useEffect, useState, useCallback } from "react";
import { useApp, setSession, me, can, audit, setPrefs } from "./lib/data";
import { Ic } from "./components/icons";
import { Toaster, toast, PrintHost } from "./components/ui";
import HelpPage from "./pages/Help";
import SetupPage from "./pages/Setup";
import Landing from "./pages/Landing";
import { Login, Register, Forgot } from "./pages/Auth";
import Shell from "./pages/Shell";
import Dashboard from "./pages/Dashboard";
import StudentsPage, { AdmissionsPage } from "./pages/Students";
import TeachersPage from "./pages/Teachers";
import { ClassesPage, SubjectsPage, TimetablePage } from "./pages/Academics";
import AttendancePage from "./pages/Attendance";
import { ExamsPage, GradesPage, ReportCardsPage } from "./pages/ExamsGrades";
import { FeesPage, PaymentsPage, InvoicesPage, ExpensesPage, FinReportsPage } from "./pages/Finance";
import CommunicationPage, { AnnouncementsPage } from "./pages/Communication";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import { LibraryPage, TransportPage, HRPage, DocumentsPage, CertificatesPage, VerifyPage, IDCardsPage, AuditPage, BackupsPage, AnalyticsPage, PlatformPage } from "./pages/More";
import DownloadPage from "./pages/Download";
import { StudentPortal, ParentPortal, TeacherPortal } from "./pages/Portals";

const useHash = () => {
  const [h, setH] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const f = () => setH(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return h;
};

function ErrorPage({ code, title, body, nav }: { code: string; title: string; body: string; nav: (to: string) => void }) {
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display font-bold text-[92px] leading-none text-ink-950 dark:text-ink-100">{code}<span className="text-gold-400">.</span></div>
        <h1 className="font-display text-[24px] font-bold mt-2">{title}</h1>
        <p className="text-[14px] text-ink-400 mt-2">{body}</p>
        <div className="flex justify-center gap-2.5 mt-6">
          <button className="btn-p" onClick={() => nav("/app")}><Ic n="dashboard" size={15} />Go to dashboard</button>
          <button className="btn-o" onClick={() => nav("/")}><Ic n="chevL" size={15} />Home</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const s = useApp();
  const hash = useHash();
  const user = me(s);
  const nav = useCallback((to: string) => { window.location.hash = to; window.scrollTo({ top: 0 }); }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", s.prefs.theme === "dark");
  }, [s.prefs.theme]);
  useEffect(() => { document.documentElement.lang = s.prefs.lang; }, [s.prefs.lang]);

  /* offline detection */
  useEffect(() => {
    const off = () => toast("You are offline — changes are saved locally and will sync.", "info");
    const on = () => toast("Back online — everything is in sync.", "ok");
    window.addEventListener("offline", off); window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, []);

  const [path, query] = hash.split("?");
  const qParam = new URLSearchParams(query ?? "").get("q") ?? "";

  /* public routes */
  if (path === "/" || path === "") return <><Landing nav={nav} /><Toaster /></>;
  if (path === "/login") return <><Login nav={nav} onDone={() => nav("/app")} /><Toaster /></>;
  if (path === "/register") return <><Register nav={nav} onDone={() => nav("/app")} /><Toaster /></>;
  if (path === "/forgot") return <><Forgot nav={nav} /><Toaster /></>;
  if (path === "/reset") return <><Forgot nav={nav} reset /><Toaster /></>;
  if (path === "/verify") return <><VerifyPage nav={nav} /><Toaster /></>;
  if (path === "/download") return <><DownloadPage nav={nav} /><Toaster /></>;

  if (!user) return <><Login nav={nav} onDone={() => nav("/app")} /><Toaster /></>;

  /* permission guard */
  const needsPerm: Record<string, string> = {
    "/app/students": "students", "/app/admissions": "admissions", "/app/teachers": "teachers", "/app/hr": "hr",
    "/app/classes": "classes", "/app/timetable": "timetable", "/app/attendance": "attendance", "/app/exams": "exams",
    "/app/grades": "grades", "/app/reportcards": "reports_cards", "/app/fees": "fees", "/app/payments": "payments",
    "/app/invoices": "payments", "/app/expenses": "expenses", "/app/finreports": "fin_reports",
    "/app/communication": "communication", "/app/announcements": "communication", "/app/library": "library",
    "/app/transport": "transport", "/app/documents": "documents", "/app/certificates": "certificates",
    "/app/idcards": "idcards", "/app/audit": "audit", "/app/backups": "backups", "/app/analytics": "analytics",
    "/app/settings": "settings", "/app/help": "dashboard", "/app/setup": "settings",
  };
  if (path.startsWith("/app") && path !== "/app") {
    const perm = needsPerm[path];
    if (perm && user.role !== "super" && user.role !== "admin" && !can(user.role, perm))
      return <><ErrorPage code="403" title="Access restricted" body={`Your role (${user.role}) does not have permission to view this module. Contact your administrator if you believe this is a mistake.`} nav={nav} /><Toaster /></>;
  }

  const portalHome = user.role === "student" || user.role === "parent" ? <ParentOrStudent user={user.role} nav={nav} /> : user.role === "teacher" ? <TeacherPortal nav={nav} /> : <Dashboard nav={nav} />;

  const page = (() => {
    switch (path) {
      case "/app": return portalHome;
      case "/app/portal": return user.role === "teacher" ? <TeacherPortal nav={nav} /> : <ParentOrStudent user={user.role} nav={nav} />;
      case "/app/students": return <StudentsPage nav={nav} query={qParam} />;
      case "/app/admissions": return <AdmissionsPage />;
      case "/app/teachers": return <TeachersPage />;
      case "/app/hr": return <HRPage />;
      case "/app/classes": return <ClassesPage />;
      case "/app/subjects": return <SubjectsPage />;
      case "/app/timetable": return <TimetablePage />;
      case "/app/attendance": return <AttendancePage />;
      case "/app/exams": return <ExamsPage />;
      case "/app/grades": return <GradesPage />;
      case "/app/reportcards": return <ReportCardsPage />;
      case "/app/fees": return <FeesPage />;
      case "/app/payments": return <PaymentsPage />;
      case "/app/invoices": return <InvoicesPage />;
      case "/app/expenses": return <ExpensesPage />;
      case "/app/finreports": return <FinReportsPage />;
      case "/app/communication": return <CommunicationPage />;
      case "/app/announcements": return <AnnouncementsPage />;
      case "/app/calendar": return <CalendarPage />;
      case "/app/library": return <LibraryPage />;
      case "/app/transport": return <TransportPage />;
      case "/app/documents": return <DocumentsPage />;
      case "/app/certificates": return <CertificatesPage />;
      case "/app/idcards": return <IDCardsPage />;
      case "/app/audit": return <AuditPage />;
      case "/app/backups": return <BackupsPage />;
      case "/app/analytics": return <AnalyticsPage />;
      case "/app/platform": return user.role === "super" ? <PlatformPage /> : <ErrorPage code="403" title="Super Admin only" body="The platform control panel is reserved for the SaaS owner." nav={nav} />;
      case "/app/settings": return <SettingsPage />;
      case "/app/help": return <HelpPage />;
      case "/app/setup": return user.role === "super" || user.role === "admin" ? <SetupPage nav={nav} /> : <ErrorPage code="403" title="Administrators only" body="The setup wizard is reserved for school administrators." nav={nav} />;
      default: return <ErrorPage code="404" title="Page not found" body="The page you are looking for doesn't exist or was moved." nav={nav} />;
    }
  })();

  const logout = () => {
    audit("LOGOUT", "Auth", `${user.name} signed out`);
    setSession(null);
    nav("/");
  };

  return (
    <>
      <Shell nav={nav} path={path} onLogout={logout}>{page}</Shell>
      <PrintHost />
      <Toaster />
    </>
  );
}

function ParentOrStudent({ user, nav }: { user: string; nav: (to: string) => void }) {
  void setPrefs;
  return user === "student" ? <StudentPortal nav={nav} /> : <ParentPortal />;
}
