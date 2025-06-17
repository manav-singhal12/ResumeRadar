import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Tesseract from "tesseract.js";
GlobalWorkerOptions.workerSrc = workerUrl;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

function ResumeRadar() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".docx"))
    ) {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF or DOCX file");
    }
  };

  const saveResumeToDB = async (resumeData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resumeData),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to save resume");
      alert("Resume saved successfully!");
      console.log("✅ Resume saved:", data);
    } catch (error) {
      alert("Error saving resume: " + error.message);
      console.error("❌ Failed to save resume to database:", error.message);
    }
  };

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    setLoading(true);

    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      try {
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        let fullText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        const resumeText = fullText.trim();
        if (resumeText.length < 50) {
          console.warn("Fallback to OCR due to low text content...");
          await runOCR(file);
          return;
        }

        setText(resumeText);
        const atsData = await fetchATSScore(resumeText);
        if (atsData) {
          await fetchFullResumeData(resumeText, atsData);
        }
      } catch (err) {
        console.error("Error extracting PDF text, falling back to OCR:", err);
        await runOCR(file);
      }

      setLoading(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const runOCR = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = new Blob([reader.result], { type: file.type });

      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => console.log(m),
      });

      const ocrText = result.data.text.trim();
      setText(ocrText);
      const atsData = await fetchATSScore(resumeText);
      if (atsData) {
        await fetchFullResumeData(resumeText, atsData);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromDocx = async (file) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const resumeText = result.value.trim();
        setText(resumeText);
        const atsData = await fetchATSScore(resumeText);
        if (atsData) {
          await fetchFullResumeData(resumeText, atsData);
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading DOCX file:", error);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      if (file.type === "application/pdf") {
        extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx")) {
        extractTextFromDocx(file);
      } else {
        alert("Unsupported file format");
      }
    }
  };

  const fetchATSScore = async (resumeText) => {
    setAILoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
      You are an advanced, non-repetitive AI-based ATS evaluator designed to perform **accurate and diverse scoring** of resumes.
      
      You must calculate the ATS score out of 100 using the following weighted criteria:
      {
        "Skill Match (Contextual)": 30,
        "Experience Relevance & Depth": 25,
        "Project & Achievement Validation": 15,
        "AI-Generated Resume Detection": 5,
        "Cultural & Soft Skills Fit": 10,
        "Consistency Check": 15,
        "Resume Quality Score": 5,
        "Interview & Behavioral Prediction": 5,
        "Competitive Fit & Market Standing": 5
      }
      
      ### Strict Scoring Guidelines:
      1. **Each component must be scored individually**, even if a section is missing.
      2. **Avoid giving similar ATS scores across different resumes**. Add randomness based on realistic market variance and industry fit.
      3. Provide **subtle deductions** for missing details or vague wording.
      4. Do **not round up scores** unnecessarily; decimal values are encouraged (e.g., 82.5, 76.3).
      5. Use **clear judgment** for vague or overly templated resumes – do not favor verbosity.
      6. Your final score must **reflect real-world industry expectations** for 2025 job markets, tech/non-tech roles, and resume standards.
      
      Return ONLY a **JSON object** like this (no markdown, no code formatting):
      {
        "ats_score": number, // float with one decimal point (e.g., 76.8)
        "reason": string // Reasoning with 1-2 lines referencing specific scoring areas
      }
      
      Resume text:
      ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = await response.text();
      const cleanedText = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      setAIResponse((prev) => ({
        ...prev,
        ats_score: parsed.ats_score,
        ats_reason: parsed.reason,
      }));

      return {
        ats_score: parsed.ats_score,
        ats_reason: parsed.reason,
      };
    } catch (err) {
      console.error(err);
      setAIResponse({ error: "Error retrieving ATS score." });
      return null;
    } finally {
      setAILoading(false);
    }
  };

  const fetchFullResumeData = async (resumeText, atsData = {}) => {
    setAILoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an intelligent resume radar and analyzer.

Parse the resume text below and return a JSON object in the following format (no markdown, no explanation, no code block):

{
  name,
  contact_number,
  email_address,
  location,
  skills, // top 5 relevant technical skills
  education,
  "work_experience": [
  {
    "job_title"
    "company_name"
    "start_date"
    "end_date"
    "duration_months",
    "description"
  }
],
key_strengths,
  highlights,
  suggested_resume_category,
  recommended_job_roles,
}

Instructions:
- "skills": Extract and return only the top 5 most relevant technical skills based on frequency and context. Avoid soft skills or generic terms.
- "number_of_job_jumps": Count the number of times the candidate switched jobs. If only one job is listed, return 0.
- "average_job_duration_months": Calculate average job duration in months using available start and end dates. If a job is marked "Present", use the current month (assume it's April 2025).
- Return numerical values for "number_of_job_jumps" and "average_job_duration_months", even if estimation is needed.
- Use float values (e.g., 9.0, 15.5) for "average_job_duration_months".

Resume text:
${resumeText}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = await response.text();
      const cleanedText = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      const fullResumeData = {
        ...parsed,
        ...atsData, // ⬅️ inject ats_score and ats_reason
        raw_text: resumeText,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      };

      setAIResponse((prev) => ({ ...prev, ...parsed, ...atsData }));
      await saveResumeToDB(fullResumeData);
    } catch (err) {
      console.error(err);
      setAIResponse({ error: "Error retrieving full resume analysis." });
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Resume Radar</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin" /> Uploading...
              </span>
            ) : (
              "Upload Resume"
            )}
          </button>
        </form>
      </div>
    </div>
  );

}

export default ResumeRadar;
