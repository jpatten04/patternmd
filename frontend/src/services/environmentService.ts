import { api } from "./api";
import type { EnvironmentData, ApiResponse, PaginatedResponse } from "@/types";

export const environmentService = {
	async getEnvironmentLogs(params?: {
		page?: number;
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedResponse<EnvironmentData>> {
		const response = await api.get<ApiResponse<PaginatedResponse<EnvironmentData>>>("/environment", { params });
		return response.data.data!;
	},

	async createEnvironmentLog(data: Omit<EnvironmentData, "id" | "userId">): Promise<EnvironmentData> {
		// Expecting values in US units (°F, inHg, mph, in, mi).
		const response = await api.post<ApiResponse<EnvironmentData>>("/environment", data);
		return response.data.data!;
	},

	async updateHomeLocation(location: string): Promise<any> {
		const response = await api.post<ApiResponse<any>>("/environment/location", { location });
		return response.data.data!;
	},

	async autoFetchEnvironment(): Promise<EnvironmentData> {
		const response = await api.post<ApiResponse<EnvironmentData>>("/environment/auto-fetch");
		return response.data.data!;
	},

	async searchLocation(query: string): Promise<any[]> {
		const response = await api.get<ApiResponse<any[]>>("/environment/search-location", {
			params: { q: query },
		});
		return response.data.data!;
	},
};
