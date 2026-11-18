"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Building2, 
  MapPin, 
  Euro, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Sliders
} from "lucide-react";
import { JobMatch } from "@/types";
import { apiClient } from "@/lib/api";
import { formatSalary } from "@/lib/utils";

export default function MatchesPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>("match-1");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await apiClient.getMatches();
      setMatches(data);
      setLoading(false);
    }
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Semantic Matching Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Job Matches
          </h1>
          <p className="text-sm text-slate-600">
            Ranked via 384-dimensional multilingual vector embeddings and weighted compatibility rules.
          </p>
        </div>

        {/* Weights pill badge */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Scoring Model:</span>
          <span>Skills 40%</span>
          <span>•</span>
          <span>Exp 25%</span>
          <span>•</span>
          <span>Loc 15%</span>
          <span>•</span>
          <span>Lang 10%</span>
          <span>•</span>
          <span>Salary 10%</span>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Computing neural semantic compatibility...</div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No matches found. Upload your CV to trigger semantic recommendations.</p>
          </div>
        ) : (
          matches.map((m) => {
            const isExpanded = expandedMatchId === m.id;
            const isHighMatch = m.overallMatchScore >= 85;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Main Card Bar */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Job & Company info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-extrabold text-slate-700 text-xl flex-shrink-0">
                      {m.companyName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{m.jobTitle}</h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {m.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {m.locationCity} ({m.workplaceType})
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {formatSalary(m.salaryMin, m.salaryMax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Ring & Action */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Compatibility
                      </div>
                      <div
                        className={`text-2xl font-black ${
                          isHighMatch ? "text-emerald-600" : "text-brand-600"
                        }`}
                      >
                        {m.overallMatchScore}%
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(m.id)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title={isExpanded ? "Collapse explanation" : "View explainable AI breakdown"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <a
                      href="#"
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      Apply Now
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Explainable AI Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-6">
                    {/* Natural language summary alert */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-900">
                          Why this job is recommended for you
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {m.explanation.summary}
                        </p>
                      </div>
                    </div>

                    {/* Sub-Score Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Skills (40%)</div>
                        <div className="text-base font-bold text-slate-900">{m.scores.skillsScore}%</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Experience (25%)</div>
                        <div className="text-base font-bold text-slate-900">{m.scores.experienceScore}%</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Location (15%)</div>
                        <div className="text-base font-bold text-slate-900">{m.scores.locationScore}%</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Language (10%)</div>
                        <div className="text-base font-bold text-slate-900">{m.scores.languageScore}%</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Salary (10%)</div>
                        <div className="text-base font-bold text-slate-900">{m.scores.salaryScore}%</div>
                      </div>
                    </div>

                    {/* Matched vs Missing Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matched */}
                      <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Matched Skills ({m.matchingSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.matchingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1">
                          {m.explanation.skillsNote}
                        </p>
                      </div>

                      {/* Missing / Skill Gaps */}
                      <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Identified Skill Gaps ({m.missingSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.missingSkills.length > 0 ? (
                            m.missingSkills.map((s) => (
                              <span
                                key={s}
                                className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None! You possess all required technical skills.</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1">
                          {m.missingSkills.length > 0 ? "Familiarity with these technologies can boost your candidacy." : "100% skill requirement fulfillment."}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Notes Breakdown */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                      <div className="font-semibold text-slate-900 text-xs mb-2">Detailed Compatibility Assessment:</div>
                      <div>• <strong>Experience:</strong> {m.explanation.experienceNote}</div>
                      <div>• <strong>Location:</strong> {m.explanation.locationNote}</div>
                      <div>• <strong>Languages:</strong> {m.explanation.languageNote}</div>
                      <div>• <strong>Compensation:</strong> {m.explanation.salaryNote}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

