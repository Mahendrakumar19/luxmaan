import re
import io
from typing import List, Dict, Any, Tuple, Optional
from ..schemas import ParsedResumeResponse, ParsedExperience, ParsedEducation, LanguageSkill

# Comprehensive skill taxonomy for European / German tech market
KNOWN_SKILLS = [
    # Languages & Frameworks
    "Python", "C#", ".NET", "ASP.NET Core", "Java", "Spring Boot", "TypeScript", "JavaScript",
    "React", "Next.js", "Vue.js", "Angular", "Node.js", "Go", "Golang", "Rust", "PHP", "Laravel",
    "Swift", "Kotlin", "C++", "C", "HTML5", "CSS3", "Sass", "Tailwind CSS",
    # Cloud & DevOps
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible", "CI/CD",
    "GitHub Actions", "GitLab CI", "Linux", "Bash", "Prometheus", "Grafana", "Helm",
    # Databases & Storage
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "OpenSearch",
    "MSSQL", "SQL Server", "Oracle", "Cassandra", "DynamoDB", "SQLite", "pgvector",
    # AI / ML & Data
    "Machine Learning", "Deep Learning", "NLP", "PyTorch", "TensorFlow", "Pandas",
    "NumPy", "Scikit-Learn", "FastAPI", "Flask", "Kafka", "RabbitMQ", "Spark", "Airflow",
    # Architecture & Practices
    "Microservices", "REST API", "GraphQL", "gRPC", "Clean Architecture", "Domain-Driven Design",
    "TDD", "Agile", "Scrum", "Kanban", "Jira", "Git", "GitOps", "DevOps",
    # German Enterprise
    "SAP", "SAP S/4HANA", "ABAP", "Salesforce", "Power BI", "Tableau"
]

