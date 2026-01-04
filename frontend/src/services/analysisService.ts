import { api } from "./api";
import type { Pattern, Correlation, AnalysisResult, Prediction, ApiResponse } from "@/types";

export const analysisService = {
	async getPatterns(): Promise<Pattern[]> {
		const response = await api.get<ApiResponse<Pattern[]>>("/analysis/patterns");
		return response.data.data!;
	},

	async getCorrelations(variables?: string[]): Promise<Correlation[]> {
		const response = await api.get<ApiResponse<Correlation[]>>("/analysis/correlations", {
			params: { variables: variables?.join(",") },
		});
		return response.data.data!;
	},

	async runTriggerAnalysis(): Promise<AnalysisResult> {
		const response = await api.post<ApiResponse<AnalysisResult>>("/analysis/trigger");
		return response.data.data!;
	},

	async getPredictions(): Promise<Prediction[]> {
		const response = await api.get<ApiResponse<Prediction[]>>("/analysis/predictions");
		return response.data.data!;
	},
};
