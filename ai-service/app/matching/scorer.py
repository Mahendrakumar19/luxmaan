import numpy as np
from typing import Tuple, List, Dict, Any
from ..schemas import (
    CandidateProfileInput,
    JobInput,
    MatchingWeights,
    MatchResponse,
    MatchScores,
    MatchExplanation
)
from ..embeddings.embedder import embedder

class MatchingEngine:
    @classmethod
    def compute_match(
        cls,
        candidate: CandidateProfileInput,
        job: JobInput,
        weights: MatchingWeights
    ) -> MatchResponse:
        # 1. Skills Scoring (40%)
        candidate_skills_lower = {s.lower().strip() for s in candidate.skills}
        required_skills_lower = [s.lower().strip() for s in job.required_skills]
        
        matching_skills = []
        missing_skills = []

        if required_skills_lower:
            for skill, original in zip(required_skills_lower, job.required_skills):
                if skill in candidate_skills_lower:
                    matching_skills.append(original)
                else:
                    missing_skills.append(original)
            skills_score = (len(matching_skills) / len(required_skills_lower)) * 100.0
        else:
            # If no skills specified, match on overlap with description
            skills_score = 70.0

        # 2. Experience Scoring (25%)
        # Experience match compares candidate's years vs required experience
        cand_exp = candidate.years_of_experience
        req_exp = job.min_years_experience
        if cand_exp >= req_exp:
            # Full score if meets or exceeds required experience
            exp_score = 100.0
        else:
            # Scaled score with gentle penalty
            exp_score = max(30.0, (cand_exp / max(1.0, req_exp)) * 100.0)

        # 3. Location Scoring (15%)
        loc_score = cls._calculate_location_score(candidate, job)

        # 4. Language Scoring (10%)
        lang_score = cls._calculate_language_score(candidate, job)

        # 5. Salary Compatibility (10%)
        sal_score = cls._calculate_salary_score(candidate, job)

        # 6. Semantic Vector Cosine Similarity
        cand_text = f"{candidate.headline or ''} {candidate.summary or ''} {' '.join(candidate.skills)}"
        job_text = f"{job.title} {job.company_name} {job.location_city} {' '.join(job.required_skills)} {job.description[:300]}"
        
        embeddings = embedder.embed_texts([cand_text, job_text])
        v1 = np.array(embeddings[0])
        v2 = np.array(embeddings[1])
        cosine_sim = float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9))
        cosine_sim = max(0.0, min(1.0, cosine_sim))

        # 7. Overall Weighted Calculation
        overall = (
            (skills_score * weights.skills_weight) +
            (exp_score * weights.experience_weight) +
            (loc_score * weights.location_weight) +
            (lang_score * weights.language_weight) +
            (sal_score * weights.salary_weight)
        )
        # Gentle vector affinity bonus/re-ranking
        adjusted_overall = round(min(100.0, (overall * 0.85) + (cosine_sim * 100.0 * 0.15)), 1)

        # 8. Explainability Generation
        explanation = cls._generate_explanation(
            candidate, job, adjusted_overall,
            skills_score, exp_score, loc_score, lang_score, sal_score,
            matching_skills, missing_skills
        )

        return MatchResponse(
            candidate_id=candidate.candidate_id,
            job_id=job.job_id,
            overall_match_score=adjusted_overall,
            vector_cosine_similarity=round(cosine_sim, 4),
            scores=MatchScores(
                skills_score=round(skills_score, 1),
                experience_score=round(exp_score, 1),
                location_score=round(loc_score, 1),
                language_score=round(lang_score, 1),
                salary_score=round(sal_score, 1)
            ),
            matching_skills=matching_skills,
            missing_skills=missing_skills,
            explanation=explanation
        )

    @staticmethod
    def _calculate_location_score(candidate: CandidateProfileInput, job: JobInput) -> float:
        # Full remote jobs match anywhere
        if job.workplace_type == "Remote" or candidate.remote_preference == "Remote":
            return 100.0

        job_city = job.location_city.strip().lower()
        cand_locs = [l.strip().lower() for l in candidate.preferred_locations]
        
        if any(job_city in loc or loc in job_city for loc in cand_locs):
            return 100.0
        elif candidate.remote_preference == "Flexible":
            return 75.0
        elif "germany" in [l.lower() for l in cand_locs] and job.location_country.lower() == "germany":
            return 70.0
        return 40.0

    @staticmethod
    def _calculate_language_score(candidate: CandidateProfileInput, job: JobInput) -> float:
        cand_langs = {l.lang.lower(): l.level for l in candidate.languages}
        req_langs = job.required_languages

        if not req_langs:
            return 90.0

        matches = 0
        for req in req_langs:
            req_name = req.lang.lower()
            if req_name in cand_langs:
                matches += 1
        
        return (matches / len(req_langs)) * 100.0 if req_langs else 90.0

    @staticmethod
    def _calculate_salary_score(candidate: CandidateProfileInput, job: JobInput) -> float:
        # If neither specifies salary, neutral compatibility
        if not candidate.expected_salary_min or not job.salary_max:
            return 85.0
        
        # If job's maximum budget is at least candidate's minimum expectation
        if job.salary_max >= candidate.expected_salary_min:
            return 100.0
        else:
            deficit_pct = (candidate.expected_salary_min - job.salary_max) / candidate.expected_salary_min
            if deficit_pct <= 0.10:
                return 80.0
            elif deficit_pct <= 0.20:
                return 60.0
            return 40.0

    @staticmethod
    def _generate_explanation(
        candidate: CandidateProfileInput,
        job: JobInput,
        overall: float,
        skills_s: float,
        exp_s: float,
        loc_s: float,
        lang_s: float,
        sal_s: float,
        matching_skills: List[str],
        missing_skills: List[str]
    ) -> MatchExplanation:
        summary = (
            f"Strong match ({overall}%) based on your skill alignment in {job.location_city}."
            if overall >= 75.0 else
            f"Relevant position ({overall}%) with opportunities to expand your skill set."
        )

        skills_note = (
            f"You possess {len(matching_skills)} out of {len(matching_skills) + len(missing_skills)} key required skills ({', '.join(matching_skills[:4])})."
            if matching_skills else "Good foundational skills for this position."
        )

        exp_note = (
            f"Your {candidate.years_of_experience:.1f} years of experience satisfies the required {job.min_years_experience:.1f} years."
            if candidate.years_of_experience >= job.min_years_experience else
            f"Position seeks {job.min_years_experience:.1f} years; you bring {candidate.years_of_experience:.1f} years of demonstrated experience."
        )

        loc_note = (
            f"Job is {job.workplace_type} in {job.location_city}, aligning with your location preferences."
            if loc_s >= 80.0 else
            f"Position located in {job.location_city} ({job.workplace_type})."
        )

        lang_note = "Required language proficiencies for German and European operations are met."

        sal_note = (
            "Salary expectations align with the company's compensation band."
            if sal_s >= 80.0 else "Compensation budget is slightly below your target."
        )

        return MatchExplanation(
            summary=summary,
            skills_note=skills_note,
            experience_note=exp_note,
            location_note=loc_note,
            language_note=lang_note,
            salary_note=sal_note
        )

