import { useEffect, useState } from "react";
import { useApp, LANG_CODES, type Lang } from "./data";
import { mtGet, onMT, requestMT } from "./mt";

type Dict = Record<string, string>;
const en: Dict = {};

const fr: Dict = {
  "Overview": "Aperçu", "People": "Personnes", "Academics": "Académique", "Finance": "Finances", "Engagement": "Communication", "Management": "Gestion",
  "Dashboard": "Tableau de bord", "Students": "Étudiants", "Admissions": "Admissions", "Teachers": "Enseignants", "HR & Staff": "RH & Personnel", "Classes": "Classes", "Subjects": "Matières",
  "Timetable": "Emploi du temps", "Attendance": "Présences", "Exams": "Examens", "Grades": "Notes", "Report cards": "Bulletins", "Fees & Structures": "Frais & structures", "Payments": "Paiements",
  "Invoices": "Factures", "Expenses": "Dépenses", "Financial Reports": "Rapports financiers", "Communication": "Communication", "Announcements": "Annonces", "Calendar": "Calendrier",
  "Library": "Bibliothèque", "Transport": "Transport", "Documents": "Documents", "Certificates": "Certificats", "ID cards": "Cartes d'identité", "Audit logs": "Journaux d'audit",
  "Backups": "Sauvegardes", "Analytics": "Analytique", "Settings": "Paramètres", "Platform (SaaS)": "Plateforme (SaaS)", "My Portal": "Mon portail",
  "Search anything…": "Rechercher étudiants, paiements, reçus…", "Notifications": "Notifications", "Sign out": "Déconnexion", "Mark all read": "Tout marquer lu", "Language": "Langue",
  "Home": "Accueil", "HR": "RH", "Cards": "Bulletins", "Fees": "Frais", "Messages": "Messages", "News": "Annonces", "Files": "Fichiers", "IDs": "Cartes", "Audit": "Audit", "Stats": "Stats", "SaaS": "SaaS", "Portal": "Portail", "Help": "Aide",
  /* download page */
  "VITECH School for your desktop": "VITECH School pour votre ordinateur",
  "The full school ERP, offline-first, on Windows, macOS and Linux.": "L'ERP scolaire complet, hors-ligne d'abord, sur Windows, macOS et Linux.",
  "Download for": "Télécharger pour", "Preparing package": "Préparation du paquet", "Building offline package": "Construction du paquet hors-ligne",
  "Preparing your package": "Préparation de votre paquet", "Package ready": "Paquet prêt", "Download complete": "Téléchargement terminé",
  "Share file": "Partager le fichier", "Detected": "Détecté", "verified": "vérifié", "Auto-updates enabled": "Mises à jour auto activées",
  "How to install": "Comment installer", "Download the package for your platform": "Téléchargez le paquet pour votre plateforme",
  "Run the installer and accept the license": "Lancez l'installateur et acceptez la licence", "Sign in with your school account": "Connectez-vous avec votre compte école",
  "Your data syncs automatically — works offline": "Vos données se synchronisent automatiquement — fonctionne hors-ligne",
  "Download history": "Historique des téléchargements", "No downloads yet this session.": "Aucun téléchargement cette session.", "Desktop app": "App bureau",
  "Download started": "Téléchargement démarré", "Package still preparing — one second…": "Paquet en préparation — une seconde…",
  "Good morning": "Bonjour", "Good afternoon": "Bon après-midi", "Here's what's happening at": "Voici l'activité de", "today": "aujourd'hui",
  "New admission": "Nouvelle admission", "Record payment": "Nouveau paiement", "Total students": "Total étudiants", "active": "actifs", "on duty": "en poste",
  "Attendance today": "Présence du jour", "absent": "absents", "late": "retards", "subjects": "matières", "Payments today": "Paiements du jour",
  "Monthly revenue": "Revenu mensuel", "Pending fees": "Frais impayés", "unpaid students": "étudiants non soldés", "Net position": "Position nette",
  "Revenue vs Expenses": "Revenus vs Dépenses", "Last 8 months": "8 derniers mois", "margin": "de marge", "Student enrollment": "Inscriptions d'étudiants",
  "Fee collection": "Recouvrement des frais", "Report": "Rapport", "of annual fees collected": "des frais annuels recouvrés", "still outstanding across": "restent impayés pour",
  "students": "étudiants", "Upcoming events": "Événements à venir", "Recent payments": "Paiements récents", "View all": "Tout voir", "Receipt": "Reçu",
  "Student": "Étudiant", "Method": "Méthode", "Date": "Date", "Amount": "Montant", "Recent registrations": "Inscriptions récentes", "All": "Tous",
  "admitted": "admis", "Recent activity": "Activité récente", "New admissions (30d)": "Admissions (30 j)", "Upcoming exams": "Examens à venir",
  "Library loans active": "Emprunts actifs", "Absent alerts sent": "Alertes d'absence envoyées", "present": "présents",
  "Present": "Présent", "Late": "Retard", "Absent": "Absent", "Excused": "Excusé",
  "Students & registration": "Étudiants & inscriptions", "Admissions pipeline": "Pipeline d'admission", "Teachers & staff": "Enseignants & personnel",
  "Classes & Sections": "Classes & sections", "Grade entry": "Saisie des notes", "Communication Center": "Centre de communication",
  "School calendar": "Calendrier scolaire", "School transport": "Transport scolaire", "Backups & restore": "Sauvegardes & restauration",
  "Platform control": "Contrôle de la plateforme", "Student portal": "Portail étudiant", "Parent portal": "Portail parent", "Teacher portal": "Portail enseignant",
  "Features": "Fonctionnalités", "Pricing": "Tarifs", "Roles": "Rôles", "Security": "Sécurité", "Login": "Connexion", "Get Started": "Commencer",
  "Request a Demo": "Demander une démo", "AI translation": "Traduction IA",
  "Complete School Management System": "Le système complet de gestion scolaire",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gérez les étudiants, les enseignants, les présences, les notes, les frais, la communication et toutes les opérations de l'école depuis une seule plateforme puissante.",
  "Trusted by forward-thinking schools": "La confiance des écoles tournées vers l'avenir",
  "Get Started free": "Commencer gratuitement", "14-day free trial": "Essai gratuit de 14 jours", "No card required": "Aucune carte requise", "Multi-campus ready": "Prêt multi-campus",
  "per month": "/mois", "Most popular": "Le plus populaire", "Unlimited students": "Étudiants illimités", "Start free trial": "Essai gratuit", "Contact sales": "Contacter l'équipe",
  "Sign in": "Se connecter", "Email": "E-mail", "Password": "Mot de passe", "Sign in to your account": "Connectez-vous à votre compte",
  "Forgot password?": "Mot de passe oublié ?", "Don't have an account?": "Pas encore de compte ?", "Create one": "Créer un compte",
  "Demo accounts — password": "Comptes démo — mot de passe", "Two-factor authentication": "Authentification à deux facteurs",
  "Verify & continue": "Vérifier & continuer", "Create your school": "Créez votre école", "School information": "Informations de l'école",
  "Academic year": "Année académique", "Finish": "Terminer", "Back": "Retour", "Next": "Suivant", "Continue": "Continuer",
  "School name": "Nom de l'école", "Admin name": "Nom de l'administrateur", "Admin email": "E-mail de l'administrateur", "Country": "Pays",
  "Currency": "Devise", "Phone": "Téléphone", "Launch my school": "Lancer mon école", "records converted": "enregistrements convertis",
  "Save changes": "Enregistrer", "Save": "Enregistrer", "Cancel": "Annuler", "Add": "Ajouter", "Edit": "Modifier", "Delete": "Supprimer",
  "Print": "Imprimer", "Export": "Exporter", "Import": "Importer", "Download": "Télécharger", "Search": "Rechercher", "View": "Voir",
  "Close": "Fermer", "Change": "Modifier", "Today": "Aujourd'hui", "Status": "Statut", "Actions": "Actions", "Name": "Nom", "Class": "Classe",
  "Active": "Actif", "Inactive": "Inactif", "Pending": "En attente", "Approved": "Approuvé", "Rejected": "Rejeté", "Paid": "Payé",
  "Overdue": "En retard", "Scheduled": "Programmé", "Completed": "Terminé", "Valid": "Valide", "New student": "Nouvel étudiant",
  "Showing": "Affichage", "of": "sur", "Welcome back": "Bon retour",
  "My profile": "Mon profil", "My attendance": "Mes présences", "My results": "Mes résultats", "My timetable": "Mon emploi du temps",
  "Room": "Salle", "Subject": "Matière", "My children": "Mes enfants", "Their grades": "Leurs notes", "Fees status": "Situation des frais",
  "My classes": "Mes classes", "Enter grades": "Saisir les notes", "Mark attendance": "Faire l'appel", "School news": "Actualités de l'école",
};

