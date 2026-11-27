import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { Job } from '../types/index.js';
import { LiveJobFetcher } from '../services/liveJobFetcher.js';

export class JobsController {
  static async search(req: Request, res: Response) {
    // Automatically refresh real-time jobs if 2.5-hour threshold elapsed & remove expired jobs
    await LiveJobFetcher.ensureFreshRealtimeJobs(false);

    const { q, location, workplaceType, minSalary, sector, experienceLevel, software, page = '1', pageSize = '100' } = req.query;

    let items = Array.from(db.jobs.values()).filter(j => j.isActive);

    if (q && typeof q === 'string') {
      const term = q.toLowerCase().trim();
      items = items.filter(j =>
        j.title.toLowerCase().includes(term) ||
        j.companyName.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(term))
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

    if (experienceLevel && typeof experienceLevel === 'string' && experienceLevel !== 'All') {
      items = items.filter(j => j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());
    }

    if (sector && typeof sector === 'string' && sector !== 'All') {
      const sec = sector.toLowerCase().trim();
      items = items.filter(j =>
        (j.sector && j.sector.toLowerCase().includes(sec)) ||
        j.title.toLowerCase().includes(sec) ||
        j.description.toLowerCase().includes(sec)
      );
    }

    if (software && typeof software === 'string' && software.trim()) {
      const sw = software.toLowerCase().trim();
      items = items.filter(j =>
        (j.softwareTools && j.softwareTools.some(t => t.toLowerCase().includes(sw))) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(sw)) ||
        j.description.toLowerCase().includes(sw)
      );
    }

    if (minSalary) {
      const min = Number(minSalary);
      items = items.filter(j => (j.salaryMax ?? j.salaryMin ?? 0) >= min);
    }

    const p = Math.max(1, parseInt(page as string) || 1);
    const size = Math.max(1, parseInt(pageSize as string) || 100);
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

  static ingestBatch(req: Request, res: Response) {
    const rawJobs = Array.isArray(req.body) ? req.body : (req.body.jobs || []);
    let count = 0;

    for (const raw of rawJobs) {
      if (!raw.title || !raw.company_name && !raw.companyName) continue;
      
      const company = raw.companyName || raw.company_name;
      const title = raw.title;
      const id = raw.id || `crawled-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const dedup = raw.dedup_hash || raw.dedupHash || `${company}-${title}-${raw.location_city || raw.locationCity || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if job already exists with this dedup hash
      let existingJob: Job | undefined;
      for (const j of db.jobs.values()) {
        if (j.dedupHash === dedup) {
          existingJob = j;
          break;
        }
      }

      const jobRecord: Job = {
        id: existingJob ? existingJob.id : id,
        sourceId: raw.source_id || raw.sourceId || 'crawled-feed',
        externalId: raw.external_id || raw.externalId,
        title: title,
        companyName: company,
        companyLogoUrl: raw.company_logo_url || raw.companyLogoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
        locationCity: raw.location_city || raw.locationCity || 'Frankfurt am Main',
        locationCountry: raw.location_country || raw.locationCountry || 'Germany',
        isRemote: raw.is_remote ?? (raw.workplace_type === 'Remote' || raw.workplaceType === 'Remote'),
        workplaceType: raw.workplace_type || raw.workplaceType || 'Hybrid',
        employmentType: raw.employment_type || raw.employmentType || 'FullTime',
        experienceLevel: raw.experience_level || raw.experienceLevel || 'MidLevel',
        salaryMin: raw.salary_min || raw.salaryMin,
        salaryMax: raw.salary_max || raw.salaryMax,
        salaryCurrency: raw.salary_currency || raw.salaryCurrency || 'EUR',
        requiredSkills: raw.required_skills || raw.requiredSkills || [],
        requiredLanguages: raw.required_languages || raw.requiredLanguages || [{ lang: 'English', level: 'Fluent' }],
        description: raw.description || `${title} at ${company}`,
        applicationUrl: raw.application_url || raw.applicationUrl || 'https://example-careers.de',
        postedAt: raw.posted_at || raw.postedAt || new Date().toISOString(),
        dedupHash: dedup,
        isActive: true,
        createdAt: existingJob ? existingJob.createdAt : new Date().toISOString()
      };

      db.jobs.set(jobRecord.id, jobRecord);
      count++;
    }

    res.json({
      success: true,
      message: `Ingested ${count} jobs successfully.`,
      data: { ingested: count, totalJobs: db.jobs.size }
    });
  }

  static async syncLiveSources(req: Request, res: Response) {
    try {
      const { syncedCount, purgedCount, results } = await LiveJobFetcher.ensureFreshRealtimeJobs(true);

      res.json({
        success: true,
        data: {
          syncedCount,
          purgedCount,
          totalJobsInPortal: db.jobs.size,
          ttlHours: 2.5,
          sources: results
        },
        message: `Synced ${syncedCount} live multi-sector jobs (2.5h TTL threshold active, ${purgedCount} expired jobs removed).`
      });
    } catch (err: any) {
      res.status(200).json({
        success: true,
        data: {
          syncedCount: 0,
          purgedCount: 0,
          totalJobsInPortal: db.jobs.size,
          sources: [{ source: 'Live Sync', fetchedCount: 0, status: 'error', error: err.message }]
        },
        message: 'Live sync completed with fallback to existing curated jobs.'
      });
    }
  }
}
