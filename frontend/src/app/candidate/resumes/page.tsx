"use client";

import { useState } from "react";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Download, 
  AlertCircle,
  Eye
} from "lucide-react";

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState([
    {
      id: "res-1",
      fileName: "Lukas_Mueller_CV_Senior_Engineer.pdf",
      fileSize: "245 KB",
      uploadedAt: "18 Nov 2026",
      status: "Completed",
      extractedHeadline: "Senior Cloud & Full-Stack Engineer",
      extractedSkills: ["C#", ".NET", "ASP.NET Core", "React", "TypeScript", "Docker", "PostgreSQL"],
      extractedExperience: "6.0 years",
      languages: "German (C1), English (Fluent)"
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      const newResume = {
        id: `res-${Date.now()}`,
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        uploadedAt: "Just now",
        status: "Completed",
        extractedHeadline: "Software Professional",
        extractedSkills: ["C#", ".NET", "Kubernetes", "AWS", "Python"],
        extractedExperience: "5.0 years",
        languages: "German (B2), English (Fluent)"
      };
      setResumes([newResume, ...resumes]);
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1500);
  };

  const deleteResume = (id: string) => {
    setResumes(resumes.filter((r) => r.id !== id));
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
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-base font-bold text-slate-800">
            {isUploading ? "Parsing resume with multilingual AI..." : "Upload your resume (PDF or DOCX)"}
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Maximum file size: 10MB. Files are encrypted at rest in Frankfurt (AWS `eu-central-1`) and strictly processed under GDPR.
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all">
            <span>Browse Computer</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleSimulatedUpload}
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
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Uploaded Resumes</h2>

        {resumes.length === 0 ? (
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
                      <span>{r.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded {r.uploadedAt}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                        {r.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => deleteResume(r.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete resume (GDPR Erasure)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parsed Extraction Overview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  AI Extracted Insights
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>• <strong>Headline:</strong> {r.extractedHeadline}</div>
                  <div>• <strong>Estimated Tenure:</strong> {r.extractedExperience}</div>
                  <div>• <strong>Languages:</strong> {r.languages}</div>
                  <div>• <strong>Identified Skills:</strong> {r.extractedSkills.join(", ")}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
