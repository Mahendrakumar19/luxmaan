"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Euro,
  FileText,
  Sliders,
  TrendingUp
} from "lucide-react";
import { formatSalary } from "@/lib/utils";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const sampleCompanies = [
    { name: "Siemens AG", city: "Munich" },
    { name: "Zalando SE", city: "Berlin" },
    { name: "BMW Group", city: "Munich" },
    { name: "SAP SE", city: "Frankfurt" },
    { name: "Delivery Hero", city: "Berlin" },
    { name: "Bosch Group", city: "Stuttgart" }
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.100),white)] opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-brand-700">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Job Agent Platform • Germany & European Union</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Intelligent Job Matching for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                Germany & Europe
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload your CV, let our multilingual AI parse your skills in German and English, and discover verified roles matched to your experience, preferred location, and salary goals.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. .NET, React, Cloud)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="City (e.g. Berlin, Munich, Remote)..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <Link
              href={`/candidate/jobs?q=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationTerm)}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-600/20"
            >
              Search Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick city tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-2">
            <span className="font-medium text-slate-700">Top locations:</span>
            {["Munich", "Berlin", "Frankfurt", "Hamburg", "Stuttgart", "Remote (EU)"].map((city) => (
              <Link
                key={city}
                href={`/candidate/jobs?location=${encodeURIComponent(city)}`}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured German Employers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ingesting verified vacancies from European industry leaders
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {sampleCompanies.map((c) => (
            <div
              key={c.name}
              className="p-4 bg-white rounded-xl border border-slate-200 text-center hover:border-brand-300 transition-colors shadow-sm"
            >
              <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{c.city}, Germany</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Multilingual CV Parsing
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your resume in PDF or DOCX format. Our NLP parser identifies German and English technical skills, professional tenure, and CEFR language proficiencies automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Vector Semantic Matching
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Beyond simple keyword search. Using 384-dimensional multilingual sentence transformers and PostgreSQL pgvector, our engine matches the conceptual semantics of your experience.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Explainable & GDPR Compliant
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent match scores (Skills 40%, Experience 25%, Location 15%, Language 10%, Salary 10%). Strict privacy-by-design under DSGVO with one-click data export and erasure.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
              Ready for Germany’s Tech Market
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Let AI Find Your Next Career Step in Europe
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Build your candidate profile in less than 2 minutes. Receive personalized match recommendations with explicit transparency notes.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/candidate/dashboard"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
              >
                Go to Candidate Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/candidate/jobs"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-6 py-3 rounded-xl transition-all border border-slate-700"
              >
                Browse All Open Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

