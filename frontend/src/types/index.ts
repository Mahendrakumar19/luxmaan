export type UserRole = 'Candidate' | 'DataOperator' | 'Support' | 'Admin' | 'SuperAdmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface LanguageSkill {
  lang: string;
  level: string; // A1, A2, B1, B2, C1, C2, Fluent, Native
}

export interface WorkExperience {
  id: string;
  company: string;
  companyType: string;
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
  type: string;
  duration: string;
  recognisedAffiliation: string;
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
  remotePreference: 'OnSite' | 'Hybrid' | 'Remote' | 'Flexible';
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

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  locationCity: string;
  locationCountry: string;
  workplaceType: 'OnSite' | 'Hybrid' | 'Remote';
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  requiredSkills: string[];
  sector?: string;
  softwareTools?: string[];
  requiredLanguages?: LanguageSkill[];
  description?: string;
  postedAt: string;
  applicationUrl: string;
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

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string;
  fileSizeBytes: number;
  mimeType?: string;
  isPrimary?: boolean;
  status: string;
  createdAt: string;
  extractedHeadline?: string;
  extractedSkills?: string[];
  extractedExperience?: string;
  languages?: string;
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



