import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/components/QueryProvider";
import { ClerkErrorBoundary } from "@/components/ClerkProviderWrapper";
import ClientShell from "@/components/ClientShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata = {
  metadataBase: new URL('https://aiblog.dev'),
  title: {
    default: "AiBlog - AI-Powered Blogging & Career Platform",
    template: "%s | AiBlog",
  },
  description: "A premium digital ecosystem where generative intelligence meets professional journalism. Discover AI-curated insights, advance your career, and connect with a thriving community.",
  keywords: ["AI blog", "career platform", "AI writing", "professional journalism", "tech blog", "career development"],
  authors: [{ name: "AiBlog Editorial" }],
  creator: "AiBlog",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aiblog.dev",
    siteName: "AiBlog",
    title: "AiBlog - AI-Powered Blogging & Career Platform",
    description: "A premium digital ecosystem where generative intelligence meets professional journalism.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AiBlog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AiBlog - AI-Powered Blogging & Career Platform",
    description: "A premium digital ecosystem where generative intelligence meets professional journalism.",
    images: ["/og-image.png"],
    creator: "@aiblog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "https://aiblog.dev" },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" data-scroll-behavior="smooth" className={`light scroll-smooth ${inter.variable} ${manrope.variable}`}>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap" />
        </head>
        <body className="font-body selection:bg-primary/30 overflow-x-hidden">
          <ClerkErrorBoundary>
            <AuthProvider>
              <ThemeProvider>
                <QueryProvider>
                  <AppProvider>
                    <ClientShell>
                      {children}
                    </ClientShell>
                  </AppProvider>
                </QueryProvider>
              </ThemeProvider>
            </AuthProvider>
          </ClerkErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}