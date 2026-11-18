import hashlib
import re

class Deduplicator:
    @staticmethod
    def generate_hash(company_name: str, job_title: str, city: str) -> str:
        """
        Creates a deterministic SHA-256 fingerprint from cleaned, normalized strings.
        Prevents duplicate postings of the same job across multiple sources.
        """
        norm_company = re.sub(r'[^a-zA-Z0-9]', '', company_name.lower())
        norm_title = re.sub(r'[^a-zA-Z0-9]', '', job_title.lower())
        norm_city = re.sub(r'[^a-zA-Z0-9]', '', city.lower())
        
        fingerprint = f"{norm_company}:{norm_title}:{norm_city}"
        return hashlib.sha256(fingerprint.encode('utf-8')).hexdigest()
