import { useEffect, useState } from "react";
import { useApp, LANG_CODES, type Lang } from "./data";
import { mtGet, onMT, requestMT } from "./mt";

/* Keys are English source strings — untranslated keys fall back to English,
   then the AI translation engine fills gaps at runtime. */
type Dict = Record<string, string>;

const en: Dict = {};

const fr: Dict = {
  "Overview": "Aperçu", "People": "Personnes", "Academics": "Académique", "Finance": "Finances", "Engagement": "Communication", "Management": "Gestion", "Operations": "Opérations",
  "Dashboard": "Tableau de bord", "Students": "Étudiants", "Admissions": "Admissions", "Teachers": "Enseignants", "HR & Staff": "RH & Personnel", "Classes": "Classes", "Subjects": "Matières",
  "Timetable": "Emploi du temps", "Attendance": "Présences", "Exams": "Examens", "Grades": "Notes", "Report cards": "Bulletins", "Fees & Structures": "Frais & structures", "Payments": "Paiements",
  "Invoices": "Factures", "Expenses": "Dépenses", "Financial Reports": "Rapports financiers", "Communication": "Communication", "Announcements": "Annonces", "Calendar": "Calendrier",
  "Library": "Bibliothèque", "Transport": "Transport", "Documents": "Documents", "Certificates": "Certificats", "ID cards": "Cartes d'identité", "Audit logs": "Journaux d'audit",
  "Backups": "Sauvegardes", "Analytics": "Analytique", "Settings": "Paramètres", "Platform (SaaS)": "Plateforme (SaaS)", "My Portal": "Mon portail", "Reports": "Rapports",
  "Home": "Accueil", "HR": "RH", "Cards": "Bulletins", "Fees": "Frais", "Messages": "Messages", "News": "Annonces", "Files": "Fichiers", "IDs": "Cartes", "Audit": "Audit", "Stats": "Stats", "SaaS": "SaaS", "Portal": "Portail", "Help": "Aide", "Help & Support": "Aide & Support", "Menu": "Menu",
  "Search anything…": "Rechercher étudiants, paiements, reçus…", "Notifications": "Notifications", "Sign out": "Déconnexion", "Mark all read": "Tout marquer lu", "Language": "Langue",
  "AI translation": "Traduction IA", "Desktop app": "App bureau",
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
  "Request a Demo": "Demander une démo", "Complete School Management System": "Le système complet de gestion scolaire",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gérez les étudiants, les enseignants, les présences, les notes, les frais, la communication et toutes les opérations de l'école depuis une seule plateforme puissante.",
  "Everything a school runs on": "Tout ce qui fait vivre une école", "One platform. Every operation.": "Une plateforme. Toutes les opérations.",
  "Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.": "Douze modules connectés remplacent les tableurs, registres papier et groupes WhatsApp sur lesquels votre école survit aujourd'hui.",
  "Student Management": "Gestion des étudiants", "Teacher Management": "Gestion des enseignants", "Attendance & Alerts": "Présences & alertes", "Grades & Report Cards": "Notes & bulletins",
  "Classes & Timetable": "Classes & emploi du temps", "Fees & Payments": "Frais & paiements", "Parent Communication": "Communication parents",
  "Documents & Certificates": "Documents & certificats", "Analytics & Insights": "Analytique & indicateurs", "Multi-campus Groups": "Groupes multi-campus", "Secure by Design": "Sécurité intégrée",
  "Get Started free": "Commencer gratuitement", "14-day free trial": "Essai gratuit de 14 jours", "No card required": "Aucune carte requise", "Multi-campus ready": "Prêt multi-campus",
  "Role-based access": "Accès par rôle", "A portal for every person in your school": "Un portail pour chaque personne de votre école",
  "Twelve roles, each with its own dashboard and granular permissions. Teachers see only their classes, parents only their children, accountants only finance.": "Douze rôles, chacun avec son propre tableau de bord et des permissions fines. Les enseignants ne voient que leurs classes, les parents leurs enfants, les comptables les finances.",
  "Explore role permissions": "Explorer les permissions",
  "Plans that scale with your school": "Des offres qui grandissent avec votre école",
  "Prices, limits and features are fully editable by the platform owner — in any currency.": "Prix, limites et fonctionnalités sont entièrement modifiables par le propriétaire — dans toutes les devises.",
  "Show prices in": "Afficher les prix en", "converted automatically": "conversion automatique", "unlimited teachers": "enseignants illimités", "Up to": "Jusqu'à", "teachers": "enseignants",
  "Start free trial": "Essai gratuit", "Start 14-day trial": "Essai de 14 jours", "Contact sales": "Contacter l'équipe", "per month": "/mois",
  "Most popular": "Le plus populaire", "Unlimited students": "Étudiants illimités",
  "Security first": "La sécurité d'abord", "Built to protect your school's data": "Conçu pour protéger les données de votre école",
  "Hashed passwords & 2FA": "Mots de passe hachés & 2FA", "Granular RBAC permissions": "Permissions RBAC granulaires", "Full audit trail with IP & device": "Journal d'audit complet (IP & appareil)",
  "Automatic nightly backups": "Sauvegardes nocturnes automatiques", "Rate limiting & account lockout": "Limitation de débit & verrouillage de compte", "White-label & multi-tenant": "Marque blanche & multi-établissements",
  "Ready to run your school on VITECH?": "Prêt à gérer votre école avec VITECH ?",
  "Deploy in minutes. Import your students from Excel. Go paperless this term.": "Déployez en quelques minutes. Importez vos étudiants depuis Excel. Passez au zéro papier dès ce trimestre.",
  "Create your school": "Créer votre école", "Verify a certificate": "Vérifier un certificat", "white-label ready": "prêt marque blanche",
  "Verify certificate": "Vérifier un certificat", "Product": "Produit", "Platform": "Plateforme",
  "Sign in": "Se connecter", "Email": "E-mail", "Password": "Mot de passe", "Sign in to your account": "Connectez-vous à votre compte",
  "Forgot password?": "Mot de passe oublié ?", "Don't have an account?": "Pas encore de compte ?", "Create one": "Créer un compte",
  "Demo accounts — password": "Comptes démo — mot de passe", "Two-factor authentication": "Authentification à deux facteurs",
  "Verify & continue": "Vérifier & continuer", "School information": "Informations de l'école", "Academic year": "Année académique",
  "Finish": "Terminer", "Back": "Retour", "Next": "Suivant", "Continue": "Continuer", "School name": "Nom de l'école", "Country": "Pays",
  "Currency": "Devise", "Phone": "Téléphone", "Launch my school": "Lancer mon école", "Reset password": "Réinitialiser le mot de passe",
  "Send reset link": "Envoyer le lien", "New password": "Nouveau mot de passe", "Confirm password": "Confirmer le mot de passe",
  "Remember me": "Se souvenir de moi", "Levels": "Niveaux", "Sign in to your school": "Connectez-vous à votre école",
  "Secure access with role-based permissions.": "Accès sécurisé avec des permissions par rôle.", "Email address": "Adresse e-mail",
  "Verifying…": "Vérification…", "6-digit code": "Code à 6 chiffres", "Back to login": "Retour à la connexion", "Back to site": "Retour au site",
  "Admin full name": "Nom complet de l'administrateur", "Admin email": "E-mail de l'administrateur", "Which levels does your school run?": "Quels niveaux votre école propose-t-elle ?",
  "Free 14-day trial · no card required": "Essai de 14 jours · aucune carte requise",
  "Save changes": "Enregistrer", "Save": "Enregistrer", "Cancel": "Annuler", "Add": "Ajouter", "Edit": "Modifier", "Delete": "Supprimer",
  "Print": "Imprimer", "Export": "Exporter", "Import": "Importer", "Download": "Télécharger", "Search": "Rechercher", "View": "Voir",
  "Close": "Fermer", "Change": "Modifier", "Today": "Aujourd'hui", "Status": "Statut", "Actions": "Actions", "Name": "Nom", "Class": "Classe",
  "Active": "Actif", "Inactive": "Inactif", "Pending": "En attente", "Approved": "Approuvé", "Rejected": "Rejeté", "Paid": "Payé",
  "Overdue": "En retard", "Scheduled": "Programmé", "Completed": "Terminé", "Valid": "Valide", "New student": "Nouvel étudiant",
  "Showing": "Affichage", "of": "sur", "Welcome back": "Bon retour",
  "VITECH School for your desktop": "VITECH School pour votre ordinateur",
  "The full school ERP, offline-first, on Windows, macOS and Linux.": "L'ERP scolaire complet, hors-ligne d'abord, sur Windows, macOS et Linux.",
  "Download for": "Télécharger pour", "Preparing package": "Préparation du paquet", "Package ready": "Paquet prêt", "Download started": "Téléchargement démarré",
  "Nothing happened? Save via new tab": "Rien ne se passe ? Enregistrer via un nouvel onglet", "Opening in a new tab": "Ouverture dans un nouvel onglet",
  "Preview note": "Vous êtes dans un aperçu sécurisé : une fenêtre « Enregistrer sous » va s'ouvrir pour choisir l'emplacement du fichier sur votre ordinateur.",
  "Direct link": "Lien direct", "Works in preview": "Marche dans l'aperçu",
  "Save hint": "Faites un clic droit sur le lien ci-dessus puis choisissez « Enregistrer le lien sous… » — le fichier sera enregistré même si le bouton est bloqué. Un simple clic fonctionne aussi sur le site déployé.",
  "Download complete": "Téléchargement terminé", "Share file": "Partager le fichier", "Open in new tab": "Ouvrir dans un nouvel onglet", "Detected": "Détecté",
  "How to install": "Comment installer", "Download history": "Historique des téléchargements", "No downloads yet this session.": "Aucun téléchargement cette session.",
  "My children": "Mes enfants", "My results": "Mes résultats", "My timetable": "Mon emploi du temps", "Fees status": "Situation des frais",
  "Their grades": "Ses notes", "School news": "Actualités de l'école", "Mark attendance": "Faire l'appel", "Enter grades": "Saisir les notes",
  "My classes": "Mes classes", "periods": "périodes", "days": "jours", "Customize": "Personnaliser", "Customization": "Personnalisation",
};

