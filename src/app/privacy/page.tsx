import Link from "next/link";
import type { Metadata } from "next";
import InstorixLogo from "@/components/InstorixLogo";

export const metadata: Metadata = {
  title: "Privacy Policy | Instorix — Free Instagram Downloader",
  description: "Read Instorix's privacy policy. We do not collect, store or share your data. No login required, no cookies, no tracking.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://instorix.in'}/privacy`,
  },
  robots: { index: true, follow: true },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
    <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h2>
    <div className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-20 pb-20 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-8"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <InstorixLogo variant="icon" size={48} className="mb-4 rounded-2xl shadow-md" />
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-1">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500">
            Last updated{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <Section title="1. What we collect">
            <p>
              Instorix does <strong className="text-gray-800">not</strong> collect, store, or
              process any personal information. No account registration or login is required.
            </p>
          </Section>

          <Section title="2. URL processing">
            <p>
              When you paste an Instagram URL, it is sent to our server solely to fetch media
              metadata from Instagram's public endpoints. We do not log, store, or share these
              URLs.
            </p>
          </Section>

          <Section title="3. Local storage">
            <p>
              Your recent download history is stored only in your browser's{" "}
              <code className="bg-gray-100 rounded px-1 text-[13px] font-mono">
                localStorage
              </code>
              . This data never leaves your device and can be cleared at any time using the{" "}
              <strong className="text-gray-800">Clear</strong> button in the app.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              Instorix does not use cookies for tracking or analytics. No third-party tracking
              scripts are embedded.
            </p>
          </Section>

          <Section title="5. Third-party services">
            <p>
              Media is fetched from Instagram's CDN and streamed through our proxy to your
              browser. We do not interact with advertising networks or analytics platforms.
            </p>
          </Section>

          <Section title="6. Children's privacy">
            <p>
              Instorix is not directed at children under 13. We do not knowingly collect
              information from minors.
            </p>
          </Section>

          <Section title="7. Changes">
            <p>
              We may update this policy from time to time. Continued use of the service
              constitutes acceptance of any changes.
            </p>
          </Section>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-gray-300 mt-10">
          Instorix is not affiliated with Instagram or Meta Platforms Inc.
        </p>
      </div>
    </main>
  );
}
