namespace JobAgent.Application.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public T? Data { get; set; }
    public string Message { get; set; } = "Operation completed successfully";
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string error, string message = "An error occurred") =>
        new() { Success = false, Errors = new List<string> { error }, Message = message };
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Math.Max(1, PageSize));
}

// -----------------------------------------------------------------------------
// Auth DTOs
// -----------------------------------------------------------------------------
public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    bool ConsentGiven,
    string PolicyVersion = "2026.1"
);

public record LoginRequest(string Email, string Password);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsEmailVerified
);

public record AuthResponse(
    string AccessToken,
    int ExpiresIn,
    UserDto User
);

// -----------------------------------------------------------------------------
// Candidate DTOs
// -----------------------------------------------------------------------------
public class CandidateProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public decimal YearsOfExperience { get; set; }
    public string? CurrentLocation { get; set; }
    public List<string> PreferredLocations { get; set; } = new();
    public List<string> PreferredEmploymentTypes { get; set; } = new();
    public string RemotePreference { get; set; } = "Flexible";
    public int? ExpectedSalaryMin { get; set; }
    public int? ExpectedSalaryMax { get; set; }
    public int NoticePeriodDays { get; set; }
    public List<LanguageSkillDto> Languages { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public bool IsProfileComplete { get; set; }
}

public record LanguageSkillDto(string Lang, string Level);

public record UpdateProfileRequest(
    string? Headline,
    string? Summary,
    decimal YearsOfExperience,
    string? CurrentLocation,
    List<string> PreferredLocations,
    List<string> PreferredEmploymentTypes,
    string RemotePreference,
    int? ExpectedSalaryMin,
    int? ExpectedSalaryMax,
    int NoticePeriodDays,
    List<LanguageSkillDto> Languages,
    List<string> Skills
);

public record ResumeDto(
    Guid Id,
    string FileName,
    long FileSizeBytes,
    string Status,
    DateTime CreatedAt,
    bool IsPrimary,
    string? ExtractedHeadline,
    List<string>? ExtractedSkills
);

// -----------------------------------------------------------------------------
// Job DTOs
// -----------------------------------------------------------------------------
public class JobSearchQuery
{
    public string? Q { get; set; }
    public string? Location { get; set; }
    public string? WorkplaceType { get; set; } // OnSite, Hybrid, Remote
    public string? EmploymentType { get; set; }
    public int? MinSalary { get; set; }
    public string? ExperienceLevel { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public record JobDto(
    Guid Id,
    string Title,
    string CompanyName,
    string? CompanyLogoUrl,
    string LocationCity,
    string LocationCountry,
    string WorkplaceType,
    string EmploymentType,
    string ExperienceLevel,
    int? SalaryMin,
    int? SalaryMax,
    string SalaryCurrency,
    List<string> RequiredSkills,
    DateTime PostedAt,
    string ApplicationUrl
);

public record JobDetailDto(
    Guid Id,
    string Title,
    string CompanyName,
    string? CompanyLogoUrl,
    string LocationCity,
    string LocationCountry,
    string WorkplaceType,
    string EmploymentType,
    string ExperienceLevel,
    int? SalaryMin,
    int? SalaryMax,
    string SalaryCurrency,
    List<string> RequiredSkills,
    List<LanguageSkillDto> RequiredLanguages,
    string Description,
    string ApplicationUrl,
    DateTime PostedAt
);

// -----------------------------------------------------------------------------
// Match DTOs
// -----------------------------------------------------------------------------
public record MatchScoresDto(
    decimal SkillsScore,
    decimal ExperienceScore,
    decimal LocationScore,
    decimal LanguageScore,
    decimal SalaryScore
);

public record MatchExplanationDto(
    string Summary,
    string SkillsNote,
    string ExperienceNote,
    string LocationNote,
    string LanguageNote,
    string SalaryNote
);

public record JobMatchDto(
    Guid Id,
    Guid JobId,
    string JobTitle,
    string CompanyName,
    string? CompanyLogoUrl,
    string LocationCity,
    string WorkplaceType,
    int? SalaryMin,
    int? SalaryMax,
    decimal OverallMatchScore,
    MatchScoresDto Scores,
    List<string> MatchingSkills,
    List<string> MissingSkills,
    MatchExplanationDto Explanation,
    DateTime CreatedAt
);

// -----------------------------------------------------------------------------
// Admin DTOs
// -----------------------------------------------------------------------------
public record AdminKpiDto(
    int TotalUsers,
    int ActiveCandidates,
    int TotalJobs,
    int JobsIngestedToday,
    int ActiveSources,
    int TotalMatchesCalculated,
    int IngestionFailuresToday
);

public record JobSourceDto(
    Guid Id,
    string SourceName,
    string SourceType,
    string SourceUrl,
    int CollectionFrequencyHours,
    bool IsActive,
    DateTime? LastSuccessfulRunAt,
    long TotalJobsCollected,
    string? LastErrorLog
);

public record UpdateMatchingWeightsDto(
    decimal SkillsWeight,
    decimal ExperienceWeight,
    decimal LocationWeight,
    decimal LanguageWeight,
    decimal SalaryWeight
);

// -----------------------------------------------------------------------------
// GDPR DTOs
// -----------------------------------------------------------------------------
public record ConsentRequest(string ConsentType, bool IsGranted, string PolicyVersion = "2026.1");

public class UserDataExportDto
{
    public UserDto User { get; set; } = null!;
    public CandidateProfileDto? Profile { get; set; }
    public List<ResumeDto> Resumes { get; set; } = new();
    public List<string> Consents { get; set; } = new();
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}
