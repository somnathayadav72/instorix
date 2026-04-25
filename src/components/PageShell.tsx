"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-[#fafafa]"
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
            },
          }}
        />
      </motion.main>
    </AnimatePresence>
  );
}
