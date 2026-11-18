"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("candidate@example.de");
  const [password, setPassword] = useState("Candidate2026!");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to candidate dashboard
    router.push("/candidate/dashboard");
  };

  const handleDemoAdmin = () => {
    setEmail("admin@nighwan.com");
    setPassword("AdminSuperSecret2026!");
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Nilam AI
          </h1>
          <p className="text-xs text-slate-500">
            Access your candidate profile and personalized job recommendations.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <a href="#" className="text-[11px] font-semibold text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            One-Click Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setEmail("candidate@example.de");
                setPassword("Candidate2026!");
                router.push("/candidate/dashboard");
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-colors"
            >
              Demo Candidate
            </button>
            <button
              onClick={handleDemoAdmin}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-semibold transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
