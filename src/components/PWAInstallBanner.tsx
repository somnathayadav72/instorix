"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";
import InstorixLogo from "@/components/InstorixLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_banner_dismissed";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Check if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so page loads first
      setTimeout(() => setVisible(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:w-[360px]"
          role="banner"
          aria-label="Install Instorix app"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            {/* Logo */}
            <div className="shrink-0 mt-0.5">
              <InstorixLogo variant="icon" size={40} className="rounded-xl" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <Smartphone className="w-3.5 h-3.5 text-[#E1306C]" />
                <p className="text-[11px] font-semibold text-[#E1306C] uppercase tracking-wider">
                  Install App
                </p>
              </div>
              <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Add Instorix to your home screen
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                Download Instagram content instantly, even offline.
              </p>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#F77737] via-[#E1306C] to-[#833AB4] hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="cursor-pointer px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              aria-label="Close install banner"
              className="cursor-pointer shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
