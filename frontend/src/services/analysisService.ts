import { api } from "./api";
import type { ApiResponse } from "@/types";

export interface CorrelationResult {
	type: "correlation" | "trigger";
	factor: string;
	score?: number;
	item?: string;
	count?: number;
	description: string;
}

export interface PatternsResponse {
	correlations: CorrelationResult[];
	aiInsights: string;
}

export const analysisService = {
	async getPatterns(): Promise<PatternsResponse> {
		const response = await api.get<ApiResponse<PatternsResponse>>("/analysis/patterns");
		return response.data.data!;
	},
};
