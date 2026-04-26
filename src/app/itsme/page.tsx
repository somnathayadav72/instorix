import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";

export default function ItsMe() {
  return (
    <PageShell>
      <Navbar />
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-insta-orange/5 via-insta-pink/5 to-insta-purple/5 pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-insta-orange via-insta-pink to-insta-purple bg-clip-text text-transparent relative z-10">
            Loda Me j Banavi chhe
          </h1>
        </div>
      </div>
    </PageShell>
  );
}
