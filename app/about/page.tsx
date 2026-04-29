"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background gradient-mesh pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-16 text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-4">Our Story</span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-[0.95]">
              About <span className="text-gradient italic">AiBlog</span>
            </h1>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto leading-relaxed">
              We are building the future of editorial excellence where generative intelligence meets professional journalism.
            </p>
          </header>

          <div className="space-y-16">
            {/* Mission */}
            <section className="glass-panel rounded-2xl p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">flag</span>
                </div>
                <h2 className="text-2xl font-bold font-headline">Our Mission</h2>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                AiBlog was founded with a singular vision: to democratize high-quality content creation by harnessing the power of artificial intelligence. We believe that every creator — whether a seasoned journalist or a first-time blogger — deserves access to tools that amplify their voice and accelerate their career.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Our platform combines AI-powered writing assistance with career progression tracking, community collaboration, and data-driven insights to create a comprehensive ecosystem for the modern content creator.
              </p>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">What We Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: "auto_awesome", title: "AI-Powered Writing", desc: "Leverage Google Gemini to generate, refine, and enhance your content with intelligent suggestions and full article generation." },
                  { icon: "trending_up", title: "Career Tracking", desc: "Monitor your growth with detailed analytics, milestone tracking, and personalized career progression roadmaps." },
                  { icon: "groups", title: "Community", desc: "Connect with fellow creators, share insights, and collaborate on stories that matter in our vibrant community." },
                ].map((item) => (
                  <div key={item.title} className="glass-panel rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    </div>
                    <h3 className="font-bold font-headline text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Team */}
            <section>
              <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Alex Chen", role: "Founder & CEO", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
                  { name: "Priya Sharma", role: "Head of AI", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
                  { name: "Marcus Johnson", role: "Head of Product", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
                ].map((member) => (
                  <div key={member.name} className="glass-panel rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-surface-container-high">
                      <Image src={member.img} alt={member.name} width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold font-headline">{member.name}</h3>
                    <p className="text-xs text-primary uppercase tracking-wider mt-1">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Values */}
            <section className="glass-panel rounded-2xl p-10">
              <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Innovation First", desc: "We push the boundaries of what AI can do for content creation, constantly evolving our tools and platform." },
                  { title: "Creator-Centric", desc: "Every decision we make is guided by what helps our creators succeed and grow their careers." },
                  { title: "Ethical AI", desc: "We are committed to responsible AI use, ensuring transparency and fairness in all our AI-powered features." },
                  { title: "Community Driven", desc: "We believe in the power of community and foster an environment of collaboration and mutual growth." },
                ].map((value) => (
                  <div key={value.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{value.title}</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
