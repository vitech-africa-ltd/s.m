import { useSyncExternalStore } from "react";

/* ============================== Types ============================== */
export type Lang = "en" | "fr" | "es" | "pt" | "ar";
export const LANG_CODES: Lang[] = ["en", "fr", "es", "pt", "ar"];
export type Role =
  | "super" | "admin" | "principal" | "accountant" | "teacher" | "student"
  | "parent" | "registrar" | "reception" | "librarian" | "transport" | "hr";

export interface User { id: string; name: string; email: string; pass: string; role: Role; twoFA?: boolean; linkId?: string; hue: number; lastLogin?: string; }
export interface GradeScale { grade: string; min: number; label: string; }
export interface SchoolSettings {
  name: string; short: string; logoText: string; motto: string; address: string; phone: string; email: string; website: string;
  country: string; currency: string; timezone: string; dateFormat: string; academicYear: string; term: string; terms: string[];
  brandColor: string; receiptPrefix: string; regPrefix: string; grading: GradeScale[]; passMark: number;
  onboarded?: boolean;
}
export interface Campus { id: string; name: string; city: string; active: boolean; }
export interface Student {
  id: string; regNo: string; first: string; last: string; gender: "M" | "F"; dob: string; nationality: string; phone: string;
  email: string; address: string; prevSchool: string; admitted: string; classId: string;
  status: "active" | "pending" | "graduated" | "archived" | "transferred";
  parent: { name: string; relation: string; phone: string; email: string; occupation: string; emergency: string };
  hue: number; ability: number;
}
export interface Admission { id: string; appNo: string; first: string; last: string; gender: "M" | "F"; dob: string; applyClass: string; parent: string; phone: string; prevSchool: string; date: string; stage: "applied" | "review" | "interview" | "approved" | "enrolled" | "rejected"; note?: string; }
export interface Teacher { id: string; empNo: string; first: string; last: string; gender: "M" | "F"; phone: string; email: string; qualification: string; specialization: string; hireDate: string; salary: number; bank: string; subjects: string[]; classIds: string[]; status: "active" | "leave"; hue: number; }
export interface ClassSec { id: string; name: string; section: string; level: number; room: string; capacity: number; teacherId: string; }
export interface Subject { id: string; name: string; code: string; credits: number; teacherIds: string[]; classLevels: number[]; }
export interface TTSlot { id: string; classId: string; subjectId: string; teacherId: string; room: string; day: number; start: string; end: string; }
export interface Exam { id: string; name: string; term: string; date: string; status: "completed" | "ongoing" | "scheduled"; classLevels: number[]; subjectIds: string[]; maxScore: number; }
export interface Grade { id: string; examId: string; studentId: string; subjectId: string; score: number; }
export interface FeeItem { id: string; name: string; amount: number; }
export interface FeeStructure { level: number; items: FeeItem[]; }
export interface Payment { id: string; receipt: string; studentId: string; amount: number; method: "Cash" | "Bank" | "Mobile Money" | "Card" | "Transfer"; feeType: string; date: string; note?: string; by: string; }
export interface Expense { id: string; category: string; desc: string; amount: number; date: string; vendor: string; method: string; by: string; }
export interface Announcement { id: string; title: string; body: string; audience: string; date: string; scheduled?: string; by: string; pinned?: boolean; }
export interface MsgTemplate { id: string; name: string; channel: "SMS" | "WhatsApp" | "Email"; body: string; }
export interface CommLog { id: string; channel: "SMS" | "WhatsApp" | "Email" | "Push"; to: string; body: string; date: string; status: "sent" | "delivered" | "failed"; }
export interface Notice { id: string; type: string; title: string; body: string; date: string; read: boolean; }
export interface SchoolEvent { id: string; title: string; date: string; kind: "exam" | "holiday" | "meeting" | "sports" | "event" | "graduation"; note?: string; }
export interface Book { id: string; title: string; author: string; category: string; isbn: string; copies: number; available: number; }
export interface Loan { id: string; bookId: string; borrower: string; type: "student" | "teacher"; date: string; due: string; returned?: string; fine: number; }
export interface Vehicle { id: string; plate: string; model: string; capacity: number; driver: string; insurance: string; status: "active" | "maintenance"; routeId: string; }
export interface RouteT { id: string; name: string; stops: string[]; fee: number; students: number; }
export interface Staff { id: string; empNo: string; name: string; dept: string; position: string; phone: string; hired: string; salary: number; status: "active" | "leave"; }
export interface Leave { id: string; staffName: string; type: string; from: string; to: string; status: "pending" | "approved" | "rejected"; }
export interface Doc { id: string; name: string; category: string; size: string; date: string; by: string; kind: "pdf" | "img" | "xls" | "doc"; }
export interface Certificate { id: string; code: string; type: string; recipient: string; date: string; note: string; valid: boolean; }
export interface Audit { id: string; user: string; role: string; action: string; entity: string; detail: string; date: string; ip: string; device: string; }
export interface Backup { id: string; date: string; size: string; type: "auto" | "manual"; status: "ok"; }
export interface Plan { id: string; name: string; price: number; period: string; students: number | "Unlimited"; teachers: number | "Unlimited"; storage: string; sms: number | "Unlimited"; features: string[]; highlight?: boolean; }
export interface TenantSchool { id: string; name: string; city: string; plan: string; students: number; status: "active" | "trial" | "suspended"; mrr: number; joined: string; }
export interface UpdateEntry { id: string; from: string; to: string; date: string; size: string; status: "ok" | "rolled-back"; }
export interface SystemInfo { version: string; channel: "stable" | "beta"; autoUpdate: boolean; available: string | null; history: UpdateEntry[]; }

export interface DB {
  v: number; school: SchoolSettings; campuses: Campus[]; users: User[]; rolePerms: Record<string, string[]>;
  students: Student[]; admissions: Admission[]; teachers: Teacher[]; classes: ClassSec[]; subjects: Subject[];
  timetable: TTSlot[]; attendanceOverrides: Record<string, string>; exams: Exam[]; grades: Grade[];
  feeStructures: FeeStructure[]; payments: Payment[]; expenses: Expense[]; announcements: Announcement[];
  templates: MsgTemplate[]; commLogs: CommLog[]; notifications: Notice[]; events: SchoolEvent[]; books: Book[];
  loans: Loan[]; vehicles: Vehicle[]; routes: RouteT[]; staff: Staff[]; leaves: Leave[]; documents: Doc[];
  certificates: Certificate[]; audits: Audit[]; backups: Backup[]; plans: Plan[]; tenants: TenantSchool[];
  system: SystemInfo;
}
export interface AppState { db: DB; session: { userId: string } | null; prefs: { theme: "light" | "dark"; lang: Lang }; }

