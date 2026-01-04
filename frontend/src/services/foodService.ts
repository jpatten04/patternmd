import { api } from "./api";
import type { FoodLog, ApiResponse, PaginatedResponse } from "@/types";

export const foodService = {
	async getFoodLogs(params?: {
		page?: number;
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedResponse<FoodLog>> {
		const response = await api.get<ApiResponse<PaginatedResponse<FoodLog>>>("/food", { params });
		return response.data.data!;
	},

	async createFoodLog(food: Omit<FoodLog, "id" | "userId">): Promise<FoodLog> {
		const response = await api.post<ApiResponse<FoodLog>>("/food", food);
		return response.data.data!;
	},

	async deleteFoodLog(id: string): Promise<void> {
		await api.delete(`/food/${id}`);
	},
};