const es: Dict = {
  "Dashboard": "Panel de control", "Students": "Estudiantes", "Admissions": "Admisiones", "Teachers": "Docentes", "HR & Staff": "RR. HH. y personal", "Classes": "Clases", "Subjects": "Asignaturas",
  "Timetable": "Horario", "Attendance": "Asistencia", "Exams": "Exámenes", "Grades": "Calificaciones", "Report cards": "Boletines", "Fees & Structures": "Cuotas y estructuras", "Payments": "Pagos",
  "Invoices": "Facturas", "Expenses": "Gastos", "Financial Reports": "Informes financieros", "Communication": "Comunicación", "Announcements": "Anuncios", "Calendar": "Calendario",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Carnés", "Audit logs": "Registro de auditoría",
  "Backups": "Copias de seguridad", "Analytics": "Analítica", "Settings": "Ajustes", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Mi portal", "Overview": "Resumen", "People": "Personas",
  "Academics": "Académico", "Finance": "Finanzas", "Engagement": "Comunicación", "Management": "Gestión", "Operations": "Operaciones", "Help & Support": "Ayuda y soporte",
  "Search anything…": "Buscar estudiantes, pagos, recibos…", "Notifications": "Notificaciones", "Sign out": "Cerrar sesión", "Language": "Idioma", "Menu": "Menú",
  "Good morning": "Buenos días", "Good afternoon": "Buenas tardes", "Here's what's happening at": "Esto es lo que ocurre en", "today": "hoy",
  "New admission": "Nueva admisión", "Record payment": "Registrar pago", "Total students": "Total de estudiantes", "Attendance today": "Asistencia de hoy",
  "Payments today": "Pagos de hoy", "Monthly revenue": "Ingresos mensuales", "Pending fees": "Cuotas pendientes", "Net position": "Posición neta",
  "Features": "Funciones", "Pricing": "Precios", "Roles": "Roles", "Security": "Seguridad", "Login": "Entrar", "Get Started": "Comenzar", "Request a Demo": "Solicitar una demo",
  "Complete School Management System": "El sistema completo de gestión escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gestiona estudiantes, docentes, asistencia, calificaciones, cuotas, comunicación y todas las operaciones del colegio desde una única plataforma potente.",
  "Get Started free": "Comenzar gratis", "14-day free trial": "Prueba gratuita de 14 días", "No card required": "Sin tarjeta", "Multi-campus ready": "Listo para multicampus",
  "Desktop app": "App de escritorio", "Download for": "Descargar para", "Preparing package": "Preparando el paquete", "Package ready": "Paquete listo", "Download started": "Descarga iniciada",
  "Nothing happened? Save via new tab": "¿Nada ocurre? Guardar en pestaña nueva", "Opening in a new tab": "Abriendo en pestaña nueva",
  "Preview note": "Estás en una vista previa segura: se abrirá la ventana «Guardar como» para elegir la ubicación del archivo.",
  "Direct link": "Enlace directo", "Works in preview": "Funciona en la vista previa",
  "Save hint": "Haz clic derecho en el enlace de arriba y elige «Guardar enlace como…» — el archivo se guardará aunque el botón esté bloqueado. Un clic simple también funciona en el sitio desplegado.",
  "Download complete": "Descarga completada", "Share file": "Compartir archivo", "Open in new tab": "Abrir en pestaña nueva", "Detected": "Detectado", "How to install": "Cómo instalar",
  "Sign in": "Iniciar sesión", "Email": "Correo", "Password": "Contraseña", "Forgot password?": "¿Olvidaste tu contraseña?", "Remember me": "Recordarme",
  "Save changes": "Guardar cambios", "Save": "Guardar", "Cancel": "Cancelar", "Add": "Añadir", "Edit": "Editar", "Delete": "Eliminar", "Print": "Imprimir",
  "Export": "Exportar", "Import": "Importar", "Download": "Descargar", "Search": "Buscar", "View": "Ver", "Close": "Cerrar", "Today": "Hoy", "Status": "Estado",
  "Actions": "Acciones", "Name": "Nombre", "Class": "Clase", "New student": "Nuevo estudiante", "Welcome back": "Bienvenido de nuevo", "students": "estudiantes",
  "Present": "Presente", "Late": "Retraso", "Absent": "Ausente", "Excused": "Justificado", "All": "Todos", "Showing": "Mostrando", "of": "de",
};

