"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { Campaign } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";

export default function CampaignDetailPage() {
  useApiAuth();
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [benchmark, setBenchmark] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    campaignService.get(id).then(setCampaign).catch(() => {});
    campaignService.getBenchmark(id).then(setBenchmark).catch(() => setBenchmark(null));
  }, [id]);

  if (!campaign) return <p className="text-white/60">Loading campaign…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-white/60 capitalize">
          {campaign.platform} · {campaign.industry} · {campaign.campaign_type}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="ROI" value={`${campaign.roi}%`} positive={campaign.roi > 0} />
        <KpiCard label="ROAS" value={`${campaign.roas}x`} />
        <KpiCard label="CAC" value={`$${campaign.cac}`} />
        <KpiCard label="Conversion Rate" value={`${campaign.conversion_rate}%`} />
        <KpiCard label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
        <KpiCard label="Spend" value={`$${campaign.spend.toLocaleString()}`} />
        <KpiCard label="Revenue" value={`$${campaign.revenue.toLocaleString()}`} />
        <KpiCard label="Success" value={campaign.success ? "Yes" : "No"} positive={campaign.success} />
      </div>

      {benchmark && (
        <div className="glass p-5">
          <h2 className="mb-4 text-sm font-medium text-white/80">Industry Benchmark Comparison</h2>
          <table className="w-full text-sm">
            <thead className="text-white/50 text-left">
              <tr><th className="p-2">Metric</th><th className="p-2">This Campaign</th><th className="p-2">Industry Avg</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2">ROI</td><td className="p-2">{benchmark.campaign.roi}%</td><td className="p-2">{benchmark.industry_avg.roi}%</td></tr>
              <tr><td className="p-2">CAC</td><td className="p-2">${benchmark.campaign.cac}</td><td className="p-2">${benchmark.industry_avg.cac}</td></tr>
              <tr><td className="p-2">Conversion Rate</td><td className="p-2">{benchmark.campaign.conversion_rate}%</td><td className="p-2">{benchmark.industry_avg.conversion_rate}%</td></tr>
              <tr><td className="p-2">ROAS</td><td className="p-2">{benchmark.campaign.roas}x</td><td className="p-2">{benchmark.industry_avg.roas}x</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
