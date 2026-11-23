import re
import io
from typing import List, Dict, Any, Tuple, Optional
from ..schemas import ParsedResumeResponse, ParsedExperience, ParsedEducation, LanguageSkill

# Comprehensive skill taxonomy for Germany & European Union (EU) tech market
KNOWN_SKILLS = [
    # Languages & Core Runtimes
    "Python", "C#", ".NET", "ASP.NET Core", "Java", "Spring Boot", "TypeScript", "JavaScript",
    "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "Go", "Golang", 
    "Rust", "PHP", "Laravel", "Symfony", "Swift", "Kotlin", "C++", "C", "HTML5", "CSS3", 
    "Sass", "Tailwind CSS", "Dart", "Flutter", "Scala", "R", "SQL", "Bash", "Shell",
    # Cloud & DevOps
    "Docker", "Kubernetes", "K8s", "AWS", "Azure", "GCP", "Google Cloud", "Terraform", "Ansible", 
    "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Linux", "Prometheus", "Grafana", 
    "Helm", "OpenShift", "ArgoCD", "CloudFormation",
    # Databases & Storage
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "OpenSearch", "MSSQL", 
    "SQL Server", "Oracle", "Cassandra", "DynamoDB", "SQLite", "pgvector", "Snowflake", 
    "Databricks", "BigQuery",
    # AI, ML & Data Engineering
    "Machine Learning", "Deep Learning", "NLP", "LLM", "RAG", "PyTorch", "TensorFlow", 
    "Scikit-Learn", "Pandas", "NumPy", "FastAPI", "Flask", "Kafka", "RabbitMQ", "Spark", 
    "Airflow", "Hugging Face", "LangChain", "Vector Search",
    # Architecture & Practices
    "Microservices", "REST API", "GraphQL", "gRPC", "Clean Architecture", "Domain-Driven Design",
    "TDD", "Agile", "Scrum", "Kanban", "Jira", "Git", "GitOps", "DevOps",
    # German & European Enterprise Systems
    "SAP", "SAP S/4HANA", "SAP ERP", "ABAP", "Siemens TIA", "Simatic", "Camunda", "DATEV", 
    "Celonis", "Salesforce"
]

# Major tech hubs and cities across Germany, Austria, Switzerland, and EU
EU_CITIES = [
    # Germany (DACH core)
    "Berlin", "München", "Munich", "Hamburg", "Frankfurt", "Köln", "Cologne",
    "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden",
    "Hannover", "Nürnberg", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
    "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Aachen", "Potsdam", "Kiel",
    # Austria & Switzerland
    "Wien", "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck",
    "Zürich", "Zurich", "Geneva", "Genf", "Basel", "Bern", "Lausanne",
    # European Union Tech Hubs
    "Amsterdam", "Rotterdam", "Utrecht", "Eindhoven",
    "Paris", "Lyon", "Toulouse", "Nantes",
    "Madrid", "Barcelona", "Valencia",
    "Milano", "Milan", "Roma", "Rome", "Torino",
    "Warszawa", "Warsaw", "Kraków", "Wrocław",
    "Dublin", "Cork",
    "Bruxelles", "Brussels", "Antwerpen",
    "Stockholm", "Göteborg", "Copenhagen", "Kopenhagen", "Helsinki",
    "Lisboa", "Lisbon", "Porto", "Praha", "Prague", "Budapest", "Tallinn"
]

# EU Language dictionary mappings (German, English, French, Spanish, Italian, Dutch, Polish, etc.)
EU_LANGUAGES_MAP = {
    "German": ["deutsch", "german", "allemand", "alemán", "tedesco", "duits"],
    "English": ["englisch", "english", "anglais", "inglés", "inglese", "engels"],
    "French": ["französisch", "french", "français", "francés", "francese", "frans"],
    "Spanish": ["spanisch", "spanish", "español", "espagnol", "spagnolo", "spaans"],
    "Italian": ["italienisch", "italian", "italiano", "italien", "italiaans"],
    "Dutch": ["niederländisch", "dutch", "nederlands", "néerlandais", "holandés"],
    "Polish": ["polnisch", "polish", "polski", "polonais", "polacco"],
    "Russian": ["russisch", "russian", "russe", "ruso"],
    "Portuguese": ["portugiesisch", "portuguese", "português", "portugais"],
    "Swedish": ["schwedisch", "swedish", "svenska", "suédois"],
    "Turkish": ["türkisch", "turkish", "türkçe", "turc"]
}

