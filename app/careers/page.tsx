"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  required_skills?: string[];
  description: string;
  application_count?: number;
  view_count?: number;
  posted_at: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

function ResumeBuilder() {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: user?.email || "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveResume = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const response = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save resume:", err);
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
      }]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-headline text-on-surface mb-2">Resume Builder</h2>
          <p className="text-on-surface-variant">Create a professional resume tailored for job applications</p>
        </div>
        <Button
          onClick={handleSaveResume}
          disabled={saving}
          className="bg-linear-to-r from-primary to-primary-container text-on-primary-fixed"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Resume"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Professional Summary</h3>
            <Textarea
              value={resumeData.summary}
              onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a compelling summary of your professional background and career goals..."
              rows={6}
            />
          </CardContent>
        </Card>
      </div>

      {/* Experience Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Work Experience</h3>
            <Button onClick={addExperience} variant="outline" size="sm">
              Add Experience
            </Button>
          </div>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="border border-outline-variant/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[index].company = e.target.value;
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                  />
                  <Input
                    placeholder="Position Title"
                    value={exp.position}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[index].position = e.target.value;
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[index].startDate = e.target.value;
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[index].endDate = e.target.value;
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                    disabled={exp.current}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].current = e.target.checked;
                        if (e.target.checked) newExp[index].endDate = "";
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                    <Label htmlFor={`current-${exp.id}`}>Current Position</Label>
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your responsibilities and achievements..."
                  value={exp.description}
                  onChange={(e) => {
                    const newExp = [...resumeData.experience];
                    newExp[index].description = e.target.value;
                    setResumeData(prev => ({ ...prev, experience: newExp }));
                  }}
                  rows={3}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Education</h3>
            <Button onClick={addEducation} variant="outline" size="sm">
              Add Education
            </Button>
          </div>
          <div className="space-y-4">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="border border-outline-variant/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Institution Name"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].institution = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  />
                  <Input
                    placeholder="Degree (e.g., Bachelor's)"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].degree = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].field = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={edu.startDate}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].startDate = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={edu.endDate}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].endDate = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                    disabled={edu.current}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edu-current-${edu.id}`}
                      checked={edu.current}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].current = e.target.checked;
                        if (e.target.checked) newEdu[index].endDate = "";
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                    <Label htmlFor={`edu-current-${edu.id}`}>Currently Studying</Label>
                  </div>
                  <Input
                    placeholder="GPA (optional)"
                    value={edu.gpa || ""}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].gpa = e.target.value;
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Skills</h3>
          <div className="space-y-4">
            <Input
              placeholder="Add skills (press Enter to add)"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const skill = e.currentTarget.value.trim();
                  if (!resumeData.skills.includes(skill)) {
                    setResumeData(prev => ({
                      ...prev,
                      skills: [...prev.skills, skill]
                    }));
                  }
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-500/20"
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      skills: prev.skills.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CareersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "resume">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  // Get unique filter options
  const locations = Array.from(new Set(jobs.map((j) => j.location))).sort();
  const jobTypes = Array.from(new Set(jobs.map((j) => j.job_type)));
  const experienceLevels = Array.from(new Set(jobs.map((j) => j.experience_level)));

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Fetch all jobs without strict limit - let API handle pagination
        const response = await fetch("/api/arjuna/jobs");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data.jobs || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
        console.error("Error fetching jobs:", err);
        // Don't fail completely on fetch error - component will show error state with retry
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = jobs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.required_skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    if (selectedType) {
      filtered = filtered.filter((job) => job.job_type === selectedType);
    }

    if (selectedExperience) {
      filtered = filtered.filter((job) => job.experience_level === selectedExperience);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, selectedLocation, selectedType, selectedExperience, jobs]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8" style={{background: "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(249,115,22,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168,85,247,0.07) 0%, transparent 55%), hsl(var(--background))"}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-4">
              Discover Opportunities
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-[0.95] mb-4">
              Find Your Next{" "}<span style={{background:"linear-gradient(135deg,#f97316,#e879f9,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}} className="italic">Career</span>
            </h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              Explore thousands of job opportunities across companies. Filter by location, job type, and experience level to find the perfect fit.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-1 p-1 bg-surface-container-low/30 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "jobs"
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50"
                }`}
              >
                Find Jobs
              </button>
              <button
                onClick={() => setActiveTab("resume")}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "resume"
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50"
                }`}
              >
                Resume Builder
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "jobs" ? (
            <>
              {/* Search & Filters */}
              <Card className="mb-8 glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                    Search Jobs
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by job title, company, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-outline-variant/30 text-on-surface placeholder-on-surface-variant"
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Filter */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/30 text-on-surface text-sm"
                    >
                      <option value="">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                      Job Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/30 text-on-surface text-sm"
                    >
                      <option value="">All Types</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                      Experience Level
                    </label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/30 text-on-surface text-sm"
                    >
                      <option value="">All Levels</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-semibold mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-surface-container-low/50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mx-auto block mb-4">
                work_off
              </span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No jobs found</h3>
              <p className="text-on-surface-variant mb-6">Try adjusting your filters or search query</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("");
                  setSelectedType("");
                  setSelectedExperience("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-on-surface-variant">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="glass-card hover:border-orange-400/40 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/careers/${job.id}`)}
                  >
                    <CardContent className="p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="mb-4 pb-4 border-b border-outline-variant/10">
                        <div className="h-0.5 w-8 bg-linear-to-r from-orange-400 to-violet-400 rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="font-bold font-headline text-lg group-hover:text-primary transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant font-semibold">{job.company_name}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-4 grow">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">work</span>
                          {job.job_type}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">trending_up</span>
                          {job.experience_level}
                        </div>
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <span className="material-symbols-outlined text-base">currency_rupee</span>
                            {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}{" "}
                            {job.currency || "INR"}
                          </div>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mb-4 pb-4 border-t border-outline-variant/10 pt-4">
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs border-outline-variant/50 text-on-surface-variant"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {job.required_skills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-outline-variant/50 text-on-surface-variant"
                              >
                                +{job.required_skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Apply Button */}
                      <Button
                        className="w-full bg-primary text-on-primary hover:bg-primary/90 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/careers/${job.id}`);
                        }}
                      >
                        <span className="material-symbols-outlined text-base mr-2">arrow_forward</span>
                        View & Apply
                      </Button>

                      {/* Meta */}
                      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex gap-4 text-xs text-on-surface-variant">
                        {job.view_count && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {job.view_count} views
                          </div>
                        )}
                        {job.application_count && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {job.application_count} applied
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
            </>
          ) : (
            /* Resume Builder Tab */
            <ResumeBuilder />
          )}
        </div>
      </main>
    </>
  );
}
