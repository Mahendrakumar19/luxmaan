import { Job } from '../types/index.js';
import { db } from '../db/store.js';

export const JOB_TTL_HOURS = 2.5;
export const JOB_TTL_MS = JOB_TTL_HOURS * 60 * 60 * 1000; // 2.5 hours threshold

let lastSyncedAtMs: number | null = null;
let activeSyncPromise: Promise<{ syncedCount: number; purgedCount: number; results: LiveFetchResult[] }> | null = null;

export interface LiveFetchResult {
  source: string;
  endpointUrl: string;
  fetchedCount: number;
  status: 'ok' | 'error';
  error?: string;
}

function inferSector(title: string, description: string, tags: string[] = []): string {
  const hay = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  if (/(aviation|aerospace|aircraft|airport|flight|luftfahrt|easa)/.test(hay)) return 'Aviation & Aerospace';
  if (/(finance|accounting|audit|controller|bank|tax|steuer|buchhaltung|fintech)/.test(hay)) return 'Finance & Consulting';
  if (/(logistics|supply chain|warehouse|transport|operations|einkauf|lager|logistik)/.test(hay)) return 'Logistics & Operations';
  if (/(nurse|doctor|pharma|medical|health|klinik|pflege|medizin|gesundheit)/.test(hay)) return 'Healthcare & Pharma';
  if (/(mechanical|electrical|civil|engineer|maschinenbau|elektrotechnik|bauingenieur|cad|solidworks|ingenieur)/.test(hay)) return 'Engineering & Manufacturing';
  if (/(sales|marketing|account manager|vertrieb|business development|seo|content)/.test(hay)) return 'Sales & Marketing';
  if (/(hr|human resources|recruiter|people|personal|talent|verwaltung)/.test(hay)) return 'HR & Management';
  if (/(project manager|projektmanager|scrum|agile|pmo|product owner)/.test(hay)) return 'Project Management';
  if (/(data|analytics|bi|machine learning|ai|scientist)/.test(hay)) return 'Data & Analytics';
  return 'IT & Software';
}

function normalizeWorkplace(remote: boolean, text: string): 'Remote' | 'Hybrid' | 'OnSite' {
  const lower = text.toLowerCase();
  if (remote || lower.includes('100% remote') || lower.includes('full remote')) return 'Remote';
  if (lower.includes('hybrid') || lower.includes('homeoffice') || lower.includes('home office')) return 'Hybrid';
  return 'OnSite';
}

