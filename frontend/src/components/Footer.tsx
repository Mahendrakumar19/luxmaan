import Link from "next/link";
import { Shield, Sparkles, MapPin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Nilam<span className="text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered Job Aggregation and Semantic Matching Platform tailored for Germany and the European Union.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>GDPR / DSGVO Compliant • EU Data Hosting</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Candidates
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/candidate/jobs" className="hover:text-white transition-colors">
                  Explore Jobs in Germany
                </Link>
              </li>
              <li>
                <Link href="/candidate/matches" className="hover:text-white transition-colors">
                  AI Job Recommendations
                </Link>
              </li>
              <li>
                <Link href="/candidate/resumes" className="hover:text-white transition-colors">
                  CV Parser & Analysis
                </Link>
              </li>
              <li>
                <Link href="/candidate/profile" className="hover:text-white transition-colors">
                  Candidate Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform & Governance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Matching Architecture
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing & Sources
                </Link>
              </li>
              <li>
                <Link href="/candidate/settings" className="hover:text-white transition-colors">
                  Privacy & Data Export (GDPR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Ownership */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Enterprise Ownership
            </h4>
            <div className="text-sm text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200">
                Nighwan Technology Pvt. Ltd.
              </p>
              <p className="text-xs text-slate-400">
                Target Market: Germany, Austria, Switzerland & EU Member States.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Frankfurt AWS Region (`eu-central-1`)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Nighwan Technology Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/candidate/settings" className="hover:text-slate-400 transition-colors">
              Privacy Policy (DSGVO)
            </Link>
            <Link href="/candidate/settings" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Contact & Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
