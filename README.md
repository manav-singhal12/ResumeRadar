# Resume Radar✨📄🤖

This project is an intelligent resume parser and analyzer built with React, Gemini AI (Google Generative AI), and Tesseract.js. It allows users to upload their resumes in **PDF or DOCX format**, extracts the content, performs **ATS (Applicant Tracking System) scoring**, and parses detailed information such as skills, experience, education, and job recommendations.

## Setup Instructions

git clone https://github.com/manav-singhal12/ResumeRadar.git

change the frontend and backend urls

cd backend
npm install
npm run dev

cd frontend
npm install 
npm run dev

## Technologies Used

React- 	Frontend framework
Tailwind CSS -	Styling and responsiveness
pdfjs-dist -	PDF parsing
Tesseract.js -	OCR fallback for scanned resumes
Google Generative AI (Gemini) -	Resume analysis, ATS scoring
Node.js + Express (Backend) -	API for saving parsed resumes
MongoDB -	Resume data storage

## Development Approach

File Upload & Validation – Handles .pdf and .docx formats only.

Text Extraction – Uses pdfjs-dist or mammoth depending on file type.

OCR Fallback – Automatically triggers Tesseract.js if PDF text extraction fails or is insufficient.

AI Processing – Sends resume text to Gemini API for ATS scoring and full parsing.

Storage – Parsed data is sent to a backend API and stored in a MongoDB collection.

Minimal UI – Clean UI with only file input and success toast for UX simplicity.

## Deployment Links

Backend- https://resumeradar-poig.onrender.com
Frontend- https://resume-radar-iibdz562f-manav-singhals-projects.vercel.app/

## Known Issues/ Improvements

OCR can be slow and less accurate for highly stylized or image-based resumes.

Resume parsing is currently done using Gemini API via frontend. Ideally, this should be handled securely in the backend using Python libraries for better performance and security but Due to time constraints , I was not able to understand them properly and I opted for a frontend-based approach for quicker integration.