const es: Dict = {
  "Overview": "Resumen", "People": "Personas", "Academics": "Académico", "Finance": "Finanzas", "Engagement": "Comunicación", "Management": "Gestión",
  "Dashboard": "Panel de control", "Students": "Estudiantes", "Admissions": "Admisiones", "Teachers": "Docentes", "HR & Staff": "RR. HH.", "Classes": "Clases", "Subjects": "Asignaturas",
  "Timetable": "Horario", "Attendance": "Asistencia", "Exams": "Exámenes", "Grades": "Calificaciones", "Report cards": "Boletines", "Fees & Structures": "Cuotas", "Payments": "Pagos",
  "Invoices": "Facturas", "Expenses": "Gastos", "Financial Reports": "Informes financieros", "Communication": "Comunicación", "Announcements": "Anuncios", "Calendar": "Calendario",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Carnés", "Audit logs": "Auditoría",
  "Backups": "Copias de seguridad", "Analytics": "Analítica", "Settings": "Ajustes", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Mi portal",
  "Search anything…": "Buscar estudiantes, pagos, recibos…", "Notifications": "Notificaciones", "Sign out": "Cerrar sesión", "Mark all read": "Marcar leído", "Language": "Idioma",
  "Home": "Inicio", "HR": "RRHH", "Cards": "Boletines", "Fees": "Cuotas", "Messages": "Mensajes", "News": "Anuncios", "Files": "Archivos", "IDs": "Carnés", "Audit": "Auditoría", "Stats": "Datos", "SaaS": "SaaS", "Portal": "Portal", "Help": "Ayuda",
  "Good morning": "Buenos días", "Good afternoon": "Buenas tardes", "Here's what's happening at": "Esto ocurre en", "today": "hoy",
  "New admission": "Nueva admisión", "Record payment": "Registrar pago", "Total students": "Total de estudiantes", "active": "activos", "on duty": "en servicio",
  "Attendance today": "Asistencia de hoy", "absent": "ausentes", "late": "retrasos", "subjects": "asignaturas", "Payments today": "Pagos de hoy",
  "Monthly revenue": "Ingresos mensuales", "Pending fees": "Cuotas pendientes", "unpaid students": "estudiantes sin saldo", "Net position": "Posición neta",
  "Revenue vs Expenses": "Ingresos vs Gastos", "Last 8 months": "Últimos 8 meses", "margin": "de margen", "Student enrollment": "Matrícula",
  "Fee collection": "Recaudación", "Report": "Informe", "of annual fees collected": "de cuotas anuales recaudadas", "still outstanding across": "pendientes en",
  "students": "estudiantes", "Upcoming events": "Próximos eventos", "Recent payments": "Pagos recientes", "View all": "Ver todo", "Receipt": "Recibo",
  "Student": "Estudiante", "Method": "Método", "Date": "Fecha", "Amount": "Importe", "Recent registrations": "Matriculaciones recientes", "All": "Todos",
  "admitted": "admitido", "Recent activity": "Actividad reciente", "Present": "Presente", "Late": "Retraso", "Absent": "Ausente", "Excused": "Justificado",
  "Features": "Funciones", "Pricing": "Precios", "Roles": "Roles", "Security": "Seguridad", "Login": "Entrar", "Get Started": "Comenzar",
  "Request a Demo": "Solicitar demo", "Desktop app": "App de escritorio", "AI translation": "Traducción IA",
  "Complete School Management System": "El sistema completo de gestión escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gestiona estudiantes, docentes, asistencia, calificaciones, cuotas, comunicación y todas las operaciones del colegio desde una única plataforma potente.",
  "per month": "/mes", "Most popular": "El más popular", "Unlimited students": "Estudiantes ilimitados", "Start free trial": "Prueba gratis", "Contact sales": "Contactar ventas",
  "Sign in": "Iniciar sesión", "Email": "Correo", "Password": "Contraseña", "Forgot password?": "¿Olvidaste tu contraseña?",
  "Demo accounts — password": "Cuentas demo — contraseña", "Verify & continue": "Verificar y continuar", "Back": "Atrás", "Continue": "Continuar",
  "Currency": "Moneda", "Phone": "Teléfono", "records converted": "registros convertidos", "Welcome back": "Bienvenido de nuevo",
  "Save": "Guardar", "Cancel": "Cancelar", "Add": "Añadir", "Edit": "Editar", "Delete": "Eliminar", "Print": "Imprimir", "Export": "Exportar",
  "Import": "Importar", "Download": "Descargar", "Search": "Buscar", "View": "Ver", "Close": "Cerrar", "Change": "Cambiar", "Today": "Hoy",
  "Status": "Estado", "Actions": "Acciones", "Name": "Nombre", "Class": "Clase", "Active": "Activo", "Pending": "Pendiente", "Approved": "Aprobado",
  "Rejected": "Rechazado", "Paid": "Pagado", "Overdue": "Vencido", "Scheduled": "Programado", "Completed": "Completado", "Valid": "Válido",
  "New student": "Nuevo estudiante", "Showing": "Mostrando", "of": "de", "Students & registration": "Estudiantes y matrícula",
  "Student portal": "Portal del estudiante", "Parent portal": "Portal de padres", "Teacher portal": "Portal del docente",
};

