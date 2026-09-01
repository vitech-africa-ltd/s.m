import { useEffect, useState } from "react";
import { useApp, LANG_CODES, type Lang } from "./data";
import { mtGet, onMT, requestMT } from "./mt";

/* Keys are the English source strings — any untranslated key renders in English. */
type Dict = Record<string, string>;

const en: Dict = {};

const fr: Dict = {
  /* navigation */
  "Overview": "Aperçu", "People": "Personnes", "Academics": "Académique", "Finance": "Finances", "Engagement": "Communication", "Management": "Gestion", "Operations": "Opérations",
  "Dashboard": "Tableau de bord", "Students": "Étudiants", "Admissions": "Admissions", "Teachers": "Enseignants", "HR & Staff": "RH & Personnel", "Classes": "Classes", "Subjects": "Matières",
  "Timetable": "Emploi du temps", "Attendance": "Présences", "Exams": "Examens", "Grades": "Notes", "Report cards": "Bulletins", "Fees & Structures": "Frais & structures", "Payments": "Paiements",
  "Invoices": "Factures", "Expenses": "Dépenses", "Financial Reports": "Rapports financiers", "Communication": "Communication", "Announcements": "Annonces", "Calendar": "Calendrier",
  "Library": "Bibliothèque", "Transport": "Transport", "Documents": "Documents", "Certificates": "Certificats", "ID cards": "Cartes d'identité", "Audit logs": "Journaux d'audit",
  "Backups": "Sauvegardes", "Analytics": "Analytique", "Settings": "Paramètres", "Platform (SaaS)": "Plateforme (SaaS)", "My Portal": "Mon portail", "Reports": "Rapports",
  "Search anything…": "Rechercher étudiants, paiements, reçus…", "Notifications": "Notifications", "Sign out": "Déconnexion", "Mark all read": "Tout marquer comme lu", "Language": "Langue",
  /* dashboard */
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
  /* page titles */
  "Students & registration": "Étudiants & inscriptions", "Admissions pipeline": "Pipeline d'admission", "Teachers & staff": "Enseignants & personnel",
  "Classes & Sections": "Classes & sections", "Grade entry": "Saisie des notes", "Communication Center": "Centre de communication",
  "School calendar": "Calendrier scolaire", "School transport": "Transport scolaire", "Backups & restore": "Sauvegardes & restauration",
  "Platform control": "Contrôle de la plateforme", "Student portal": "Portail étudiant", "Parent portal": "Portail parent", "Teacher portal": "Portail enseignant",
  /* landing */
  "Features": "Fonctionnalités", "Pricing": "Tarifs", "Roles": "Rôles", "Security": "Sécurité", "Login": "Connexion", "Get Started": "Commencer",
  "Request a Demo": "Demander une démo", "Complete School Management System": "Le système complet de gestion scolaire",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gérez les étudiants, les enseignants, les présences, les notes, les frais, la communication et toutes les opérations de l'école depuis une seule plateforme puissante.",
  "Trusted by forward-thinking schools": "La confiance des écoles tournées vers l'avenir",
  "Why schools choose VITECH": "Pourquoi les écoles choisissent VITECH",
  "Everything a school runs on": "Tout ce qui fait vivre une école", "One platform. Every operation.": "Une plateforme. Toutes les opérations.",
  "Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.": "Douze modules connectés remplacent les tableurs, registres papier et groupes WhatsApp sur lesquels votre école survit aujourd'hui.",
  "Student Management": "Gestion des étudiants", "Teacher Management": "Gestion des enseignants", "Attendance & Alerts": "Présences & alertes", "Grades & Report Cards": "Notes & bulletins",
  "Classes & Timetable": "Classes & emploi du temps", "Fees & Payments": "Frais & paiements", "Parent Communication": "Communication parents",
  "Documents & Certificates": "Documents & certificats", "Analytics & Insights": "Analytique & indicateurs", "Multi-campus Groups": "Groupes multi-campus", "Secure by Design": "Sécurité intégrée",
  "Students managed": "Étudiants gérés", "Teachers onboard": "Enseignants à bord", "Fees collected (demo)": "Frais collectés (démo)", "Classes & sections": "Classes & sections",
  "14-day free trial": "Essai gratuit de 14 jours", "No card required": "Aucune carte requise", "Multi-campus ready": "Prêt multi-campus", "Get Started free": "Commencer gratuitement",
  "One platform, every role": "Une plateforme, tous les rôles",
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
  /* auth */
  "Sign in": "Se connecter", "Email": "E-mail", "Password": "Mot de passe", "Sign in to your account": "Connectez-vous à votre compte",
  "Forgot password?": "Mot de passe oublié ?", "Don't have an account?": "Pas encore de compte ?", "Create one": "Créer un compte",
  "Demo accounts — password": "Comptes démo — mot de passe", "Two-factor authentication": "Authentification à deux facteurs",
  "Verify & continue": "Vérifier & continuer", "School information": "Informations de l'école",
  "Academic year": "Année académique", "Finish": "Terminer", "Back": "Retour", "Next": "Suivant", "Continue": "Continuer",
  "School name": "Nom de l'école", "Admin name": "Nom de l'administrateur", "Admin email": "E-mail de l'administrateur", "Country": "Pays",
  "Currency": "Devise", "Phone": "Téléphone", "Launch my school": "Lancer mon école", "Reset password": "Réinitialiser le mot de passe",
  "Send reset link": "Envoyer le lien", "New password": "Nouveau mot de passe", "Confirm password": "Confirmer le mot de passe",
  "Remember me": "Se souvenir de moi", "Levels": "Niveaux", "Select the levels your school offers.": "Sélectionnez les niveaux offerts par votre école.",
  "Sign in to your school": "Connectez-vous à votre école", "Secure access with role-based permissions.": "Accès sécurisé avec des permissions par rôle.",
  "Email address": "Adresse e-mail", "Verifying…": "Vérification…", "6-digit code": "Code à 6 chiffres",
  "Account locked — try again in 30 seconds.": "Compte verrouillé — réessayez dans 30 secondes.",
  "Free 14-day trial · no card required": "Essai gratuit de 14 jours · aucune carte requise",
  "Admin full name": "Nom complet de l'administrateur", "Auto-detected:": "Détecté automatiquement :",
  "Which levels does your school run?": "Quels niveaux votre école propose-t-elle ?",
  "Set a new password": "Définir un nouveau mot de passe", "Reset your password": "Réinitialiser votre mot de passe",
  "Enter your new password below.": "Saisissez votre nouveau mot de passe ci-dessous.", "We'll email you a secure reset link.": "Nous vous enverrons un lien de réinitialisation sécurisé.",
  "Check your inbox": "Vérifiez votre boîte mail", "Open reset link (demo)": "Ouvrir le lien (démo)", "Back to login": "Retour à la connexion",
  "Back to site": "Retour au site", "Update password": "Mettre à jour le mot de passe",
  "Passwords are hashed with bcrypt — never stored in plain text.": "Les mots de passe sont hachés avec bcrypt — jamais stockés en clair.",
  /* common */
  "Save changes": "Enregistrer", "Save": "Enregistrer", "Cancel": "Annuler", "Add": "Ajouter", "Edit": "Modifier", "Delete": "Supprimer",
  "Print": "Imprimer", "Export": "Exporter", "Import": "Importer", "Download": "Télécharger", "Search": "Rechercher", "View": "Voir",
  "Close": "Fermer", "Change": "Modifier", "Today": "Aujourd'hui", "Status": "Statut", "Actions": "Actions", "Name": "Nom", "Class": "Classe",
  "Active": "Actif", "Inactive": "Inactif", "Pending": "En attente", "Approved": "Approuvé", "Rejected": "Rejeté", "Paid": "Payé",
  "Overdue": "En retard", "Scheduled": "Programmé", "Completed": "Terminé", "Valid": "Valide", "New student": "Nouvel étudiant",
  "Showing": "Affichage", "of": "sur", "Welcome back": "Bon retour",
  /* portals */
  "Term grade": "Note du trimestre", "Average %": "Moyenne %", "My attendance": "Ma présence", "Last 15 school days": "15 derniers jours d'école",
  "Class average today": "Moyenne de la classe aujourd'hui", "Fees status": "Situation des frais", "Annual fees": "Frais annuels",
  "Balance": "Solde", "Fully paid — well done!": "Tout est payé — bravo !", "Next exam": "Prochain examen", "days away": "jours restants",
  "My results": "Mes résultats", "My timetable": "Mon emploi du temps", "Room": "Salle", "Subject": "Matière",
  "Mark": "Note", "Time": "Heure", "No children linked to this account": "Aucun enfant lié à ce compte",
  "Your children's progress, attendance and fees at a glance.": "Les progrès, la présence et les frais de vos enfants en un coup d'œil.",
  "Class teacher": "Titulaire", "Average": "Moyenne", "Grade": "Note", "Fees & balance": "Frais & solde", "Please clear": "Merci de régler",
  "No balance — thank you!": "Aucun solde — merci !", "Latest results": "Derniers résultats", "School announcements": "Annonces de l'école",
  "You receive absence alerts, payment confirmations and exam reminders on WhatsApp & SMS.": "Vous recevez les alertes d'absence, confirmations de paiement et rappels d'examens sur WhatsApp & SMS.",
  "You can access only your assigned classes.": "Vous n'accédez qu'à vos classes attribuées.", "Take attendance": "Faire l'appel",
  "Enter grades": "Saisir les notes", "My classes": "Mes classes", "My students": "Mes étudiants", "Periods / week": "Périodes / semaine",
  "Section": "Section", "Today's schedule": "Emploi du temps du jour", "No periods today — enjoy the free day.": "Aucun cours aujourd'hui — bonne journée.",
  "Announcements for staff": "Annonces pour le personnel",
};

