import { api } from "./api";
import type { EnvironmentData, ApiResponse } from "@/types";

export const environmentService = {
	async getCurrent(): Promise<EnvironmentData> {
		const response = await api.get<ApiResponse<EnvironmentData>>("/environment/current");
		return response.data.data!;
	},

	async getHistory(startDate?: string, endDate?: string): Promise<EnvironmentData[]> {
		const response = await api.get<ApiResponse<EnvironmentData[]>>("/environment/history", {
			params: { startDate, endDate },
		});
		return response.data.data!;
	},

	async refresh(): Promise<EnvironmentData> {
		const response = await api.post<ApiResponse<EnvironmentData>>("/environment/refresh");
		return response.data.data!;
	},
};