const pt: Dict = {
  "Overview": "Visão geral", "People": "Pessoas", "Academics": "Académico", "Finance": "Finanças", "Engagement": "Comunicação", "Management": "Gestão",
  "Dashboard": "Painel", "Students": "Estudantes", "Admissions": "Admissões", "Teachers": "Professores", "HR & Staff": "RH e pessoal", "Classes": "Turmas", "Subjects": "Disciplinas",
  "Timetable": "Horário", "Attendance": "Presenças", "Exams": "Exames", "Grades": "Notas", "Report cards": "Boletins", "Fees & Structures": "Propinas", "Payments": "Pagamentos",
  "Invoices": "Faturas", "Expenses": "Despesas", "Financial Reports": "Relatórios financeiros", "Communication": "Comunicação", "Announcements": "Anúncios", "Calendar": "Calendário",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Cartões", "Audit logs": "Auditoria",
  "Backups": "Cópias de segurança", "Analytics": "Análise", "Settings": "Definições", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Meu portal",
  "Search anything…": "Pesquisar estudantes, pagamentos…", "Notifications": "Notificações", "Sign out": "Terminar sessão", "Mark all read": "Marcar lido", "Language": "Idioma",
  "Home": "Início", "HR": "RH", "Cards": "Boletins", "Fees": "Propinas", "Messages": "Mensagens", "News": "Anúncios", "Files": "Ficheiros", "IDs": "Cartões", "Audit": "Auditoria", "Stats": "Dados", "SaaS": "SaaS", "Portal": "Portal", "Help": "Ajuda",
  "Good morning": "Bom dia", "Good afternoon": "Boa tarde", "Here's what's happening at": "Eis o que se passa em", "today": "hoje",
  "New admission": "Nova admissão", "Record payment": "Registar pagamento", "Total students": "Total de estudantes", "active": "ativos", "on duty": "em serviço",
  "Attendance today": "Presenças de hoje", "absent": "ausentes", "late": "atrasos", "subjects": "disciplinas", "Payments today": "Pagamentos de hoje",
  "Monthly revenue": "Receita mensal", "Pending fees": "Propinas pendentes", "unpaid students": "estudantes em dívida", "Net position": "Posição líquida",
  "Revenue vs Expenses": "Receitas vs Despesas", "Last 8 months": "Últimos 8 meses", "margin": "de margem", "Student enrollment": "Matrículas",
  "Fee collection": "Cobrança", "Report": "Relatório", "of annual fees collected": "das propinas anuais cobradas", "still outstanding across": "por cobrar em",
  "students": "estudantes", "Upcoming events": "Próximos eventos", "Recent payments": "Pagamentos recentes", "View all": "Ver tudo", "Receipt": "Recibo",
  "Student": "Estudante", "Method": "Método", "Date": "Data", "Amount": "Valor", "Recent registrations": "Matrículas recentes", "All": "Todos",
  "admitted": "admitido", "Recent activity": "Atividade recente", "Present": "Presente", "Late": "Atraso", "Absent": "Ausente", "Excused": "Justificado",
  "Features": "Funcionalidades", "Pricing": "Preços", "Roles": "Funções", "Security": "Segurança", "Login": "Entrar", "Get Started": "Começar",
  "Request a Demo": "Pedir demo", "Desktop app": "App desktop", "AI translation": "Tradução IA",
  "Complete School Management System": "O sistema completo de gestão escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gira estudantes, professores, presenças, notas, propinas, comunicação e todas as operações da escola numa única plataforma poderosa.",
  "per month": "/mês", "Most popular": "O mais popular", "Unlimited students": "Estudantes ilimitados", "Start free trial": "Teste grátis", "Contact sales": "Contactar vendas",
  "Sign in": "Iniciar sessão", "Email": "E-mail", "Password": "Palavra-passe", "Forgot password?": "Esqueceu a palavra-passe?",
  "Demo accounts — password": "Contas demo — palavra-passe", "Verify & continue": "Verificar e continuar", "Back": "Voltar", "Continue": "Continuar",
  "Currency": "Moeda", "Phone": "Telefone", "records converted": "registos convertidos", "Welcome back": "Bem-vindo de volta",
  "Save": "Guardar", "Cancel": "Cancelar", "Add": "Adicionar", "Edit": "Editar", "Delete": "Eliminar", "Print": "Imprimir", "Export": "Exportar",
  "Import": "Importar", "Download": "Transferir", "Search": "Pesquisar", "View": "Ver", "Close": "Fechar", "Change": "Alterar", "Today": "Hoje",
  "Status": "Estado", "Actions": "Ações", "Name": "Nome", "Class": "Turma", "Active": "Ativo", "Pending": "Pendente", "Approved": "Aprovado",
  "Rejected": "Rejeitado", "Paid": "Pago", "Overdue": "Em atraso", "Scheduled": "Agendado", "Completed": "Concluído", "Valid": "Válido",
  "New student": "Novo estudante", "Showing": "A mostrar", "of": "de", "Students & registration": "Estudantes e matrículas",
  "Student portal": "Portal do estudante", "Parent portal": "Portal dos encarregados", "Teacher portal": "Portal do professor",
};

