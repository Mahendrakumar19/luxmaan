"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, Sparkles, Shield, User, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Nilam<span className="text-brand-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                Germany / EU
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/candidate/jobs" className="hover:text-brand-600 transition-colors">
              Find Jobs
            </Link>
            <Link href="/candidate/matches" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
              <Sparkles className="w-4 h-4 text-brand-600" />
              AI Matches
            </Link>
            <Link href="/features" className="hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-brand-600 transition-colors">
              Pricing
            </Link>
            <Link href="/admin/dashboard" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors text-xs font-semibold bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/candidate/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm transition-all shadow-brand-600/20"
            >
              Candidate Hub
              <ArrowRight className="w-4 h-4" />
            </Link>
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
            className="block text-base font-medium text-slate-700 py-2"
          >
            Find Jobs
          </Link>
          <Link
            href="/candidate/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-600 py-2"
          >
            AI Matches
          </Link>
          <Link
            href="/candidate/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-2"
          >
            Candidate Dashboard
          </Link>
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-2"
          >
            Admin Dashboard
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
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
              className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-sm"
            >
              Register Candidate Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