const es: Dict = {
  /* navigation */
  "Overview": "Resumen", "People": "Personas", "Academics": "Académico", "Finance": "Finanzas", "Engagement": "Comunicación", "Management": "Gestión", "Operations": "Operaciones",
  "Dashboard": "Panel de control", "Students": "Estudiantes", "Admissions": "Admisiones", "Teachers": "Docentes", "HR & Staff": "RR. HH. y personal", "Classes": "Clases", "Subjects": "Asignaturas",
  "Timetable": "Horario", "Attendance": "Asistencia", "Exams": "Exámenes", "Grades": "Calificaciones", "Report cards": "Boletines", "Fees & Structures": "Cuotas y estructuras", "Payments": "Pagos",
  "Invoices": "Facturas", "Expenses": "Gastos", "Financial Reports": "Informes financieros", "Communication": "Comunicación", "Announcements": "Anuncios", "Calendar": "Calendario",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Carnés", "Audit logs": "Registro de auditoría",
  "Backups": "Copias de seguridad", "Analytics": "Analítica", "Settings": "Ajustes", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Mi portal", "Reports": "Informes",
  "Search anything…": "Buscar estudiantes, pagos, recibos…", "Notifications": "Notificaciones", "Sign out": "Cerrar sesión", "Mark all read": "Marcar todo como leído", "Language": "Idioma",
  /* dashboard */
  "Good morning": "Buenos días", "Good afternoon": "Buenas tardes", "Here's what's happening at": "Esto es lo que ocurre en", "today": "hoy",
  "New admission": "Nueva admisión", "Record payment": "Registrar pago", "Total students": "Total de estudiantes", "active": "activos", "on duty": "en servicio",
  "Attendance today": "Asistencia de hoy", "absent": "ausentes", "late": "retrasos", "subjects": "asignaturas", "Payments today": "Pagos de hoy",
  "Monthly revenue": "Ingresos mensuales", "Pending fees": "Cuotas pendientes", "unpaid students": "estudiantes sin saldo", "Net position": "Posición neta",
  "Revenue vs Expenses": "Ingresos vs Gastos", "Last 8 months": "Últimos 8 meses", "margin": "de margen", "Student enrollment": "Matrícula de estudiantes",
  "Fee collection": "Recaudación de cuotas", "Report": "Informe", "of annual fees collected": "de las cuotas anuales recaudadas", "still outstanding across": "pendientes en",
  "students": "estudiantes", "Upcoming events": "Próximos eventos", "Recent payments": "Pagos recientes", "View all": "Ver todo", "Receipt": "Recibo",
  "Student": "Estudiante", "Method": "Método", "Date": "Fecha", "Amount": "Importe", "Recent registrations": "Matriculaciones recientes", "All": "Todos",
  "admitted": "admitido", "Recent activity": "Actividad reciente", "New admissions (30d)": "Admisiones (30 d)", "Upcoming exams": "Próximos exámenes",
  "Library loans active": "Préstamos activos", "Absent alerts sent": "Alertas de ausencia enviadas", "present": "presentes",
  "Present": "Presente", "Late": "Retraso", "Absent": "Ausente", "Excused": "Justificado",
  /* page titles */
  "Students & registration": "Estudiantes y matrícula", "Admissions pipeline": "Proceso de admisión", "Teachers & staff": "Docentes y personal",
  "Classes & Sections": "Clases y secciones", "Grade entry": "Registro de calificaciones", "Communication Center": "Centro de comunicación",
  "School calendar": "Calendario escolar", "School transport": "Transporte escolar", "Backups & restore": "Copias y restauración",
  "Platform control": "Control de la plataforma", "Student portal": "Portal del estudiante", "Parent portal": "Portal de padres", "Teacher portal": "Portal del docente",
  /* landing */
  "Features": "Funciones", "Pricing": "Precios", "Roles": "Roles", "Security": "Seguridad", "Login": "Entrar", "Get Started": "Comenzar",
  "Request a Demo": "Solicitar una demo", "Complete School Management System": "El sistema completo de gestión escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gestiona estudiantes, docentes, asistencia, calificaciones, cuotas, comunicación y todas las operaciones del colegio desde una única plataforma potente.",
  "Trusted by forward-thinking schools": "La confianza de los colegios más innovadores",
  "Everything a school runs on": "Todo lo que necesita un colegio", "One platform. Every operation.": "Una plataforma. Todas las operaciones.",
  "Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.": "Doce módulos conectados sustituyen las hojas de cálculo, los registros en papel y los grupos de WhatsApp de los que vive tu colegio hoy.",
  "Student Management": "Gestión de estudiantes", "Teacher Management": "Gestión de docentes", "Attendance & Alerts": "Asistencia y alertas", "Grades & Report Cards": "Calificaciones y boletines",
  "Classes & Timetable": "Clases y horario", "Fees & Payments": "Cuotas y pagos", "Parent Communication": "Comunicación con padres",
  "Documents & Certificates": "Documentos y certificados", "Analytics & Insights": "Analítica e indicadores", "Multi-campus Groups": "Grupos multicampus", "Secure by Design": "Seguridad integrada",
  "Students managed": "Estudiantes gestionados", "Teachers onboard": "Docentes a bordo", "Fees collected (demo)": "Cuotas recaudadas (demo)", "Classes & sections": "Clases y secciones",
  "14-day free trial": "Prueba gratuita de 14 días", "No card required": "Sin tarjeta", "Multi-campus ready": "Listo para multicampus", "Get Started free": "Comenzar gratis",
  "Role-based access": "Acceso por roles", "A portal for every person in your school": "Un portal para cada persona de tu colegio",
  "Twelve roles, each with its own dashboard and granular permissions. Teachers see only their classes, parents only their children, accountants only finance.": "Doce roles, cada uno con su propio panel y permisos detallados. Los docentes ven solo sus clases, los padres solo a sus hijos, los contables solo las finanzas.",
  "Explore role permissions": "Explorar permisos",
  "Plans that scale with your school": "Planes que crecen con tu colegio",
  "Prices, limits and features are fully editable by the platform owner — in any currency.": "Precios, límites y funciones son totalmente editables por el propietario, en cualquier moneda.",
  "Show prices in": "Mostrar precios en", "converted automatically": "conversión automática", "unlimited teachers": "docentes ilimitados", "Up to": "Hasta", "teachers": "docentes",
  "Start free trial": "Prueba gratuita", "Start 14-day trial": "Prueba de 14 días", "Contact sales": "Contactar ventas", "per month": "/mes",
  "Most popular": "El más popular", "Unlimited students": "Estudiantes ilimitados",
  "Security first": "La seguridad primero", "Built to protect your school's data": "Diseñado para proteger los datos de tu colegio",
  "Hashed passwords & 2FA": "Contraseñas cifradas y 2FA", "Granular RBAC permissions": "Permisos RBAC detallados", "Full audit trail with IP & device": "Auditoría completa con IP y dispositivo",
  "Automatic nightly backups": "Copias nocturnas automáticas", "Rate limiting & account lockout": "Límite de intentos y bloqueo de cuenta", "White-label & multi-tenant": "Marca blanca y multi-centro",
  "Ready to run your school on VITECH?": "¿Listo para dirigir tu colegio con VITECH?",
  "Deploy in minutes. Import your students from Excel. Go paperless this term.": "Despliega en minutos. Importa tus estudiantes desde Excel. Elimina el papel este trimestre.",
  "Create your school": "Crea tu colegio", "Verify a certificate": "Verificar un certificado", "white-label ready": "listo para marca blanca",
  "Verify certificate": "Verificar certificado", "Product": "Producto", "Platform": "Plataforma",
  /* auth */
  "Sign in": "Iniciar sesión", "Email": "Correo", "Password": "Contraseña", "Sign in to your account": "Accede a tu cuenta",
  "Forgot password?": "¿Olvidaste tu contraseña?", "Don't have an account?": "¿No tienes cuenta?", "Create one": "Crear una",
  "Demo accounts — password": "Cuentas demo — contraseña", "Two-factor authentication": "Autenticación en dos pasos",
  "Verify & continue": "Verificar y continuar", "School information": "Datos del colegio",
  "Academic year": "Año académico", "Finish": "Finalizar", "Back": "Atrás", "Next": "Siguiente", "Continue": "Continuar",
  "School name": "Nombre del colegio", "Admin name": "Nombre del administrador", "Admin email": "Correo del administrador", "Country": "País",
  "Currency": "Moneda", "Phone": "Teléfono", "Launch my school": "Lanzar mi colegio", "Reset password": "Restablecer contraseña",
  "Send reset link": "Enviar enlace", "New password": "Nueva contraseña", "Confirm password": "Confirmar contraseña",
  "Remember me": "Recordarme", "Levels": "Niveles", "Select the levels your school offers.": "Selecciona los niveles que ofrece tu colegio.",
  "Sign in to your school": "Accede a tu colegio", "Secure access with role-based permissions.": "Acceso seguro con permisos por rol.",
  "Email address": "Correo electrónico", "Verifying…": "Verificando…", "6-digit code": "Código de 6 dígitos",
  "Account locked — try again in 30 seconds.": "Cuenta bloqueada — inténtalo en 30 segundos.",
  "Free 14-day trial · no card required": "Prueba de 14 días · sin tarjeta",
  "Admin full name": "Nombre completo del administrador", "Auto-detected:": "Detectado automáticamente:",
  "Which levels does your school run?": "¿Qué niveles imparte tu colegio?",
  "Set a new password": "Define una nueva contraseña", "Reset your password": "Restablece tu contraseña",
  "Enter your new password below.": "Escribe tu nueva contraseña abajo.", "We'll email you a secure reset link.": "Te enviaremos un enlace seguro de restablecimiento.",
  "Check your inbox": "Revisa tu bandeja", "Open reset link (demo)": "Abrir enlace (demo)", "Back to login": "Volver a entrar",
  "Back to site": "Volver al sitio", "Update password": "Actualizar contraseña",
  "Passwords are hashed with bcrypt — never stored in plain text.": "Las contraseñas se cifran con bcrypt — nunca se guardan en texto plano.",
  /* common */
  "Save changes": "Guardar cambios", "Save": "Guardar", "Cancel": "Cancelar", "Add": "Añadir", "Edit": "Editar", "Delete": "Eliminar",
  "Print": "Imprimir", "Export": "Exportar", "Import": "Importar", "Download": "Descargar", "Search": "Buscar", "View": "Ver",
  "Close": "Cerrar", "Change": "Cambiar", "Today": "Hoy", "Status": "Estado", "Actions": "Acciones", "Name": "Nombre", "Class": "Clase",
  "Active": "Activo", "Inactive": "Inactivo", "Pending": "Pendiente", "Approved": "Aprobado", "Rejected": "Rechazado", "Paid": "Pagado",
  "Overdue": "Vencido", "Scheduled": "Programado", "Completed": "Completado", "Valid": "Válido", "New student": "Nuevo estudiante",
  "Showing": "Mostrando", "of": "de", "Welcome back": "Bienvenido de nuevo",
};

