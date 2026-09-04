/* ============================================================
   VITECH SCHOOL MANAGEMENT SYSTEM — data layer
   Persistent in-browser store (localStorage) seeded with a
   complete demonstration dataset. All modules read/write here.
   ============================================================ */
import { useSyncExternalStore } from "react";

/* ---------- shared types ---------- */
export type Lang = "en" | "fr" | "es" | "pt" | "ar";
export const LANG_CODES: Lang[] = ["en", "fr", "es", "pt", "ar"];
export type Role = "super" | "admin" | "principal" | "accountant" | "teacher" | "student" | "parent" | "registrar" | "receptionist" | "librarian" | "transport" | "hr";

export interface GradeScale { grade: string; label: string; min: number }
export interface SchoolSettings {
  name: string; short: string; logoText: string; motto: string; address: string; phone: string; email: string; website: string;
  country: string; currency: string; timezone: string; dateFormat: string; academicYear: string; term: string; terms: string[];
  brandColor: string; receiptPrefix: string; regPrefix: string; grading: GradeScale[]; passMark: number;
  onboarded?: boolean; fxUpdatedAt?: string; lastFx?: { from: string; to: string; rate: number; date: string; converted: number } | null;
}
export interface Campus { id: string; name: string; city: string; active: boolean }
export interface User { id: string; name: string; email: string; pass: string; role: Role; twoFA: boolean; hue: number }
export interface Student {
  id: string; regNo: string; first: string; last: string; gender: "M" | "F"; dob: string; nationality: string; phone: string;
  email: string; address: string; prevSchool: string; admitted: string; classId: string;
  status: "active" | "inactive" | "graduated" | "archived" | "pending"; hue: number;
  parent: { name: string; relation: string; phone: string; email: string; occupation: string; emergency: string };
}
export interface Admission { id: string; appNo: string; first: string; last: string; gender: "M" | "F"; level: number; date: string; stage: "application" | "review" | "approved" | "enrolled" | "rejected"; parent: string; phone: string }
export interface Teacher { id: string; empNo: string; first: string; last: string; gender: "M" | "F"; phone: string; email: string; qualification: string; specialization: string; hireDate: string; salary: number; bank: string; subjects: string[]; classIds: string[]; status: "active" | "leave"; hue: number }
export interface ClassSec { id: string; name: string; section: string; level: number; room: string; capacity: number; teacherId: string }
export interface Subject { id: string; name: string; code: string; credits: number; teacherIds: string[]; classLevels: number[] }
export interface TTSlot { id: string; classId: string; subjectId: string; teacherId: string; room: string; day: number; start: string; end: string }
export interface Exam { id: string; name: string; term: string; date: string; status: "scheduled" | "ongoing" | "completed"; classLevels: number[]; subjectIds: string[]; maxScore: number }
export interface Grade { id: string; examId: string; studentId: string; subjectId: string; score: number }
export interface FeeItem { id: string; name: string; amount: number }
export interface FeeStructure { level: number; items: FeeItem[] }
export interface Payment { id: string; receipt: string; studentId: string; amount: number; method: string; feeType: string; date: string; note?: string }
export interface Expense { id: string; category: string; desc: string; amount: number; date: string; vendor: string; method: string; by: string }
export interface Announcement { id: string; title: string; body: string; audience: string; date: string; by: string; pinned?: boolean }
export interface Template { id: string; key: string; name: string; channel: "SMS" | "WhatsApp" | "Email"; body: string }
export interface CommLog { id: string; channel: string; to: string; body: string; date: string; status: "sent" | "queued" | "failed" }
export interface Notif { id: string; type: string; title: string; body: string; date: string; read: boolean }
export interface SchoolEvent { id: string; title: string; date: string; kind: "exam" | "holiday" | "meeting" | "sports" | "event" | "graduation"; note?: string }
export interface Book { id: string; title: string; author: string; category: string; isbn: string; copies: number; available: number }
export interface Loan { id: string; bookId: string; borrower: string; type: "student" | "teacher"; date: string; due: string; returned: string | null; fine: number }
export interface Vehicle { id: string; plate: string; model: string; capacity: number; driver: string; insurance: string; status: "active" | "maintenance"; routeId: string }
export interface Route { id: string; name: string; stops: string[]; fee: number; students: number }
export interface Staff { id: string; empNo: string; name: string; dept: string; position: string; hired: string; salary: number; status: "active" | "leave" }
export interface Leave { id: string; staffName: string; type: string; from: string; to: string; status: "pending" | "approved" | "rejected" }
export interface Doc { id: string; name: string; category: string; size: string; date: string; by: string; kind: "pdf" | "img" | "xls" | "doc" }
export interface Certificate { id: string; code: string; type: string; recipient: string; date: string; note?: string; valid: boolean }
export interface Audit { id: string; user: string; role: string; action: string; entity: string; detail: string; date: string; ip: string; device: string }
export interface Backup { id: string; date: string; size: string; type: "auto" | "manual"; status: "ok" }
export interface Plan { id: string; name: string; price: number; students: number | "Unlimited"; teachers: number | "Unlimited"; storage: string; sms: number; features: string[]; highlight?: boolean; period: string }
export interface TenantSchool { id: string; name: string; city: string; plan: string; students: number; status: "active" | "trial" | "suspended"; mrr: number; joined: string }
export interface UpdateEntry { id: string; from: string; to: string; date: string; size: string; status: "ok" }
export interface SystemInfo { version: string; channel: "stable" | "beta"; autoUpdate: boolean; available: string | null; history: UpdateEntry[] }

export interface DB {
  v: number; school: SchoolSettings; campuses: Campus[]; users: User[]; rolePerms: Record<string, string[]>;
  students: Student[]; admissions: Admission[]; teachers: Teacher[]; classes: ClassSec[]; subjects: Subject[];
  timetable: TTSlot[]; attendanceOverrides: Record<string, string>; exams: Exam[]; grades: Grade[];
  feeStructures: FeeStructure[]; payments: Payment[]; expenses: Expense[]; announcements: Announcement[];
  templates: Template[]; commLogs: CommLog[]; notifications: Notif[]; events: SchoolEvent[]; books: Book[]; loans: Loan[];
  vehicles: Vehicle[]; routes: Route[]; staff: Staff[]; leaves: Leave[]; documents: Doc[]; certificates: Certificate[];
  audits: Audit[]; backups: Backup[]; plans: Plan[]; tenants: TenantSchool[]; system: SystemInfo;
}
export interface AppState { db: DB; session: { userId: string } | null; prefs: { theme: "light" | "dark"; lang: Lang; mt?: boolean } }