const ar: Dict = {
  "Overview": "نظرة عامة", "People": "الأشخاص", "Academics": "الأكاديمية", "Finance": "المالية", "Engagement": "التواصل", "Management": "الإدارة",
  "Dashboard": "لوحة التحكم", "Students": "الطلاب", "Admissions": "القبول", "Teachers": "المعلمون", "HR & Staff": "الموارد البشرية", "Classes": "الفصول", "Subjects": "المواد",
  "Timetable": "الجدول الدراسي", "Attendance": "الحضور", "Exams": "الامتحانات", "Grades": "الدرجات", "Report cards": "الشهادات", "Fees & Structures": "الرسوم", "Payments": "المدفوعات",
  "Invoices": "الفواتير", "Expenses": "المصروفات", "Financial Reports": "التقارير المالية", "Communication": "التواصل", "Announcements": "الإعلانات", "Calendar": "التقويم",
  "Library": "المكتبة", "Transport": "النقل", "Documents": "المستندات", "Certificates": "الشهادات", "ID cards": "البطاقات", "Audit logs": "سجلات التدقيق",
  "Backups": "النسخ الاحتياطي", "Analytics": "التحليلات", "Settings": "الإعدادات", "Platform (SaaS)": "المنصة (SaaS)", "My Portal": "بوابتي",
  "Search anything…": "ابحث عن الطلاب والمدفوعات…", "Notifications": "الإشعارات", "Sign out": "تسجيل الخروج", "Mark all read": "تحديد الكل كمقروء", "Language": "اللغة",
  "Home": "الرئيسية", "HR": "الموارد", "Cards": "الشهادات", "Fees": "الرسوم", "Messages": "الرسائل", "News": "الإعلانات", "Files": "الملفات", "IDs": "البطاقات", "Audit": "التدقيق", "Stats": "الإحصاءات", "SaaS": "SaaS", "Portal": "البوابة", "Help": "المساعدة",
  "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Here's what's happening at": "إليك ما يحدث في", "today": "اليوم",
  "New admission": "قبول جديد", "Record payment": "تسجيل دفعة", "Total students": "إجمالي الطلاب", "active": "نشط", "on duty": "في الخدمة",
  "Attendance today": "حضور اليوم", "absent": "غائبون", "late": "متأخرون", "subjects": "مواد", "Payments today": "مدفوعات اليوم",
  "Monthly revenue": "الإيرادات الشهرية", "Pending fees": "رسوم مستحقة", "unpaid students": "طلاب لم يسددوا", "Net position": "الصافي",
  "Revenue vs Expenses": "الإيرادات مقابل المصروفات", "Last 8 months": "آخر 8 أشهر", "margin": "هامش", "Student enrollment": "تسجيل الطلاب",
  "Fee collection": "تحصيل الرسوم", "Report": "تقرير", "of annual fees collected": "من الرسوم السنوية المحصّلة", "still outstanding across": "مستحقة لدى",
  "students": "طالب", "Upcoming events": "الأحداث القادمة", "Recent payments": "أحدث المدفوعات", "View all": "عرض الكل", "Receipt": "إيصال",
  "Student": "الطالب", "Method": "الطريقة", "Date": "التاريخ", "Amount": "المبلغ", "Recent registrations": "أحدث التسجيلات", "All": "الكل",
  "admitted": "مقبول", "Recent activity": "النشاط الأخير", "Present": "حاضر", "Late": "متأخر", "Absent": "غائب", "Excused": "بعذر",
  "Features": "المميزات", "Pricing": "الأسعار", "Roles": "الأدوار", "Security": "الأمان", "Login": "دخول", "Get Started": "ابدأ الآن",
  "Request a Demo": "اطلب عرضاً تجريبياً", "Desktop app": "تطبيق سطح المكتب", "AI translation": "ترجمة الذكاء الاصطناعي",
  "Complete School Management System": "نظام متكامل لإدارة المدارس",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "أدر الطلاب والمعلمين والحضور والدرجات والرسوم والتواصل وجميع عمليات المدرسة من منصة واحدة قوية.",
  "per month": "/شهرياً", "Most popular": "الأكثر شيوعاً", "Unlimited students": "طلاب بلا حدود", "Start free trial": "تجربة مجانية", "Contact sales": "تواصل مع المبيعات",
  "Sign in": "تسجيل الدخول", "Email": "البريد الإلكتروني", "Password": "كلمة المرور", "Forgot password?": "نسيت كلمة المرور؟",
  "Demo accounts — password": "حسابات تجريبية — كلمة المرور", "Verify & continue": "تحقق وتابع", "Back": "رجوع", "Continue": "متابعة",
  "Currency": "العملة", "Phone": "الهاتف", "records converted": "سجلات محوّلة", "Welcome back": "مرحباً بعودتك",
  "Save": "حفظ", "Cancel": "إلغاء", "Add": "إضافة", "Edit": "تعديل", "Delete": "حذف", "Print": "طباعة", "Export": "تصدير",
  "Import": "استيراد", "Download": "تنزيل", "Search": "بحث", "View": "عرض", "Close": "إغلاق", "Change": "تغيير", "Today": "اليوم",
  "Status": "الحالة", "Actions": "إجراءات", "Name": "الاسم", "Class": "الفصل", "Active": "نشط", "Pending": "قيد الانتظار", "Approved": "معتمد",
  "Rejected": "مرفوض", "Paid": "مدفوع", "Overdue": "متأخر", "Scheduled": "مجدول", "Completed": "مكتمل", "Valid": "ساري",
  "New student": "طالب جديد", "Showing": "عرض", "of": "من", "Students & registration": "الطلاب والتسجيل",
  "Student portal": "بوابة الطالب", "Parent portal": "بوابة ولي الأمر", "Teacher portal": "بوابة المعلم",
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
  const mtEnabled = s.prefs.mt !== false;
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
