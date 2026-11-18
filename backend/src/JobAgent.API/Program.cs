using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using JobAgent.Application.Interfaces;
using JobAgent.Domain.Entities;
using JobAgent.Domain.Enums;
using JobAgent.Infrastructure.Clients;
using JobAgent.Infrastructure.Persistence;
using JobAgent.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (PostgreSQL with fallback to InMemory for dev)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("Host=postgres"))
{
    builder.Services.AddDbContext<JobAgentDbContext>(options =>
        options.UseNpgsql(connectionString, o => o.UseVector()));
}
else
{
    // High-performance In-Memory DB for self-contained execution
    builder.Services.AddDbContext<JobAgentDbContext>(options =>
        options.UseInMemoryDatabase("JobAgentDb"));
}

// 2. JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForDevelopmentPurposesMustBeAtLeast32BytesLong2026!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JobAgentPlatform";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JobAgentClients";

builder.Services.AddSingleton(new JwtTokenGenerator(jwtSecret, jwtIssuer, jwtAudience));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();

// 3. HTTP Client & AI Microservice
builder.Services.AddHttpClient<IAiServiceClient, AiServiceClient>(client =>
{
    var aiUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(aiUrl);
});

// 4. Core Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IGdprService, GdprService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AI Job Agent API - Germany & EU",
        Version = "v1",
        Description = "Nighwan Technology Pvt. Ltd. - Production API for Job Discovery & AI Matching"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 5. CORS for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

var app = builder.Build();

