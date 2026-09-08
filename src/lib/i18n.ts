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
  // Chat & Messages
  "Messages": "Messages", "No messages yet": "Aucun message", "Start a conversation": "Commencer une conversation",
  "Select a contact to start chatting": "Sélectionnez un contact pour discuter", "Type a message...": "Tapez un message...",
  // Profile
  "My Profile": "Mon profil", "Personal Information": "Informations personnelles", "Full name": "Nom complet",
  "Email": "E-mail", "Role": "Rôle", "Preferences": "Préférences", "Theme": "Thème", "Light": "Clair", "Dark": "Sombre",
  "2FA enabled": "2FA activé", "2FA disabled": "2FA désactivé", "Member since": "Membre depuis",
  "Disable 2FA": "Désactiver 2FA", "Enable 2FA": "Activer 2FA", "Change password": "Changer le mot de passe",
  "Update email": "Mettre à jour l'e-mail", "Recent Activity": "Activité récente",
  // E-Learning
  "Courses": "Cours", "Lessons": "Leçons", "Quizzes": "Quiz", "Live classes": "Classes en direct",
  "Continue": "Continuer", "lessons": "leçons", "Complete": "Terminé", "Course content": "Contenu du cours",
  "Duration": "Durée", "Video player": "Lecteur vidéo", "Quiz time!": "C'est l'heure du quiz !",
  "Test your knowledge with this interactive quiz.": "Testez vos connaissances avec ce quiz interactif.",
  "Start quiz": "Commencer le quiz", "Mark as complete": "Marquer comme terminé", "Next lesson": "Leçon suivante",
  "Select a lesson to start": "Sélectionnez une leçon pour commencer", "Back to courses": "Retour aux cours",
  "Instructor": "Instructeur",
  // Common actions
  "View": "Voir", "Search": "Rechercher",
  "Filter": "Filtrer", "Sort": "Trier", "Refresh": "Actualiser", "Submit": "Soumettre", "Confirm": "Confirmer",
  "Yes": "Oui", "No": "Non", "OK": "OK", "Error": "Erreur", "Success": "Succès", "Warning": "Avertissement",
  "Info": "Info", "Loading": "Chargement", "Processing": "Traitement", "Please wait": "Veuillez patienter",
  "Are you sure?": "Êtes-vous sûr ?", "This action cannot be undone": "Cette action ne peut pas être annulée",
  // Navigation
  "Home": "Accueil", "About": "À propos", "Contact": "Contact", "FAQ": "FAQ", "Terms": "Conditions",
  "Privacy": "Confidentialité", "Logout": "Déconnexion", "Profile": "Profil", "Account": "Compte",
  // Finance
  "Balance": "Solde", "Paid": "Payé", "Unpaid": "Impayé", "Overdue": "En retard", "Due date": "Date d'échéance",
  "Payment method": "Méthode de paiement", "Receipt": "Reçu", "Invoice": "Facture", "Transaction": "Transaction",
  // Academic
  "Grade": "Note", "Score": "Score", "Average": "Moyenne", "Rank": "Rang", "Pass": "Réussi", "Fail": "Échoué",
  "Term": "Trimestre", "Semester": "Semestre", "Year": "Année", "Subject": "Matière", "Course": "Cours",
  // Time
  "Today": "Aujourd'hui", "Yesterday": "Hier", "Tomorrow": "Demain", "This week": "Cette semaine",
  "Last week": "Semaine dernière", "This month": "Ce mois", "Last month": "Mois dernier", "This year": "Cette année",
  // Stats
  "Total": "Total", "Count": "Nombre", "Percentage": "Pourcentage", "Growth": "Croissance", "Decline": "Déclin",
  "Increase": "Augmentation", "Decrease": "Diminution", "Maximum": "Maximum", "Minimum": "Minimum",
};

