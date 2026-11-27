import asyncio
import os
import httpx
from sources.mock_feeder import MockJobFeeder
from sources.arbeitsagentur import ArbeitsagenturConnector
from sources.arbeitnow import ArbeitnowConnector

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api/v1")

DAEMON_MODE = os.getenv("DAEMON_MODE", "false").lower() in ("true", "1", "yes")
INGESTION_INTERVAL_MINUTES = int(os.getenv("INGESTION_INTERVAL_MINUTES", "60"))

# Multi-sector queries covering Engineering, Project Management, Logistics, Finance, Healthcare, Aviation & IT
MULTI_SECTOR_QUERIES = [
    "Ingenieur",
    "Projektmanager",
    "Logistik",
    "Finanzen",
    "Gesundheitswesen",
    "Aviation",
    "Softwareentwickler"
]

async def run_ingestion_cycle():
    print(f"[Crawler Worker] Starting multi-sector job ingestion cycle targeting {BACKEND_API_URL}...")
    
    all_jobs = []
    
    # 1. Curated multi-sector European enterprise feeds
    seed_jobs = MockJobFeeder.get_seed_jobs()
    all_jobs.extend(seed_jobs)
    print(f"[Crawler Worker] Loaded {len(seed_jobs)} curated multi-sector jobs.")

    # 2. Bundesagentur für Arbeit (Official German Federal Employment Agency API) across sectors
    ba_connector = ArbeitsagenturConnector()
    for sector_query in MULTI_SECTOR_QUERIES:
        try:
            ba_jobs = await ba_connector.fetch_jobs(search_query=sector_query, location="Deutschland", limit=5)
            all_jobs.extend(ba_jobs)
        except Exception as e:
            print(f"[Crawler Worker] Arbeitsagentur skip for '{sector_query}': {e}")

    # 3. Arbeitnow EU Job Board (multi-sector European roles)
    arbeitnow_connector = ArbeitnowConnector()
    try:
        an_jobs = await arbeitnow_connector.fetch_jobs(limit=25)
        all_jobs.extend(an_jobs)
        print(f"[Crawler Worker] Loaded {len(an_jobs)} jobs from Arbeitnow EU connector.")
    except Exception as e:
        print(f"[Crawler Worker] Arbeitnow skip: {e}")

    print(f"[Crawler Worker] Ingestion batch complete. Total normalized multi-sector jobs: {len(all_jobs)}")

    # 4. Push ingested jobs to Backend API
    if all_jobs:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{BACKEND_API_URL}/jobs/ingest", json=all_jobs)
                if res.status_code == 200:
                    print(f"[Crawler Worker] Successfully posted {len(all_jobs)} jobs to backend database: {res.json().get('message')}")
                else:
                    print(f"[Crawler Worker] Backend returned status {res.status_code}: {res.text}")
        except Exception as net_err:
            print(f"[Crawler Worker] Could not connect to backend at {BACKEND_API_URL}: {net_err}")

    return all_jobs

async def main():
    while True:
        try:
            jobs = await run_ingestion_cycle()
            print(f"[Crawler Worker] Ingested {len(jobs)} jobs successfully.")
        except Exception as e:
            print(f"[Crawler Worker] Error in ingestion cycle: {e}")

        if not DAEMON_MODE:
            break

        print(f"[Crawler Worker] Sleeping for {INGESTION_INTERVAL_MINUTES} minutes...")
        await asyncio.sleep(INGESTION_INTERVAL_MINUTES * 60)

if __name__ == "__main__":
    asyncio.run(main())
