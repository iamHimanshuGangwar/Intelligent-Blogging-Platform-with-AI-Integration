"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function PageHeader({ title, description, badge, ctaLabel, ctaHref }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      {badge && (
        <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {ctaLabel && ctaHref && (
          <Button asChild className="bg-primary text-white hover:bg-primary/90 font-semibold px-6">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
