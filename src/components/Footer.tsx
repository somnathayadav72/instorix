import Link from "next/link";
import InstorixLogo from "@/components/InstorixLogo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-6">

        {/* Logo */}
        <InstorixLogo variant="full" size={30} />

        {/* Tagline */}
        <p className="text-sm text-gray-400 text-center max-w-xs">
          Download Instagram content for free. No login. No watermarks.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <Link href="/#faq" className="hover:text-gray-700 transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Instorix. All rights reserved.
          </p>
          <p className="text-xs text-gray-300">
            Not affiliated with Instagram or Meta Platforms Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
