"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { Button } from "@/components/ui/button";

const TYPES = ["weekly", "monthly", "executive", "investor", "campaign"];

export default function ReportsPage() {
  useApiAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const generate = async (type: string) => {
    setLoading(type);
    try {
      const res = await campaignService.generateReport(type);
      toast.success(`${type} report generated`, { description: res.summary?.slice(0, 100) });
    } catch {
      toast.error("Report generation failed. Check Gemini API key configuration.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {TYPES.map((t) => (
          <div key={t} className="glass p-5 flex flex-col gap-3">
            <h2 className="capitalize font-medium">{t} Report</h2>
            <p className="text-xs text-white/50">PDF with KPIs, charts summary, predictions, and a Gemini-generated executive summary.</p>
            <Button onClick={() => generate(t)} disabled={loading === t}>
              {loading === t ? "Generating…" : "Generate PDF"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
