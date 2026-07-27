"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { Campaign } from "@/types";
import { ManualCampaignForm } from "@/components/dashboard/ManualCampaignForm";

export default function CampaignsPage() {
  useApiAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  const refresh = () =>
    campaignService
      .list({ search, platform, sort_by: sortBy, limit: 100 })
      .then(setCampaigns)
      .catch(() => setCampaigns([]));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, platform, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <ManualCampaignForm onCreated={refresh} />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search campaigns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass px-3 py-2 text-sm bg-transparent outline-none"
        />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="glass px-3 py-2 text-sm bg-transparent">
          <option value="">All Platforms</option>
          <option value="google">Google</option>
          <option value="meta">Meta</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="glass px-3 py-2 text-sm bg-transparent">
          <option value="created_at">Newest</option>
          <option value="roi">ROI</option>
          <option value="revenue">Revenue</option>
          <option value="cac">CAC</option>
        </select>
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-white/50 border-b border-white/10">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Industry</th>
              <th className="p-3">ROI</th>
              <th className="p-3">CAC</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-3">
                  <Link href={`/dashboard/campaigns/${c.id}`} className="text-cyan-400 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3 capitalize">{c.platform}</td>
                <td className="p-3 capitalize">{c.industry}</td>
                <td className={`p-3 ${c.roi > 0 ? "text-emerald-400" : "text-rose-400"}`}>{c.roi}%</td>
                <td className="p-3">${c.cac}</td>
                <td className="p-3">${c.revenue.toLocaleString()}</td>
                <td className="p-3">{c.conversion_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
