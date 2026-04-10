"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: "edit_note",
    title: "Write & Publish",
    description: "Create AI-enhanced blog posts with 340+ professional themes. Our editor helps you write faster with smart suggestions.",
  },
  {
    icon: "trending_up",
    title: "Grow Your Career",
    description: "Get personalized career tracks, build your portfolio, and connect with industry mentors through our AI-powered career hub.",
  },
  {
    icon: "groups",
    title: "Join the Community",
    description: "Engage with fellow creators in forums, collaborate on projects, and discover trending research and world news.",
  },
];

const STORAGE_KEY = "aiblog-onboarding-done";

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-surface-container rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {current.icon}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-3">
              {current.title}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
              {current.description}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 bg-primary" : "w-2 bg-on-surface-variant/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="ghost"
                onClick={finish}
                className="text-on-surface-variant text-sm"
              >
                Skip
              </Button>
              <Button
                onClick={next}
                className="bg-primary text-white px-8 font-semibold hover:bg-primary/90"
              >
                {step < STEPS.length - 1 ? "Next" : "Get Started"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
