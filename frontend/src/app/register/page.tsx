"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Loader2, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { apiClient } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Creating candidate account...");

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

  const handleRegister = async (e: React.FormEvent) => {
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

      // If user uploaded a resume, analyze and synchronize it immediately
      if (resumeFile) {
        setLoadingStage("Parsing resume with multilingual AI & auto-configuring profile...");
        try {
          await apiClient.uploadResume(resumeFile);
        } catch (uploadErr) {
          console.error("Auto-resume parsing error:", uploadErr);
          // Non-blocking: continue to dashboard even if upload had a minor glitch
        }
      }

      router.push("/candidate/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to connect to registration service.");
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Candidate Account
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your CV during registration to automatically configure your profile and instantly unlock verified AI job recommendations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
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

          {/* Quick Resume Upload Zone (Auto-Fill Profile) */}
          <div className="pt-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1.5">
              <span>Resume / CV (PDF or DOCX)</span>
              <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Auto-Fills Profile
              </span>
            </label>

            {!resumeFile ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-brand-500 bg-slate-50/50 hover:bg-slate-50 transition-all rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-brand-600 transition-colors mb-1" />
                <span className="text-xs font-semibold text-slate-800">
                  Click to attach your resume
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PDF or DOCX (Skills, experience & location extracted automatically)
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
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI parsing
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
                I consent to the automated processing of my resume under the <strong>EU GDPR (DSGVO)</strong> to receive tailored AI job recommendations and agree to the <strong>Terms of Service</strong>.
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
                <span>{resumeFile ? "Register & Auto-Fill Profile" : "Register Candidate Profile"}</span>
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
    </div>
  );
}
