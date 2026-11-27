import { Job, JobMatch, CandidateProfile, AdminKPIs, JobSource, User, Resume, JobApplication, CredibilityRoleScore, TailoredDocument } from '@/types';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    // In browser: always use relative path '/api/v1'.
    // Traefik/Nginx reverse-proxies this directly to the internal container backend.
    // This completely prevents any collision with host/client port 5000.
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env && env.startsWith('http') && !env.includes('localhost') && !env.includes('127.0.0.1') && !env.includes(':5000')) {
      return env;
    }
    return '/api/v1';
  }
  return process.env.BACKEND_INTERNAL_URL 
    ? `${process.env.BACKEND_INTERNAL_URL}/api/v1` 
    : 'http://127.0.0.1:5000/api/v1';
}

const API_BASE = getApiBase();

// Helper to get authorization headers safely
function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Seed mock data for interactive demonstration and fallback
const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
    companyName: "Siemens AG",
    companyLogoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
    locationCity: "Munich",
    locationCountry: "Germany",
    workplaceType: "Hybrid",
    employmentType: "FullTime",
    experienceLevel: "Senior",
    salaryMin: 80000,
    salaryMax: 95000,
    salaryCurrency: "EUR",
    requiredSkills: ["C#", ".NET", "AWS", "Docker", "PostgreSQL", "Microservices"],
    requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
    description: "Wir suchen für unser Smart Infrastructure Team in München einen erfahrenen Senior Cloud Software Engineer mit fundierten C#, .NET 10 und Cloud-Kenntnissen.",
    postedAt: "2026-11-17T09:00:00Z",
    applicationUrl: "https://jobs.siemens.com/careers/cloud-engineer"
  },
  {
    id: "job-2",
    title: "Full-Stack Developer (React / Next.js / TypeScript)",
    companyName: "Zalando SE",
    companyLogoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
    locationCity: "Berlin",
    locationCountry: "Germany",
    workplaceType: "Hybrid",
    employmentType: "FullTime",
    experienceLevel: "MidLevel",
    salaryMin: 70000,
    salaryMax: 84000,
    salaryCurrency: "EUR",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
    requiredLanguages: [{ lang: "English", level: "Fluent" }],
    description: "Join Europe's leading online fashion platform in Berlin. You will build high-traffic customer interfaces using React, Next.js, and TypeScript.",
    postedAt: "2026-11-16T11:00:00Z",
    applicationUrl: "https://jobs.zalando.com/careers/fullstack"
  },
  {
    id: "job-3",
    title: "DevOps & Platform Engineer (Kubernetes, Terraform)",
    companyName: "BMW Group",
    companyLogoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop",
    locationCity: "Munich",
    locationCountry: "Germany",
    workplaceType: "OnSite",
    employmentType: "FullTime",
    experienceLevel: "Senior",
    salaryMin: 82000,
    salaryMax: 102000,
    salaryCurrency: "EUR",
    requiredSkills: ["Kubernetes", "Terraform", "Docker", "CI/CD", "Linux", "Azure"],
    requiredLanguages: [{ lang: "German", level: "C1" }, { lang: "English", level: "Fluent" }],
    description: "Gestalten Sie die Zukunft der Mobilität bei der BMW Group in München. Sie verantworten globale Kubernetes-Cluster und CI/CD Automatisierungen.",
    postedAt: "2026-11-15T14:30:00Z",
    applicationUrl: "https://bmwgroup.jobs/platform-devops"
  },
  {
    id: "job-4",
    title: "AI / Machine Learning Engineer (NLP & Vector Search)",
    companyName: "Delivery Hero SE",
    companyLogoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop",
    locationCity: "Berlin",
    locationCountry: "Germany",
    workplaceType: "Remote",
    employmentType: "FullTime",
    experienceLevel: "Senior",
    salaryMin: 88000,
    salaryMax: 110000,
    salaryCurrency: "EUR",
    requiredSkills: ["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "PostgreSQL"],
    requiredLanguages: [{ lang: "English", level: "Fluent" }],
    description: "Delivery Hero is designing semantic search models, multilingual embeddings, and recommendation algorithms serving European markets.",
    postedAt: "2026-11-14T08:00:00Z",
    applicationUrl: "https://careers.deliveryhero.com/ai-engineer"
  }
];

