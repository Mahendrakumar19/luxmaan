"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Building2, 
  Bookmark, 
  ExternalLink, 
  FileText,
  Download,
  X,
  Loader2,
  CheckSquare,
  Wrench,
  Check
} from "lucide-react";
import { Job, TailoredDocument } from "@/types";
import { apiClient } from "@/lib/api";
import { formatSalary, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

function JobSearchContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialLoc = searchParams.get("location") || "";

  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLoc);
  const [workplaceType, setWorkplaceType] = useState<string>("All");
  const [sector, setSector] = useState<string>("All");
  const [experienceLevel, setExperienceLevel] = useState<string>("All");
  const [minSalary, setMinSalary] = useState<string>("");
  const [software, setSoftware] = useState<string>("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());

  // Tailored Document Modal state
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [tailoredDoc, setTailoredDoc] = useState<TailoredDocument | null>(null);
  const [docError, setDocError] = useState<string>("");

  const fetchJobs = async () => {
    setLoading(true);
    const data = await apiClient.getJobs({
      q: q || undefined,
      location: location || undefined,
      workplaceType: workplaceType !== "All" ? workplaceType : undefined,
      sector: sector !== "All" ? sector : undefined,
      experienceLevel: experienceLevel !== "All" ? experienceLevel : undefined,
      minSalary: minSalary || undefined,
      software: software || undefined
    });
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [workplaceType, sector, experienceLevel, minSalary]);

  const toggleSave = async (jobId: string) => {
    const isCurrentlySaved = savedJobIds.has(jobId);
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    if (isCurrentlySaved) {
      await apiClient.unsaveJob(jobId);
    } else {
      await apiClient.saveJob(jobId);
    }
  };

  const handleTrackJob = async (job: Job) => {
    const res = await apiClient.createApplication({
      jobId: job.id,
      companyName: job.companyName,
      jobTitle: job.title,
      locationCity: job.locationCity,
      salary: formatSalary(job.salaryMin, job.salaryMax),
      applicationUrl: job.applicationUrl,
      status: "Applied",
      appliedDate: new Date().toISOString()
    });
    if (res.success) {
      setTrackedJobIds((prev) => new Set(prev).add(job.id));
    }
  };

  const handleGenerateDocs = async (job: Job) => {
    setGeneratingJobId(job.id);
    setDocError("");
    const doc = await apiClient.generateTailoredDocument({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      locationCity: job.locationCity,
      requiredSkills: job.requiredSkills
    });
    setGeneratingJobId(null);
    if (doc) {
      setTailoredDoc(doc);
    } else {
      setDocError("Please sign in to generate tailored CV and Cover Letter documents.");
    }
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTailoredCvText = (doc: TailoredDocument) => {
    const lines = [
      `TAILORED CV VERSION — ${doc.jobTitle} at ${doc.companyName}`,
      `Generated: ${new Date(doc.generatedAt).toLocaleDateString()}`,
      `==================================================================`,
      ``,
      `EXECUTIVE SUMMARY`,
      doc.tailoredSummary,
      ``,
      `KEY MATCHING SKILLS & SOFTWARE`,
      doc.highlightedSkills.join(" • "),
      ``,
      `RELEVANT WORK EXPERIENCE`,
      ...doc.tailoredExperiences.flatMap(exp => [
        `${exp.jobRole} | ${exp.company} (${exp.companyType}) | ${exp.duration}`,
        ...exp.relevantResponsibilities.map(r => `  - ${r}`),
        ``
      ])
    ];
    return lines.join("\n");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.jobs_title}
        </h1>
        <p className="text-slate-600 text-sm">
          {t.jobs_subtitle}
        </p>
      </div>

      {docError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-center justify-between">
          <span>{docError}</span>
          <button onClick={() => setDocError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Optimised Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Role, skill, or company..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="City (Berlin, Munich...)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Software (SAP, Docker...)"
              value={software}
              onChange={(e) => setSoftware(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={fetchJobs}
            className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Search & Filter
          </button>
        </div>

        {/* Secondary Optimised Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="All">All Sectors</option>
              <option value="Software">IT & Software</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="Aviation">Aviation & Aerospace</option>
              <option value="Data">Data & AI</option>
              <option value="Operations">Logistics & Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="All">All Levels</option>
              <option value="Junior">Junior</option>
              <option value="MidLevel">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead / Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Min Salary (EUR)</label>
            <select
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="">Any Salary</option>
              <option value="60000">€60,000+</option>
              <option value="75000">€75,000+</option>
              <option value="90000">€90,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Workplace</label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="All">All Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="OnSite">On-Site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing <strong>{jobs.length}</strong> verified positions</span>
        <span className="text-xs">Multi-platform EU job aggregator</span>
      </div>

      {/* Job Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading open positions...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No jobs match your filter criteria.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const isTracked = trackedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg flex-shrink-0">
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 hover:text-brand-700 transition-colors">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.locationCity}, {job.locationCountry}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                          {job.workplaceType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 font-semibold text-brand-700 border border-blue-100">
                          {job.experienceLevel}
                        </span>
                        <span className="font-bold text-emerald-700">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                      title={isSaved ? "Saved" : "Save vacancy"}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleTrackJob(job)}
                      disabled={isTracked}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        isTracked
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {isTracked ? <Check className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                      <span>{isTracked ? "Tracked" : "Track"}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateDocs(job)}
                      disabled={generatingJobId === job.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {generatingJobId === job.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>Tailored CV & Cover</span>
                    </button>

                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Description snippet */}
                {job.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}

                {/* Skills tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  {job.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                  <span className="ml-auto text-[11px] text-slate-400">
                    Posted {formatDate(job.postedAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tailored CV & Cover Letter Modal */}
      {tailoredDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Tailored Application Documents
                </h3>
                <p className="text-xs text-slate-500">
                  Customised for <strong>{tailoredDoc.jobTitle}</strong> at <strong>{tailoredDoc.companyName}</strong>
                </p>
              </div>
              <button
                onClick={() => setTailoredDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Tailored CV Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">1. Tailored CV Summary & Highlights</span>
                  <button
                    onClick={() => downloadTextFile(`CV_${tailoredDoc.companyName.replace(/\s+/g, '_')}.txt`, formatTailoredCvText(tailoredDoc))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CV
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-slate-700 leading-relaxed">{tailoredDoc.tailoredSummary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoredDoc.highlightedSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Cover Letter Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">2. Tailored European Cover Letter</span>
                  <button
                    onClick={() => downloadTextFile(`CoverLetter_${tailoredDoc.companyName.replace(/\s+/g, '_')}.txt`, tailoredDoc.coverLetterText)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Cover Letter
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {tailoredDoc.coverLetterText}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading job search...</p>
      </div>
    }>
      <JobSearchContent />
    </Suspense>
  );
}
