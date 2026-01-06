import { useState, useEffect } from "react";
import { medicationsService } from "@/services/medicationsService";
import type { Medication, MedicationAdherence, MedicationLog } from "@/types";

export const useMedications = () => {
	const [medications, setMedications] = useState<Medication[]>([]);
	const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
	const [adherence, setAdherence] = useState<MedicationAdherence[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchMedications = async () => {
		try {
			setLoading(true);
			const data = await medicationsService.getMedications();
			setMedications(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchMedicationLogs = async () => {
		try {
			const data = await medicationsService.getAllMedicationLogs();
			setMedicationLogs(data);
		} catch (err: any) {
			console.error("Failed to fetch medication logs:", err);
		}
	};

	const fetchAdherence = async () => {
		try {
			const data = await medicationsService.getAdherence();
			setAdherence(data);
		} catch (err: any) {
			console.error("Failed to fetch adherence:", err);
		}
	};

	useEffect(() => {
		fetchMedications();
		fetchMedicationLogs();
		fetchAdherence();
	}, []);

	const addMedication = async (medication: Omit<Medication, "id" | "userId">) => {
		try {
			const newMed = await medicationsService.createMedication(medication);
			setMedications([...medications, newMed]);
			return newMed;
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const updateMedication = async (id: string, updates: Partial<Medication>) => {
		try {
			const updated = await medicationsService.updateMedication(id, updates);
			setMedications(medications.map((m) => (m.id === id ? updated : m)));
			return updated;
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const deleteMedication = async (id: string) => {
		try {
			await medicationsService.deleteMedication(id);
			setMedications(medications.filter((m) => m.id !== id));
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const logDose = async (medicationId: string, taken: boolean, notes?: string, timestamp?: string) => {
		try {
			await medicationsService.logDose(medicationId, taken, notes, timestamp);
			fetchAdherence(); // Refresh adherence data
			fetchMedicationLogs(); // Refresh logs to update dashboard/timeline
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	return {
		medications,
		medicationLogs,
		adherence,
		loading,
		error,
		addMedication,
		updateMedication,
		deleteMedication,
		logDose,
		refetch: fetchMedications,
	};
};