/* ---------- reference data ---------- */
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
export interface CurrencyDef { code: string; name: string; symbol: string; flag: string; rate: number }
export const CURRENCIES: CurrencyDef[] = [
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", flag: "🇷🇼", rate: 1300 },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", flag: "🇨🇩", rate: 2850 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 129 },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", rate: 3750 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", rate: 2620 },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", flag: "🇧🇮", rate: 2950 },
  { code: "XAF", name: "CFA Franc (CEMAC)", symbol: "FCFA", flag: "🇨🇲", rate: 605 },
  { code: "XOF", name: "CFA Franc (UEMOA)", symbol: "CFA", flag: "🇸🇳", rate: 605 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 1550 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭", rate: 15.6 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 18.4 },
  { code: "MAD", name: "Moroccan Dirham", symbol: "DH", flag: "🇲🇦", rate: 10.1 },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", rate: 48.6 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", rate: 3.67 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 83.4 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.79 },
];
export const CURRENCY_MAP: Record<string, CurrencyDef> = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));
const CITY_MAP: Record<string, string[]> = {
  Rwanda: ["Kigali", "Gisenyi", "Butare", "Musanze"], "DR Congo": ["Goma", "Bukavu", "Kinshasa", "Lubumbashi"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"], Uganda: ["Kampala", "Entebbe", "Jinja", "Gulu"],
  Tanzania: ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma"], Burundi: ["Bujumbura", "Gitega"],
  Nigeria: ["Lagos", "Abuja", "Port Harcourt", "Kano"], Ghana: ["Accra", "Kumasi", "Tamale"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban"], Cameroon: ["Douala", "Yaoundé", "Bafoussam"],
  France: ["Paris", "Lyon", "Marseille"], "United Kingdom": ["London", "Manchester", "Birmingham"],
  "United States": ["New York", "Chicago", "Houston"],
};
export const campusesFor = (country: string): Campus[] =>
  (CITY_MAP[country] ?? ["Main Campus", "Branch A", "Branch B"]).map((c, i) => ({
    id: `cp${i + 1}`, name: i === 0 ? "Main Campus" : `Campus ${c}`, city: c, active: i < 3,
  }));

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS = [["08:00", "08:45"], ["08:50", "09:35"], ["09:40", "10:25"], ["10:45", "11:30"], ["11:35", "12:20"], ["13:30", "14:15"], ["14:20", "15:05"]];

export const PERMS: Record<string, string[]> = {
  super: ["*"],
  admin: ["*"],
  principal: ["students", "admissions", "teachers", "classes", "timetable", "attendance", "exams", "grades", "reports_cards", "analytics", "calendar", "documents", "certificates", "communication", "idcards", "settings"],
  accountant: ["students", "fees", "payments", "invoices", "expenses", "fin_reports", "analytics", "documents"],
  teacher: ["students", "attendance", "exams", "grades", "reports_cards", "timetable", "classes", "communication", "calendar", "documents"],
  student: ["portal"],
  parent: ["portal"],
  registrar: ["students", "admissions", "documents", "idcards", "certificates", "calendar"],
  receptionist: ["students", "admissions", "calendar", "documents", "communication"],
  librarian: ["library", "documents", "students"],
  transport: ["transport", "students", "fees"],
  hr: ["hr", "teachers", "documents"],
};
export const can = (role: Role | string | undefined, perm: string) => {
  if (!role) return false;
  const list = PERMS[role] ?? [];
  return list.includes("*") || list.includes(perm);
};

/* ---------- date / format helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
export const daysAhead = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const LOCALES: Record<string, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES", pt: "pt-PT", ar: "ar" };
export const uiLocale = () => { try { return LOCALES[state.prefs.lang] ?? "en-GB"; } catch { return "en-GB"; } };
export const fmtDate = (iso: string) => new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString(uiLocale(), { day: "numeric", month: "short", year: "numeric" });
export const fmtDateShort = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString(uiLocale(), { day: "numeric", month: "short" });
export const fmtNum = (n: number) => new Intl.NumberFormat(uiLocale()).format(n);
export const fmtMoney = (n: number, cur: string) => {
  const c = CURRENCY_MAP[cur];
  const num = new Intl.NumberFormat(uiLocale(), { maximumFractionDigits: 0 }).format(Math.round(n));
  return c ? `${c.symbol} ${num}` : `${num} ${cur}`;
};

/* ---------- FX engine ---------- */
export const convert = (amount: number, from: string, to: string) => {
  if (from === to) return amount;
  return (amount / (CURRENCY_MAP[from]?.rate ?? 1)) * (CURRENCY_MAP[to]?.rate ?? 1);
};
export const fmtMoneyConv = (n: number, from: string, to: string) => fmtMoney(convert(n, from, to), to);
export const fxRateLabel = (from: string, to: string) => {
  const r = (CURRENCY_MAP[to]?.rate ?? 1) / (CURRENCY_MAP[from]?.rate ?? 1);
  return `1 ${from} = ${r >= 100 ? Math.round(r).toLocaleString("en-US") : r >= 10 ? r.toFixed(2) : r.toPrecision(4)} ${to}`;
};
export type RoundingMode = "smart" | "exact" | "hundred";
const roundSmart = (v: number, rate: number) => (rate >= 500 ? Math.round(v / 100) * 100 : rate >= 50 ? Math.round(v / 10) * 10 : Math.round(v));
export const roundBy = (v: number, mode: RoundingMode, rate: number) =>
  mode === "exact" ? Math.round(v * 100) / 100 : mode === "hundred" ? Math.round(v / 100) * 100 : roundSmart(v, rate);
export interface FxResult { converted: number; rate: number; from: string; to: string; breakdown: Record<string, number> }
export function changeCurrency(to: string, opts?: { rate?: number; rounding?: RoundingMode }): FxResult {
  const from = state.db.school.currency;
  const t = CURRENCY_MAP[to];
  const res: FxResult = { converted: 0, rate: 0, from, to, breakdown: {} };
  if (!t || from === to) return res;
  const k = opts?.rate && opts.rate > 0 ? opts.rate : t.rate / (CURRENCY_MAP[from]?.rate ?? 1);
  res.rate = k;
  const mode = opts?.rounding ?? "smart";
  mutate((db) => {
    const conv = (v: number) => roundBy(v * k, mode, t.rate);
    const bump = (cat: string) => { res.breakdown[cat] = (res.breakdown[cat] ?? 0) + 1; res.converted++; };
    db.feeStructures.forEach((f) => f.items.forEach((it) => { it.amount = conv(it.amount); bump("Fee structures"); }));
    db.payments.forEach((p) => { p.amount = conv(p.amount); bump("Payments"); });
    db.expenses.forEach((e) => { e.amount = conv(e.amount); bump("Expenses"); });
    db.teachers.forEach((x) => { x.salary = conv(x.salary); bump("Teacher salaries"); });
    db.staff.forEach((x) => { x.salary = conv(x.salary); bump("Staff salaries"); });
    db.routes.forEach((r) => { r.fee = conv(r.fee); bump("Transport fees"); });
    db.school.lastFx = { from, to, rate: k, date: todayISO(), converted: res.converted };
    db.school.fxUpdatedAt = todayISO();
    db.school.currency = to;
  });
  return res;
}

/* ---------- deterministic PRNG + names ---------- */
let seedState = 42;
const rnd = () => { seedState = (seedState * 1103515245 + 12345) % 2147483648; return seedState / 2147483648; };
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const FIRST_M = ["Eric", "Jean", "Patrick", "Emmanuel", "Claude", "Innocent", "Fabrice", "Didier", "Yves", "Kevin", "Olivier", "Pacifique", "Aime", "Bertrand", "Cedric", "Divin", "Elie", "Fiston", "Gad", "Herve"];
const FIRST_F = ["Alice", "Grace", "Diane", "Claudine", "Josiane", "Solange", "Uwase", "Ines", "Bella", "Nadia", "Keza", "Ishimwe", "Mutesi", "Umutoni", "Ineza", "Shema", "Divine", "Clarisse", "Esperance", "Odette"];
const LAST = ["Niyonzima", "Habimana", "Mugisha", "Uwimana", "Ndayisenga", "Bizimana", "Nshimiyimana", "Hakizimana", "Niyonsaba", "Kagame", "Twagirayezu", "Munyaneza", "Irakoze", "Nkundwa", "Rukundo", "Sibomana", "Tuyishime", "Gatete", "Musoni", "Karera"];
const CITIES = ["Kigali", "Gisenyi", "Butare", "Goma", "Bukavu", "Nairobi", "Kampala"];
const BOOKS: [string, string, string][] = [
  ["Advanced Mathematics S6", "J. Okello", "Mathematics"], ["Physics for Senior Schools", "A. Mwangi", "Sciences"],
  ["Introduction to Computer Science", "P. Dusabe", "ICT"], ["East African History", "R. Kagabo", "Humanities"],
  ["English Grammar in Use", "M. Harper", "Languages"], ["Biology Illustrated", "S. Nakato", "Sciences"],
  ["Entrepreneurship Basics", "D. Murenzi", "Business"], ["Chemistry Practical Guide", "L. Uwera", "Sciences"],
  ["Kinyarwanda Literature", "V. Mukagasana", "Languages"], ["Geography of Africa", "T. Banda", "Humanities"],
  ["Financial Accounting I", "C. Nkusi", "Business"], ["Digital Literacy", "E. Mutabazi", "ICT"],
];
const SUBJECTS_DEF: [string, string, number, number[]][] = [
  ["Mathematics", "MAT", 4, [1, 2, 3, 4, 5, 6]], ["Physics", "PHY", 3, [4, 5, 6]], ["Chemistry", "CHE", 3, [4, 5, 6]],
  ["Biology", "BIO", 3, [4, 5, 6]], ["Computer Science", "CS", 2, [1, 2, 3, 4, 5, 6]], ["English", "ENG", 3, [1, 2, 3, 4, 5, 6]],
  ["Kinyarwanda", "KIN", 2, [1, 2, 3]], ["History & Citizenship", "HC", 2, [1, 2, 3, 4, 5, 6]], ["Geography", "GEO", 2, [1, 2, 3, 4, 5, 6]],
  ["Entrepreneurship", "ENT", 2, [4, 5, 6]], ["Physical Education", "PE", 1, [1, 2, 3]], ["Fine Arts", "ART", 1, [1, 2, 3]],
];
const EXP_CATS = ["Salaries", "Electricity", "Internet", "Rent", "Maintenance", "Supplies", "Transport", "Equipment", "Other"];

/* date helpers used during seeding — must be defined before seed() */
export const monthKeys = (n: number) => {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${m.getFullYear()}-${pad(m.getMonth() + 1)}`); }
  return out;
};
export const monthLabel = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString(uiLocale(), { month: "short" });
export const lastSchoolDays = (n: number) => {
  const out: string[] = [];
  const d = new Date();
  while (out.length < n) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() - 1); }
  return out.reverse();
};

/* ---------- store ---------- */
const KEY = "vitech-state-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
export { uid };

function seed(): DB {
  seedState = 42;
  const classes: ClassSec[] = [];
  const teachers: Teacher[] = [];
  for (let l = 1; l <= 6; l++) {
    for (const sec of ["A", "B"]) {
      const t = { id: uid(), empNo: `EMP-${100 + teachers.length}`, first: teachers.length % 2 ? pick(FIRST_F) : pick(FIRST_M), last: pick(LAST), gender: (teachers.length % 2 ? "F" : "M") as "M" | "F", phone: "+250 78" + Math.floor(rnd() * 9000000 + 1000000), email: `teacher${teachers.length + 1}@vitech.academy`, qualification: pick(["B.Ed", "M.Sc", "B.Sc", "PGDE"]), specialization: SUBJECTS_DEF[teachers.length % SUBJECTS_DEF.length][0], hireDate: daysAgo(Math.floor(rnd() * 900) + 90), salary: Math.floor(180000 + rnd() * 320000), bank: "BK " + Math.floor(rnd() * 9e9 + 1e9), subjects: [SUBJECTS_DEF[teachers.length % SUBJECTS_DEF.length][0]], classIds: [] as string[], status: "active" as const, hue: Math.floor(rnd() * 360) };
      teachers.push(t);
      classes.push({ id: `c${l}${sec}`, name: `Senior ${l}`, section: sec, level: l, room: `R-${l}0${sec === "A" ? 1 : 2}`, capacity: 42, teacherId: t.id });
    }
  }
  const subjects: Subject[] = SUBJECTS_DEF.map(([name, code, credits, classLevels]) => ({
    id: uid(), name, code, credits, classLevels,
    teacherIds: [teachers.find((t) => t.specialization === name)?.id ?? teachers[0].id],
  }));
  const students: Student[] = [];
  for (let i = 0; i < 240; i++) {
    const g = i % 2 === 0 ? "M" : "F";
    const first = g === "M" ? pick(FIRST_M) : pick(FIRST_F);
    const cls = pick(classes);
    students.push({
      id: `st${i}`, regNo: `VA-2025-${String(i + 1).padStart(4, "0")}`, first, last: pick(LAST), gender: g,
      dob: `${2025 - cls.level - Math.floor(rnd() * 3 + 12)}-${pad(Math.floor(rnd() * 12) + 1)}-${pad(Math.floor(rnd() * 27) + 1)}`,
      nationality: pick(["Rwandan", "Rwandan", "Rwandan", "Congolese", "Burundian", "Ugandan"]),
      phone: "+250 78" + Math.floor(rnd() * 9000000 + 1000000), email: "", address: pick(CITIES), prevSchool: pick(["GS Remera", "EP Kicukiro", "GS Nyamirambo", ""]),
      admitted: daysAgo(Math.floor(rnd() * 240) + 5), classId: cls.id, status: "active", hue: Math.floor(rnd() * 360),
      parent: { name: `${pick(["Mr", "Mrs"])} ${pick(LAST)}`, relation: pick(["Father", "Mother", "Guardian"]), phone: "+250 72" + Math.floor(rnd() * 9000000 + 1000000), email: "", occupation: pick(["Trader", "Farmer", "Teacher", "Engineer", "Nurse", "Driver"]), emergency: "+250 73" + Math.floor(rnd() * 9000000 + 1000000) },
    });
  }
  /* exams + grades */
  const exams: Exam[] = [
    { id: "ex1", name: "End of Term 1 Examination", term: "Term 1", date: daysAgo(45), status: "completed", classLevels: [1, 2, 3, 4, 5, 6], subjectIds: subjects.slice(0, 6).map((s) => s.id), maxScore: 100 },
    { id: "ex2", name: "Mid-Term 2 Examination", term: "Term 2", date: daysAgo(10), status: "completed", classLevels: [1, 2, 3, 4, 5, 6], subjectIds: subjects.slice(0, 6).map((s) => s.id), maxScore: 100 },
    { id: "ex3", name: "End of Term 2 Examination", term: "Term 2", date: daysAhead(21), status: "scheduled", classLevels: [1, 2, 3, 4, 5, 6], subjectIds: subjects.map((s) => s.id), maxScore: 100 },
  ];
  const grades: Grade[] = [];
  students.forEach((st) => exams.filter((e) => e.status === "completed").forEach((ex) => {
    ex.subjectIds.forEach((sid) => { const base = 35 + rnd() * 55; grades.push({ id: uid(), examId: ex.id, studentId: st.id, subjectId: sid, score: Math.round(Math.min(100, base + rnd() * 12)) }); });
  }));
  /* fees + payments + expenses */
  const feeStructures: FeeStructure[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    level, items: [
      { id: uid(), name: "Tuition", amount: 120000 + level * 15000 },
      { id: uid(), name: "Registration", amount: 20000 },
      { id: uid(), name: "Examination", amount: 10000 },
    ],
  }));
  const feeFor = (level: number) => feeStructures.find((f) => f.level === level)!.items.reduce((a, b) => a + b.amount, 0);
  const methods = ["Mobile Money", "Cash", "Bank", "Mobile Money", "Card", "Mobile Money"];
  const feeTypes = ["Tuition", "Registration", "Examination", "Transport"];
  const payments: Payment[] = [];
  const mk = monthKeys(8);
  mk.forEach((m, mi) => {
    const count = 26 + Math.floor(rnd() * 14);
    for (let i = 0; i < count; i++) {
      const st = pick(students);
      const lvl = classes.find((c) => c.id === st.classId)!.level;
      payments.push({ id: uid(), receipt: `RC-${m.slice(2).replace("-", "")}-${String(payments.length + 1).padStart(4, "0")}`, studentId: st.id, amount: Math.round(feeFor(lvl) * (0.25 + rnd() * 0.6)), method: pick(methods), feeType: pick(feeTypes), date: `${m}-${pad(Math.floor(rnd() * 27) + 1)}` });
    }
    void mi;
  });
  const expenses: Expense[] = [];
  mk.forEach((m) => {
    for (let i = 0; i < 7 + Math.floor(rnd() * 4); i++) {
      const cat = pick(EXP_CATS);
      expenses.push({ id: uid(), category: cat, desc: `${cat} — ${pick(["monthly settlement", "vendor invoice", "emergency purchase", "scheduled payment"])}`, amount: cat === "Salaries" ? Math.floor(900000 + rnd() * 600000) : Math.floor(8000 + rnd() * 90000), date: `${m}-${pad(Math.floor(rnd() * 27) + 1)}`, vendor: pick(["WASAC", "REG Ltd", "MTN", "Airtel", "Bookshop Kigali", "Local supplier"]), method: pick(["Bank", "Cash", "Mobile Money"]), by: "Jean Bosco" });
    }
  });
  /* timetable */
  const timetable: TTSlot[] = [];
  classes.forEach((c) => {
    DAYS.forEach((_, day) => {
      const subs = subjects.filter((s) => s.classLevels.includes(c.level));
      for (let p = 0; p < 7; p++) {
        if (rnd() < 0.82) {
          const sub = subs[p % subs.length];
          timetable.push({ id: uid(), classId: c.id, subjectId: sub.id, teacherId: sub.teacherIds[0], room: c.room, day, start: PERIODS[p][0], end: PERIODS[p][1] });
        }
      }
    });
  });
  /* library, transport, hr, docs, certs */
  const books: Book[] = BOOKS.map(([title, author, category]) => { const copies = 4 + Math.floor(rnd() * 8); return { id: uid(), title, author, category, isbn: `978-99${Math.floor(rnd() * 9000 + 1000)}-${Math.floor(rnd() * 90 + 10)}-${Math.floor(rnd() * 9)}`, copies, available: copies - Math.floor(rnd() * 3) }; });
  const loans: Loan[] = books.slice(0, 6).map((b, i) => ({ id: uid(), bookId: b.id, borrower: `${students[i].first} ${students[i].last}`, type: "student", date: daysAgo(Math.floor(rnd() * 12) + 1), due: daysAhead(i % 3 === 0 ? -2 : 8), returned: null, fine: i % 3 === 0 ? 1500 : 0 }));
  const routes: Route[] = [
    { id: "r1", name: "Route Nord", stops: ["Remera", "Kacyiru", "Gisozi", "School"], fee: 45000, students: 34 },
    { id: "r2", name: "Route Sud", stops: ["Kicukiro", "Kanombe", "Masaka", "School"], fee: 45000, students: 28 },
    { id: "r3", name: "Route Ouest", stops: ["Nyamirambo", "Kimisagara", "School"], fee: 38000, students: 22 },
  ];
  const vehicles: Vehicle[] = [
    { id: "v1", plate: "RAD 452 A", model: "Coaster Bus 30", capacity: 30, driver: "A. Nkurunziza", insurance: "Valid until 12/2026", status: "active", routeId: "r1" },
    { id: "v2", plate: "RAD 781 B", model: "Coaster Bus 30", capacity: 30, driver: "J. Ndayambaje", insurance: "Valid until 08/2026", status: "active", routeId: "r2" },
    { id: "v3", plate: "RAE 233 C", model: "Hiace 18", capacity: 18, driver: "E. Habiyaremye", insurance: "Valid until 03/2026", status: "maintenance", routeId: "r3" },
  ];
  const staff: Staff[] = [
    { id: uid(), empNo: "ADM-01", name: "Jean Bosco", dept: "Administration", position: "School Administrator", hired: daysAgo(800), salary: 650000, status: "active" },
    { id: uid(), empNo: "FIN-02", name: "Marie Claire", dept: "Finance", position: "Accountant", hired: daysAgo(600), salary: 420000, status: "active" },
    { id: uid(), empNo: "REG-03", name: "Patrick Nsengimana", dept: "Registry", position: "Registrar", hired: daysAgo(500), salary: 320000, status: "active" },
    { id: uid(), empNo: "LIB-04", name: "Solange Uwera", dept: "Library", position: "Librarian", hired: daysAgo(400), salary: 240000, status: "active" },
    { id: uid(), empNo: "SEC-05", name: "Eric Manzi", dept: "Security", position: "Security Guard", hired: daysAgo(700), salary: 150000, status: "active" },
    { id: uid(), empNo: "CLN-06", name: "Josiane Mukamana", dept: "Operations", position: "Cleaner", hired: daysAgo(650), salary: 120000, status: "leave" },
  ];
  const leaves: Leave[] = [
    { id: uid(), staffName: "Josiane Mukamana", type: "Sick leave", from: daysAgo(3), to: daysAhead(4), status: "approved" },
    { id: uid(), staffName: "Eric Manzi", type: "Annual leave", from: daysAhead(10), to: daysAhead(20), status: "pending" },
    { id: uid(), staffName: "Marie Claire", type: "Family leave", from: daysAhead(30), to: daysAhead(33), status: "pending" },
  ];
  const documents: Doc[] = [
    { id: uid(), name: "School Policy Handbook 2026.pdf", category: "School policies", size: "2.4 MB", date: daysAgo(30), by: "Jean Bosco", kind: "pdf" },
    { id: uid(), name: "Term 2 Fee Structure.xls", category: "Financial documents", size: "310 KB", date: daysAgo(20), by: "Marie Claire", kind: "xls" },
    { id: uid(), name: "Student Code of Conduct.pdf", category: "School policies", size: "1.1 MB", date: daysAgo(60), by: "Jean Bosco", kind: "pdf" },
    { id: uid(), name: "Staff Contracts Template.doc", category: "Teacher documents", size: "180 KB", date: daysAgo(90), by: "HR Office", kind: "doc" },
    { id: uid(), name: "Graduation Ceremony Photos.zip", category: "School events", size: "48 MB", date: daysAgo(120), by: "Communication", kind: "img" },
    { id: uid(), name: "Annual Budget 2026.xls", category: "Financial documents", size: "520 KB", date: daysAgo(15), by: "Marie Claire", kind: "xls" },
  ];
  const certificates: Certificate[] = [
    { id: uid(), code: "VTC-2025-1187", type: "Certificate of Graduation", recipient: "Eric Niyonzima", date: daysAgo(120), note: "Senior 6 — Class of 2025", valid: true },
    { id: uid(), code: "VTC-2025-2244", type: "Certificate of Completion", recipient: "Alice Uwimana", date: daysAgo(80), note: "Computer Science programme", valid: true },
    { id: uid(), code: "VTC-2026-4821", type: "Attendance Certificate", recipient: "Grace Mugisha", date: daysAgo(20), note: "Term 1 2026 — 98% attendance", valid: true },
    { id: uid(), code: "VTC-2024-0312", type: "Training Certificate", recipient: "Patrick Habimana", date: daysAgo(400), note: "Revoked after re-issue", valid: false },
  ];
  const users: User[] = [
    { id: "u1", name: "Jean Bosco", email: "admin@vitech.academy", pass: "demo1234", role: "admin", twoFA: true, hue: 215 },
    { id: "u2", name: "Super Admin", email: "super@vitech.school", pass: "demo1234", role: "super", twoFA: false, hue: 260 },
    { id: "u3", name: "Dr. Uwase Solange", email: "principal@vitech.academy", pass: "demo1234", role: "principal", twoFA: false, hue: 160 },
    { id: "u4", name: "Marie Claire", email: "finance@vitech.academy", pass: "demo1234", role: "accountant", twoFA: false, hue: 30 },
    { id: "u5", name: `${teachers[0].first} ${teachers[0].last}`, email: "teacher@vitech.academy", pass: "demo1234", role: "teacher", twoFA: false, hue: 200 },
    { id: "u6", name: `${students[0].first} ${students[0].last}`, email: "student@vitech.academy", pass: "demo1234", role: "student", twoFA: false, hue: 320 },
    { id: "u7", name: "Mr. Niyonzima", email: "parent@vitech.academy", pass: "demo1234", role: "parent", twoFA: false, hue: 90 },
    { id: "u8", name: "Patrick Nsengimana", email: "registrar@vitech.academy", pass: "demo1234", role: "registrar", twoFA: false, hue: 120 },
    { id: "u9", name: "Diane Ingabire", email: "front@vitech.academy", pass: "demo1234", role: "receptionist", twoFA: false, hue: 280 },
    { id: "u10", name: "Solange Uwera", email: "library@vitech.academy", pass: "demo1234", role: "librarian", twoFA: false, hue: 45 },
    { id: "u11", name: "A. Nkurunziza", email: "transport@vitech.academy", pass: "demo1234", role: "transport", twoFA: false, hue: 190 },
    { id: "u12", name: "HR Office", email: "hr@vitech.academy", pass: "demo1234", role: "hr", twoFA: false, hue: 350 },
  ];
  const notifications: Notif[] = [
    { id: uid(), type: "payment", title: "Payment received", body: `${fmtNum(85000)} RWF via Mobile Money — RC-260214`, date: daysAgo(0), read: false },
    { id: uid(), type: "absent", title: "3 absence alerts sent", body: "Parents notified by SMS this morning", date: daysAgo(0), read: false },
    { id: uid(), type: "admission", title: "New admission application", body: "APP-2026-018 awaits review", date: daysAgo(1), read: false },
    { id: uid(), type: "exam", title: "Exam reminder", body: "End of Term 2 Examination begins in 21 days", date: daysAgo(1), read: true },
    { id: uid(), type: "fee", title: "14 students overdue", body: "Bulk SMS reminder suggested", date: daysAgo(2), read: true },
  ];
  const events: SchoolEvent[] = [
    { id: uid(), title: "End of Term 2 Examination", date: daysAhead(21), kind: "exam", note: "All levels · 5 days" },
    { id: uid(), title: "Parent–Teacher Meeting", date: daysAhead(7), kind: "meeting", note: "Main hall · 09:00" },
    { id: uid(), title: "Inter-school Football Cup", date: daysAhead(12), kind: "sports", note: "Regional stadium" },
    { id: uid(), title: "Science Fair", date: daysAhead(4), kind: "event", note: "Laboratory block" },
    { id: uid(), title: "Mid-term break", date: daysAhead(30), kind: "holiday", note: "One week" },
    { id: uid(), title: "Graduation Ceremony", date: daysAhead(75), kind: "graduation", note: "Class of 2026" },
  ];
  const admissions: Admission[] = [
    { id: uid(), appNo: "APP-2026-014", first: "Kevin", last: "Mugisha", gender: "M", level: 4, date: daysAgo(2), stage: "application", parent: "Mr. Mugisha", phone: "+250 788 111 222" },
    { id: uid(), appNo: "APP-2026-015", first: "Bella", last: "Ishimwe", gender: "F", level: 1, date: daysAgo(3), stage: "review", parent: "Mrs. Ishimwe", phone: "+250 722 333 444" },
    { id: uid(), appNo: "APP-2026-016", first: "Divin", last: "Karera", gender: "M", level: 6, date: daysAgo(5), stage: "approved", parent: "Mr. Karera", phone: "+250 733 555 666" },
    { id: uid(), appNo: "APP-2026-017", first: "Keza", last: "Uwase", gender: "F", level: 2, date: daysAgo(6), stage: "enrolled", parent: "Mrs. Uwase", phone: "+250 788 777 888" },
    { id: uid(), appNo: "APP-2026-018", first: "Elie", last: "Ndayisenga", gender: "M", level: 3, date: daysAgo(1), stage: "application", parent: "Mr. Ndayisenga", phone: "+250 722 999 000" },
  ];
  const audits: Audit[] = [
    { id: uid(), user: "Jean Bosco", role: "admin", action: "ENTER_ATTENDANCE", entity: "Attendance", detail: "Senior 4 A — 41 records", date: `${daysAgo(0)} 08:12`, ip: "41.74.160.12", device: "Chrome · Windows" },
    { id: uid(), user: "Marie Claire", role: "accountant", action: "RECORD_PAYMENT", entity: "Payments", detail: "RC-260214 · 85,000 RWF", date: `${daysAgo(0)} 09:41`, ip: "41.74.160.15", device: "Chrome · Windows" },
    { id: uid(), user: "Dr. Uwase Solange", role: "principal", action: "APPROVE_ADMISSION", entity: "Admissions", detail: "APP-2026-016 approved", date: `${daysAgo(1)} 14:22`, ip: "154.66.140.8", device: "Safari · macOS" },
    { id: uid(), user: "Jean Bosco", role: "admin", action: "CHANGE_CURRENCY", entity: "Finance", detail: "RWF → USD · 612 records", date: `${daysAgo(1)} 11:05`, ip: "41.74.160.12", device: "Chrome · Windows" },
    { id: uid(), user: "Solange Uwera", role: "librarian", action: "BORROW_BOOK", entity: "Library", detail: "Physics for Senior Schools", date: `${daysAgo(2)} 10:30`, ip: "41.74.161.3", device: "Edge · Windows" },
    { id: uid(), user: "Super Admin", role: "super", action: "UPDATE_PLAN", entity: "Platform", detail: "Professional plan → $49", date: `${daysAgo(3)} 16:48`, ip: "105.112.88.20", device: "Chrome · Linux" },
  ];
  const backups: Backup[] = [
    { id: uid(), date: `${daysAgo(0)} 02:00`, size: "49.2 MB", type: "auto", status: "ok" },
    { id: uid(), date: `${daysAgo(1)} 02:00`, size: "48.9 MB", type: "auto", status: "ok" },
    { id: uid(), date: `${daysAgo(2)} 02:00`, size: "48.6 MB", type: "auto", status: "ok" },
    { id: uid(), date: `${daysAgo(2)} 15:32`, size: "48.7 MB", type: "manual", status: "ok" },
    { id: uid(), date: `${daysAgo(3)} 02:00`, size: "48.1 MB", type: "auto", status: "ok" },
  ];
  const plans: Plan[] = [
    { id: "p1", name: "Starter", price: 19, students: 300, teachers: 20, storage: "5 GB", sms: 500, period: "per month", features: ["Student management", "Attendance", "Grades & report cards", "Fees & receipts", "Email support"] },
    { id: "p2", name: "Professional", price: 49, students: 1000, teachers: 60, storage: "25 GB", sms: 2000, period: "per month", highlight: true, features: ["Everything in Starter", "SMS / WhatsApp center", "Financial reports", "Library & transport", "Timetable + conflicts", "Priority support"] },
    { id: "p3", name: "Enterprise", price: 149, students: "Unlimited", teachers: "Unlimited", storage: "200 GB", sms: 10000, period: "per month", features: ["Everything in Professional", "Multi-campus groups", "Super admin console", "Custom branding", "API access", "Dedicated manager"] },
  ];
  const tenants: TenantSchool[] = [
    { id: "t1", name: "VITECH International Academy", city: "Kigali, Rwanda", plan: "Professional", students: 620, status: "active", mrr: 49, joined: daysAgo(240) },
    { id: "t2", name: "Groupe Scolaire Lumumba", city: "Goma, DRC", plan: "Enterprise", students: 1450, status: "active", mrr: 149, joined: daysAgo(400) },
    { id: "t3", name: "Green Hills Academy", city: "Nairobi, Kenya", plan: "Professional", students: 780, status: "active", mrr: 49, joined: daysAgo(160) },
    { id: "t4", name: "Lakeview College", city: "Kampala, Uganda", plan: "Starter", students: 210, status: "trial", mrr: 0, joined: daysAgo(9) },
    { id: "t5", name: "Excellence Institute", city: "Bujumbura, Burundi", plan: "Starter", students: 180, status: "active", mrr: 19, joined: daysAgo(310) },
    { id: "t6", name: "Sunrise Schools", city: "Lagos, Nigeria", plan: "Professional", students: 900, status: "suspended", mrr: 0, joined: daysAgo(500) },
  ];
  const templates: Template[] = [
    { id: uid(), key: "absence", name: "Absence alert", channel: "SMS", body: "Dear Parent, your child [STUDENT_NAME] was absent from school today. — [SCHOOL_NAME]" },
    { id: uid(), key: "payment", name: "Payment confirmation", channel: "SMS", body: "Payment of [AMOUNT] received for [STUDENT_NAME]. Remaining balance: [BALANCE]. — [SCHOOL_NAME]" },
    { id: uid(), key: "exam", name: "Exam reminder", channel: "WhatsApp", body: "Dear Parent, [STUDENT_NAME] has an upcoming examination on [DATE]. — [SCHOOL_NAME]" },
    { id: uid(), key: "announcement", name: "General announcement", channel: "Email", body: "Dear [PARENT_NAME],\n\n[MESSAGE]\n\nRegards,\n[SCHOOL_NAME]" },
  ];
  const announcements: Announcement[] = [
    { id: uid(), title: "End of Term 2 Examination timetable published", body: "The full examination timetable for all levels is now available. Students should check the notice board and their portals.", audience: "All students", date: daysAgo(1), by: "Dr. Uwase Solange", pinned: true },
    { id: uid(), title: "Parent–Teacher Meeting", body: "We invite all parents to the term meeting in the main hall. Attendance registers and fee statements will be shared.", audience: "All parents", date: daysAgo(3), by: "Jean Bosco" },
    { id: uid(), title: "Staff development day", body: "Teaching staff are invited to a pedagogy workshop in the ICT lab at 14:00.", audience: "All teachers", date: daysAgo(5), by: "HR Office" },
  ];
  return {
    v: 3,
    school: {
      name: "VITECH International Academy", short: "VIA", logoText: "VITECH", motto: "Knowledge · Discipline · Excellence",
      address: "KG 201 St, Kacyiru, Kigali", phone: "+250 788 000 111", email: "info@vitech.academy", website: "vitech.academy",
      country: "Rwanda", currency: "RWF", timezone: "Africa/Kigali", dateFormat: "DD/MM/YYYY", academicYear: "2025–2026", term: "Term 2",
      terms: ["Term 1", "Term 2", "Term 3"], brandColor: "#1e49c9", receiptPrefix: "RC", regPrefix: "VA", onboarded: true,
      fxUpdatedAt: daysAgo(1), lastFx: null,
      grading: [
        { grade: "A", label: "Excellent", min: 80 }, { grade: "B", label: "Very Good", min: 70 },
        { grade: "C", label: "Good", min: 60 }, { grade: "D", label: "Pass", min: 50 }, { grade: "F", label: "Fail", min: 0 },
      ],
      passMark: 50,
    },
    campuses: campusesFor("Rwanda"),
    users, rolePerms: PERMS, students, admissions, teachers, classes, subjects, timetable, attendanceOverrides: {},
    exams, grades, feeStructures, payments, expenses, announcements, templates,
    commLogs: [
      { id: uid(), channel: "SMS", to: "+250 78••••21", body: "Dear Parent, your child Eric Niyonzima was absent from school today.", date: daysAgo(0), status: "sent" },
      { id: uid(), channel: "WhatsApp", to: "+250 72••••87", body: "Payment of 85,000 RWF received for Alice Uwimana.", date: daysAgo(1), status: "sent" },
      { id: uid(), channel: "Email", to: "parents@list", body: "Parent–Teacher Meeting invitation", date: daysAgo(3), status: "sent" },
      { id: uid(), channel: "SMS", to: "+250 73••••02", body: "Fee reminder — balance 40,000 RWF", date: daysAgo(2), status: "queued" },
    ],
    notifications, events, books, loans, vehicles, routes, staff, leaves, documents, certificates, audits, backups, plans, tenants,
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

/* ---------- persistence + subscriptions ---------- */
function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s?.db?.v === 3) {
        if (!LANG_CODES.includes(s.prefs?.lang)) s.prefs = { theme: s.prefs?.theme === "dark" ? "dark" : "light", lang: "en" };
        if (!s.db.system) s.db.system = { version: "3.2.0", channel: "stable", autoUpdate: true, available: "3.3.0", history: [] };
        return s;
      }
    }
  } catch { /* corrupted -> reseed */ }
  return { db: seed(), session: null, prefs: { theme: "light", lang: "en", mt: true } };
}
let state: AppState = load();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ } };

export const getState = () => state;
export function mutate(fn: (db: DB) => void) { fn(state.db); persist(); emit(); }
export function setSession(s: { userId: string } | null) { state = { ...state, session: s }; persist(); emit(); }
export function setPrefs(p: Partial<AppState["prefs"]>) { state = { ...state, prefs: { ...state.prefs, ...p } }; persist(); emit(); }
export function resetDemo() { state = { ...state, db: seed() }; persist(); emit(); }
export function useApp(): AppState {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state);
}
export const me = (s: AppState) => (s.session ? s.db.users.find((u) => u.id === s.session!.userId) ?? null : null);

/* ---------- business helpers ---------- */
export function audit(action: string, entity: string, detail: string) {
  const u = me(state);
  state.db.audits.unshift({ id: uid(), user: u?.name ?? "System", role: u?.role ?? "system", action, entity, detail, date: `${todayISO()} ${new Date().toTimeString().slice(0, 5)}`, ip: "41.74.160.12", device: navigator.userAgent.includes("Mac") ? "Safari · macOS" : navigator.userAgent.includes("Android") ? "Chrome · Android" : "Chrome · Windows" });
  state.db.audits = state.db.audits.slice(0, 120);
  persist(); emit();
}
export function notify(type: string, title: string, body: string) {
  state.db.notifications.unshift({ id: uid(), type, title, body, date: todayISO(), read: false });
  state.db.notifications = state.db.notifications.slice(0, 30);
  persist(); emit();
}
export function logComm(channel: string, to: string, body: string) {
  state.db.commLogs.unshift({ id: uid(), channel, to, body, date: todayISO(), status: "sent" });
  state.db.commLogs = state.db.commLogs.slice(0, 60);
  persist(); emit();
}

const hash01 = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };
export const attStatus = (db: DB, date: string, studentId: string): string =>
  db.attendanceOverrides[`${date}:${studentId}`] ?? (hash01(date + studentId) < 0.9 ? "P" : hash01(studentId + date) < 0.5 ? "L" : "A");
export function setAtt(date: string, studentId: string, st: string) {
  state.db.attendanceOverrides[`${date}:${studentId}`] = st;
  persist(); emit();
}
export const attPct = (db: DB, date: string, classId?: string) => {
  const list = db.students.filter((x) => x.status === "active" && (!classId || x.classId === classId));
  if (!list.length) return 100;
  const p = list.filter((x) => ["P", "L"].includes(attStatus(db, date, x.id))).length;
  return Math.round((p / list.length) * 100);
};
export const classOf = (db: DB, st: Student) => db.classes.find((c) => c.id === st.classId);
export const feeTotal = (db: DB, level: number) => db.feeStructures.find((f) => f.level === level)?.items.reduce((a, b) => a + b.amount, 0) ?? 0;
export const paidBy = (db: DB, studentId: string) => db.payments.filter((p) => p.studentId === studentId).reduce((a, b) => a + b.amount, 0);
export const gradeLetter = (db: DB, score: number) => [...db.school.grading].sort((a, b) => b.min - a.min).find((g) => score >= g.min) ?? db.school.grading[db.school.grading.length - 1];
export const examAvg = (db: DB, examId: string, studentId: string) => {
  const gs = db.grades.filter((g) => g.examId === examId && g.studentId === studentId);
  return gs.length ? gs.reduce((a, b) => a + b.score, 0) / gs.length : 0;
};
export const classRanking = (db: DB, examId: string, classId: string) => {
  const list = db.students.filter((x) => x.classId === classId && x.status === "active");
  return list
    .map((s) => {
      const gs = db.grades.filter((g) => g.examId === examId && g.studentId === s.id);
      return { s, avg: gs.length ? gs.reduce((a, b) => a + b.score, 0) / gs.length : 0, subjects: gs.length };
    })
    .sort((a, b) => b.avg - a.avg);
};
export interface Conflict { teacherId: string; day: number; start: string; classes: string[] }
export const findConflicts = (db: DB): Conflict[] => {
  const map = new Map<string, Set<string>>();
  db.timetable.forEach((t) => {
    const k = `${t.teacherId}|${t.day}|${t.start}`;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k)!.add(t.classId);
  });
  const out: Conflict[] = [];
  map.forEach((set, k) => {
    if (set.size > 1) {
      const [teacherId, day, start] = k.split("|");
      out.push({ teacherId, day: +day, start, classes: [...set] });
    }
  });
  return out.slice(0, 6);
};
export const collectionRate = (db: DB) => {
  const active = db.students.filter((x) => x.status === "active");
  const due = active.reduce((a, x) => a + feeTotal(db, classOf(db, x)?.level ?? 1), 0);
  const paid = active.reduce((a, x) => a + Math.min(paidBy(db, x.id), feeTotal(db, classOf(db, x)?.level ?? 1)), 0);
  return due ? Math.round((paid / due) * 100) : 0;
};
export const initials = (a: string, b: string) => ((a?.[0] ?? "") + (b?.[0] ?? "")).toUpperCase();
