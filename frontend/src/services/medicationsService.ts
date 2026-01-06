import { api } from "./api";
import type { Medication, MedicationLog, MedicationAdherence, ApiResponse } from "@/types";

export const medicationsService = {
	async getMedications(): Promise<Medication[]> {
		const response = await api.get<ApiResponse<Medication[]>>("/medications");
		return response.data.data!;
	},
	async getMedicationById(id: string): Promise<Medication> {
		const response = await api.get<ApiResponse<Medication>>(`/medications/${id}`);
		return response.data.data!;
	},

	async createMedication(medication: Omit<Medication, "id" | "userId">): Promise<Medication> {
		const response = await api.post<ApiResponse<Medication>>("/medications", medication);
		return response.data.data!;
	},

	async updateMedication(id: string, medication: Partial<Medication>): Promise<Medication> {
		const response = await api.put<ApiResponse<Medication>>(`/medications/${id}`, medication);
		return response.data.data!;
	},

	async deleteMedication(id: string): Promise<void> {
		await api.delete(`/medications/${id}`);
	},

	async getAllMedicationLogs(): Promise<MedicationLog[]> {
		const response = await api.get<ApiResponse<MedicationLog[]>>("/medications/logs");
		return response.data.data!;
	},

	async logDose(medicationId: string, taken: boolean, notes?: string, timestamp?: string): Promise<MedicationLog> {
		const response = await api.post<ApiResponse<MedicationLog>>(`/medications/${medicationId}/log`, {
			taken,
			notes,
			timestamp,
		});
		return response.data.data!;
	},

	async getAdherence(medicationId?: string): Promise<MedicationAdherence[]> {
		const response = await api.get<ApiResponse<MedicationAdherence[]>>("/medications/adherence", {
			params: { medicationId },
		});
		return response.data.data!;
	},
};