const pt: Dict = {
  "Dashboard": "Painel", "Students": "Estudantes", "Admissions": "Admissões", "Teachers": "Professores", "HR & Staff": "RH e pessoal", "Classes": "Turmas", "Subjects": "Disciplinas",
  "Timetable": "Horário", "Attendance": "Presenças", "Exams": "Exames", "Grades": "Notas", "Report cards": "Boletins", "Fees & Structures": "Propinas e estruturas", "Payments": "Pagamentos",
  "Invoices": "Faturas", "Expenses": "Despesas", "Financial Reports": "Relatórios financeiros", "Communication": "Comunicação", "Announcements": "Anúncios", "Calendar": "Calendário",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Cartões", "Audit logs": "Registos de auditoria",
  "Backups": "Cópias de segurança", "Analytics": "Análise", "Settings": "Definições", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Meu portal", "Overview": "Visão geral", "People": "Pessoas",
  "Academics": "Académico", "Finance": "Finanças", "Engagement": "Comunicação", "Management": "Gestão", "Operations": "Operações", "Help & Support": "Ajuda e suporte",
  "Search anything…": "Pesquisar estudantes, pagamentos, recibos…", "Notifications": "Notificações", "Sign out": "Terminar sessão", "Language": "Idioma", "Menu": "Menu",
  "Good morning": "Bom dia", "Good afternoon": "Boa tarde", "Here's what's happening at": "Eis o que se passa em", "today": "hoje",
  "New admission": "Nova admissão", "Record payment": "Registar pagamento", "Total students": "Total de estudantes", "Attendance today": "Presenças de hoje",
  "Payments today": "Pagamentos de hoje", "Monthly revenue": "Receita mensal", "Pending fees": "Propinas pendentes", "Net position": "Posição líquida",
  "Features": "Funcionalidades", "Pricing": "Preços", "Roles": "Funções", "Security": "Segurança", "Login": "Entrar", "Get Started": "Começar", "Request a Demo": "Pedir uma demo",
  "Complete School Management System": "O sistema completo de gestão escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gira estudantes, professores, presenças, notas, propinas, comunicação e todas as operações da escola numa única plataforma poderosa.",
  "Get Started free": "Começar grátis", "14-day free trial": "Teste grátis de 14 dias", "No card required": "Sem cartão", "Multi-campus ready": "Pronto para multi-campus",
  "Desktop app": "App de secretária", "Download for": "Transferir para", "Preparing package": "A preparar o pacote", "Package ready": "Pacote pronto", "Download started": "Transferência iniciada",
  "Nothing happened? Save via new tab": "Nada aconteceu? Guardar em novo separador", "Opening in a new tab": "A abrir em novo separador",
  "Preview note": "Está numa pré-visualização segura: a janela «Guardar como» vai abrir para escolher a localização do ficheiro.",
  "Direct link": "Ligação direta", "Works in preview": "Funciona na pré-visualização",
  "Save hint": "Clique com o botão direito na ligação acima e escolha «Guardar ligação como…» — o ficheiro será guardado mesmo que o botão esteja bloqueado. Um clique simples também funciona no site publicado.",
  "Download complete": "Transferência concluída", "Share file": "Partilhar ficheiro", "Open in new tab": "Abrir em novo separador", "Detected": "Detetado", "How to install": "Como instalar",
  "Sign in": "Iniciar sessão", "Email": "E-mail", "Password": "Palavra-passe", "Forgot password?": "Esqueceu a palavra-passe?", "Remember me": "Lembrar-me",
  "Save changes": "Guardar alterações", "Save": "Guardar", "Cancel": "Cancelar", "Add": "Adicionar", "Edit": "Editar", "Delete": "Eliminar", "Print": "Imprimir",
  "Export": "Exportar", "Import": "Importar", "Download": "Transferir", "Search": "Pesquisar", "View": "Ver", "Close": "Fechar", "Today": "Hoje", "Status": "Estado",
  "Actions": "Ações", "Name": "Nome", "Class": "Turma", "New student": "Novo estudante", "Welcome back": "Bem-vindo de volta", "students": "estudantes",
  "Present": "Presente", "Late": "Atraso", "Absent": "Ausente", "Excused": "Justificado", "All": "Todos", "Showing": "A mostrar", "of": "de",
};

