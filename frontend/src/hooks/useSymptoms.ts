import { useState, useEffect } from "react";
import { symptomsService } from "@/services/symptomsService";
import type { SymptomLog, SymptomStats } from "@/types";

export const useSymptoms = (startDate?: string, endDate?: string, enabled = true) => {
	const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
	const [stats, setStats] = useState<SymptomStats | null>(null);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState<string | null>(null);

	const fetchSymptoms = async () => {
		if (!enabled) return;
		try {
			setLoading(true);
			const response = await symptomsService.getSymptoms({
				startDate,
				endDate,
				pageSize: 100,
			});
			setSymptoms(response.items);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		if (!enabled) return;
		try {
			const statsData = await symptomsService.getStats(startDate, endDate);
			setStats(statsData);
		} catch (err: any) {
			console.error("Failed to fetch stats:", err);
		}
	};

	useEffect(() => {
		if (enabled) {
			fetchSymptoms();
			fetchStats();
		}
	}, [startDate, endDate, enabled]);

	const addSymptom = async (symptom: Omit<SymptomLog, "id" | "userId">) => {
		try {
			const newSymptom = await symptomsService.createSymptom(symptom);
			setSymptoms([newSymptom, ...symptoms]);
			fetchStats(); // Refresh stats
			return newSymptom;
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const updateSymptom = async (id: string, updates: Partial<SymptomLog>) => {
		try {
			const updated = await symptomsService.updateSymptom(id, updates);
			setSymptoms(symptoms.map((s) => (s.id === id ? updated : s)));
			fetchStats();
			return updated;
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const deleteSymptom = async (id: string) => {
		try {
			await symptomsService.deleteSymptom(id);
			setSymptoms(symptoms.filter((s) => s.id !== id));
			fetchStats();
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	return {
		symptoms,
		stats,
		loading,
		error,
		addSymptom,
		updateSymptom,
		deleteSymptom,
		refetch: fetchSymptoms,
	};
};
