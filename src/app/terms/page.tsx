import Link from "next/link";
import type { Metadata } from "next";
import InstorixLogo from "@/components/InstorixLogo";

export const metadata: Metadata = {
  title: "Terms of Service — Instorix",
  description: "Terms and conditions for using Instorix.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
    <h2 className="text-[15px] font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-[14px] text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] pt-20 pb-20 px-4">
      <div className="max-w-lg mx-auto">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <InstorixLogo variant="icon" size={48} className="mb-4 rounded-2xl shadow-md" />
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1">
            Terms of Service
          </h1>
          <p className="text-[13px] text-gray-400">
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
          <Section title="1. Acceptance">
            <p>
              By using Instorix, you agree to these Terms. If you do not agree, please do not
              use this service.
            </p>
          </Section>

          <Section title="2. Permitted use">
            <p>
              Instorix is for <strong className="text-gray-800">personal, non-commercial use</strong>{" "}
              only. You may only download content you own, have permission to download, or that is
              in the public domain.
            </p>
          </Section>

          <Section title="3. Copyright & intellectual property">
            <p>
              All Instagram content belongs to its original creators. Downloading does not
              transfer any copyright or IP rights. You are responsible for complying with
              applicable copyright laws and Instagram's Terms of Service.
            </p>
          </Section>

          <Section title="4. Prohibited use">
            <p>You agree <strong className="text-gray-800">not</strong> to:</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-500">
              <li>Redistribute downloaded content without the creator's permission</li>
              <li>Use content for commercial purposes without authorization</li>
              <li>Download private content you don't have access to</li>
              <li>Automate or scrape this service in bulk</li>
              <li>Use this service to harass or harm content creators</li>
            </ul>
          </Section>

          <Section title="5. No affiliation with Instagram">
            <p>
              Instorix is an independent tool and is{" "}
              <strong className="text-gray-800">
                not affiliated with, endorsed by, or connected to Instagram or Meta Platforms
                Inc.
              </strong>{" "}
              in any way.
            </p>
          </Section>

          <Section title="6. Disclaimer of warranties">
            <p>
              Instorix is provided "as is" without warranties of any kind. We do not guarantee
              availability or that all Instagram content will be downloadable. Instagram may
              change their platform in ways that affect this service at any time.
            </p>
          </Section>

          <Section title="7. Limitation of liability">
            <p>
              To the maximum extent permitted by law, Instorix and its maintainers shall not
              be liable for any indirect, incidental, or consequential damages arising from use
              of this service.
            </p>
          </Section>

          <Section title="8. Changes to terms">
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              service after changes are posted constitutes acceptance of the revised terms.
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