/* ============================== Utils ============================== */
export const uid = () => Math.random().toString(36).slice(2, 10);
const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const daysAhead = (n: number) => daysAgo(-n);
const LOCALES: Record<string, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES", pt: "pt-PT", ar: "ar" };
export const uiLocale = () => LOCALES[(state as AppState | null)?.prefs.lang ?? "en"] ?? "en-GB";
const dOf = (iso: string) => new Date(iso.includes("T") || iso.includes(" ") ? iso : iso + "T12:00:00");
export const fmtDate = (iso: string) => dOf(iso).toLocaleDateString(uiLocale(), { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateShort = (iso: string) => dOf(iso).toLocaleDateString(uiLocale(), { day: "2-digit", month: "short" });
export const monthLabel = (key: string) => new Date(key + "-15T12:00:00").toLocaleDateString(uiLocale(), { month: "short" });
/* ============================== Currencies & FX ============================== */
export interface CurrencyDef { code: string; name: string; symbol: string; rate: number; flag: string; }
export const CURRENCIES: CurrencyDef[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1, flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79, flag: "🇬🇧" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", rate: 1300, flag: "🇷🇼" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", rate: 2850, flag: "🇨🇩" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 129, flag: "🇰🇪" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", rate: 3700, flag: "🇺🇬" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", rate: 2600, flag: "🇹🇿" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", rate: 2950, flag: "🇧🇮" },
  { code: "XAF", name: "Central African CFA", symbol: "FCFA", rate: 605, flag: "🇨🇲" },
  { code: "XOF", name: "West African CFA", symbol: "CFA", rate: 605, flag: "🇸🇳" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1550, flag: "🇳🇬" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", rate: 15.6, flag: "🇬🇭" },
  { code: "ZAR", name: "South African Rand", symbol: "R", rate: 18.2, flag: "🇿🇦" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "DH", rate: 10.1, flag: "🇲🇦" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", rate: 49, flag: "🇪🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "AED ", rate: 3.67, flag: "🇦🇪" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 83.5, flag: "🇮🇳" },
];
export const CURRENCY_MAP: Record<string, CurrencyDef> = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));
export const convert = (v: number, from: string, to: string) => v * ((CURRENCY_MAP[to]?.rate ?? 1) / (CURRENCY_MAP[from]?.rate ?? 1));
export const fxRateLabel = (from: string, to: string) => {
  const r = (CURRENCY_MAP[to]?.rate ?? 1) / (CURRENCY_MAP[from]?.rate ?? 1);
  const shown = r >= 100 ? Math.round(r).toLocaleString("en-US") : r >= 1 ? r.toFixed(2) : r.toFixed(4);
  return `1 ${from} = ${shown} ${to}`;
};
const roundSmart = (v: number, rate: number) => (rate >= 500 ? Math.round(v / 100) * 100 : rate >= 50 ? Math.round(v / 10) * 10 : Math.round(v * 100) / 100);
export const fmtMoney = (n: number, cur: string) => {
  const c = CURRENCY_MAP[cur];
  const num = new Intl.NumberFormat(uiLocale(), { maximumFractionDigits: 0 }).format(Math.round(n));
  return c ? `${c.symbol} ${num}` : `${num} ${cur}`;
};
export const fmtMoneyConv = (v: number, from: string, to: string) => {
  const t = CURRENCY_MAP[to];
  return t ? fmtMoney(roundSmart(convert(v, from, to), t.rate), to) : fmtMoney(convert(v, from, to), to);
};
export const fmtNum = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
export const initials = (f: string, l: string) => `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase();
export const monthKeys = (n: number) => { const out: string[] = []; const d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`); } return out; };
export const lastSchoolDays = (n: number) => { const out: string[] = []; const d = new Date(); while (out.length < n) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); d.setDate(d.getDate() - 1); } return out; };
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS = [["08:00", "08:45"], ["08:50", "09:35"], ["09:40", "10:25"], ["10:45", "11:30"], ["11:35", "12:20"], ["13:30", "14:15"], ["14:20", "15:05"]];

export const COUNTRIES: Record<string, { currency: string; tz: string; phone: string }> = {
  Rwanda: { currency: "RWF", tz: "Africa/Kigali", phone: "+250 7XX XXX XXX" },
  "DR Congo": { currency: "CDF", tz: "Africa/Kinshasa", phone: "+243 XX XXX XXXX" },
  Kenya: { currency: "KES", tz: "Africa/Nairobi", phone: "+254 7XX XXX XXX" },
  Uganda: { currency: "UGX", tz: "Africa/Kampala", phone: "+256 7XX XXX XXX" },
  Tanzania: { currency: "TZS", tz: "Africa/Dar_es_Salaam", phone: "+255 7XX XXX XXX" },
  Burundi: { currency: "BIF", tz: "Africa/Bujumbura", phone: "+257 7X XX XX XX" },
  Nigeria: { currency: "NGN", tz: "Africa/Lagos", phone: "+234 8XX XXX XXXX" },
  Ghana: { currency: "GHS", tz: "Africa/Accra", phone: "+233 2X XXX XXXX" },
  "South Africa": { currency: "ZAR", tz: "Africa/Johannesburg", phone: "+27 8X XXX XXXX" },
  Cameroon: { currency: "XAF", tz: "Africa/Douala", phone: "+237 6XX XX XX XX" },
  France: { currency: "EUR", tz: "Europe/Paris", phone: "+33 6 XX XX XX XX" },
  "United Kingdom": { currency: "GBP", tz: "Europe/London", phone: "+44 7XXX XXXXXX" },
  "United States": { currency: "USD", tz: "America/New_York", phone: "+1 (XXX) XXX-XXXX" },
};

/* ============================== RBAC ============================== */
export const PERMS: Record<string, string[]> = {
  super: ["*"],
  admin: ["dashboard", "students", "students.edit", "admissions", "teachers", "teachers.edit", "classes", "timetable", "attendance", "exams", "grades", "reports_cards", "fees", "payments", "expenses", "fin_reports", "communication", "calendar", "library", "transport", "hr", "documents", "certificates", "idcards", "audit", "backups", "analytics", "settings", "acad_reports"],
  principal: ["dashboard", "students", "admissions", "teachers", "classes", "timetable", "attendance", "exams", "grades", "reports_cards", "acad_reports", "fin_reports", "communication", "calendar", "documents", "certificates", "analytics"],
  accountant: ["dashboard", "fees", "payments", "expenses", "fin_reports", "students", "analytics"],
  teacher: ["dashboard", "students", "classes", "timetable", "attendance", "exams", "grades", "reports_cards", "communication", "calendar", "portal"],
  student: ["portal"],
  parent: ["portal"],
  registrar: ["dashboard", "students", "students.edit", "admissions", "documents", "idcards"],
  reception: ["dashboard", "communication", "calendar", "documents"],
  librarian: ["dashboard", "library"],
  transport: ["dashboard", "transport"],
  hr: ["dashboard", "hr", "teachers", "documents"],
};
export const can = (role: Role | undefined, perm: string) => !!role && (PERMS[role]?.includes("*") || PERMS[role]?.includes(perm));

/* ============================== Seed ============================== */
const MF = ["Eric", "Kevin", "Patrick", "Olivier", "Fabrice", "Claude", "Didier", "Emmanuel", "Tresor", "Yves", "Bruce", "Aime", "Pacifique", "Regis", "Serge", "Divin", "Jean", "Herve", "Placide", "Innocent"];
const FF = ["Alice", "Keza", "Divine", "Ines", "Clarisse", "Vanessa", "Sandrine", "Josiane", "Bella", "Cynthia", "Grace", "Diane", "Nadia", "Pamela", "Solange", "Esther", "Rita", "Laetitia", "Mireille", "Umutoni"];
const LN = ["Habimana", "Uwase", "Mugisha", "Uwineza", "Niyonsaba", "Bizimana", "Mukamana", "Nsengimana", "Iradukunda", "Hakizimana", "Umuhoza", "Ndayisenga", "Ingabire", "Shema", "Tuyishime", "Mukeshimana", "Rukundo", "Ntambara", "Kaneza", "Dusabe"];

