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
      },
      {
        id: "job-5",
        sourceId: src2.id,
        externalId: "sap-505",
        title: "Senior Java / Spring Boot Backend Engineer",
        companyName: "SAP SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop",
        locationCity: "Walldorf",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 76000,
        salaryMax: 94000,
        salaryCurrency: "EUR",
        requiredSkills: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker", "Microservices"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Entwicklung unternehmenskritischer Cloud-Anwendungen bei der SAP. Konzeptionierung robuster Microservices mit Java 21, Spring Boot und Apache Kafka.",
        applicationUrl: "https://jobs.sap.com/careers/java-engineer",
        postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        dedupHash: "hash_sap_505",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-6",
        sourceId: src3.id,
        externalId: "per-606",
        title: "Frontend Engineer (React / TypeScript / Next.js)",
        companyName: "Personio SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop",
        locationCity: "Munich",
        locationCountry: "Germany",
        isRemote: true,
        workplaceType: "Remote",
        employmentType: "FullTime",
        experienceLevel: "MidLevel",
        salaryMin: 68000,
        salaryMax: 82000,
        salaryCurrency: "EUR",
        requiredSkills: ["React", "TypeScript", "Next.js", "HTML5", "CSS3", "Tailwind CSS"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Join Europe's leading HR tech platform. Build modern web interfaces using React, Next.js, and TypeScript with focus on accessibility and performance.",
        applicationUrl: "https://careers.personio.de/frontend-engineer",
        postedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        dedupHash: "hash_per_606",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-7",
        sourceId: src1.id,
        externalId: "bos-707",
        title: "Data Engineer (Python, Spark, Kafka, SQL)",
        companyName: "Bosch Group",
        companyLogoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
        locationCity: "Stuttgart",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 78000,
        salaryMax: 92000,
        salaryCurrency: "EUR",
        requiredSkills: ["Python", "Spark", "Kafka", "SQL", "Airflow", "PostgreSQL"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Bau von skalierbaren Datenpipelines für IoT- und Mobilitätsdaten bei Bosch in Stuttgart. Arbeiten mit Apache Spark, Kafka und Cloud Data Warehouses.",
        applicationUrl: "https://bosch.jobs/data-engineer",
        postedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        dedupHash: "hash_bos_707",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-8",
        sourceId: src1.id,
        externalId: "all-808",
        title: "Cloud & Cybersecurity Specialist",
        companyName: "Allianz Technology SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop",
        locationCity: "Frankfurt",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 84000,
        salaryMax: 105000,
        salaryCurrency: "EUR",
        requiredSkills: ["Linux", "Docker", "Kubernetes", "Prometheus", "CI/CD", "Git"],
        requiredLanguages: [{ lang: "German", level: "C1" }, { lang: "English", level: "Fluent" }],
        description: "Sicherstellung der Informationssicherheit und Datenschutz-Compliance (DSGVO) bei der Allianz. Überwachung und Härtung von Cloud-Infrastrukturen.",
        applicationUrl: "https://allianz.de/karriere/security",
        postedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
        dedupHash: "hash_all_808",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-9",
        sourceId: src3.id,
        externalId: "n26-909",
        title: "Mobile Engineer (Android / Kotlin / Swift)",
        companyName: "N26 Bank AG",
        companyLogoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop",
        locationCity: "Berlin",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "MidLevel",
        salaryMin: 72000,
        salaryMax: 88000,
        salaryCurrency: "EUR",
        requiredSkills: ["Kotlin", "Swift", "REST API", "Git", "CI/CD"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Build Europe's premier mobile banking experience in Berlin. Design clean, performant mobile features serving over 8 million European customers.",
        applicationUrl: "https://n26.com/careers/mobile-engineer",
        postedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        dedupHash: "hash_n26_909",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-10",
        sourceId: src2.id,
        externalId: "cel-1010",
        title: "Fullstack Cloud Engineer (Node.js, TypeScript, React)",
        companyName: "Celonis SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
        locationCity: "Munich",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 80000,
        salaryMax: 98000,
        salaryCurrency: "EUR",
        requiredSkills: ["TypeScript", "Node.js", "React", "PostgreSQL", "Docker", "Microservices"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Join the market leader in Process Mining in Munich. Build scalable, high-throughput cloud analytical services utilizing modern TypeScript and React.",
        applicationUrl: "https://celonis.com/careers/fullstack",
        postedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        dedupHash: "hash_cel_1010",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-11",
        sourceId: src3.id,
        externalId: "flx-1111",
        title: "Backend Engineer (Go, Kubernetes, Microservices)",
        companyName: "Flix SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop",
        locationCity: "Munich",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 78000,
        salaryMax: 95000,
        salaryCurrency: "EUR",
        requiredSkills: ["Go", "Golang", "Kubernetes", "Microservices", "Docker", "PostgreSQL"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Power green and smart mobility across Europe and the Americas. Design highly available booking and dispatch systems with Go and Kubernetes.",
        applicationUrl: "https://flixbus.jobs/backend-engineer",
        postedAt: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
        dedupHash: "hash_flx_1111",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-12",
        sourceId: src3.id,
        externalId: "hf-1212",
        title: "Python Backend Developer (FastAPI, PostgreSQL)",
        companyName: "HelloFresh SE",
        companyLogoUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop",
        locationCity: "Berlin",
        locationCountry: "Germany",
        isRemote: true,
        workplaceType: "Remote",
        employmentType: "FullTime",
        experienceLevel: "MidLevel",
        salaryMin: 70000,
        salaryMax: 85000,
        salaryCurrency: "EUR",
        requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Git"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }],
        description: "Join Europe's leading meal-kit company in Berlin. You will build high-traffic subscription and logistics backend microservices using Python and FastAPI.",
        applicationUrl: "https://careers.hellofresh.com/python-engineer",
        postedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        dedupHash: "hash_hf_1212",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-13",
        sourceId: src1.id,
        externalId: "hnk-1313",
        title: "SAP S/4HANA & ABAP Enterprise Consultant",
        companyName: "Henkel AG",
        companyLogoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
        locationCity: "Düsseldorf",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 82000,
        salaryMax: 102000,
        salaryCurrency: "EUR",
        requiredSkills: ["SAP", "SAP S/4HANA", "ABAP", "SQL", "Agile"],
        requiredLanguages: [{ lang: "German", level: "C1" }, { lang: "English", level: "Fluent" }],
        description: "Verantwortung für globale SAP S/4HANA Transformationsprojekte bei Henkel in Düsseldorf. Customizing, ABAP Entwicklung und Prozessoptimierung.",
        applicationUrl: "https://henkel.de/karriere/sap",
        postedAt: new Date(Date.now() - 54 * 3600 * 1000).toISOString(),
        dedupHash: "hash_hnk_1313",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-14",
        sourceId: src2.id,
        externalId: "por-1414",
        title: "Cloud Infrastructure Architect (AWS, Terraform)",
        companyName: "Porsche Digital GmbH",
        companyLogoUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&h=100&fit=crop",
        locationCity: "Stuttgart",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 90000,
        salaryMax: 115000,
        salaryCurrency: "EUR",
        requiredSkills: ["AWS", "Kubernetes", "Terraform", "Python", "Docker", "CI/CD"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Gestalten Sie bei Porsche Digital die Cloud-Infrastruktur für vernetzte Fahrzeuge und digitale Kundenerlebnisse mit AWS, Terraform und Kubernetes.",
        applicationUrl: "https://porsche-digital.com/careers/cloud-architect",
        postedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        dedupHash: "hash_por_1414",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-15",
        sourceId: src1.id,
        externalId: "luf-1515",
        title: "Project Manager - Aviation Operations & Fleet Programs",
        companyName: "Lufthansa Group",
        companyLogoUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop",
        locationCity: "Frankfurt am Main",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 75000,
        salaryMax: 92000,
        salaryCurrency: "EUR",
        requiredSkills: ["Project Management", "Project Planning", "Stakeholder Management", "Aviation", "SAP ERP", "Risk Assessment", "PRINCE2"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Steuern Sie zukunftsweisende Projekte in der Flugbetriebslogistik und Flottenkoordination am Drehkreuz Frankfurt. Leitung von cross-funktionalen Projektteams mit agilen und klassischen Methoden (PRINCE2/PMI).",
        applicationUrl: "https://lufthansagroup.careers/project-manager-aviation",
        postedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        dedupHash: "hash_luf_1515",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-16",
        sourceId: src2.id,
        externalId: "air-1616",
        title: "Aerospace Project Coordinator & Operations Specialist",
        companyName: "Airbus Operations GmbH",
        companyLogoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&h=100&fit=crop",
        locationCity: "Hamburg",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "Hybrid",
        employmentType: "FullTime",
        experienceLevel: "MidLevel",
        salaryMin: 72000,
        salaryMax: 88000,
        salaryCurrency: "EUR",
        requiredSkills: ["Project Coordination", "Aerospace", "Budget Monitoring", "Microsoft Project", "Risk Assessment", "CAPM", "Jira"],
        requiredLanguages: [{ lang: "English", level: "Fluent" }, { lang: "German", level: "B2" }],
        description: "Coordinate aerospace production and sub-assembly programs. Drive milestones, track project budgets, mitigate risks, and collaborate across international Airbus engineering teams.",
        applicationUrl: "https://airbus.com/careers/project-coordinator",
        postedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        dedupHash: "hash_air_1616",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "job-17",
        sourceId: src1.id,
        externalId: "fra-1717",
        title: "Senior Operations & Project Manager (Flughafen Frankfurt)",
        companyName: "Fraport AG",
        companyLogoUrl: "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=100&h=100&fit=crop",
        locationCity: "Frankfurt am Main",
        locationCountry: "Germany",
        isRemote: false,
        workplaceType: "OnSite",
        employmentType: "FullTime",
        experienceLevel: "Senior",
        salaryMin: 78000,
        salaryMax: 95000,
        salaryCurrency: "EUR",
        requiredSkills: ["Project Management", "Operations Management", "Process Improvement", "Stakeholder Management", "Power BI", "SAP ERP"],
        requiredLanguages: [{ lang: "German", level: "B2" }, { lang: "English", level: "Fluent" }],
        description: "Verantwortung für strategische Flughafenbetriebsprojekte und Prozessoptimierungen am Flughafen Frankfurt. Datenbasierte Steuerung mittels Power BI und SAP ERP in einem dynamischen Aviatik-Umfeld.",
        applicationUrl: "https://fraport.de/karriere/operations-manager",
        postedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        dedupHash: "hash_fra_1717",
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

