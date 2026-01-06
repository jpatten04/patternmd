import { api } from "./api";
import type { Alert, AlertSettings, ApiResponse } from "@/types";

export const alertsService = {
	async getAlerts(): Promise<Alert[]> {
		const response = await api.get<ApiResponse<Alert[]>>("/alerts");
		return response.data.data!;
	},

	async markAsRead(id: string): Promise<Alert> {
		const response = await api.put<ApiResponse<Alert>>(`/alerts/${id}/read`);
		return response.data.data!;
	},

	async markAllAsRead(): Promise<void> {
		await api.put("/alerts/mark-all-read");
	},

	async dismissAlert(id: string): Promise<void> {
		await api.delete(`/alerts/${id}`);
	},

	async getSettings(): Promise<AlertSettings> {
		const response = await api.get<ApiResponse<AlertSettings>>("/alerts/settings");
		return response.data.data!;
	},

	async updateSettings(settings: AlertSettings): Promise<AlertSettings> {
		const response = await api.put<ApiResponse<AlertSettings>>("/alerts/settings", settings);
		return response.data.data!;
	},
};
