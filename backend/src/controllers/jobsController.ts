import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { Job } from '../types/index.js';

export class JobsController {
  static search(req: Request, res: Response) {
    const { q, location, workplaceType, minSalary, page = '1', pageSize = '20' } = req.query;

    let items = Array.from(db.jobs.values()).filter(j => j.isActive);

    if (q && typeof q === 'string') {
      const term = q.toLowerCase().trim();
      items = items.filter(j =>
        j.title.toLowerCase().includes(term) ||
        j.companyName.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term)
      );
    }

    if (location && typeof location === 'string') {
      const loc = location.toLowerCase().trim();
      items = items.filter(j =>
        j.locationCity.toLowerCase().includes(loc) ||
        j.locationCountry.toLowerCase().includes(loc)
      );
    }

    if (workplaceType && typeof workplaceType === 'string' && workplaceType !== 'All') {
      items = items.filter(j => j.workplaceType.toLowerCase() === workplaceType.toLowerCase());
    }

    if (minSalary) {
      const min = Number(minSalary);
      items = items.filter(j => (j.salaryMax ?? j.salaryMin ?? 0) >= min);
    }

    const p = Math.max(1, parseInt(page as string) || 1);
    const size = Math.max(1, parseInt(pageSize as string) || 20);
    const totalCount = items.length;
    const paginated = items.slice((p - 1) * size, p * size);

    res.json({
      success: true,
      data: {
        items: paginated,
        totalCount,
        page: p,
        pageSize: size,
        totalPages: Math.ceil(totalCount / size)
      }
    });
  }

  static getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const job = db.jobs.get(id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }
    res.json({ success: true, data: job });
  }

  static saveJob(req: Request, res: Response) {
    const userId = req.user!.id;
    const jobId = req.params.id;
    db.savedJobs.add(`${userId}:${jobId}`);
    res.json({ success: true, message: 'Job saved to bookmarks.' });
  }

  static unsaveJob(req: Request, res: Response) {
    const userId = req.user!.id;
    const jobId = req.params.id;
    db.savedJobs.delete(`${userId}:${jobId}`);
    res.json({ success: true, message: 'Job removed from bookmarks.' });
  }

  static getSavedJobs(req: Request, res: Response) {
    const userId = req.user!.id;
    const saved: Job[] = [];

    for (const key of db.savedJobs) {
      if (key.startsWith(`${userId}:`)) {
        const jobId = key.split(':')[1];
        const job = db.jobs.get(jobId);
        if (job) saved.push(job);
      }
    }

    res.json({ success: true, data: saved });
  }
}
