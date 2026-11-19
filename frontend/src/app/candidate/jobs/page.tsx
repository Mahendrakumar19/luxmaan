"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Building2, 
  Briefcase, 
  Euro, 
  Globe, 
  Bookmark, 
  ExternalLink, 
  Check, 
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { Job } from "@/types";
import { apiClient } from "@/lib/api";
import { formatSalary, formatDate } from "@/lib/utils";

function JobSearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialLoc = searchParams.get("location") || "";

  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLoc);
  const [workplaceType, setWorkplaceType] = useState<string>("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    const data = await apiClient.getJobs({
      q: q || undefined,
      location: location || undefined,
      workplaceType: workplaceType !== "All" ? workplaceType : undefined
    });
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [workplaceType]);

  const toggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Jobs in Germany & EU
        </h1>
        <p className="text-slate-600 text-sm">
          Discover verified vacancies aggregated from official job boards, APIs, and company career portals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, skills or company..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="City (e.g. Berlin, Munich)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchJobs}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-sm"
            >
              Filter Results
            </button>
          </div>
        </div>

        {/* Workplace pill toggles */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="font-medium text-slate-500 mr-2">Workplace:</span>
          {["All", "Remote", "Hybrid", "OnSite"].map((type) => (
            <button
              key={type}
              onClick={() => setWorkplaceType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                workplaceType === type
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "OnSite" ? "On-Site" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing <strong>{jobs.length}</strong> available positions</span>
        <span className="text-xs">Sorted by recent ingestion</span>
      </div>

      {/* Job Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading open positions...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No jobs match your search criteria.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg flex-shrink-0">
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.locationCity}, {job.locationCountry}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700 border border-slate-200">
                          {job.workplaceType}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSaved
                          ? "bg-amber-50 border-amber-300 text-amber-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                      title={isSaved ? "Saved" : "Save job"}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      Apply on Employer Site
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
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading job search...</p>
      </div>
    }>
      <JobSearchContent />
    </Suspense>
  );
}

