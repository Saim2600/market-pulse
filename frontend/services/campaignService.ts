import { apiClient } from "@/lib/api";
import { Campaign, PredictionRequest, PredictionResponse, BudgetOptimizeResponse } from "@/types";

export const campaignService = {
  list: async (params?: Record<string, string | number>) => {
    const { data } = await apiClient.get<Campaign[]>("/campaigns", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return data;
  },
  getBenchmark: async (id: string) => {
    const { data } = await apiClient.get(`/campaigns/${id}/benchmark`);
    return data;
  },
  create: async (payload: Partial<Campaign>) => {
    const { data } = await apiClient.post<Campaign>("/campaigns", payload);
    return data;
  },
  predict: async (payload: PredictionRequest) => {
    const { data } = await apiClient.post<PredictionResponse>("/predictions", payload);
    return data;
  },
  uploadCsv: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post("/upload/csv", form);
    return data;
  },
  chat: async (message: string) => {
    const { data } = await apiClient.post<{ reply: string }>("/chat", { message });
    return data;
  },
  optimizeBudget: async (total_budget: number, industry: string) => {
    const { data } = await apiClient.post<BudgetOptimizeResponse>("/optimizer/budget", { total_budget, industry });
    return data;
  },
  generateReport: async (report_type: string, campaign_id?: string) => {
    const { data } = await apiClient.post("/reports", { report_type, campaign_id });
    return data;
  },
};
