import { useApp, LANG_CODES, type Lang } from "./data";
import { mtGet, onMT, requestMT } from "./mt";

type Dict = Record<string, string>;

const en: Dict = {};

const fr: Dict = {
  "Dashboard": "Tableau de bord", "Students": "Étudiants", "Teachers": "Enseignants", "Classes": "Classes", "Subjects": "Matières",
  "Timetable": "Emploi du temps", "Attendance": "Présences", "Exams": "Examens", "Grades": "Notes", "Report cards": "Bulletins",
  "Fees & Structures": "Frais & structures", "Payments": "Paiements", "Invoices": "Factures", "Expenses": "Dépenses",
  "Financial Reports": "Rapports financiers", "Communication": "Communication", "Announcements": "Annonces", "Calendar": "Calendrier",
  "Library": "Bibliothèque", "Transport": "Transport", "Documents": "Documents", "Certificates": "Certificats",
  "ID cards": "Cartes d'identité", "Audit logs": "Journaux d'audit", "Backups": "Sauvegardes", "Analytics": "Analytique",
  "Settings": "Paramètres", "Platform (SaaS)": "Plateforme (SaaS)", "My Portal": "Mon portail", "Reports": "Rapports",
  "Help & Support": "Aide & support", "Desktop app": "App bureau", "Download": "Télécharger", "E-Learning": "E-Learning",
  "Search anything…": "Rechercher…", "Notifications": "Notifications", "Sign out": "Déconnexion", "Language": "Langue",
  "Login": "Connexion", "Get Started": "Commencer", "Features": "Fonctionnalités", "Pricing": "Tarifs", "Roles": "Rôles", "Security": "Sécurité",
  "Cancel": "Annuler", "Save": "Enregistrer", "Delete": "Supprimer", "Edit": "Modifier", "Add": "Ajouter", "Print": "Imprimer",
  "Export": "Exporter", "Import": "Importer", "Close": "Fermer", "Back": "Retour", "Next": "Suivant",
  "Showing": "Affichage", "of": "sur", "Student": "Étudiant", "Teacher": "Enseignant", "Class": "Classe",
  "Status": "Statut", "Actions": "Actions", "Name": "Nom", "Date": "Date", "Amount": "Montant",
  "Present": "Présent", "Absent": "Absent", "Late": "Retard", "Excused": "Excusé",
  "Active": "Actif", "Inactive": "Inactif", "Pending": "En attente", "Approved": "Approuvé", "Rejected": "Rejeté",
  "Total students": "Total étudiants", "Attendance today": "Présence du jour", "Monthly revenue": "Revenu mensuel",
  "Pending fees": "Frais impayés", "New student": "Nouvel étudiant", "Welcome back": "Bon retour",
  "Gallery unavailable": "Galerie indisponible — importez une photo depuis votre appareil.",
  "Photo": "Photo", "Upload": "Importer", "Remove": "Retirer",
};

const es: Dict = {
  "Dashboard": "Panel", "Students": "Estudiantes", "Teachers": "Profesores", "Classes": "Clases", "Subjects": "Asignaturas",
  "Timetable": "Horario", "Attendance": "Asistencia", "Exams": "Exámenes", "Grades": "Calificaciones", "Report cards": "Boletines",
  "Settings": "Ajustes", "Login": "Entrar", "Get Started": "Comenzar", "Cancel": "Cancelar", "Save": "Guardar",
  "Delete": "Eliminar", "Edit": "Editar", "Add": "Añadir", "Print": "Imprimir", "Export": "Exportar", "Import": "Importar",
  "Close": "Cerrar", "Back": "Atrás", "Next": "Siguiente", "Showing": "Mostrando", "of": "de",
  "Student": "Estudiante", "Teacher": "Profesor", "Class": "Clase", "Status": "Estado", "Actions": "Acciones",
  "Name": "Nombre", "Date": "Fecha", "Amount": "Importe", "Present": "Presente", "Absent": "Ausente", "Late": "Retraso",
  "Gallery unavailable": "Galería no disponible — importe una foto desde su dispositivo.",
  "Photo": "Foto", "Upload": "Subir", "Remove": "Quitar",
};

const pt: Dict = {
  "Dashboard": "Painel", "Students": "Estudantes", "Teachers": "Professores", "Classes": "Turmas", "Subjects": "Disciplinas",
  "Timetable": "Horário", "Attendance": "Presenças", "Exams": "Exames", "Grades": "Notas", "Report cards": "Boletins",
  "Settings": "Definições", "Login": "Entrar", "Get Started": "Começar", "Cancel": "Cancelar", "Save": "Guardar",
  "Delete": "Eliminar", "Edit": "Editar", "Add": "Adicionar", "Print": "Imprimir", "Export": "Exportar", "Import": "Importar",
  "Close": "Fechar", "Back": "Voltar", "Next": "Seguinte", "Showing": "A mostrar", "of": "de",
  "Student": "Estudante", "Teacher": "Professor", "Class": "Turma", "Status": "Estado", "Actions": "Ações",
  "Name": "Nome", "Date": "Data", "Amount": "Valor", "Present": "Presente", "Absent": "Ausente", "Late": "Atraso",
  "Gallery unavailable": "Galeria indisponível — importe uma foto do seu dispositivo.",
  "Photo": "Foto", "Upload": "Carregar", "Remove": "Remover",
};

const ar: Dict = {
  "Dashboard": "لوحة التحكم", "Students": "الطلاب", "Teachers": "المعلمون", "Classes": "الفصول", "Subjects": "المواد",
  "Timetable": "الجدول", "Attendance": "الحضور", "Exams": "الامتحانات", "Grades": "الدرجات", "Report cards": "الشهادات",
  "Settings": "الإعدادات", "Login": "دخول", "Get Started": "ابدأ", "Cancel": "إلغاء", "Save": "حفظ",
  "Delete": "حذف", "Edit": "تعديل", "Add": "إضافة", "Print": "طباعة", "Export": "تصدير", "Import": "استيراد",
  "Close": "إغلاق", "Back": "رجوع", "Next": "التالي", "Showing": "عرض", "of": "من",
  "Student": "طالب", "Teacher": "معلم", "Class": "فصل", "Status": "الحالة", "Actions": "إجراءات",
  "Name": "الاسم", "Date": "التاريخ", "Amount": "المبلغ", "Present": "حاضر", "Absent": "غائب", "Late": "متأخر",
  "Gallery unavailable": "المعرض غير متاح — استورد صورة من جهازك.",
  "Photo": "صورة", "Upload": "رفع", "Remove": "إزالة",
};

const dicts: Record<Lang, Dict> = { en, fr, es, pt, ar };

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "Français", native: "Français" },
  { code: "es", label: "Español", native: "Español" },
  { code: "pt", label: "Português", native: "Português" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

const normalize = (lang: string): Lang => (LANG_CODES.includes(lang as Lang) ? (lang as Lang) : "en");

export const t = (lang: Lang, key: string) => dicts[normalize(lang)]?.[key] ?? key;

export function useT() {
  const s = useApp();
  const lang = normalize(s.prefs.lang as string);
  const mtEnabled = s.prefs.mt === true;
  const [, bump] = useState(0);
  useEffect(() => onMT(() => bump((x) => x + 1)), []);
  return (key: string) => {
    const direct = dicts[lang]?.[key];
    if (direct !== undefined) return direct;
    if (mtEnabled && lang !== "en") {
      const cached = mtGet(lang, key);
      if (cached) return cached;
      requestMT(lang, key);
    }
    return key;
  };
}

import { useEffect, useState } from "react";
