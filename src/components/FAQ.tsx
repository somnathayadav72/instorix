"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      q: "Is this service free to use?",
      a: "Yes, completely free. No account required, no limits.",
    },
    {
      q: "Can I download from private Instagram accounts?",
      a: "No. This tool only works with public posts. Private account content requires the account owner's permission.",
    },
    {
      q: "What video quality will I get?",
      a: "You get the highest quality available — usually 1080p HD.",
    },
    {
      q: "Is it safe to use?",
      a: "Yes. We don't store your Instagram URL or any downloaded media on our servers.",
    },
    {
      q: "Why isn't my link working?",
      a: "Make sure the post is from a public account and that you've copied the full URL including https://. Stories sometimes expire after 24 hours.",
    },
    {
      q: "Does this work on mobile?",
      a: "Yes, the website is fully responsive and works on iOS and Android browsers.",
    },
    {
      q: "Can I download Instagram Stories?",
      a: "Yes, as long as the profile is public and the story is still active.",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Frequently Asked Questions</h2>
        
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 dark:border-gray-800 py-2">
              <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-gray-100 hover:text-insta-pink transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed pt-2 pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
