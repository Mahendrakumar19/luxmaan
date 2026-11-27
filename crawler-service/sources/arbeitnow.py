import httpx
import re
from typing import List, Dict, Any
try:
    from ..pipeline.deduplicator import Deduplicator
    from ..pipeline.normalizer import JobNormalizer
except ImportError:
    from pipeline.deduplicator import Deduplicator
    from pipeline.normalizer import JobNormalizer


class ArbeitnowConnector:
    """
    Connector for Arbeitnow EU / German Job Board public API.
    Covers multiple sectors: Engineering, Finance, Logistics, Healthcare, Marketing, HR, IT.
    """
    BASE_URL = "https://www.arbeitnow.com/api/job-board-api"

    async def fetch_jobs(self, limit: int = 25) -> List[Dict[str, Any]]:
        normalized_jobs: List[Dict[str, Any]] = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    self.BASE_URL,
                    headers={"User-Agent": "LuxmaanJobs/1.0 (contact@nighwan.com)"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("data", [])[:limit]
                    for item in items:
                        title = str(item.get("title", "")).strip()
                        company = str(item.get("company_name", "")).strip()
                        if not title or not company:
                            continue

                        raw_loc = str(item.get("location", "Germany"))
                        city, country = JobNormalizer.normalize_city(raw_loc)
                        raw_desc = str(item.get("description", ""))
                        clean_desc = re.sub(r"<[^>]+>", " ", raw_desc)
                        clean_desc = re.sub(r"\s+", " ", clean_desc).strip()[:500]
                        tags = [str(t) for t in (item.get("tags") or [])][:8]

                        dedup = Deduplicator.generate_hash(company, title, city)
                        is_remote = bool(item.get("remote", False))
                        normalized_jobs.append({
                            "external_id": str(item.get("slug", dedup[:12])),
                            "title": title,
                            "company_name": company,
                            "location_city": city,
                            "location_country": country,
                            "is_remote": is_remote,
                            "workplace_type": "Remote" if is_remote else "Hybrid",
                            "employment_type": "FullTime",
                            "experience_level": "Senior" if any(k in title.lower() for k in ("senior", "lead", "head", "manager")) else "MidLevel",
                            "required_skills": tags,
                            "description": clean_desc or f"{title} at {company} in {city}.",
                            "application_url": str(item.get("url", "https://www.arbeitnow.com")),
                            "dedup_hash": dedup
                        })
        except Exception as e:
            print(f"[ArbeitnowConnector] Graceful skip due to network/sandbox: {e}")
        return normalized_jobs
