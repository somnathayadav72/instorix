"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, LayoutGrid, Zap, Heart, Smartphone } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "HD Quality",
      desc: "Download videos and photos in original HD resolution",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: "No Login Required",
      desc: "No Instagram account or login needed ever",
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: "All Formats",
      desc: "Supports Reels, Posts, Stories, IGTV and Carousels",
      icon: <LayoutGrid className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "Lightning Fast",
      desc: "Content fetched and ready in seconds",
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-100",
    },
    {
      title: "100% Free",
      desc: "Completely free, no hidden fees or subscriptions",
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      bg: "bg-pink-100",
    },
    {
      title: "Mobile Friendly",
      desc: "Works perfectly on any device or browser",
      icon: <Smartphone className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-100",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Instorix?</h2>
          <p className="text-lg text-gray-500">
            The best tool to save your favorite Instagram content securely and quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
