import crypto from 'crypto';
import { User, CandidateProfile, Resume, Job, JobSource, JobMatch, MatchingWeightsConfig, UserConsent } from '../types/index.js';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 32);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

class DataStore {
  public users: Map<string, User> = new Map();
  public profiles: Map<string, CandidateProfile> = new Map(); // key = userId
  public resumes: Map<string, Resume> = new Map();
  public sources: Map<string, JobSource> = new Map();
  public jobs: Map<string, Job> = new Map();
  public savedJobs: Set<string> = new Set(); // userId:jobId
  public consents: UserConsent[] = [];
  public weights: MatchingWeightsConfig = {
    skillsWeight: 0.40,
    experienceWeight: 0.25,
    locationWeight: 0.15,
    languageWeight: 0.10,
    salaryWeight: 0.10,
    isActive: true,
    updatedAt: new Date().toISOString()
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Demo Candidate & Admin
    const candidateId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    const adminId = "e2b34a65-8123-4567-bcde-9876543210ab";

    const candidate: User = {
      id: candidateId,
      email: "candidate@example.de",
      passwordHash: hashPassword("Candidate2026!"),
      firstName: "Lukas",
      lastName: "Müller",
      role: "Candidate",
      isEmailVerified: true,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const admin: User = {
      id: adminId,
      email: "admin@nighwan.com",
      passwordHash: hashPassword("AdminSuperSecret2026!"),
      firstName: "Alexander",
      lastName: "Schmidt",
      role: "SuperAdmin",
      isEmailVerified: true,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(candidate.id, candidate);
    this.users.set(admin.id, admin);

    // Profile for Lukas
    const profile: CandidateProfile = {
      id: crypto.randomUUID(),
      userId: candidateId,
      headline: "Senior Cloud & Full-Stack Engineer",
      summary: "Passionate full-stack developer with 6+ years of experience developing distributed cloud systems in Germany.",
      yearsOfExperience: 6.0,
      currentLocation: "Munich, Germany",
      preferredLocations: ["Munich", "Berlin", "Remote"],
      preferredEmploymentTypes: ["FullTime"],
      remotePreference: "Hybrid",
      expectedSalaryCurrency: "EUR",
      expectedSalaryMin: 80000,
      expectedSalaryMax: 95000,
      noticePeriodDays: 30,
      languages: [
        { lang: "German", level: "C1" },
        { lang: "English", level: "Fluent" }
      ],
      skills: ["C#", ".NET", "React", "TypeScript", "Docker", "PostgreSQL", "AWS"],
      isProfileComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.profiles.set(candidateId, profile);

    // 2. Seed Job Sources
    const src1: JobSource = {
      id: "src-1",
      sourceName: "Bundesagentur für Arbeit API",
      sourceType: "API",
      sourceUrl: "https://rest.arbeitsagentur.de/jobboerse",
      collectionFrequencyHours: 12,
      isActive: true,
      lastSuccessfulRunAt: new Date().toISOString(),
      totalJobsCollected: 840,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const src2: JobSource = {
      id: "src-2",
      sourceName: "Siemens Careers Portal",
      sourceType: "API",
      sourceUrl: "https://jobs.siemens.com",
      collectionFrequencyHours: 24,
      isActive: true,
      lastSuccessfulRunAt: new Date().toISOString(),
      totalJobsCollected: 165,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const src3: JobSource = {
      id: "src-3",
      sourceName: "Zalando Tech Jobs Feed",
      sourceType: "RSS_FEED",
      sourceUrl: "https://jobs.zalando.com",
      collectionFrequencyHours: 6,
      isActive: true,
      lastSuccessfulRunAt: new Date().toISOString(),
      totalJobsCollected: 310,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.sources.set(src1.id, src1);
    this.sources.set(src2.id, src2);
    this.sources.set(src3.id, src3);

    // 3. Seed Realistic German Tech Vacancies
    const sampleJobs: Job[] = [
      {
        id: "job-1",
        sourceId: src2.id,
        externalId: "sie-101",
        title: "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
        companyName: "Siemens AG",
        companyLogoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
        locationCity: "Munich",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 80000,
        salaryMax: 95000,
        salaryCurrency: "EUR",
        requiredSkills: ["C#", ".NET", "AWS", "Docker", "PostgreSQL", "Microservices"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Wir suchen für unser Smart Infrastructure Team in München einen erfahrenen Senior Cloud Software Engineer mit fundierten C#, .NET und Cloud-Kenntnissen.",
        applicationUrl: "https://jobs.siemens.com/careers/cloud-engineer",
        postedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        dedupHash: "hash_sie_101",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-2",
        sourceId: src3.id,
        externalId: "zal-202",
        title: "Full-Stack Developer (React / Next.js / TypeScript)",
        companyName: "Zalando SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
        locationCity: "Berlin",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "MidLevel",
        salaryMin: 70000,
        salaryMax: 84000,
        salaryCurrency: "EUR",
        requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Join Europe's leading online fashion platform in Berlin. You will build high-traffic customer interfaces using React, Next.js, and TypeScript.",
        applicationUrl: "https://jobs.zalando.com/careers/fullstack",
        postedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        dedupHash: "hash_zal_202",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-3",
        sourceId: src1.id,
        externalId: "bmw-303",
        title: "Platform & DevOps Engineer (Kubernetes, Terraform)",
        companyName: "BMW Group",
        companyLogoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop",
        locationCity: "Munich",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "OnSite",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 82000,
        salaryMax: 102000,
        salaryCurrency: "EUR",
        requiredSkills: ["Kubernetes", "Terraform", "Docker", "CI/CD", "Linux", "Azure"],
        requiredLanguages: [{ lang: "German", level: "C1" }, { lang: "English", level: "Fluent" }],
        description: "Gestalten Sie die Zukunft der Mobilität bei der BMW Group in München. Sie verantworten globale Kubernetes-Cluster und CI/CD Automatisierungen.",
        applicationUrl: "https://bmwgroup.jobs/platform-devops",
        postedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        dedupHash: "hash_bmw_303",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-4",
        sourceId: src1.id,
        externalId: "del-404",
        title: "AI / Machine Learning Engineer (NLP & Vector Search)",
        companyName: "Delivery Hero SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop",
        locationCity: "Berlin",
        locationCountry: "Germany",
        isRemote: true,
        workplaceType: "Remote",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 88000,
        salaryMax: 110000,
        salaryCurrency: "EUR",
        requiredSkills: ["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "PostgreSQL"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Delivery Hero is designing semantic search models, multilingual embeddings, and recommendation algorithms serving European markets.",
        applicationUrl: "https://careers.deliveryhero.com/ai-engineer",
        postedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
        dedupHash: "hash_del_404",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const j of sampleJobs) {
      this.jobs.set(j.id, j);
    }
  }
}

export const db = new DataStore();

