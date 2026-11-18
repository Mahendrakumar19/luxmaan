import sys
import os
import unittest
from datetime import datetime

# Add paths
sys.path.append(os.path.abspath("ai-service"))
sys.path.append(os.path.abspath("crawler-service"))

from app.parsers.resume_parser import ResumeParser
from app.embeddings.embedder import embedder, DIMENSIONS
from app.matching.scorer import MatchingEngine
from app.schemas import CandidateProfileInput, JobInput, MatchingWeights, LanguageSkill
from pipeline.deduplicator import Deduplicator
from pipeline.normalizer import JobNormalizer

class TestPlatformComponents(unittest.TestCase):

    def test_resume_parser_german_english(self):
        sample_cv = """
        Maximilian Weber
        maximilian.weber@tech-berlin.de
        +49 170 1234567
        Berlin, Deutschland

        BERUFLICHE ERFAHRUNG
        Senior Cloud Architekt (2019 - Heute)
        Siemens AG, Berlin
        Konzeption von Cloud-Infrastrukturen mit C#, .NET, Docker, Kubernetes und AWS.
        Microservices-Architektur und PostgreSQL Datenbanken.

        AUSBILDUNG
        Master of Science in Wirtschaftsinformatik (2017 - 2019)
        Technische Universität Berlin

        SPRACHKENNTNISSE
        Deutsch: Muttersprache (C2)
        Englisch: Verhandlungssicher (C1)
        """

        parsed = ResumeParser.parse(sample_cv)
        self.assertEqual(parsed.first_name, "Maximilian")
        self.assertEqual(parsed.last_name, "Weber")
        self.assertEqual(parsed.email, "maximilian.weber@tech-berlin.de")
        self.assertIn("C#", parsed.skills)
        self.assertIn(".NET", parsed.skills)
        self.assertIn("Docker", parsed.skills)
        self.assertIn("Kubernetes", parsed.skills)
        self.assertIn("AWS", parsed.skills)
        self.assertIn("PostgreSQL", parsed.skills)

        # Verify languages
        lang_dict = {l.lang: l.level for l in parsed.languages}
        self.assertIn("German", lang_dict)
        self.assertIn("English", lang_dict)
        self.assertTrue(parsed.years_of_experience >= 5.0)

    def test_multilingual_embeddings(self):
        texts = [
            "Senior C# .NET Cloud Entwickler in München",
            "Fullstack React TypeScript Software Engineer in Berlin"
        ]
        embeddings = embedder.embed_texts(texts)
        self.assertEqual(len(embeddings), 2)
        self.assertEqual(len(embeddings[0]), DIMENSIONS)
        self.assertEqual(len(embeddings[1]), DIMENSIONS)

    def test_hybrid_matching_and_weights(self):
        candidate = CandidateProfileInput(
            candidate_id="cand-123",
            headline="Senior .NET Cloud Developer",
            skills=["C#", ".NET", "PostgreSQL", "Docker", "AWS"],
            years_of_experience=6.0,
            preferred_locations=["Munich", "Remote"],
            remote_preference="Hybrid",
            expected_salary_min=80000,
            languages=[LanguageSkill(lang="German", level="C1"), LanguageSkill(lang="English", level="Fluent")]
        )

        job = JobInput(
            job_id="job-456",
            title="Senior Cloud Engineer (m/w/d)",
            company_name="Siemens AG",
            location_city="Munich",
            workplace_type="Hybrid",
            min_years_experience=5.0,
            required_skills=["C#", ".NET", "PostgreSQL", "Docker", "Kubernetes"],
            salary_max=95000,
            required_languages=[LanguageSkill(lang="German", level="B2")],
            description="Entwicklung von Cloud-Lösungen bei Siemens."
        )

        weights = MatchingWeights(
            skills_weight=0.40,
            experience_weight=0.25,
            location_weight=0.15,
            language_weight=0.10,
            salary_weight=0.10
        )

        match = MatchingEngine.compute_match(candidate, job, weights)
        self.assertTrue(match.overall_match_score >= 80.0)
        self.assertIn("C#", match.matching_skills)
        self.assertIn(".NET", match.matching_skills)
        self.assertIn("Kubernetes", match.missing_skills)
        self.assertTrue(len(match.explanation.summary) > 0)
        self.assertTrue("Munich" in match.explanation.location_note)

    def test_deduplicator_hash(self):
        h1 = Deduplicator.generate_hash("Siemens AG", "Senior .NET Developer", "Munich")
        h2 = Deduplicator.generate_hash("Siemens   AG!", "senior .net developer", "munich")
        h3 = Deduplicator.generate_hash("BMW Group", "Senior .NET Developer", "Munich")

        self.assertEqual(h1, h2, "Whitespace, punctuation and case differences must yield identical fingerprint")
        self.assertNotEqual(h1, h3, "Different companies must yield different fingerprints")

    def test_job_normalizer(self):
        city, country = JobNormalizer.normalize_city("München, Bayern")
        self.assertEqual(city, "Munich")
        self.assertEqual(country, "Germany")

        city_berlin, _ = JobNormalizer.normalize_city("Berlin Mitte")
        self.assertEqual(city_berlin, "Berlin")

        min_s, max_s = JobNormalizer.normalize_salary("€ 75.000 - 90.000 / Jahr")
        self.assertEqual(min_s, 75000)
        self.assertEqual(max_s, 90000)

if __name__ == "__main__":
    unittest.main()
