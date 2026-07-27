"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-white/70 mb-6">
          <Sparkles size={14} className="text-cyan-400" /> AI-Powered Marketing Decision Intelligence
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Know if your campaign will <span className="gradient-text">succeed</span> — before you spend a dollar.
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
          MarketPulse AI predicts ROI, CAC, conversion rate, and revenue for every campaign,
          explains why, and tells you exactly where to allocate your budget next.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button className="gap-2 px-6 py-3 text-base">
              Start Predicting <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="#dashboard-preview">
            <Button variant="outline" className="px-6 py-3 text-base">See it in action</Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
