import { Job } from '../types/index.js';

export interface LiveFetchResult {
  source: string;
  fetchedCount: number;
  status: 'ok' | 'error';
  error?: string;
}

function inferSector(title: string, description: string, tags: string[] = []): string {
  const hay = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  if (/(aviation|aerospace|aircraft|airport|flight|luftfahrt|easa)/.test(hay)) return 'Aviation & Aerospace';
  if (/(finance|accounting|audit|controller|bank|tax|steuer|buchhaltung|fintech)/.test(hay)) return 'Finance & Consulting';
  if (/(logistics|supply chain|warehouse|transport|operations|einkauf|lager|logistik)/.test(hay)) return 'Logistics & Operations';
  if (/(nurse|doctor|pharma|medical|health|klinik|pflege|medizin)/.test(hay)) return 'Healthcare & Pharma';
  if (/(mechanical|electrical|civil|engineer|maschinenbau|elektrotechnik|bauingenieur|cad|solidworks)/.test(hay)) return 'Engineering & Manufacturing';
  if (/(sales|marketing|account manager|vertrieb|business development|seo|content)/.test(hay)) return 'Sales & Marketing';
  if (/(hr|human resources|recruiter|people|personal|talent)/.test(hay)) return 'HR & Management';
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
   * Fetches multi-sector European jobs from Arbeitnow public job board API.
   */
  static async fetchArbeitnow(): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const jobs: Job[] = [];
    try {
      const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)' },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) {
        return { jobs: [], result: { source: 'Arbeitnow EU', fetchedCount: 0, status: 'error', error: `HTTP ${res.status}` } };
      }
      const json: any = await res.json();
      const items = Array.isArray(json?.data) ? json.data.slice(0, 25) : [];

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

      return { jobs, result: { source: 'Arbeitnow EU', fetchedCount: jobs.length, status: 'ok' } };
    } catch (err: any) {
      return { jobs: [], result: { source: 'Arbeitnow EU', fetchedCount: 0, status: 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches multi-sector German jobs from Bundesagentur für Arbeit (Official German Federal Employment Agency API).
   */
  static async fetchArbeitsagentur(queries: string[] = ['Ingenieur', 'Projektmanager', 'Logistik', 'Finanzen', 'Software']): Promise<{ jobs: Job[]; result: LiveFetchResult }> {
    const jobs: Job[] = [];
    try {
      for (const q of queries) {
        const url = `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=${encodeURIComponent(q)}&wo=Deutschland&groesse=5&angebotsart=1`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'LuxmaanJobs/1.0 (contact@nighwan.com)',
            'X-API-Key': 'jobboerse-jobsuche'
          },
          signal: AbortSignal.timeout(5000)
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
            description: `${title} bei ${company} in ${city} (Offizielle Bundesagentur für Arbeit Meldung).`,
            applicationUrl: `https://www.arbeitsagentur.de/jobsuche/jobdetail/${refnr}`,
            postedAt: item.aktuelleVeroeffentlichungsdatum ? new Date(item.aktuelleVeroeffentlichungsdatum).toISOString() : new Date().toISOString(),
            dedupHash,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      return { jobs, result: { source: 'Bundesagentur für Arbeit (DE)', fetchedCount: jobs.length, status: jobs.length > 0 ? 'ok' : 'error', error: jobs.length === 0 ? 'No items returned' : undefined } };
    } catch (err: any) {
      return { jobs: [], result: { source: 'Bundesagentur für Arbeit (DE)', fetchedCount: 0, status: 'error', error: err.message || 'Timeout/Network error' } };
    }
  }

  /**
   * Fetches all trusted public European sources concurrently with full error isolation.
   */
  static async syncAllTrustedSources(): Promise<{ jobs: Job[]; totalIngested: number; results: LiveFetchResult[] }> {
    const [arbeitnowRes, baRes] = await Promise.all([
      this.fetchArbeitnow(),
      this.fetchArbeitsagentur()
    ]);

    const combined = [...arbeitnowRes.jobs, ...baRes.jobs];
    return {
      jobs: combined,
      totalIngested: combined.length,
      results: [arbeitnowRes.result, baRes.result]
    };
  }
}