const pt: Dict = {
  /* navigation */
  "Overview": "Visão geral", "People": "Pessoas", "Academics": "Académico", "Finance": "Finanças", "Engagement": "Comunicação", "Management": "Gestão", "Operations": "Operações",
  "Dashboard": "Painel", "Students": "Estudantes", "Admissions": "Admissões", "Teachers": "Professores", "HR & Staff": "RH e pessoal", "Classes": "Turmas", "Subjects": "Disciplinas",
  "Timetable": "Horário", "Attendance": "Presenças", "Exams": "Exames", "Grades": "Notas", "Report cards": "Boletins", "Fees & Structures": "Propinas e estruturas", "Payments": "Pagamentos",
  "Invoices": "Faturas", "Expenses": "Despesas", "Financial Reports": "Relatórios financeiros", "Communication": "Comunicação", "Announcements": "Anúncios", "Calendar": "Calendário",
  "Library": "Biblioteca", "Transport": "Transporte", "Documents": "Documentos", "Certificates": "Certificados", "ID cards": "Cartões", "Audit logs": "Registos de auditoria",
  "Backups": "Cópias de segurança", "Analytics": "Análise", "Settings": "Definições", "Platform (SaaS)": "Plataforma (SaaS)", "My Portal": "Meu portal", "Reports": "Relatórios",
  "Search anything…": "Pesquisar estudantes, pagamentos, recibos…", "Notifications": "Notificações", "Sign out": "Terminar sessão", "Mark all read": "Marcar tudo como lido", "Language": "Idioma",
  /* dashboard */
  "Good morning": "Bom dia", "Good afternoon": "Boa tarde", "Here's what's happening at": "Eis o que se passa em", "today": "hoje",
  "New admission": "Nova admissão", "Record payment": "Registar pagamento", "Total students": "Total de estudantes", "active": "ativos", "on duty": "em serviço",
  "Attendance today": "Presenças de hoje", "absent": "ausentes", "late": "atrasos", "subjects": "disciplinas", "Payments today": "Pagamentos de hoje",
  "Monthly revenue": "Receita mensal", "Pending fees": "Propinas pendentes", "unpaid students": "estudantes em dívida", "Net position": "Posição líquida",
  "Revenue vs Expenses": "Receitas vs Despesas", "Last 8 months": "Últimos 8 meses", "margin": "de margem", "Student enrollment": "Matrículas de estudantes",
  "Fee collection": "Cobrança de propinas", "Report": "Relatório", "of annual fees collected": "das propinas anuais cobradas", "still outstanding across": "por cobrar em",
  "students": "estudantes", "Upcoming events": "Próximos eventos", "Recent payments": "Pagamentos recentes", "View all": "Ver tudo", "Receipt": "Recibo",
  "Student": "Estudante", "Method": "Método", "Date": "Data", "Amount": "Valor", "Recent registrations": "Matrículas recentes", "All": "Todos",
  "admitted": "admitido", "Recent activity": "Atividade recente", "New admissions (30d)": "Admissões (30 d)", "Upcoming exams": "Próximos exames",
  "Library loans active": "Empréstimos ativos", "Absent alerts sent": "Alertas de falta enviados", "present": "presentes",
  "Present": "Presente", "Late": "Atraso", "Absent": "Ausente", "Excused": "Justificado",
  /* page titles */
  "Students & registration": "Estudantes e matrículas", "Admissions pipeline": "Processo de admissão", "Teachers & staff": "Professores e pessoal",
  "Classes & Sections": "Turmas e secções", "Grade entry": "Lançamento de notas", "Communication Center": "Centro de comunicação",
  "School calendar": "Calendário escolar", "School transport": "Transporte escolar", "Backups & restore": "Cópias e reposição",
  "Platform control": "Controlo da plataforma", "Student portal": "Portal do estudante", "Parent portal": "Portal dos encarregados", "Teacher portal": "Portal do professor",
  /* landing */
  "Features": "Funcionalidades", "Pricing": "Preços", "Roles": "Funções", "Security": "Segurança", "Login": "Entrar", "Get Started": "Começar",
  "Request a Demo": "Pedir uma demo", "Complete School Management System": "O sistema completo de gestão escolar",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "Gira estudantes, professores, presenças, notas, propinas, comunicação e todas as operações da escola numa única plataforma poderosa.",
  "Trusted by forward-thinking schools": "A confiança das escolas mais inovadoras",
  "Everything a school runs on": "Tudo o que uma escola precisa", "One platform. Every operation.": "Uma plataforma. Todas as operações.",
  "Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.": "Doze módulos ligados substituem as folhas de cálculo, os registos em papel e os grupos de WhatsApp com que a sua escola vive hoje.",
  "Student Management": "Gestão de estudantes", "Teacher Management": "Gestão de professores", "Attendance & Alerts": "Presenças e alertas", "Grades & Report Cards": "Notas e boletins",
  "Classes & Timetable": "Turmas e horário", "Fees & Payments": "Propinas e pagamentos", "Parent Communication": "Comunicação com encarregados",
  "Documents & Certificates": "Documentos e certificados", "Analytics & Insights": "Análise e indicadores", "Multi-campus Groups": "Grupos multi-campus", "Secure by Design": "Segurança integrada",
  "Students managed": "Estudantes geridos", "Teachers onboard": "Professores a bordo", "Fees collected (demo)": "Propinas cobradas (demo)", "Classes & sections": "Turmas e secções",
  "14-day free trial": "Teste grátis de 14 dias", "No card required": "Sem cartão", "Multi-campus ready": "Pronto para multi-campus", "Get Started free": "Começar grátis",
  "Role-based access": "Acesso por função", "A portal for every person in your school": "Um portal para cada pessoa da sua escola",
  "Twelve roles, each with its own dashboard and granular permissions. Teachers see only their classes, parents only their children, accountants only finance.": "Doze funções, cada uma com o seu painel e permissões detalhadas. Os professores veem só as suas turmas, os encarregados só os seus educandos, os contabilistas só as finanças.",
  "Explore role permissions": "Explorar permissões",
  "Plans that scale with your school": "Planos que crescem com a sua escola",
  "Prices, limits and features are fully editable by the platform owner — in any currency.": "Preços, limites e funcionalidades são totalmente editáveis pelo proprietário — em qualquer moeda.",
  "Show prices in": "Mostrar preços em", "converted automatically": "conversão automática", "unlimited teachers": "professores ilimitados", "Up to": "Até", "teachers": "professores",
  "Start free trial": "Teste grátis", "Start 14-day trial": "Teste de 14 dias", "Contact sales": "Contactar vendas", "per month": "/mês",
  "Most popular": "O mais popular", "Unlimited students": "Estudantes ilimitados",
  "Security first": "Segurança primeiro", "Built to protect your school's data": "Concebido para proteger os dados da sua escola",
  "Hashed passwords & 2FA": "Palavras-passe cifradas e 2FA", "Granular RBAC permissions": "Permissões RBAC detalhadas", "Full audit trail with IP & device": "Auditoria completa com IP e dispositivo",
  "Automatic nightly backups": "Cópias noturnas automáticas", "Rate limiting & account lockout": "Limite de tentativas e bloqueio de conta", "White-label & multi-tenant": "Marca branca e multi-escola",
  "Ready to run your school on VITECH?": "Pronto para gerir a sua escola com o VITECH?",
  "Deploy in minutes. Import your students from Excel. Go paperless this term.": "Implemente em minutos. Importe os seus estudantes do Excel. Abandone o papel neste período.",
  "Create your school": "Crie a sua escola", "Verify a certificate": "Verificar um certificado", "white-label ready": "pronto para marca branca",
  "Verify certificate": "Verificar certificado", "Product": "Produto", "Platform": "Plataforma",
  /* auth */
  "Sign in": "Iniciar sessão", "Email": "E-mail", "Password": "Palavra-passe", "Sign in to your account": "Aceda à sua conta",
  "Forgot password?": "Esqueceu a palavra-passe?", "Don't have an account?": "Não tem conta?", "Create one": "Criar uma",
  "Demo accounts — password": "Contas demo — palavra-passe", "Two-factor authentication": "Autenticação de dois fatores",
  "Verify & continue": "Verificar e continuar", "School information": "Dados da escola",
  "Academic year": "Ano letivo", "Finish": "Concluir", "Back": "Voltar", "Next": "Seguinte", "Continue": "Continuar",
  "School name": "Nome da escola", "Admin name": "Nome do administrador", "Admin email": "E-mail do administrador", "Country": "País",
  "Currency": "Moeda", "Phone": "Telefone", "Launch my school": "Lançar a minha escola", "Reset password": "Repor palavra-passe",
  "Send reset link": "Enviar ligação", "New password": "Nova palavra-passe", "Confirm password": "Confirmar palavra-passe",
  "Remember me": "Lembrar-me", "Levels": "Níveis", "Select the levels your school offers.": "Selecione os níveis que a sua escola oferece.",
  "Sign in to your school": "Aceda à sua escola", "Secure access with role-based permissions.": "Acesso seguro com permissões por função.",
  "Email address": "Endereço de e-mail", "Verifying…": "A verificar…", "6-digit code": "Código de 6 dígitos",
  "Account locked — try again in 30 seconds.": "Conta bloqueada — tente novamente em 30 segundos.",
  "Free 14-day trial · no card required": "Teste de 14 dias · sem cartão",
  "Admin full name": "Nome completo do administrador", "Auto-detected:": "Detetado automaticamente:",
  "Which levels does your school run?": "Que níveis a sua escola leciona?",
  "Set a new password": "Definir nova palavra-passe", "Reset your password": "Repor a sua palavra-passe",
  "Enter your new password below.": "Escreva a sua nova palavra-passe abaixo.", "We'll email you a secure reset link.": "Enviaremos uma ligação segura de reposição.",
  "Check your inbox": "Verifique a sua caixa de entrada", "Open reset link (demo)": "Abrir ligação (demo)", "Back to login": "Voltar à entrada",
  "Back to site": "Voltar ao site", "Update password": "Atualizar palavra-passe",
  "Passwords are hashed with bcrypt — never stored in plain text.": "As palavras-passe são cifradas com bcrypt — nunca guardadas em texto simples.",
  /* common */
  "Save changes": "Guardar alterações", "Save": "Guardar", "Cancel": "Cancelar", "Add": "Adicionar", "Edit": "Editar", "Delete": "Eliminar",
  "Print": "Imprimir", "Export": "Exportar", "Import": "Importar", "Download": "Transferir", "Search": "Pesquisar", "View": "Ver",
  "Close": "Fechar", "Change": "Alterar", "Today": "Hoje", "Status": "Estado", "Actions": "Ações", "Name": "Nome", "Class": "Turma",
  "Active": "Ativo", "Inactive": "Inativo", "Pending": "Pendente", "Approved": "Aprovado", "Rejected": "Rejeitado", "Paid": "Pago",
  "Overdue": "Em atraso", "Scheduled": "Agendado", "Completed": "Concluído", "Valid": "Válido", "New student": "Novo estudante",
  "Showing": "A mostrar", "of": "de", "Welcome back": "Bem-vindo de volta",
};

