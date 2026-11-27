"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Plus, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Sparkles, 
  X,
  Loader2,
  DollarSign
} from "lucide-react";
import { JobApplication, ApplicationStatus } from "@/types";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

const COLUMNS: { status: ApplicationStatus; title: string; color: string; badgeBg: string; border: string }[] = [
  { status: "Interested", title: "Interested / Shortlist", color: "text-blue-700", badgeBg: "bg-blue-50 text-blue-700 border-blue-200", border: "border-blue-200" },
  { status: "Applied", title: "Applied", color: "text-amber-700", badgeBg: "bg-amber-50 text-amber-700 border-amber-200", border: "border-amber-200" },
  { status: "Interview", title: "Interviewing", color: "text-purple-700", badgeBg: "bg-purple-50 text-purple-700 border-purple-200", border: "border-purple-200" },
  { status: "Offer", title: "Offer Received", color: "text-emerald-700", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-emerald-200" },
  { status: "Rejected", title: "Archived / Rejected", color: "text-slate-600", badgeBg: "bg-slate-100 text-slate-600 border-slate-200", border: "border-slate-200" }
];

export default function ApplicationsTrackerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding a new application
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("Frankfurt am Main, Germany");
  const [newSalary, setNewSalary] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("Applied");
  const [newNotes, setNewNotes] = useState("");
  const [newInterviewDate, setNewInterviewDate] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      const list = await apiClient.getApplications();
      setApplications(list);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (appId: string, nextStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: nextStatus, updatedAt: new Date().toISOString() } : a));
    try {
      await apiClient.updateApplication(appId, { status: nextStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      loadApplications();
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this job from your tracker?")) return;
    setApplications(prev => prev.filter(a => a.id !== appId));
    try {
      await apiClient.deleteApplication(appId);
    } catch (err) {
      console.error("Failed to delete", err);
      loadApplications();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.createApplication({
        jobTitle: newTitle.trim(),
        companyName: newCompany.trim(),
        locationCity: newLocation.trim() || undefined,
        salary: newSalary.trim() || undefined,
        applicationUrl: newUrl.trim() || undefined,
        status: newStatus,
        notes: newNotes.trim() || undefined,
        interviewDate: newInterviewDate || undefined
      });

      if (res.success && res.data) {
        setApplications(prev => [res.data!, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewCompany("");
        setNewSalary("");
        setNewUrl("");
        setNewNotes("");
        setNewInterviewDate("");
      }
    } catch (err) {
      console.error("Failed to create application", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Status index helper for next/prev movement
  const statusOrder: ApplicationStatus[] = ["Interested", "Applied", "Interview", "Offer", "Rejected"];

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = statusOrder.indexOf(current);
    return idx >= 0 && idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
  };

  const getPrevStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = statusOrder.indexOf(current);
    return idx > 0 ? statusOrder[idx - 1] : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>PRD Section 5.9 Application Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            {t.tracker_title}
          </h1>
          <p className="text-sm text-slate-600">
            {t.tracker_sub}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.tracker_add_btn}</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Tracked</div>
          <div className="text-2xl font-black text-slate-900">{applications.length}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Applied</div>
          <div className="text-2xl font-black text-amber-600">
            {applications.filter(a => a.status === 'Applied').length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Interviews Scheduled</div>
          <div className="text-2xl font-black text-purple-600">
            {applications.filter(a => a.status === 'Interview').length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Offers Received</div>
          <div className="text-2xl font-black text-emerald-600">
            {applications.filter(a => a.status === 'Offer').length}
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
          <p className="text-xs font-semibold text-slate-500">Loading your applications...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map(col => {
            const colApps = applications.filter(a => a.status === col.status);
            return (
              <div 
                key={col.status} 
                className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.badgeBg.split(' ')[0]}`} />
                    <span className="text-xs font-bold text-slate-800">{col.title}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-3">
                  {colApps.length === 0 ? (
                    <div className="py-10 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No jobs in this stage
                    </div>
                  ) : (
                    colApps.map(app => (
                      <div 
                        key={app.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 shadow-2xs hover:shadow-sm transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 leading-tight">
                              {app.jobTitle}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold mt-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{app.companyName}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove from tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Location & Salary Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {app.locationCity && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{app.locationCity}</span>
                            </span>
                          )}
                          {app.salary && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold">
                              <span>{app.salary}</span>
                            </span>
                          )}
                        </div>

                        {/* Interview Date Pill */}
                        {app.interviewDate && (
                          <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-[10px] text-purple-800 font-semibold flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-purple-600" />
                            <span>Interview: {new Date(app.interviewDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {app.notes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg line-clamp-2 leading-relaxed">
                            {app.notes}
                          </p>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {app.applicationUrl ? (
                            <a 
                              href={app.applicationUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                              <span>Posting</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : <span />}

                          {/* Quick Stage Shifters */}
                          <div className="flex items-center gap-1">
                            {getPrevStatus(app.status) && (
                              <button
                                onClick={() => handleStatusChange(app.id, getPrevStatus(app.status)!)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                                title={`Move back to ${getPrevStatus(app.status)}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {getNextStatus(app.status) && (
                              <button
                                onClick={() => handleStatusChange(app.id, getNextStatus(app.status)!)}
                                className="p-1 hover:bg-brand-50 rounded text-brand-600 hover:text-brand-700 transition-colors"
                                title={`Advance to ${getNextStatus(app.status)}`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Application */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <span>Track Job Opportunity</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Project Manager"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lufthansa Group"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Frankfurt am Main"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Salary Band</label>
                  <input
                    type="text"
                    placeholder="e.g. €80,000 - €95,000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tracker Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50"
                  >
                    <option value="Interested">📌 Interested / Shortlist</option>
                    <option value="Applied">📤 Applied</option>
                    <option value="Interview">💼 Interview</option>
                    <option value="Offer">🎉 Offer Received</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Interview Date (optional)</label>
                  <input
                    type="date"
                    value={newInterviewDate}
                    onChange={(e) => setNewInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Job URL / Application Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Personal Notes / Next Steps</label>
                <textarea
                  rows={2}
                  placeholder="Notes about interview prep, recruiter contacts, or referral..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
