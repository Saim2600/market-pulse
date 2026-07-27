"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { BudgetOptimizeResponse } from "@/types";
import { Button } from "@/components/ui/button";

export default function OptimizerPage() {
  useApiAuth();
  const [totalBudget, setTotalBudget] = useState(20000);
  const [industry, setIndustry] = useState("saas");
  const [result, setResult] = useState<BudgetOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await campaignService.optimizeBudget(totalBudget, industry);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? Object.entries(result.allocation).map(([platform, amount]) => ({ platform, amount })) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Budget Optimizer</h1>

      <div className="glass p-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-white/60">Total Budget ($)</label>
          <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(Number(e.target.value))} className="block mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-white/60">Industry</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="block mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option value="retail">Retail</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="saas">SaaS</option>
          </select>
        </div>
        <Button onClick={run} disabled={loading}>{loading ? "Optimizing…" : "Optimize Allocation"}</Button>
      </div>

      {result && (
        <div className="glass p-6 space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Bar dataKey="amount" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-white/70">{result.rationale}</p>
        </div>
      )}
    </div>
  );
}
