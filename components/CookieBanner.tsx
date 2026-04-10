"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay appearance for better UX as seen in your original code
    const timer = setTimeout(() => {
      const consent = localStorage.getItem("cookie-consent");
      if (!consent) setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 200, x: "-50%" }}
          animate={{ y: 0, x: "-50%" }}
          exit={{ y: 200, x: "-50%" }}
          className="fixed bottom-6 left-1/2 z-100 w-[90%] max-w-2xl"
        >
          <div className="bg-surface-container-highest/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-on-surface leading-relaxed">
                We use cookies to enhance your experience and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. <a href="#" className="text-primary underline font-medium">Read Policy</a>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsVisible(false)}
                className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Manage
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-sm font-bold hover:shadow-lg transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}