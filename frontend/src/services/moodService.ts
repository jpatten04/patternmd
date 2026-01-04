import { api } from "./api";
import type { MoodLog, ApiResponse, PaginatedResponse } from "@/types";

export const moodService = {
	async getMoodLogs(params?: {
		page?: number;
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedResponse<MoodLog>> {
		const response = await api.get<ApiResponse<PaginatedResponse<MoodLog>>>("/mood", { params });
		return response.data.data!;
	},

	async createMoodLog(mood: Omit<MoodLog, "id" | "userId">): Promise<MoodLog> {
		const response = await api.post<ApiResponse<MoodLog>>("/mood", mood);
		return response.data.data!;
	},

	async getTrends(startDate?: string, endDate?: string): Promise<any> {
		const response = await api.get<ApiResponse<any>>("/mood/trends", {
			params: { startDate, endDate },
		});
		return response.data.data!;
	},
};
