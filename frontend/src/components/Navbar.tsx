"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Shield, 
  User as UserIcon, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut, 
  CheckSquare,
  FileText,
  Search,
  SlidersHorizontal,
  Globe,
  ChevronDown,
  Check
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { lang, setLang, t } = useLanguage();
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(apiClient.getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    setCurrentUser(null);
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    setLang(code);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-800 transition-colors">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Luxmaan<span className="text-brand-700">Jobs</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                  DE / EU
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                {t.nav_subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin' ? (
              <>
                <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-300 transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-brand-700" />
                  <span>{t.nav_admin_console}</span>
                </Link>
                <Link href="/candidate/jobs" className="hover:text-brand-700 transition-colors">
                  {t.nav_live_jobs}
                </Link>
              </>
            ) : currentUser ? (
              <>
                <Link href="/candidate/jobs" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>{t.nav_jobs}</span>
                </Link>
                <Link href="/candidate/matches" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>{t.nav_my_matches}</span>
                </Link>
                <Link href="/candidate/applications" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  <span>{t.nav_tracker}</span>
                </Link>
                <Link href="/candidate/resumes" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>{t.nav_my_cv}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/candidate/jobs" className="hover:text-brand-700 transition-colors">
                  {t.nav_search_jobs}
                </Link>
                <Link href="/candidate/matches" className="hover:text-brand-700 transition-colors">
                  {t.nav_job_matcher}
                </Link>
                <Link href="/features" className="hover:text-brand-700 transition-colors">
                  {t.nav_how_it_works}
                </Link>
                <Link href="/pricing" className="hover:text-brand-700 transition-colors">
                  {t.nav_employers}
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls: Globe Language Switcher + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* World Symbol Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change language"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-brand-700" />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50">
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleSelectLanguage(item.code)}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        lang === item.code ? "font-bold text-brand-700 bg-brand-50/50" : "font-medium text-slate-700"
                      }`}
                    >
                      <span>{item.nativeName}</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        {item.label}
                        {lang === item.code && <Check className="w-3.5 h-3.5 text-brand-700" />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentUser ? (
              <>
                {currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? (
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin</span>
                  </span>
                ) : (
                  <Link
                    href="/candidate/profile"
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 transition-colors border border-slate-200"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-brand-700" />
                    <span>{currentUser.firstName} {currentUser.lastName?.[0]}.</span>
                  </Link>
                )}

                <Link
                  href={currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? "/admin/dashboard" : "/candidate/dashboard"}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <span>{currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? "Dashboard" : t.nav_candidate_hub}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 hover:text-brand-700 px-3 py-2 transition-colors"
                >
                  {t.nav_sign_in}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <span>{t.nav_register}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls: Globe + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const idx = SUPPORTED_LANGUAGES.findIndex(l => l.code === lang);
                const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
                setLang(next.code);
              }}
              aria-label="Switch language"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <Globe className="w-4 h-4 text-brand-700" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/candidate/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            {t.nav_search_jobs}
          </Link>
          <Link
            href="/candidate/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            {t.nav_my_matches}
          </Link>
          <Link
            href="/candidate/applications"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            {t.nav_tracker}
          </Link>
          <Link
            href="/candidate/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            {t.nav_candidate_hub}
          </Link>

          {/* Mobile Language Selector Grid */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
              <Globe className="w-3.5 h-3.5 text-brand-700" />
              <span>Language</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    lang === item.code
                      ? "bg-brand-700 text-white border-brand-700"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {item.nativeName}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <div className="text-xs text-slate-500 font-semibold px-1">
                  {currentUser.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  {t.nav_sign_in}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-700 rounded-lg shadow-sm"
                >
                  {t.nav_register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
