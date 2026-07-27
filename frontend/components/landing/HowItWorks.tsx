"use client";

import { UploadCloud, BrainCircuit, LineChart, Rocket } from "lucide-react";

const STEPS = [
  { icon: UploadCloud, title: "Connect your data", desc: "Upload historical campaigns via CSV or enter them manually." },
  { icon: BrainCircuit, title: "AI trains on your data", desc: "Random forest models learn what drives ROI, CAC, and conversions for your business." },
  { icon: LineChart, title: "Predict before you spend", desc: "Enter a new campaign's budget and channel to get success probability and revenue forecasts." },
  { icon: Rocket, title: "Optimize and act", desc: "Get budget allocation recommendations and AI-explained insights for every decision." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center">How it works</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass p-6 relative">
              <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <s.icon className="text-cyan-400 mb-4" size={28} />
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
