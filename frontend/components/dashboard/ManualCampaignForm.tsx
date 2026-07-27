"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { campaignService } from "@/services/campaignService";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Required"),
  platform: z.enum(["google", "meta", "facebook", "linkedin"]),
  industry: z.enum(["retail", "finance", "healthcare", "education", "saas"]),
  audience: z.string().min(1, "Required"),
  campaign_type: z.string().min(1, "Required"),
  budget: z.coerce.number().positive(),
  duration_days: z.coerce.number().int().positive(),
  spend: z.coerce.number().min(0),
  revenue: z.coerce.number().min(0),
  impressions: z.coerce.number().int().min(0),
  clicks: z.coerce.number().int().min(0),
  conversions: z.coerce.number().int().min(0),
});
type FormValues = z.infer<typeof schema>;

export function ManualCampaignForm({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { platform: "google", industry: "saas" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await campaignService.create(values);
      toast.success("Campaign created");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create campaign");
    }
  };

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Add Campaign Manually</Button>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass p-5 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input placeholder="Campaign name" {...register("name")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select {...register("platform")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="google">Google</option>
          <option value="meta">Meta</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <select {...register("industry")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="retail">Retail</option>
          <option value="finance">Finance</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="saas">SaaS</option>
        </select>
        <input placeholder="Audience (e.g. 25-34)" {...register("audience")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Campaign type (e.g. conversion)" {...register("campaign_type")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Budget" {...register("budget")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Duration (days)" {...register("duration_days")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Spend" {...register("spend")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Revenue" {...register("revenue")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Impressions" {...register("impressions")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Clicks" {...register("clicks")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Conversions" {...register("conversions")} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm" />
      </div>
      {Object.keys(errors).length > 0 && <p className="text-rose-400 text-xs">Please fill all required fields correctly.</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Campaign"}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
