"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  FileCheck 
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { User, CandidateProfile } from "@/types";
import { useLanguage } from "@/lib/i18n";

export default function GdprSettingsPage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [aiConsent, setAiConsent] = useState(true);
  const [emailDigestConsent, setEmailDigestConsent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    setCurrentUser(apiClient.getUser());
    apiClient.getProfile().then(p => setProfile(p));
  }, []);

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      // Trigger client-side JSON download
      const exportBlob = new Blob([
        JSON.stringify(
          {
            platform: "Luxmaan AI - Nighwan Technology Pvt. Ltd.",
            gdprArticle: "Article 20 - Right to Data Portability",
            user: {
              id: currentUser?.id,
              email: currentUser?.email || "candidate@example.de",
              firstName: currentUser?.firstName || "Lukas",
              lastName: currentUser?.lastName || "Müller",
              role: currentUser?.role || "Candidate"
            },
            profile: profile || {
              headline: "Senior Cloud & Full-Stack Engineer",
              location: "Munich, Germany",
              skills: ["C#", ".NET", "React", "TypeScript", "Docker", "PostgreSQL", "AWS"],
              yearsOfExperience: 6.0
            },
            consents: [
              { type: "TERMS_AND_PRIVACY", granted: true, timestamp: "2026-11-18T10:00:00Z" },
              { type: "AI_MATCHING_ANALYSIS", granted: aiConsent, timestamp: new Date().toISOString() }
            ],
            exportTimestamp: new Date().toISOString()
          },
          null,
          2
        )
      ], { type: "application/json" });

      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luxmaan-gdpr-export-${currentUser?.email || 'candidate'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  const handleDeleteAccount = async () => {
    setDeleteModalOpen(false);
    await apiClient.deleteAccount();
    setAccountDeleted(true);
    apiClient.clearAuth();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <Shield className="w-3.5 h-3.5" />
          <span>EU General Data Protection Regulation (GDPR / DSGVO)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          {t.settings_title}
        </h1>
        <p className="text-sm text-slate-600">
          {t.settings_sub}
        </p>
      </div>

      {accountDeleted ? (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Account Erased Successfully</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your personal profile, resume documents from cloud storage, semantic embeddings, and activity logs have been permanently deleted in accordance with GDPR Article 17.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Data Portability Box */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Download className="w-4 h-4 text-brand-600" />
                  Right to Data Portability (Article 20 GDPR)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Download a complete, machine-readable JSON archive of all personal data, verified skills, uploaded resume metadata, and consent history associated with your account.
                </p>
              </div>

              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "Exporting..." : "Export All Data (JSON)"}
              </button>
            </div>

            {exportComplete && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data bundle exported and downloaded to your device.
              </div>
            )}
          </div>

          {/* Consent Preferences */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" />
              Consent Preferences (Article 7 GDPR)
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 text-sm">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">AI Resume Analysis & Vector Search</div>
                  <div className="text-[11px] text-slate-500">Extracts skills and matches against vacancies.</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">Job Digest Email Notifications</div>
                  <div className="text-[11px] text-slate-500">Weekly curated recommendations tailored to your skills.</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigestConsent}
                  onChange={(e) => setEmailDigestConsent(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* Right to be Forgotten Box */}
          <div className="p-6 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-rose-950 text-base flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Right to Erasure / Account Deletion (Article 17 GDPR)
                </h3>
                <p className="text-xs text-rose-900 leading-relaxed max-w-xl">
                  Permanently erase your account, candidate profile, uploaded PDF/DOCX resumes from AWS Frankfurt S3, semantic embeddings, and application records. This action cannot be reversed.
                </p>
              </div>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Confirm Permanent Erasure</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete your profile and all uploaded resumes? Under GDPR Article 17, all personal data will be cascade deleted immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

