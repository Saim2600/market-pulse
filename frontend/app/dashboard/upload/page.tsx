"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { Button } from "@/components/ui/button";

const STEPS = ["Validate", "Store", "Retrain", "Prediction Ready"];

export default function UploadPage() {
  useApiAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusToStepIndex: Record<string, number> = {
    validated: 0, stored: 1, ready: 3, uploaded: -1,
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await campaignService.uploadCsv(file);
      setStatus(res.status);
      if (res.status === "ready") toast.success(`Uploaded ${res.row_count} rows and retrained models.`);
      else toast.info(`Upload status: ${res.status}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = status ? statusToStepIndex[status] ?? -1 : -1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload Campaign Data</h1>

      <div className="glass p-6 space-y-4">
        <p className="text-sm text-white/60">
          CSV must include: name, platform, industry, audience, campaign_type, budget, duration_days, spend, revenue, impressions, clicks, conversions.
        </p>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <Button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Uploading…" : "Upload & Retrain"}
        </Button>
      </div>

      <div className="glass p-6">
        <h2 className="text-sm font-medium text-white/80 mb-4">Pipeline</h2>
        <div className="flex gap-4">
          {STEPS.map((step, i) => (
            <div key={step} className={`flex-1 rounded-lg p-3 text-center text-xs ${i <= currentStep ? "bg-indigo-500/30 text-white" : "bg-white/5 text-white/40"}`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-sm font-medium text-white/80 mb-2">Manual Entry</h2>
        <p className="text-sm text-white/50">Use the &quot;Campaigns&quot; page → coming from the create-campaign form, or POST to <code>/api/v1/campaigns</code> directly.</p>
      </div>
    </div>
  );
}
