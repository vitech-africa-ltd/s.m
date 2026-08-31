import type { Lang } from "./data";

const en: Record<string, string> = {
  dashboard: "Dashboard", students: "Students", teachers: "Teachers", classes: "Classes", subjects: "Subjects",
  timetable: "Timetable", attendance: "Attendance", exams: "Exams", fees: "Fees & Structures", payments: "Payments",
  invoices: "Invoices", expenses: "Expenses", fin_reports: "Financial Reports", communication: "Communication",
  announcements: "Announcements", calendar: "Calendar", library: "Library", transport: "Transport", hr: "HR & Staff",
  documents: "Documents", certificates: "Certificates", idcards: "ID Cards", audit: "Audit Logs", backups: "Backups",
  analytics: "Analytics", settings: "Settings", platform: "Platform (SaaS)", admissions: "Admissions", portal: "My Portal",
  overview: "Overview", people: "People", academics: "Academics", finance: "Finance", engagement: "Engagement",
  management: "Management", operations: "Operations", search: "Search anything…", notifications: "Notifications",
  logout: "Sign out", save: "Save changes", cancel: "Cancel", add: "Add", edit: "Edit", delete: "Delete", print: "Print",
  export: "Export", import: "Import", download: "Download", new_student: "New student", all: "All", status: "Status",
  actions: "Actions", name: "Name", class: "Class", amount: "Amount", date: "Date", today: "Today", welcome: "Welcome back",
};
const fr: Record<string, string> = {
  dashboard: "Tableau de bord", students: "Étudiants", teachers: "Enseignants", classes: "Classes", subjects: "Matières",
  timetable: "Emploi du temps", attendance: "Présences", exams: "Examens", fees: "Frais & structures", payments: "Paiements",
  invoices: "Factures", expenses: "Dépenses", fin_reports: "Rapports financiers", communication: "Communication",
  announcements: "Annonces", calendar: "Calendrier", library: "Bibliothèque", transport: "Transport", hr: "RH & Personnel",
  documents: "Documents", certificates: "Certificats", idcards: "Cartes d'identité", audit: "Journaux d'audit", backups: "Sauvegardes",
  analytics: "Analytique", settings: "Paramètres", platform: "Plateforme (SaaS)", admissions: "Admissions", portal: "Mon portail",
  overview: "Aperçu", people: "Personnes", academics: "Académique", finance: "Finances", engagement: "Communication",
  management: "Gestion", operations: "Opérations", search: "Rechercher…", notifications: "Notifications",
  logout: "Déconnexion", save: "Enregistrer", cancel: "Annuler", add: "Ajouter", edit: "Modifier", delete: "Supprimer",
  print: "Imprimer", export: "Exporter", import: "Importer", download: "Télécharger", new_student: "Nouvel étudiant",
  all: "Tous", status: "Statut", actions: "Actions", name: "Nom", class: "Classe", amount: "Montant", date: "Date",
  today: "Aujourd'hui", welcome: "Bon retour",
};
const rw: Record<string, string> = {
  dashboard: "Ahabanza", students: "Abanyeshuri", teachers: "Abarimu", classes: "Amashuri", subjects: "Amasomo",
  timetable: "Gahunda y'amasomo", attendance: "Ubwitabire", exams: "Ibizamini", fees: "Amafaranga y'ishuri",
  payments: "Ubwishyu", invoices: "Inyemezabwishyu", expenses: "Amadeni", fin_reports: "Raporo z'imari",
  communication: "Itumanaho", announcements: "Amatangazo", calendar: "Karendari", library: "Isomero",
  transport: "Ubwikorezi", hr: "Abakozi", documents: "Inyandiko", certificates: "Impamyabumenyi",
  idcards: "Indangamuntu", audit: "Igenzura", backups: "Ububiko", analytics: "Isesengura", settings: "Igenamiterere",
  platform: "Urubuga (SaaS)", admissions: "Iyandikisha", portal: "Konti yanjye", overview: "Incamake",
  people: "Abantu", academics: "Amasomo", finance: "Imari", engagement: "Itumanaho", management: "Imicungire",
  operations: "Ibikorwa", search: "Shakisha…", notifications: "Itumanaho", logout: "Sohoka", save: "Bika",
  cancel: "Hagarika", add: "Ongeraho", edit: "Hindura", delete: "Siba", print: "Capa", export: "Kohereza",
  import: "Kwinjiza", download: "Kuramo", new_student: "Umunyeshuri mushya", all: "Byose", status: "Imimerere",
  actions: "Ibikorwa", name: "Izina", class: "Ishuri", amount: "Amafaranga", date: "Itariki", today: "Uyu munsi",
  welcome: "Murakaza neza",
};
const sw: Record<string, string> = {
  dashboard: "Dashibodi", students: "Wanafunzi", teachers: "Walimu", classes: "Madarasa", subjects: "Masomo",
  timetable: "Ratiba", attendance: "Mahudhurio", exams: "Mitihani", fees: "Ada za shule", payments: "Malipo",
  invoices: "Ankara", expenses: "Matumizi", fin_reports: "Ripoti za fedha", communication: "Mawasiliano",
  announcements: "Matangazo", calendar: "Kalenda", library: "Maktaba", transport: "Usafiri", hr: "Rasilimali watu",
  documents: "Nyaraka", certificates: "Vyeti", idcards: "Kadi za kitambulisho", audit: "Kumbukumbu", backups: "Hifadhi",
  analytics: "Uchambuzi", settings: "Mipangilio", platform: "Jukwaa (SaaS)", admissions: "Usajili", portal: "Portal yangu",
  overview: "Muhtasari", people: "Watu", academics: "Elimu", finance: "Fedha", engagement: "Mawasiliano",
  management: "Usimamizi", operations: "Shughuli", search: "Tafuta…", notifications: "Arifa", logout: "Toka",
  save: "Hifadhi", cancel: "Ghairi", add: "Ongeza", edit: "Hariri", delete: "Futa", print: "Chapisha", export: "Hamisha",
  import: "Ingiza", download: "Pakua", new_student: "Mwanafunzi mpya", all: "Zote", status: "Hali", actions: "Vitendo",
  name: "Jina", class: "Darasa", amount: "Kiasi", date: "Tarehe", today: "Leo", welcome: "Karibu tena",
};
const dicts: Record<Lang, Record<string, string>> = { en, fr, rw, sw };
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" }, { code: "fr", label: "Français" },
  { code: "rw", label: "Ikinyarwanda" }, { code: "sw", label: "Kiswahili" },
];
export const t = (lang: Lang, key: string) => dicts[lang][key] ?? en[key] ?? key;
