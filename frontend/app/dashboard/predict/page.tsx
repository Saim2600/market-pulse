"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { PredictionResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";

const schema = z.object({
  budget: z.coerce.number().positive("Budget must be greater than 0"),
  platform: z.enum(["google", "meta", "facebook", "linkedin"]),
  industry: z.enum(["retail", "finance", "healthcare", "education", "saas"]),
  audience: z.string().min(1, "Required"),
  campaign_type: z.string().min(1, "Required"),
  duration_days: z.coerce.number().int().positive(),
});
type FormValues = z.infer<typeof schema>;

export default function PredictPage() {
  useApiAuth();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { platform: "google", industry: "saas", audience: "25-34", campaign_type: "conversion", duration_days: 30 },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await campaignService.predict(values);
      setResult(res);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Prediction failed. Make sure the model has been trained.");
    } finally {
      setLoading(false);
    }
  };

  const importanceData = result
    ? Object.entries(result.feature_importance).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Campaign Predictor</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="glass p-5 space-y-4">
          <div>
            <label className="text-xs text-white/60">Budget ($)</label>
            <input type="number" step="0.01" {...register("budget")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
            {errors.budget && <p className="text-rose-400 text-xs mt-1">{errors.budget.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Platform</label>
              <select {...register("platform")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="google">Google</option>
                <option value="meta">Meta</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60">Industry</label>
              <select {...register("industry")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="retail">Retail</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="saas">SaaS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60">Audience</label>
            <input {...register("audience")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 25-34" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Campaign Type</label>
              <input {...register("campaign_type")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="conversion" />
            </div>
            <div>
              <label className="text-xs text-white/60">Duration (days)</label>
              <input type="number" {...register("duration_days")} className="w-full mt-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Predicting…" : "Run Prediction"}
          </Button>
        </form>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Predicted ROI" value={`${result.predicted_roi}%`} positive={result.predicted_roi > 0} />
                <KpiCard label="Predicted CAC" value={`$${result.predicted_cac}`} />
                <KpiCard label="Predicted Revenue" value={`$${result.predicted_revenue.toLocaleString()}`} />
                <KpiCard label="Conversion Rate" value={`${result.predicted_conversion_rate}%`} />
                <KpiCard label="Success Probability" value={`${result.predicted_success_probability}%`} positive={result.predicted_success_probability > 50} />
                <KpiCard label="Confidence" value={`${result.confidence_score}%`} />
              </div>

              <div className="glass p-4">
                <h3 className="text-sm font-medium text-white/80 mb-2">Feature Importance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={importanceData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass p-4">
                <h3 className="text-sm font-medium text-white/80 mb-2">AI Explanation</h3>
                <p className="text-sm text-white/70 leading-relaxed">{result.explanation}</p>
              </div>
            </>
          ) : (
            <div className="glass p-8 text-center text-white/50 text-sm">
              Fill out the form and run a prediction to see results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
