import { api } from "./api";
import type { SymptomLog, SymptomStats, ApiResponse, PaginatedResponse } from "@/types";

export const symptomsService = {
	async getSymptoms(params?: {
		page?: number;
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedResponse<SymptomLog>> {
		const response = await api.get<ApiResponse<PaginatedResponse<SymptomLog>>>("/symptoms", {
			params,
		});
		return response.data.data!;
	},

	async getSymptomById(id: string): Promise<SymptomLog> {
		const response = await api.get<ApiResponse<SymptomLog>>(`/symptoms/${id}`);
		return response.data.data!;
	},

	async createSymptom(symptom: Omit<SymptomLog, "id" | "userId">): Promise<SymptomLog> {
		const response = await api.post<ApiResponse<SymptomLog>>("/symptoms", symptom);
		return response.data.data!;
	},

	async updateSymptom(id: string, symptom: Partial<SymptomLog>): Promise<SymptomLog> {
		const response = await api.put<ApiResponse<SymptomLog>>(`/symptom/${id}`, symptom);
		return response.data.data!;
	},

	async deleteSymptom(id: string): Promise<void> {
		await api.delete(`/symptoms/${id}`);
	},

	async getStats(startDate?: string, endDate?: string): Promise<SymptomStats> {
		const response = await api.get<ApiResponse<SymptomStats>>("/symptom/stats", {
			params: { startDate, endDate },
		});
		return response.data.data!;
	},
};