# German / EU job title mappings to standardized international titles
GERMAN_TITLES_MAP = [
    (r'(?i)\bsenior\s+cloud\s+(?:architekt|engineer|entwickler)\b', 'Senior Cloud Software Architect'),
    (r'(?i)\bfull[\s-]?stack[\s-]?(?:entwickler|developer|engineer)\b', 'Full-Stack Developer'),
    (r'(?i)\bfront[\s-]?end[\s-]?(?:entwickler|developer|engineer)\b', 'Frontend Developer'),
    (r'(?i)\bback[\s-]?end[\s-]?(?:entwickler|developer|engineer)\b', 'Backend Developer'),
    (r'(?i)\bdevops[\s-]?(?:ingenieur|engineer|spezialist)\b', 'DevOps & Platform Engineer'),
    (r'(?i)\bsoftware[\s-]?architekt\b', 'Software Architect'),
    (r'(?i)\bsoftware[\s-]?(?:entwickler|ingenieur)\b', 'Software Engineer'),
    (r'(?i)\bdata[\s-]?(?:scientist|datenwissenschaftler)\b', 'Data Scientist'),
    (r'(?i)\bdata[\s-]?(?:engineer|ingenieur)\b', 'Data Engineer'),
    (r'(?i)\b(?:ki|ai|machine\s+learning)[\s-]?(?:entwickler|engineer|forscher)\b', 'AI & Machine Learning Engineer'),
    (r'(?i)\bprojektleiter|projektmanager|scrum\s+master\b', 'Technical Project Manager / Scrum Master'),
    (r'(?i)\bsystem[\s-]?(?:administrator|ingenieur)\b', 'Systems & Infrastructure Engineer')
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

        # 2. Location (City / Country in Germany/EU)
        location = cls._extract_location(raw_text)

        # 3. Skills (Extensive EU tech taxonomy)
        extracted_skills = cls._extract_skills(raw_text)

        # 4. Languages (CEFR Framework: C2, C1, B2, B1, Muttersprache, etc.)
        languages = cls._extract_languages(raw_text)

        # 5. Work experiences & Total Years of Experience
        experiences, years_exp = cls._extract_experiences(lines, raw_text)

        # 6. Education
        educations = cls._extract_educations(lines, raw_text)

        # 7. Headline & Summary with EU Title Normalization
        headline = cls._extract_headline(lines, raw_text, extracted_skills)
        summary = cls._extract_summary(lines, raw_text)

        return ParsedResumeResponse(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            headline=headline,
            summary=summary,
            current_location=location,
            skills=extracted_skills,
            years_of_experience=years_exp,
            experiences=experiences,
            educations=educations,
            languages=languages,
            raw_text=raw_text[:4000]
        )

    @staticmethod
    def _extract_email(text: str) -> Optional[str]:
        match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        return match.group(0) if match else None

    @staticmethod
    def _extract_phone(text: str) -> Optional[str]:
        # Matches European numbers: +49, +43, +41, +33, +31, +34, 0049..., or standard mobile
        match = re.search(r'(?:\+(?:49|43|41|33|31|34|39|48|353)|00(?:49|43|41|33|31)|0)\s*\(?[0-9]{2,5}\)?\s*[-.\s]?[0-9]{2,5}[-.\s]?[0-9]{3,8}', text)
        return match.group(0).strip() if match else None

    @staticmethod
    def _extract_name(lines: List[str], email: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        for line in lines[:5]:
            trimmed = line.strip()
            # Skip headers like LEBENSLAUF, CURRICULUM VITAE, RESUME
            if any(term in trimmed.lower() for term in ["lebenslauf", "curriculum", "resume", "cv", "profil", "kontakt"]):
                continue
            parts = trimmed.split()
            if 2 <= len(parts) <= 3 and not any(char.isdigit() or char in '@:/\\|' for char in trimmed):
                return parts[0], " ".join(parts[1:])
        if email:
            prefix = email.split('@')[0]
            if '.' in prefix:
                f, l = prefix.split('.', 1)
                return f.capitalize(), l.capitalize()
        return "Candidate", "Professional"

    @staticmethod
    def _extract_location(text: str) -> Optional[str]:
        text_lower = " " + text.lower() + " "
        # Check against major EU cities
        for city in EU_CITIES:
            pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(city.lower()) + r'(?:\b|[^a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                # Standardize to common city name format
                if city in ["München", "Munich"]:
                    return "Munich, Germany"
                elif city in ["Köln", "Cologne"]:
                    return "Cologne, Germany"
                elif city in ["Nürnberg", "Nuremberg"]:
                    return "Nuremberg, Germany"
                elif city in ["Wien", "Vienna"]:
                    return "Vienna, Austria"
                elif city in ["Zürich", "Zurich"]:
                    return "Zurich, Switzerland"
                elif city == "Berlin":
                    return "Berlin, Germany"
                elif city == "Hamburg":
                    return "Hamburg, Germany"
                elif city == "Frankfurt":
                    return "Frankfurt, Germany"
                elif city == "Amsterdam":
                    return "Amsterdam, Netherlands"
                elif city == "Paris":
                    return "Paris, France"
                elif city == "Madrid":
                    return "Madrid, Spain"
                elif city == "Dublin":
                    return "Dublin, Ireland"
                return f"{city}, EU"
        return "Germany (EU)"

    @staticmethod
    def _extract_skills(text: str) -> List[str]:
        found = set()
        text_lower = " " + text.lower() + " "
        for skill in KNOWN_SKILLS:
            pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?:\b|[^a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                found.add(skill)
        return sorted(list(found))

    @staticmethod
    def _extract_languages(text: str) -> List[LanguageSkill]:
        langs: List[LanguageSkill] = []
        text_lower = text.lower()
        lines = [l.strip() for l in text_lower.split("\n") if l.strip()]

        def parse_level(segment: str) -> str:
            if any(term in segment for term in ["muttersprache", "native", "langue maternelle", "moedertaal", "madrelingua", "c2", "erstsprache"]):
                return "Native / C2"
            elif any(term in segment for term in ["verhandlungssicher", "c1", "business fluent", "courant", "vloeiend", "fluente", "avanzado"]):
                return "C1"
            elif any(term in segment for term in ["fließend", "b2", "fluent", "professionell", "gut", "proficient"]):
                return "B2"
            elif any(term in segment for term in ["mittelstufe", "b1", "intermediate", "intermédiaire"]):
                return "B1"
            elif any(term in segment for term in ["grundkenntnisse", "notions", "a2", "a1", "básico", "elementare"]):
                return "A2"
            return "B2"

        # 1. Parse line by line to keep language level isolated to its own line
        for line in lines:
            for lang_name, aliases in EU_LANGUAGES_MAP.items():
                if any(alias in line for alias in aliases):
                    if not any(l.lang == lang_name for l in langs):
                        level = parse_level(line)
                        langs.append(LanguageSkill(lang=lang_name, level=level))

        # 2. If any common EU language was mentioned elsewhere in text
        if not langs:
            for lang_name, aliases in EU_LANGUAGES_MAP.items():
                for alias in aliases:
                    idx = text_lower.find(alias)
                    if idx != -1:
                        snippet = text_lower[idx:min(len(text_lower), idx + 60)]
                        level = parse_level(snippet)
                        if not any(l.lang == lang_name for l in langs):
                            langs.append(LanguageSkill(lang=lang_name, level=level))

        # 3. Default fallback in German/EU marketplace
        if not langs:
            langs.append(LanguageSkill(lang="English", level="Fluent"))
            langs.append(LanguageSkill(lang="German", level="B2"))

        return langs

    @staticmethod
    def _extract_experiences(lines: List[str], raw_text: str) -> Tuple[List[ParsedExperience], float]:
        experiences = []
        total_years = 3.0

        # Match European date patterns: 2018 - 2024, 04/2019 - heute, 2020 - present, Seit 2021
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

        # Scan for job titles & company lines
        current_company = None
        current_title = None

        for line in lines:
            line_l = line.lower()
            if any(term in line_l for term in ["engineer", "developer", "architect", "lead", "manager", "entwickler", "architekt", "consultant", "ingenieur"]):
                if not current_title:
                    current_title = line
                elif not current_company:
                    current_company = line

        if current_title:
            experiences.append(ParsedExperience(
                company=current_company or "Technology Company",
                job_title=current_title[:100],
                location="Germany (EU)",
                start_date="2020",
                end_date="Present",
                is_current=True,
                description="Software engineering, microservices, and system architecture.",
                skills=[]
            ))

        return experiences, total_years

    @staticmethod
    def _extract_educations(lines: List[str], raw_text: str) -> List[ParsedEducation]:
        educations = []
        edu_keywords = ["bachelor", "master", "b.sc", "m.sc", "phd", "diplom", "universität", "university", "hochschule", "informatik", "engineering"]
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
    def _extract_headline(lines: List[str], raw_text: str, skills: List[str]) -> str:
        # 1. Match recognized German/EU job title patterns
        for pattern, normalized in GERMAN_TITLES_MAP:
            if re.search(pattern, raw_text):
                return normalized

        # 2. Check early lines
        for line in lines[1:6]:
            line_l = line.lower()
            if any(term in line_l for term in ["engineer", "developer", "specialist", "architect", "manager", "entwickler", "architekt"]):
                return line[:100]

        # 3. Dynamic skills-based headline
        if skills:
            top = ", ".join(skills[:3])
            return f"Software Engineer ({top})"
        return "Software Engineering Professional"

    @staticmethod
    def _extract_summary(lines: List[str], raw_text: str) -> str:
        for i, line in enumerate(lines):
            line_l = line.lower()
            if any(term in line_l for term in ["summary", "profil", "über mich", "about me", "kurzprofil", "zusammenfassung", "à propos"]):
                if i + 1 < len(lines):
                    return " ".join(lines[i+1:i+4])[:500]
        return "Experienced technical professional specializing in scalable software and cloud solutions across Germany and the European Union."
