import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { AiClient } from '../services/aiClient.js';
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
      yearsOfExperience,
      currentLocation,
      preferredLocations,
      preferredEmploymentTypes,
      remotePreference,
      expectedSalaryMin,
      expectedSalaryMax,
      noticePeriodDays,
      languages,
      skills
    } = req.body;

    profile.headline = headline ?? profile.headline;
    profile.summary = summary ?? profile.summary;
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
    const parsed = file?.buffer ? await AiClient.parseResume(file.buffer, fileName) : null;

    // Sync extracted skills with candidate profile
    const profile = db.profiles.get(userId);
    if (profile && parsed) {
      if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        for (const s of parsed.skills) {
          if (!profile.skills.includes(s)) profile.skills.push(s);
        }
      }
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
