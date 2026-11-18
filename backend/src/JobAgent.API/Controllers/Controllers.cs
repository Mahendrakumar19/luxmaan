using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobAgent.Application.DTOs;
using JobAgent.Application.Interfaces;

namespace JobAgent.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();
        var result = await _authService.RegisterAsync(request, ip, ua);
        return result.Success ? StatusCode(201, result) : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var result = await _authService.GetCurrentUserAsync(userId.Value);
        return result.Success ? Ok(result) : NotFound(result);
    }

    protected Guid? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CandidateController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidateController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var result = await _candidateService.GetProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        var result = await _candidateService.UpdateProfileAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("resumes/upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<ResumeDto>.Fail("No file provided."));

        var userId = GetUserId();
        using var stream = file.OpenReadStream();
        var result = await _candidateService.UploadResumeAsync(userId, file.FileName, stream, file.ContentType);
        return Ok(result);
    }

    [HttpGet("resumes")]
    public async Task<IActionResult> GetResumes()
    {
        var userId = GetUserId();
        var result = await _candidateService.GetResumesAsync(userId);
        return Ok(result);
    }

    [HttpDelete("resumes/{resumeId:guid}")]
    public async Task<IActionResult> DeleteResume(Guid resumeId)
    {
        var userId = GetUserId();
        var result = await _candidateService.DeleteResumeAsync(userId, resumeId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}

[ApiController]
[Route("api/v1/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<IActionResult> SearchJobs([FromQuery] JobSearchQuery query)
    {
        var result = await _jobService.SearchJobsAsync(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var result = await _jobService.GetJobByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [Authorize]
    [HttpPost("{id:guid}/save")]
    public async Task<IActionResult> SaveJob(Guid id)
    {
        var userId = GetUserId();
        var result = await _jobService.SaveJobAsync(userId, id);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id:guid}/save")]
    public async Task<IActionResult> UnsaveJob(Guid id)
    {
        var userId = GetUserId();
        var result = await _jobService.UnsaveJobAsync(userId, id);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("saved")]
    public async Task<IActionResult> GetSavedJobs()
    {
        var userId = GetUserId();
        var result = await _jobService.GetSavedJobsAsync(userId);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MatchesController : ControllerBase
{
    private readonly IMatchingService _matchingService;

    public MatchesController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMatches([FromQuery] decimal minScore = 60.0m, [FromQuery] int limit = 20)
    {
        var userId = GetUserId();
        var result = await _matchingService.GetCandidateMatchesAsync(userId, minScore, limit);
        return Ok(result);
    }

    [HttpPost("recalculate/{jobId:guid}")]
    public async Task<IActionResult> RecalculateMatch(Guid jobId)
    {
        var userId = GetUserId();
        var result = await _matchingService.RecalculateMatchAsync(userId, jobId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}

[ApiController]
[Route("api/v1/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var result = await _adminService.GetDashboardKpisAsync();
        return Ok(result);
    }

    [HttpGet("sources")]
    public async Task<IActionResult> GetSources()
    {
        var result = await _adminService.GetSourcesAsync();
        return Ok(result);
    }

    [HttpPatch("sources/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleSource(Guid id, [FromQuery] bool active)
    {
        var result = await _adminService.ToggleSourceStatusAsync(id, active);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("sources/{id:guid}/trigger")]
    public async Task<IActionResult> TriggerIngestion(Guid id)
    {
        var result = await _adminService.TriggerSourceIngestionAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("weights")]
    public async Task<IActionResult> GetMatchingWeights()
    {
        var result = await _adminService.GetMatchingWeightsAsync();
        return Ok(result);
    }

    [HttpPut("weights")]
    public async Task<IActionResult> UpdateMatchingWeights([FromBody] UpdateMatchingWeightsDto dto)
    {
        var adminId = Guid.NewGuid();
        var result = await _adminService.UpdateMatchingWeightsAsync(dto, adminId);
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/[controller]")]
public class GdprController : ControllerBase
{
    private readonly IGdprService _gdprService;

    public GdprController(IGdprService gdprService)
    {
        _gdprService = gdprService;
    }

    [Authorize]
    [HttpGet("export")]
    public async Task<IActionResult> ExportData()
    {
        var userId = GetUserId();
        var result = await _gdprService.ExportUserDataAsync(userId);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("consent")]
    public async Task<IActionResult> UpdateConsent([FromBody] ConsentRequest request)
    {
        var userId = GetUserId();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();
        var result = await _gdprService.RecordConsentAsync(userId, request, ip, ua);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("delete-account")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = GetUserId();
        var result = await _gdprService.DeleteAccountAsync(userId);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}
