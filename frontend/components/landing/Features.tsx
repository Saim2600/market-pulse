"use client";

import { Target, DollarSign, Users, TrendingUp, MessageSquareText, SlidersHorizontal, PieChart, FileText } from "lucide-react";

const FEATURES = [
  { icon: Target, title: "Success Probability", desc: "Classify campaigns as likely to succeed or underperform before launch." },
  { icon: DollarSign, title: "ROI & Revenue Forecasting", desc: "Random-forest regression models trained on your own historical data." },
  { icon: Users, title: "CAC & Conversion Prediction", desc: "Know your acquisition cost and conversion rate ahead of time." },
  { icon: TrendingUp, title: "Explainable AI", desc: "Every prediction comes with a plain-English, Gemini-generated explanation." },
  { icon: MessageSquareText, title: "AI Copilot", desc: "Chat with your campaign data — ask why metrics changed or what to do next." },
  { icon: SlidersHorizontal, title: "Scenario Simulator", desc: "Drag sliders on budget, platform, and duration to see real-time predictions." },
  { icon: PieChart, title: "Budget Optimizer", desc: "Get model-driven allocation recommendations across every channel." },
  { icon: FileText, title: "Automated Reports", desc: "Generate weekly, monthly, executive, and investor-ready PDF reports." },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center">Everything you need to decide with confidence</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass p-6 hover:bg-white/10 transition-colors">
              <f.icon className="text-indigo-400 mb-3" size={24} />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="mt-2 text-xs text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
