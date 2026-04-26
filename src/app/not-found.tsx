import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
          <SearchX className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 text-lg">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full bg-insta-gradient text-white hover:opacity-90 font-semibold h-14 rounded-xl text-lg shadow-md"
          )}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
