import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Transparent, Fair Pricing
        </h1>
        <p className="text-sm text-slate-600">
          Always 100% free for job seekers. Enterprise and recruitment feed integrations available for organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Candidate Plan */}
        <div className="p-8 bg-white rounded-3xl border-2 border-brand-500 shadow-xl space-y-6 relative">
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
            Job Seekers
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Candidate Pro</h3>
            <div className="text-3xl font-black text-slate-900 mt-2">€0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
            <p className="text-xs text-slate-500 mt-1">Everything you need to discover and apply to top jobs.</p>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Unlimited CV & Resume Uploads (PDF & DOCX)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Multilingual NLP Skill & Experience Extraction</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>AI Semantic Matching across German & EU Jobs</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Explainable AI Compatibility Breakdown</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>GDPR Self-Service Data Export & Erasure</span>
            </li>
          </ul>

          <Link
            href="/register"
            className="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold text-center shadow-md transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Enterprise Source Plan */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Employers & Feeds
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Enterprise Ingestion</h3>
            <div className="text-3xl font-black text-slate-900 mt-2">Custom <span className="text-sm font-normal text-slate-500">/ annual</span></div>
            <p className="text-xs text-slate-500 mt-1">Direct API pipelines and verified employer badge.</p>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Dedicated ATS & Career Page Webhook Integration</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Priority Vector Indexing & Hourly Re-crawling</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Company Profile & Verified Employer Badge</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Enterprise SLA & Compliance Audits</span>
            </li>
          </ul>

          <Link
            href="/contact"
            className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold text-center transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}

