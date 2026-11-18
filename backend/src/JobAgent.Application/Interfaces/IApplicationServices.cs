using JobAgent.Application.DTOs;

namespace JobAgent.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, string? ipAddress, string? userAgent);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
}

public interface ICandidateService
{
    Task<ApiResponse<CandidateProfileDto>> GetProfileAsync(Guid userId);
    Task<ApiResponse<CandidateProfileDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<ApiResponse<ResumeDto>> UploadResumeAsync(Guid userId, string fileName, Stream fileStream, string contentType);
    Task<ApiResponse<List<ResumeDto>>> GetResumesAsync(Guid userId);
    Task<ApiResponse<bool>> DeleteResumeAsync(Guid userId, Guid resumeId);
}

public interface IJobService
{
    Task<ApiResponse<PagedResult<JobDto>>> SearchJobsAsync(JobSearchQuery query);
    Task<ApiResponse<JobDetailDto>> GetJobByIdAsync(Guid jobId);
    Task<ApiResponse<bool>> SaveJobAsync(Guid userId, Guid jobId);
    Task<ApiResponse<bool>> UnsaveJobAsync(Guid userId, Guid jobId);
    Task<ApiResponse<List<JobDto>>> GetSavedJobsAsync(Guid userId);
}

public interface IMatchingService
{
    Task<ApiResponse<List<JobMatchDto>>> GetCandidateMatchesAsync(Guid userId, decimal minScore = 60.0m, int limit = 20);
    Task<ApiResponse<JobMatchDto>> RecalculateMatchAsync(Guid userId, Guid jobId);
}

public interface IAdminService
{
    Task<ApiResponse<AdminKpiDto>> GetDashboardKpisAsync();
    Task<ApiResponse<List<JobSourceDto>>> GetSourcesAsync();
    Task<ApiResponse<JobSourceDto>> ToggleSourceStatusAsync(Guid sourceId, bool isActive);
    Task<ApiResponse<bool>> TriggerSourceIngestionAsync(Guid sourceId);
    Task<ApiResponse<UpdateMatchingWeightsDto>> GetMatchingWeightsAsync();
    Task<ApiResponse<UpdateMatchingWeightsDto>> UpdateMatchingWeightsAsync(UpdateMatchingWeightsDto dto, Guid adminUserId);
}

public interface IGdprService
{
    Task<ApiResponse<UserDataExportDto>> ExportUserDataAsync(Guid userId);
    Task<ApiResponse<bool>> RecordConsentAsync(Guid userId, ConsentRequest request, string? ipAddress, string? userAgent);
    Task<ApiResponse<bool>> DeleteAccountAsync(Guid userId);
}

public interface IAiServiceClient
{
    Task<ParsedResumeData?> ParseResumeAsync(Stream fileStream, string fileName);
    Task<List<float>> GenerateEmbeddingAsync(string text);
    Task<CalculatedMatchResult?> CalculateMatchAsync(CandidateMatchInput candidate, JobMatchInput job, MatchingWeightsDto weights);
}

public record ParsedResumeData(
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string? Headline,
    string? Summary,
    List<string> Skills,
    float YearsOfExperience,
    List<LanguageSkillDto> Languages
);

public record CandidateMatchInput(
    string CandidateId,
    string? Headline,
    string? Summary,
    List<string> Skills,
    float YearsOfExperience,
    List<string> PreferredLocations,
    string RemotePreference,
    int? ExpectedSalaryMin,
    List<LanguageSkillDto> Languages
);

public record JobMatchInput(
    string JobId,
    string Title,
    string CompanyName,
    string LocationCity,
    string LocationCountry,
    string WorkplaceType,
    float MinYearsExperience,
    List<string> RequiredSkills,
    int? SalaryMax,
    List<LanguageSkillDto> RequiredLanguages,
    string Description
);

public record MatchingWeightsDto(
    float SkillsWeight,
    float ExperienceWeight,
    float LocationWeight,
    float LanguageWeight,
    float SalaryWeight
);

public record CalculatedMatchResult(
    decimal OverallScore,
    decimal CosineSim,
    MatchScoresDto Scores,
    List<string> MatchingSkills,
    List<string> MissingSkills,
    MatchExplanationDto Explanation
);
