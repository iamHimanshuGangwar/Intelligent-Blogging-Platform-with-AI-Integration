"use client";
import Link from "next/link";

export default function TopNavbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5 font-headline">
      <nav className="flex justify-between items-center px-6 lg:px-12 h-20 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AiBlog
          </Link>
          <div className="hidden lg:flex gap-8">
            <Link href="#" className="text-on-surface font-medium hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary">Dashboard</Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface transition-colors">Community</Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface transition-colors">Editor</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-semibold hover:text-primary transition-colors">Login</button>
          <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95">
            Create Post
          </button>
        </div>
      </nav>
    </header>
  );
}