import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ResumeSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [filters, setFilters] = useState({
    skill: "",
    education: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllResumes();
  }, []);

  const fetchAllResumes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/getresumes`);
      const data = await response.json();
      setResumes(data);
      setFilteredResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleSearchAndFilter = () => {
    const searchLower = searchTerm.toLowerCase();
    let results = resumes;

    if (searchTerm) {
      results = results.filter(
        (resume) =>
          resume.name?.toLowerCase().includes(searchLower) ||
          resume.email_address?.toLowerCase().includes(searchLower) ||
          resume.recommended_job_roles?.some((role) => role.toLowerCase().includes(searchLower))
      );
    }

    if (filters.skill) {
      results = results.filter((r) =>
        r.skills?.some((skill) => skill.toLowerCase().includes(filters.skill.toLowerCase()))
      );
    }

    if (filters.education) {
      results = results.filter((r) =>
        r.education &&
        JSON.stringify(r.education).toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    if (filters.startDate || filters.endDate) {
      results = results.filter((r) => {
        const uploadedDate = new Date(r.uploaded_at);
        const uploadedDateOnly = new Date(
          uploadedDate.getFullYear(),
          uploadedDate.getMonth(),
          uploadedDate.getDate()
        );

        const start = filters.startDate
          ? new Date(filters.startDate + "T00:00:00")
          : null;

        const end = filters.endDate
          ? new Date(filters.endDate + "T23:59:59")
          : null;

        return (!start || uploadedDateOnly >= start) && (!end || uploadedDateOnly <= end);
      });
    }

    setFilteredResumes(results);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ skill: "", education: "", startDate: "", endDate: "" });
    setFilteredResumes(resumes);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Resumes</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or job role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchAndFilter()}
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={handleSearchAndFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={resetFilters}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by skill"
          value={filters.skill}
          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearchAndFilter()}
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by education"
          value={filters.education}
          onChange={(e) => setFilters({ ...filters, education: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearchAndFilter()}
          className="border px-4 py-2 rounded"
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearchAndFilter()}
          className="border px-4 py-2 rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearchAndFilter()}
          className="border px-4 py-2 rounded"
        />
      </div>

      <div className="grid gap-4">
        {filteredResumes.length === 0 ? (
          <p className="text-gray-600">No resumes match your criteria.</p>
        ) : (
          filteredResumes.map((resume) => (
            <div
              key={resume._id}
              onClick={() => navigate(`/recruiter/${resume._id}`)}
              className="border p-4 rounded shadow bg-white cursor-pointer hover:bg-gray-50"
            >
              <h3 className="text-xl font-semibold mb-1">{resume.name}</h3>
              <p><strong>Email:</strong> {resume.email_address}</p>
              <p><strong>Phone:</strong> {resume.contact_number}</p>
              <p><strong>Location:</strong> {resume.location}</p>
              <p><strong>Summary:</strong> {resume.ats_reason}</p>
              <p><strong>Skills:</strong> {resume.skills?.join(", ")}</p>
              <p><strong>Key Strengths:</strong> {resume.key_strengths?.join(", ")}</p>
              <p><strong>Highlights: </strong> {resume.highlights?.join(", ")}</p>

              <div className="mb-2">
                <strong>Education:</strong>
                <ul className="list-disc ml-5">
                  {Array.isArray(resume.education) && resume.education.length > 0 ? (
                    resume.education.map((edu, index) => (
                      <li key={index}>
                        <p className="font-medium">{edu.degree}</p>
                        <p>{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.years}</p>
                      </li>
                    ))
                  ) : (
                    <li>No education details available</li>
                  )}
                </ul>
              </div>

              <div className="mb-2">
                <strong>Work Experience:</strong>
                <ul className="list-disc ml-5">
                  {Array.isArray(resume.work_experience) && resume.work_experience.length > 0 ? (
                    resume.work_experience.map((exp, index) => (
                      <li key={index}>
                        <p className="font-medium">{exp.job_title}</p>
                        <p>{exp.company_name}</p>
                        <p className="text-sm text-gray-600">{exp.duration}</p>
                      </li>
                    ))
                  ) : (
                    <li>No Work Experience details available</li>
                  )}
                </ul>
              </div>

              <p><strong>Recommended Roles:</strong> {resume.recommended_job_roles?.join(", ")}</p>
              <p><strong>ATS Score:</strong> {resume.ats_score}</p>
              <p><strong>File Name:</strong> {resume.file_name}</p>
              <p><strong>File Size:</strong> {(resume.file_size / 1024).toFixed(2)} KB</p>
              <p><strong>Uploaded At:</strong> {new Date(resume.uploaded_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResumeSection;
