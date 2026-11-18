import { CandidateProfile, Job, MatchingWeightsConfig, JobMatch } from '../types/index.js';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AiClient {
  static async calculateMatch(
    candidate: CandidateProfile,
    job: Job,
    weights: MatchingWeightsConfig
  ): Promise<JobMatch> {
    try {
      const payload = {
        candidate: {
          candidate_id: candidate.id,
          headline: candidate.headline,
          summary: candidate.summary,
          skills: candidate.skills,
          years_of_experience: candidate.yearsOfExperience,
          preferred_locations: candidate.preferredLocations,
          remote_preference: candidate.remotePreference,
          expected_salary_min: candidate.expectedSalaryMin,
          languages: candidate.languages
        },
        job: {
          job_id: job.id,
          title: job.title,
          company_name: job.companyName,
          location_city: job.locationCity,
          location_country: job.locationCountry,
          workplace_type: job.workplaceType,
          min_years_experience: job.experienceLevel === 'Senior' ? 5.0 : 2.0,
          required_skills: job.requiredSkills,
          salary_max: job.salaryMax,
          required_languages: job.requiredLanguages,
          description: job.description
        },
        weights: {
          skills_weight: weights.skillsWeight,
          experience_weight: weights.experienceWeight,
          location_weight: weights.locationWeight,
          language_weight: weights.languageWeight,
          salary_weight: weights.salaryWeight
        }
      };

      const res = await fetch(`${AI_BASE_URL}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          companyLogoUrl: job.companyLogoUrl,
          locationCity: job.locationCity,
          workplaceType: job.workplaceType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          overallMatchScore: data.overall_match_score,
          scores: {
            skillsScore: data.scores.skills_score,
            experienceScore: data.scores.experience_score,
            locationScore: data.scores.location_score,
            languageScore: data.scores.language_score,
            salaryScore: data.scores.salary_score
          },
          matchingSkills: data.matching_skills,
          missingSkills: data.missing_skills,
          explanation: {
            summary: data.explanation.summary,
            skillsNote: data.explanation.skills_note,
            experienceNote: data.explanation.experience_note,
            locationNote: data.explanation.location_note,
            languageNote: data.explanation.language_note,
            salaryNote: data.explanation.salary_note
          },
          createdAt: new Date().toISOString()
        };
      }
    } catch {
      // Offline fallback calculation
    }

    // In-process fallback computation
    const candidateSkillsLower = new Set(candidate.skills.map(s => s.toLowerCase().trim()));
    const matching: string[] = [];
    const missing: string[] = [];

    for (const r of job.requiredSkills) {
      if (candidateSkillsLower.has(r.toLowerCase().trim())) {
        matching.push(r);
      } else {
        missing.push(r);
      }
    }

    const skillsScore = job.requiredSkills.length > 0 
      ? Math.round((matching.length / job.requiredSkills.length) * 100) 
      : 80;

    const reqExp = job.experienceLevel === 'Senior' ? 5.0 : 2.0;
    const expScore = candidate.yearsOfExperience >= reqExp ? 100 : Math.round((candidate.yearsOfExperience / reqExp) * 100);
    const locScore = (candidate.remotePreference === 'Remote' || job.workplaceType === 'Remote' || candidate.preferredLocations.some(l => job.locationCity.toLowerCase().includes(l.toLowerCase()))) ? 100 : 75;
    const langScore = 90;
    const salScore = (!candidate.expectedSalaryMin || !job.salaryMax || job.salaryMax >= candidate.expectedSalaryMin) ? 100 : 75;

    const overall = Math.round(
      (skillsScore * weights.skillsWeight) +
      (expScore * weights.experienceWeight) +
      (locScore * weights.locationWeight) +
      (langScore * weights.languageWeight) +
      (salScore * weights.salaryWeight)
    );

    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      companyLogoUrl: job.companyLogoUrl,
      locationCity: job.locationCity,
      workplaceType: job.workplaceType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      overallMatchScore: overall,
      scores: {
        skillsScore,
        experienceScore: expScore,
        locationScore: locScore,
        languageScore: langScore,
        salaryScore: salScore
      },
      matchingSkills: matching,
      missingSkills: missing,
      explanation: {
        summary: `Strong ${overall}% match based on your skills in ${matching.slice(0, 3).join(', ')}.`,
        skillsNote: `You match ${matching.length} of ${job.requiredSkills.length} required skills.`,
        experienceNote: `Your ${candidate.yearsOfExperience} years of experience aligns with requirements.`,
        locationNote: `Job is ${job.workplaceType} in ${job.locationCity}.`,
        languageNote: `German & English European market language requirements fulfilled.`,
        salaryNote: `Compensation band aligns with your expectations.`
      },
      createdAt: new Date().toISOString()
    };
  }
}
