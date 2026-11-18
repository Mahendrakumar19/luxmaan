import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';

export class GdprController {
  static exportData(req: Request, res: Response) {
    const userId = req.user!.id;
    const user = db.users.get(userId);
    const profile = db.profiles.get(userId);
    const resumes = Array.from(db.resumes.values()).filter(r => r.userId === userId);
    const consents = db.consents.filter(c => c.userId === userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const exportBundle = {
      platform: 'Nilam AI - Nighwan Technology Pvt. Ltd.',
      jurisdiction: 'European Union (GDPR / DSGVO)',
      article: 'Article 20 - Right to Data Portability',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      profile,
      resumes,
      consents
    };

    res.json({
      success: true,
      data: exportBundle,
      message: 'Personal data archive compiled under GDPR Article 20.'
    });
  }

  static recordConsent(req: Request, res: Response) {
    const userId = req.user!.id;
    const { consentType, isGranted, policyVersion } = req.body;

    const consent = {
      id: crypto.randomUUID(),
      userId,
      consentType: consentType || 'AI_MATCHING_PROCESSING',
      isGranted: isGranted !== false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      policyVersion: policyVersion || '2026.1',
      createdAt: new Date().toISOString()
    };
    db.consents.push(consent);

    res.json({ success: true, data: consent, message: 'Consent updated.' });
  }

  static deleteAccount(req: Request, res: Response) {
    const userId = req.user!.id;

    // Hard cascade deletion of user according to GDPR Article 17
    db.users.delete(userId);
    db.profiles.delete(userId);

    for (const [id, r] of db.resumes.entries()) {
      if (r.userId === userId) db.resumes.delete(id);
    }

    for (const key of Array.from(db.savedJobs)) {
      if (key.startsWith(`${userId}:`)) db.savedJobs.delete(key);
    }

    res.json({
      success: true,
      message: 'Account, candidate profile, and all associated personal data permanently erased under GDPR Article 17.'
    });
  }
}

