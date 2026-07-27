"use client";

import { useEffect, useState } from "react";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { PredictionResponse } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";

export default function SimulatorPage() {
  useApiAuth();
  const [budget, setBudget] = useState(10000);
  const [duration, setDuration] = useState(30);
  const [platform, setPlatform] = useState<"google" | "meta" | "facebook" | "linkedin">("google");
  const [result, setResult] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      campaignService
        .predict({ budget, duration_days: duration, platform, industry: "saas", audience: "25-34", campaign_type: "conversion" })
        .then(setResult)
        .catch(() => setResult(null));
    }, 400); // debounce so realtime slider drags don't spam the API
    return () => clearTimeout(t);
  }, [budget, duration, platform]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Scenario Simulator</h1>

      <div className="glass p-6 space-y-6">
        <div>
          <label className="text-xs text-white/60">Budget: ${budget.toLocaleString()}</label>
          <input type="range" min={1000} max={100000} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-white/60">Duration: {duration} days</label>
          <input type="range" min={7} max={90} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-white/60">Platform</label>
          <div className="flex gap-2 mt-1">
            {(["google", "meta", "facebook", "linkedin"] as const).map((p) => (
              <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs capitalize ${platform === p ? "bg-indigo-500 text-white" : "bg-white/10 text-white/60"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard label="Predicted ROI" value={`${result.predicted_roi}%`} positive={result.predicted_roi > 0} />
          <KpiCard label="Predicted Revenue" value={`$${result.predicted_revenue.toLocaleString()}`} />
          <KpiCard label="Predicted CAC" value={`$${result.predicted_cac}`} />
          <KpiCard label="Conversion Rate" value={`${result.predicted_conversion_rate}%`} />
          <KpiCard label="Success Probability" value={`${result.predicted_success_probability}%`} />
          <KpiCard label="Confidence" value={`${result.confidence_score}%`} />
        </div>
      )}
    </div>
  );
}
