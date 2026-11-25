"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Euro,
  FileText,
  SlidersHorizontal,
  TrendingUp,
  Plane,
  Code2,
  Cpu,
  BarChart3,
  Factory,
  Boxes,
  Clock,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const sampleCompanies = [
    { name: "Lufthansa Group", location: "Frankfurt / München", count: "28 offene Stellen", logo: "LH" },
    { name: "Airbus SE", location: "Hamburg / Bremen", count: "22 offene Stellen", logo: "AI" },
    { name: "Siemens AG", location: "München / Berlin", count: "34 offene Stellen", logo: "SI" },
    { name: "SAP SE", location: "Walldorf / Frankfurt", count: "19 offene Stellen", logo: "SA" },
    { name: "BMW Group", location: "München", count: "16 offene Stellen", logo: "BM" },
    { name: "Fraport AG", location: "Frankfurt am Main", count: "12 offene Stellen", logo: "FR" },
    { name: "Deutsche Bahn", location: "Berlin / Frankfurt", count: "41 offene Stellen", logo: "DB" },
    { name: "Bosch Group", location: "Stuttgart", count: "25 offene Stellen", logo: "BO" }
  ];

  const categories = [
    { name: "IT, Software & Cloud", icon: Code2, count: "4.210 Stellen", href: "/candidate/jobs?q=Software" },
    { name: "Luftfahrt & Engineering", icon: Plane, count: "1.850 Stellen", href: "/candidate/jobs?q=Aviation" },
    { name: "Projektmanagement & PMO", icon: Briefcase, count: "2.340 Stellen", href: "/candidate/jobs?q=Project" },
    { name: "Data Science & AI", icon: BarChart3, count: "1.420 Stellen", href: "/candidate/jobs?q=Data" },
    { name: "Maschinenbau & Automation", icon: Factory, count: "3.110 Stellen", href: "/candidate/jobs?q=Engineering" },
    { name: "Logistik & Supply Chain", icon: Boxes, count: "2.080 Stellen", href: "/candidate/jobs?q=Operations" },
  ];

  const featuredJobs = [
    {
      id: "mock-crawl-lh-01",
      title: "Senior Aviation Project Manager",
      company: "Lufthansa Group",
      location: "Frankfurt am Main",
      workplace: "Hybrid",
      salary: "€82.000 – €105.000",
      skills: ["Aviation PM", "Fleet Operations", "EASA Compliance", "Risk Management"],
      posted: "Vor 2 Tagen"
    },
    {
      id: "mock-crawl-ab-02",
      title: "Aerospace Systems Integration Specialist",
      company: "Airbus SE",
      location: "Hamburg",
      workplace: "On-Site",
      salary: "€76.000 – €94.000",
      skills: ["Avionics", "DO-178C", "Systems Engineering", "German B2"],
      posted: "Vor 1 Tag"
    },
    {
      id: "mock-crawl-fp-03",
      title: "Airport Operations & Ground Handling Lead",
      company: "Fraport AG",
      location: "Frankfurt Airport",
      workplace: "On-Site",
      salary: "€68.000 – €85.000",
      skills: ["Ground Handling", "ICAO / IATA", "Crisis Management", "Operations"],
      posted: "Heute"
    },
    {
      id: "seed-job-01",
      title: "Senior Full-Stack Engineer (.NET & Angular)",
      company: "Siemens AG",
      location: "München",
      workplace: "Hybrid",
      salary: "€75.000 – €92.000",
      skills: ["C#", ".NET Core", "Angular", "PostgreSQL", "Docker"],
      posted: "Vor 3 Tagen"
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* StepStone / Indeed-Style Hero Section */}
      <section className="bg-slate-900 text-white relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Top Label */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-700/60 border border-brand-500/40 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Offizielles Karriereportal für Deutschland & die Europäische Union
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              15.000+ verifizierte Stellenanzeigen führender Unternehmen
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Finde Deinen nächsten Karriereschritt in Deutschland.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
              Direkter Zugang zu geprüften Stellenangeboten bei Top-Konzernen wie Lufthansa, Airbus, Siemens und SAP. 
              Lade Deinen Lebenslauf hoch für automatischen Präzisionsabgleich nach Hard Skills, Sprachniveau und Gehalt.
            </p>
          </div>

          {/* StepStone Dual Search Box */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-2xl border border-slate-200 flex flex-col md:flex-row gap-2">
            {/* Input 1: Was? */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-brand-600 focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Was suchen Sie?
                </label>
                <input
                  type="text"
                  placeholder="Jobtitel, Fachbereich oder Skill (z.B. Java, DevOps, PM)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Input 2: Wo? */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-brand-600 focus-within:bg-white transition-all">
              <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Wo?
                </label>
                <input
                  type="text"
                  placeholder="Stadt, Bundesland oder 'Remote' (z.B. Berlin, München)..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href={`/candidate/jobs?q=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationTerm)}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm px-8 py-3.5 rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Jobs finden</span>
            </Link>
          </div>

          {/* Trending Searches */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-200">Beliebte Suchen:</span>
            {[
              { label: "Aviation Project Lead", q: "Aviation" },
              { label: "DevOps & Cloud", q: "DevOps" },
              { label: "Full Stack Developer", q: "Full Stack" },
              { label: "Airport Operations", q: "Operations" },
              { label: "SAP Consultant", q: "SAP" },
              { label: "Data Engineer", q: "Data" },
              { label: "Homeoffice / Remote", q: "Remote" }
            ].map((tag) => (
              <Link
                key={tag.label}
                href={`/candidate/jobs?q=${encodeURIComponent(tag.q)}`}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Trust & Market Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">15.000+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Aktive Stellenanzeigen</div>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1.200+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Geprüfte Arbeitgeber</div>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">84%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mit Gehaltstransparenz</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-700">100%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">DSGVO & EU Server</div>
          </div>
        </div>
      </section>

      {/* Top Employers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Top-Arbeitgeber in Deutschland & Europa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Direkte Vakanzen aus offiziellen Karriereportalen und ATS-Schnittstellen
            </p>
          </div>
          <Link 
            href="/candidate/jobs"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Alle 1.200+ Arbeitgeber ansehen <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sampleCompanies.map((c) => (
            <Link
              key={c.name}
              href={`/candidate/jobs?q=${encodeURIComponent(c.name)}`}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 font-black text-slate-700 flex items-center justify-center text-sm group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                {c.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate group-hover:text-brand-700 transition-colors">
                  {c.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{c.location}</div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Job Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Beliebte Berufsfelder
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Entdecke Stellenangebote nach Branche und Spezialisierung
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-700 flex items-center justify-center shrink-0 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all mt-1" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Openings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Aktuelle Stellenangebote in Deutschland
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verifizierte Vakanzen mit Gehaltsangaben und Anforderungsprofilen
            </p>
          </div>
          <Link
            href="/candidate/jobs"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Alle Stellenangebote durchsuchen <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {job.company}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 hover:text-brand-700 transition-colors">
                      <Link href={`/candidate/jobs?q=${encodeURIComponent(job.title)}`}>
                        {job.title}
                      </Link>
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {job.workplace}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <Euro className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {job.posted}
                  </span>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Vollzeit • Unbefristet
                </span>
                <Link
                  href={`/candidate/jobs?q=${encodeURIComponent(job.company)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
                >
                  <span>Details & Bewerben</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works for Candidates (Clean Recruitment Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            In 3 Schritten zum passenden Jobangebot
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Intelligenter Lebenslauf-Abgleich ohne Bewerbungsfrust – transparent und datenschutzkonform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-700 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Lebenslauf hochladen & prüfen
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lade Deinen CV als PDF oder DOCX hoch. Unsere Parsing-Engine extrahiert Hard Skills, Arbeitserfahrung und Sprachkenntnisse (CEFR A1–C2). Du kannst alle Angaben vor dem Speichern anpassen.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-700 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Transparenter Matching-Score
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keine Black-Box: Unser semantisches Scoring vergleicht Hard Skills (40%), Berufserfahrung (25%), Standort (15%), Sprachniveau (10%) und Gehalt (10%) mit exakter Begründung.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-700 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Bewerbungs-Tracker & Übersicht
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verwalte alle Bewerbungen übersichtlich in einem Kanban-Board (Interessiert, Beworben, Interview, Angebot). Verpasse keine Fristen oder Rückmeldungen.
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Employer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              Für Arbeitgeber & HR-Teams
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Stellenanzeigen schalten & Talente in Europa finden
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verbinden Sie Ihr ATS oder nutzen Sie unseren automatisierten Crawler-Service, um qualifizierte Fachkräfte in Deutschland, Österreich und der Schweiz direkt zu erreichen.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/register"
              className="px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-lg transition-colors text-center shadow-sm"
            >
              Kandidatenprofil anlegen
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-colors text-center"
            >
              Für Unternehmen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
