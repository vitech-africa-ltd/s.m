import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useApp, setSession, me, can, audit } from "./lib/data";
import { Ic } from "./components/icons";
import { Toaster, toast, PrintHost } from "./components/ui";
import Landing from "./pages/Landing";
import DownloadPage from "./pages/Download";
import { Login, Register, Forgot } from "./pages/Auth";
import Shell from "./pages/Shell";

/* Heavy management modules are code-split: they load only once a user signs in,
   which keeps the public pages (landing / login / download) fast on first paint. */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StudentsPage = lazy(() => import("./pages/Students"));
const AdmissionsPage = lazy(() => import("./pages/Students").then((m) => ({ default: m.AdmissionsPage })));
const TeachersPage = lazy(() => import("./pages/Teachers"));
const ClassesPage = lazy(() => import("./pages/Academics").then((m) => ({ default: m.ClassesPage })));
const SubjectsPage = lazy(() => import("./pages/Academics").then((m) => ({ default: m.SubjectsPage })));
const TimetablePage = lazy(() => import("./pages/Academics").then((m) => ({ default: m.TimetablePage })));
const AttendancePage = lazy(() => import("./pages/Attendance"));
const ExamsPage = lazy(() => import("./pages/ExamsGrades").then((m) => ({ default: m.ExamsPage })));
const GradesPage = lazy(() => import("./pages/ExamsGrades").then((m) => ({ default: m.GradesPage })));
const ReportCardsPage = lazy(() => import("./pages/ExamsGrades").then((m) => ({ default: m.ReportCardsPage })));
const FeesPage = lazy(() => import("./pages/Finance").then((m) => ({ default: m.FeesPage })));
const PaymentsPage = lazy(() => import("./pages/Finance").then((m) => ({ default: m.PaymentsPage })));
const InvoicesPage = lazy(() => import("./pages/Finance").then((m) => ({ default: m.InvoicesPage })));
const ExpensesPage = lazy(() => import("./pages/Finance").then((m) => ({ default: m.ExpensesPage })));
const FinReportsPage = lazy(() => import("./pages/Finance").then((m) => ({ default: m.FinReportsPage })));
const CommunicationPage = lazy(() => import("./pages/Communication"));
const AnnouncementsPage = lazy(() => import("./pages/Communication").then((m) => ({ default: m.AnnouncementsPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LibraryPage = lazy(() => import("./pages/More").then((m) => ({ default: m.LibraryPage })));
const TransportPage = lazy(() => import("./pages/More").then((m) => ({ default: m.TransportPage })));
const HRPage = lazy(() => import("./pages/More").then((m) => ({ default: m.HRPage })));
const DocumentsPage = lazy(() => import("./pages/More").then((m) => ({ default: m.DocumentsPage })));
const CertificatesPage = lazy(() => import("./pages/More").then((m) => ({ default: m.CertificatesPage })));
const VerifyPage = lazy(() => import("./pages/More").then((m) => ({ default: m.VerifyPage })));
const IDCardsPage = lazy(() => import("./pages/More").then((m) => ({ default: m.IDCardsPage })));
const AuditPage = lazy(() => import("./pages/More").then((m) => ({ default: m.AuditPage })));
const BackupsPage = lazy(() => import("./pages/More").then((m) => ({ default: m.BackupsPage })));
const AnalyticsPage = lazy(() => import("./pages/More").then((m) => ({ default: m.AnalyticsPage })));
const PlatformPage = lazy(() => import("./pages/More").then((m) => ({ default: m.PlatformPage })));
const StudentPortal = lazy(() => import("./pages/Portals").then((m) => ({ default: m.StudentPortal })));
const ParentPortal = lazy(() => import("./pages/Portals").then((m) => ({ default: m.ParentPortal })));
const TeacherPortal = lazy(() => import("./pages/Portals").then((m) => ({ default: m.TeacherPortal })));
const HelpPage = lazy(() => import("./pages/Help"));
const SetupPage = lazy(() => import("./pages/Setup"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <span className="w-9 h-9 rounded-full border-[3px] border-cobalt-200 dark:border-cobalt-900 border-t-cobalt-600 dark:border-t-cobalt-400 animate-spin" />
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-400">Loading module…</span>
      </div>
    </div>
  );
}

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

function Portal({ user, nav }: { user: string; nav: (to: string) => void }) {
  if (user === "student") return <StudentPortal nav={nav} />;
  if (user === "parent") return <ParentPortal />;
  if (user === "teacher") return <TeacherPortal nav={nav} />;
  return <Dashboard nav={nav} />;
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
  useEffect(() => {
    const off = () => toast("You are offline — changes are saved locally.", "info");
    const on = () => toast("Back online — everything is in sync.", "ok");
    window.addEventListener("offline", off); window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, []);

  const [path, query] = hash.split("?");
  const qParam = new URLSearchParams(query ?? "").get("q") ?? "";

  /* public routes */
  if (path === "/" || path === "") return <><Landing nav={nav} /><PrintHost /><Toaster /></>;
  if (path === "/download") return <><DownloadPage nav={nav} /><PrintHost /><Toaster /></>;
  if (path === "/login") return <><Login nav={nav} onDone={() => nav("/app")} /><PrintHost /><Toaster /></>;
  if (path === "/register") return <><Register nav={nav} onDone={() => nav("/app")} /><PrintHost /><Toaster /></>;
  if (path === "/forgot") return <><Forgot nav={nav} /><PrintHost /><Toaster /></>;
  if (path === "/reset") return <><Forgot nav={nav} reset /><PrintHost /><Toaster /></>;
  if (path === "/verify") return <><Suspense fallback={<PageLoader />}><VerifyPage nav={nav} /></Suspense><PrintHost /><Toaster /></>;

  if (!user) return <><Login nav={nav} onDone={() => nav("/app")} /><PrintHost /><Toaster /></>;

  /* permission guard */
  const needsPerm: Record<string, string> = {
    "/app/students": "students", "/app/admissions": "admissions", "/app/teachers": "teachers", "/app/hr": "hr",
    "/app/classes": "classes", "/app/timetable": "timetable", "/app/attendance": "attendance", "/app/exams": "exams",
    "/app/grades": "grades", "/app/reportcards": "reports_cards", "/app/fees": "fees", "/app/payments": "payments",
    "/app/invoices": "payments", "/app/expenses": "expenses", "/app/finreports": "fin_reports",
    "/app/communication": "communication", "/app/announcements": "communication", "/app/library": "library",
    "/app/transport": "transport", "/app/documents": "documents", "/app/certificates": "certificates",
    "/app/idcards": "idcards", "/app/audit": "audit", "/app/backups": "backups", "/app/analytics": "analytics",
    "/app/settings": "settings",
  };
  if (path.startsWith("/app") && path !== "/app" && path !== "/app/portal") {
    const perm = needsPerm[path];
    if (perm && user.role !== "super" && user.role !== "admin" && !can(user.role, perm))
      return <><ErrorPage code="403" title="Access restricted" body={`Your role (${user.role}) does not have permission to view this module. Contact your administrator.`} nav={nav} /><PrintHost /><Toaster /></>;
  }

  const page = (() => {
    switch (path) {
      case "/app": return <Portal user={user.role} nav={nav} />;
      case "/app/portal": return <Portal user={user.role} nav={nav} />;
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
      <Shell nav={nav} path={path} onLogout={logout}><Suspense fallback={<PageLoader />}>{page}</Suspense></Shell>
      <PrintHost />
      <Toaster />
    </>
  );
}