const ar: Dict = {
  /* navigation */
  "Overview": "نظرة عامة", "People": "الأشخاص", "Academics": "الشؤون الأكاديمية", "Finance": "المالية", "Engagement": "التواصل", "Management": "الإدارة", "Operations": "العمليات",
  "Dashboard": "لوحة التحكم", "Students": "الطلاب", "Admissions": "القبول", "Teachers": "المعلمون", "HR & Staff": "الموارد البشرية", "Classes": "الفصول", "Subjects": "المواد",
  "Timetable": "الجدول الدراسي", "Attendance": "الحضور", "Exams": "الامتحانات", "Grades": "الدرجات", "Report cards": "الشهادات الدراسية", "Fees & Structures": "الرسوم والهياكل", "Payments": "المدفوعات",
  "Invoices": "الفواتير", "Expenses": "المصروفات", "Financial Reports": "التقارير المالية", "Communication": "التواصل", "Announcements": "الإعلانات", "Calendar": "التقويم",
  "Library": "المكتبة", "Transport": "النقل", "Documents": "المستندات", "Certificates": "الشهادات", "ID cards": "البطاقات", "Audit logs": "سجلات التدقيق",
  "Backups": "النسخ الاحتياطي", "Analytics": "التحليلات", "Settings": "الإعدادات", "Platform (SaaS)": "المنصة (SaaS)", "My Portal": "بوابتي", "Reports": "التقارير",
  "Search anything…": "ابحث عن الطلاب والمدفوعات والإيصالات…", "Notifications": "الإشعارات", "Sign out": "تسجيل الخروج", "Mark all read": "تحديد الكل كمقروء", "Language": "اللغة",
  /* dashboard */
  "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Here's what's happening at": "إليك ما يحدث في", "today": "اليوم",
  "New admission": "قبول جديد", "Record payment": "تسجيل دفعة", "Total students": "إجمالي الطلاب", "active": "نشط", "on duty": "في الخدمة",
  "Attendance today": "حضور اليوم", "absent": "غائبون", "late": "متأخرون", "subjects": "مواد", "Payments today": "مدفوعات اليوم",
  "Monthly revenue": "الإيرادات الشهرية", "Pending fees": "رسوم مستحقة", "unpaid students": "طلاب لم يسددوا", "Net position": "الصافي",
  "Revenue vs Expenses": "الإيرادات مقابل المصروفات", "Last 8 months": "آخر 8 أشهر", "margin": "هامش", "Student enrollment": "تسجيل الطلاب",
  "Fee collection": "تحصيل الرسوم", "Report": "تقرير", "of annual fees collected": "من الرسوم السنوية المحصّلة", "still outstanding across": "مستحقة لدى",
  "students": "طالب", "Upcoming events": "الأحداث القادمة", "Recent payments": "أحدث المدفوعات", "View all": "عرض الكل", "Receipt": "إيصال",
  "Student": "الطالب", "Method": "الطريقة", "Date": "التاريخ", "Amount": "المبلغ", "Recent registrations": "أحدث التسجيلات", "All": "الكل",
  "admitted": "مقبول", "Recent activity": "النشاط الأخير", "New admissions (30d)": "القبول (30 يوم)", "Upcoming exams": "الامتحانات القادمة",
  "Library loans active": "إعارات نشطة", "Absent alerts sent": "تنبيهات غياب مرسلة", "present": "حاضرون",
  "Present": "حاضر", "Late": "متأخر", "Absent": "غائب", "Excused": "بعذر",
  /* page titles */
  "Students & registration": "الطلاب والتسجيل", "Admissions pipeline": "مسار القبول", "Teachers & staff": "المعلمون والموظفون",
  "Classes & Sections": "الفصول والشعب", "Grade entry": "إدخال الدرجات", "Communication Center": "مركز التواصل",
  "School calendar": "تقويم المدرسة", "School transport": "النقل المدرسي", "Backups & restore": "النسخ الاحتياطي والاستعادة",
  "Platform control": "التحكم بالمنصة", "Student portal": "بوابة الطالب", "Parent portal": "بوابة ولي الأمر", "Teacher portal": "بوابة المعلم",
  /* landing */
  "Features": "المميزات", "Pricing": "الأسعار", "Roles": "الأدوار", "Security": "الأمان", "Login": "دخول", "Get Started": "ابدأ الآن",
  "Request a Demo": "اطلب عرضاً تجريبياً", "Complete School Management System": "نظام متكامل لإدارة المدارس",
  "Manage students, teachers, attendance, grades, fees, communication and school operations from one powerful platform.": "أدر الطلاب والمعلمين والحضور والدرجات والرسوم والتواصل وجميع عمليات المدرسة من منصة واحدة قوية.",
  "Trusted by forward-thinking schools": "ثقة المدارس الرائدة",
  "Everything a school runs on": "كل ما تحتاجه المدرسة", "One platform. Every operation.": "منصة واحدة. كل العمليات.",
  "Twelve connected modules replace the spreadsheets, paper registers and WhatsApp groups your school survives on today.": "اثنتا عشرة وحدة مترابطة تحل محل الجداول الإلكترونية والسجلات الورقية ومجموعات واتساب التي تعتمد عليها مدرستك اليوم.",
  "Student Management": "إدارة الطلاب", "Teacher Management": "إدارة المعلمين", "Attendance & Alerts": "الحضور والتنبيهات", "Grades & Report Cards": "الدرجات والشهادات",
  "Classes & Timetable": "الفصول والجداول", "Fees & Payments": "الرسوم والمدفوعات", "Parent Communication": "التواصل مع أولياء الأمور",
  "Documents & Certificates": "المستندات والشهادات", "Analytics & Insights": "التحليلات والمؤشرات", "Multi-campus Groups": "مجموعات متعددة الفروع", "Secure by Design": "أمان مدمج",
  "Students managed": "طلاب تتم إدارتهم", "Teachers onboard": "معلمون على المنصة", "Fees collected (demo)": "رسوم محصّلة (تجريبي)", "Classes & sections": "فصول وشعب",
  "14-day free trial": "تجربة مجانية 14 يوماً", "No card required": "دون بطاقة", "Multi-campus ready": "جاهز للفروع المتعددة", "Get Started free": "ابدأ مجاناً",
  "Role-based access": "وصول حسب الدور", "A portal for every person in your school": "بوابة لكل شخص في مدرستك",
  "Twelve roles, each with its own dashboard and granular permissions. Teachers see only their classes, parents only their children, accountants only finance.": "اثنا عشر دوراً، لكلٍ لوحته وصلاحياته الدقيقة. يرى المعلمون فصولهم فقط، وأولياء الأمور أبناءهم فقط، والمحاسبون المالية فقط.",
  "Explore role permissions": "استكشف الصلاحيات",
  "Plans that scale with your school": "باقات تنمو مع مدرستك",
  "Prices, limits and features are fully editable by the platform owner — in any currency.": "الأسعار والحدود والمميزات قابلة للتعديل كلياً من مالك المنصة — بأي عملة.",
  "Show prices in": "اعرض الأسعار بعملة", "converted automatically": "تحويل تلقائي", "unlimited teachers": "معلمون بلا حدود", "Up to": "حتى", "teachers": "معلم",
  "Start free trial": "تجربة مجانية", "Start 14-day trial": "تجربة 14 يوماً", "Contact sales": "تواصل مع المبيعات", "per month": "/شهرياً",
  "Most popular": "الأكثر شيوعاً", "Unlimited students": "طلاب بلا حدود",
  "Security first": "الأمان أولاً", "Built to protect your school's data": "صُمم لحماية بيانات مدرستك",
  "Hashed passwords & 2FA": "كلمات مرور مشفّرة وتحقق ثنائي", "Granular RBAC permissions": "صلاحيات RBAC دقيقة", "Full audit trail with IP & device": "تدقيق كامل مع IP والجهاز",
  "Automatic nightly backups": "نسخ احتياطي ليلي تلقائي", "Rate limiting & account lockout": "حد للمحاولات وقفل الحساب", "White-label & multi-tenant": "علامة بيضاء وتعدد المدارس",
  "Ready to run your school on VITECH?": "جاهز لإدارة مدرستك مع VITECH؟",
  "Deploy in minutes. Import your students from Excel. Go paperless this term.": "انشر في دقائق. استورد طلابك من Excel. تخلّص من الورق هذا الفصل.",
  "Create your school": "أنشئ مدرستك", "Verify a certificate": "تحقق من شهادة", "white-label ready": "جاهز للعلامة البيضاء",
  "Verify certificate": "التحقق من الشهادة", "Product": "المنتج", "Platform": "المنصة",
  /* auth */
  "Sign in": "تسجيل الدخول", "Email": "البريد الإلكتروني", "Password": "كلمة المرور", "Sign in to your account": "ادخل إلى حسابك",
  "Forgot password?": "نسيت كلمة المرور؟", "Don't have an account?": "ليس لديك حساب؟", "Create one": "أنشئ حساباً",
  "Demo accounts — password": "حسابات تجريبية — كلمة المرور", "Two-factor authentication": "التحقق بخطوتين",
  "Verify & continue": "تحقق وتابع", "School information": "بيانات المدرسة",
  "Academic year": "العام الدراسي", "Finish": "إنهاء", "Back": "رجوع", "Next": "التالي", "Continue": "متابعة",
  "School name": "اسم المدرسة", "Admin name": "اسم المدير", "Admin email": "بريد المدير", "Country": "الدولة",
  "Currency": "العملة", "Phone": "الهاتف", "Launch my school": "أطلق مدرستي", "Reset password": "إعادة تعيين كلمة المرور",
  "Send reset link": "إرسال الرابط", "New password": "كلمة مرور جديدة", "Confirm password": "تأكيد كلمة المرور",
  "Remember me": "تذكرني", "Levels": "المستويات", "Select the levels your school offers.": "اختر المستويات التي تقدمها مدرستك.",
  "Sign in to your school": "ادخل إلى مدرستك", "Secure access with role-based permissions.": "وصول آمن بصلاحيات حسب الدور.",
  "Email address": "عنوان البريد الإلكتروني", "Verifying…": "جارٍ التحقق…", "6-digit code": "رمز من 6 أرقام",
  "Account locked — try again in 30 seconds.": "تم قفل الحساب — حاول بعد 30 ثانية.",
  "Free 14-day trial · no card required": "تجربة 14 يوماً · دون بطاقة",
  "Admin full name": "الاسم الكامل للمدير", "Auto-detected:": "تم الاكتشاف تلقائياً:",
  "Which levels does your school run?": "ما المستويات التي تقدمها مدرستك؟",
  "Set a new password": "عيّن كلمة مرور جديدة", "Reset your password": "أعد تعيين كلمة المرور",
  "Enter your new password below.": "أدخل كلمة المرور الجديدة أدناه.", "We'll email you a secure reset link.": "سنرسل لك رابط إعادة تعيين آمناً.",
  "Check your inbox": "تحقق من بريدك", "Open reset link (demo)": "فتح الرابط (تجريبي)", "Back to login": "العودة لتسجيل الدخول",
  "Back to site": "العودة للموقع", "Update password": "تحديث كلمة المرور",
  "Passwords are hashed with bcrypt — never stored in plain text.": "كلمات المرور مشفّرة عبر bcrypt — لا تُخزَّن نصاً أبداً.",
  /* common */
  "Save changes": "حفظ التغييرات", "Save": "حفظ", "Cancel": "إلغاء", "Add": "إضافة", "Edit": "تعديل", "Delete": "حذف",
  "Print": "طباعة", "Export": "تصدير", "Import": "استيراد", "Download": "تنزيل", "Search": "بحث", "View": "عرض",
  "Close": "إغلاق", "Change": "تغيير", "Today": "اليوم", "Status": "الحالة", "Actions": "إجراءات", "Name": "الاسم", "Class": "الفصل",
  "Active": "نشط", "Inactive": "غير نشط", "Pending": "قيد الانتظار", "Approved": "معتمد", "Rejected": "مرفوض", "Paid": "مدفوع",
  "Overdue": "متأخر", "Scheduled": "مجدول", "Completed": "مكتمل", "Valid": "ساري", "New student": "طالب جديد",
  "Showing": "عرض", "of": "من", "Welcome back": "مرحباً بعودتك",
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

/** Translate a source string; unknown keys fall back to English. */
export const t = (lang: Lang, key: string) => dicts[normalize(lang)]?.[key] ?? key;

/**
 * Bound translator for components.
 * Resolution order: curated dictionary → AI machine-translation cache → English source.
 * Missing strings are queued for AI translation and the component re-renders
 * automatically once the translation arrives (and is cached for next time).
 */
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