const es: Dict = {
  "Dashboard": "Panel", "Students": "Estudiantes", "Teachers": "Profesores", "Classes": "Clases", "Subjects": "Asignaturas",
  "Timetable": "Horario", "Attendance": "Asistencia", "Exams": "Exámenes", "Grades": "Calificaciones", "Report cards": "Boletines",
  "Settings": "Ajustes", "Login": "Entrar", "Get Started": "Comenzar", "Cancel": "Cancelar", "Save": "Guardar",
  "Close": "Cerrar", "Back": "Atrás", "Next": "Siguiente", "Showing": "Mostrando", "of": "de",
  "Student": "Estudiante", "Teacher": "Profesor", "Class": "Clase", "Status": "Estado", "Actions": "Acciones",
  "Name": "Nombre", "Date": "Fecha", "Amount": "Importe", "Present": "Presente", "Absent": "Ausente", "Late": "Retraso",
  "Gallery unavailable": "Galería no disponible — importe una foto desde su dispositivo.",
  "Photo": "Foto", "Upload": "Subir", "Remove": "Quitar",
  // Chat & Messages
  "Messages": "Mensajes", "No messages yet": "Sin mensajes", "Start a conversation": "Iniciar conversación",
  "Select a contact to start chatting": "Seleccione un contacto para chatear", "Type a message...": "Escriba un mensaje...",
  // Profile
  "My Profile": "Mi perfil", "Personal Information": "Información personal", "Full name": "Nombre completo",
  "Email": "Correo", "Role": "Rol", "Preferences": "Preferencias", "Theme": "Tema", "Light": "Claro", "Dark": "Oscuro",
  "2FA enabled": "2FA activado", "2FA disabled": "2FA desactivado", "Member since": "Miembro desde",
  "Disable 2FA": "Desactivar 2FA", "Enable 2FA": "Activar 2FA", "Change password": "Cambiar contraseña",
  "Update email": "Actualizar correo", "Recent Activity": "Actividad reciente",
  // E-Learning
  "Courses": "Cursos", "Lessons": "Lecciones", "Quizzes": "Cuestionarios", "Live classes": "Clases en vivo",
  "Continue": "Continuar", "lessons": "lecciones", "Complete": "Completado", "Course content": "Contenido del curso",
  "Duration": "Duración", "Video player": "Reproductor de video", "Quiz time!": "¡Hora del cuestionario!",
  "Test your knowledge with this interactive quiz.": "Pon a prueba tus conocimientos con este cuestionario interactivo.",
  "Start quiz": "Iniciar cuestionario", "Mark as complete": "Marcar como completado", "Next lesson": "Siguiente lección",
  "Select a lesson to start": "Seleccione una lección para comenzar", "Back to courses": "Volver a cursos",
  "Instructor": "Instructor",
  // Common
  "View": "Ver", "Search": "Buscar", "Filter": "Filtrar", "Sort": "Ordenar", "Refresh": "Actualizar",
  "Submit": "Enviar", "Confirm": "Confirmar", "Yes": "Sí", "No": "No", "OK": "OK",
  "Error": "Error", "Success": "Éxito", "Warning": "Advertencia", "Info": "Info",
  "Loading": "Cargando", "Processing": "Procesando", "Please wait": "Por favor espere",
  "Are you sure?": "¿Está seguro?", "This action cannot be undone": "Esta acción no se puede deshacer",
  // Navigation
  "Home": "Inicio", "About": "Acerca de", "Contact": "Contacto", "FAQ": "Preguntas frecuentes",
  "Terms": "Términos", "Privacy": "Privacidad", "Logout": "Salir", "Profile": "Perfil", "Account": "Cuenta",
  // Finance
  "Balance": "Saldo", "Paid": "Pagado", "Unpaid": "No pagado", "Overdue": "Vencido", "Due date": "Fecha de vencimiento",
  "Payment method": "Método de pago", "Receipt": "Recibo", "Invoice": "Factura", "Transaction": "Transacción",
  // Academic
  "Grade": "Calificación", "Score": "Puntuación", "Average": "Promedio", "Rank": "Rango", "Pass": "Aprobado", "Fail": "Reprobado",
  "Term": "Trimestre", "Semester": "Semestre", "Year": "Año", "Subject": "Asignatura", "Course": "Curso",
  // Time
  "Today": "Hoy", "Yesterday": "Ayer", "Tomorrow": "Mañana", "This week": "Esta semana",
  "Last week": "Semana pasada", "This month": "Este mes", "Last month": "Mes pasado", "This year": "Este año",
  // Stats
  "Total": "Total", "Count": "Cantidad", "Percentage": "Porcentaje", "Growth": "Crecimiento", "Decline": "Declive",
  "Increase": "Aumento", "Decrease": "Disminución", "Maximum": "Máximo", "Minimum": "Mínimo",
};

