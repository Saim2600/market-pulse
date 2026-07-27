"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from "recharts";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { Campaign } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";

const COLORS = ["#6366f1", "#22d3ee", "#f472b6", "#facc15"];

export default function DashboardPage() {
  useApiAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignService
      .list({ limit: 50 })
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const avgRoi = campaigns.length ? campaigns.reduce((s, c) => s + c.roi, 0) / campaigns.length : 0;
  const avgCac = campaigns.length ? campaigns.reduce((s, c) => s + c.cac, 0) / campaigns.length : 0;
  const avgConv = campaigns.length ? campaigns.reduce((s, c) => s + c.conversion_rate, 0) / campaigns.length : 0;
  const healthScore = Math.min(100, Math.round((avgRoi > 0 ? 60 : 30) + avgConv));

  const revenueTrend = campaigns
    .slice()
    .reverse()
    .map((c) => ({ name: c.name.slice(0, 12), revenue: c.revenue }));

  const roiByPlatform = Object.values(
    campaigns.reduce((acc: Record<string, { platform: string; roi: number; count: number }>, c) => {
      acc[c.platform] = acc[c.platform] || { platform: c.platform, roi: 0, count: 0 };
      acc[c.platform].roi += c.roi;
      acc[c.platform].count += 1;
      return acc;
    }, {})
  ).map((p) => ({ platform: p.platform, roi: Math.round(p.roi / p.count) }));

  const platformSplit = Object.entries(
    campaigns.reduce((acc: Record<string, number>, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + c.spend;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Executive Summary</h1>
        <p className="text-sm text-white/60">
          {loading ? "Loading campaign data…" : `${campaigns.length} campaigns analyzed`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <KpiCard label="Spend" value={`$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <KpiCard label="Avg ROI" value={`${avgRoi.toFixed(1)}%`} positive={avgRoi > 0} delta={avgRoi > 0 ? "Healthy" : "Below target"} />
        <KpiCard label="Avg CAC" value={`$${avgCac.toFixed(0)}`} />
        <KpiCard label="Avg Conversion Rate" value={`${avgConv.toFixed(1)}%`} />
        <KpiCard label="Campaign Health Score" value={`${healthScore}/100`} />
        <KpiCard label="Active Campaigns" value={`${campaigns.length}`} />
        <KpiCard label="ROAS (avg)" value={`${(campaigns.reduce((s, c) => s + c.roas, 0) / (campaigns.length || 1)).toFixed(2)}x`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-5">
          <h2 className="mb-4 text-sm font-medium text-white/80">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} hide />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <h2 className="mb-4 text-sm font-medium text-white/80">ROI by Platform</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roiByPlatform}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Bar dataKey="roi" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5 md:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-white/80">Spend Split by Platform</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie data={platformSplit} dataKey="value" nameKey="name" outerRadius={90} label>
                {platformSplit.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
