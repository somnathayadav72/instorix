"use client";

import { Toaster } from "react-hot-toast";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
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
    </main>
  );
}
