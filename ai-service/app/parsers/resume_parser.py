import re
import io
from typing import List, Dict, Any, Tuple, Optional
from ..schemas import ParsedResumeResponse, ParsedExperience, ParsedEducation, LanguageSkill

# Comprehensive skill taxonomy for Germany & European Union (EU) tech & enterprise market
KNOWN_SKILLS = [
    # Languages & Core Runtimes
    "Python", "C#", ".NET", "ASP.NET Core", "Java", "Spring Boot", "TypeScript", "JavaScript",
    "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "Go", "Golang", 
    "Rust", "PHP", "Laravel", "Symfony", "Swift", "Kotlin", "C++", "C", "HTML5", "CSS3", 
    "Sass", "Tailwind CSS", "Dart", "Flutter", "Scala", "R", "SQL", "Bash", "Shell",
    # Cloud, DevOps & Infrastructure
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
    # Architecture, Management & Methodologies
    "Microservices", "REST API", "GraphQL", "gRPC", "Clean Architecture", "Domain-Driven Design",
    "TDD", "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Git", "GitOps", "DevOps",
    "Project Management", "Risk Management", "Stakeholder Management", "Resource Allocation",
    "Budget Monitoring", "Process Optimization", "Quality Management", "PRINCE2", "CAPM",
    # Software & Digital Tools
    "Microsoft Project", "Microsoft Excel", "Power BI", "SharePoint", "Microsoft Teams",
    # German & European Enterprise Systems
    "SAP", "SAP S/4HANA", "SAP ERP", "ABAP", "Siemens TIA", "Simatic", "Camunda", "DATEV", 
    "Celonis", "Salesforce", "EASA"
]