GERMAN_CITIES = [
    "Berlin", "München", "Munich", "Hamburg", "Frankfurt", "Köln", "Cologne",
    "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden",
    "Hannover", "Nürnberg", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
    "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Aachen"
]

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = "\n".join([page.extract_text() or "" for page in reader.pages])
            return text.strip()
        except Exception:
            # Fallback text decoder
            try:
                return pdf_bytes.decode('utf-8', errors='ignore')
            except Exception:
                return ""

    @staticmethod
    def extract_text_from_docx(docx_bytes: bytes) -> str:
        try:
            import docx
            doc = docx.Document(io.BytesIO(docx_bytes))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        except Exception:
            try:
                return docx_bytes.decode('utf-8', errors='ignore')
            except Exception:
                return ""

    @classmethod
    def parse(cls, raw_text: str) -> ParsedResumeResponse:
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        
        # 1. Contact information
        email = cls._extract_email(raw_text)
        phone = cls._extract_phone(raw_text)
        first_name, last_name = cls._extract_name(lines, email)

        # 2. Skills
        extracted_skills = cls._extract_skills(raw_text)

        # 3. Languages
        languages = cls._extract_languages(raw_text)

        # 4. Work experiences & Educations
        experiences, years_exp = cls._extract_experiences(lines, raw_text)
        educations = cls._extract_educations(lines, raw_text)

        # 5. Headline & Summary
        headline = cls._extract_headline(lines, extracted_skills)
        summary = cls._extract_summary(lines)

        return ParsedResumeResponse(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            headline=headline,
            summary=summary,
            skills=extracted_skills,
            years_of_experience=years_exp,
            experiences=experiences,
            educations=educations,
            languages=languages,
            raw_text=raw_text[:4000] # preview limit
        )

    @staticmethod
    def _extract_email(text: str) -> Optional[str]:
        match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        return match.group(0) if match else None

    @staticmethod
    def _extract_phone(text: str) -> Optional[str]:
        # Matches +49 171 1234567, 0171-1234567, (+49) ...
        match = re.search(r'(?:\+49|0049|0)\s*\(?[0-9]{2,5}\)?\s*[-.\s]?[0-9]{2,5}[-.\s]?[0-9]{3,7}', text)
        return match.group(0).strip() if match else None

    @staticmethod
    def _extract_name(lines: List[str], email: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        if lines:
            first_line = lines[0].strip()
            # If line is not an email or phone and has 2-3 words
            parts = first_line.split()
            if 2 <= len(parts) <= 3 and not any(char.isdigit() or char == '@' for char in first_line):
                return parts[0], " ".join(parts[1:])
        if email:
            prefix = email.split('@')[0]
            if '.' in prefix:
                f, l = prefix.split('.', 1)
                return f.capitalize(), l.capitalize()
        return "Candidate", "User"

    @staticmethod
    def _extract_skills(text: str) -> List[str]:
        found = set()
        text_lower = " " + text.lower() + " "
        for skill in KNOWN_SKILLS:
            # Match boundary
            pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?:\b|[^a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                found.add(skill)
        return sorted(list(found))

    @staticmethod
    def _extract_languages(text: str) -> List[LanguageSkill]:
        langs = []
        text_lower = text.lower()
        
        # Check German
        if any(term in text_lower for term in ["deutsch", "german"]):
            level = "Fluent"
            if "c2" in text_lower or "muttersprache" in text_lower or "native" in text_lower:
                level = "Native / C2"
            elif "c1" in text_lower or "verhandlungssicher" in text_lower:
                level = "C1"
            elif "b2" in text_lower or "fließend" in text_lower:
                level = "B2"
            elif "b1" in text_lower:
                level = "B1"
            langs.append(LanguageSkill(lang="German", level=level))

        # Check English
        if any(term in text_lower for term in ["englisch", "english"]):
            level = "Fluent"
            if "c2" in text_lower or "native" in text_lower:
                level = "C2 / Native"
            elif "c1" in text_lower or "fluent" in text_lower:
                level = "C1"
            elif "b2" in text_lower:
                level = "B2"
            langs.append(LanguageSkill(lang="English", level=level))

        if not langs:
            # Default assumption in DE/EU context
            langs.append(LanguageSkill(lang="English", level="Fluent"))
            langs.append(LanguageSkill(lang="German", level="B1"))

        return langs

    @staticmethod
    def _extract_experiences(lines: List[str], raw_text: str) -> Tuple[List[ParsedExperience], float]:
        experiences = []
        total_years = 3.0  # sensible fallback

        # Simple pattern recognition for experience blocks
        current_company = None
        current_title = None

        date_pattern = re.compile(r'((?:19|20)\d{2})\s*[-–]\s*((?:19|20)\d{2}|[Pp]resent|[Hh]eute|[Aa]ktuell)')
        matches = date_pattern.findall(raw_text)
        if matches:
            calculated_years = 0.0
            for start_yr, end_str in matches:
                s = int(start_yr)
                e = 2026 if any(term in end_str.lower() for term in ["present", "heute", "aktuell"]) else int(end_str)
                diff = max(0.5, float(e - s))
                calculated_years += diff
            total_years = min(25.0, round(calculated_years, 1))

        # Parse structural snippets
        for line in lines:
            if any(term in line.lower() for term in ["engineer", "developer", "architect", "lead", "manager", "entwickler", "consultant"]):
                if not current_title:
                    current_title = line
                elif not current_company:
                    current_company = line

        if current_title:
            experiences.append(ParsedExperience(
                company=current_company or "Technology Company",
                job_title=current_title,
                location="Germany",
                start_date="2021",
                end_date="Present",
                is_current=True,
                description="Engineering and system development.",
                skills=[]
            ))

        return experiences, total_years

    @staticmethod
    def _extract_educations(lines: List[str], raw_text: str) -> List[ParsedEducation]:
        educations = []
        edu_keywords = ["bachelor", "master", "b.sc", "m.sc", "phd", "diplom", "universität", "university", "hochschule"]
        for line in lines:
            line_l = line.lower()
            if any(k in line_l for k in edu_keywords):
                degree = "Bachelor / Master"
                if "master" in line_l or "m.sc" in line_l:
                    degree = "Master of Science"
                elif "bachelor" in line_l or "b.sc" in line_l:
                    degree = "Bachelor of Science"
                elif "phd" in line_l or "doktor" in line_l:
                    degree = "Doctorate (PhD)"

                educations.append(ParsedEducation(
                    institution=line[:120],
                    degree=degree,
                    field_of_study="Computer Science / Engineering"
                ))
                if len(educations) >= 2:
                    break
        return educations

    @staticmethod
    def _extract_headline(lines: List[str], skills: List[str]) -> str:
        for line in lines[1:5]:
            if any(term in line.lower() for term in ["engineer", "developer", "specialist", "architect", "manager", "entwickler"]):
                return line[:100]
        if skills:
            top_skills = ", ".join(skills[:3])
            return f"Software Engineer ({top_skills})"
        return "Experienced Professional"

    @staticmethod
    def _extract_summary(lines: List[str]) -> str:
        for i, line in enumerate(lines):
            if any(term in line.lower() for term in ["summary", "profil", "über mich", "about me", "kurzprofil"]):
                if i + 1 < len(lines):
                    return " ".join(lines[i+1:i+4])[:500]
        return "Motivated engineering professional focused on high-quality software solutions in Germany and the EU."

