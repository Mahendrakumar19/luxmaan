"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "de" | "fr" | "es" | "nl";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; nativeName: string }[] = [
  { code: "en", label: "EN", nativeName: "English" },
  { code: "de", label: "DE", nativeName: "Deutsch" },
  { code: "fr", label: "FR", nativeName: "Français" },
  { code: "es", label: "ES", nativeName: "Español" },
  { code: "nl", label: "NL", nativeName: "Nederlands" },
];

type TranslationKeys = {
  // Navbar
  nav_subtitle: string;
  nav_search_jobs: string;
  nav_job_matcher: string;
  nav_how_it_works: string;
  nav_employers: string;
  nav_jobs: string;
  nav_my_matches: string;
  nav_tracker: string;
  nav_my_cv: string;
  nav_sign_in: string;
  nav_register: string;
  nav_candidate_hub: string;
  nav_admin_console: string;
  nav_live_jobs: string;

  // Hero & Home
  hero_badge: string;
  hero_subbadge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_what_label: string;
  hero_what_placeholder: string;
  hero_where_label: string;
  hero_where_placeholder: string;
  hero_search_btn: string;
  hero_trending: string;
  stat_active_jobs: string;
  stat_employers: string;
  stat_salary_trans: string;
  stat_gdpr: string;
  home_top_employers: string;
  home_top_employers_sub: string;
  home_view_all_employers: string;
  home_categories: string;
  home_categories_sub: string;
  home_recent_jobs: string;
  home_recent_jobs_sub: string;
  home_browse_all: string;
  home_details_apply: string;
  home_how_title: string;
  home_how_sub: string;
  home_step1_title: string;
  home_step1_desc: string;
  home_step2_title: string;
  home_step2_desc: string;
  home_step3_title: string;
  home_step3_desc: string;
  home_emp_badge: string;
  home_emp_title: string;
  home_emp_desc: string;
  home_create_profile: string;
  home_for_companies: string;

  // Jobs Page
  jobs_title: string;
  jobs_subtitle: string;
  jobs_sync_btn: string;
  jobs_syncing: string;
  jobs_search_btn: string;
  jobs_sector: string;
  jobs_exp_level: string;
  jobs_min_salary: string;
  jobs_workplace: string;
  jobs_showing: string;
  jobs_verified_pos: string;
  jobs_track: string;
  jobs_tracked: string;
  jobs_tailored_btn: string;
  jobs_apply: string;

  // Dashboard
  dash_welcome: string;
  dash_subtitle: string;
  dash_manage_cv: string;
  dash_edit_profile: string;
  dash_credibility_title: string;
  dash_credibility_sub: string;
  dash_overall_index: string;
  dash_top_matches: string;
  dash_snapshot: string;
  dash_completeness: string;

  // Profile
  prof_title: string;
  prof_subtitle: string;
  prof_save: string;
  prof_saved: string;
  prof_overview: string;
  prof_work_exp: string;
  prof_edu: string;
  prof_certs: string;
  prof_loc_comp: string;
  prof_software: string;

  // Matches
  matches_badge: string;
  matches_title: string;
  matches_sub: string;
  matches_compat: string;
  matches_apply: string;

  // Tracker
  tracker_title: string;
  tracker_sub: string;
  tracker_add_btn: string;

  // Resumes
  resumes_title: string;
  resumes_sub: string;
  resumes_upload_prompt: string;
  resumes_browse: string;

  // Settings / GDPR
  settings_title: string;
  settings_sub: string;

  // Auth
  login_title: string;
  login_sub: string;
  login_email: string;
  login_password: string;
  login_btn: string;
  register_title: string;
  register_sub: string;

  // Marketing / Static
  features_title: string;
  features_sub: string;
  pricing_title: string;
  pricing_sub: string;
  contact_title: string;
  contact_sub: string;

  // Admin
  admin_title: string;
  admin_sub: string;

  // Footer
  footer_desc: string;
  footer_gdpr: string;
  footer_jobs_heading: string;
  footer_services_heading: string;
  footer_company_heading: string;
};

