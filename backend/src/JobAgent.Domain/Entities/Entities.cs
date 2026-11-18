using JobAgent.Domain.Common;
using JobAgent.Domain.Enums;

namespace JobAgent.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.Candidate;
    public bool IsEmailVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    public CandidateProfile? Profile { get; set; }
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<UserConsent> Consents { get; set; } = new List<UserConsent>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class UserConsent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string ConsentType { get; set; } = string.Empty; // TERMS, PRIVACY, AI_MATCHING
    public bool IsGranted { get; set; } = true;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string PolicyVersion { get; set; } = "2026.1";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CandidateProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public decimal YearsOfExperience { get; set; } = 0.0m;
    public string? CurrentLocation { get; set; }
    public List<string> PreferredLocations { get; set; } = new();
    public List<string> PreferredEmploymentTypes { get; set; } = new();
    public WorkplaceType RemotePreference { get; set; } = WorkplaceType.Flexible;
    public string ExpectedSalaryCurrency { get; set; } = "EUR";
    public int? ExpectedSalaryMin { get; set; }
    public int? ExpectedSalaryMax { get; set; }
    public int NoticePeriodDays { get; set; } = 30;
    public string LanguagesJson { get; set; } = "[]";
    public bool IsProfileComplete { get; set; } = false;

    public ICollection<CandidateSkill> Skills { get; set; } = new List<CandidateSkill>();
    public ICollection<WorkExperience> Experiences { get; set; } = new List<WorkExperience>();
    public ICollection<Education> Educations { get; set; } = new List<Education>();
    public ICollection<JobMatch> Matches { get; set; } = new List<JobMatch>();
}

public class Resume : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = "application/pdf";
    public bool IsPrimary { get; set; } = true;
    public string? RawText { get; set; }
    public string? ParsedDataJson { get; set; }
    public ParsingStatus Status { get; set; } = ParsingStatus.Pending;
    public string? ParsingError { get; set; }
}

public class Skill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "Technical";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CandidateSkill> CandidateSkills { get; set; } = new List<CandidateSkill>();
    public ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
}

public class CandidateSkill
{
    public Guid CandidateProfileId { get; set; }
    public CandidateProfile CandidateProfile { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public decimal YearsOfExperience { get; set; } = 1.0m;
    public string ProficiencyLevel { get; set; } = "Intermediate";
}

public class WorkExperience : BaseEntity
{
    public Guid CandidateProfileId { get; set; }
    public CandidateProfile CandidateProfile { get; set; } = null!;
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;
    public string? Description { get; set; }
    public List<string> SkillsUsed { get; set; } = new();
}

public class Education : BaseEntity
{
    public Guid CandidateProfileId { get; set; }
    public CandidateProfile CandidateProfile { get; set; } = null!;
    public string InstitutionName { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Grade { get; set; }
}

public class JobSource : BaseEntity
{
    public string SourceName { get; set; } = string.Empty;
    public string SourceType { get; set; } = "API"; // API, RSS_FEED, SCRAPER_PLAYWRIGHT
    public string SourceUrl { get; set; } = string.Empty;
    public string? AuthCredentialsJson { get; set; }
    public int CollectionFrequencyHours { get; set; } = 24;
    public bool IsActive { get; set; } = true;
    public DateTime? LastSuccessfulRunAt { get; set; }
    public long TotalJobsCollected { get; set; } = 0;
    public string? LastErrorLog { get; set; }

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}

public class Job : BaseEntity
{
    public Guid? SourceId { get; set; }
    public JobSource? Source { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string LocationCity { get; set; } = string.Empty;
    public string LocationCountry { get; set; } = "Germany";
    public bool IsRemote { get; set; } = false;
    public WorkplaceType WorkplaceType { get; set; } = WorkplaceType.OnSite;
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.MidLevel;
    public int? SalaryMin { get; set; }
    public int? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "EUR";
    public string RequiredLanguagesJson { get; set; } = "[]";
    public string Description { get; set; } = string.Empty;
    public string? DescriptionHtml { get; set; }
    public string ApplicationUrl { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public string DedupHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
    public ICollection<JobMatch> Matches { get; set; } = new List<JobMatch>();
}

public class JobSkill
{
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public bool IsRequired { get; set; } = true;
}

public class JobMatch : BaseEntity
{
    public Guid CandidateProfileId { get; set; }
    public CandidateProfile CandidateProfile { get; set; } = null!;
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public decimal OverallMatchScore { get; set; }
    public decimal SkillsScore { get; set; }
    public decimal ExperienceScore { get; set; }
    public decimal LocationScore { get; set; }
    public decimal LanguageScore { get; set; }
    public decimal SalaryScore { get; set; }
    public decimal VectorCosineSimilarity { get; set; }
    public List<string> MatchingSkills { get; set; } = new();
    public List<string> MissingSkills { get; set; } = new();
    public string ExplanationJson { get; set; } = "{}";
    public bool IsDismissed { get; set; } = false;
}

public class MatchingWeightsConfig : BaseEntity
{
    public decimal SkillsWeight { get; set; } = 0.40m;
    public decimal ExperienceWeight { get; set; } = 0.25m;
    public decimal LocationWeight { get; set; } = 0.15m;
    public decimal LanguageWeight { get; set; } = 0.10m;
    public decimal SalaryWeight { get; set; } = 0.10m;
    public bool IsActive { get; set; } = true;
    public Guid? UpdatedBy { get; set; }
}

public class SavedJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Application : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Type { get; set; } = "MatchAlert";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string DataJson { get; set; } = "{}";
    public bool IsRead { get; set; } = false;
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string DetailsJson { get; set; } = "{}";
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
