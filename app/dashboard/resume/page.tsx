"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";

/* ───────────── Types ───────────── */

interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  expanded: boolean;
}

interface EducationItem {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
}

interface ProjectItem {
  name: string;
  description: string;
  url: string;
  technologies: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  linkedin: string;
  website: string;
  photoUrl: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
  projects: ProjectItem[];
  languages: string[];
  awards: string[];
  volunteerWork: string;
  targetRole: string;
}

/* ───────────── Constants ───────────── */

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Experience", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Skills & Certs", icon: Star },
  { label: "Projects", icon: FolderOpen },
  { label: "Summary", icon: Sparkles },
  { label: "Finalize", icon: Download },
];

const TEMPLATES = ["Classic", "Modern", "Minimal", "Executive", "Clean", "Professional"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Volunteer"];

const COLOR_THEMES = [
  { name: "Slate", accent: "#475569", heading: "#1e293b", bg: "#ffffff", text: "#334155", border: "#cbd5e1", chip: "#f1f5f9" },
  { name: "Navy", accent: "#1e3a5f", heading: "#0f2744", bg: "#ffffff", text: "#374151", border: "#93c5fd", chip: "#eff6ff" },
  { name: "Forest", accent: "#166534", heading: "#14532d", bg: "#ffffff", text: "#374151", border: "#86efac", chip: "#f0fdf4" },
  { name: "Wine", accent: "#881337", heading: "#4c0519", bg: "#ffffff", text: "#374151", border: "#fda4af", chip: "#fff1f2" },
  { name: "Charcoal", accent: "#374151", heading: "#111827", bg: "#ffffff", text: "#4b5563", border: "#d1d5db", chip: "#f9fafb" },
  { name: "Royal", accent: "#4338ca", heading: "#312e81", bg: "#ffffff", text: "#374151", border: "#a5b4fc", chip: "#eef2ff" },
  { name: "Teal", accent: "#0f766e", heading: "#134e4a", bg: "#ffffff", text: "#374151", border: "#5eead4", chip: "#f0fdfa" },
  { name: "Amber", accent: "#92400e", heading: "#78350f", bg: "#ffffff", text: "#374151", border: "#fcd34d", chip: "#fffbeb" },
];

/* ───────────── Palette (editor UI) ───────────── */

const P = {
  surface: "#0f0a1e", surfaceLow: "#1a1433", surfaceHigh: "#241e3a",
  primary: "#a78bfa", primaryContainer: "#7c3aed", primaryFixed: "#a78bfa20",
  onSurface: "#e8e0f0", onSurfaceVariant: "#bbb0cc",
  outline: "#8070a0", outlineVariant: "#5a4f7a",
  secondary: "#94a3b8", tertiary: "#60a5fa", tertiaryFixed: "#1e40af22", onTertiaryFixed: "#93c5fd",
  error: "#f87171", errorContainer: "#7f1d1d",
};

const inputClass = "w-full rounded-xl border bg-[#241e3a] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all";

/* ───────────── Helpers ───────────── */

const emptyExperience = (): ExperienceItem => ({
  company: "", position: "", location: "", employmentType: "Full-time",
  startDate: "", endDate: "", currentlyWorking: false, description: "", expanded: true,
});

const emptyEducation = (): EducationItem => ({
  school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "", description: "",
});

const emptyProject = (): ProjectItem => ({
  name: "", description: "", url: "", technologies: "", startDate: "", endDate: "",
});

/** Merge a partial item with its empty template so every field is defined (prevents uncontrolled→controlled warnings). */
function sanitizeExperience(item: Partial<ExperienceItem>): ExperienceItem {
  return { ...emptyExperience(), ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined && v !== null)) } as ExperienceItem;
}
function sanitizeEducation(item: Partial<EducationItem>): EducationItem {
  return { ...emptyEducation(), ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined && v !== null)) } as EducationItem;
}
function sanitizeProject(item: Partial<ProjectItem>): ProjectItem {
  return { ...emptyProject(), ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined && v !== null)) } as ProjectItem;
}
function sanitizeResumeData(raw: Partial<ResumeData>): ResumeData {
  return {
    ...defaultResumeData,
    ...Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== null)),
    experience: (raw.experience?.length ? raw.experience.map(sanitizeExperience) : [emptyExperience()]),
    education: (raw.education?.length ? raw.education.map(sanitizeEducation) : [emptyEducation()]),
    projects: (raw.projects || []).map(sanitizeProject),
    skills: raw.skills || [],
    certifications: raw.certifications || [],
    languages: raw.languages || [],
    awards: raw.awards || [],
  };
}

const defaultResumeData: ResumeData = {
  fullName: "", email: "", phone: "", address: "", location: "", linkedin: "", website: "",
  photoUrl: "", summary: "", skills: [],
  experience: [emptyExperience()], education: [emptyEducation()], certifications: [],
  projects: [], languages: [], awards: [], volunteerWork: "", targetRole: "",
};

function calcAtsScore(d: ResumeData): number {
  let s = 0, max = 0;
  const checks: [boolean, number][] = [
    [!!d.fullName.trim(), 10],
    [!!d.email.trim(), 10],
    [!!d.phone.trim(), 8],
    [!!d.location.trim(), 5],
    [!!d.linkedin.trim(), 5],
    [d.summary.trim().length > 80, 12],
    [d.skills.length >= 5, 10],
    [d.skills.length >= 10, 5],
    [d.experience.some(e => e.position && e.company), 12],
    [d.experience.some(e => e.description.length > 50), 8],
    [d.education.some(e => e.degree && e.school), 8],
    [d.certifications.length > 0, 5],
    [d.projects.length > 0, 5],
    [d.languages.length > 0, 3],
    [!!d.targetRole.trim(), 4],
  ];
  for (const [ok, weight] of checks) { max += weight; if (ok) s += weight; }
  return Math.round((s / max) * 100);
}

