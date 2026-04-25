"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link2, Clipboard, Download, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      num: 1,
      title: "Copy the Instagram URL",
      desc: "Open Instagram, find the post/reel/story you want, tap the three dots menu and copy the link.",
      icon: <Link2 className="w-8 h-8 text-insta-pink" />,
    },
    {
      num: 2,
      title: "Paste it Here",
      desc: "Paste the link into the input field above and click the Download button.",
      icon: <Clipboard className="w-8 h-8 text-insta-purple" />,
    },
    {
      num: 3,
      title: "Download & Save",
      desc: "Preview your media and download it in the highest available quality.",
      icon: <Download className="w-8 h-8 text-insta-orange" />,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-950" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400"
          >
            Download any Instagram content in 3 simple steps
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 relative"
        >
          {steps.map((step, index) => (
            <motion.div key={step.num} variants={itemVariants} className="relative flex flex-col items-center text-center">
              {/* Connecting Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full">
                  <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-700 mx-auto" />
                </div>
              )}
              
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-insta-gradient text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white dark:border-gray-950">
                  {step.num}
                </div>
              </div>
              <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-3">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
