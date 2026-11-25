"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Shield, 
  User as UserIcon, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut, 
  CheckSquare,
  FileText,
  Search,
  Building2,
  SlidersHorizontal
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { User } from "@/types";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(apiClient.getUser());
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-800 transition-colors">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Luxmaan<span className="text-brand-700">Jobs</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                  DE / EU
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                European Career & Job Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin' ? (
              <>
                <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-300 transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-brand-700" />
                  <span>Admin Console</span>
                </Link>
                <Link href="/candidate/jobs" className="hover:text-brand-700 transition-colors">
                  Live Jobs
                </Link>
              </>
            ) : currentUser ? (
              <>
                <Link href="/candidate/jobs" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>Jobs</span>
                </Link>
                <Link href="/candidate/matches" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>My Matches</span>
                </Link>
                <Link href="/candidate/applications" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  <span>Tracker</span>
                </Link>
                <Link href="/candidate/resumes" className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>My CV</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/candidate/jobs" className="hover:text-brand-700 transition-colors">
                  Search Jobs
                </Link>
                <Link href="/candidate/matches" className="hover:text-brand-700 transition-colors">
                  Job Matcher
                </Link>
                <Link href="/features" className="hover:text-brand-700 transition-colors">
                  How It Works
                </Link>
                <Link href="/pricing" className="hover:text-brand-700 transition-colors">
                  Employers
                </Link>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? (
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Administrator</span>
                  </span>
                ) : (
                  <Link
                    href="/candidate/profile"
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 transition-colors border border-slate-200"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-brand-700" />
                    <span>{currentUser.firstName} {currentUser.lastName?.[0]}.</span>
                  </Link>
                )}

                <Link
                  href={currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? "/admin/dashboard" : "/candidate/dashboard"}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <span>{currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? "Dashboard" : "Candidate Hub"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 hover:text-brand-700 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <span>Post CV / Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/candidate/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            Search Jobs
          </Link>
          <Link
            href="/candidate/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            CV Matcher
          </Link>
          <Link
            href="/candidate/applications"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            Application Tracker
          </Link>
          <Link
            href="/candidate/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 py-2"
          >
            Candidate Hub
          </Link>
          {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-brand-700 py-2"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <div className="text-xs text-slate-500 font-semibold px-1">
                  Signed in as {currentUser.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-700 rounded-lg shadow-sm"
                >
                  Upload CV & Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