function seed(): DB {
  const r = mulberry(20260830);
  const ri = (n: number) => Math.floor(r() * n);
  const pick = <T,>(a: T[]) => a[ri(a.length)];

  const classes: ClassSec[] = [];
  for (let lvl = 1; lvl <= 6; lvl++) for (const sec of ["A", "B"])
    classes.push({ id: `c${lvl}${sec}`, name: `Senior ${lvl}`, section: sec, level: lvl, room: `R-${100 + lvl * 10 + (sec === "A" ? 1 : 2)}`, capacity: 40, teacherId: "" });

  const subjects: Subject[] = [
    { id: "s-math", name: "Mathematics", code: "MATH", credits: 4, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-phy", name: "Physics", code: "PHY", credits: 3, teacherIds: [], classLevels: [4, 5, 6] },
    { id: "s-chem", name: "Chemistry", code: "CHEM", credits: 3, teacherIds: [], classLevels: [4, 5, 6] },
    { id: "s-bio", name: "Biology", code: "BIO", credits: 3, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-cs", name: "Computer Science", code: "CS", credits: 2, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-eng", name: "English", code: "ENG", credits: 3, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-fre", name: "French", code: "FRE", credits: 2, teacherIds: [], classLevels: [1, 2, 3] },
    { id: "s-kin", name: "Kinyarwanda", code: "KIN", credits: 2, teacherIds: [], classLevels: [1, 2, 3] },
    { id: "s-his", name: "History & Citizenship", code: "HIST", credits: 2, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-geo", name: "Geography", code: "GEO", credits: 2, teacherIds: [], classLevels: [1, 2, 3, 4, 5, 6] },
    { id: "s-eco", name: "Economics", code: "ECO", credits: 3, teacherIds: [], classLevels: [4, 5, 6] },
    { id: "s-ent", name: "Entrepreneurship", code: "ENTR", credits: 2, teacherIds: [], classLevels: [4, 5, 6] },
  ];

  const specMap: Record<string, string> = { Mathematics: "Pure Mathematics", Physics: "Applied Physics", Chemistry: "Organic Chemistry", Biology: "Human Biology", "Computer Science": "Software & ICT", English: "Literature in English", French: "Langue Française", Kinyarwanda: "Ururimi rw'Ikinyarwanda", "History & Citizenship": "East African History", Geography: "Physical Geography", Economics: "Microeconomics", Entrepreneurship: "Business Studies" };
  const quals = ["B.Ed Mathematics", "BSc Physics", "MSc Chemistry", "B.Ed Biology", "BSc Computer Science", "BA English", "Licence Français", "B.Ed History", "BA Geography", "B.Ed Economics"];
  const teachers: Teacher[] = [];
  subjects.forEach((s, i) => {
    const g: "M" | "F" = i % 3 === 0 ? "F" : "M";
    const first = g === "M" ? MF[i % MF.length] : FF[i % FF.length];
    const last = LN[(i * 7 + 3) % LN.length];
    const t: Teacher = { id: `t${i + 1}`, empNo: `EMP-${101 + i}`, first, last, gender: g, phone: `+250 78${ri(10)} ${100000 + ri(899999)}`, email: `${first.toLowerCase()}.${last.toLowerCase()}@vitech.academy`, qualification: quals[i % quals.length], specialization: specMap[s.name], hireDate: daysAgo(300 + ri(900)), salary: 280000 + ri(22) * 15000, bank: pick(["Bank of Kigali", "I&M Bank", "Equity Bank", "GT Bank", "Access Bank"]), subjects: [s.id], classIds: [], status: "active", hue: (i * 47) % 360 };
    s.teacherIds = [t.id];
    teachers.push(t);
  });
  for (let i = 0; i < 6; i++) {
    const g: "M" | "F" = i % 2 === 0 ? "F" : "M";
    const first = g === "M" ? MF[(i + 5) % MF.length] : FF[(i + 5) % FF.length];
    const last = LN[(i * 11 + 5) % LN.length];
    teachers.push({ id: `tx${i}`, empNo: `EMP-${113 + i}`, first, last, gender: g, phone: `+250 72${ri(10)} ${100000 + ri(899999)}`, email: `${first.toLowerCase()}.${last.toLowerCase()}@vitech.academy`, qualification: pick(quals), specialization: pick(Object.values(specMap)), hireDate: daysAgo(200 + ri(700)), salary: 260000 + ri(15) * 15000, bank: pick(["Bank of Kigali", "I&M Bank", "Equity Bank"]), subjects: [], classIds: [], status: i === 2 ? "leave" : "active", hue: (i * 83 + 20) % 360 });
  }
  classes.forEach((c, i) => { c.teacherId = teachers[i % teachers.length].id; });

  const students: Student[] = [];
  for (let i = 0; i < 240; i++) {
    const g: "M" | "F" = i % 2 === 0 ? "M" : "F";
    const first = g === "M" ? pick(MF) : pick(FF);
    const last = pick(LN);
    const cls = classes[i % 12];
    const admitted = daysAgo(40 + ri(600));
    const pG = r() > 0.5 ? "Mr." : "Mrs.";
    students.push({
      id: `st${i + 1}`, regNo: `VA-2025-${String(i + 1).padStart(4, "0")}`, first, last, gender: g,
      dob: `${2007 + cls.level - ri(2)}-${String(1 + ri(12)).padStart(2, "0")}-${String(1 + ri(27)).padStart(2, "0")}`,
      nationality: r() < 0.82 ? "Rwandan" : pick(["Congolese", "Ugandan", "Kenyan", "Burundian"]),
      phone: `+250 7${ri(10)} ${100000 + ri(899999)}`, email: `${first.toLowerCase()}.${last.toLowerCase()}@student.vitech.academy`,
      address: `${pick(["KG 12 Ave, Kacyiru", "KG 541 St, Kanombe", "KK 15 Ave, Kicukiro", "KN 3 Ave, Nyamirambo", "KG 201 St, Kimironko"])}, Kigali`,
      prevSchool: pick(["G.S. Remera", "EP Kacyiru", "G.S. Kanombe", "EP Nyarutarama", "G.S. Kicukiro", "EP Kimironko II", ""]),
      admitted, classId: cls.id, status: r() < 0.94 ? "active" : pick(["pending", "graduated", "archived"] as const),
      parent: { name: `${pG} ${last}`, relation: pG === "Mr." ? "Father" : "Mother", phone: `+250 7${ri(10)} ${100000 + ri(899999)}`, email: `${last.toLowerCase()}${ri(90) + 10}@gmail.com`, occupation: pick(["Trader", "Teacher", "Engineer", "Farmer", "Nurse", "Driver", "Accountant", "Businessman", "Civil servant"]), emergency: `+250 7${ri(10)} ${100000 + ri(899999)}` },
      hue: (i * 61) % 360, ability: 42 + r() * 52,
    });
  }

  const admissions: Admission[] = Array.from({ length: 9 }, (_, i) => {
    const g: "M" | "F" = i % 2 === 0 ? "F" : "M";
    return { id: `ad${i}`, appNo: `APP-2026-${String(41 + i).padStart(3, "0")}`, first: g === "M" ? pick(MF) : pick(FF), last: pick(LN), gender: g, dob: `${2009 + ri(4)}-0${1 + ri(9)}-1${ri(9)}`, applyClass: pick(["Senior 1", "Senior 2", "Senior 4"]), parent: `${r() > 0.5 ? "Mr." : "Mrs."} ${pick(LN)}`, phone: `+250 7${ri(10)} ${100000 + ri(899999)}`, prevSchool: pick(["EP Kacyiru", "G.S. Remera", "EP Kanombe"]), date: daysAgo(ri(20)), stage: (["applied", "applied", "review", "review", "interview", "approved", "approved", "enrolled", "rejected"] as const)[i], note: "" };
  });

  /* fees per level */
  const base: Record<number, number> = { 1: 120000, 2: 125000, 3: 135000, 4: 150000, 5: 170000, 6: 185000 };
  const feeStructures: FeeStructure[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    level, items: [
      { id: `f${level}-t`, name: "Tuition", amount: base[level] },
      { id: `f${level}-r`, name: "Registration", amount: 20000 },
      { id: `f${level}-e`, name: "Examination", amount: 10000 },
      { id: `f${level}-l`, name: "Laboratory & ICT", amount: level >= 4 ? 15000 : 8000 },
      { id: `f${level}-p`, name: "PTA & Insurance", amount: 5000 },
    ],
  }));
  const levelTotal = (lvl: number) => feeStructures.find((f) => f.level === lvl)!.items.reduce((a, b) => a + b.amount, 0);

  /* payments across 8 months */
  const methods: Payment["method"][] = ["Mobile Money", "Mobile Money", "Mobile Money", "Cash", "Cash", "Bank", "Bank", "Card", "Transfer"];
  const payments: Payment[] = [];
  const mk = monthKeys(8);
  mk.forEach((mkey, mi) => {
    const count = mi === mk.length - 1 ? 74 : 46 + ri(20);
    for (let i = 0; i < count; i++) {
      const st = students[ri(students.length)];
      const lvl = classes.find((c) => c.id === st.classId)!.level;
      const tot = levelTotal(lvl);
      const amount = pick([Math.round(tot / 2), tot, Math.round(tot / 4), Math.round(tot / 3), 25000, 50000]);
      const day = 1 + ri(27);
      payments.push({ id: `p${mi}-${i}`, receipt: `RC-${mkey.slice(0, 4)}-${String(1000 + payments.length)}`, studentId: st.id, amount, method: pick(methods), feeType: pick(["Tuition", "Tuition", "Registration", "Examination", "Laboratory & ICT"]), date: `${mkey}-${String(day).padStart(2, "0")}`, by: pick(["Jean Bosco", "Claudine U.", "System"]) });
    }
  });
  const today = todayISO();
  for (let i = 0; i < 7; i++) {
    const st = students[ri(60)];
    const lvl = classes.find((c) => c.id === st.classId)!.level;
    payments.push({ id: `pt${i}`, receipt: `RC-${today.slice(0, 4)}-${String(9200 + i)}`, studentId: st.id, amount: pick([50000, 90000, levelTotal(lvl), 30000]), method: pick(methods), feeType: "Tuition", date: i < 5 ? today : daysAgo(1), by: "Claudine U." });
  }

  const expCats = ["Salaries", "Electricity", "Internet", "Rent", "Maintenance", "Supplies", "Transport", "Equipment"];
  const expenses: Expense[] = [];
  mk.forEach((mkey, mi) => {
    const n = 6 + ri(5);
    for (let i = 0; i < n; i++) {
      const cat = pick(expCats);
      expenses.push({ id: `e${mi}-${i}`, category: cat, desc: cat === "Salaries" ? "Staff payroll" : pick(["REG electricity bill", "Fibre internet — MTN", "Building rent", "Plumbing repair", "Chalk & stationery", "School bus fuel", "Projector purchase", "Painting classrooms"]), amount: cat === "Salaries" ? 4200000 + ri(4) * 100000 : 15000 + ri(40) * 12000, date: `${mkey}-${String(1 + ri(27)).padStart(2, "0")}`, vendor: pick(["REG", "MTN Rwanda", "Kigali Properties", "Fundis Ltd", "Staco Supplies", "SP Stationers"]), method: pick(["Bank", "Cash", "Mobile Money", "Transfer"]), by: "Claudine U." });
    }
  });

  /* exams + grades */
  const core = ["s-math", "s-eng", "s-bio", "s-his", "s-geo", "s-cs", "s-fre", "s-kin"];
  const up = ["s-math", "s-phy", "s-chem", "s-bio", "s-eco", "s-ent"];
  const exams: Exam[] = [
    { id: "ex1", name: "End of Term 1 Examination", term: "Term 1", date: daysAgo(75), status: "completed", classLevels: [1, 2, 3, 4, 5, 6], subjectIds: [...core, ...up], maxScore: 100 },
    { id: "ex2", name: "Mid-Term Examination — Term 2", term: "Term 2", date: daysAgo(18), status: "completed", classLevels: [4, 5, 6], subjectIds: up, maxScore: 100 },
    { id: "ex3", name: "End of Term 2 Examination", term: "Term 2", date: daysAhead(21), status: "scheduled", classLevels: [1, 2, 3, 4, 5, 6], subjectIds: [...core, ...up], maxScore: 100 },
  ];
  const grades: Grade[] = [];
  const subjFor = (lvl: number) => subjects.filter((s) => s.classLevels.includes(lvl));
  for (const ex of exams.filter((e) => e.status === "completed")) {
    for (const st of students) {
      const lvl = classes.find((c) => c.id === st.classId)!.level;
      if (!ex.classLevels.includes(lvl)) continue;
      for (const s of subjFor(lvl)) {
        if (!ex.subjectIds.includes(s.id)) continue;
        const noise = (hashStr(st.id + s.id + ex.id) % 41) - 20;
        grades.push({ id: `g-${ex.id}-${st.id}-${s.id}`, examId: ex.id, studentId: st.id, subjectId: s.id, score: Math.max(12, Math.min(99, Math.round(st.ability + noise))) });
      }
    }
  }

  /* timetable — deterministic, may include teacher conflicts (feature: detection) */
  const timetable: TTSlot[] = [];
  classes.forEach((c) => {
    const subs = subjFor(c.level);
    for (let day = 0; day < 5; day++) for (let p = 0; p < 7; p++) {
      const s = subs[(day * 7 + p + c.level) % subs.length];
      timetable.push({ id: `tt-${c.id}-${day}-${p}`, classId: c.id, subjectId: s.id, teacherId: s.teacherIds[0] ?? "", room: c.room, day, start: PERIODS[p][0], end: PERIODS[p][1] });
    }
  });

  const announcements: Announcement[] = [
    { id: "an1", title: "End of Term 2 Examination timetable released", body: "The examination timetable for all levels is now available. Students should check their class notice boards and the portal for the schedule starting in three weeks.", audience: "All students", date: daysAgo(2), by: "Jean Bosco", pinned: true },
    { id: "an2", title: "Term 2 fees — final reminder", body: "Kindly note that all outstanding Term 2 fees should be cleared before the end of month. Receipts are issued immediately at the finance office or via mobile money.", audience: "All parents", date: daysAgo(5), by: "Claudine U." },
    { id: "an3", title: "Inter-house sports day", body: "The annual inter-house sports day takes place at the main stadium. All students must wear their house colours. Parents are warmly invited.", audience: "Everyone", date: daysAgo(9), by: "Principal" },
    { id: "an4", title: "Staff meeting — Saturday 9:00 AM", body: "All teaching and non-teaching staff are invited to the monthly staff meeting in the main hall. Agenda: exam supervision and report cards.", audience: "All teachers", date: daysAgo(12), by: "Jean Bosco" },
  ];

  const templates: MsgTemplate[] = [
    { id: "tp1", name: "Absence alert", channel: "SMS", body: "Dear [PARENT_NAME], your child [STUDENT_NAME] was marked absent from [CLASS] today, [DATE]. — [SCHOOL_NAME]" },
    { id: "tp2", name: "Payment received", channel: "WhatsApp", body: "Dear [PARENT_NAME], a payment of [AMOUNT] has been received for [STUDENT_NAME]. Remaining balance: [BALANCE]. Thank you — [SCHOOL_NAME]" },
    { id: "tp3", name: "Exam reminder", channel: "SMS", body: "Dear [PARENT_NAME], [STUDENT_NAME] has an upcoming examination on [DATE]. Please ensure revision at home. — [SCHOOL_NAME]" },
    { id: "tp4", name: "General announcement", channel: "Email", body: "Dear [PARENT_NAME],\n\n[MESSAGE]\n\nKind regards,\n[SCHOOL_NAME]" },
  ];

  const commLogs: CommLog[] = [
    { id: "cl1", channel: "SMS", to: "+250 788 ••• 231", body: "Absence alert — Keza Uwase (S4 A)", date: today, status: "delivered" },
    { id: "cl2", channel: "WhatsApp", to: "+250 722 ••• 118", body: "Payment of 90,000 RWF received — Eric Habimana", date: today, status: "delivered" },
    { id: "cl3", channel: "Email", to: "habimana••@gmail.com", body: "Receipt RC-2026-9201 attached", date: daysAgo(1), status: "sent" },
    { id: "cl4", channel: "SMS", to: "+250 781 ••• 902", body: "Exam reminder — Mid-Term results published", date: daysAgo(2), status: "delivered" },
    { id: "cl5", channel: "Push", to: "1,240 devices", body: "Inter-house sports day announcement", date: daysAgo(9), status: "delivered" },
    { id: "cl6", channel: "WhatsApp", to: "+250 733 ••• 457", body: "Fee balance reminder — 45,000 RWF outstanding", date: daysAgo(3), status: "failed" },
  ];

  const notifications: Notice[] = [
    { id: "n1", type: "payment", title: "Payment received", body: "90,000 RWF — Eric Habimana (Mobile Money)", date: today, read: false },
    { id: "n2", type: "absent", title: "3 students absent today", body: "Senior 4 A — alerts sent to parents", date: today, read: false },
    { id: "n3", type: "admission", title: "New admission application", body: "APP-2026-049 awaiting review", date: daysAgo(1), read: false },
    { id: "n4", type: "fee", title: "Fees overdue", body: "38 students have an outstanding balance", date: daysAgo(1), read: true },
    { id: "n5", type: "exam", title: "Exam scheduled", body: "End of Term 2 Examination in 3 weeks", date: daysAgo(2), read: true },
    { id: "n6", type: "system", title: "Automatic backup completed", body: "Database snapshot stored (48.2 MB)", date: daysAgo(2), read: true },
  ];

  const events: SchoolEvent[] = [
    { id: "ev1", title: "Parent–teacher meeting", date: daysAhead(4), kind: "meeting", note: "Main hall, 9:00 AM" },
    { id: "ev2", title: "End of Term 2 exams begin", date: daysAhead(21), kind: "exam", note: "All levels" },
    { id: "ev3", title: "Inter-house sports day", date: daysAhead(11), kind: "sports", note: "Amahoro stadium" },
    { id: "ev4", title: "Staff payroll processing", date: daysAhead(7), kind: "meeting" },
    { id: "ev5", title: "Heroes Day holiday", date: daysAhead(15), kind: "holiday" },
    { id: "ev6", title: "Senior 6 graduation ceremony", date: daysAhead(48), kind: "graduation", note: "Kigali Convention Centre" },
    { id: "ev7", title: "Science fair", date: daysAhead(17), kind: "event", note: "ICT lab" },
    { id: "ev8", title: "Board of directors meeting", date: daysAgo(6), kind: "meeting" },
    { id: "ev9", title: "Mid-term exams end", date: daysAgo(14), kind: "exam" },
    { id: "ev10", title: "Open day — prospective parents", date: daysAhead(27), kind: "event" },
  ];

  const books: Book[] = [
    ["Things Fall Apart", "Chinua Achebe", "Literature", "978-0385474542", 14], ["Petals of Blood", "Ngũgĩ wa Thiong'o", "Literature", "978-0143116288", 8],
    ["So Long a Letter", "Mariama Bâ", "Literature", "978-1479242313", 6], ["Nervous Conditions", "Tsitsi Dangarembga", "Literature", "978-0948833090", 7],
    ["Advanced Mathematics", "A. Greer & J. Kyle", "Sciences", "978-0199148790", 22], ["Physics Today", "S. Debono", "Sciences", "978-0521782890", 16],
    ["Chemistry in Focus", "N. Ntalikwa", "Sciences", "978-9966226521", 12], ["Biology: A Functional Approach", "M.B.V. Roberts", "Sciences", "978-0748785179", 18],
    ["Introduction to Computer Science", "P. Mutabazi", "ICT", "978-9997761104", 25], ["Cambridge English Grammar", "R. Murphy", "Languages", "978-1108457651", 30],
    ["Histoire du Rwanda", "A. Kagame", "Humanities", "978-9997720119", 9], ["Geography of East Africa", "J. Otiende", "Humanities", "978-9966255115", 11],
    ["Entrepreneurship Basics", "C. Rurangwa", "Business", "978-9997763218", 13], ["Economics: An African Perspective", "S. Osei", "Business", "978-9988257013", 10],
    ["The Beautyful Ones Are Not Yet Born", "Ayi Kwei Armah", "Literature", "978-0435905491", 5], ["Half of a Yellow Sun", "Chimamanda Ngozi Adichie", "Literature", "978-1400044160", 6],
  ].map((b, i) => ({ id: `b${i}`, title: b[0] as string, author: b[1] as string, category: b[2] as string, isbn: b[3] as string, copies: b[4] as number, available: (b[4] as number) - (i % 4 === 0 ? 1 + (i % 3) : 0) }));

  const loans: Loan[] = Array.from({ length: 12 }, (_, i) => {
    const b = books[ri(books.length)];
    const isSt = r() > 0.3;
    const p = isSt ? pick(students) : null;
    const tch = !isSt ? pick(teachers) : null;
    const overdue = i % 4 === 3;
    return { id: `ln${i}`, bookId: b.id, borrower: isSt ? `${p!.first} ${p!.last}` : `${tch!.first} ${tch!.last}`, type: isSt ? "student" : "teacher", date: daysAgo(overdue ? 24 : ri(12)), due: overdue ? daysAgo(4) : daysAhead(6 + ri(8)), returned: i % 5 === 4 ? daysAgo(ri(3)) : undefined, fine: overdue ? 2000 : 0 };
  });

  const routes: RouteT[] = [
    { id: "r1", name: "Kacyiru — Nyarutarama loop", stops: ["Kacyiru", "Nyarutarama", "Gishushu", "Jandarmerie"], fee: 45000, students: 38 },
    { id: "r2", name: "Kanombe express", stops: ["Kanombe", "Kabeza", "Masaka", "Camp GP"], fee: 40000, students: 31 },
    { id: "r3", name: "Kimironko line", stops: ["Kimironko", "Kibagabaga", "Nyagatare"], fee: 35000, students: 26 },
    { id: "r4", name: "Nyamirambo line", stops: ["Nyamirambo", "Rugunga", "Mumena", "Rwezamenyo"], fee: 30000, students: 29 },
    { id: "r5", name: "Kicukiro line", stops: ["Kicukiro", "Sonatubes", "Niboye", "Kagugu"], fee: 40000, students: 22 },
  ];
  const vehicles: Vehicle[] = [
    { id: "v1", plate: "RDF 452 A", model: "Toyota Coaster (30)", capacity: 30, driver: "Emmanuel Nzeyimana", insurance: "Valid until Mar 2027", status: "active", routeId: "r1" },
    { id: "v2", plate: "RAE 871 B", model: "Toyota Hiace (18)", capacity: 18, driver: "Didier Nkurunziza", insurance: "Valid until Nov 2026", status: "active", routeId: "r2" },
    { id: "v3", plate: "RAD 233 A", model: "Toyota Coaster (30)", capacity: 30, driver: "Claude Maniraguha", insurance: "Valid until Jun 2027", status: "maintenance", routeId: "r3" },
    { id: "v4", plate: "RAG 902 C", model: "Toyota Hiace (18)", capacity: 18, driver: "Serge Rukundo", insurance: "Valid until Jan 2027", status: "active", routeId: "r4" },
    { id: "v5", plate: "RAH 118 A", model: "Isuzu NQR (35)", capacity: 35, driver: "Yves Ndayambaje", insurance: "Valid until Sep 2026", status: "active", routeId: "r5" },
  ];

  const staff: Staff[] = [
    ["Claudine Uwera", "Finance", "Accountant"], ["Peter Kamana", "Administration", "Registrar"], ["Josephine Mukandayisenga", "Administration", "Receptionist"],
    ["Samuel Nsanzimana", "Library", "Librarian"], ["Theogene Habiyaremye", "Operations", "Security"], ["Emmanuel Nzeyimana", "Transport", "Driver"],
    ["Diane Umutoni", "Health", "School Nurse"], ["Eric Niyomugabo", "ICT", "IT Technician"], ["Grace Ingabire", "Operations", "Cleaner"], ["Robert Mugwaneza", "Finance", "Bursar"],
  ].map((s, i) => ({ id: `sf${i}`, empNo: `STF-${301 + i}`, name: s[0] as string, dept: s[1] as string, position: s[2] as string, phone: `+250 7${ri(10)} ${100000 + ri(899999)}`, hired: daysAgo(150 + ri(800)), salary: 90000 + ri(20) * 12000, status: (i === 4 ? "leave" : "active") as "active" | "leave" }));

  const leaves: Leave[] = [
    { id: "lv1", staffName: "Theogene Habiyaremye", type: "Annual leave", from: daysAgo(3), to: daysAhead(11), status: "approved" },
    { id: "lv2", staffName: "Diane Umutoni", type: "Sick leave", from: daysAhead(2), to: daysAhead(5), status: "pending" },
    { id: "lv3", staffName: "Josephine Mukandayisenga", type: "Maternity leave", from: daysAhead(20), to: daysAhead(110), status: "pending" },
  ];

  const documents: Doc[] = [
    ["School Calendar 2025-26.pdf", "School policies", "1.2 MB", "doc"], ["Fee Structure — All levels.pdf", "Financial documents", "340 KB", "pdf"],
    ["Discipline Policy.pdf", "School policies", "512 KB", "pdf"], ["Staff Handbook.pdf", "School policies", "2.1 MB", "pdf"],
    ["Term 1 Results — S6.pdf", "Reports", "890 KB", "pdf"], ["Budget 2026.xlsx", "Financial documents", "156 KB", "xls"],
    ["Student photos batch 3.zip", "Student documents", "48 MB", "img"], ["MOE Inspection Report.pdf", "Reports", "1.8 MB", "pdf"],
    ["Employment contract template.docx", "Teacher documents", "88 KB", "doc"], ["Medical forms.pdf", "Student documents", "204 KB", "pdf"],
    ["PTA Minutes — March.pdf", "School policies", "130 KB", "pdf"], ["ICT Acceptable Use.pdf", "School policies", "96 KB", "pdf"],
  ].map((d, i) => ({ id: `dc${i}`, name: d[0] as string, category: d[1] as string, size: d[2] as string, date: daysAgo(ri(60)), by: pick(["Jean Bosco", "Peter Kamana", "Claudine Uwera"]), kind: d[3] as Doc["kind"] }));

  const certificates: Certificate[] = [
    { id: "ct1", code: "VTC-2026-4821", type: "Certificate of Graduation", recipient: "Keza Uwase", date: daysAgo(40), note: "Senior 6 — Class of 2025", valid: true },
    { id: "ct2", code: "VTC-2026-4822", type: "Certificate of Completion", recipient: "Eric Habimana", date: daysAgo(40), note: "ICT Short Course", valid: true },
    { id: "ct3", code: "VTC-2025-3310", type: "Attendance Certificate", recipient: "Divine Mukamana", date: daysAgo(160), note: "Academic year 2024-25", valid: true },
    { id: "ct4", code: "VTC-2024-1104", type: "Training Certificate", recipient: "Unknown", date: daysAgo(500), note: "Revoked by registrar", valid: false },
  ];

  const audits: Audit[] = [
    ["Jean Bosco", "admin", "UPDATE_STUDENT", "Student", "Updated profile — Keza Uwase (VA-2025-0002)"], ["Claudine Uwera", "accountant", "CREATE_PAYMENT", "Payment", "Recorded 90,000 RWF — receipt RC-2026-9201"],
    ["Jean Bosco", "admin", "CREATE_ANNOUNCEMENT", "Announcement", "“End of Term 2 Examination timetable released”"], ["Peter Kamana", "registrar", "UPDATE_ADMISSION", "Admission", "APP-2026-046 moved to Review"],
    ["System", "system", "BACKUP_CREATED", "Backup", "Automatic nightly backup (48.2 MB)"], ["Jean Bosco", "admin", "UPDATE_SETTINGS", "Settings", "Changed receipt prefix to RC-2026"],
    ["Aline Ingabire", "teacher", "ENTER_GRADES", "Grades", "Mid-Term — S4 A Mathematics (38 students)"], ["System", "system", "LOGIN_SUCCESS", "Auth", "admin@vitech.academy signed in"],
    ["Claudine Uwera", "accountant", "CREATE_EXPENSE", "Expense", "REG electricity bill — 214,000 RWF"], ["Jean Bosco", "admin", "DELETE_STUDENT", "Student", "Archived duplicate record VA-2025-0117"],
  ].map((a, i) => ({ id: `au${i}`, user: a[0] as string, role: a[1] as string, action: a[2] as string, entity: a[3] as string, detail: a[4] as string, date: daysAgo(ri(6)) + ` ${8 + ri(9)}:${10 + ri(49)}`, ip: `197.243.${ri(90) + 10}.${ri(200) + 10}`, device: pick(["Chrome · Windows", "Safari · iPhone", "Edge · Windows", "Chrome · Android"]) }));

  const backups: Backup[] = [
    { id: "bk1", date: daysAgo(1) + " 02:00", size: "48.2 MB", type: "auto", status: "ok" },
    { id: "bk2", date: daysAgo(2) + " 02:00", size: "48.0 MB", type: "auto", status: "ok" },
    { id: "bk3", date: daysAgo(6) + " 17:42", size: "47.6 MB", type: "manual", status: "ok" },
  ];

  const plans: Plan[] = [
    { id: "pl1", name: "Starter", price: 29, period: "/school/month", students: 200, teachers: 15, storage: "5 GB", sms: 500, features: ["Students & teachers", "Attendance & grades", "Fees & receipts", "Report cards", "Email support"] },
    { id: "pl2", name: "Professional", price: 79, period: "/school/month", students: 1000, teachers: 60, storage: "25 GB", sms: 3000, highlight: true, features: ["Everything in Starter", "SMS & WhatsApp gateway", "Financial reports", "Library & transport", "Parent portal", "Priority support"] },
    { id: "pl3", name: "Enterprise", price: 199, period: "/group/month", students: "Unlimited", teachers: "Unlimited", storage: "100 GB", sms: "Unlimited", features: ["Everything in Professional", "Multi-campus groups", "White-label branding", "REST API access", "Custom integrations", "Dedicated manager"] },
  ];

  const tenants: TenantSchool[] = [
    { id: "tn1", name: "VITECH International Academy", city: "Kigali, Rwanda", plan: "Enterprise", students: 1240, status: "active", mrr: 199, joined: daysAgo(420) },
    { id: "tn2", name: "Groupe Scolaire Lumumba", city: "Goma, DR Congo", plan: "Professional", students: 860, status: "active", mrr: 79, joined: daysAgo(300) },
    { id: "tn3", name: "Green Hills Academy", city: "Gisenyi, Rwanda", plan: "Professional", students: 540, status: "active", mrr: 79, joined: daysAgo(210) },
    { id: "tn4", name: "Lakeview College", city: "Bukavu, DR Congo", plan: "Starter", students: 180, status: "trial", mrr: 0, joined: daysAgo(12) },
    { id: "tn5", name: "Excellence Institute", city: "Butare, Rwanda", plan: "Starter", students: 145, status: "active", mrr: 29, joined: daysAgo(150) },
    { id: "tn6", name: "Sunrise Schools Group", city: "Kampala, Uganda", plan: "Enterprise", students: 2100, status: "active", mrr: 199, joined: daysAgo(365) },
    { id: "tn7", name: "Uhuru Academy", city: "Nairobi, Kenya", plan: "Professional", students: 620, status: "suspended", mrr: 0, joined: daysAgo(260) },
  ];

  const users: User[] = [
    { id: "u1", name: "Alex Mugisha", email: "super@vitech.app", pass: "demo1234", role: "super", twoFA: true, hue: 215 },
    { id: "u2", name: "Jean Bosco Habimana", email: "admin@vitech.academy", pass: "demo1234", role: "admin", twoFA: true, hue: 222 },
    { id: "u3", name: "Dr. Sandrine Umutesi", email: "principal@vitech.academy", pass: "demo1234", role: "principal", hue: 260 },
    { id: "u4", name: "Claudine Uwera", email: "finance@vitech.academy", pass: "demo1234", role: "accountant", hue: 150 },
    { id: "u5", name: `${teachers[0].first} ${teachers[0].last}`, email: "teacher@vitech.academy", pass: "demo1234", role: "teacher", linkId: teachers[0].id, hue: 20 },
    { id: "u6", name: `${students[0].first} ${students[0].last}`, email: "student@vitech.academy", pass: "demo1234", role: "student", linkId: students[0].id, hue: 300 },
    { id: "u7", name: students[0].parent.name, email: "parent@vitech.academy", pass: "demo1234", role: "parent", linkId: students[0].id, hue: 40 },
    { id: "u8", name: "Peter Kamana", email: "registrar@vitech.academy", pass: "demo1234", role: "registrar", hue: 180 },
    { id: "u9", name: "Josephine Mukandayisenga", email: "reception@vitech.academy", pass: "demo1234", role: "reception", hue: 330 },
    { id: "u10", name: "Samuel Nsanzimana", email: "library@vitech.academy", pass: "demo1234", role: "librarian", hue: 90 },
    { id: "u11", name: "Yves Ndayambaje", email: "transport@vitech.academy", pass: "demo1234", role: "transport", hue: 60 },
    { id: "u12", name: "Robert Mugwaneza", email: "hr@vitech.academy", pass: "demo1234", role: "hr", hue: 200 },
  ];

  return {
    v: 3,
    school: {
      name: "VITECH International Academy", short: "VIA", logoText: "VITECH", motto: "Knowledge · Discipline · Excellence",
      address: "KG 7 Ave, Kacyiru, Kigali, Rwanda", phone: "+250 788 000 111", email: "info@vitech.academy", website: "www.vitech.academy",
      country: "Rwanda", currency: "RWF", timezone: "Africa/Kigali", dateFormat: "DD/MM/YYYY", academicYear: "2025–2026", term: "Term 2",
      terms: ["Term 1", "Term 2", "Term 3"], brandColor: "#1e49c9", receiptPrefix: "RC", regPrefix: "VA", onboarded: true,
      grading: [
        { grade: "A", min: 80, label: "Excellent" }, { grade: "B", min: 70, label: "Very Good" }, { grade: "C", min: 60, label: "Good" },
        { grade: "D", min: 50, label: "Pass" }, { grade: "E", min: 40, label: "Weak" }, { grade: "F", min: 0, label: "Fail" },
      ], passMark: 50,
    },
    campuses: [
      { id: "cp1", name: "Campus Kigali", city: "Kigali", active: true }, { id: "cp2", name: "Campus Gisenyi", city: "Gisenyi", active: true },
      { id: "cp3", name: "Campus Goma", city: "Goma", active: true }, { id: "cp4", name: "Campus Bukavu", city: "Bukavu", active: false },
    ],
    users, rolePerms: PERMS, students, admissions, teachers, classes, subjects, timetable, attendanceOverrides: {},
    exams, grades, feeStructures, payments, expenses, announcements, templates, commLogs, notifications, events,
    books, loans, vehicles, routes, staff, leaves, documents, certificates, audits, backups, plans, tenants,
    system: {
      version: "3.2.0", channel: "stable", autoUpdate: true, available: "3.3.0",
      history: [
        { id: uid(), from: "3.1.2", to: "3.2.0", date: daysAgo(21), size: "4.6 MB", status: "ok" },
        { id: uid(), from: "3.1.0", to: "3.1.2", date: daysAgo(48), size: "2.1 MB", status: "ok" },
        { id: uid(), from: "3.0.0", to: "3.1.0", date: daysAgo(75), size: "6.3 MB", status: "ok" },
      ],
    },
  };
}

/* ============================== Store ============================== */
const LS_KEY = "vitech-sms-v3";
function load(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.db?.v === 3) {
        /* normalize legacy language choices (rw/sw were removed) */
        if (!LANG_CODES.includes(s.prefs?.lang)) s.prefs = { theme: s.prefs?.theme === "dark" ? "dark" : "light", lang: "en" };
        /* migrate older saves without the system-update module */
        if (!s.db.system) s.db.system = { version: "3.2.0", channel: "stable", autoUpdate: true, available: "3.3.0", history: [] };
        return s;
      }
    }
  } catch { /* corrupted → reseed */ }
  return { db: seed(), session: null, prefs: { theme: "light", lang: "en" } };
}
let state: AppState = load();
const subs = new Set<() => void>();
const persist = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota */ } };
const emit = () => subs.forEach((f) => f());

