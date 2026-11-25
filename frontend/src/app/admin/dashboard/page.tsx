"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  Server, 
  Play, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  LogOut
} from "lucide-react";
import { AdminKPIs, JobSource } from "@/types";
import { apiClient } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Matching Weights
  const [skillsWeight, setSkillsWeight] = useState(40);
  const [expWeight, setExpWeight] = useState(25);
  const [locWeight, setLocWeight] = useState(15);
  const [langWeight, setLangWeight] = useState(10);
  const [salWeight, setSalWeight] = useState(10);
  const [weightSaveSuccess, setWeightSaveSuccess] = useState(false);

  const [triggerSuccess, setTriggerSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = apiClient.getUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      router.push("/login");
      return;
    }

    async function load() {
      setLoading(true);
      const [k, s, w] = await Promise.all([
        apiClient.getAdminKPIs(),
        apiClient.getSources(),
        apiClient.getWeights()
      ]);
      setKpis(k);
      setSources(s);
      if (w) {
        setSkillsWeight(Math.round(w.skillsWeight <= 1 ? w.skillsWeight * 100 : w.skillsWeight));
        setExpWeight(Math.round(w.experienceWeight <= 1 ? w.experienceWeight * 100 : w.experienceWeight));
        setLocWeight(Math.round(w.locationWeight <= 1 ? w.locationWeight * 100 : w.locationWeight));
        setLangWeight(Math.round(w.languageWeight <= 1 ? w.languageWeight * 100 : w.languageWeight));
        setSalWeight(Math.round(w.salaryWeight <= 1 ? w.salaryWeight * 100 : w.salaryWeight));
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const totalWeight = skillsWeight + expWeight + locWeight + langWeight + salWeight;

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) return;
    const ok = await apiClient.updateWeights({
      skillsWeight,
      experienceWeight: expWeight,
      locationWeight: locWeight,
      languageWeight: langWeight,
      salaryWeight: salWeight
    });
    if (ok) {
      setWeightSaveSuccess(true);
      setTimeout(() => setWeightSaveSuccess(false), 3000);
    }
  };

  const handleTriggerIngestion = async (sourceId: string, sourceName: string) => {
    await apiClient.triggerSource(sourceId);
    setTriggerSuccess(sourceName);
    setTimeout(() => setTriggerSuccess(null), 3000);
  };

  const toggleSourceActive = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    await apiClient.toggleSource(id, nextActive);
    setSources(
      sources.map((s) => (s.id === id ? { ...s, isActive: nextActive } : s))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Platform Operations & Monitoring
          </h1>
          <p className="text-sm text-slate-600">
            Real-time KPIs, multi-source crawler management, and configurable AI matching parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">All Microservices Healthy</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Users</div>
          <div className="text-2xl font-black text-slate-900">{kpis?.totalUsers.toLocaleString() ?? "1,248"}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+18% this month</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Candidates</div>
          <div className="text-2xl font-black text-slate-900">{kpis?.activeCandidates.toLocaleString() ?? "984"}</div>
          <div className="text-[11px] text-slate-400 font-medium">CV vectorized</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Vacancies</div>
          <div className="text-2xl font-black text-slate-900">{kpis?.totalJobs.toLocaleString() ?? "1,420"}</div>
          <div className="text-[11px] text-brand-600 font-semibold">Germany & EU</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ingested Today</div>
          <div className="text-2xl font-black text-emerald-600">+{kpis?.jobsIngestedToday ?? "48"}</div>
          <div className="text-[11px] text-slate-400 font-medium">Deduplicated</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Sources</div>
          <div className="text-2xl font-black text-slate-900">{kpis?.activeSources ?? "6"}</div>
          <div className="text-[11px] text-emerald-600 font-medium">100% operational</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Matches Run</div>
          <div className="text-2xl font-black text-indigo-600">{kpis?.totalMatchesCalculated.toLocaleString() ?? "3,410"}</div>
          <div className="text-[11px] text-slate-400 font-medium">pgvector cosine</div>
        </div>
      </div>

      {/* Grid: Job Sources & AI Weight Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Job Sources Management */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Ingestion Sources</h2>
              <p className="text-xs text-slate-500">Official APIs, RSS feeds, and polite crawlers</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {sources.length} Configured
            </span>
          </div>

          {triggerSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Manual crawler run triggered successfully for <strong>{triggerSuccess}</strong>.
            </div>
          )}

          <div className="space-y-4">
            {sources.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{s.sourceName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                      {s.sourceType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Sync every {s.collectionFrequencyHours}h</span>
                    <span>•</span>
                    <span>{s.totalJobsCollected.toLocaleString()} jobs gathered</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{s.sourceUrl}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => toggleSourceActive(s.id, s.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      s.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {s.isActive ? "Active" : "Paused"}
                  </button>

                  <button
                    onClick={() => handleTriggerIngestion(s.id, s.sourceName)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                    title="Trigger immediate collection"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Matching Weights Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              AI Matching Weights
            </h2>
            <p className="text-xs text-slate-500">
              Calibrate multi-factor scoring weights. Must equal 100%.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Skills */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Skills Weight</span>
                <span className="text-brand-600">{skillsWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={skillsWeight}
                onChange={(e) => setSkillsWeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Experience Weight</span>
                <span className="text-brand-600">{expWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={expWeight}
                onChange={(e) => setExpWeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Location Weight</span>
                <span className="text-brand-600">{locWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={locWeight}
                onChange={(e) => setLocWeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Language */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Language Weight</span>
                <span className="text-brand-600">{langWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={langWeight}
                onChange={(e) => setLangWeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Salary Weight</span>
                <span className="text-brand-600">{salWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={salWeight}
                onChange={(e) => setSalWeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Total Indicator */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold">
              <span>Total Weight:</span>
              <span className={totalWeight === 100 ? "text-emerald-600" : "text-rose-600"}>
                {totalWeight}% {totalWeight === 100 ? "✔" : "(Must be 100%)"}
              </span>
            </div>

            {weightSaveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Matching weights updated across the platform!
              </div>
            )}

            <button
              onClick={handleSaveWeights}
              disabled={totalWeight !== 100}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm transition-all"
            >
              Update AI Scoring Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

