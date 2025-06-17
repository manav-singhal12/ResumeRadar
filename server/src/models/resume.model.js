import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    ats_score: Number,
    ats_reason: String,
    name: String,
    contact_number: String,
    email_address: String,
    location: String,
    skills: [String],
    education: mongoose.Schema.Types.Mixed,
    work_experience: [
      {
        job_title: String,
        company_name: String,
        start_date: String,
        end_date: String,
        duration_months: Number,
        description: String,
      },
    ],
    key_strengths: [String],
    highlights: [String],
    suggested_resume_category: String,
    recommended_job_roles: [String],
    raw_text: String,
    file_name: String,
    file_size: Number,
    uploaded_at: {
      type: Date,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