const TRANSLATIONS: Record<LanguageCode, TranslationKeys> = {
  en: {
    nav_subtitle: "European Career & Job Portal",
    nav_search_jobs: "Search Jobs",
    nav_job_matcher: "Job Matcher",
    nav_how_it_works: "How It Works",
    nav_employers: "Employers",
    nav_jobs: "Jobs",
    nav_my_matches: "My Matches",
    nav_tracker: "Tracker",
    nav_my_cv: "My CV",
    nav_sign_in: "Sign In",
    nav_register: "Post CV / Register",
    nav_candidate_hub: "Candidate Hub",
    nav_admin_console: "Admin Console",
    nav_live_jobs: "Live Jobs",

    hero_badge: "Official Career Portal for Germany & the European Union",
    hero_subbadge: "15,000+ verified vacancies from leading European companies",
    hero_title: "Find Your Next Verified Career Move in Europe.",
    hero_subtitle: "Direct access to verified openings at leading employers like Lufthansa, Airbus, Siemens, and SAP. Upload your CV for instant structured matching, credibility scoring, and tailored cover letters.",
    hero_what_label: "What are you looking for?",
    hero_what_placeholder: "Job title, sector, or skill (e.g. Java, DevOps, PM)...",
    hero_where_label: "Where?",
    hero_where_placeholder: "City, region, or 'Remote' (e.g. Berlin, Munich)...",
    hero_search_btn: "Find Jobs",
    hero_trending: "Popular searches:",
    stat_active_jobs: "Active Job Openings",
    stat_employers: "Verified Employers",
    stat_salary_trans: "Salary Transparency",
    stat_gdpr: "GDPR & EU Hosting",
    home_top_employers: "Top Employers in Germany & Europe",
    home_top_employers_sub: "Direct vacancies from official career portals and ATS feeds",
    home_view_all_employers: "View all 1,200+ employers",
    home_categories: "Popular Job Sectors",
    home_categories_sub: "Explore verified opportunities by industry and specialization",
    home_recent_jobs: "Latest Verified Openings in Europe",
    home_recent_jobs_sub: "Verified positions with salary transparency and structured requirements",
    home_browse_all: "Browse all job openings",
    home_details_apply: "Details & Apply",
    home_how_title: "3 Steps to Your Next European Role",
    home_how_sub: "Structured CV matching without application friction — transparent and GDPR compliant",
    home_step1_title: "Upload & Structure Your CV",
    home_step1_desc: "Upload PDF or DOCX. Our parser maps your work history, company types, software tools, certifications, and latest-to-oldest education into our clean template.",
    home_step2_title: "Credibility Score & Matching",
    home_step2_desc: "Transparent scoring across target job roles based on career preferences, location, past roles, certifications, and sector skills.",
    home_step3_title: "Tailored Docs & History Tracker",
    home_step3_desc: "Generate & download job-specific tailored CV versions and Cover Letters, save vacancies, and track every stage on your Kanban board.",
    home_emp_badge: "For Employers & HR Teams",
    home_emp_title: "Publish Vacancies & Reach Qualified Talent Across Europe",
    home_emp_desc: "Connect your ATS or automated feed to reach verified candidates across Germany, Austria, Switzerland, and the EU.",
    home_create_profile: "Create Candidate Profile",
    home_for_companies: "For Companies",

    jobs_title: "Explore Jobs in Germany & EU",
    jobs_subtitle: "Optimised multi-platform job search with sector, software, and salary filters — plus 1-click tailored CV & Cover Letter generation.",
    jobs_sync_btn: "Sync Live EU Sources",
    jobs_syncing: "Syncing Trusted Sources...",
    jobs_search_btn: "Search & Filter",
    jobs_sector: "Sector",
    jobs_exp_level: "Experience Level",
    jobs_min_salary: "Min Salary (EUR)",
    jobs_workplace: "Workplace",
    jobs_showing: "Showing",
    jobs_verified_pos: "verified positions",
    jobs_track: "Track",
    jobs_tracked: "Tracked",
    jobs_tailored_btn: "Tailored CV & Cover",
    jobs_apply: "Apply",

    dash_welcome: "Welcome back",
    dash_subtitle: "Your structured profile is active and scanning verified vacancies across Germany and the European Union.",
    dash_manage_cv: "Manage Resumes",
    dash_edit_profile: "Edit Profile",
    dash_credibility_title: "Role Credibility Score",
    dash_credibility_sub: "Calculated from career preferences, European location, past roles, skills & certifications",
    dash_overall_index: "Overall Index",
    dash_top_matches: "Top Role Matches",
    dash_snapshot: "Profile Snapshot",
    dash_completeness: "Completeness",

    prof_title: "Structured Candidate Profile",
    prof_subtitle: "Standardized European profile template for accurate job matching, credibility scoring, and tailored CV generation.",
    prof_save: "Save Template",
    prof_saved: "Saved!",
    prof_overview: "Career Overview & Sector Preferences",
    prof_work_exp: "Work Experience (Structured Template)",
    prof_edu: "Education (Latest to Oldest)",
    prof_certs: "Certifications & Recognised Affiliations",
    prof_loc_comp: "Location, Languages & Compensation",
    prof_software: "Specified Software for Job Roles",

    matches_badge: "Verified Profile Matching • Transparent Criteria",
    matches_title: "Personalized Job Matches",
    matches_sub: "Ranked by hard skills, work experience, salary range, and language proficiency.",
    matches_compat: "Compatibility",
    matches_apply: "Apply Now",

    tracker_title: "Application Tracker",
    tracker_sub: "Track every stage of your European job applications on one Kanban board.",
    tracker_add_btn: "Track New Application",

    resumes_title: "Resume & CV Manager",
    resumes_sub: "Upload your resume in PDF or DOCX format to extract your structured European profile.",
    resumes_upload_prompt: "Upload your resume (PDF or DOCX)",
    resumes_browse: "Browse Computer",

    settings_title: "Privacy & GDPR Settings",
    settings_sub: "Manage your European data sovereignty, consent logs, Article 20 export, and Article 17 erasure.",

    login_title: "Sign In to Luxmaan Jobs",
    login_sub: "Access your structured candidate profile, credibility score, and job tracker.",
    login_email: "Email Address",
    login_password: "Password",
    login_btn: "Sign In",
    register_title: "Create Your Candidate Account",
    register_sub: "Upload your CV once and review your structured European profile in seconds.",

    features_title: "Engineered for European Labor Markets",
    features_sub: "Built for multi-sector recruitment, structured CV parsing, and strict EU GDPR compliance.",
    pricing_title: "Transparent, Fair Pricing",
    pricing_sub: "100% free for job seekers. Automated real-time feeds for organizations.",
    contact_title: "Contact & Legal Notice",
    contact_sub: "For technical inquiries, source partnerships, or data protection officer inquiries.",

    admin_title: "Platform Operations & Monitoring",
    admin_sub: "Real-time KPIs, 2.5h TTL feed status, and configurable matching parameters.",

    footer_desc: "Official Career & Job Aggregator for Germany and the European Union. Verified vacancies, transparent salary ranges, and structured CV matching.",
    footer_gdpr: "GDPR / DSGVO Compliant • EU Data Center",
    footer_jobs_heading: "Job Categories",
    footer_services_heading: "Candidate Services",
    footer_company_heading: "Company & Legal",
  },
  de: {
    nav_subtitle: "Europäisches Karriere- & Jobportal",
    nav_search_jobs: "Jobs suchen",
    nav_job_matcher: "Job-Matcher",
    nav_how_it_works: "So funktioniert's",
    nav_employers: "Arbeitgeber",
    nav_jobs: "Stellen",
    nav_my_matches: "Meine Matches",
    nav_tracker: "Tracker",
    nav_my_cv: "Lebenslauf",
    nav_sign_in: "Anmelden",
    nav_register: "CV hochladen / Registrieren",
    nav_candidate_hub: "Kandidaten-Hub",
    nav_admin_console: "Admin-Konsole",
    nav_live_jobs: "Live-Stellen",

    hero_badge: "Offizielles Karriereportal für Deutschland & die Europäische Union",
    hero_subbadge: "15.000+ verifizierte Stellenanzeigen führender Unternehmen",
    hero_title: "Finde Deinen nächsten Karriereschritt in Europa.",
    hero_subtitle: "Direkter Zugang zu geprüften Stellenangeboten bei Top-Arbeitgebern wie Lufthansa, Airbus, Siemens und SAP. Lade Deinen Lebenslauf hoch für strukturiertes Matching, Credibility-Score und maßgeschneiderte Anschreiben.",
    hero_what_label: "Was suchen Sie?",
    hero_what_placeholder: "Jobtitel, Branche oder Skill (z.B. Java, DevOps, PM)...",
    hero_where_label: "Wo?",
    hero_where_placeholder: "Stadt, Bundesland oder 'Remote' (z.B. Berlin, München)...",
    hero_search_btn: "Jobs finden",
    hero_trending: "Beliebte Suchen:",
    stat_active_jobs: "Aktive Stellenanzeigen",
    stat_employers: "Geprüfte Arbeitgeber",
    stat_salary_trans: "Mit Gehaltstransparenz",
    stat_gdpr: "DSGVO & EU-Server",
    home_top_employers: "Top-Arbeitgeber in Deutschland & Europa",
    home_top_employers_sub: "Direkte Vakanzen aus offiziellen Karriereportalen und ATS-Schnittstellen",
    home_view_all_employers: "Alle 1.200+ Arbeitgeber ansehen",
    home_categories: "Beliebte Berufsfelder",
    home_categories_sub: "Entdecke Stellenangebote nach Branche und Spezialisierung",
    home_recent_jobs: "Aktuelle Stellenangebote in Europa",
    home_recent_jobs_sub: "Verifizierte Vakanzen mit Gehaltsangaben und Anforderungsprofilen",
    home_browse_all: "Alle Stellenangebote durchsuchen",
    home_details_apply: "Details & Bewerben",
    home_how_title: "In 3 Schritten zum passenden Jobangebot",
    home_how_sub: "Strukturierter Lebenslauf-Abgleich ohne Bewerbungsfrust – transparent und DSGVO-konform",
    home_step1_title: "Lebenslauf strukturiert hochladen",
    home_step1_desc: "PDF oder DOCX hochladen. Unser Parser überträgt Berufserfahrung, Unternehmenstyp, Software-Tools, Zertifikate und Ausbildung (neueste zuerst) in unser Template.",
    home_step2_title: "Credibility-Score & Matching",
    home_step2_desc: "Transparenter Score pro Jobrolle basierend auf Karrierepräferenzen, Standort, bisherigen Rollen, Zertifikaten und Branchen-Skills.",
    home_step3_title: "Maßgeschneiderte Dokumente & Tracker",
    home_step3_desc: "Generiere und lade passende CV-Versionen und Anschreiben pro Stelle herunter und verwalte deine Bewerbungen im Kanban-Board.",
    home_emp_badge: "Für Arbeitgeber & HR-Teams",
    home_emp_title: "Stellenanzeigen schalten & Talente in Europa finden",
    home_emp_desc: "Verbinden Sie Ihr ATS, um qualifizierte Fachkräfte in Deutschland, Österreich, der Schweiz und der EU direkt zu erreichen.",
    home_create_profile: "Kandidatenprofil anlegen",
    home_for_companies: "Für Unternehmen",

    jobs_title: "Jobs in Deutschland & Europa entdecken",
    jobs_subtitle: "Optimierte Jobsuche nach Branche, Software, Gehalt & Erfahrung — inklusive 1-Klick-Erstellung von maßgeschneidertem CV & Anschreiben.",
    jobs_sync_btn: "Live-Quellen synchronisieren",
    jobs_syncing: "Synchronisiere Quellen...",
    jobs_search_btn: "Suchen & Filtern",
    jobs_sector: "Branche / Sektor",
    jobs_exp_level: "Erfahrungslevel",
    jobs_min_salary: "Mindestgehalt (EUR)",
    jobs_workplace: "Arbeitsmodell",
    jobs_showing: "Zeige",
    jobs_verified_pos: "verifizierte Stellen",
    jobs_track: "Tracken",
    jobs_tracked: "Getrackt",
    jobs_tailored_btn: "CV & Anschreiben",
    jobs_apply: "Bewerben",

    dash_welcome: "Willkommen zurück",
    dash_subtitle: "Dein strukturiertes Profil ist aktiv und durchsucht verifizierte Vakanzen in Deutschland und der EU.",
    dash_manage_cv: "Lebensläufe verwalten",
    dash_edit_profile: "Profil bearbeiten",
    dash_credibility_title: "Rollen-Credibility-Score",
    dash_credibility_sub: "Berechnet aus Karrierepräferenzen, Standort, bisherigen Rollen, Skills & Zertifikaten",
    dash_overall_index: "Gesamt-Index",
    dash_top_matches: "Top Job-Empfehlungen",
    dash_snapshot: "Profil-Übersicht",
    dash_completeness: "Vollständigkeit",

    prof_title: "Strukturiertes Kandidatenprofil",
    prof_subtitle: "Standardisiertes europäisches Profil-Template für präzises Matching, Credibility-Score und maßgeschneiderte Bewerbungen.",
    prof_save: "Template speichern",
    prof_saved: "Gespeichert!",
    prof_overview: "Karriereübersicht & Branchenpräferenzen",
    prof_work_exp: "Berufserfahrung (Strukturiertes Template)",
    prof_edu: "Ausbildung (Neueste zuerst)",
    prof_certs: "Zertifikate & Anerkannte Verbände",
    prof_loc_comp: "Standort, Sprachen & Gehalt",
    prof_software: "Spezifizierte Software-Kenntnisse",

    matches_badge: "Verifizierter Profilabgleich • Transparente Kriterien",
    matches_title: "Passgenaue Stellenangebote",
    matches_sub: "Berechnet nach Hard Skills, Berufserfahrung, Gehaltsrahmen und Sprachprofil.",
    matches_compat: "Übereinstimmung",
    matches_apply: "Jetzt bewerben",

    tracker_title: "Bewerbungs-Tracker",
    tracker_sub: "Verwalte jede Phase deiner Bewerbungen übersichtlich im Kanban-Board.",
    tracker_add_btn: "Neue Bewerbung tracken",

    resumes_title: "Lebenslauf-Manager",
    resumes_sub: "Lade deinen Lebenslauf als PDF oder DOCX hoch für die strukturierte Profilerstellung.",
    resumes_upload_prompt: "Lebenslauf hochladen (PDF oder DOCX)",
    resumes_browse: "Datei auswählen",

    settings_title: "Datenschutz & DSGVO-Einstellungen",
    settings_sub: "Verwalte Einwilligungen, Datenexport (Art. 20 DSGVO) und Kontolöschung (Art. 17 DSGVO).",

    login_title: "Bei Luxmaan Jobs anmelden",
    login_sub: "Zugriff auf dein strukturiertes Profil, Credibility-Score und Bewerbungs-Tracker.",
    login_email: "E-Mail-Adresse",
    login_password: "Passwort",
    login_btn: "Anmelden",
    register_title: "Kandidatenkonto erstellen",
    register_sub: "Lebenslauf einmal hochladen und strukturiertes Profil direkt prüfen.",

    features_title: "Entwickelt für den europäischen Arbeitsmarkt",
    features_sub: "Multi-Branchen-Suche, strukturiertes CV-Parsing und strenge DSGVO-Konformität.",
    pricing_title: "Transparente & faire Preise",
    pricing_sub: "Für Bewerber 100% kostenlos. Automatisierte Echtzeit-Feeds für Unternehmen.",
    contact_title: "Kontakt & Impressum",
    contact_sub: "Für technische Anfragen, Partnerschaften oder den Datenschutzbeauftragten.",

    admin_title: "Plattform-Betrieb & Monitoring",
    admin_sub: "Echtzeit-KPIs, 2,5h-TTL-Feed-Status und konfigurierbare Matching-Gewichtungen.",

    footer_desc: "Offizielles Stellenportal & Karriere-Aggregator für Deutschland und die Europäische Union. Verifizierte Vakanzen und strukturiertes CV-Matching.",
    footer_gdpr: "DSGVO / GDPR Konformität • EU-Rechenzentrum",
    footer_jobs_heading: "Stellenangebote",
    footer_services_heading: "Bewerber-Service",
    footer_company_heading: "Unternehmen & Rechtliches",
  },
  fr: {
    nav_subtitle: "Portail Européen Carrière & Emploi",
    nav_search_jobs: "Rechercher",
    nav_job_matcher: "Matching CV",
    nav_how_it_works: "Fonctionnement",
    nav_employers: "Employeurs",
    nav_jobs: "Emplois",
    nav_my_matches: "Mes Matchs",
    nav_tracker: "Suivi",
    nav_my_cv: "Mon CV",
    nav_sign_in: "Connexion",
    nav_register: "Déposer CV / S'inscrire",
    nav_candidate_hub: "Espace Candidat",
    nav_admin_console: "Console Admin",
    nav_live_jobs: "Offres actives",

    hero_badge: "Portail Carrière Officiel pour l'Allemagne et l'Union Européenne",
    hero_subbadge: "15 000+ offres vérifiées d'entreprises européennes",
    hero_title: "Trouvez votre prochain emploi vérifié en Europe.",
    hero_subtitle: "Accès direct aux offres vérifiées chez Lufthansa, Airbus, Siemens et SAP. Importez votre CV pour un matching structuré, un score de crédibilité et des lettres de motivation sur mesure.",
    hero_what_label: "Que recherchez-vous ?",
    hero_what_placeholder: "Poste, secteur ou compétence (ex: Java, DevOps, PM)...",
    hero_where_label: "Où ?",
    hero_where_placeholder: "Ville, région ou 'Remote' (ex: Berlin, Munich, Paris)...",
    hero_search_btn: "Trouver un emploi",
    hero_trending: "Recherches populaires :",
    stat_active_jobs: "Offres actives",
    stat_employers: "Employeurs vérifiés",
    stat_salary_trans: "Transparence salariale",
    stat_gdpr: "RGPD & Serveurs UE",
    home_top_employers: "Meilleurs Employeurs en Europe",
    home_top_employers_sub: "Offres directes des portails carrières officiels",
    home_view_all_employers: "Voir les 1 200+ employeurs",
    home_categories: "Secteurs Populaires",
    home_categories_sub: "Découvrez les offres par industrie et spécialisation",
    home_recent_jobs: "Dernières Offres Vérifiées",
    home_recent_jobs_sub: "Postes vérifiés avec fourchette salariale et compétences requises",
    home_browse_all: "Parcourir toutes les offres",
    home_details_apply: "Détails & Postuler",
    home_how_title: "3 Étapes vers votre prochain poste en Europe",
    home_how_sub: "Matching structuré de CV, transparent et conforme au RGPD",
    home_step1_title: "Importez & structurez votre CV",
    home_step1_desc: "Importez un PDF ou DOCX. Notre outil structure vos expériences, logiciels, certifications et formations (du plus récent au plus ancien).",
    home_step2_title: "Score de Crédibilité & Matching",
    home_step2_desc: "Évaluation transparente par poste selon vos préférences, localisation, qualifications et certifications.",
    home_step3_title: "Documents sur mesure & Suivi",
    home_step3_desc: "Générez et téléchargez des CV et lettres de motivation adaptés à chaque offre et suivez vos candidatures.",
    home_emp_badge: "Pour Employeurs & RH",
    home_emp_title: "Publiez vos offres et recrutez en Europe",
    home_emp_desc: "Connectez votre ATS pour atteindre des talents qualifiés en Allemagne et dans l'UE.",
    home_create_profile: "Créer un profil candidat",
    home_for_companies: "Pour les Entreprises",

    jobs_title: "Explorer les Emplois en Europe",
    jobs_subtitle: "Recherche optimisée par secteur, logiciel et salaire — avec génération de CV et lettre de motivation sur mesure.",
    jobs_sync_btn: "Synchroniser Sources UE",
    jobs_syncing: "Synchronisation...",
    jobs_search_btn: "Rechercher & Filtrer",
    jobs_sector: "Secteur",
    jobs_exp_level: "Niveau d'expérience",
    jobs_min_salary: "Salaire min (EUR)",
    jobs_workplace: "Mode de travail",
    jobs_showing: "Affichage de",
    jobs_verified_pos: "postes vérifiés",
    jobs_track: "Suivre",
    jobs_tracked: "Suivi",
    jobs_tailored_btn: "CV & Lettre adaptés",
    jobs_apply: "Postuler",

    dash_welcome: "Bon retour",
    dash_subtitle: "Votre profil structuré est actif et analyse les offres vérifiées en Europe.",
    dash_manage_cv: "Gérer mes CV",
    dash_edit_profile: "Modifier le profil",
    dash_credibility_title: "Score de Crédibilité par Poste",
    dash_credibility_sub: "Calculé selon préférences, localisation, expériences, compétences et certifications",
    dash_overall_index: "Indice Global",
    dash_top_matches: "Meilleures Recommandations",
    dash_snapshot: "Aperçu du Profil",
    dash_completeness: "Complétude",

    prof_title: "Profil Candidat Structuré",
    prof_subtitle: "Modèle européen standardisé pour un matching précis et la génération de documents.",
    prof_save: "Enregistrer",
    prof_saved: "Enregistré !",
    prof_overview: "Aperçu & Préférences Sectorielles",
    prof_work_exp: "Expérience Professionnelle",
    prof_edu: "Formation (Plus récente à plus ancienne)",
    prof_certs: "Certifications & Affiliations",
    prof_loc_comp: "Localisation, Langues & Salaire",
    prof_software: "Logiciels Spécifiés",

    matches_badge: "Matching Vérifié • Critères Transparents",
    matches_title: "Offres Recommandées",
    matches_sub: "Classées par compétences, expérience, salaire et langues.",
    matches_compat: "Compatibilité",
    matches_apply: "Postuler",

    tracker_title: "Suivi des Candidatures",
    tracker_sub: "Suivez chaque étape de vos candidatures sur votre tableau Kanban.",
    tracker_add_btn: "Suivre une candidature",

    resumes_title: "Gestionnaire de CV",
    resumes_sub: "Importez votre CV au format PDF ou DOCX pour structurer votre profil.",
    resumes_upload_prompt: "Importer votre CV (PDF ou DOCX)",
    resumes_browse: "Parcourir",

    settings_title: "Confidentialité & RGPD",
    settings_sub: "Gérez vos consentements, l'exportation (Art. 20) et la suppression (Art. 17).",

    login_title: "Connexion à Luxmaan Jobs",
    login_sub: "Accédez à votre profil structuré, score de crédibilité et suivi.",
    login_email: "Adresse e-mail",
    login_password: "Mot de passe",
    login_btn: "Se connecter",
    register_title: "Créer un compte candidat",
    register_sub: "Importez votre CV et vérifiez votre profil européen en quelques secondes.",

    features_title: "Conçu pour le marché européen",
    features_sub: "Recherche multi-secteurs, analyse structurée de CV et conformité RGPD.",
    pricing_title: "Tarifs Transparents",
    pricing_sub: "100% gratuit pour les candidats. Flux temps réel pour les entreprises.",
    contact_title: "Contact & Mentions Légales",
    contact_sub: "Pour toute question technique ou relative à la protection des données.",

    admin_title: "Opérations & Supervision",
    admin_sub: "KPI temps réel, statut des flux TTL 2,5h et pondérations.",

    footer_desc: "Portail Carrière Officiel pour l'Allemagne et l'Union Européenne.",
    footer_gdpr: "Conforme RGPD • Hébergement UE",
    footer_jobs_heading: "Offres d'emploi",
    footer_services_heading: "Services Candidats",
    footer_company_heading: "Entreprise & Légal",
  },
  es: {
    nav_subtitle: "Portal Europeo de Empleo y Carrera",
    nav_search_jobs: "Buscar Empleos",
    nav_job_matcher: "Emparejamiento",
    nav_how_it_works: "Cómo Funciona",
    nav_employers: "Empresas",
    nav_jobs: "Empleos",
    nav_my_matches: "Mis Coincidencias",
    nav_tracker: "Seguimiento",
    nav_my_cv: "Mi CV",
    nav_sign_in: "Iniciar Sesión",
    nav_register: "Subir CV / Registro",
    nav_candidate_hub: "Panel Candidato",
    nav_admin_console: "Consola Admin",
    nav_live_jobs: "Ofertas Activas",

    hero_badge: "Portal Oficial de Empleo para Alemania y la Unión Europea",
    hero_subbadge: "15.000+ vacantes verificadas en empresas líderes europeas",
    hero_title: "Encuentra tu próximo empleo verificado en Europa.",
    hero_subtitle: "Acceso directo a ofertas en Lufthansa, Airbus, Siemens y SAP. Sube tu CV para estructurar tu perfil, calcular tu credibilidad y generar cartas de presentación a medida.",
    hero_what_label: "¿Qué estás buscando?",
    hero_what_placeholder: "Puesto, sector o habilidad (ej. Java, DevOps, PM)...",
    hero_where_label: "¿Dónde?",
    hero_where_placeholder: "Ciudad o 'Remote' (ej. Berlín, Múnich, Madrid)...",
    hero_search_btn: "Buscar Empleos",
    hero_trending: "Búsquedas populares:",
    stat_active_jobs: "Ofertas Activas",
    stat_employers: "Empresas Verificadas",
    stat_salary_trans: "Transparencia Salarial",
    stat_gdpr: "RGPD & Servidores UE",
    home_top_employers: "Principales Empresas en Europa",
    home_top_employers_sub: "Vacantes directas de portales oficiales de empleo",
    home_view_all_employers: "Ver las 1.200+ empresas",
    home_categories: "Sectores Populares",
    home_categories_sub: "Explora oportunidades por industria y especialización",
    home_recent_jobs: "Últimas Ofertas Verificadas",
    home_recent_jobs_sub: "Vacantes verificadas con rango salarial y requisitos claros",
    home_browse_all: "Explorar todas las ofertas",
    home_details_apply: "Detalles y Postular",
    home_how_title: "3 Pasos hacia tu próximo empleo en Europa",
    home_how_sub: "Emparejamiento estructurado de CV, transparente y conforme al RGPD",
    home_step1_title: "Sube y Estructura tu CV",
    home_step1_desc: "Sube PDF o DOCX. Organizamos tu experiencia, software, certificaciones y educación (más reciente a más antigua).",
    home_step2_title: "Índice de Credibilidad",
    home_step2_desc: "Puntuación clara por puesto basada en preferencias, ubicación, trayectoria y certificaciones.",
    home_step3_title: "Documentos a Medida y Seguimiento",
    home_step3_desc: "Genera y descarga CV y cartas de presentación adaptadas a cada oferta y gestiona tu historial.",
    home_emp_badge: "Para Empresas y RR.HH.",
    home_emp_title: "Publica Vacantes y Conecta con Talento en Europa",
    home_emp_desc: "Conecta tu ATS para llegar a profesionales cualificados en Alemania y toda la UE.",
    home_create_profile: "Crear Perfil de Candidato",
    home_for_companies: "Para Empresas",

    jobs_title: "Explorar Empleos en Europa",
    jobs_subtitle: "Búsqueda optimizada por sector, software y salario — con generación de CV y carta a medida en 1 clic.",
    jobs_sync_btn: "Sincronizar Fuentes UE",
    jobs_syncing: "Sincronizando...",
    jobs_search_btn: "Buscar y Filtrar",
    jobs_sector: "Sector",
    jobs_exp_level: "Nivel de Experiencia",
    jobs_min_salary: "Salario Mínimo (EUR)",
    jobs_workplace: "Modalidad",
    jobs_showing: "Mostrando",
    jobs_verified_pos: "puestos verificados",
    jobs_track: "Seguir",
    jobs_tracked: "En seguimiento",
    jobs_tailored_btn: "CV y Carta a medida",
    jobs_apply: "Postular",

    dash_welcome: "Bienvenido de nuevo",
    dash_subtitle: "Tu perfil estructurado está activo buscando vacantes verificadas en Europa.",
    dash_manage_cv: "Gestionar CV",
    dash_edit_profile: "Editar Perfil",
    dash_credibility_title: "Índice de Credibilidad por Puesto",
    dash_credibility_sub: "Calculado según preferencias, ubicación, experiencia, habilidades y certificaciones",
    dash_overall_index: "Índice Global",
    dash_top_matches: "Mejores Coincidencias",
    dash_snapshot: "Resumen del Perfil",
    dash_completeness: "Completitud",

    prof_title: "Perfil Estructurado del Candidato",
    prof_subtitle: "Plantilla europea estandarizada para emparejamiento preciso y generación de documentos.",
    prof_save: "Guardar Plantilla",
    prof_saved: "¡Guardado!",
    prof_overview: "Resumen Profesional y Sector",
    prof_work_exp: "Experiencia Laboral",
    prof_edu: "Educación (Más reciente a más antigua)",
    prof_certs: "Certificaciones y Afiliaciones",
    prof_loc_comp: "Ubicación, Idiomas y Salario",
    prof_software: "Software Específico",

    matches_badge: "Emparejamiento Verificado • Criterios Claros",
    matches_title: "Ofertas Personalizadas",
    matches_sub: "Clasificadas por habilidades, experiencia, salario e idiomas.",
    matches_compat: "Compatibilidad",
    matches_apply: "Postular ahora",

    tracker_title: "Seguimiento de Candidaturas",
    tracker_sub: "Gestiona cada fase de tus postulaciones en un tablero Kanban.",
    tracker_add_btn: "Registrar Postulación",

    resumes_title: "Gestor de CV",
    resumes_sub: "Sube tu currículum en PDF o DOCX para estructurar tu perfil europeo.",
    resumes_upload_prompt: "Sube tu currículum (PDF o DOCX)",
    resumes_browse: "Seleccionar archivo",

    settings_title: "Privacidad y RGPD",
    settings_sub: "Gestiona consentimientos, exportación (Art. 20) y eliminación (Art. 17).",

    login_title: "Iniciar Sesión en Luxmaan Jobs",
    login_sub: "Accede a tu perfil estructurado, credibilidad y seguimiento.",
    login_email: "Correo Electrónico",
    login_password: "Contraseña",
    login_btn: "Iniciar Sesión",
    register_title: "Crear Cuenta de Candidato",
    register_sub: "Sube tu CV una vez y revisa tu perfil europeo al instante.",

    features_title: "Diseñado para el Mercado Europeo",
    features_sub: "Búsqueda multisectorial, análisis estructurado de CV y cumplimiento RGPD.",
    pricing_title: "Precios Transparentes",
    pricing_sub: "100% gratis para candidatos. Fuentes en tiempo real para empresas.",
    contact_title: "Contacto y Aviso Legal",
    contact_sub: "Para consultas técnicas, alianzas o protección de datos.",

    admin_title: "Operaciones y Monitoreo",
    admin_sub: "KPIs en tiempo real, estado de fuentes TTL 2.5h y parámetros.",

    footer_desc: "Portal Oficial de Empleo para Alemania y la Unión Europea.",
    footer_gdpr: "Cumplimiento RGPD • Alojamiento UE",
    footer_jobs_heading: "Categorías",
    footer_services_heading: "Servicios",
    footer_company_heading: "Empresa y Legal",
  },
  nl: {
    nav_subtitle: "Europees Carrière- & Vacatureportaal",
    nav_search_jobs: "Vacatures",
    nav_job_matcher: "CV Matcher",
    nav_how_it_works: "Hoe het werkt",
    nav_employers: "Werkgevers",
    nav_jobs: "Banen",
    nav_my_matches: "Mijn Matches",
    nav_tracker: "Tracker",
    nav_my_cv: "Mijn CV",
    nav_sign_in: "Inloggen",
    nav_register: "CV Uploaden / Registreren",
    nav_candidate_hub: "Kandidaat Hub",
    nav_admin_console: "Admin Console",
    nav_live_jobs: "Actieve Banen",

    hero_badge: "Officieel Carrièreportaal voor Duitsland & de Europese Unie",
    hero_subbadge: "15.000+ geverifieerde vacatures bij Europese topbedrijven",
    hero_title: "Vind jouw volgende geverifieerde baan in Europa.",
    hero_subtitle: "Directe toegang tot vacatures bij Lufthansa, Airbus, Siemens en SAP. Upload je CV voor gestructureerde matching, geloofwaardigheidsscore en sollicitatiebrieven op maat.",
    hero_what_label: "Wat zoek je?",
    hero_what_placeholder: "Functietitel, sector of vaardigheid (bijv. Java, DevOps)...",
    hero_where_label: "Waar?",
    hero_where_placeholder: "Stad of 'Remote' (bijv. Berlijn, München, Amsterdam)...",
    hero_search_btn: "Zoek Vacatures",
    hero_trending: "Populaire zoekopdrachten:",
    stat_active_jobs: "Actieve Vacatures",
    stat_employers: "Geverifieerde Werkgevers",
    stat_salary_trans: "Salaristransparantie",
    stat_gdpr: "AVG / GDPR & EU-hosting",
    home_top_employers: "Topwerkgevers in Duitsland & Europa",
    home_top_employers_sub: "Directe vacatures van officiële carrièreportalen",
    home_view_all_employers: "Bekijk alle 1.200+ werkgevers",
    home_categories: "Populaire Sectoren",
    home_categories_sub: "Ontdek vacatures per sector en specialisatie",
    home_recent_jobs: "Nieuwste Geverifieerde Vacatures",
    home_recent_jobs_sub: "Geverifieerde functies met salarisindicatie en vereisten",
    home_browse_all: "Alle vacatures bekijken",
    home_details_apply: "Details & Solliciteren",
    home_how_title: "In 3 stappen naar je volgende Europese baan",
    home_how_sub: "Gestructureerde CV-matching — transparant en AVG-compliant",
    home_step1_title: "Upload & Structureer je CV",
    home_step1_desc: "Upload PDF of DOCX. We structureren werkervaring, softwaretools, certificeringen en opleidingen (nieuwste eerst).",
    home_step2_title: "Credibility Score & Matching",
    home_step2_desc: "Transparante score per functietitel op basis van voorkeuren, locatie, ervaring en certificaten.",
    home_step3_title: "Documenten op Maat & Tracker",
    home_step3_desc: "Genereer en download aangepaste CV's en motivatiebrieven en houd je sollicitaties bij op het Kanban-bord.",
    home_emp_badge: "Voor Werkgevers & HR",
    home_emp_title: "Plaats Vacatures & Bereik Talent in Europa",
    home_emp_desc: "Koppel je ATS en bereik gekwalificeerde professionals in Duitsland en de EU.",
    home_create_profile: "Maak Kandidaatprofiel",
    home_for_companies: "Voor Bedrijven",

    jobs_title: "Ontdek Vacatures in Duitsland & EU",
    jobs_subtitle: "Geoptimaliseerd zoeken op sector, software en salaris — inclusief CV & motivatiebrief op maat.",
    jobs_sync_btn: "Live EU-bronnen synchroniseren",
    jobs_syncing: "Synchroniseren...",
    jobs_search_btn: "Zoeken & Filteren",
    jobs_sector: "Sector",
    jobs_exp_level: "Ervaringsniveau",
    jobs_min_salary: "Min. Salaris (EUR)",
    jobs_workplace: "Werkplek",
    jobs_showing: "Toont",
    jobs_verified_pos: "geverifieerde vacatures",
    jobs_track: "Volgen",
    jobs_tracked: "Gevolgd",
    jobs_tailored_btn: "CV & Brief op maat",
    jobs_apply: "Solliciteren",

    dash_welcome: "Welkom terug",
    dash_subtitle: "Je gestructureerde profiel is actief en scant geverifieerde vacatures in Europa.",
    dash_manage_cv: "CV's beheren",
    dash_edit_profile: "Profiel bewerken",
    dash_credibility_title: "Functie Credibility Score",
    dash_credibility_sub: "Berekend op voorkeuren, locatie, ervaring, vaardigheden en certificeringen",
    dash_overall_index: "Totaalscore",
    dash_top_matches: "Beste Matches",
    dash_snapshot: "Profieloverzicht",
    dash_completeness: "Volledigheid",

    prof_title: "Gestructureerd Kandidaatprofiel",
    prof_subtitle: "Gestandaardiseerd Europees sjabloon voor nauwkeurige matching en documentgeneratie.",
    prof_save: "Sjabloon opslaan",
    prof_saved: "Opgeslagen!",
    prof_overview: "Carrièreoverzicht & Sectorvoorkeuren",
    prof_work_exp: "Werkervaring",
    prof_edu: "Opleiding (Nieuwste naar oudste)",
    prof_certs: "Certificeringen & Erkenningen",
    prof_loc_comp: "Locatie, Talen & Salaris",
    prof_software: "Specifieke Software",

    matches_badge: "Geverifieerde Matching • Transparante Criteria",
    matches_title: "Passende Vacatures",
    matches_sub: "Gerangschikt op vaardigheden, ervaring, salaris en talen.",
    matches_compat: "Compatibiliteit",
    matches_apply: "Solliciteren",

    tracker_title: "Sollicitatie Tracker",
    tracker_sub: "Beheer elke fase van je sollicitaties op één Kanban-bord.",
    tracker_add_btn: "Sollicitatie toevoegen",

    resumes_title: "CV Manager",
    resumes_sub: "Upload je CV in PDF of DOCX om je gestructureerde profiel te vullen.",
    resumes_upload_prompt: "Upload je CV (PDF of DOCX)",
    resumes_browse: "Bestand kiezen",

    settings_title: "Privacy & AVG-instellingen",
    settings_sub: "Beheer toestemmingen, export (Art. 20) en verwijdering (Art. 17).",

    login_title: "Inloggen bij Luxmaan Jobs",
    login_sub: "Toegang tot je gestructureerde profiel, geloofwaardigheidsscore en tracker.",
    login_email: "E-mailadres",
    login_password: "Wachtwoord",
    login_btn: "Inloggen",
    register_title: "Maak Kandidaataccount",
    register_sub: "Upload je CV één keer en bekijk direct je Europese profiel.",

    features_title: "Ontwikkeld voor de Europese arbeidsmarkt",
    features_sub: "Multi-sector zoeken, gestructureerde CV-analyse en strikte AVG-naleving.",
    pricing_title: "Transparante Prijzen",
    pricing_sub: "100% gratis voor werkzoekenden. Live feeds voor organisaties.",
    contact_title: "Contact & Juridisch",
    contact_sub: "Voor technische vragen, partnerschappen of gegevensbescherming.",

    admin_title: "Platformbeheer & Monitoring",
    admin_sub: "Live KPI's, 2,5u TTL-feedstatus en weegfactoren.",

    footer_desc: "Officieel Carrièreportaal voor Duitsland en de Europese Unie.",
    footer_gdpr: "AVG / GDPR Compliant • EU-datacenter",
    footer_jobs_heading: "Vacaturecategorieën",
    footer_services_heading: "Kandidaatservices",
    footer_company_heading: "Bedrijf & Juridisch",
  },
};

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("luxmaan_lang") as LanguageCode | null;
    if (saved && TRANSLATIONS[saved]) {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = (code: LanguageCode) => {
    setLangState(code);
    localStorage.setItem("luxmaan_lang", code);
    document.documentElement.lang = code;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