const pt: Dict = {
  "Dashboard": "Painel", "Students": "Estudantes", "Teachers": "Professores", "Classes": "Turmas", "Subjects": "Disciplinas",
  "Timetable": "Horário", "Attendance": "Presenças", "Exams": "Exames", "Grades": "Notas", "Report cards": "Boletins",
  "Settings": "Definições", "Login": "Entrar", "Get Started": "Começar", "Cancel": "Cancelar", "Save": "Guardar",
  "Close": "Fechar", "Back": "Voltar", "Next": "Seguinte", "Showing": "A mostrar", "of": "de",
  "Student": "Estudante", "Teacher": "Professor", "Class": "Turma", "Status": "Estado", "Actions": "Ações",
  "Name": "Nome", "Date": "Data", "Amount": "Valor", "Present": "Presente", "Absent": "Ausente", "Late": "Atraso",
  "Gallery unavailable": "Galeria indisponível — importe uma foto do seu dispositivo.",
  "Photo": "Foto", "Upload": "Carregar", "Remove": "Remover",
  // Chat & Messages
  "Messages": "Mensagens", "No messages yet": "Sem mensagens", "Start a conversation": "Iniciar conversa",
  "Select a contact to start chatting": "Selecione um contato para conversar", "Type a message...": "Digite uma mensagem...",
  // Profile
  "My Profile": "Meu perfil", "Personal Information": "Informações pessoais", "Full name": "Nome completo",
  "Email": "E-mail", "Role": "Função", "Preferences": "Preferências", "Theme": "Tema", "Light": "Claro", "Dark": "Escuro",
  "2FA enabled": "2FA ativado", "2FA disabled": "2FA desativado", "Member since": "Membro desde",
  "Disable 2FA": "Desativar 2FA", "Enable 2FA": "Ativar 2FA", "Change password": "Alterar senha",
  "Update email": "Atualizar e-mail", "Recent Activity": "Atividade recente",
  // E-Learning
  "Courses": "Cursos", "Lessons": "Aulas", "Quizzes": "Questionários", "Live classes": "Aulas ao vivo",
  "Continue": "Continuar", "lessons": "aulas", "Complete": "Concluído", "Course content": "Conteúdo do curso",
  "Duration": "Duração", "Video player": "Reprodutor de vídeo", "Quiz time!": "Hora do questionário!",
  "Test your knowledge with this interactive quiz.": "Teste seus conhecimentos com este questionário interativo.",
  "Start quiz": "Iniciar questionário", "Mark as complete": "Marcar como concluído", "Next lesson": "Próxima aula",
  "Select a lesson to start": "Selecione uma aula para começar", "Back to courses": "Voltar aos cursos",
  "Instructor": "Instrutor",
  // Common
  "View": "Ver", "Search": "Pesquisar", "Filter": "Filtrar", "Sort": "Ordenar", "Refresh": "Atualizar",
  "Submit": "Enviar", "Confirm": "Confirmar", "Yes": "Sim", "No": "Não", "OK": "OK",
  "Error": "Erro", "Success": "Sucesso", "Warning": "Aviso", "Info": "Info",
  "Loading": "Carregando", "Processing": "Processando", "Please wait": "Por favor aguarde",
  "Are you sure?": "Tem certeza?", "This action cannot be undone": "Esta ação não pode ser desfeita",
  // Navigation
  "Home": "Início", "About": "Sobre", "Contact": "Contato", "FAQ": "Perguntas frequentes",
  "Terms": "Termos", "Privacy": "Privacidade", "Logout": "Sair", "Profile": "Perfil", "Account": "Conta",
  // Finance
  "Balance": "Saldo", "Paid": "Pago", "Unpaid": "Não pago", "Overdue": "Atrasado", "Due date": "Data de vencimento",
  "Payment method": "Método de pagamento", "Receipt": "Recibo", "Invoice": "Fatura", "Transaction": "Transação",
  // Academic
  "Grade": "Nota", "Score": "Pontuação", "Average": "Média", "Rank": "Classificação", "Pass": "Aprovado", "Fail": "Reprovado",
  "Term": "Trimestre", "Semester": "Semestre", "Year": "Ano", "Subject": "Disciplina", "Course": "Curso",
  // Time
  "Today": "Hoje", "Yesterday": "Ontem", "Tomorrow": "Amanhã", "This week": "Esta semana",
  "Last week": "Semana passada", "This month": "Este mês", "Last month": "Mês passado", "This year": "Este ano",
  // Stats
  "Total": "Total", "Count": "Contagem", "Percentage": "Porcentagem", "Growth": "Crescimento", "Decline": "Declínio",
  "Increase": "Aumento", "Decrease": "Diminuição", "Maximum": "Máximo", "Minimum": "Mínimo",
};

