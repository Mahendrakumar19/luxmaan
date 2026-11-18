namespace JobAgent.Domain.Enums;

public enum UserRole
{
    Candidate,
    DataOperator,
    Support,
    Admin,
    SuperAdmin
}

public enum WorkplaceType
{
    OnSite,
    Hybrid,
    Remote,
    Flexible
}

public enum EmploymentType
{
    FullTime,
    PartTime,
    Contract,
    Internship
}

public enum ExperienceLevel
{
    Junior,
    MidLevel,
    Senior,
    Lead,
    Executive
}

public enum ParsingStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}

public enum ApplicationStatus
{
    Saved,
    Applied,
    Interviewing,
    Offered,
    Rejected,
    Withdrawn
}
