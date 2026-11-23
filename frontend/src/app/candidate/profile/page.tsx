"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  MapPin, 
  Briefcase, 
  Euro, 
  Clock, 
  Languages, 
  Sparkles, 
  Save, 
  Check, 
  Plus, 
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { CandidateProfile } from "@/types";

export default function CandidateProfilePage() {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [remotePreference, setRemotePreference] = useState("Hybrid");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [germanLevel, setGermanLevel] = useState("B1");
  const [englishLevel, setEnglishLevel] = useState("Fluent");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const prof = await apiClient.getProfile();
        if (prof) {
          setHeadline(prof.headline || "");
          setSummary(prof.summary || "");
          setExperienceYears(prof.yearsOfExperience !== undefined && prof.yearsOfExperience !== null && prof.yearsOfExperience > 0 ? String(prof.yearsOfExperience) : "");
          setCurrentCity(prof.currentLocation || "");
          setRemotePreference(prof.remotePreference || "Hybrid");
          setMinSalary(prof.expectedSalaryMin ? String(prof.expectedSalaryMin) : "");
          setMaxSalary(prof.expectedSalaryMax ? String(prof.expectedSalaryMax) : "");
          setNoticePeriod(prof.noticePeriodDays ? String(prof.noticePeriodDays) : "30");
          setSkills(prof.skills || []);
          
          if (prof.languages && prof.languages.length > 0) {
            const de = prof.languages.find(l => l.lang.toLowerCase().includes('german') || l.lang.toLowerCase().includes('deutsch'));
            if (de) setGermanLevel(de.level);
            const en = prof.languages.find(l => l.lang.toLowerCase().includes('english'));
            if (en) setEnglishLevel(en.level);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSavedSuccess(false);

    const languagesPayload = [
      { lang: "German", level: germanLevel },
      { lang: "English", level: englishLevel }
    ];

    const result = await apiClient.updateProfile({
      headline,
      summary,
      yearsOfExperience: parseFloat(experienceYears) || 0,
      currentLocation: currentCity,
      remotePreference: remotePreference as any,
      expectedSalaryMin: parseInt(minSalary) || undefined,
      expectedSalaryMax: parseInt(maxSalary) || undefined,
      noticePeriodDays: parseInt(noticePeriod) || 30,
      skills,
      languages: languagesPayload
    });

    setSaving(false);
    if (result.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setErrorMessage(result.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Loading candidate profile...</p>
      </div>
    );
  }

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
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : savedSuccess ? (
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

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Profile updated and synchronized with backend AI matching engine!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        {/* Personal & Headline */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-600" />
            Professional Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Cloud & Full-Stack Engineer"
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
                min="0"
                max="50"
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
              placeholder="Describe your primary technical focus, frameworks, and architecture experience..."
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
                placeholder="e.g. Munich, Germany"
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
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills added yet. Add your technical or domain skills below.</p>
            ) : (
              skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => removeSkill(sk)}
                    className="hover:text-brand-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
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
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
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
