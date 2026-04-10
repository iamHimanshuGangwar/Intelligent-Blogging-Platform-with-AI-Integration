"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  company_logo_url?: string;
  application_deadline?: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Application form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/arjuna/jobs?limit=100`);
        if (!response.ok) throw new Error("Failed to fetch job");
        const data = await response.json();
        const foundJob = data.jobs.find((j: Job) => j.id === jobId);
        if (!foundJob) throw new Error("Job not found");
        setJob(foundJob);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJob();
  }, [jobId]);

  // Handle form submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(`/careers/${jobId}`)}`);
      return;
    }

    setSubmitting(true);

    try {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.phone || !formData.coverLetter) {
        alert("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      // Submit application to API
      const response = await fetch(`/api/arjuna/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          coverLetter: formData.coverLetter,
          linkedinUrl: formData.linkedinUrl || null,
          portfolioUrl: formData.portfolioUrl || null,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/auth?redirect=${encodeURIComponent(`/careers/${jobId}`)}`);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit application');
      }

      await response.json();

      setSuccessMessage("Application submitted successfully! We'll review it and get back to you soon.");
      setFormData({ fullName: "", email: "", phone: "", coverLetter: "", linkedinUrl: "", portfolioUrl: "" });
      setShowApplicationForm(false);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit application. Please try again.";
      alert(errorMessage);
      console.error("Error submitting application:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Loading job details...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-red-500/30 mx-auto block mb-4">error_outline</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Job Not Found</h2>
            <p className="text-on-surface-variant mb-6">{error || "This job listing is no longer available."}</p>
            <Button onClick={() => router.push("/careers")}>Back to Jobs</Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <Card className="mb-6 bg-green-500/10 border-green-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <p className="text-green-700 font-semibold">{successMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Back Button */}
          <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.push("/careers")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Jobs
          </Button>

          {/* Job Header */}
          <Card className="mb-8 bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                {job.company_logo_url && (
                  <Image
                    src={job.company_logo_url}
                    alt={job.company_name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover bg-surface"
                  />
                )}

                {/* Info */}
                <div className="grow">
                  <h1 className="text-4xl font-bold font-headline mb-2">{job.title}</h1>
                  <p className="text-lg text-on-surface-variant font-semibold mb-4">{job.company_name}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wide">Location</p>
                        <p className="font-semibold">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">work</span>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wide">Type</p>
                        <p className="font-semibold">{job.job_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">trending_up</span>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wide">Experience</p>
                        <p className="font-semibold">{job.experience_level}</p>
                      </div>
                    </div>
                    {job.salary_min && job.salary_max && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">currency_rupee</span>
                        <div>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wide">Salary</p>
                          <p className="font-semibold text-primary">
                            ₹{job.salary_min.toLocaleString()}-{job.salary_max.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="bg-primary text-on-primary hover:bg-primary/90 font-bold w-full md:w-auto"
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push(`/auth?redirect=${encodeURIComponent(`/careers/${jobId}`)}`);
                        return;
                      }
                      setShowApplicationForm(!showApplicationForm);
                    }}
                  >
                    <span className="material-symbols-outlined mr-2">mail</span>
                    {showApplicationForm ? "Close Application" : "Apply Now"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold font-headline mb-4">About This Role</h2>
                  <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </CardContent>
              </Card>

              {/* Required Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-headline mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-primary/20 text-primary border-primary/30 text-sm py-1 px-3"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Application Form Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              {showApplicationForm && (
                <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-headline mb-6">Apply for this Position</h3>
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          placeholder="Your full name"
                          className="bg-background border-outline-variant/30"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          Email *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your@email.com"
                          className="bg-background border-outline-variant/30"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          Phone *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-background border-outline-variant/30"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          LinkedIn URL
                        </label>
                        <Input
                          type="url"
                          value={formData.linkedinUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedinUrl: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="bg-background border-outline-variant/30"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          Portfolio URL
                        </label>
                        <Input
                          type="url"
                          value={formData.portfolioUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, portfolioUrl: e.target.value })
                          }
                          placeholder="https://your-portfolio.com"
                          className="bg-background border-outline-variant/30"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                          Cover Letter *
                        </label>
                        <textarea
                          required
                          value={formData.coverLetter}
                          onChange={(e) =>
                            setFormData({ ...formData, coverLetter: e.target.value })
                          }
                          placeholder="Tell us why you're interested in this role..."
                          className="w-full px-3 py-2 rounded-lg bg-background border border-outline-variant/30 text-on-surface text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 min-h-24"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary text-on-primary hover:bg-primary/90 font-bold"
                      >
                        {submitting ? (
                          <>
                            <span className="material-symbols-outlined mr-2 animate-spin">
                              hourglass_bottom
                            </span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mr-2">send</span>
                            Submit Application
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-on-surface-variant text-center">
                        By applying, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Meta Info */}
              <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Posted
                      </p>
                      <p className="font-semibold">
                        {new Date(job.posted_at).toLocaleDateString()}
                      </p>
                    </div>
                    {job.application_deadline && (
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                          Apply By
                        </p>
                        <p className="font-semibold text-orange-500">
                          {new Date(job.application_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Applications
                      </p>
                      <p className="font-semibold">{job.application_count || 0} applied</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Views
                      </p>
                      <p className="font-semibold">{job.view_count || 0} interested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
