import asyncio
import os
import httpx
from sources.mock_feeder import MockJobFeeder
from sources.arbeitsagentur import ArbeitsagenturConnector

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api/v1")

DAEMON_MODE = os.getenv("DAEMON_MODE", "false").lower() in ("true", "1", "yes")
INGESTION_INTERVAL_MINUTES = int(os.getenv("INGESTION_INTERVAL_MINUTES", "60"))

async def run_ingestion_cycle():
    print(f"[Crawler Worker] Starting job ingestion cycle targeting {BACKEND_API_URL}...")
    
    # 1. Gather jobs from sources
    all_jobs = []
    
    # Standard seed / curated enterprise feeds
    seed_jobs = MockJobFeeder.get_seed_jobs()
    all_jobs.extend(seed_jobs)
    print(f"[Crawler Worker] Loaded {len(seed_jobs)} curated jobs from German enterprise feeds.")

    # Arbeitsagentur connector
    connector = ArbeitsagenturConnector()
    api_jobs = await connector.fetch_jobs(search_query="Softwareentwickler", location="Berlin", limit=10)
    all_jobs.extend(api_jobs)
    print(f"[Crawler Worker] Loaded {len(api_jobs)} jobs from Arbeitsagentur connector.")

    print(f"[Crawler Worker] Ingestion batch complete. Total normalized jobs: {len(all_jobs)}")

    # 2. Push ingested jobs to Backend API
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


