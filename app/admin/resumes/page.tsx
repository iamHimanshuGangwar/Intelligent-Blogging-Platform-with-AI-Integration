"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Star,
  User,
} from "lucide-react";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

interface ResumeListItem {
  id: string;
  user_id: string;
  full_name: string | null;
  target_role: string | null;
  template: string | null;
  color_theme: string | null;
  ats_score: number;
  skills_count: number;
  experience_count: number;
  created_at: string;
  updated_at: string;
  user_profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

interface ResumeDetail {
  resume: {
    id: string;
    user_id: string;
    full_name: string;
    target_role: string;
    template: string;
    color_theme: string;
    ats_score: number;
    resume_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  } | null;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  } | null;
  files: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
    file_size: number | null;
    created_at: string;
  }>;
}

export default function AdminResumesPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeDetail | null>(null);


  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/admin/login"); return; }
    if (user && !isAdmin) { router.push("/dashboard"); }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchResumes() {
    setFetching(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/resumes?${params}`);
      const data = await res.json();
      if (data.resumes) {
        setResumes(data.resumes);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {} finally {
      setFetching(false);
    }
  }

  async function viewResume(userId: string) {
    try {
      const res = await fetch(`/api/admin/resumes/${userId}`);
      const data = await res.json();
      setSelectedResume(data);
    } catch {
      setSelectedResume(null);
    }
  }

  function closeDetail() {
    setSelectedResume(null);
  }

  function getAtsColor(score: number) {
    if (score >= 70) return "text-green-400 bg-green-500/10";
    if (score >= 40) return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background text-on-background">Loading...</div>;

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="resumes" />
      <AdminTopNav activePage="resumes" />
      <main className="md:ml-64 pt-20 min-h-screen p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Resumes</h1>
              <p className="text-sm text-on-surface-variant">{total} resume{total !== 1 ? "s" : ""} in the system</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchResumes(); } }}
                placeholder="Search by name or role..."
                className="border-white/10 bg-surface-container pl-10 text-on-surface"
              />
            </div>
            <Button onClick={() => { setPage(1); fetchResumes(); }} variant="outline" className="border-white/10">
              Search
            </Button>
          </div>

          {/* Detail View */}
          {selectedResume && (
            <div className="mb-8">
              <Button onClick={closeDetail} variant="ghost" className="mb-4 text-on-surface-variant">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to list
              </Button>

              <Card className="border-white/8 bg-surface-container">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedResume.resume?.full_name || selectedResume.profile?.full_name || "Unknown User"}
                      </h2>
                      <p className="text-sm text-on-surface-variant">{selectedResume.profile?.email}</p>
                      {selectedResume.resume?.target_role && (
                        <Badge variant="outline" className="mt-2 border-primary/30 text-primary">
                          {selectedResume.resume.target_role}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${getAtsColor(selectedResume.resume?.ats_score || 0)}`}>
                        ATS: {selectedResume.resume?.ats_score || 0}%
                      </span>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Template: {selectedResume.resume?.template || "N/A"} • Theme: {selectedResume.resume?.color_theme || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Resume Data Overview */}
                  {selectedResume.resume?.resume_data && (() => {
                    const rd = selectedResume.resume!.resume_data as Record<string, unknown>;
                    return (
                    <div className="space-y-4">
                      {/* Summary */}
                      {typeof rd.summary === 'string' && rd.summary && (
                        <div>
                          <h3 className="mb-1 text-sm font-bold text-on-surface">Professional Summary</h3>
                          <p className="text-sm text-on-surface-variant">{String(rd.summary)}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {Array.isArray(rd.skills) && (
                        <div>
                          <h3 className="mb-2 text-sm font-bold text-on-surface">Skills</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {(rd.skills as string[]).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="bg-white/8 text-on-surface-variant">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {Array.isArray(rd.experience) && (
                        <div>
                          <h3 className="mb-2 text-sm font-bold text-on-surface">Experience</h3>
                          {(rd.experience as Array<Record<string, string>>)
                            .filter(e => e.position)
                            .map((exp, i) => (
                              <div key={i} className="mb-2 rounded-lg bg-white/5 p-3">
                                <p className="font-semibold text-on-surface">{exp.position}</p>
                                <p className="text-sm text-primary">{exp.company}{exp.location ? ` — ${exp.location}` : ""}</p>
                                <p className="text-xs text-on-surface-variant">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Education */}
                      {Array.isArray(rd.education) && (
                        <div>
                          <h3 className="mb-2 text-sm font-bold text-on-surface">Education</h3>
                          {(rd.education as Array<Record<string, string>>)
                            .filter(e => e.degree)
                            .map((edu, i) => (
                              <div key={i} className="mb-2 rounded-lg bg-white/5 p-3">
                                <p className="font-semibold text-on-surface">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</p>
                                <p className="text-sm text-on-surface-variant">{edu.school}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    );
                  })()}

                  {/* Exported Files */}
                  {selectedResume.files.length > 0 && (
                    <div className="mt-6 border-t border-white/8 pt-4">
                      <h3 className="mb-3 text-sm font-bold text-on-surface">Exported Files</h3>
                      <div className="space-y-2">
                        {selectedResume.files.map(file => (
                          <div key={file.id} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-on-surface-variant" />
                              <div>
                                <p className="text-sm text-on-surface">{file.file_name}</p>
                                <p className="text-xs text-on-surface-variant">{new Date(file.created_at).toLocaleDateString()} • {file.file_type.toUpperCase()}</p>
                              </div>
                            </div>
                            {file.file_url && file.file_url !== "local_export" && (
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-on-surface-variant">
                    Created: {selectedResume.resume?.created_at ? new Date(selectedResume.resume.created_at).toLocaleString() : "N/A"}
                    {" • "}
                    Updated: {selectedResume.resume?.updated_at ? new Date(selectedResume.resume.updated_at).toLocaleString() : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resume List */}
          {!selectedResume && (
            <>
              <div className="space-y-3">
                {fetching && <p className="text-center text-on-surface-variant py-8">Loading resumes...</p>}
                {!fetching && resumes.length === 0 && (
                  <Card className="border-white/8 bg-surface-container">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="mb-3 h-12 w-12 text-on-surface-variant/40" />
                      <p className="text-on-surface-variant">No resumes found</p>
                    </CardContent>
                  </Card>
                )}
                {resumes.map(r => (
                  <Card key={r.id} className="border-white/8 bg-surface-container transition-colors hover:border-white/15">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {r.full_name || r.user_profile?.full_name || "Unnamed"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {r.user_profile?.email || r.user_id}
                          </p>
                          {r.target_role && (
                            <p className="text-xs text-primary">{r.target_role}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {r.skills_count} skills</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {r.experience_count} exp</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant/60">{r.template} • {r.color_theme}</p>
                        </div>

                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getAtsColor(r.ats_score)}`}>
                          {r.ats_score}%
                        </span>

                        <Button size="sm" variant="ghost" onClick={() => viewResume(r.user_id)} className="text-primary hover:text-primary/80">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-white/10">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-on-surface-variant">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-white/10">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
    </div>
  );
}