export class LiveJobFetcher {
  /**
   * Fetches multi-sector European jobs from Arbeitnow public job board API (Paginated).
   */
  static async fetchArbeitnow(pages: number = 2): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const endpointBase = 'https://www.arbeitnow.com/api/job-board-api';
    const jobs: Job[] = [];
    try {
      for (let page = 1; page <= pages; page++) {
        const res = await fetch(`${endpointBase}?page=${page}`, {
          headers: { 'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)' },
          signal: AbortSignal.timeout(7000)
        });
        if (!res.ok) {
          if (page === 1) {
            return { jobs: [], result: { source: 'Arbeitnow EU', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: `HTTP ${res.status}` } };
          }
          break;
        }
        const json: any = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        if (items.length === 0) break;

        for (const item of items) {
          const title = String(item.title || '').trim();
          const company = String(item.company_name || '').trim();
          if (!title || !company) continue;

          const desc = String(item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const tags: string[] = Array.isArray(item.tags) ? item.tags.map(String) : [];
          const city = String(item.location || 'Germany').split(',')[0].trim() || 'Germany';
          const dedupHash = `${company}-${title}-${city}`.toLowerCase().replace(/[^a-z0-9]/g, '');

          jobs.push({
            id: `arbeitnow-${item.slug || dedupHash.slice(0, 16)}`,
            sourceId: 'src-arbeitnow',
            externalId: String(item.slug || dedupHash.slice(0, 16)),
            title,
            companyName: company,
            locationCity: city,
            locationCountry: 'Germany / EU',
            isRemote: Boolean(item.remote),
            workplaceType: normalizeWorkplace(Boolean(item.remote), `${title} ${desc}`),
            employmentType: 'FullTime',
            experienceLevel: /senior|lead|head|director|principal/i.test(title) ? 'Senior' : (/junior|intern|werkstudent/i.test(title) ? 'Junior' : 'MidLevel'),
            salaryCurrency: 'EUR',
            requiredSkills: tags.slice(0, 8),
            sector: inferSector(title, desc, tags),
            requiredLanguages: [{ lang: 'English', level: 'Fluent' }, { lang: 'German', level: 'B1' }],
            description: desc.slice(0, 500) || `${title} at ${company} in ${city}.`,
            applicationUrl: String(item.url || 'https://www.arbeitnow.com'),
            postedAt: item.created_at ? new Date(Number(item.created_at) * 1000).toISOString() : new Date().toISOString(),
            dedupHash,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      return { jobs, result: { source: 'Arbeitnow EU', endpointUrl: endpointBase, fetchedCount: jobs.length, status: 'ok' } };
    } catch (err: any) {
      return { jobs, result: { source: 'Arbeitnow EU', endpointUrl: endpointBase, fetchedCount: jobs.length, status: jobs.length > 0 ? 'ok' : 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches multi-sector German jobs from Bundesagentur für Arbeit (Official German Federal Employment Agency API).
   */
  static async fetchArbeitsagentur(
    queries: string[] = ['Ingenieur', 'Projektmanager', 'Logistik', 'Finanzen', 'Gesundheitswesen', 'Vertrieb', 'Software']
  ): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const endpointBase = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs';
    const jobs: Job[] = [];
    try {
      for (const q of queries) {
        const url = `${endpointBase}?was=${encodeURIComponent(q)}&wo=Deutschland&size=15&page=1&angebotsart=1`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)',
            'X-API-Key': 'jobboerse-jobsuche'
          },
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) continue;

        const json: any = await res.json();
        const items = Array.isArray(json?.stellenangebote) ? json.stellenangebote : [];

        for (const item of items) {
          const title = String(item.titel || item.beruf || '').trim();
          const company = String(item.arbeitgeber || 'Deutsches Unternehmen').trim();
          if (!title) continue;

          const city = String(item.arbeitsort?.ort || 'Deutschland').trim();
          const refnr = String(item.refnr || `${company}-${title}-${city}`.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16));
          const dedupHash = `${company}-${title}-${city}`.toLowerCase().replace(/[^a-z0-9]/g, '');
          const directUrl = item.externeUrl && String(item.externeUrl).startsWith('http')
            ? String(item.externeUrl)
            : `https://www.arbeitsagentur.de/jobsuche/jobdetail/${refnr}`;

          jobs.push({
            id: `ba-${refnr}`,
            sourceId: 'src-1',
            externalId: refnr,
            title,
            companyName: company,
            locationCity: city,
            locationCountry: 'Germany',
            isRemote: /remote|homeoffice/i.test(title),
            workplaceType: normalizeWorkplace(false, title),
            employmentType: 'FullTime',
            experienceLevel: /senior|leiter|lead|manager/i.test(title) ? 'Senior' : 'MidLevel',
            salaryCurrency: 'EUR',
            requiredSkills: [q],
            sector: inferSector(title, q, [q]),
            requiredLanguages: [{ lang: 'German', level: 'B2' }, { lang: 'English', level: 'B1' }],
            description: `${title} bei ${company} in ${city} (Bundesagentur für Arbeit).`,
            applicationUrl: directUrl,
            postedAt: item.aktuelleVeroeffentlichungsdatum ? new Date(item.aktuelleVeroeffentlichungsdatum).toISOString() : new Date().toISOString(),
            dedupHash,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      return {
        jobs,
        result: {
          source: 'Bundesagentur für Arbeit (DE)',
          endpointUrl: endpointBase,
          fetchedCount: jobs.length,
          status: jobs.length > 0 ? 'ok' : 'error',
          error: jobs.length === 0 ? 'No items returned' : undefined
        }
      };
    } catch (err: any) {
      return { jobs, result: { source: 'Bundesagentur für Arbeit (DE)', endpointUrl: endpointBase, fetchedCount: jobs.length, status: jobs.length > 0 ? 'ok' : 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches multi-category remote & European jobs from Remotive public API.
   */
  static async fetchRemotive(limit: number = 40): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const endpointBase = `https://remotive.com/api/remote-jobs?limit=${limit}`;
    const jobs: Job[] = [];
    try {
      const res = await fetch(endpointBase, {
        headers: { 'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)' },
        signal: AbortSignal.timeout(7000)
      });
      if (!res.ok) {
        return { jobs: [], result: { source: 'Remotive EU/Remote', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: `HTTP ${res.status}` } };
      }
      const json: any = await res.json();
      const items = Array.isArray(json?.jobs) ? json.jobs : [];

      for (const item of items) {
        const title = String(item.title || '').trim();
        const company = String(item.company_name || '').trim();
        if (!title || !company) continue;

        const location = String(item.candidate_required_location || 'Europe / Remote').trim();
        const desc = String(item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const tags: string[] = Array.isArray(item.tags) ? item.tags.map(String) : [];
        const category = String(item.category || '');
        const dedupHash = `${company}-${title}-${location}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        jobs.push({
          id: `remotive-${item.id || dedupHash.slice(0, 16)}`,
          sourceId: 'src-3',
          externalId: String(item.id || dedupHash.slice(0, 16)),
          title,
          companyName: company,
          companyLogoUrl: item.company_logo_url || undefined,
          locationCity: location.split(',')[0].trim() || 'Remote (EU)',
          locationCountry: 'Europe / Remote',
          isRemote: true,
          workplaceType: 'Remote',
          employmentType: 'FullTime',
          experienceLevel: /senior|lead|head|director/i.test(title) ? 'Senior' : 'MidLevel',
          salaryCurrency: 'EUR',
          requiredSkills: tags.length > 0 ? tags.slice(0, 6) : [category || 'Remote'],
          sector: inferSector(title, `${category} ${desc}`, tags),
          requiredLanguages: [{ lang: 'English', level: 'Fluent' }],
          description: desc.slice(0, 500) || `${title} at ${company} (${location}).`,
          applicationUrl: String(item.url || 'https://remotive.com'),
          postedAt: item.publication_date ? new Date(item.publication_date).toISOString() : new Date().toISOString(),
          dedupHash,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }

      return { jobs, result: { source: 'Remotive EU/Remote', endpointUrl: endpointBase, fetchedCount: jobs.length, status: 'ok' } };
    } catch (err: any) {
      return { jobs: [], result: { source: 'Remotive EU/Remote', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches multi-sector Swedish jobs from Arbetsförmedlingen JobTech Dev Open API (No API key required).
   */
  static async fetchSwedenJobTech(limit: number = 25): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const endpointBase = `https://jobsearch.api.jobtechdev.se/search?limit=${limit}`;
    const jobs: Job[] = [];
    try {
      const res = await fetch(endpointBase, {
        headers: { 'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6500)
      });
      if (!res.ok) {
        return { jobs: [], result: { source: 'Sweden JobTech Dev (Platsbanken)', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: `HTTP ${res.status}` } };
      }
      const json: any = await res.json();
      const hits = Array.isArray(json?.hits) ? json.hits : [];

      for (const item of hits) {
        const title = String(item.headline || '').trim();
        const company = String(item.employer?.name || 'Swedish Employer').trim();
        if (!title) continue;

        const city = String(item.workplace_address?.municipality || item.workplace_address?.city || 'Stockholm').trim();
        const desc = String(item.description?.text || '').replace(/\s+/g, ' ').trim();
        const occupation = String(item.occupation_field?.label || item.occupation?.label || '');
        const dedupHash = `${company}-${title}-${city}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        jobs.push({
          id: `se-jobtech-${item.id || dedupHash.slice(0, 16)}`,
          sourceId: 'src-4',
          externalId: String(item.id || dedupHash.slice(0, 16)),
          title,
          companyName: company,
          locationCity: city,
          locationCountry: 'Sweden',
          isRemote: /remote|distans/i.test(`${title} ${desc}`),
          workplaceType: normalizeWorkplace(/remote|distans/i.test(title), `${title} ${desc}`),
          employmentType: 'FullTime',
          experienceLevel: /senior|lead|chef|manager/i.test(title) ? 'Senior' : 'MidLevel',
          salaryCurrency: 'EUR',
          requiredSkills: occupation ? [occupation] : ['Sweden Market'],
          sector: inferSector(title, `${occupation} ${desc}`, [occupation]),
          requiredLanguages: [{ lang: 'English', level: 'Fluent' }, { lang: 'Swedish', level: 'B2' }],
          description: desc.slice(0, 500) || `${title} at ${company} in ${city}, Sweden.`,
          applicationUrl: String(item.webpage_url || item.application_details?.url || 'https://arbetsformedlingen.se/platsbanken'),
          postedAt: item.publication_date ? new Date(item.publication_date).toISOString() : new Date().toISOString(),
          dedupHash,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }

      return { jobs, result: { source: 'Sweden JobTech Dev (Platsbanken)', endpointUrl: endpointBase, fetchedCount: jobs.length, status: 'ok' } };
    } catch (err: any) {
      return { jobs: [], result: { source: 'Sweden JobTech Dev (Platsbanken)', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches Europe-wide multi-sector jobs from Jobicy Public EU API.
   */
  static async fetchJobicyEurope(count: number = 30): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const endpointBase = `https://jobicy.com/api/v2/remote-jobs?count=${count}&geo=europe`;
    const jobs: Job[] = [];
    try {
      const res = await fetch(endpointBase, {
        headers: { 'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)' },
        signal: AbortSignal.timeout(6500)
      });
      if (!res.ok) {
        return { jobs: [], result: { source: 'Jobicy Europe Feed', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: `HTTP ${res.status}` } };
      }
      const json: any = await res.json();
      const items = Array.isArray(json?.jobs) ? json.jobs : [];

      for (const item of items) {
        const title = String(item.jobTitle || '').trim();
        const company = String(item.companyName || '').trim();
        if (!title || !company) continue;

        const geo = String(item.jobGeo || 'Europe').trim();
        const desc = String(item.jobExcerpt || item.jobDescription || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const industries: string[] = Array.isArray(item.jobIndustry) ? item.jobIndustry.map(String) : [];
        const dedupHash = `${company}-${title}-${geo}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        jobs.push({
          id: `jobicy-${item.id || dedupHash.slice(0, 16)}`,
          sourceId: 'src-5',
          externalId: String(item.id || dedupHash.slice(0, 16)),
          title,
          companyName: company,
          companyLogoUrl: item.companyLogo || undefined,
          locationCity: geo.split(',')[0].trim() || 'Europe',
          locationCountry: 'Europe / Remote',
          isRemote: true,
          workplaceType: 'Remote',
          employmentType: 'FullTime',
          experienceLevel: /senior|lead|director|head/i.test(`${title} ${item.jobLevel || ''}`) ? 'Senior' : 'MidLevel',
          salaryMin: item.annualSalaryMin ? Number(item.annualSalaryMin) : undefined,
          salaryMax: item.annualSalaryMax ? Number(item.annualSalaryMax) : undefined,
          salaryCurrency: 'EUR',
          requiredSkills: industries.length > 0 ? industries.slice(0, 5) : ['Europe'],
          sector: inferSector(title, `${industries.join(' ')} ${desc}`, industries),
          requiredLanguages: [{ lang: 'English', level: 'Fluent' }],
          description: desc.slice(0, 500) || `${title} at ${company} (${geo}).`,
          applicationUrl: String(item.url || 'https://jobicy.com'),
          postedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          dedupHash,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }

      return { jobs, result: { source: 'Jobicy Europe Feed', endpointUrl: endpointBase, fetchedCount: jobs.length, status: 'ok' } };
    } catch (err: any) {
      return { jobs: [], result: { source: 'Jobicy Europe Feed', endpointUrl: endpointBase, fetchedCount: 0, status: 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches all trusted public European sources concurrently with full error isolation.
   */
  static async syncAllTrustedSources(): Promise<{ jobs: Job[]; totalIngested: number; results: LiveFetchResult[] }> {
    const [arbeitnowRes, baRes, remotiveRes, swedenRes, jobicyRes] = await Promise.all([
      this.fetchArbeitnow(2),
      this.fetchArbeitsagentur(),
      this.fetchRemotive(40),
      this.fetchSwedenJobTech(25),
      this.fetchJobicyEurope(30)
    ]);

    const combined = [
      ...arbeitnowRes.jobs,
      ...baRes.jobs,
      ...remotiveRes.jobs,
      ...swedenRes.jobs,
      ...jobicyRes.jobs
    ];
    return {
      jobs: combined,
      totalIngested: combined.length,
      results: [arbeitnowRes.result, baRes.result, remotiveRes.result, swedenRes.result, jobicyRes.result]
    };
  }

  /**
   * Purges expired jobs past the 2.5-hour threshold and automatically syncs fresh real-time jobs
   * when the threshold has elapsed (or when force=true).
   */
  static async ensureFreshRealtimeJobs(force: boolean = false): Promise<{ syncedCount: number; purgedCount: number; results: LiveFetchResult[] }> {
    const now = Date.now();

    // 1. Remove expired jobs past the 2.5h threshold
    let purgedCount = 0;
    for (const [id, job] of db.jobs.entries()) {
      if (job.expiresAt && now > new Date(job.expiresAt).getTime()) {
        db.jobs.delete(id);
        purgedCount++;
      }
    }

    // 2. If within 2.5h threshold and not forced, return immediately from cache
    if (!force && lastSyncedAtMs !== null && (now - lastSyncedAtMs) < JOB_TTL_MS) {
      return { syncedCount: 0, purgedCount, results: [] };
    }

    // Deduplicate concurrent sync calls
    if (activeSyncPromise) {
      return activeSyncPromise;
    }

    activeSyncPromise = (async () => {
      try {
        const { jobs, results } = await this.syncAllTrustedSources();
        const expiryIso = new Date(Date.now() + JOB_TTL_MS).toISOString();
        let syncedCount = 0;

        for (const job of jobs) {
          const stampedJob: Job = { ...job, expiresAt: expiryIso };
          let existing: Job | undefined;
          for (const j of db.jobs.values()) {
            if (j.dedupHash === job.dedupHash) {
              existing = j;
              break;
            }
          }
          if (existing) {
            db.jobs.set(existing.id, { ...stampedJob, id: existing.id, createdAt: existing.createdAt });
          } else {
            db.jobs.set(stampedJob.id, stampedJob);
          }
          syncedCount++;
        }

        // Update source stats dynamically
        for (const r of results) {
          const src = Array.from(db.sources.values()).find(s =>
            (r.source.includes('Bundesagentur') && s.id === 'src-1') ||
            (r.source.includes('Arbeitnow') && s.id === 'src-2') ||
            (r.source.includes('Remotive') && s.id === 'src-3') ||
            (r.source.includes('JobTech') && s.id === 'src-4') ||
            (r.source.includes('Jobicy') && s.id === 'src-5')
          );
          if (src) {
            src.lastSuccessfulRunAt = new Date().toISOString();
            src.totalJobsCollected = r.fetchedCount;
            src.lastErrorLog = r.status === 'error' ? r.error : undefined;
            db.sources.set(src.id, src);
          }
        }

        lastSyncedAtMs = Date.now();
        return { syncedCount, purgedCount, results };
      } finally {
        activeSyncPromise = null;
      }
    })();

    return activeSyncPromise;
  }
}
