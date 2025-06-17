# extract_resume_data.py

import sys
import json
import fitz  # PyMuPDF
import spacy
import re

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    return "\n".join(page.get_text() for page in doc)

def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group() if match else ""

def extract_phone(text):
    match = re.search(r"(\+?\d{1,3})?\s?[\(\.\-]?\d{3}[\)\.\-]?\s?\d{3}[\-\.]?\d{4}", text)
    return match.group() if match else ""

def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return ""

def extract_education(text):
    edu_keywords = ["B.Tech", "MBA", "Bachelor", "Master", "B.Sc", "M.Sc", "PhD"]
    return [line.strip() for line in text.split('\n') if any(keyword in line for keyword in edu_keywords)]

def extract_skills(text):
    skill_list = ['Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Docker', 'AWS', 'SQL', 'Java']
    return [skill for skill in skill_list if skill.lower() in text.lower()][:5]

def extract_work_summary(text):
    lines = text.split('\n')
    return [line.strip() for line in lines if any(job in line for job in ["Engineer", "Developer", "Manager"])][:5]

def main():
    file_path = sys.argv[1]
    text = extract_text_from_pdf(file_path)
    data = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "work_experience_summary": extract_work_summary(text)
    }
    print(json.dumps(data))

if __name__ == "__main__":
    main()
