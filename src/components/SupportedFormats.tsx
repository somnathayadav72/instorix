"use client";

import { Play, Image as ImageIcon, Clock, Tv, Layers } from "lucide-react";

export default function SupportedFormats() {
  const formats = [
    {
      title: "Reels",
      desc: "Download Reels in full HD MP4 format",
      badge: "MP4 • HD",
      icon: <Play className="w-8 h-8 text-white" fill="currentColor" />,
      bg: "bg-insta-pink",
    },
    {
      title: "Feed Posts",
      desc: "Save photos and multi-photo carousels",
      badge: "JPG • PNG",
      icon: <ImageIcon className="w-8 h-8 text-white" />,
      bg: "bg-insta-purple",
    },
    {
      title: "Stories",
      desc: "Grab stories before they expire in 24h",
      badge: "MP4 • JPG",
      icon: <Clock className="w-8 h-8 text-white" />,
      bg: "bg-insta-orange",
    },
    {
      title: "IGTV",
      desc: "Long-form IGTV videos in full quality",
      badge: "MP4 • HD",
      icon: <Tv className="w-8 h-8 text-white" />,
      bg: "bg-blue-500",
    },
    {
      title: "Carousels",
      desc: "Download all photos/videos from a carousel post",
      badge: "Bulk Download",
      icon: <Layers className="w-8 h-8 text-white" />,
      bg: "bg-green-500",
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Supported Content Types</h2>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {formats.map((fmt, idx) => (
            <div
              key={idx}
              className="min-w-[240px] md:min-w-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center snap-center shrink-0 hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md ${fmt.bg}`}>
                {fmt.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{fmt.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">{fmt.desc}</p>
              <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                {fmt.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
