"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background gradient-mesh pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-4">Legal</span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-[0.95]">
              Privacy <span className="text-gradient italic">Policy</span>
            </h1>
            <p className="text-on-surface-variant mt-4">Last updated: January 2025</p>
          </header>

          <div className="glass-panel rounded-2xl p-8 sm:p-12 prose-invert max-w-none space-y-10">
            <section>
              <h2 className="text-xl font-bold font-headline mb-4">1. Introduction</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                AiBlog (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website, APIs, and AI-powered services. Please read this policy carefully. By using AiBlog, you consent to the practices described in this document.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">2. Information We Collect</h2>
              <h3 className="text-base font-bold mb-2">2.1 Personal Information</h3>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li><strong>Account Data:</strong> Name, email address, password (encrypted), and profile information you provide during registration.</li>
                <li><strong>Profile Data:</strong> Avatar, bio, website URL, and other information you choose to add to your profile.</li>
                <li><strong>Content Data:</strong> Blog posts, comments, community posts, and other content you create on the platform.</li>
              </ul>

              <h3 className="text-base font-bold mb-2 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages, and interaction patterns.</li>
                <li><strong>Device Data:</strong> Browser type, operating system, device type, and IP address.</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and preferences. See our Cookie Policy for details.</li>
              </ul>

              <h3 className="text-base font-bold mb-2 mt-6">2.3 AI-Related Data</h3>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li><strong>Prompts & Generated Content:</strong> Topics, prompts, and tone preferences you submit for AI content generation.</li>
                <li><strong>Analytics:</strong> Writing patterns and engagement metrics used to provide personalized insights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">3. How We Use Your Information</h2>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li>Provide, maintain, and improve our platform and services.</li>
                <li>Generate AI-assisted content based on your prompts and preferences.</li>
                <li>Track career progression and provide personalized recommendations.</li>
                <li>Send notifications about activity relevant to your account (likes, comments, follows).</li>
                <li>Send newsletters and updates (only with your consent; you can unsubscribe anytime).</li>
                <li>Analyze usage patterns to improve user experience and platform performance.</li>
                <li>Prevent fraud, abuse, and ensure platform security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">4. Data Sharing & Disclosure</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                We do not sell your personal information. We may share data in the following limited circumstances:
              </p>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li><strong>Service Providers:</strong> We use Supabase for database and authentication, Google Gemini for AI generation, and Adzuna for job listings. These providers process data as necessary to provide their services.</li>
                <li><strong>Public Content:</strong> Blog posts, comments, and community posts you publish are visible to other users and the public.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights, safety, or the safety of others.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">5. Data Security</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted password storage (bcrypt hashing via Supabase Auth), Row Level Security (RLS) on all database tables, and secure session management via HTTP-only cookies. While we strive to protect your data, no method of electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">6. Your Rights</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">You have the right to:</p>
              <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-5">
                <li><strong>Access:</strong> Request a copy of your personal data.</li>
                <li><strong>Rectification:</strong> Update or correct inaccurate information via your profile settings.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                <li><strong>Data Portability:</strong> Request your data in a machine-readable format.</li>
                <li><strong>Withdraw Consent:</strong> Unsubscribe from newsletters or opt out of non-essential data collection.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">7. Cookies</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We use essential cookies for authentication and session management. These are required for the platform to function. We do not use third-party tracking cookies or advertising cookies. You can manage cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                AiBlog is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">9. Changes to This Policy</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or in-app notification. The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-headline mb-4">10. Contact Us</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
              </p>
              <div className="mt-4 p-4 rounded-xl bg-surface-container text-sm text-on-surface-variant">
                <p><strong>AiBlog Privacy Team</strong></p>
                <p>Email: privacy@aiblog.com</p>
                <p>Address: Bangalore, Karnataka, India 560001</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