// Seed initial data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JobAgentDbContext>();
    SeedDatabase(db);
}

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI Job Agent API v1"));

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// -----------------------------------------------------------------------------
// Database Seeder
// -----------------------------------------------------------------------------
static void SeedDatabase(JobAgentDbContext db)
{
    if (db.Jobs.Any()) return;

    // 1. Sources
    var srcSiemens = new JobSource
    {
        SourceName = "Siemens Careers API",
        SourceType = "API",
        SourceUrl = "https://jobs.siemens.com",
        TotalJobsCollected = 14
    };
    var srcArbeitsagentur = new JobSource
    {
        SourceName = "Bundesagentur für Arbeit Open Data",
        SourceType = "API",
        SourceUrl = "https://rest.arbeitsagentur.de",
        TotalJobsCollected = 86
    };
    var srcZalando = new JobSource
    {
        SourceName = "Zalando Tech Jobs Feed",
        SourceType = "RSS_FEED",
        SourceUrl = "https://jobs.zalando.com",
        TotalJobsCollected = 22
    };

    db.JobSources.AddRange(srcSiemens, srcArbeitsagentur, srcZalando);

    // 2. Demo User & Candidate
    var demoUser = new User
    {
        Email = "candidate@example.de",
        PasswordHash = PasswordHasher.HashPassword("Candidate2026!"),
        FirstName = "Lukas",
        LastName = "Müller",
        Role = UserRole.Candidate,
        IsEmailVerified = true
    };
    var adminUser = new User
    {
        Email = "admin@nighwan.com",
        PasswordHash = PasswordHasher.HashPassword("AdminSuperSecret2026!"),
        FirstName = "Alexander",
        LastName = "Schmidt",
        Role = UserRole.SuperAdmin,
        IsEmailVerified = true
    };
    db.Users.AddRange(demoUser, adminUser);

    var candProfile = new CandidateProfile
    {
        UserId = demoUser.Id,
        Headline = "Senior Cloud & Full-Stack Engineer",
        Summary = "Passionate full-stack developer with 6+ years of experience developing distributed cloud systems in Germany.",
        YearsOfExperience = 6.0m,
        CurrentLocation = "Munich, Germany",
        PreferredLocations = new List<string> { "Munich", "Berlin", "Remote" },
        RemotePreference = WorkplaceType.Hybrid,
        ExpectedSalaryMin = 80000,
        ExpectedSalaryMax = 95000,
        LanguagesJson = "[{\"lang\":\"German\",\"level\":\"C1\"},{\"lang\":\"English\",\"level\":\"Fluent\"}]",
        IsProfileComplete = true
    };
    db.CandidateProfiles.Add(candProfile);

    // 3. Realistic German Jobs
    var job1 = new Job
    {
        Source = srcSiemens,
        ExternalId = "sie-101",
        Title = "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
        CompanyName = "Siemens AG",
        CompanyLogoUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
        LocationCity = "Munich",
        LocationCountry = "Germany",
        WorkplaceType = WorkplaceType.Hybrid,
        EmploymentType = EmploymentType.FullTime,
        ExperienceLevel = ExperienceLevel.Senior,
        SalaryMin = 80000,
        SalaryMax = 95000,
        RequiredLanguagesJson = "[{\"lang\":\"German\",\"level\":\"B2\"},{\"lang\":\"English\",\"level\":\"Fluent\"}]",
        Description = "Wir suchen für unser Smart Infrastructure Team in München einen erfahrenen Senior Cloud Software Engineer mit C#, .NET 10 und AWS Kenntnissen.",
        ApplicationUrl = "https://jobs.siemens.com/careers/cloud-engineer",
        DedupHash = "hash_sie_101",
        PostedAt = DateTime.UtcNow.AddDays(-1)
    };

    var job2 = new Job
    {
        Source = srcZalando,
        ExternalId = "zal-202",
        Title = "Lead Full-Stack Developer (React / TypeScript / Node)",
        CompanyName = "Zalando SE",
        CompanyLogoUrl = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
        LocationCity = "Berlin",
        LocationCountry = "Germany",
        WorkplaceType = WorkplaceType.Hybrid,
        EmploymentType = EmploymentType.FullTime,
        ExperienceLevel = ExperienceLevel.Lead,
        SalaryMin = 85000,
        SalaryMax = 105000,
        RequiredLanguagesJson = "[{\"lang\":\"English\",\"level\":\"Fluent\"}]",
        Description = "Join Europe's leading fashion platform in Berlin. Lead frontend architecture with Next.js, React, TypeScript and distributed cloud services.",
        ApplicationUrl = "https://jobs.zalando.com/careers/lead-fullstack",
        DedupHash = "hash_zal_202",
        PostedAt = DateTime.UtcNow.AddDays(-2)
    };

    var job3 = new Job
    {
        Source = srcArbeitsagentur,
        ExternalId = "bmw-303",
        Title = "Platform & DevOps Engineer (Kubernetes, Terraform)",
        CompanyName = "BMW Group",
        CompanyLogoUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop",
        LocationCity = "Munich",
        LocationCountry = "Germany",
        WorkplaceType = WorkplaceType.OnSite,
        EmploymentType = EmploymentType.FullTime,
        ExperienceLevel = ExperienceLevel.Senior,
        SalaryMin = 82000,
        SalaryMax = 98000,
        RequiredLanguagesJson = "[{\"lang\":\"German\",\"level\":\"C1\"},{\"lang\":\"English\",\"level\":\"Fluent\"}]",
        Description = "Verantwortung für globale Kubernetes-Cluster, Terraform Infrastrukturen und CI/CD Automatisierungen bei der BMW Group.",
        ApplicationUrl = "https://bmwgroup.jobs/platform-devops",
        DedupHash = "hash_bmw_303",
        PostedAt = DateTime.UtcNow.AddDays(-3)
    };

    db.Jobs.AddRange(job1, job2, job3);

    // Initial Matching Weights
    db.MatchingWeightsConfigs.Add(new MatchingWeightsConfig
    {
        SkillsWeight = 0.40m,
        ExperienceWeight = 0.25m,
        LocationWeight = 0.15m,
        LanguageWeight = 0.10m,
        SalaryWeight = 0.10m,
        IsActive = true
    });

    db.SaveChanges();
}
