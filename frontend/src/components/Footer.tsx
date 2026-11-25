import Link from "next/link";
import { Briefcase, Shield, MapPin, Globe, Building2, CheckCircle2 } from "lucide-react";

export function Footer() {
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
              Offizielles Stellenportal & Karriere-Aggregator für Deutschland und die Europäische Union. Verifizierte Vakanzen, transparente Gehaltsdaten und intelligenter Lebenslauf-Abgleich.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>DSGVO / GDPR Konformität • EU Rechenzentrum</span>
            </div>
          </div>

          {/* Jobs & Branchen */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Stellenangebote
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/candidate/jobs?q=Software" className="hover:text-white transition-colors">
                  IT & Softwareentwicklung
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Aviation" className="hover:text-white transition-colors">
                  Luftfahrt & Aerospace
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Project" className="hover:text-white transition-colors">
                  Projekt- & Programm-Management
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?q=Operations" className="hover:text-white transition-colors">
                  Logistik & Flughafen-Operations
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs?location=Remote" className="hover:text-white transition-colors">
                  Remote & Homeoffice Jobs (EU)
                </Link>
              </li>
            </ul>
          </div>

          {/* Für Bewerber */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Bewerber-Service
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/candidate/resumes" className="hover:text-white transition-colors">
                  Lebenslauf hochladen & parsen
                </Link>
              </li>
              <li>
                <Link href="/candidate/matches" className="hover:text-white transition-colors">
                  Job-Empfehlungen (Matching)
                </Link>
              </li>
              <li>
                <Link href="/candidate/applications" className="hover:text-white transition-colors">
                  Bewerbungs-Tracker (Kanban)
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Transparente Scoring-Kriterien
                </Link>
              </li>
              <li>
                <Link href="/candidate/settings" className="hover:text-white transition-colors">
                  Datenauskunft & Löschung (Art. 17 DSGVO)
                </Link>
              </li>
            </ul>
          </div>

          {/* Unternehmen & Plattform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Unternehmen & Rechtliches
            </h4>
            <div className="text-xs text-slate-400 space-y-2.5">
              <p className="font-semibold text-slate-200">
                Nighwan Technology Pvt. Ltd.
              </p>
              <p className="text-xs text-slate-400">
                Fokusmärkte: Deutschland (DE), Österreich (AT), Schweiz (CH) & EU.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Hosting: Frankfurt AWS (`eu-central-1`)</span>
              </div>
              <div className="pt-2">
                <Link href="/admin/dashboard" className="text-xs text-slate-500 hover:text-slate-300">
                  Admin Leitstand
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Luxmaan Jobs (Nighwan Technology Pvt. Ltd.). Alle Rechte vorbehalten.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              AGB
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Datenschutz
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
