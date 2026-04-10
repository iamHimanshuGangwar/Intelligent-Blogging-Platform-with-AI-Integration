"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate form submission (connect to an actual endpoint if needed)
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("sent");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background gradient-mesh pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16 text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-4">Get In Touch</span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-[0.95]">
              Contact <span className="text-gradient italic">Us</span>
            </h1>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto leading-relaxed">
              Have a question, partnership proposal, or just want to say hello? We&apos;d love to hear from you.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: "mail", title: "Email", value: "hello@aiblog.com", sub: "We reply within 24 hours" },
                { icon: "location_on", title: "Office", value: "Bangalore, Karnataka", sub: "India 560001" },
                { icon: "schedule", title: "Hours", value: "Mon - Fri, 9AM - 6PM", sub: "IST (UTC+5:30)" },
              ].map((item) => (
                <div key={item.title} className="glass-panel rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-on-surface text-sm">{item.value}</p>
                    <p className="text-xs text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-bold text-sm mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { name: "Twitter/X", icon: "public" },
                    { name: "LinkedIn", icon: "public" },
                    { name: "GitHub", icon: "public" },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all"
                      title={social.name}
                    >
                      <span className="material-symbols-outlined text-lg">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-2xl p-8">
                {status === "sent" ? (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-green-400 text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <h3 className="text-2xl font-bold font-headline mb-2">Message Sent!</h3>
                    <p className="text-on-surface-variant text-sm mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                    <button onClick={() => setStatus("idle")} className="text-primary font-semibold text-sm hover:underline">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface outline-none focus:border-primary/50"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnerships</option>
                        <option value="careers">Career Application</option>
                        <option value="media">Press & Media</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Message</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-xl text-sm hover:scale-[1.01] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {status === "sending" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
