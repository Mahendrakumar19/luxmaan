import { Request, Response } from 'express';
import crypto from 'crypto';
import { db, hashPasswordAsync, verifyPasswordAsync } from '../db/store.js';
import { generateToken } from '../middleware/auth.js';
import { User, CandidateProfile } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, consentGiven, policyVersion } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const emailNorm = email.toLowerCase().trim();
    for (const u of db.users.values()) {
      if (u.email === emailNorm) {
        res.status(400).json({ success: false, message: 'A user with this email already exists.' });
        return;
      }
    }

    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      email: emailNorm,
      passwordHash: await hashPasswordAsync(password),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'Candidate',
      isEmailVerified: true,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.set(userId, newUser);

    // Initial Clean Candidate Profile
    const profile: CandidateProfile = {
      id: crypto.randomUUID(),
      userId,
      headline: '',
      summary: '',
      yearsOfExperience: 0,
      currentLocation: '',
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

    // Record GDPR Consent
    if (consentGiven) {
      db.consents.push({
        id: crypto.randomUUID(),
        userId,
        consentType: 'TERMS_AND_PRIVACY_POLICY',
        isGranted: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        policyVersion: policyVersion || '2026.1',
        createdAt: new Date().toISOString()
      });
    }

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken: token,
        expiresIn: 86400,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      },
      message: 'Registration successful.'
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required.' });
      return;
    }

    const emailNorm = email.toLowerCase().trim();
    let foundUser: User | undefined;

    for (const u of db.users.values()) {
      if (u.email === emailNorm && !u.isDeleted) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser || !(await verifyPasswordAsync(password, foundUser.passwordHash))) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName
    });

    res.json({
      success: true,
      data: {
        accessToken: token,
        expiresIn: 86400,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          role: foundUser.role
        }
      },
      message: 'Login successful.'
    });
  }

  static me(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const user = db.users.get(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  }
}

