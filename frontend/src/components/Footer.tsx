"use client";

import Link from "next/link";
import { Briefcase, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Luxmaan<span className="text-brand-400">Jobs</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer_desc}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{t.footer_gdpr}</span>
            </div>
          </div>

          {/* Jobs & Sectors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t.footer_jobs_heading}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/candidate/jobs?q=Software" className="hover:text-white transition-colors">
                  IT & Software Engineering
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Aviation" className="hover:text-white transition-colors">
                  Aviation & Aerospace
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Project" className="hover:text-white transition-colors">
                  Project & Program Management
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Operations" className="hover:text-white transition-colors">
                  Logistics & Operations
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?location=Remote" className="hover:text-white transition-colors">
                  Remote Jobs (EU)
                </Link>
              </li>
            </ul>
          </div>

          {/* Candidate Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t.footer_services_heading}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/candidate/resumes" className="hover:text-white transition-colors">
                  {t.nav_my_cv}
                </Link>
              </li>
              <li>
                <Link href="/candidate/matches" className="hover:text-white transition-colors">
                  {t.nav_my_matches}
                </Link>
              </li>
              <li>
                <Link href="/candidate/applications" className="hover:text-white transition-colors">
                  {t.nav_tracker}
                </Link>
              </li>
              <li>
                <Link href="/candidate/profile" className="hover:text-white transition-colors">
                  {t.prof_title}
                </Link>
              </li>
              <li>
                <Link href="/candidate/settings" className="hover:text-white transition-colors">
                  GDPR / Art. 17 Data Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t.footer_company_heading}
            </h4>
            <div className="text-xs text-slate-400 space-y-2.5">
              <p className="font-semibold text-slate-200">
                Nighwan Technology Pvt. Ltd.
              </p>
              <p className="text-xs text-slate-400">
                Germany (DE), Austria (AT), Switzerland (CH) & European Union.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>AWS Frankfurt (`eu-central-1`)</span>
              </div>
              <div className="pt-2">
                <Link href="/admin/dashboard" className="text-xs text-slate-500 hover:text-slate-300">
                  {t.nav_admin_console}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Luxmaan Jobs (Nighwan Technology Pvt. Ltd.).
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/impressum" className="hover:text-slate-300 transition-colors">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
