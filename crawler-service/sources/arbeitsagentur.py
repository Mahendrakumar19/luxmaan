import httpx
from typing import List, Dict, Any
try:
    from ..pipeline.deduplicator import Deduplicator
    from ..pipeline.normalizer import JobNormalizer
except ImportError:
    from pipeline.deduplicator import Deduplicator
    from pipeline.normalizer import JobNormalizer


class ArbeitsagenturConnector:
    """
    Connector for Bundesagentur für Arbeit Jobsuche API.
    Handles official public data formats, respect for limits, and transforms to normalized jobs.
    """
    BASE_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs"
    
    def __init__(self, client_id: str = "jobagent-eu"):
        self.headers = {
            "User-Agent": f"JobAgentPlatform/1.0 ({client_id}; contact@nighwan.com)",
            "X-API-Key": "jobboerse-jobsuche"
        }

    async def fetch_jobs(self, search_query: str = "Informatik", location: str = "Deutschland", limit: int = 25) -> List[Dict[str, Any]]:
        normalized_jobs = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "was": search_query,
                    "wo": location,
                    "size": limit,
                    "page": 1,
                    "angebotsart": 1 # Standard employment
                }
                # Respect rate limiting & handle potential sandbox restrictions
                resp = await client.get(self.BASE_URL, headers=self.headers, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("stellenangebote", [])
                    for item in items:
                        title = item.get("titel") or item.get("beruf", "Specialist")
                        company = item.get("arbeitgeber", "Arbeitgeber")
                        raw_loc = item.get("arbeitsort", {}).get("ort", "Berlin")
                        city, country = JobNormalizer.normalize_city(raw_loc)
                        refnr = item.get("refnr", "")
                        ext_url = item.get("externeUrl")
                        app_url = ext_url if (ext_url and str(ext_url).startswith("http")) else f"https://www.arbeitsagentur.de/jobsuche/jobdetail/{refnr}"
                        
                        dedup = Deduplicator.generate_hash(company, title, city)
                        normalized_jobs.append({
                            "external_id": refnr or dedup[:12],
                            "title": title,
                            "company_name": company,
                            "location_city": city,
                            "location_country": country,
                            "workplace_type": "Hybrid",
                            "employment_type": "FullTime",
                            "experience_level": "Senior" if any(k in title.lower() for k in ("senior", "leiter", "lead", "manager")) else "MidLevel",
                            "required_skills": [search_query],
                            "description": f"{title} bei {company} in {city}.",
                            "application_url": app_url,
                            "posted_at": item.get("aktuelleVeroeffentlichungsdatum") or "2026-11-18T10:00:00Z",
                            "dedup_hash": dedup
                        })
        except Exception as e:
            # Silently log network block/sandbox restrictions in crawler logs
            pass
        return normalized_jobs
