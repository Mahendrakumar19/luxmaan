"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Download, 
  AlertCircle,
  Eye,
  Loader2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Resume } from "@/types";

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchResumes = async () => {
    try {
      const list = await apiClient.getResumes();
      setResumes(list || []);
    } catch (err) {
      console.error("Failed to load resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage("");
    setUploadSuccess(false);

    try {
      const res = await apiClient.uploadResume(file);
      if (res.success) {
        setUploadSuccess(true);
        await fetchResumes();
        setTimeout(() => setUploadSuccess(false), 5000);
      } else {
        setErrorMessage(res.message || "Failed to upload resume");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error during upload");
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = "";
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? Under GDPR Article 17, it will be permanently erased.")) {
      return;
    }

    const success = await apiClient.deleteResume(id);
    if (success) {
      setResumes(resumes.filter((r) => r.id !== id));
    } else {
      alert("Failed to delete resume");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "250 KB";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Resume & CV Manager
        </h1>
        <p className="text-sm text-slate-600">
          Upload your resume in PDF or DOCX format for automated multilingual parsing and semantic vector extraction.
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 transition-colors text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-1">
          <div className="text-base font-bold text-slate-800">
            {isUploading ? "Uploading & parsing resume with multilingual AI..." : "Upload your resume (PDF or DOCX)"}
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Maximum file size: 10MB. Files are encrypted at rest in Frankfurt (AWS `eu-central-1`) and strictly processed under GDPR.
          </p>
        </div>

        <div className="pt-2">
          <label className={`inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <span>{isUploading ? "Processing..." : "Browse Computer"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Resume parsed and skills synchronized with your profile!
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </div>
        )}
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Uploaded Resumes</h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading uploaded resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No resumes uploaded yet. Upload a CV to get started.
          </div>
        ) : (
          resumes.map((r) => (
            <div
              key={r.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{r.fileName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{formatFileSize(r.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(r.createdAt)}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                        {r.status || "Completed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleDeleteResume(r.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete resume (GDPR Erasure)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