const MOCK_MATCHES: JobMatch[] = [
  {
    id: "match-1",
    jobId: "job-1",
    jobTitle: "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
    companyName: "Siemens AG",
    companyLogoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
    locationCity: "Munich",
    workplaceType: "Hybrid",
    salaryMin: 80000,
    salaryMax: 95000,
    overallMatchScore: 89.2,
    scores: {
      skillsScore: 92.0,
      experienceScore: 90.0,
      locationScore: 100.0,
      languageScore: 85.0,
      salaryScore: 80.0
    },
    matchingSkills: ["C#", ".NET", "Docker", "PostgreSQL", "Microservices"],
    missingSkills: ["AWS"],
    explanation: {
      summary: "Excellent 89.2% match based on your skills in C#/.NET and your Munich location preference.",
      skillsNote: "You possess 5 out of 6 core skills required for this cloud architecture role.",
      experienceNote: "Your 6 years of experience aligns with Siemens' Senior band (5+ years).",
      locationNote: "Job is Hybrid in Munich, matching your current city.",
      languageNote: "Your German C1 and English fluency satisfy European collaboration requirements.",
      salaryNote: "Compensation band (€80k - €95k) meets your target expectations."
    },
    createdAt: "2026-11-18T12:00:00Z"
  },
  {
    id: "match-2",
    jobId: "job-2",
    jobTitle: "Full-Stack Developer (React / Next.js / TypeScript)",
    companyName: "Zalando SE",
    companyLogoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
    locationCity: "Berlin",
    workplaceType: "Hybrid",
    salaryMin: 70000,
    salaryMax: 84000,
    overallMatchScore: 84.6,
    scores: {
      skillsScore: 88.0,
      experienceScore: 100.0,
      locationScore: 85.0,
      languageScore: 95.0,
      salaryScore: 75.0
    },
    matchingSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    missingSkills: ["GraphQL"],
    explanation: {
      summary: "Strong 84.6% match for modern frontend architecture in Berlin.",
      skillsNote: "Strong match in React, Next.js, and TypeScript ecosystem.",
      experienceNote: "Your experience comfortably exceeds requirements.",
      locationNote: "Position is located in Berlin (hybrid option available).",
      languageNote: "English working language environment perfectly matched.",
      salaryNote: "Compensation is within reasonable range of your target."
    },
    createdAt: "2026-11-18T12:00:00Z"
  }
];

