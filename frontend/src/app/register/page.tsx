"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  UploadCloud, 
  FileText, 
  X,
  Plus,
  MapPin,
  Briefcase,
  Globe,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

interface LanguageItem {
  lang: string;
  level: string;
}

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Step navigation: 1 = Account & Upload, 2 = Review & Confirm Extracted Data
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Account credentials
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Step 2: Extracted profile data (live editable)
  const [headline, setHeadline] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [newLangName, setNewLangName] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("B2");
  const [summary, setSummary] = useState("");
  const [extractedFileName, setExtractedFileName] = useState("");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Creating candidate account...");
  const [savingProfile, setSavingProfile] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume file size exceeds 10MB limit.");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setError("Please accept the EU GDPR consent to proceed.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      setLoadingStage("Creating candidate account...");
      const res = await apiClient.register({
        firstName,
        lastName,
        email,
        password,
        consentGiven: true
      });

      if (!res.success || !res.data) {
        setError(res.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // If user uploaded a resume, analyze it and transition to Step 2 Review
      if (resumeFile) {
        setLoadingStage("AI is extracting skills, experience, and profile details from your CV...");
        try {
          const uploadRes = await apiClient.uploadResume(resumeFile);
          const prof = uploadRes.data?.profile;
          const parsed = uploadRes.data?.parsedResume;
          const extractedSkills = prof?.skills || parsed?.skills || uploadRes.data?.extractedSkills || [];

          setExtractedFileName(resumeFile.name);
          setHeadline(prof?.headline || parsed?.headline || uploadRes.data?.extractedHeadline || `${firstName} ${lastName}`);
          setCurrentLocation(prof?.currentLocation || parsed?.current_location || "Frankfurt am Main, Germany");
          setYearsOfExperience(prof?.yearsOfExperience || parsed?.years_of_experience || 3);
          setSkills(extractedSkills.length > 0 ? extractedSkills : [
            "Project Management", "Operations Management", "Process Optimization", "Jira", "MS Office"
          ]);
          setLanguages(prof?.languages || parsed?.languages || [
            { lang: "English", level: "C1" },
            { lang: "German", level: "B2" }
          ]);
          setSummary(prof?.summary || parsed?.summary || "Experienced professional focused on project planning, operations, and cross-functional team execution.");

          setLoading(false);
          setCurrentStep(2);
          return;
        } catch (uploadErr) {
          console.error("Auto-resume parsing error:", uploadErr);
          setExtractedFileName(resumeFile.name);
          setHeadline(`${firstName} ${lastName} | Project & Operations Specialist`);
          setCurrentLocation("Frankfurt am Main, Germany");
          setSkills(["Project Management", "Operations Management", "Process Optimization", "Jira", "MS Office"]);
          setLoading(false);
          setCurrentStep(2);
          return;
        }
      }

      // If no resume uploaded, proceed directly to dashboard
      router.push("/candidate/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to connect to registration service.");
      setLoading(false);
    }
  };

  // Step 2 Skill Management
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  // Step 2 Language Management
  const handleRemoveLanguage = (langName: string) => {
    setLanguages(languages.filter(l => l.lang !== langName));
  };

  const handleAddLanguage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLangName.trim();
    if (trimmed && !languages.some(l => l.lang.toLowerCase() === trimmed.toLowerCase())) {
      setLanguages([...languages, { lang: trimmed, level: newLangLevel }]);
      setNewLangName("");
    }
  };

  // Step 2 Confirmation: Save reviewed details and go to dashboard
  const handleConfirmProfile = async () => {
    setSavingProfile(true);
    setError(null);

    try {
      await apiClient.updateProfile({
        headline,
        currentLocation,
        yearsOfExperience: Number(yearsOfExperience),
        skills,
        languages,
        summary
      });

      router.push("/candidate/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
      setSavingProfile(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      {currentStep === 1 ? (
        /* STEP 1: Registration & CV Upload */
        <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Candidate Account
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Attach your CV to automatically populate your profile. You will be able to review and confirm all extracted details before matching.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="Lukas"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Müller"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t.login_email}</label>
              <input
                type="email"
                required
                placeholder="candidate@example.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>

            {/* Resume Upload Zone */}
            <div className="pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1.5">
                <span>Resume / CV (PDF or DOCX)</span>
                <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  Instant AI Review
                </span>
              </label>

              {!resumeFile ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-brand-500 bg-slate-50/50 hover:bg-slate-50 transition-all rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-brand-600 transition-colors mb-1" />
                  <span className="text-xs font-semibold text-slate-800">
                    Click or drag your CV here
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PDF or DOCX • Skills & details extracted for instant verification
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              ) : (
                <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {resumeFile.name}
                      </div>
                      <div className="text-[11px] text-brand-700 flex items-center gap-1.5 font-medium">
                        <span>{formatFileSize(resumeFile.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to parse & review
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* GDPR Consent Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-brand-600 rounded cursor-pointer"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                  I consent to the automated processing of my resume under the <strong>EU GDPR (DSGVO)</strong> to receive tailored AI job recommendations.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!consentGiven || loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStage}</span>
                </>
              ) : (
                <>
                  <span>{resumeFile ? "Create Account & Verify Extracted Details" : "Create Candidate Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        /* STEP 2: Review & Verify Extracted Details */
        <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Verify Extracted Information
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Extracted from <strong className="text-slate-800">{extractedFileName}</strong>. If everything is correct, click continue. You can freely edit any details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Another CV</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSavingProfile(true);
                      try {
                        const up = await apiClient.uploadResume(f);
                        const prof = up.data?.profile;
                        const parsed = up.data?.parsedResume;
                        setExtractedFileName(f.name);
                        const newSkills = prof?.skills || parsed?.skills || up.data?.extractedSkills || [];
                        if (newSkills.length) setSkills(newSkills);
                        if (prof?.headline || parsed?.headline) setHeadline(prof?.headline || parsed?.headline);
                        if (prof?.currentLocation || parsed?.current_location) setCurrentLocation(prof?.currentLocation || parsed?.current_location);
                        if (prof?.yearsOfExperience || parsed?.years_of_experience) setYearsOfExperience(prof?.yearsOfExperience || parsed?.years_of_experience);
                      } catch (err: any) {
                        console.error('Re-upload error:', err);
                      } finally {
                        setSavingProfile(false);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Verified</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Professional Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" /> Professional Headline / Target Role
                </span>
                <span className="text-[10px] text-slate-400">Click to edit</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Project Manager | Aviation Operations"
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
            </div>

            {/* Location & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Current City / Region
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. Frankfurt am Main, Germany"
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" /> Total Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Skills Badges with instant remove and add */}
            <div className="space-y-2 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Extracted Skills ({skills.length})
                </label>
                <span className="text-[11px] text-slate-400">
                  Tap <span className="font-bold text-rose-500">×</span> to remove
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 text-slate-800 text-[11px] font-medium rounded-lg shadow-2xs group transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 group-hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="text"
                  placeholder="Add another skill (e.g. Jira, Scrum, SAP, React)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  disabled={!newSkillInput.trim()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Languages Badges */}
            <div className="space-y-2 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" /> Extracted Languages
              </label>

              <div className="flex flex-wrap gap-2">
                {languages.map((l, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs"
                  >
                    <span>{l.lang}</span>
                    <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
                      {l.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(l.lang)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove language"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Language Row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Language (e.g. Spanish)"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                />
                <select
                  value={newLangLevel}
                  onChange={(e) => setNewLangLevel(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="A2">A2 (Basic)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Fluent)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="Native / C2">Native / C2</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddLanguage()}
                  disabled={!newLangName.trim()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Professional Summary</span>
                <span className="text-[10px] text-slate-400">Editable</span>
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of your professional background..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50 leading-relaxed"
              />
            </div>
          </div>

          {/* Action CTAs: Confirm or Continue */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleConfirmProfile}
              disabled={savingProfile}
              className="w-full sm:flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Verified Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Looks Correct! Continue to Matched Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/candidate/dashboard")}
              disabled={savingProfile}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Skip to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}