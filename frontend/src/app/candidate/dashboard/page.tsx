"use client";

import Link from "next/link";
import { 
  User, 
  FileText, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  Shield, 
  ExternalLink,
  Building2,
  MapPin
} from "lucide-react";
import { formatSalary } from "@/lib/utils";

export default function CandidateDashboardPage() {
  const profile = {
    name: "Lukas Müller",
    headline: "Senior Cloud & Full-Stack Engineer",
    location: "Munich, Germany",
    experience: "6.0 years",
    skills: ["C#", ".NET", "React", "TypeScript", "Docker", "PostgreSQL", "AWS"],
    languages: ["German (C1)", "English (Fluent)"],
    profileCompletion: 85
  };

  const recentMatches = [
    {
      title: "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
      company: "Siemens AG",
      location: "Munich (Hybrid)",
      score: 89.2,
      salary: "€80k - €95k"
    },
    {
      title: "Full-Stack Developer (React / Next.js / TypeScript)",
      company: "Zalando SE",
      location: "Berlin (Hybrid)",
      score: 84.6,
      salary: "€70k - €84k"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="p-8 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-700/50 text-brand-200 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-brand-200 max-w-xl">
            Your profile is active and scanning verified vacancies across Germany and the European Union.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/candidate/resumes"
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-brand-600" />
            Manage Resumes
          </Link>
          <Link
            href="/candidate/profile"
            className="px-4 py-2.5 bg-brand-700/60 hover:bg-brand-700 text-white border border-brand-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Grid: Profile Snapshot & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Profile Snapshot</h2>
            <Link href="/candidate/profile" className="text-xs font-semibold text-brand-600 hover:underline">
              Edit
            </Link>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Completeness</span>
              <span className="text-brand-600">{profile.profileCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 divide-y divide-slate-100">
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Headline</span>
              <span className="text-slate-800 font-semibold">{profile.headline}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Location</span>
              <span className="text-slate-800 font-semibold">{profile.location}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Experience</span>
              <span className="text-slate-800 font-semibold">{profile.experience}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Languages</span>
              <span className="text-slate-800 font-semibold">{profile.languages.join(", ")}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-700 block">Verified Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* GDPR link */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/candidate/settings"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Privacy & Consent Settings (GDVO)</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Top Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Top AI Matches</h2>
              <p className="text-xs text-slate-500">Based on your C#/.NET background and Munich location</p>
            </div>
            <Link
              href="/candidate/matches"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All Matches
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMatches.map((m) => (
              <div
                key={m.title}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      {m.score}% Match
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">{m.salary}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5" />
                      {m.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {m.location}
                    </span>
                  </div>
                </div>

                <Link
                  href="/candidate/matches"
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 bg-slate-100/70 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/candidate/jobs"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors space-y-1 block shadow-sm"
            >
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                Explore All Jobs
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-500">Search thousands of open tech positions across Germany.</p>
            </Link>

            <Link
              href="/candidate/resumes"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors space-y-1 block shadow-sm"
            >
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                Upload New Resume
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-500">Extract skills with multilingual NLP parsing.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

