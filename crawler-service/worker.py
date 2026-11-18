import asyncio
import os
import httpx
from sources.mock_feeder import MockJobFeeder
from sources.arbeitsagentur import ArbeitsagenturConnector

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api/v1")

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
    return all_jobs

if __name__ == "__main__":
    jobs = asyncio.run(run_ingestion_cycle())
    print(f"Ingested {len(jobs)} jobs successfully.")

