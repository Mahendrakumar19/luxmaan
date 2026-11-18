using Microsoft.EntityFrameworkCore;
using JobAgent.Domain.Entities;
using JobAgent.Domain.Enums;

namespace JobAgent.Infrastructure.Persistence;

public class JobAgentDbContext : DbContext
{
    public JobAgentDbContext(DbContextOptions<JobAgentDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserConsent> UserConsents => Set<UserConsent>();
    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();
    public DbSet<WorkExperience> WorkExperiences => Set<WorkExperience>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<JobSource> JobSources => Set<JobSource>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobSkill> JobSkills => Set<JobSkill>();
    public DbSet<JobMatch> JobMatches => Set<JobMatch>();
    public DbSet<MatchingWeightsConfig> MatchingWeightsConfigs => Set<MatchingWeightsConfig>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite Keys & Unique Indexes
        modelBuilder.Entity<CandidateSkill>()
            .HasKey(cs => new { cs.CandidateProfileId, cs.SkillId });

        modelBuilder.Entity<JobSkill>()
            .HasKey(js => new { js.JobId, js.SkillId });

        modelBuilder.Entity<SavedJob>()
            .HasIndex(s => new { s.UserId, s.JobId })
            .IsUnique();

        modelBuilder.Entity<Application>()
            .HasIndex(a => new { a.UserId, a.JobId })
            .IsUnique();

        modelBuilder.Entity<JobMatch>()
            .HasIndex(m => new { m.CandidateProfileId, m.JobId })
            .IsUnique();

        modelBuilder.Entity<Job>()
            .HasIndex(j => j.DedupHash)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Skill>()
            .HasIndex(s => s.Name)
            .IsUnique();

        // Enums as strings
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<CandidateProfile>()
            .Property(c => c.RemotePreference)
            .HasConversion<string>();

        modelBuilder.Entity<Job>()
            .Property(j => j.WorkplaceType)
            .HasConversion<string>();

        modelBuilder.Entity<Job>()
            .Property(j => j.EmploymentType)
            .HasConversion<string>();

        modelBuilder.Entity<Job>()
            .Property(j => j.ExperienceLevel)
            .HasConversion<string>();

        modelBuilder.Entity<Resume>()
            .Property(r => r.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Application>()
            .Property(a => a.Status)
            .HasConversion<string>();

        // Query Filters (Soft delete)
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
    }
}
