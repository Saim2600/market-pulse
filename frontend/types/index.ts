export type Platform = "google" | "meta" | "facebook" | "linkedin";
export type Industry = "retail" | "finance" | "healthcare" | "education" | "saas";
export type UserRole = "admin" | "marketing_manager" | "analyst";

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  industry: Industry;
  audience: string;
  campaign_type: string;
  budget: number;
  duration_days: number;
  spend: number;
  revenue: number;
  roi: number;
  roas: number;
  cac: number;
  conversion_rate: number;
  impressions: number;
  clicks: number;
  conversions: number;
  success: boolean;
  created_at: string;
}

export interface PredictionRequest {
  budget: number;
  platform: Platform;
  industry: Industry;
  audience: string;
  campaign_type: string;
  duration_days: number;
  campaign_id?: string;
}

export interface PredictionResponse {
  predicted_roi: number;
  predicted_cac: number;
  predicted_revenue: number;
  predicted_conversion_rate: number;
  predicted_success_probability: number;
  confidence_score: number;
  model_accuracy: Record<string, number>;
  feature_importance: Record<string, number>;
  explanation: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  message: string;
}

export interface BudgetOptimizeResponse {
  allocation: Record<string, number>;
  projected_roi: Record<string, number>;
  rationale: string;
}
