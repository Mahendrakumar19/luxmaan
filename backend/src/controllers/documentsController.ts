import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { CredibilityRoleScore, TailoredDocument } from '../types/index.js';

export class DocumentsController {
  /**
   * Calculates User's Credibility Score across target job roles
   * based on career preference, location, past roles/qualifications, skills & certifications.
   */
  static getCredibilityScore(req: Request, res: Response) {
    const userId = req.user!.id;
    const profile = db.profiles.get(userId);
    const user = db.users.get(userId);

    if (!profile) {
      res.status(404).json({ success: false, message: 'Candidate profile not found.' });
      return;
    }

    const candidateSkills = new Set([
      ...(profile.skills || []).map(s => s.toLowerCase()),
      ...(profile.softwareTools || []).map(s => s.toLowerCase())
    ]);

    const rolesToEvaluate = (profile.targetRoles && profile.targetRoles.length > 0)
      ? profile.targetRoles
      : [profile.headline || 'Software & Cloud Specialist'];

    const allJobs = Array.from(db.jobs.values()).filter(j => j.isActive);
    const certCount = (profile.certifications || []).length;
    const eduCount = (profile.educations || []).length;
    const expCount = (profile.experiences || []).length;

    const roleScores: CredibilityRoleScore[] = rolesToEvaluate.slice(0, 4).map((role) => {
      const roleTokens = role.toLowerCase().split(/[\s,/|&]+/).filter(t => t.length > 2);
      // Find representative jobs matching this role
      const matchingJobs = allJobs.filter(j =>
        roleTokens.some(t => j.title.toLowerCase().includes(t))
      );

      const referenceSkills = new Set<string>();
      for (const j of (matchingJobs.length > 0 ? matchingJobs : allJobs.slice(0, 3))) {
        for (const s of j.requiredSkills) referenceSkills.add(s);
      }

      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];
      for (const reqSkill of referenceSkills) {
        if (candidateSkills.has(reqSkill.toLowerCase())) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      }

      const skillsRatio = referenceSkills.size > 0 ? matchedSkills.length / referenceSkills.size : 0.75;
      const skillsMatch = Math.min(100, Math.round(50 + skillsRatio * 50));

      const hasPrefLocation = (profile.preferredLocations && profile.preferredLocations.length > 0) || Boolean(profile.currentLocation);
      const locationMatch = hasPrefLocation ? 92 : 55;

      const preferenceMatch = (profile.expectedSalaryMin || profile.remotePreference) ? 90 : 60;

      const qualificationMatch = Math.min(100, 45 + (eduCount * 20) + (expCount * 15) + Math.min(20, (profile.yearsOfExperience || 0) * 3));
      const certificationBoost = Math.min(100, 40 + certCount * 25);

      const overallRoleScore = Math.round(
        skillsMatch * 0.35 +
        qualificationMatch * 0.25 +
        locationMatch * 0.15 +
        preferenceMatch * 0.15 +
        certificationBoost * 0.10
      );

      return {
        role,
        score: Math.min(99, overallRoleScore),
        preferenceMatch,
        locationMatch,
        skillsMatch,
        qualificationMatch,
        certificationBoost,
        matchedSkills: matchedSkills.slice(0, 6),
        missingSkills: missingSkills.slice(0, 4)
      };
    });

    const overallScore = roleScores.length > 0
      ? Math.round(roleScores.reduce((acc, r) => acc + r.score, 0) / roleScores.length)
      : 65;

    res.json({
      success: true,
      data: {
        candidateName: user ? `${user.firstName} ${user.lastName}` : 'Candidate',
        overallScore,
        roleScores,
        evaluatedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Generates a tailored CV summary/highlights & European Cover Letter for a specific job.
   */
  static generateTailoredDocument(req: Request, res: Response) {
    const userId = req.user!.id;
    const profile = db.profiles.get(userId);
    const user = db.users.get(userId);

    if (!profile || !user) {
      res.status(404).json({ success: false, message: 'Candidate profile not found.' });
      return;
    }

    const { jobId } = req.body;
    const job = jobId ? db.jobs.get(jobId) : undefined;

    const jobTitle = job?.title || req.body.jobTitle || 'Target Position';
    const companyName = job?.companyName || req.body.companyName || 'Hiring Company';
    const locationCity = job?.locationCity || req.body.locationCity || profile.currentLocation || 'Germany';
    const requiredSkills = job?.requiredSkills || req.body.requiredSkills || [];

    const allCandidateSkills = Array.from(new Set([
      ...(profile.skills || []),
      ...(profile.softwareTools || [])
    ]));

    const highlightedSkills = requiredSkills.length > 0
      ? allCandidateSkills.filter(s => requiredSkills.some((r: string) => r.toLowerCase() === s.toLowerCase()))
      : allCandidateSkills.slice(0, 8);

    const effectiveSkills = highlightedSkills.length > 0 ? highlightedSkills : allCandidateSkills.slice(0, 6);

    const tailoredSummary = `${profile.headline || 'Experienced Specialist'} with ${profile.yearsOfExperience || 3}+ years of hands-on experience in ${profile.sector || 'European Enterprise Operations'}. Proven expertise in ${effectiveSkills.join(', ')}. Based in ${profile.currentLocation || 'Europe'} with ${profile.languages.map(l => `${l.lang} (${l.level})`).join(' and ')} proficiency, ready to contribute immediately to ${companyName} in ${locationCity}.`;

    const tailoredExperiences = (profile.experiences || []).map(exp => ({
      jobRole: exp.jobRole,
      company: exp.company,
      companyType: exp.companyType,
      duration: `${exp.startDate} – ${exp.isCurrent ? 'Present' : (exp.endDate || 'Present')}`,
      relevantResponsibilities: exp.responsibilities || []
    }));

    const certText = (profile.certifications && profile.certifications.length > 0)
      ? `Additionally, I hold recognised credentials including ${profile.certifications.map(c => `${c.name} (${c.recognisedAffiliation})`).join(', ')}.`
      : '';

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const coverLetterText = `${user.firstName} ${user.lastName}
${profile.currentLocation || 'Germany / EU'}
${user.email}

${today}

Hiring Team
${companyName}
${locationCity}

Subject: Application for ${jobTitle}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName} in ${locationCity}. With ${profile.yearsOfExperience || 3}+ years of professional experience in ${profile.sector || 'the European market'} and a strong background in ${effectiveSkills.slice(0, 5).join(', ')}, I am confident in my ability to add immediate value to your team.

${tailoredExperiences[0] ? `In my role as ${tailoredExperiences[0].jobRole} at ${tailoredExperiences[0].company} (${tailoredExperiences[0].companyType}), I was responsible for ${tailoredExperiences[0].relevantResponsibilities[0] || 'leading key technical and operational deliverables'}. ` : ''}${certText}

My fluency in ${profile.languages.map(l => `${l.lang} (${l.level})`).join(' and ')}, combined with my preference for ${profile.remotePreference} collaboration and a notice period of ${profile.noticePeriodDays} days, aligns closely with ${companyName}'s requirements.

Thank you for considering my application. I look forward to discussing how my skills and experience can support ${companyName}'s goals.

Sincerely,
${user.firstName} ${user.lastName}`;

    const result: TailoredDocument = {
      jobId: job?.id || jobId || 'custom',
      jobTitle,
      companyName,
      tailoredSummary,
      highlightedSkills: effectiveSkills,
      tailoredExperiences,
      coverLetterText,
      generatedAt: new Date().toISOString()
    };

    res.json({ success: true, data: result });
  }
}