export const getState = () => state;
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const useApp = () => useSyncExternalStore(subscribe, getState);

export function mutate(fn: (db: DB) => void) { fn(state.db); state = { ...state, db: state.db }; persist(); emit(); }
export const setSession = (s: AppState["session"]) => { state = { ...state, session: s }; persist(); emit(); };
export const setPrefs = (p: Partial<AppState["prefs"]>) => { state = { ...state, prefs: { ...state.prefs, ...p } }; persist(); emit(); };
export function resetDemo() { state = { db: seed(), session: state.session, prefs: state.prefs }; persist(); emit(); }

/** Switch the school currency and convert every monetary record automatically. */
export function changeCurrency(to: string): { converted: number } {
  const from = state.db.school.currency;
  const t = CURRENCY_MAP[to];
  let converted = 0;
  if (!t || from === to) return { converted: 0 };
  const k = t.rate / (CURRENCY_MAP[from]?.rate ?? 1);
  mutate((db) => {
    const conv = (v: number) => roundSmart(v * k, t.rate);
    db.feeStructures.forEach((f) => f.items.forEach((it) => { it.amount = conv(it.amount); converted++; }));
    db.payments.forEach((p) => { p.amount = conv(p.amount); converted++; });
    db.expenses.forEach((e) => { e.amount = conv(e.amount); converted++; });
    db.teachers.forEach((x) => { x.salary = conv(x.salary); converted++; });
    db.staff.forEach((x) => { x.salary = conv(x.salary); converted++; });
    db.routes.forEach((r) => { r.fee = conv(r.fee); converted++; });
    db.school.currency = to;
  });
  return { converted };
}

