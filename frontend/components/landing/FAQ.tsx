"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How does MarketPulse AI generate predictions?", a: "We train RandomForestRegressor and RandomForestClassifier models on your historical campaign data (platform, industry, budget, audience, duration) to predict ROI, CAC, revenue, conversion rate, and success probability." },
  { q: "Do I need historical data to get started?", a: "We seed your workspace with 30 realistic sample campaigns so you can explore immediately, then retrain automatically as you upload or add real campaigns." },
  { q: "How does the AI Copilot work?", a: "It uses Google Gemini with your live campaign data as context, so answers are grounded in your actual performance numbers." },
  { q: "Is my data secure?", a: "Authentication is handled by Clerk, data is stored in your own PostgreSQL (Neon) instance, and role-based access control restricts who can view or edit what." },
  { q: "Can I export reports?", a: "Yes — generate weekly, monthly, executive, investor, or per-campaign PDF reports with charts, KPIs, and an AI-written summary." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center">Frequently asked questions</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="glass overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium"
              >
                {f.q}
                <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-white/60">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
