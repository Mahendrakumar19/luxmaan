"use client";

import { useState } from "react";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Euro, 
  Clock, 
  Languages, 
  Sparkles, 
  Save, 
  Check, 
  Plus, 
  X 
} from "lucide-react";

export default function CandidateProfilePage() {
  const [headline, setHeadline] = useState("Senior Cloud & Full-Stack Engineer");
  const [summary, setSummary] = useState(
    "Senior full-stack engineer with 6 years of experience building distributed microservices using C#, .NET, Docker, and PostgreSQL in Munich."
  );
  const [experienceYears, setExperienceYears] = useState("6.0");
  const [currentCity, setCurrentCity] = useState("Munich, Germany");
  const [remotePreference, setRemotePreference] = useState("Hybrid");
  const [minSalary, setMinSalary] = useState("80000");
  const [maxSalary, setMaxSalary] = useState("95000");
  const [noticePeriod, setNoticePeriod] = useState("30");
  
  const [skills, setSkills] = useState([
    "C#", ".NET", "ASP.NET Core", "React", "TypeScript", "Docker", "PostgreSQL", "AWS"
  ]);
  const [newSkill, setNewSkill] = useState("");

  const [germanLevel, setGermanLevel] = useState("C1");
  const [englishLevel, setEnglishLevel] = useState("Fluent");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Profile
          </h1>
          <p className="text-sm text-slate-600">
            Define your technical background, salary expectations, and language proficiencies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        {/* Personal & Headline */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Professional Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Professional Biography / Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Location & Remote Preferences */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Location & Work Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Current City / Location</label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Remote / Hybrid Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              >
                <option value="Flexible">Flexible</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Full Remote</option>
                <option value="OnSite">On-Site</option>
              </select>
            </div>
          </div>
        </div>

        {/* Languages (CEFR Framework) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Languages className="w-4 h-4 text-brand-600" />
            Language Proficiencies (CEFR Framework)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">German (Deutsch)</label>
              <select
                value={germanLevel}
                onChange={(e) => setGermanLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              >
                <option value="Native / C2">Native / C2 (Muttersprache)</option>
                <option value="C1">C1 (Verhandlungssicher)</option>
                <option value="B2">B2 (Fließend)</option>
                <option value="B1">B1 (Mittelstufe)</option>
                <option value="A2">A2 (Grundkenntnisse)</option>
                <option value="A1">A1 (Anfänger)</option>
                <option value="None">None</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">English</label>
              <select
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              >
                <option value="Native">Native</option>
                <option value="Fluent">Fluent / C1</option>
                <option value="B2">B2 (Professional Working)</option>
                <option value="B1">B1 (Intermediate)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Notice */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Euro className="w-4 h-4 text-brand-600" />
            Salary Expectations & Availability
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Min Annual Gross (€)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Annual Gross (€)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notice Period (Days)</label>
              <input
                type="number"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Verified Technical Skills */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Technical & Domain Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium"
              >
                {sk}
                <button
                  type="button"
                  onClick={() => removeSkill(sk)}
                  className="hover:text-brand-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Kubernetes, Python)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
