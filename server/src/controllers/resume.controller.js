import Resume from "../models/resume.model.js";

export const saveResume = async (req, res) => {
  try {
    const resumeData = req.body;
    const newResume = new Resume({
      ...resumeData,
      file_name:resumeData.file_name,
      file_size:resumeData.file_size,
      uploaded_at: resumeData.uploaded_at,
    });

    const saved = await newResume.save();
    console.log(saved);
    res.status(201).json({ message: "Resume saved successfully", resume: saved });
  } catch (err) {
    console.error("Error saving resume:", err);
    res.status(500).json({ message: "Failed to save resume", error: err.message });
  }
};
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.status(200).json(resumes);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ message: "Failed to retrieve resumes", error: err.message });
  }
};