export const apiClient = {
  async getJobs(params?: { q?: string; location?: string; workplaceType?: string; sector?: string; experienceLevel?: string; software?: string; minSalary?: string; page?: string; pageSize?: string }): Promise<Job[]> {
    try {
      const cleanParams: Record<string, string> = { pageSize: params?.pageSize || '100' };
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') cleanParams[k] = String(v);
        });
      }
      const query = new URLSearchParams(cleanParams).toString();
      const res = await fetch(`${getApiBase()}/jobs?${query}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data?.items)) return json.data.items;
      }
    } catch {
      // Return fallback
    }
    let filtered = [...MOCK_JOBS];
    if (params?.q) {
      const term = params.q.toLowerCase();
      filtered = filtered.filter(j => j.title.toLowerCase().includes(term) || j.companyName.toLowerCase().includes(term));
    }
    if (params?.location) {
      const loc = params.location.toLowerCase();
      filtered = filtered.filter(j => j.locationCity.toLowerCase().includes(loc));
    }
    return filtered;
  },

  async getMatches(): Promise<JobMatch[]> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const res = await fetch(`${getApiBase()}/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) return json.data;
        }
      }
    } catch {}
    return [];
  },

  async getAdminKPIs(): Promise<AdminKPIs> {
    try {
      const res = await fetch(`${getApiBase()}/admin/kpis`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}
    return {
      totalUsers: 1248,
      activeCandidates: 984,
      totalJobs: 1420,
      jobsIngestedToday: 48,
      activeSources: 6,
      totalMatchesCalculated: 3410,
      ingestionFailuresToday: 0
    };
  },

  async getSources(): Promise<JobSource[]> {
    try {
      const res = await fetch(`${getApiBase()}/admin/sources`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.length) return json.data;
      }
    } catch {}
    return [
      {
        id: "src-1",
        sourceName: "Bundesagentur für Arbeit API",
        sourceType: "API",
        sourceUrl: "https://rest.arbeitsagentur.de/jobboerse",
        collectionFrequencyHours: 12,
        isActive: true,
        lastSuccessfulRunAt: "2026-11-18T10:00:00Z",
        totalJobsCollected: 840
      },
      {
        id: "src-2",
        sourceName: "Siemens Careers Portal",
        sourceType: "API",
        sourceUrl: "https://jobs.siemens.com",
        collectionFrequencyHours: 24,
        isActive: true,
        lastSuccessfulRunAt: "2026-11-18T08:30:00Z",
        totalJobsCollected: 165
      },
      {
        id: "src-3",
        sourceName: "EU Remote Tech Feed",
        sourceType: "RSS_FEED",
        sourceUrl: "https://remotive.com/api/remote-jobs",
        collectionFrequencyHours: 6,
        isActive: true,
        lastSuccessfulRunAt: "2026-11-18T12:15:00Z",
        totalJobsCollected: 310
      }
    ];
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.clearAuth();
        return null;
      }
    } catch {
      // ignore malformed decode, let backend verify
    }
    return token;
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem('user');
    if (!u) return null;
    try {
      return JSON.parse(u);
    } catch {
      return null;
    }
  },

  setAuth(token: string, user: User) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('luxmaan-auth-changed'));
  },

  clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('luxmaan-auth-changed'));
  },

  async login(email: string, password: string): Promise<{ success: boolean; data?: { accessToken: string; user: User }; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        this.setAuth(json.data.accessToken, json.data.user);
        return { success: true, data: json.data, message: json.message };
      }
      return { success: false, message: json.message || 'Invalid email or password' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to connect to login server' };
    }
  },

  async register(data: { firstName: string; lastName: string; email: string; password: string; consentGiven?: boolean }): Promise<{ success: boolean; data?: { accessToken: string; user: User }; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        this.setAuth(json.data.accessToken, json.data.user);
        return { success: true, data: json.data, message: json.message };
      }
      return { success: false, message: json.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to connect to server' };
    }
  },

  logout() {
    this.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  async getProfile(): Promise<CandidateProfile | null> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/profile`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}
    return null;
  },

  async updateProfile(data: Partial<CandidateProfile>): Promise<{ success: boolean; data?: CandidateProfile; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data, message: json.message };
      }
      return { success: false, message: json.message || 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  },

  async getResumes(): Promise<Resume[]> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/resumes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}
    return [];
  },

  async uploadResume(file: File): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${getApiBase()}/candidate/resumes/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data, message: json.message };
      }
      return { success: false, message: json.message || 'Upload failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  },

  async deleteResume(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/resumes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async toggleSource(id: string, active: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/admin/sources/${id}/toggle?active=${active}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async triggerSource(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/admin/sources/${id}/trigger`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getWeights(): Promise<any> {
    try {
      const res = await fetch(`${getApiBase()}/admin/weights`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async updateWeights(weights: {
    skillsWeight: number;
    experienceWeight: number;
    locationWeight: number;
    languageWeight: number;
    salaryWeight: number;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/admin/weights`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(weights)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getApplications(): Promise<JobApplication[]> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/applications`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch {}
    return [];
  },

  async createApplication(data: Partial<JobApplication>): Promise<{ success: boolean; data?: JobApplication; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create application' };
    }
  },

  async updateApplication(id: string, data: Partial<JobApplication>): Promise<{ success: boolean; data?: JobApplication; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/applications/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update application' };
    }
  },

  async deleteApplication(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/applications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getCredibilityScore(): Promise<{ candidateName: string; overallScore: number; roleScores: CredibilityRoleScore[] } | null> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/credibility`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async generateTailoredDocument(payload: { jobId?: string; jobTitle?: string; companyName?: string; locationCity?: string; requiredSkills?: string[] }): Promise<TailoredDocument | null> {
    try {
      const res = await fetch(`${getApiBase()}/documents/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async saveJob(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/jobs/${jobId}/save`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async unsaveJob(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBase()}/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async syncLiveJobs(): Promise<{ success: boolean; syncedCount: number; totalJobsInPortal: number; sources?: any[]; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/jobs/sync-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return {
          success: true,
          syncedCount: json.data?.syncedCount || 0,
          totalJobsInPortal: json.data?.totalJobsInPortal || 0,
          sources: json.data?.sources || [],
          message: json.message
        };
      }
    } catch {}
    return { success: false, syncedCount: 0, totalJobsInPortal: 0, message: 'Live sync unavailable offline.' };
  },

  async deleteProfile(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/candidate/profile`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      return { success: res.ok && json.success, message: json.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete profile' };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${getApiBase()}/gdpr/delete-account`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok && json.success) {
        this.clearAuth();
      }
      return { success: res.ok && json.success, message: json.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete account' };
    }
  }
};

