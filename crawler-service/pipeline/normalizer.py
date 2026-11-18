import re
from typing import Dict, Any, List, Optional, Tuple

class JobNormalizer:
    GERMAN_CITIES = {
        "berlin": "Berlin",
        "münchen": "Munich",
        "munich": "Munich",
        "hamburg": "Hamburg",
        "frankfurt": "Frankfurt",
        "köln": "Cologne",
        "cologne": "Cologne",
        "stuttgart": "Stuttgart",
        "düsseldorf": "Düsseldorf",
        "dusseldorf": "Düsseldorf",
        "leipzig": "Leipzig",
        "nürnberg": "Nuremberg",
        "nuremberg": "Nuremberg"
    }

    @classmethod
    def normalize_city(cls, raw_location: str) -> Tuple[str, str]:
        loc_lower = raw_location.lower()
        country = "Germany"
        
        for k, city in cls.GERMAN_CITIES.items():
            if k in loc_lower:
                return city, country

        if "remote" in loc_lower:
            return "Remote", "Germany / EU"

        # Fallback to cleaned title-cased token
        clean_city = raw_location.split(',')[0].strip().title()
        return clean_city or "Germany", country

    @staticmethod
    def normalize_salary(raw_text: str) -> Tuple[Optional[int], Optional[int]]:
        # Match EUR 60.000 - 80.000, 60k - 80k, 70000 €
        matches = re.findall(r'(\d{2,3}(?:[.,]\d{3})?)\s*(?:k|K|€|EUR)?', raw_text)
        if len(matches) >= 2:
            try:
                min_s = int(matches[0].replace('.', '').replace(',', ''))
                max_s = int(matches[1].replace('.', '').replace(',', ''))
                if min_s < 1000:
                    min_s *= 1000
                if max_s < 1000:
                    max_s *= 1000
                return min_s, max_s
            except Exception:
                pass
        return None, None

    @staticmethod
    def extract_language_requirements(text: str) -> List[Dict[str, str]]:
        reqs = []
        text_lower = text.lower()
        if "deutsch" in text_lower or "german" in text_lower:
            lvl = "B2"
            if "c1" in text_lower or "verhandlungssicher" in text_lower:
                lvl = "C1"
            elif "c2" in text_lower or "muttersprache" in text_lower:
                lvl = "C2"
            reqs.append({"lang": "German", "level": lvl})
        
        if "englisch" in text_lower or "english" in text_lower:
            lvl = "Fluent"
            if "c1" in text_lower:
                lvl = "C1"
            reqs.append({"lang": "English", "level": lvl})

        if not reqs:
            reqs.append({"lang": "English", "level": "Fluent"})
            reqs.append({"lang": "German", "level": "B1"})

        return reqs