const ar: Dict = {
  "Dashboard": "لوحة التحكم", "Students": "الطلاب", "Admissions": "القبول", "Teachers": "المعلمون", "HR & Staff": "الموارد البشرية", "Classes": "الفصول", "Subjects": "المواد",
  "Timetable": "الجدول الدراسي", "Attendance": "الحضور", "Exams": "الامتحانات", "Grades": "الدرجات", "Report cards": "الشهادات الدراسية", "Fees & Structures": "الرسوم والهياكل", "Payments": "المدفوعات",
  "Invoices": "الفواتير", "Expenses": "المصروفات", "Financial Reports": "التقارير المالية", "Communication": "التواصل", "Announcements": "الإعلانات", "Calendar": "التقويم",
  "Library": "المكتبة", "Transport": "النقل", "Documents": "المستندات", "Certificates": "الشهادات", "ID cards": "البطاقات", "Audit logs": "سجلات التدقيق",
  "Backups": "النسخ الاحتياطي", "Analytics": "التحليلات", "Settings": "الإعدادات", "Platform (SaaS)": "المنصة (SaaS)", "My Portal": "بوابتي", "Overview": "نظرة عامة", "People": "الأشخاص",
  "Academics": "الشؤون الأكاديمية", "Finance": "المالية", "Engagement": "التواصل", "Management": "الإدارة", "Operations": "العمليات", "Help & Support": "المساعدة والدعم",
  "Search anything…": "ابحث عن الطلاب والمدفوعات والإيصالات…", "Notifications": "الإشعارات", "Sign out": "تسجيل الخروج", "Language": "اللغة", "Menu": "القائمة",
  "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Here's what's happening at": "إليك ما يحدث في", "today": "اليوم",
  "New admission": "قبول جديد", "Record payment": "تسجيل دفعة", "Total students": "إجمالي الطلاب", "Attendance today": "حضور اليوم",
  "Payments today": "مدفوعات اليوم", "Monthly revenue": "الإيرادات الشهرية", "Pending fees": "رسوم مستحقة", "Net position": "الصافي",
  "Features": "المميزات", "Pricing": "الأسعار", "Roles": "الأدوار", "Security": "الأمان", "Login": "دخول", "Get Started": "ابدأ الآن", "Request a Demo": "اطلب عرضاً تجريبياً",
  "Complete School Management System": "نظام متكامل لإدارة المدارس",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "أدر الطلاب والمعلمين والحضور والدرجات والرسوم والتواصل وجميع عمليات المدرسة من منصة واحدة قوية.",
  "Get Started free": "ابدأ مجاناً", "14-day free trial": "تجربة مجانية 14 يوماً", "No card required": "دون بطاقة", "Multi-campus ready": "جاهز للفروع المتعددة",
  "Desktop app": "تطبيق سطح المكتب", "Download for": "تنزيل لـ", "Preparing package": "جارٍ تحضير الحزمة", "Package ready": "الحزمة جاهزة", "Download started": "بدأ التنزيل",
  "Nothing happened? Save via new tab": "لم يحدث شيء؟ احفظ عبر علامة جديدة", "Opening in a new tab": "جارٍ الفتح في علامة جديدة",
  "Preview note": "أنت في معاينة آمنة: ستُفتح نافذة «حفظ باسم» لاختيار مكان الملف على جهازك.",
  "Direct link": "رابط مباشر", "Works in preview": "يعمل في المعاينة",
  "Save hint": "انقر بزر الفأرة الأيمن على الرابط أعلاه واختر «حفظ الرابط باسم…» — سيتم حفظ الملف حتى لو كان الزر محظوراً. النقر العادي يعمل أيضاً على الموقع المنشور.",
  "Download complete": "اكتمل التنزيل", "Share file": "مشاركة الملف", "Open in new tab": "فتح في علامة جديدة", "Detected": "تم الاكتشاف", "How to install": "كيفية التثبيت",
  "Sign in": "تسجيل الدخول", "Email": "البريد الإلكتروني", "Password": "كلمة المرور", "Forgot password?": "نسيت كلمة المرور؟", "Remember me": "تذكرني",
  "Save changes": "حفظ التغييرات", "Save": "حفظ", "Cancel": "إلغاء", "Add": "إضافة", "Edit": "تعديل", "Delete": "حذف", "Print": "طباعة",
  "Export": "تصدير", "Import": "استيراد", "Download": "تنزيل", "Search": "بحث", "View": "عرض", "Close": "إغلاق", "Today": "اليوم", "Status": "الحالة",
  "Actions": "إجراءات", "Name": "الاسم", "Class": "الفصل", "New student": "طالب جديد", "Welcome back": "مرحباً بعودتك", "students": "طالب",
  "Present": "حاضر", "Late": "متأخر", "Absent": "غائب", "Excused": "بعذر", "All": "الكل", "Showing": "عرض", "of": "من",
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

/** Bound translator — curated dict → AI MT cache → English source. */
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
