"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  MapPin, 
  Briefcase, 
  Euro, 
  Languages, 
  Save, 
  Check, 
  Plus, 
  X,
  Loader2,
  AlertCircle,
  GraduationCap,
  Award,
  Wrench,
  Trash2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { WorkExperience, EducationItem, CertificationItem } from "@/types";

export default function CandidateProfilePage() {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [sector, setSector] = useState("IT & Cloud Engineering");
  const [targetRolesText, setTargetRolesText] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [remotePreference, setRemotePreference] = useState("Hybrid");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30");

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [softwareTools, setSoftwareTools] = useState<string[]>([]);
  const [newSoftware, setNewSoftware] = useState("");

  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

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
          setSector(prof.sector || "IT & Cloud Engineering");
          setTargetRolesText((prof.targetRoles || []).join(", "));
          setExperienceYears(prof.yearsOfExperience !== undefined && prof.yearsOfExperience !== null && prof.yearsOfExperience > 0 ? String(prof.yearsOfExperience) : "");
          setCurrentCity(prof.currentLocation || "");
          setRemotePreference(prof.remotePreference || "Hybrid");
          setMinSalary(prof.expectedSalaryMin ? String(prof.expectedSalaryMin) : "");
          setMaxSalary(prof.expectedSalaryMax ? String(prof.expectedSalaryMax) : "");
          setNoticePeriod(prof.noticePeriodDays ? String(prof.noticePeriodDays) : "30");
          setSkills(prof.skills || []);
          setSoftwareTools(prof.softwareTools || []);
          setExperiences(prof.experiences || []);
          // Sort educations strictly latest to oldest
          const sortedEdu = [...(prof.educations || [])].sort((a, b) => (Number(b.endYear) || 9999) - (Number(a.endYear) || 9999));
          setEducations(sortedEdu);
          setCertifications(prof.certifications || []);

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

  const handleAddSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSoftware.trim();
    if (trimmed && !softwareTools.includes(trimmed)) {
      setSoftwareTools([...softwareTools, trimmed]);
      setNewSoftware("");
    }
  };

  const addExperience = () => {
    setExperiences([
      {
        id: `exp-${Date.now()}`,
        company: "",
        companyType: "Enterprise",
        jobRole: "",
        startDate: "2023-01",
        endDate: "",
        isCurrent: false,
        responsibilities: [""]
      },
      ...experiences
    ]);
  };

  const updateExperience = (idx: number, field: keyof WorkExperience, value: any) => {
    const next = [...experiences];
    next[idx] = { ...next[idx], [field]: value };
    setExperiences(next);
  };

  const addEducation = () => {
    const next = [
      {
        id: `edu-${Date.now()}`,
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: 2020,
        endYear: 2024
      },
      ...educations
    ].sort((a, b) => (Number(b.endYear) || 9999) - (Number(a.endYear) || 9999));
    setEducations(next);
  };

  const updateEducation = (idx: number, field: keyof EducationItem, value: any) => {
    const next = [...educations];
    next[idx] = { ...next[idx], [field]: value };
    setEducations(next);
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: `cert-${Date.now()}`,
        name: "",
        type: "Technical / Industry",
        duration: "3 months",
        recognisedAffiliation: "",
        issueYear: 2024
      }
    ]);
  };

  const updateCertification = (idx: number, field: keyof CertificationItem, value: any) => {
    const next = [...certifications];
    next[idx] = { ...next[idx], [field]: value };
    setCertifications(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSavedSuccess(false);

    const languagesPayload = [
      { lang: "German", level: germanLevel },
      { lang: "English", level: englishLevel }
    ];

    const targetRoles = targetRolesText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const sortedEducations = [...educations].sort((a, b) => (Number(b.endYear) || 9999) - (Number(a.endYear) || 9999));
    setEducations(sortedEducations);

    const result = await apiClient.updateProfile({
      headline,
      summary,
      sector,
      targetRoles,
      yearsOfExperience: parseFloat(experienceYears) || 0,
      currentLocation: currentCity,
      remotePreference: remotePreference as any,
      expectedSalaryMin: parseInt(minSalary) || undefined,
      expectedSalaryMax: parseInt(maxSalary) || undefined,
      noticePeriodDays: parseInt(noticePeriod) || 30,
      skills,
      softwareTools,
      experiences,
      educations: sortedEducations,
      certifications,
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
        <Loader2 className="w-8 h-8 animate-spin text-brand-700" />
        <p className="text-sm font-medium text-slate-500">Loading structured candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Structured Candidate Profile
          </h1>
          <p className="text-sm text-slate-600">
            Standardized European profile template for accurate job matching, credibility scoring, and tailored CV generation.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Template
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Structured profile saved and synchronized with matching & credibility engine.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
        {/* 1. Career Preferences & Overview */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-700" />
            Career Overview & Sector Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Primary Job Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Cloud & Full-Stack Engineer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-600 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Industry Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-600 bg-slate-50/50"
              >
                <option value="IT & Cloud Engineering">IT & Cloud Engineering</option>
                <option value="Aviation & Aerospace">Aviation & Aerospace</option>
                <option value="Engineering & Manufacturing">Engineering & Manufacturing</option>
                <option value="Finance & Consulting">Finance & Consulting</option>
                <option value="Logistics & Operations">Logistics & Operations</option>
                <option value="Data & Analytics">Data & Analytics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Job Roles (comma separated for Credibility Score)</label>
              <input
                type="text"
                placeholder="e.g. Cloud Architect, Full-Stack Engineer, DevOps Lead"
                value={targetRolesText}
                onChange={(e) => setTargetRolesText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-600 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Total Years of Experience</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-600 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Executive Summary</label>
            <textarea
              rows={2}
              placeholder="Concise summary of your past qualifications, core roles, and career focus..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* 2. Structured Work Experience Template */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-700" />
              Work Experience (Structured Template)
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>

          {experiences.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No work experiences added yet. Upload a CV or click Add Role.</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Job Role</label>
                      <input
                        type="text"
                        value={exp.jobRole}
                        onChange={(e) => updateExperience(idx, "jobRole", e.target.value)}
                        placeholder="e.g. Project Manager"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        placeholder="e.g. Lufthansa Group"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Company Type</label>
                      <input
                        type="text"
                        value={exp.companyType}
                        onChange={(e) => updateExperience(idx, "companyType", e.target.value)}
                        placeholder="e.g. Enterprise / Aviation / SaaS"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        placeholder="YYYY-MM"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">End Date</label>
                      <input
                        type="text"
                        disabled={exp.isCurrent}
                        value={exp.isCurrent ? "Present" : (exp.endDate || "")}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        placeholder="YYYY-MM"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:bg-slate-100"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 pb-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(idx, "isCurrent", e.target.checked)}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      Currently Working Here
                    </label>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Key Job Responsibilities (one per line)</label>
                    <textarea
                      rows={2}
                      value={(exp.responsibilities || []).join("\n")}
                      onChange={(e) => updateExperience(idx, "responsibilities", e.target.value.split("\n"))}
                      placeholder="Led cloud migration..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Education (Latest to Oldest) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-700" />
              Education (Latest to Oldest)
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          {educations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education records yet.</p>
          ) : (
            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-semibold text-slate-600">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      placeholder="e.g. TU Munich"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-semibold text-slate-600">Degree & Field</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="e.g. M.Sc. Computer Science"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Start Year</label>
                    <input
                      type="number"
                      value={edu.startYear}
                      onChange={(e) => updateEducation(idx, "startYear", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">End Year</label>
                    <input
                      type="number"
                      value={edu.endYear || ""}
                      onChange={(e) => updateEducation(idx, "endYear", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Certifications (Type, Duration, Recognised Affiliations) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-700" />
              Certifications & Recognised Affiliations
            </h2>
            <button
              type="button"
              onClick={addCertification}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert, idx) => (
                <div key={cert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-semibold text-slate-600">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, "name", e.target.value)}
                      placeholder="e.g. AWS Solutions Architect"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-semibold text-slate-600">Type / Category</label>
                    <input
                      type="text"
                      value={cert.type}
                      onChange={(e) => updateCertification(idx, "type", e.target.value)}
                      placeholder="e.g. Cloud / Aviation / Language"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Duration</label>
                    <input
                      type="text"
                      value={cert.duration}
                      onChange={(e) => updateCertification(idx, "duration", e.target.value)}
                      placeholder="e.g. 3 months"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Recognised Affiliation</label>
                    <input
                      type="text"
                      value={cert.recognisedAffiliation}
                      onChange={(e) => updateCertification(idx, "recognisedAffiliation", e.target.value)}
                      placeholder="e.g. AWS / PMI / IHK"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Location, Work Mode, Languages & Salary */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-700" />
            Location, Languages & Compensation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Current Location</label>
              <input
                type="text"
                placeholder="Munich, Germany"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Work Mode</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="Flexible">Flexible</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="OnSite">On-Site</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">German (CEFR)</label>
              <select
                value={germanLevel}
                onChange={(e) => setGermanLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="Native / C2">Native / C2</option>
                <option value="C1">C1 (Business Fluent)</option>
                <option value="B2">B2 (Fluent)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="A2">A2 (Basic)</option>
                <option value="A1">A1 (Beginner)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">English</label>
              <select
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="Native">Native</option>
                <option value="Fluent">Fluent / C1</option>
                <option value="B2">B2</option>
                <option value="B1">B1</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Min Annual Gross (€)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Annual Gross (€)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notice Period (Days)</label>
              <input
                type="number"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* 6. Sector Skills & Specified Software Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Domain / Sector Skills */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Sector & Domain Skills ({sector})
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((sk) => (
                <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium">
                  {sk}
                  <button type="button" onClick={() => setSkills(skills.filter(s => s !== sk))} className="hover:text-brand-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">Add</button>
            </form>
          </div>

          {/* Specified Software Tools */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-brand-700" />
              Specified Software for Job Roles
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {softwareTools.map((sw) => (
                <span key={sw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
                  {sw}
                  <button type="button" onClick={() => setSoftwareTools(softwareTools.filter(s => s !== sw))} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSoftware} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SAP S/4HANA, Docker, AutoCAD..."
                value={newSoftware}
                onChange={(e) => setNewSoftware(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">Add</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
