from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LanguageSkill(BaseModel):
    lang: str
    level: str  # A1, A2, B1, B2, C1, C2, Native, Fluent

class ParsedEducation(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None

class ParsedExperience(BaseModel):
    company: str
    job_title: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)

class ParsedResumeResponse(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    years_of_experience: float = 0.0
    experiences: List[ParsedExperience] = Field(default_factory=list)
    educations: List[ParsedEducation] = Field(default_factory=list)
    languages: List[LanguageSkill] = Field(default_factory=list)
    raw_text: str

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int
    model_version: str

class MatchingWeights(BaseModel):
    skills_weight: float = 0.40
    experience_weight: float = 0.25
    location_weight: float = 0.15
    language_weight: float = 0.10
    salary_weight: float = 0.10

class CandidateProfileInput(BaseModel):
    candidate_id: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    years_of_experience: float = 0.0
    preferred_locations: List[str] = Field(default_factory=list)
    remote_preference: str = "Flexible"  # OnSite, Hybrid, Remote, Flexible
    expected_salary_min: Optional[int] = None
    expected_salary_max: Optional[int] = None
    languages: List[LanguageSkill] = Field(default_factory=list)

class JobInput(BaseModel):
    job_id: str
    title: str
    company_name: str
    location_city: str
    location_country: str = "Germany"
    workplace_type: str = "OnSite"  # OnSite, Hybrid, Remote
    experience_level: str = "MidLevel"  # Junior, MidLevel, Senior, Lead
    min_years_experience: float = 2.0
    required_skills: List[str] = Field(default_factory=list)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_languages: List[LanguageSkill] = Field(default_factory=list)
    description: str

class MatchRequest(BaseModel):
    candidate: CandidateProfileInput
    job: JobInput
    weights: MatchingWeights = Field(default_factory=MatchingWeights)

class MatchScores(BaseModel):
    skills_score: float
    experience_score: float
    location_score: float
    language_score: float
    salary_score: float

class MatchExplanation(BaseModel):
    summary: str
    skills_note: str
    experience_note: str
    location_note: str
    language_note: str
    salary_note: str

class MatchResponse(BaseModel):
    candidate_id: str
    job_id: str
    overall_match_score: float
    vector_cosine_similarity: float
    scores: MatchScores
    matching_skills: List[str]
    missing_skills: List[str]
    explanation: MatchExplanation