/* ───────────── Component ───────────── */

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [step, setStep] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [activeColorTheme, setActiveColorTheme] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newLang, setNewLang] = useState("");
  const [newAward, setNewAward] = useState("");
  const [summaryTone, setSummaryTone] = useState<"executive" | "specialist" | "visionary">("executive");
  const [specialty, setSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const atsScore = useMemo(() => calcAtsScore(resumeData), [resumeData]);

  // Load from API
  useEffect(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResumeData(sanitizeResumeData(parsed));
        if (parsed.template) setActiveTemplate(TEMPLATES.findIndex(t => t.toLowerCase() === parsed.template) || 0);
        if (parsed.colorTheme) setActiveColorTheme(COLOR_THEMES.findIndex(c => c.name.toLowerCase() === parsed.colorTheme) || 0);
      } catch {}
    }

    fetch("/api/resume/save")
      .then(r => r.json())
      .then(d => {
        if (d.resume) {
          const r = d.resume.resume_data || d.resume;
          setResumeData(sanitizeResumeData(r));
        }
      })
      .catch(() => {});
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData));
  }, [resumeData]);

  /* ── Field helpers ── */

  function setField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setResumeData(prev => ({ ...prev, [key]: value }));
  }

  function updateExperience(idx: number, field: keyof ExperienceItem, value: string | boolean) {
    const updated = [...resumeData.experience];
    (updated[idx] as unknown as Record<string, unknown>)[field] = value;
    setField("experience", updated);
  }

  function updateEducation(idx: number, field: keyof EducationItem, value: string) {
    const updated = [...resumeData.education];
    (updated[idx] as unknown as Record<string, string>)[field] = value;
    setField("education", updated);
  }

  function updateProject(idx: number, field: keyof ProjectItem, value: string) {
    const updated = [...resumeData.projects];
    (updated[idx] as unknown as Record<string, string>)[field] = value;
    setField("projects", updated);
  }

  function addTag(list: keyof Pick<ResumeData, "skills" | "certifications" | "languages" | "awards">, value: string, setter: (v: string) => void) {
    if (!value.trim()) return;
    setField(list, [...(resumeData[list] as string[]), value.trim()] as never);
    setter("");
  }

  function removeTag(list: keyof Pick<ResumeData, "skills" | "certifications" | "languages" | "awards">, idx: number) {
    setField(list, (resumeData[list] as string[]).filter((_, i) => i !== idx) as never);
  }

  /* ── Save ── */

  async function saveResume(showFeedback = true) {
    setSaving(true);
    try {
      const payload = {
        resumeData: {
          ...resumeData,
          template: TEMPLATES[activeTemplate]?.toLowerCase(),
          colorTheme: COLOR_THEMES[activeColorTheme]?.name.toLowerCase(),
          atsScore,
        },
      };
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      if (showFeedback) {
        setStatusMsg({ type: "success", text: "Resume saved successfully!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch {
      if (showFeedback) {
        setStatusMsg({ type: "error", text: "Failed to save. Please try again." });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  /* ── AI Summary Generation ── */

  async function handleGenerateWithAI() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a professional ${summaryTone} resume summary for a ${specialty || "professional"} targeting a ${resumeData.targetRole || "senior role"} with ${experienceYears || "several"} years of experience. Key skills: ${keySkills || resumeData.skills.join(", ")}. Keep it under 4 sentences, ATS-friendly, impactful. No first person pronouns at the start. Start with an action word or descriptor.`,
          type: "resume_summary",
        }),
      });
      const data = await res.json();
      if (data.content || data.text || data.result) {
        setField("summary", data.content || data.text || data.result);
      }
    } catch {
      setStatusMsg({ type: "error", text: "AI generation failed." });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setAiLoading(false);
    }
  }

  /* ── AI Bullet Enhancement ── */

  async function enhanceBullet(expIdx: number) {
    const exp = resumeData.experience[expIdx];
    if (!exp?.description.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Rewrite these resume bullet points to be more impactful with action verbs, quantified achievements, and ATS keywords. Keep each bullet concise (one line). Position: ${exp.position} at ${exp.company}.\n\n${exp.description}`,
          type: "resume_bullets",
        }),
      });
      const data = await res.json();
      if (data.content || data.text || data.result) {
        updateExperience(expIdx, "description", data.content || data.text || data.result);
      }
    } catch {} finally {
      setAiLoading(false);
    }
  }

  /* ── Photo Upload ── */

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setField("photoUrl", data.url);
    } catch {}
  }

  /* ── Export ── */

  async function exportResume(format: "pdf" | "doc" | "txt" | "json" | "html" | "jpg") {
    // First save
    await saveResume(false);

    if (format === "pdf") {
      window.print();
      await saveExportedFile("pdf");
      return;
    }

    if (format === "jpg" && previewRef.current) {
      try {
        const { toJpeg } = await import("html-to-image");
        const dataUrl = await toJpeg(previewRef.current, { quality: 0.95, backgroundColor: "#ffffff" });
        downloadFile(dataUrl, `${resumeData.fullName || "resume"}.jpg`);
        await saveExportedFile("jpg");
      } catch {}
      return;
    }

    const fileName = `${resumeData.fullName || "resume"}.${format}`;

    if (format === "json") {
      const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: "application/json" });
      downloadBlob(blob, fileName);
    } else if (format === "txt") {
      const text = generatePlainText();
      const blob = new Blob([text], { type: "text/plain" });
      downloadBlob(blob, fileName);
    } else if (format === "html") {
      const html = previewRef.current?.outerHTML || "";
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${resumeData.fullName} Resume</title></head><body>${html}</body></html>`], { type: "text/html" });
      downloadBlob(blob, fileName);
    } else if (format === "doc") {
      const html = previewRef.current?.outerHTML || "";
      const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${html}</body></html>`], { type: "application/msword" });
      downloadBlob(blob, fileName);
    }

    await saveExportedFile(format);
  }

  function generatePlainText(): string {
    const d = resumeData;
    const lines: string[] = [];
    lines.push(d.fullName.toUpperCase());
    lines.push([d.email, d.phone, d.location, d.linkedin, d.website].filter(Boolean).join(" | "));
    lines.push("");
    if (d.summary) { lines.push("PROFESSIONAL SUMMARY", "-".repeat(40), d.summary, ""); }
    if (d.skills.length) { lines.push("CORE COMPETENCIES", "-".repeat(40), d.skills.join(" • "), ""); }
    if (d.experience.some(e => e.position)) {
      lines.push("PROFESSIONAL EXPERIENCE", "-".repeat(40));
      d.experience.filter(e => e.position).forEach(exp => {
        lines.push(`${exp.position} | ${exp.company}${exp.location ? ` | ${exp.location}` : ""}`);
        lines.push(`${exp.startDate} - ${exp.currentlyWorking ? "Present" : exp.endDate}`);
        if (exp.description) lines.push(exp.description);
        lines.push("");
      });
    }
    if (d.education.some(e => e.degree)) {
      lines.push("EDUCATION", "-".repeat(40));
      d.education.filter(e => e.degree).forEach(edu => {
        lines.push(`${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} | ${edu.school}`);
        lines.push([edu.startDate, edu.endDate].filter(Boolean).join(" - ") + (edu.grade ? ` | GPA: ${edu.grade}` : ""));
        lines.push("");
      });
    }
    if (d.certifications.length) { lines.push("CERTIFICATIONS", "-".repeat(40), ...d.certifications.map(c => `• ${c}`), ""); }
    if (d.projects.length) {
      lines.push("PROJECTS", "-".repeat(40));
      d.projects.forEach(p => { lines.push(`${p.name}${p.url ? ` (${p.url})` : ""}`, p.description || "", ""); });
    }
    if (d.languages.length) { lines.push("LANGUAGES", "-".repeat(40), d.languages.join(" • "), ""); }
    if (d.awards.length) { lines.push("AWARDS & HONORS", "-".repeat(40), ...d.awards.map(a => `• ${a}`), ""); }
    return lines.join("\n");
  }

  async function saveExportedFile(fileType: string) {
    try {
      await fetch("/api/resume/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `${resumeData.fullName || "resume"}_${new Date().toISOString().slice(0, 10)}.${fileType}`,
          fileType,
          template: TEMPLATES[activeTemplate]?.toLowerCase(),
          colorTheme: COLOR_THEMES[activeColorTheme]?.name.toLowerCase(),
        }),
      });
    } catch {}
  }

  function downloadFile(dataUrl: string, fileName: string) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    downloadFile(url, fileName);
    URL.revokeObjectURL(url);
  }

  /* ───────────── Template rendering ───────────── */

  const previewTheme = useMemo(() => {
    const tpl = TEMPLATES[activeTemplate]?.toLowerCase() || "classic";
    const ct = COLOR_THEMES[activeColorTheme] || COLOR_THEMES[0];
    const base = { bg: ct.bg, text: ct.text, heading: ct.heading, accent: ct.accent, border: ct.border, chip: ct.chip };
    switch (tpl) {
      case "modern": return { ...base, font: "'Inter', 'Segoe UI', sans-serif" };
      case "minimal": return { ...base, font: "'Georgia', serif" };
      case "executive": return { ...base, font: "'Garamond', 'Times New Roman', serif" };
      case "clean": return { ...base, font: "'Helvetica Neue', 'Arial', sans-serif" };
      case "professional": return { ...base, font: "'Calibri', 'Segoe UI', sans-serif" };
      default: return { ...base, font: "'Times New Roman', serif" };
    }
  }, [activeTemplate, activeColorTheme]);

  /* ───────────── Render ───────────── */

  return (
    <div className="px-4 py-8 sm:px-6" style={{ background: P.surface, color: P.onSurface }}>
      <div className="mx-auto max-w-7xl">

              {/* Header */}
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: P.primary }}>
                    Professional Resume Builder
                  </h1>
                  <p className="mt-1 text-sm" style={{ color: P.outline }}>
                    ATS-optimized resume that gets past screening systems
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* ATS Score */}
                  <div className="flex items-center gap-3 rounded-2xl border px-5 py-3" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                    <div className="relative h-12 w-12">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke={P.outlineVariant} strokeWidth="3" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke={atsScore >= 70 ? "#22c55e" : atsScore >= 40 ? "#eab308" : P.error} strokeWidth="3" strokeDasharray={`${(atsScore / 100) * 125.6} 125.6`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: P.onSurface }}>{atsScore}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: P.onSurface }}>ATS Score</p>
                      <p className="text-[10px]" style={{ color: P.outline }}>{atsScore >= 70 ? "Excellent" : atsScore >= 40 ? "Good" : "Needs work"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status message */}
              {statusMsg && (
                <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${statusMsg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {statusMsg.text}
                </div>
              )}

              {/* Step Navigation */}
              <div className="mb-8 flex items-center gap-1 overflow-x-auto rounded-2xl border p-2" style={{ borderColor: `${P.outlineVariant}44`, background: P.surfaceLow }}>
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setStep(i)}
                      className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all"
                      style={{
                        background: step === i ? `linear-gradient(135deg, ${P.primary}, ${P.primaryContainer})` : "transparent",
                        color: step === i ? "#fff" : i < step ? P.primary : P.outline,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {/* ── Left: Form ── */}
                <div className="space-y-6 lg:col-span-3">

                  {/* Step 0: Personal Info */}
                  {step === 0 && (
                    <section className="space-y-4">
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-4 text-lg font-bold" style={{ color: P.primary }}>Personal Information</h2>

                        {/* Photo */}
                        <div className="mb-5 flex items-center gap-4">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: P.outlineVariant }}>
                            {resumeData.photoUrl ? (
                              <Image src={resumeData.photoUrl} alt="Photo" fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center" style={{ background: P.surfaceHigh }}>
                                <User className="h-8 w-8" style={{ color: P.outline }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition-colors hover:bg-violet-500/10" style={{ borderColor: P.outlineVariant, color: P.primary }}>
                              <Upload className="mr-1 inline h-3 w-3" /> Upload Photo
                              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                            <p className="mt-1 text-[10px]" style={{ color: P.outline }}>Optional — some ATS systems ignore photos</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Full Name *</label>
                            <input value={resumeData.fullName} onChange={e => setField("fullName", e.target.value)} placeholder="John Doe" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Target Role</label>
                            <input value={resumeData.targetRole} onChange={e => setField("targetRole", e.target.value)} placeholder="Senior Software Engineer" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Email *</label>
                            <input type="email" value={resumeData.email} onChange={e => setField("email", e.target.value)} placeholder="john@example.com" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Phone *</label>
                            <input type="tel" value={resumeData.phone} onChange={e => setField("phone", e.target.value)} placeholder="+1 (555) 123-4567" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Location</label>
                            <input value={resumeData.location} onChange={e => setField("location", e.target.value)} placeholder="San Francisco, CA" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Address</label>
                            <input value={resumeData.address} onChange={e => setField("address", e.target.value)} placeholder="123 Main St" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>LinkedIn URL</label>
                            <input value={resumeData.linkedin} onChange={e => setField("linkedin", e.target.value)} placeholder="linkedin.com/in/johndoe" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Website / Portfolio</label>
                            <input value={resumeData.website} onChange={e => setField("website", e.target.value)} placeholder="johndoe.dev" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Step 1: Experience */}
                  {step === 1 && (
                    <section className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div key={`exp-${index}`} className="rounded-2xl border p-5" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                          <div className="mb-3 flex items-center justify-between">
                            <button onClick={() => updateExperience(index, "expanded", !exp.expanded)} className="flex items-center gap-2">
                              <h3 className="font-bold" style={{ color: P.primary }}>{exp.position || `Experience ${index + 1}`}</h3>
                              {exp.expanded ? <ChevronUp className="h-4 w-4" style={{ color: P.outline }} /> : <ChevronDown className="h-4 w-4" style={{ color: P.outline }} />}
                            </button>
                            <div className="flex items-center gap-2">
                              {exp.description.trim() && (
                                <button onClick={() => enhanceBullet(index)} disabled={aiLoading} className="rounded-lg border px-2 py-1 text-[10px] font-bold" style={{ borderColor: P.outlineVariant, color: P.tertiary }} title="AI-enhance bullet points">
                                  <Sparkles className="mr-1 inline h-3 w-3" /> Enhance
                                </button>
                              )}
                              {resumeData.experience.length > 1 && (
                                <button onClick={() => setField("experience", resumeData.experience.filter((_, i) => i !== index))} style={{ color: P.error }}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {exp.expanded && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Job Title *</label>
                                  <input value={exp.position} onChange={e => updateExperience(index, "position", e.target.value)} placeholder="Senior Software Engineer" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Company *</label>
                                  <input value={exp.company} onChange={e => updateExperience(index, "company", e.target.value)} placeholder="Google" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Location</label>
                                  <input value={exp.location} onChange={e => updateExperience(index, "location", e.target.value)} placeholder="Mountain View, CA" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Employment Type</label>
                                  <select value={exp.employmentType} onChange={e => updateExperience(index, "employmentType", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }}>
                                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Start Date</label>
                                  <input type="month" value={exp.startDate} onChange={e => updateExperience(index, "startDate", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>End Date</label>
                                  <div className="flex items-center gap-2">
                                    <input type="month" value={exp.endDate} onChange={e => updateExperience(index, "endDate", e.target.value)} disabled={exp.currentlyWorking} className={`${inputClass} ${exp.currentlyWorking ? "opacity-50" : ""}`} style={{ borderColor: P.outlineVariant }} />
                                  </div>
                                  <label className="mt-1 flex items-center gap-2 text-[10px]" style={{ color: P.outline }}>
                                    <input type="checkbox" checked={exp.currentlyWorking} onChange={e => updateExperience(index, "currentlyWorking", e.target.checked)} className="rounded" />
                                    Currently working here
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Key Achievements & Responsibilities</label>
                                <textarea value={exp.description} onChange={e => updateExperience(index, "description", e.target.value)} rows={5} placeholder="• Led a team of 8 engineers to deliver a microservices platform&#10;• Reduced deployment time by 40% through CI/CD pipeline optimization&#10;• Increased revenue by $2M through recommendation engine improvements" className="w-full rounded-xl border bg-[#241e3a] p-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/30" style={{ borderColor: P.outlineVariant }} />
                                <p className="mt-1 text-[10px]" style={{ color: P.outline }}>Use bullet points with action verbs and quantified results</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => setField("experience", [...resumeData.experience, emptyExperience()])}
                        className="w-full rounded-2xl border-2 border-dashed py-3 text-sm font-bold"
                        style={{ borderColor: P.tertiary, color: P.tertiary }}
                      >
                        <Plus className="mr-2 inline h-4 w-4" /> Add Experience
                      </button>
                    </section>
                  )}

                  {/* Step 2: Education */}
                  {step === 2 && (
                    <section className="space-y-4">
                      {resumeData.education.map((edu, index) => (
                        <div key={`edu-${index}`} className="rounded-2xl border p-5" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-bold" style={{ color: P.primary }}>{edu.degree || `Education ${index + 1}`}</h3>
                            {index > 0 && (
                              <button onClick={() => setField("education", resumeData.education.filter((_, i) => i !== index))} style={{ color: P.error }}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Degree *</label>
                              <input value={edu.degree} onChange={e => updateEducation(index, "degree", e.target.value)} placeholder="Bachelor of Science" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Field of Study</label>
                              <input value={edu.fieldOfStudy} onChange={e => updateEducation(index, "fieldOfStudy", e.target.value)} placeholder="Computer Science" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>School / University *</label>
                              <input value={edu.school} onChange={e => updateEducation(index, "school", e.target.value)} placeholder="Stanford University" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>GPA / Grade</label>
                              <input value={edu.grade} onChange={e => updateEducation(index, "grade", e.target.value)} placeholder="3.8/4.0" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Start Date</label>
                              <input type="month" value={edu.startDate} onChange={e => updateEducation(index, "startDate", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>End Date</label>
                              <input type="month" value={edu.endDate} onChange={e => updateEducation(index, "endDate", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Relevant Coursework / Activities</label>
                            <textarea value={edu.description} onChange={e => updateEducation(index, "description", e.target.value)} rows={2} placeholder="Dean's List, Teaching Assistant for Data Structures, Published research on ML..." className="w-full rounded-xl border bg-[#241e3a] p-3 text-sm text-white placeholder-zinc-500 outline-none" style={{ borderColor: P.outlineVariant }} />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => setField("education", [...resumeData.education, emptyEducation()])}
                        className="w-full rounded-2xl border-2 border-dashed py-3 text-sm font-bold"
                        style={{ borderColor: P.tertiary, color: P.tertiary }}
                      >
                        <Plus className="mr-2 inline h-4 w-4" /> Add Education
                      </button>

                      {/* Certifications in Education step */}
                      <div className="rounded-2xl border p-5" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h3 className="mb-3 font-bold" style={{ color: P.primary }}>Certifications & Licenses</h3>
                        <div className="mb-3 flex gap-2">
                          <input value={newCert} onChange={e => setNewCert(e.target.value)} className={inputClass} placeholder="AWS Solutions Architect, PMP, CFA..." style={{ borderColor: P.outlineVariant }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("certifications", newCert, setNewCert); } }} />
                          <button className="rounded-lg px-4 text-sm font-bold text-white" style={{ background: P.primary }} onClick={() => addTag("certifications", newCert, setNewCert)}>Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.certifications.map((cert, idx) => (
                            <span key={`cert-${idx}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: P.primaryFixed, color: P.primary }}>
                              <Award className="h-3 w-3" /> {cert}
                              <button onClick={() => removeTag("certifications", idx)}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Step 3: Skills */}
                  {step === 3 && (
                    <section className="space-y-4">
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-4 text-lg font-bold" style={{ color: P.primary }}>Technical & Professional Skills</h2>
                        <div className="mb-4 flex gap-2">
                          <input value={newSkill} onChange={e => setNewSkill(e.target.value)} className={inputClass} placeholder="React, TypeScript, AWS, Leadership, Agile..." style={{ borderColor: P.outlineVariant }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("skills", newSkill, setNewSkill); } }} />
                          <button className="rounded-lg px-4 text-sm font-bold text-white" style={{ background: P.primary }} onClick={() => addTag("skills", newSkill, setNewSkill)}>Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, idx) => (
                            <span key={`skill-${idx}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: P.surfaceHigh, color: P.onSurfaceVariant }}>
                              {skill}
                              <button onClick={() => removeTag("skills", idx)}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                        {resumeData.skills.length < 5 && (
                          <div className="mt-4 flex items-start gap-2 rounded-xl p-3" style={{ background: P.tertiaryFixed, color: P.onTertiaryFixed }}>
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                            <p className="text-xs font-medium">ATS tip: Add at least 5-10 skills matching the job description keywords for best results.</p>
                          </div>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>Languages</h2>
                        <div className="mb-3 flex gap-2">
                          <input value={newLang} onChange={e => setNewLang(e.target.value)} className={inputClass} placeholder="English (Native), Spanish (Professional)..." style={{ borderColor: P.outlineVariant }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("languages", newLang, setNewLang); } }} />
                          <button className="rounded-lg px-4 text-sm font-bold text-white" style={{ background: P.primary }} onClick={() => addTag("languages", newLang, setNewLang)}>Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.languages.map((lang, idx) => (
                            <span key={`lang-${idx}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: P.surfaceHigh, color: P.onSurfaceVariant }}>
                              <Globe className="h-3 w-3" /> {lang}
                              <button onClick={() => removeTag("languages", idx)}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Awards */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>Awards & Honors</h2>
                        <div className="mb-3 flex gap-2">
                          <input value={newAward} onChange={e => setNewAward(e.target.value)} className={inputClass} placeholder="Employee of the Year 2023, Hackathon Winner..." style={{ borderColor: P.outlineVariant }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("awards", newAward, setNewAward); } }} />
                          <button className="rounded-lg px-4 text-sm font-bold text-white" style={{ background: P.primary }} onClick={() => addTag("awards", newAward, setNewAward)}>Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.awards.map((award, idx) => (
                            <span key={`award-${idx}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: P.primaryFixed, color: P.primary }}>
                              <Star className="h-3 w-3" /> {award}
                              <button onClick={() => removeTag("awards", idx)}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Step 4: Projects */}
                  {step === 4 && (
                    <section className="space-y-4">
                      {resumeData.projects.length === 0 && (
                        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: `${P.outlineVariant}44`, background: P.surfaceLow }}>
                          <FolderOpen className="mx-auto mb-3 h-10 w-10" style={{ color: P.outline }} />
                          <h3 className="text-sm font-bold" style={{ color: P.onSurfaceVariant }}>No projects yet</h3>
                          <p className="mt-1 text-xs" style={{ color: P.outline }}>Showcase your best work to stand out from other candidates</p>
                        </div>
                      )}
                      {resumeData.projects.map((proj, index) => (
                        <div key={`proj-${index}`} className="rounded-2xl border p-5" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-bold" style={{ color: P.primary }}>{proj.name || `Project ${index + 1}`}</h3>
                            <button onClick={() => setField("projects", resumeData.projects.filter((_, i) => i !== index))} style={{ color: P.error }}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Project Name *</label>
                              <input value={proj.name} onChange={e => updateProject(index, "name", e.target.value)} placeholder="E-commerce Platform" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>URL</label>
                              <input value={proj.url} onChange={e => updateProject(index, "url", e.target.value)} placeholder="github.com/yourproject" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Start Date</label>
                              <input type="month" value={proj.startDate} onChange={e => updateProject(index, "startDate", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>End Date</label>
                              <input type="month" value={proj.endDate} onChange={e => updateProject(index, "endDate", e.target.value)} className={inputClass} style={{ borderColor: P.outlineVariant }} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Technologies Used</label>
                            <input value={proj.technologies} onChange={e => updateProject(index, "technologies", e.target.value)} placeholder="React, Node.js, PostgreSQL, AWS" className={inputClass} style={{ borderColor: P.outlineVariant }} />
                          </div>
                          <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: P.outline }}>Description</label>
                            <textarea value={proj.description} onChange={e => updateProject(index, "description", e.target.value)} rows={3} placeholder="Built a full-stack e-commerce platform serving 10K+ users..." className="w-full rounded-xl border bg-[#241e3a] p-3 text-sm text-white placeholder-zinc-500 outline-none" style={{ borderColor: P.outlineVariant }} />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => setField("projects", [...resumeData.projects, emptyProject()])}
                        className="w-full rounded-2xl border-2 border-dashed py-3 text-sm font-bold"
                        style={{ borderColor: P.tertiary, color: P.tertiary }}
                      >
                        <Plus className="mr-2 inline h-4 w-4" /> Add Project
                      </button>

                      {/* Volunteer Work */}
                      <div className="rounded-2xl border p-5" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h3 className="mb-3 font-bold" style={{ color: P.primary }}>Volunteer Work / Community Involvement</h3>
                        <textarea value={resumeData.volunteerWork} onChange={e => setField("volunteerWork", e.target.value)} rows={3} placeholder="Open source contributor to React, Mentor at Code for America..." className="w-full rounded-xl border bg-[#241e3a] p-3 text-sm text-white placeholder-zinc-500 outline-none" style={{ borderColor: P.outlineVariant }} />
                      </div>
                    </section>
                  )}

                  {/* Step 5: AI Summary */}
                  {step === 5 && (
                    <section className="space-y-4">
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>AI-Powered Summary Generator</h2>
                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                          {(["executive", "specialist", "visionary"] as const).map(tone => (
                            <button
                              key={tone}
                              onClick={() => setSummaryTone(tone)}
                              className="rounded-xl border px-4 py-3 text-left transition-all"
                              style={{
                                borderColor: summaryTone === tone ? P.primary : P.outlineVariant,
                                background: summaryTone === tone ? P.primaryFixed : P.surfaceLow,
                              }}
                            >
                              <p className="font-bold capitalize" style={{ color: P.primary }}>{tone}</p>
                              <p className="text-[10px]" style={{ color: P.outline }}>
                                {tone === "executive" ? "C-suite level tone" : tone === "specialist" ? "Domain expert tone" : "Innovation-focused tone"}
                              </p>
                            </button>
                          ))}
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <input value={specialty} onChange={e => setSpecialty(e.target.value)} className={inputClass} placeholder="Specialty (e.g., Backend Engineering)" style={{ borderColor: P.outlineVariant }} />
                          <input value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className={inputClass} placeholder="Years of experience" style={{ borderColor: P.outlineVariant }} />
                          <input value={keySkills} onChange={e => setKeySkills(e.target.value)} className={inputClass} placeholder="Key skills hints" style={{ borderColor: P.outlineVariant }} />
                          <input value={resumeData.targetRole} onChange={e => setField("targetRole", e.target.value)} className={inputClass} placeholder="Target role" style={{ borderColor: P.outlineVariant }} />
                        </div>

                        <button
                          className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                          style={{ background: `linear-gradient(135deg, ${P.primary}, ${P.primaryContainer})` }}
                          onClick={handleGenerateWithAI}
                          disabled={aiLoading}
                        >
                          {aiLoading ? "Generating..." : "Generate with AI"}
                        </button>
                      </div>

                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: P.outline }}>Professional Summary</label>
                        <textarea
                          value={resumeData.summary}
                          onChange={e => setField("summary", e.target.value)}
                          rows={6}
                          placeholder="Results-driven software engineer with 8+ years of experience designing and implementing scalable distributed systems. Proven track record of leading cross-functional teams to deliver high-impact products..."
                          className="w-full rounded-xl border bg-[#241e3a] p-3 text-sm text-white placeholder-zinc-500 outline-none"
                          style={{ borderColor: P.outlineVariant }}
                        />
                        <p className="mt-1 text-[10px]" style={{ color: P.outline }}>
                          {resumeData.summary.length}/500 characters — Aim for 3-4 impactful sentences
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Step 6: Finalize */}
                  {step === 6 && (
                    <section className="space-y-4">
                      {/* ATS Checklist */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>ATS Readiness Check</h2>
                        <div className="space-y-2">
                          {[
                            [!!resumeData.fullName.trim(), "Full name present", "Required for ATS parsing"],
                            [!!resumeData.email.trim(), "Email address", "Primary contact method"],
                            [!!resumeData.phone.trim(), "Phone number", "Secondary contact"],
                            [!!resumeData.location.trim(), "Location specified", "Helps with local job matching"],
                            [!!resumeData.linkedin.trim(), "LinkedIn profile", "Professional verification"],
                            [resumeData.skills.length >= 5, "5+ skills listed", "Match job description keywords"],
                            [resumeData.skills.length >= 10, "10+ skills (bonus)", "Comprehensive skill coverage"],
                            [resumeData.summary.trim().length > 80, "Strong professional summary", "First impression for recruiters"],
                            [resumeData.experience.some(e => e.description.length > 50), "Detailed experience bullets", "Quantified achievements preferred"],
                            [resumeData.education.some(e => e.degree), "Education listed", "Required for most roles"],
                            [resumeData.certifications.length > 0, "Certifications added", "Differentiator for ATS scoring"],
                            [resumeData.projects.length > 0, "Projects showcased", "Demonstrates practical skills"],
                          ].map(([ok, label, tip]) => (
                            <div key={String(label)} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: ok ? "#22c55e10" : `${P.errorContainer}44` }}>
                              {ok ? <Check className="h-4 w-4 shrink-0 text-green-500" /> : <AlertCircle className="h-4 w-4 shrink-0" style={{ color: P.error }} />}
                              <div>
                                <span className="text-sm font-medium" style={{ color: P.onSurface }}>{label as string}</span>
                                <span className="ml-2 text-[10px]" style={{ color: P.outline }}>{tip as string}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Template Selection */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>Resume Template</h2>
                        <div className="grid grid-cols-3 gap-3">
                          {TEMPLATES.map((tpl, idx) => (
                            <button
                              key={tpl}
                              className="rounded-xl border p-3 text-xs font-bold uppercase transition-all"
                              style={{
                                borderColor: activeTemplate === idx ? P.primary : P.outlineVariant,
                                color: activeTemplate === idx ? P.primary : P.outline,
                                background: activeTemplate === idx ? `${P.primary}10` : "transparent",
                              }}
                              onClick={() => setActiveTemplate(idx)}
                            >
                              {tpl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Theme */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>Color Theme</h2>
                        <div className="flex flex-wrap gap-3">
                          {COLOR_THEMES.map((ct, idx) => (
                            <button
                              key={ct.name}
                              onClick={() => setActiveColorTheme(idx)}
                              title={ct.name}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                              style={{
                                background: ct.accent,
                                borderColor: activeColorTheme === idx ? "#fff" : "transparent",
                                boxShadow: activeColorTheme === idx ? `0 0 0 2px ${P.primary}` : "none",
                              }}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs font-medium" style={{ color: P.outline }}>{COLOR_THEMES[activeColorTheme]?.name}</p>
                      </div>

                      {/* Export */}
                      <div className="rounded-2xl border p-6" style={{ borderColor: `${P.outlineVariant}66`, background: P.surfaceLow }}>
                        <h2 className="mb-3 text-lg font-bold" style={{ color: P.primary }}>Export Resume</h2>
                        <p className="mb-4 text-xs" style={{ color: P.outline }}>Every export is automatically saved to your account for admin review and your records.</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {(["pdf", "doc", "txt", "json", "html", "jpg"] as const).map(fmt => (
                            <button
                              key={fmt}
                              onClick={() => exportResume(fmt)}
                              className="rounded-xl border px-3 py-3 text-xs font-bold uppercase transition-all hover:bg-violet-500/10"
                              style={{ borderColor: P.outlineVariant, color: P.onSurfaceVariant }}
                            >
                              <Download className="mx-auto mb-1 h-4 w-4" />
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-30"
                      style={{ background: P.surfaceLow, color: P.outline }}
                      disabled={step === 0}
                      onClick={() => setStep(p => Math.max(0, p - 1))}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold"
                        style={{ borderColor: P.outlineVariant, color: P.onSurfaceVariant }}
                        onClick={() => saveResume(true)}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Draft"}
                      </button>
                      {step < STEPS.length - 1 && (
                        <button
                          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${P.primary}, ${P.primaryContainer})` }}
                          onClick={async () => { await saveResume(false); setStep(p => p + 1); }}
                        >
                          Save & Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Right: Live Preview ── */}
                <aside className="lg:col-span-2">
                  <div className="sticky top-24 space-y-3">
                    <button
                      className="w-full rounded-xl py-2 text-sm font-bold lg:hidden"
                      style={{ background: P.primaryFixed, color: P.primary }}
                      onClick={() => setShowPreview(p => !p)}
                    >
                      <Eye className="mr-2 inline h-4 w-4" /> {showPreview ? "Hide" : "Show"} Preview
                    </button>

                    <div
                      className={`${showPreview ? "block" : "hidden"} overflow-hidden rounded-2xl shadow-2xl lg:block print:block`}
                      ref={previewRef}
                      id="resume-preview"
                      style={{ background: previewTheme.bg, color: previewTheme.text, fontFamily: previewTheme.font, fontSize: "11px" }}
                    >
                      {/* ── Resume Header ── */}
                      <div className="px-7 pb-4 pt-7" style={{ borderBottom: `2px solid ${previewTheme.border}` }}>
                        <div className="flex items-start gap-4">
                          {resumeData.photoUrl && (
                            <Image src={resumeData.photoUrl} alt="Photo" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover border" style={{ borderColor: previewTheme.border }} />
                          )}
                          <div className="min-w-0">
                            <h2 className="text-xl font-black leading-tight tracking-tight" style={{ color: previewTheme.heading }}>
                              {resumeData.fullName || "YOUR NAME"}
                            </h2>
                            {resumeData.targetRole && (
                              <p className="mt-0.5 text-xs font-semibold tracking-wide" style={{ color: previewTheme.accent }}>
                                {resumeData.targetRole}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]" style={{ color: previewTheme.text }}>
                              {resumeData.email && <span className="inline-flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {resumeData.email}</span>}
                              {resumeData.phone && <span className="inline-flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {resumeData.phone}</span>}
                              {resumeData.location && <span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {resumeData.location}</span>}
                              {resumeData.linkedin && <span className="inline-flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" /> {resumeData.linkedin}</span>}
                              {resumeData.website && <span className="inline-flex items-center gap-1"><Globe className="h-2.5 w-2.5" /> {resumeData.website}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-7 py-5">
                        {/* Summary */}
                        {resumeData.summary && (
                          <section>
                            <h3 className="mb-1.5 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Professional Summary
                            </h3>
                            <p className="leading-relaxed">{resumeData.summary}</p>
                          </section>
                        )}

                        {/* Skills */}
                        {resumeData.skills.length > 0 && (
                          <section>
                            <h3 className="mb-2 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Core Competencies
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {resumeData.skills.map((skill, i) => (
                                <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: previewTheme.chip, color: previewTheme.heading }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Experience */}
                        {resumeData.experience.some(e => e.position) && (
                          <section>
                            <h3 className="mb-2 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Professional Experience
                            </h3>
                            <div className="space-y-3">
                              {resumeData.experience.filter(e => e.position).map((exp, idx) => (
                                <div key={idx}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-bold leading-tight" style={{ color: previewTheme.heading }}>{exp.position}</p>
                                      <p className="font-semibold" style={{ color: previewTheme.accent }}>
                                        {exp.company}{exp.location ? ` — ${exp.location}` : ""}{exp.employmentType && exp.employmentType !== "Full-time" ? ` (${exp.employmentType})` : ""}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-[9px] font-medium" style={{ color: previewTheme.accent }}>
                                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                                    </span>
                                  </div>
                                  {exp.description && (
                                    <ul className="mt-1 space-y-0.5 pl-2">
                                      {exp.description.split("\n").filter(Boolean).map((line, li) => (
                                        <li key={li} className="flex items-start gap-1.5 leading-snug">
                                          <span className="mt-1 shrink-0 text-[8px]" style={{ color: previewTheme.accent }}>▸</span>
                                          <span>{line.replace(/^[-•*]\s*/, "")}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Projects */}
                        {resumeData.projects.some(p => p.name) && (
                          <section>
                            <h3 className="mb-2 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Projects
                            </h3>
                            <div className="space-y-2">
                              {resumeData.projects.filter(p => p.name).map((proj, idx) => (
                                <div key={idx}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-bold leading-tight" style={{ color: previewTheme.heading }}>{proj.name}</p>
                                      {proj.technologies && <p className="text-[9px] italic" style={{ color: previewTheme.accent }}>Tech: {proj.technologies}</p>}
                                    </div>
                                    {(proj.startDate || proj.endDate) && (
                                      <span className="shrink-0 text-[9px]" style={{ color: previewTheme.accent }}>
                                        {[proj.startDate, proj.endDate].filter(Boolean).join(" – ")}
                                      </span>
                                    )}
                                  </div>
                                  {proj.description && <p className="mt-0.5 leading-snug">{proj.description}</p>}
                                  {proj.url && <p className="text-[9px]" style={{ color: previewTheme.accent }}>{proj.url}</p>}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Education */}
                        {resumeData.education.some(e => e.degree) && (
                          <section>
                            <h3 className="mb-2 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Education
                            </h3>
                            <div className="space-y-2">
                              {resumeData.education.filter(e => e.degree).map((edu, idx) => (
                                <div key={idx} className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-bold leading-tight" style={{ color: previewTheme.heading }}>
                                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                                    </p>
                                    <p style={{ color: previewTheme.accent }}>{edu.school}</p>
                                    {edu.grade && <p className="text-[9px]">GPA: {edu.grade}</p>}
                                    {edu.description && <p className="text-[9px] mt-0.5">{edu.description}</p>}
                                  </div>
                                  <span className="shrink-0 text-[9px]" style={{ color: previewTheme.accent }}>
                                    {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Certifications */}
                        {resumeData.certifications.some(Boolean) && (
                          <section>
                            <h3 className="mb-1.5 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Certifications & Licenses
                            </h3>
                            <ul className="space-y-0.5">
                              {resumeData.certifications.filter(Boolean).map((cert, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span style={{ color: previewTheme.accent }}>✓</span> {cert}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {/* Languages */}
                        {resumeData.languages.length > 0 && (
                          <section>
                            <h3 className="mb-1.5 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Languages
                            </h3>
                            <p>{resumeData.languages.join(" • ")}</p>
                          </section>
                        )}

                        {/* Awards */}
                        {resumeData.awards.length > 0 && (
                          <section>
                            <h3 className="mb-1.5 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Awards & Honors
                            </h3>
                            <ul className="space-y-0.5">
                              {resumeData.awards.map((award, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span style={{ color: previewTheme.accent }}>★</span> {award}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {/* Volunteer */}
                        {resumeData.volunteerWork && (
                          <section>
                            <h3 className="mb-1.5 border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.heading, borderColor: previewTheme.border }}>
                              Community Involvement
                            </h3>
                            <p className="leading-relaxed">{resumeData.volunteerWork}</p>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
      </div>

      {/* Bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-[#0f0a1e]/95 backdrop-blur print:hidden" style={{ borderColor: `${P.outlineVariant}66` }}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-2" style={{ background: P.primaryFixed }}>
                  <FileText className="h-4 w-4" style={{ color: P.primary }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: P.primary }}>{resumeData.fullName || "Untitled Resume"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.outline }}>
                    {TEMPLATES[activeTemplate]} • {COLOR_THEMES[activeColorTheme]?.name} • ATS {atsScore}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-xl border px-4 py-2 text-sm font-bold" style={{ borderColor: P.outlineVariant, color: P.onSurfaceVariant }} onClick={() => saveResume(true)} disabled={saving}>
                  <Save className="mr-1 inline h-4 w-4" /> {saving ? "..." : "Save"}
                </button>
                <button className="rounded-xl px-5 py-2 text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${P.primary}, ${P.primaryContainer})` }} onClick={() => exportResume("pdf")}>
                  <Download className="mr-1 inline h-4 w-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}
