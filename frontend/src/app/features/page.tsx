"use client";

import Link from "next/link";
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Database, 
  Globe2, 
  Sliders, 
  Zap, 
  ArrowRight 
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function FeaturesPage() {
  const { t } = useLanguage();
  const features = [
    {
      icon: FileText,
      title: "Multilingual CV & Resume Parsing",
      description: "Extracts personal contact details, tech skills, work experience dates, and CEFR German/English language levels from PDF and DOCX documents with high precision."
    },
    {
      icon: Cpu,
      title: "384-Dimensional Semantic Vectors",
      description: "Embeds candidate experience and job descriptions using paraphrase-multilingual sentence transformers, capturing contextual meaning beyond simple keyword matching."
    },
    {
      icon: Database,
      title: "PostgreSQL with pgvector (HNSW Index)",
      description: "Performs high-speed approximate nearest neighbor vector cosine similarity search directly within PostgreSQL, ensuring unified transactional consistency."
    },
    {
      icon: Sliders,
      title: "Configurable Multi-Factor Scoring",
      description: "Scores compatibility across 5 distinct dimensions: Skills (40%), Experience (25%), Location (15%), Language (10%), and Salary (10%), customizable by admins."
    },
    {
      icon: ShieldCheck,
      title: "Privacy by Design (GDPR / DSGVO)",
      description: "Full European data sovereignty hosted in AWS Frankfurt (eu-central-1), self-service JSON data export under Article 20, and hard cascade erasure under Article 17."
    },
    {
      icon: Globe2,
      title: "Multi-Source Job Ingestion Engine",
      description: "Automated ingestion pipeline with polite rate limiting, deduplication fingerprints, and connectors for official open APIs and corporate career feeds."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Capabilities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t.features_title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          {t.features_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Experience Intelligent Job Matching</h3>
        <p className="text-xs text-slate-500">Free candidate registration. No spam, no automated application spamming.</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <span>Create Free Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