const ar: Dict = {
  "Dashboard": "لوحة التحكم", "Students": "الطلاب", "Teachers": "المعلمون", "Classes": "الفصول", "Subjects": "المواد",
  "Timetable": "الجدول", "Attendance": "الحضور", "Exams": "الامتحانات", "Grades": "الدرجات", "Report cards": "الشهادات",
  "Settings": "الإعدادات", "Login": "دخول", "Get Started": "ابدأ", "Cancel": "إلغاء", "Save": "حفظ",
  "Close": "إغلاق", "Back": "رجوع", "Next": "التالي", "Showing": "عرض", "of": "من",
  "Student": "طالب", "Teacher": "معلم", "Class": "فصل", "Status": "الحالة", "Actions": "إجراءات",
  "Name": "الاسم", "Date": "التاريخ", "Amount": "المبلغ", "Present": "حاضر", "Absent": "غائب", "Late": "متأخر",
  "Gallery unavailable": "المعرض غير متاح — استورد صورة من جهازك.",
  "Photo": "صورة", "Upload": "رفع", "Remove": "إزالة",
  // Chat & Messages
  "Messages": "الرسائل", "No messages yet": "لا توجد رسائل", "Start a conversation": "ابدأ محادثة",
  "Select a contact to start chatting": "اختر جهة اتصال لبدء المحادثة", "Type a message...": "اكتب رسالة...",
  // Profile
  "My Profile": "ملفي الشخصي", "Personal Information": "المعلومات الشخصية", "Full name": "الاسم الكامل",
  "Email": "البريد الإلكتروني", "Role": "الدور", "Preferences": "التفضيلات", "Theme": "السمة", "Light": "فاتح", "Dark": "داكن",
  "2FA enabled": "المصادقة الثنائية مفعلة", "2FA disabled": "المصادقة الثنائية معطلة", "Member since": "عضو منذ",
  "Disable 2FA": "تعطيل المصادقة الثنائية", "Enable 2FA": "تفعيل المصادقة الثنائية", "Change password": "تغيير كلمة المرور",
  "Update email": "تحديث البريد الإلكتروني", "Recent Activity": "النشاط الأخير",
  // E-Learning
  "Courses": "الدورات", "Lessons": "الدروس", "Quizzes": "الاختبارات", "Live classes": "الفصول المباشرة",
  "Continue": "متابعة", "lessons": "دروس", "Complete": "مكتمل", "Course content": "محتوى الدورة",
  "Duration": "المدة", "Video player": "مشغل الفيديو", "Quiz time!": "وقت الاختبار!",
  "Test your knowledge with this interactive quiz.": "اختبر معرفتك مع هذا الاختبار التفاعلي.",
  "Start quiz": "ابدأ الاختبار", "Mark as complete": "وضع علامة كمكتمل", "Next lesson": "الدرس التالي",
  "Select a lesson to start": "اختر درسًا للبدء", "Back to courses": "العودة إلى الدورات",
  "Instructor": "المدرب",
  // Common
  "View": "عرض", "Search": "بحث", "Filter": "تصفية", "Sort": "ترتيب", "Refresh": "تحديث",
  "Submit": "إرسال", "Confirm": "تأكيد", "Yes": "نعم", "No": "لا", "OK": "موافق",
  "Error": "خطأ", "Success": "نجاح", "Warning": "تحذير", "Info": "معلومات",
  "Loading": "جارٍ التحميل", "Processing": "جارٍ المعالجة", "Please wait": "يرجى الانتظار",
  "Are you sure?": "هل أنت متأكد؟", "This action cannot be undone": "لا يمكن التراجع عن هذا الإجراء",
  // Navigation
  "Home": "الرئيسية", "About": "حول", "Contact": "اتصل", "FAQ": "الأسئلة الشائعة",
  "Terms": "الشروط", "Privacy": "الخصوصية", "Logout": "خروج", "Profile": "الملف الشخصي", "Account": "الحساب",
  // Finance
  "Balance": "الرصيد", "Paid": "مدفوع", "Unpaid": "غير مدفوع", "Overdue": "متأخر", "Due date": "تاريخ الاستحقاق",
  "Payment method": "طريقة الدفع", "Receipt": "إيصال", "Invoice": "فاتورة", "Transaction": "معاملة",
  // Academic
  "Grade": "درجة", "Score": "نقاط", "Average": "متوسط", "Rank": "ترتيب", "Pass": "ناجح", "Fail": "راسب",
  "Term": "فصل دراسي", "Semester": "نصف سنة", "Year": "سنة", "Subject": "مادة", "Course": "دورة",
  // Time
  "Today": "اليوم", "Yesterday": "أمس", "Tomorrow": "غداً", "This week": "هذا الأسبوع",
  "Last week": "الأسبوع الماضي", "This month": "هذا الشهر", "Last month": "الشهر الماضي", "This year": "هذا العام",
  // Stats
  "Total": "المجموع", "Count": "العدد", "Percentage": "النسبة المئوية", "Growth": "النمو", "Decline": "الانخفاض",
  "Increase": "زيادة", "Decrease": "انخفاض", "Maximum": "الحد الأقصى", "Minimum": "الحد الأدنى",
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
