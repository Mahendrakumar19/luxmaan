"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  FileText, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Building2,
  MapPin,
  Loader2,
  LogIn
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { CandidateProfile, JobMatch, User, CredibilityRoleScore } from "@/types";
import { useLanguage } from "@/lib/i18n";

export default function CandidateDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [credibility, setCredibility] = useState<{ overallScore: number; roleScores: CredibilityRoleScore[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = apiClient.getUser();
      setCurrentUser(user);

      try {
        const [profData, matchData, credData] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getMatches(),
          apiClient.getCredibilityScore()
        ]);
        setProfile(profData);
        setMatches(matchData || []);
        if (credData) {
          setCredibility({ overallScore: credData.overallScore, roleScores: credData.roleScores });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Candidate";

  const headline = profile?.headline && profile.headline.trim() 
    ? profile.headline 
    : "Headline not set yet";
  const location = profile?.currentLocation && profile.currentLocation.trim() 
    ? profile.currentLocation 
    : "Location not set";
  const experience = (profile?.yearsOfExperience !== undefined && profile?.yearsOfExperience !== null && profile.yearsOfExperience > 0)
    ? `${profile.yearsOfExperience} years` 
    : "Not specified";
  const skills = profile?.skills || [];

  const languages = profile?.languages && profile.languages.length > 0
    ? profile.languages.map(l => `${l.lang} (${l.level})`).join(", ")
    : "Not specified";

  // Dynamic completeness calculation
  let completeness = 10;
  if (profile?.headline && profile.headline.trim()) completeness += 20;
  if (profile?.skills && profile.skills.length >= 1) completeness += Math.min(30, profile.skills.length * 10);
  if (profile?.currentLocation && profile.currentLocation.trim()) completeness += 15;
  if (profile?.yearsOfExperience && profile.yearsOfExperience > 0) completeness += 15;
  if (profile?.languages && profile.languages.length >= 1) completeness += 10;
  completeness = Math.min(100, Math.max(10, completeness));

  const recentMatches = matches.slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Loading your candidate dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Unauthenticated notice banner if user is viewing without logging in */}
      {!currentUser && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Viewing in guest mode:</span>
            <span>Sign in to save your verified profile, upload resumes, and synchronize AI matching.</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In Now
          </Link>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-8 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-700/50 text-brand-200 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t.dash_welcome}, {displayName}
          </h1>
          <p className="text-sm text-brand-200 max-w-xl">
            {t.dash_subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/candidate/resumes"
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-brand-600" />
            {t.dash_manage_cv}
          </Link>
          <Link
            href="/candidate/profile"
            className="px-4 py-2.5 bg-brand-700/60 hover:bg-brand-700 text-white border border-brand-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            {t.dash_edit_profile}
          </Link>
        </div>
      </div>

      {/* Grid: Profile Snapshot & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Profile Snapshot</h2>
            <Link href="/candidate/profile" className="text-xs font-semibold text-brand-600 hover:underline">
              Edit
            </Link>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Completeness</span>
              <span className="text-brand-600">{completeness}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 divide-y divide-slate-100">
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Headline</span>
              <span className="text-slate-800 font-semibold">{headline}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Location</span>
              <span className="text-slate-800 font-semibold">{location}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Experience</span>
              <span className="text-slate-800 font-semibold">{experience}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-medium">Languages</span>
              <span className="text-slate-800 font-semibold">{languages}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-700 block">Verified Skills ({skills.length})</span>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills added yet. Add skills in Edit Profile or upload a resume.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* GDPR link */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/candidate/settings"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Privacy & Consent Settings (GDPR)</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Credibility Score & Top Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Credibility Score Card */}
          {credibility && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Role Credibility Score</h2>
                  <p className="text-xs text-slate-500">
                    Calculated from career preferences, European location, past roles, skills & certifications
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">Overall Index</span>
                  <span className="text-2xl font-black text-brand-700">{credibility.overallScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credibility.roleScores.map((rs) => (
                  <div key={rs.role} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{rs.role}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                        {rs.score}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600">
                      <div className="bg-white px-2 py-1 rounded border border-slate-200 text-center">
                        <span className="block text-slate-400">Skills</span>
                        <span className="font-bold text-slate-800">{rs.skillsMatch}%</span>
                      </div>
                      <div className="bg-white px-2 py-1 rounded border border-slate-200 text-center">
                        <span className="block text-slate-400">Location</span>
                        <span className="font-bold text-slate-800">{rs.locationMatch}%</span>
                      </div>
                      <div className="bg-white px-2 py-1 rounded border border-slate-200 text-center">
                        <span className="block text-slate-400">Prefs</span>
                        <span className="font-bold text-slate-800">{rs.preferenceMatch}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Top Role Matches</h2>
              <p className="text-xs text-slate-500">Ranked by skills, qualifications, location & salary fit</p>
            </div>
            <Link
              href="/candidate/matches"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All Matches ({matches.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMatches.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                No active matches found. Add your skills in Edit Profile or upload a CV to calculate AI matches.
              </div>
            ) : (
              recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        {Math.round(m.overallMatchScore)}% Match
                      </span>
                      {m.salaryMin && (
                        <span className="text-xs font-semibold text-emerald-700">
                          €{Math.round(m.salaryMin / 1000)}k - €{Math.round((m.salaryMax || m.salaryMin) / 1000)}k
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{m.jobTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5" />
                        {m.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {m.locationCity || "Germany"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/candidate/matches"
                    className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 bg-slate-100/70 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/candidate/jobs"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors space-y-1 block shadow-sm"
            >
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                Explore All Jobs
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-500">Search thousands of open tech positions across Germany.</p>
            </Link>

            <Link
              href="/candidate/resumes"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors space-y-1 block shadow-sm"
            >
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                Upload New Resume
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-500">Extract skills with multilingual NLP parsing.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
