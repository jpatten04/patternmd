import { api } from "./api";
import type { Report, ReportConfig, ApiResponse } from "@/types";

export const reportsService = {
	async generateReport(config: ReportConfig): Promise<Report> {
		const response = await api.post<ApiResponse<Report>>("/reports/generate", config);
		return response.data.data!;
	},

	async getReports(): Promise<Report[]> {
		const response = await api.get<ApiResponse<Report[]>>("/reports");
		return response.data.data!;
	},

	async downloadReport(id: string): Promise<Blob> {
		const response = await api.get(`/reports/${id}/download`, {
			responseType: "blob",
		});
		return response.data;
	},

	async deleteReport(id: string): Promise<void> {
		await api.delete(`/reports/${id}`);
	},
};
