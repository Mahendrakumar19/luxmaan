import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AiClient } from '../services/aiClient.js';
import { JobMatch } from '../types/index.js';

export class MatchesController {
  static async getMatches(req: Request, res: Response) {
    const userId = req.user!.id;
    const profile = db.profiles.get(userId);

    if (!profile) {
      res.status(404).json({ success: false, message: 'Candidate profile not found.' });
      return;
    }

    if (!profile.skills || profile.skills.length === 0) {
      res.json({
        success: true,
        data: []
      });
      return;
    }

    const minScore = req.query.minScore ? Number(req.query.minScore) : 60;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const activeJobs = Array.from(db.jobs.values()).filter(j => j.isActive);

    // Fast parallel evaluation of candidate vs jobs
    const allCalculations = await Promise.all(
      activeJobs.map(job => AiClient.calculateMatch(profile, job, db.weights))
    );

    // Filter by minScore, or gracefully retrieve best available matches
    let matches = allCalculations.filter(m => m.overallMatchScore >= minScore);
    if (matches.length === 0) {
      matches = allCalculations.filter(m => m.overallMatchScore >= 35);
    }

    matches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    res.json({
      success: true,
      data: matches.slice(0, limit)
    });
  }

  static async recalculate(req: Request, res: Response) {
    const userId = req.user!.id;
    const jobId = req.params.jobId as string;

    const profile = db.profiles.get(userId);
    const job = db.jobs.get(jobId);

    if (!profile || !job) {
      res.status(404).json({ success: false, message: 'Profile or Job not found.' });
      return;
    }

    const match = await AiClient.calculateMatch(profile, job, db.weights);
    res.json({ success: true, data: match });
  }
}
