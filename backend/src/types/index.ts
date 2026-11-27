export type UserRole = 'Candidate' | 'DataOperator' | 'Support' | 'Admin' | 'SuperAdmin';
export type WorkplaceType = 'OnSite' | 'Hybrid' | 'Remote' | 'Flexible';
export type EmploymentType = 'FullTime' | 'PartTime' | 'Contract' | 'Internship';
export type ExperienceLevel = 'Junior' | 'MidLevel' | 'Senior' | 'Lead' | 'Executive';
export type ParsingStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: string;
  isGranted: boolean;
  ipAddress?: string;
  userAgent?: string;
  policyVersion: string;
  createdAt: string;
}

export interface LanguageSkill {
  lang: string;
  level: string; // CEFR: A1, A2, B1, B2, C1, C2, Fluent, Native
}

export interface WorkExperience {
  id: string;
  company: string;
  companyType: string; // e.g. Enterprise, Startup, Consultancy, Aerospace, FinTech
  jobRole: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  responsibilities: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  type: string; // e.g. Cloud, Project Management, Language, Engineering
  duration: string; // e.g. "6 months", "40 hours"
  recognisedAffiliation: string; // e.g. AWS, PMI, IHK, Goethe-Institut
  issueYear?: number;
}

export interface SectorSkill {
  sector: string;
  skills: string[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  sector?: string;
  targetRoles?: string[];
  yearsOfExperience: number;
  currentLocation?: string;
  preferredLocations: string[];
  preferredEmploymentTypes: string[];
  remotePreference: WorkplaceType;
  expectedSalaryCurrency: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  noticePeriodDays: number;
  languages: LanguageSkill[];
  skills: string[];
  sectorSkills?: SectorSkill[];
  softwareTools?: string[];
  experiences?: WorkExperience[];
  educations?: EducationItem[];
  certifications?: CertificationItem[];
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredibilityRoleScore {
  role: string;
  score: number;
  preferenceMatch: number;
  locationMatch: number;
  skillsMatch: number;
  qualificationMatch: number;
  certificationBoost: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface TailoredDocument {
  jobId: string;
  jobTitle: string;
  companyName: string;
  tailoredSummary: string;
  highlightedSkills: string[];
  tailoredExperiences: {
    jobRole: string;
    company: string;
    companyType: string;
    duration: string;
    relevantResponsibilities: string[];
  }[];
  coverLetterText: string;
  generatedAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  isPrimary: boolean;
  rawText?: string;
  parsedData?: any;
  status: ParsingStatus;
  parsingError?: string;
  createdAt: string;
}

export interface JobSource {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  collectionFrequencyHours: number;
  isActive: boolean;
  lastSuccessfulRunAt?: string;
  totalJobsCollected: number;
  lastErrorLog?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  sourceId?: string;
  externalId: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  locationCity: string;
  locationCountry: string;
  isRemote: boolean;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  requiredSkills: string[];
  sector?: string;
  softwareTools?: string[];
  requiredLanguages: LanguageSkill[];
  description: string;
  applicationUrl: string;
  postedAt: string;
  dedupHash: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface MatchScores {
  skillsScore: number;
  experienceScore: number;
  locationScore: number;
  languageScore: number;
  salaryScore: number;
}

export interface MatchExplanation {
  summary: string;
  skillsNote: string;
  experienceNote: string;
  locationNote: string;
  languageNote: string;
  salaryNote: string;
}

export interface JobMatch {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  locationCity: string;
  workplaceType: string;
  salaryMin?: number;
  salaryMax?: number;
  overallMatchScore: number;
  scores: MatchScores;
  matchingSkills: string[];
  missingSkills: string[];
  explanation: MatchExplanation;
  createdAt: string;
}

export interface MatchingWeightsConfig {
  skillsWeight: number;
  experienceWeight: number;
  locationWeight: number;
  languageWeight: number;
  salaryWeight: number;
  isActive: boolean;
  updatedBy?: string;
  updatedAt: string;
}

export interface AdminKPIs {
  totalUsers: number;
  activeCandidates: number;
  totalJobs: number;
  jobsIngestedToday: number;
  activeSources: number;
  totalMatchesCalculated: number;
  ingestionFailuresToday: number;
}

export type ApplicationStatus = 'Interested' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  userId: string;
  jobId?: string;
  companyName: string;
  jobTitle: string;
  locationCity?: string;
  salary?: string;
  applicationUrl?: string;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}


