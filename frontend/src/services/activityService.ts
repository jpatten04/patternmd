import { api } from "./api";
import type { ActivityLog, ApiResponse, PaginatedResponse } from "@/types";

export const activityService = {
	async getActivityLogs(params?: {
		page?: number;
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedResponse<ActivityLog>> {
		const response = await api.get<ApiResponse<PaginatedResponse<ActivityLog>>>("/activity", {
			params,
		});
		return response.data.data!;
	},

	async createActivityLog(activity: Omit<ActivityLog, "id" | "userId">): Promise<ActivityLog> {
		const response = await api.post<ApiResponse<ActivityLog>>("/activity", activity);
		return response.data.data!;
	},

	async deleteActivityLog(id: string): Promise<void> {
		await api.delete(`/activity/${id}`);
	},
};
