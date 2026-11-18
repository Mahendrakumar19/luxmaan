import random
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
try:
    from ..pipeline.deduplicator import Deduplicator
except ImportError:
    from pipeline.deduplicator import Deduplicator


REALISTIC_JOBS = [
    {
        "title": "Senior Cloud Software Engineer (m/w/d) - .NET / AWS",
        "company_name": "Siemens AG",
        "company_logo_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
        "location_city": "Munich",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "Senior",
        "salary_min": 78000,
        "salary_max": 95000,
        "required_skills": ["C#", ".NET", "ASP.NET Core", "AWS", "Docker", "PostgreSQL", "Microservices"],
        "required_languages": [{"lang": "German", "level": "B2"}, {"lang": "English", "level": "Fluent"}],
        "description": "Wir suchen für unser Smart Infrastructure Team in München einen erfahrenen Senior Cloud Software Engineer. Sie gestalten moderne Cloud-native Architekturen auf Basis von C# / .NET 10 und AWS. Zusammenarbeit in agilen, internationalen Teams."
    },
    {
        "title": "Full-Stack Developer (React / TypeScript / Node.js)",
        "company_name": "Zalando SE",
        "company_logo_url": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
        "location_city": "Berlin",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "MidLevel",
        "salary_min": 68000,
        "salary_max": 82000,
        "required_skills": ["React", "Next.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
        "required_languages": [{"lang": "English", "level": "Fluent"}],
        "description": "Join Europe's leading online fashion platform in Berlin. You will build high-traffic frontend customer experiences using React, Next.js, and TypeScript, backed by distributed microservices."
    },
    {
        "title": "DevOps & Platform Engineer (Kubernetes, Terraform)",
        "company_name": "BMW Group",
        "company_logo_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop",
        "location_city": "Munich",
        "location_country": "Germany",
        "workplace_type": "OnSite",
        "employment_type": "FullTime",
        "experience_level": "Senior",
        "salary_min": 82000,
        "salary_max": 102000,
        "required_skills": ["Kubernetes", "Terraform", "Docker", "CI/CD", "Linux", "Azure", "GitOps"],
        "required_languages": [{"lang": "German", "level": "C1"}, {"lang": "English", "level": "Fluent"}],
        "description": "Gestalten Sie die Zukunft der Mobilität bei der BMW Group in München. Sie sind verantwortlich für unsere globalen Kubernetes-Cluster, CI/CD-Pipelines und Infrastructure as Code mit Terraform."
    },
    {
        "title": "AI / Machine Learning Engineer (NLP & Search)",
        "company_name": "Delivery Hero SE",
        "company_logo_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop",
        "location_city": "Berlin",
        "location_country": "Germany",
        "workplace_type": "Remote",
        "employment_type": "FullTime",
        "experience_level": "Senior",
        "salary_min": 85000,
        "salary_max": 110000,
        "required_skills": ["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "Docker", "PostgreSQL"],
        "required_languages": [{"lang": "English", "level": "Fluent"}],
        "description": "Delivery Hero is building next-generation quick commerce. As an AI/NLP Engineer, you will design vector embeddings, semantic search models, and recommendation algorithms serving millions of customers."
    },
    {
        "title": "Senior Java / Spring Boot Backend Engineer",
        "company_name": "SAP SE",
        "company_logo_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop",
        "location_city": "Frankfurt",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "Senior",
        "salary_min": 75000,
        "salary_max": 92000,
        "required_skills": ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker", "Microservices"],
        "required_languages": [{"lang": "German", "level": "B2"}, {"lang": "English", "level": "Fluent"}],
        "description": "Entwicklung unternehmenskritischer Cloud-Anwendungen bei der SAP. Konzeptionierung robuster Microservices-Architekturen mit Java 21, Spring Boot und Apache Kafka im Raum Frankfurt / Walldorf."
    },
    {
        "title": "Junior Frontend Developer (React / JavaScript)",
        "company_name": "Personio SE & Co. KG",
        "company_logo_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop",
        "location_city": "Munich",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "Junior",
        "salary_min": 52000,
        "salary_max": 62000,
        "required_skills": ["React", "JavaScript", "HTML5", "CSS3", "Git"],
        "required_languages": [{"lang": "English", "level": "Fluent"}, {"lang": "German", "level": "B1"}],
        "description": "Start your engineering career at Personio, Europe's leading HR tech unicorn. Collaborate with senior mentors to build elegant, accessible web user interfaces for HR professionals across the EU."
    },
    {
        "title": "Cybersecurity & Information Security Specialist",
        "company_name": "Allianz Technology SE",
        "company_logo_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop",
        "location_city": "Stuttgart",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "Senior",
        "salary_min": 80000,
        "salary_max": 98000,
        "required_skills": ["Linux", "Docker", "Prometheus", "Git", "Agile"],
        "required_languages": [{"lang": "German", "level": "C1"}, {"lang": "English", "level": "Fluent"}],
        "description": "Sicherstellung der Informationssicherheit und Datenschutz-Compliance (DSGVO) bei der Allianz. Überwachung und Härtung von Cloud-Infrastrukturen und Durchführung von Sicherheitsaudits."
    },
    {
        "title": "Data Engineer (Spark, Python, Airflow, SQL)",
        "company_name": "Bosch Group",
        "company_logo_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
        "location_city": "Stuttgart",
        "location_country": "Germany",
        "workplace_type": "Hybrid",
        "employment_type": "FullTime",
        "experience_level": "MidLevel",
        "salary_min": 70000,
        "salary_max": 85000,
        "required_skills": ["Python", "Spark", "Airflow", "PostgreSQL", "Kafka", "Docker"],
        "required_languages": [{"lang": "German", "level": "B2"}, {"lang": "English", "level": "Fluent"}],
        "description": "Bau skalierbarer ETL/ELT-Pipelines für IoT- und Industrie 4.0-Sensordaten bei Bosch in Stuttgart. Arbeiten mit Apache Spark, Kafka und cloudbasierten Data Warehouses."
    }
]

class MockJobFeeder:
    @staticmethod
    def get_seed_jobs() -> List[Dict[str, Any]]:
        jobs = []
        now = datetime.now(timezone.utc)
        for i, item in enumerate(REALISTIC_JOBS):
            dedup = Deduplicator.generate_hash(item["company_name"], item["title"], item["location_city"])
            posted_date = (now - timedelta(days=i * 2 + 1)).isoformat()
            jobs.append({
                "external_id": f"seed-{i+1}",
                "title": item["title"],
                "company_name": item["company_name"],
                "company_logo_url": item.get("company_logo_url"),
                "location_city": item["location_city"],
                "location_country": item["location_country"],
                "workplace_type": item["workplace_type"],
                "employment_type": item["employment_type"],
                "experience_level": item["experience_level"],
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "salary_currency": "EUR",
                "required_skills": item["required_skills"],
                "required_languages": item["required_languages"],
                "description": item["description"],
                "application_url": f"https://example-careers.de/jobs/{i+1}",
                "posted_at": posted_date,
                "dedup_hash": dedup,
                "is_active": True
            })
        return jobs