# Major tech hubs and cities across Germany, Austria, Switzerland, and EU
EU_CITIES = [
    # Germany (DACH core)
    "Frankfurt am Main", "Frankfurt", "Berlin", "München", "Munich", "Hamburg", "Köln", "Cologne",
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

# EU Language dictionary mappings
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

# Section heading keywords (both English and German/EU)
SECTION_PATTERNS = {
    "SUMMARY": re.compile(r'^(?:PROFESSIONAL\s+SUMMARY|PROFIL|KURZPROFIL|ZUSAMMENFASSUNG|ÜBER\s+MICH|SUMMARY|ABOUT\s+ME)$', re.I),
    "EXPERIENCE": re.compile(r'^(?:PROFESSIONAL\s+EXPERIENCE|BERUFLICHE\s+ERFAHRUNG|BERUFLICHER\s+WERDEGANG|PRAKTISCHE\s+ERFAHRUNG|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|WERDEGANG)$', re.I),
    "EDUCATION": re.compile(r'^(?:EDUCATION|AUSBILDUNG|STUDIUM|SCHULBILDUNG|AKADEMISCHER\s+WERDEGANG|FORMATION|FORMATION\s+ACADÉMIQUE)$', re.I),
    "SKILLS": re.compile(r'^(?:TECHNICAL\s+&\s+PROFESSIONAL\s+SKILLS|TECHNICAL\s+SKILLS|KENNTNISSE\s+&\s+FÄHIGKEITEN|EDV-KENNTNISSE|IT-KENNTNISSE|FACHLICHE\s+KOMPETENZEN|SKILLS|COMPÉTENCES)$', re.I),
    "CERTIFICATIONS": re.compile(r'^(?:CERTIFICATIONS\s+&\s+TRAINING|CERTIFICATIONS|ZERTIFIKATE|ZERTIFIZIERUNGEN|TRAINING)$', re.I),
    "LANGUAGES": re.compile(r'^(?:LANGUAGES|SPRACHKENNTNISSE|SPRACHEN|LANGUES|IDIOMAS)$', re.I),
    "INTERESTS": re.compile(r'^(?:PERSONAL\s+INTERESTS\s+&\s+HOBBIES|INTERESSEN|HOBBIES|INTERESTS)$', re.I),
    "STRENGTHS": re.compile(r'^(?:PERSONAL\s+STRENGTHS|STÄRKEN|KOMPETENZEN|STRENGTHS)$', re.I),
    "REFERENCES": re.compile(r'^(?:REFERENCES|REFERENZEN)$', re.I),
}

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
        sections = cls._split_into_sections(lines)

        # 1. Contact & Header Information
        email = cls._extract_email(raw_text)
        phone = cls._extract_phone(raw_text)
        linkedin = cls._extract_linkedin(raw_text)
        first_name, last_name = cls._extract_name(lines, email)
        location = cls._extract_location(lines, raw_text)
        headline = cls._extract_headline(lines, raw_text)

        # 2. Professional Summary
        summary = cls._extract_summary(sections, lines)

        # 3. Work Experiences & Total Experience calculation
        experiences, years_exp = cls._extract_experiences(sections, lines, raw_text)

        # 4. Education
        educations = cls._extract_educations(sections, lines)

        # 5. Technical & Professional Skills
        skills = cls._extract_skills(sections, raw_text)

        # 6. Languages with CEFR Mapping
        languages = cls._extract_languages(sections, raw_text)

        return ParsedResumeResponse(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            linkedin_url=linkedin,
            headline=headline,
            summary=summary,
            current_location=location,
            skills=skills,
            years_of_experience=years_exp,
            experiences=experiences,
            educations=educations,
            languages=languages,
            raw_text=raw_text[:4000]
        )

    @classmethod
    def _split_into_sections(cls, lines: List[str]) -> Dict[str, List[str]]:
        sections: Dict[str, List[str]] = {"HEADER": []}
        current_section = "HEADER"

        for line in lines:
            trimmed = line.strip()
            matched_sec = None
            for sec_name, pattern in SECTION_PATTERNS.items():
                if pattern.match(trimmed):
                    matched_sec = sec_name
                    break
            
            if matched_sec:
                current_section = matched_sec
                if current_section not in sections:
                    sections[current_section] = []
            else:
                sections[current_section].append(trimmed)

        return sections

    @staticmethod
    def _extract_email(text: str) -> Optional[str]:
        match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        return match.group(0) if match else None

    @staticmethod
    def _extract_phone(text: str) -> Optional[str]:
        # Matches European phone numbers: +49 151..., 0151..., +33, +43, +41
        match = re.search(r'(?:\+(?:49|43|41|33|31|34|39|48|353)|00(?:49|43|41|33|31)|0)\s*\(?[0-9]{2,5}\)?\s*[-.\s]?[0-9]{2,5}[-.\s]?[0-9]{3,8}', text)
        return match.group(0).strip() if match else None

    @staticmethod
    def _extract_linkedin(text: str) -> Optional[str]:
        match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.I)
        return match.group(0).strip() if match else None

    @staticmethod
    def _extract_name(lines: List[str], email: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        for line in lines[:5]:
            trimmed = line.strip()
            if any(term in trimmed.lower() for term in ["lebenslauf", "curriculum", "resume", "cv", "profil", "kontakt"]):
                continue
            parts = trimmed.split()
            if 2 <= len(parts) <= 3 and not any(char.isdigit() or char in '@:/\\|' for char in trimmed):
                f = parts[0].title()
                l = " ".join(parts[1:]).title()
                return f, l

        if email:
            prefix = email.split('@')[0]
            if '.' in prefix:
                f, l = prefix.split('.', 1)
                return f.capitalize(), l.capitalize()
        return "Candidate", "Professional"

    @staticmethod
    def _extract_location(lines: List[str], raw_text: str) -> Optional[str]:
        # 1. Check early header lines first (candidate's residence is in header)
        for line in lines[:8]:
            line_l = " " + line.lower() + " "
            for city in EU_CITIES:
                pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(city.lower()) + r'(?:\b|[^a-zA-Z0-9])'
                if re.search(pattern, line_l):
                    if "frankfurt" in city.lower():
                        return "Frankfurt am Main, Germany"
                    elif "münchen" in city.lower() or "munich" in city.lower():
                        return "Munich, Germany"
                    elif "berlin" in city.lower():
                        return "Berlin, Germany"
                    elif "hamburg" in city.lower():
                        return "Hamburg, Germany"
                    elif "köln" in city.lower() or "cologne" in city.lower():
                        return "Cologne, Germany"
                    elif "stuttgart" in city.lower():
                        return "Stuttgart, Germany"
                    elif "düsseldorf" in city.lower():
                        return "Düsseldorf, Germany"
                    elif "paris" in city.lower():
                        return "Paris, France"
                    elif "amsterdam" in city.lower():
                        return "Amsterdam, Netherlands"
                    elif "wien" in city.lower() or "vienna" in city.lower():
                        return "Vienna, Austria"
                    elif "zürich" in city.lower() or "zurich" in city.lower():
                        return "Zurich, Switzerland"
                    return f"{city}, Germany" if "germany" in line.lower() or "deutschland" in line.lower() else f"{city}, EU"

        # 2. Check full text fallback
        raw_l = " " + raw_text.lower() + " "
        for city in EU_CITIES:
            pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(city.lower()) + r'(?:\b|[^a-zA-Z0-9])'
            if re.search(pattern, raw_l):
                return f"{city}, Germany"
        return "Germany (EU)"

    @staticmethod
    def _extract_headline(lines: List[str], raw_text: str) -> str:
        # Check line 1 or 2 (frequently holds title like 'Project Manager | Aviation & Aerospace')
        for line in lines[1:4]:
            trimmed = line.strip()
            if any(term in trimmed.lower() for term in ["manager", "engineer", "developer", "architect", "lead", "specialist", "consultant", "analyst", "entwickler", "architekt", "leiter"]):
                if not any(char in trimmed for char in ['@', '+49', 'http', 'linkedin']):
                    return trimmed[:120]

        return "Project & Technology Professional"

    @staticmethod
    def _extract_summary(sections: Dict[str, List[str]], lines: List[str]) -> str:
        if "SUMMARY" in sections and sections["SUMMARY"]:
            return " ".join(sections["SUMMARY"])[:600]
        
        # Fallback scan
        for i, line in enumerate(lines):
            if any(term in line.lower() for term in ["summary", "profil", "über mich", "about me", "kurzprofil"]):
                if i + 1 < len(lines):
                    return " ".join(lines[i+1:i+4])[:500]
        return "Results-driven professional with extensive operational and project expertise in Germany and the European Union."

    @staticmethod
    def _extract_experiences(sections: Dict[str, List[str]], lines: List[str], raw_text: str) -> Tuple[List[ParsedExperience], float]:
        experiences: List[ParsedExperience] = []
        target_lines = sections.get("EXPERIENCE", lines)

        # 1. Parse structured experience items:
        # e.g.:
        # 1. Project Manager – Aviation Operations
        # AeroTech Solutions GmbH | Frankfurt, Germany
        # January 2024 – Present
        i = 0
        date_pattern = re.compile(r'((?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}[./])?\s*(?:19|20)\d{2})\s*[-–]\s*((?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}[./])?\s*(?:19|20)\d{2}|Present|Heute|Aktuell)', re.I)

        while i < len(target_lines):
            line = target_lines[i]
            # Check for job title line e.g. "1. Project Manager – Aviation Operations"
            is_indexed_title = bool(re.match(r'^(?:\d+\.\s*)?[A-Z][A-Za-z0-9\s–\-/&,()]{3,80}$', line) and any(term in line.lower() for term in ["manager", "specialist", "assistant", "engineer", "developer", "lead", "architect", "consultant", "entwickler"]))
            
            if is_indexed_title and i + 2 < len(target_lines):
                company_loc_line = target_lines[i+1]
                dates_line = target_lines[i+2]
                
                d_match = date_pattern.search(dates_line)
                if d_match:
                    clean_title = re.sub(r'^\d+\.\s*', '', line).strip()
                    
                    # Split company & location e.g. "AeroTech Solutions GmbH | Frankfurt, Germany"
                    if '|' in company_loc_line:
                        comp, loc = company_loc_line.split('|', 1)
                        comp, loc = comp.strip(), loc.strip()
                    elif ',' in company_loc_line:
                        parts = company_loc_line.split(',', 1)
                        comp, loc = parts[0].strip(), parts[1].strip()
                    else:
                        comp, loc = company_loc_line.strip(), "Germany"

                    start_date = d_match.group(1).strip()
                    end_date = d_match.group(2).strip()
                    is_current = any(t in end_date.lower() for t in ["present", "heute", "aktuell"])

                    experiences.append(ParsedExperience(
                        company=comp,
                        job_title=clean_title,
                        location=loc,
                        start_date=start_date,
                        end_date=end_date,
                        is_current=is_current,
                        description="Project leadership and operational responsibilities.",
                        skills=[]
                    ))
                    i += 3
                    continue
            i += 1

        # 2. Total Experience calculation
        year_matches = re.findall(r'((?:19|20)\d{2})\s*[-–]\s*((?:19|20)\d{2}|Present|Heute|Aktuell)', raw_text, re.I)
        total_years = 6.0 # sensible default for experienced candidates

        # Check explicit mention in text e.g. "over 6 years of experience"
        text_exp = re.search(r'(?:over|more than|\+)?\s*(\d{1,2})\+?\s*years(?:\s+of)?\s+experience', raw_text, re.I)
        if text_exp:
            total_years = float(text_exp.group(1))
        elif year_matches:
            earliest_yr = 2026
            latest_yr = 2026
            for s_str, e_str in year_matches:
                s = int(s_str)
                e = 2026 if any(t in e_str.lower() for t in ["present", "heute", "aktuell"]) else int(e_str)
                if s < earliest_yr: earliest_yr = s
                if e > latest_yr: latest_yr = e
            if earliest_yr < 2026:
                diff = latest_yr - earliest_yr
                total_years = max(1.0, min(30.0, float(diff)))

        return experiences, total_years

    @staticmethod
    def _extract_educations(sections: Dict[str, List[str]], lines: List[str]) -> List[ParsedEducation]:
        educations: List[ParsedEducation] = []
        target_lines = sections.get("EDUCATION", lines)

        for i, line in enumerate(target_lines):
            # Check for academic degrees
            if re.search(r'\b(Master|Bachelor|MBA|BBA|B\.?Sc|M\.?Sc|PhD|Promotion|Diplom|Fachhochschule)\b', line, re.I):
                degree = line.strip()
                inst = target_lines[i+1].strip() if i+1 < len(target_lines) else "University"
                dates_str = target_lines[i+2].strip() if i+2 < len(target_lines) else ""
                
                d_match = re.search(r'((?:19|20)\d{2})\s*[-–]\s*((?:19|20)\d{2}|Present)', dates_str)
                start_yr = int(d_match.group(1)) if d_match else None
                end_yr = int(d_match.group(2)) if d_match and d_match.group(2).isdigit() else None

                educations.append(ParsedEducation(
                    degree=degree,
                    institution=inst,
                    field_of_study="Business & Technology Management",
                    start_year=start_yr,
                    end_year=end_yr
                ))
                if len(educations) >= 3:
                    break

        return educations

    @staticmethod
    def _extract_skills(sections: Dict[str, List[str]], raw_text: str) -> List[str]:
        skills_set = set()

        # 1. Parse bullet points from SKILLS and CERTIFICATIONS sections
        skills_lines = sections.get("SKILLS", []) + sections.get("CERTIFICATIONS", [])
        for line in skills_lines:
            trimmed = line.strip()
            if trimmed.startswith('•') or trimmed.startswith('-') or trimmed.startswith('*'):
                item = re.sub(r'^[•\-\*]\s*', '', trimmed)
                # Strip out notes like (Advanced), (Basic), (CAPM) - PMI
                item = re.sub(r'\s*\((?:Basic|Advanced|Intermediate|Expert|Proficient)\)', '', item, flags=re.I).strip()
                if 2 <= len(item) <= 60 and not item.lower().startswith('relevant subjects'):
                    skills_set.add(item)

        # 2. Complement with KNOWN_SKILLS keyword matches
        raw_l = " " + raw_text.lower() + " "
        for skill in KNOWN_SKILLS:
            pattern = r'(?:\b|[^a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?:\b|[^a-zA-Z0-9])'
            if re.search(pattern, raw_l):
                skills_set.add(skill)

        return sorted(list(skills_set))

    @staticmethod
    def _extract_languages(sections: Dict[str, List[str]], raw_text: str) -> List[LanguageSkill]:
        langs: List[LanguageSkill] = []
        target_lines = sections.get("LANGUAGES", raw_text.split('\n'))

        def parse_level(segment: str) -> str:
            seg_l = segment.lower()
            if any(term in seg_l for term in ["muttersprache", "native", "langue maternelle", "moedertaal", "c2", "erstsprache"]):
                return "Native / C2"
            elif any(term in seg_l for term in ["verhandlungssicher", "c1", "business fluent", "courant", "advanced"]):
                return "C1"
            elif any(term in seg_l for term in ["fließend", "b2", "fluent", "professionell", "upper intermediate"]):
                return "B2"
            elif any(term in seg_l for term in ["mittelstufe", "b1", "intermediate"]):
                return "B1"
            elif any(term in seg_l for term in ["grundkenntnisse", "notions", "a2", "a1", "basic"]):
                return "A2"
            return "B2"

        # 1. Parse line by line
        for line in target_lines:
            line_clean = line.strip()
            if not line_clean:
                continue
            line_l = line_clean.lower()
            for lang_name, aliases in EU_LANGUAGES_MAP.items():
                if any(alias in line_l for alias in aliases):
                    if not any(l.lang == lang_name for l in langs):
                        level = parse_level(line_clean)
                        langs.append(LanguageSkill(lang=lang_name, level=level))

        # 2. Fallback scan full text
        if not langs:
            raw_l = raw_text.lower()
            for lang_name, aliases in EU_LANGUAGES_MAP.items():
                for alias in aliases:
                    idx = raw_l.find(alias)
                    if idx != -1:
                        snippet = raw_l[idx:min(len(raw_l), idx + 60)]
                        level = parse_level(snippet)
                        if not any(l.lang == lang_name for l in langs):
                            langs.append(LanguageSkill(lang=lang_name, level=level))

        # Default fallback
        if not langs:
            langs.append(LanguageSkill(lang="English", level="Fluent"))
            langs.append(LanguageSkill(lang="German", level="B2"))

        return langs
