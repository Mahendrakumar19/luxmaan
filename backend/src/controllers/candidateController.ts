import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { AiClient } from '../services/aiClient.js';
import { FallbackParser } from '../services/fallbackParser.js';
import { CandidateProfile, Resume } from '../types/index.js';

export class CandidateController {
  static getProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    let profile = db.profiles.get(userId);

    if (!profile) {
      profile = {
        id: crypto.randomUUID(),
        userId,
        yearsOfExperience: 0,
        preferredLocations: [],
        preferredEmploymentTypes: ['FullTime'],
        remotePreference: 'Flexible',
        expectedSalaryCurrency: 'EUR',
        noticePeriodDays: 30,
        languages: [],
        skills: [],
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.profiles.set(userId, profile);
    }

    res.json({ success: true, data: profile });
  }

  static updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    let profile = db.profiles.get(userId);

    if (!profile) {
      profile = {
        id: crypto.randomUUID(),
        userId,
        yearsOfExperience: 0,
        preferredLocations: [],
        preferredEmploymentTypes: ['FullTime'],
        remotePreference: 'Flexible',
        expectedSalaryCurrency: 'EUR',
        noticePeriodDays: 30,
        languages: [],
        skills: [],
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const {
      headline,
      summary,
      sector,
      targetRoles,
      yearsOfExperience,
      currentLocation,
      preferredLocations,
      preferredEmploymentTypes,
      remotePreference,
      expectedSalaryMin,
      expectedSalaryMax,
      noticePeriodDays,
      languages,
      skills,
      sectorSkills,
      softwareTools,
      experiences,
      educations,
      certifications
    } = req.body;

    profile.headline = headline ?? profile.headline;
    profile.summary = summary ?? profile.summary;
    profile.sector = sector ?? profile.sector;
    profile.targetRoles = targetRoles ?? profile.targetRoles;
    profile.yearsOfExperience = Number(yearsOfExperience) || profile.yearsOfExperience;
    profile.currentLocation = currentLocation ?? profile.currentLocation;
    profile.preferredLocations = preferredLocations ?? profile.preferredLocations;
    profile.preferredEmploymentTypes = preferredEmploymentTypes ?? profile.preferredEmploymentTypes;
    profile.remotePreference = remotePreference ?? profile.remotePreference;
    profile.expectedSalaryMin = expectedSalaryMin !== undefined ? Number(expectedSalaryMin) : profile.expectedSalaryMin;
    profile.expectedSalaryMax = expectedSalaryMax !== undefined ? Number(expectedSalaryMax) : profile.expectedSalaryMax;
    profile.noticePeriodDays = Number(noticePeriodDays) || profile.noticePeriodDays;
    profile.languages = languages ?? profile.languages;
    profile.skills = skills ?? profile.skills;
    profile.sectorSkills = sectorSkills ?? profile.sectorSkills;
    profile.softwareTools = softwareTools ?? profile.softwareTools;
    profile.experiences = experiences ?? profile.experiences;
    if (educations && Array.isArray(educations)) {
      // Strictly sort Education from latest to oldest
      profile.educations = [...educations].sort((a, b) => (Number(b.endYear) || 9999) - (Number(a.endYear) || 9999));
    }
    profile.certifications = certifications ?? profile.certifications;
    profile.isProfileComplete = true;
    profile.updatedAt = new Date().toISOString();

    db.profiles.set(userId, profile);

    res.json({ success: true, data: profile, message: 'Profile updated successfully.' });
  }

  static async uploadResume(req: Request, res: Response) {
    const userId = req.user!.id;
    const file = req.file;

    const fileName = file ? file.originalname : (req.body.fileName || 'resume.pdf');
    const resumeId = crypto.randomUUID();

    const resume: Resume = {
      id: resumeId,
      userId,
      fileName,
      fileUrl: `/uploads/resumes/${resumeId}_${fileName}`,
      fileSizeBytes: file ? file.size : 256000,
      mimeType: file ? file.mimetype : 'application/pdf',
      isPrimary: true,
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    db.resumes.set(resumeId, resume);

    // Call real AI parser for resume
    let parsed: any = file?.buffer ? await AiClient.parseResume(file.buffer, fileName) : null;

    // Resilient fallback parser if AI service returned empty or is offline
    if ((!parsed || !parsed.skills || parsed.skills.length === 0) && file?.buffer) {
      try {
        console.log('[CandidateController] Applying FallbackParser for resume extraction');
        const fb = FallbackParser.parse(file.buffer, fileName);
        parsed = {
          headline: parsed?.headline || fb.headline,
          summary: parsed?.summary || fb.summary,
          sector: parsed?.sector || fb.sector,
          current_location: parsed?.current_location || fb.current_location,
          skills: (parsed?.skills && parsed.skills.length > 0) ? parsed.skills : fb.skills,
          software_tools: parsed?.software_tools || fb.software_tools,
          years_of_experience: parsed?.years_of_experience || fb.years_of_experience,
          languages: (parsed?.languages && parsed.languages.length > 0) ? parsed.languages : fb.languages,
          experiences: (parsed?.experiences && parsed.experiences.length > 0) ? parsed.experiences : fb.experiences,
          educations: (parsed?.educations && parsed.educations.length > 0) ? parsed.educations : fb.educations,
          certifications: parsed?.certifications || fb.certifications
        };
      } catch (fbErr) {
        console.error('[CandidateController] FallbackParser error:', fbErr);
      }
    }

    // Sync extracted structured template data with candidate profile
    const profile = db.profiles.get(userId);
    if (profile && parsed) {
      if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        for (const s of parsed.skills) {
          if (!profile.skills.includes(s)) profile.skills.push(s);
        }
      }
      if (parsed.software_tools && Array.isArray(parsed.software_tools)) {
        profile.softwareTools = Array.from(new Set([...(profile.softwareTools || []), ...parsed.software_tools]));
      }
      if (parsed.sector) profile.sector = parsed.sector;
      if (parsed.headline) profile.headline = parsed.headline;
      if (parsed.summary && !profile.summary) profile.summary = parsed.summary;
      if (parsed.years_of_experience) profile.yearsOfExperience = parsed.years_of_experience;
      if (parsed.current_location) {
        profile.currentLocation = parsed.current_location;
        if (!profile.preferredLocations.includes(parsed.current_location)) {
          profile.preferredLocations.push(parsed.current_location);
        }
      }
      if (parsed.languages && Array.isArray(parsed.languages) && parsed.languages.length > 0) {
        profile.languages = parsed.languages;
      }
      if (parsed.experiences && Array.isArray(parsed.experiences) && (!profile.experiences || profile.experiences.length === 0)) {
        profile.experiences = parsed.experiences.map((e: any, i: number) => ({
          id: e.id || `exp-${Date.now()}-${i}`,
          company: e.company || 'Company',
          companyType: e.companyType || 'Enterprise',
          jobRole: e.jobRole || e.job_title || 'Specialist',
          startDate: e.startDate || e.start_date || '2020-01',
          endDate: e.endDate || e.end_date || '',
          isCurrent: Boolean(e.isCurrent ?? e.is_current),
          location: e.location || profile.currentLocation,
          responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : (e.description ? [e.description] : [])
        }));
      }
      if (parsed.educations && Array.isArray(parsed.educations) && (!profile.educations || profile.educations.length === 0)) {
        profile.educations = parsed.educations
          .map((ed: any, i: number) => ({
            id: ed.id || `edu-${Date.now()}-${i}`,
            institution: ed.institution || 'University',
            degree: ed.degree || 'Degree',
            fieldOfStudy: ed.fieldOfStudy || ed.field_of_study || '',
            startYear: Number(ed.startYear || ed.start_year || 2016),
            endYear: Number(ed.endYear || ed.end_year || 2020)
          }))
          .sort((a: any, b: any) => (b.endYear || 9999) - (a.endYear || 9999));
      }
      if (parsed.certifications && Array.isArray(parsed.certifications) && (!profile.certifications || profile.certifications.length === 0)) {
        profile.certifications = parsed.certifications;
      }
      profile.isProfileComplete = true;
      profile.updatedAt = new Date().toISOString();
      db.profiles.set(userId, profile);
    }

    res.json({
      success: true,
      data: {
        id: resume.id,
        fileName: resume.fileName,
        status: resume.status,
        fileSizeBytes: resume.fileSizeBytes,
        createdAt: resume.createdAt,
        extractedHeadline: profile?.headline,
        extractedSkills: profile?.skills,
        profile: profile,
        parsedResume: parsed
      },
      message: 'Resume uploaded and analyzed.'
    });
  }

  static getResumes(req: Request, res: Response) {
    const userId = req.user!.id;
    const list: Resume[] = [];
    for (const r of db.resumes.values()) {
      if (r.userId === userId) list.push(r);
    }
    res.json({ success: true, data: list });
  }

  static deleteResume(req: Request, res: Response) {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;

    const r = db.resumes.get(resumeId);
    if (!r || r.userId !== userId) {
      res.status(404).json({ success: false, message: 'Resume not found.' });
      return;
    }

    db.resumes.delete(resumeId);
    res.json({ success: true, message: 'Resume deleted.' });
  }
}