export const me = (s: AppState) => (s.session ? s.db.users.find((u) => u.id === s.session!.userId) : undefined);

export function audit(action: string, entity: string, detail: string) {
  const u = me(state);
  mutate((db) => db.audits.unshift({ id: uid(), user: u?.name ?? "System", role: u?.role ?? "system", action, entity, detail, date: `${todayISO()} ${new Date().toTimeString().slice(0, 5)}`, ip: "197.243.44.18", device: "Chrome · Web" }));
}
export function notify(type: string, title: string, body: string) {
  mutate((db) => db.notifications.unshift({ id: uid(), type, title, body, date: todayISO(), read: false }));
}
export function logComm(channel: CommLog["channel"], to: string, body: string, status: CommLog["status"] = "delivered") {
  mutate((db) => db.commLogs.unshift({ id: uid(), channel, to, body, date: todayISO(), status }));
}

/* ============================== Derived helpers ============================== */
export const feeTotal = (db: DB, level: number) => (db.feeStructures.find((f) => f.level === level)?.items ?? []).reduce((a, b) => a + b.amount, 0);
export const paidBy = (db: DB, studentId: string) => db.payments.filter((p) => p.studentId === studentId).reduce((a, b) => a + b.amount, 0);
export const classOf = (db: DB, s: Student) => db.classes.find((c) => c.id === s.classId);
export const attStatus = (db: DB, date: string, studentId: string): string => {
  const key = `${date}|${studentId}`;
  if (db.attendanceOverrides[key]) return db.attendanceOverrides[key];
  const h = hashStr(key) % 100;
  return h < 88 ? "P" : h < 93 ? "L" : h < 98 ? "A" : "E";
};
export const setAtt = (date: string, studentId: string, st: string) => mutate((db) => { db.attendanceOverrides[`${date}|${studentId}`] = st; });
export const attPct = (db: DB, date: string, classId?: string) => {
  const sts = db.students.filter((s) => s.status === "active" && (!classId || s.classId === classId));
  if (!sts.length) return 0;
  const present = sts.filter((s) => ["P", "L"].includes(attStatus(db, date, s.id))).length;
  return Math.round((present / sts.length) * 100);
};
export const gradeLetter = (db: DB, score: number) => {
  const g = [...db.school.grading].sort((a, b) => b.min - a.min).find((x) => score >= x.min);
  return g ?? db.school.grading[db.school.grading.length - 1];
};
export const examAvg = (db: DB, examId: string, studentId: string) => {
  const gs = db.grades.filter((g) => g.examId === examId && g.studentId === studentId);
  return gs.length ? gs.reduce((a, b) => a + b.score, 0) / gs.length : 0;
};
export const classRanking = (db: DB, examId: string, classId: string) =>
  db.students.filter((s) => s.classId === classId && s.status === "active")
    .map((s) => ({ s, avg: examAvg(db, examId, s.id), subjects: db.grades.filter((g) => g.examId === examId && g.studentId === s.id).length }))
    .filter((x) => x.subjects > 0).sort((a, b) => b.avg - a.avg);
export const collectionRate = (db: DB) => {
  const act = db.students.filter((s) => s.status === "active");
  const billed = act.reduce((a, s) => a + feeTotal(db, classOf(db, s)?.level ?? 1), 0);
  const paid = act.reduce((a, s) => a + paidBy(db, s.id), 0);
  return billed ? Math.min(100, Math.round((paid / billed) * 100)) : 0;
};
export const findConflicts = (db: DB) => {
  const map = new Map<string, string[]>();
  db.timetable.forEach((t) => { const k = `${t.teacherId}|${t.day}|${t.start}`; map.set(k, [...(map.get(k) ?? []), t.classId]); });
  const out: { teacherId: string; day: number; start: string; classes: string[] }[] = [];
  map.forEach((classes, k) => { if (new Set(classes).size > 1) { const [teacherId, day, start] = k.split("|"); out.push({ teacherId, day: +day, start, classes: [...new Set(classes)] }); } });
  return out.slice(0, 12);
};
