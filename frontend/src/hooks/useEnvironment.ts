import { useState, useEffect } from "react";
import { environmentService } from "@/services/environmentService";
import type { EnvironmentData } from "@/types";

export const useEnvironment = (startDate?: string, endDate?: string) => {
	const [current, setCurrent] = useState<EnvironmentData | null>(null);
	const [history, setHistory] = useState<EnvironmentData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCurrent = async () => {
		try {
			setLoading(true);
			const data = await environmentService.getCurrent();
			setCurrent(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchHistory = async () => {
		try {
			const data = await environmentService.getHistory(startDate, endDate);
			setHistory(data);
		} catch (err: any) {
			console.error("Failed to fetch history:", err);
		}
	};

	useEffect(() => {
		fetchCurrent();
		fetchHistory();
	}, [startDate, endDate]);

	const refresh = async () => {
		try {
			setLoading(true);
			const data = await environmentService.refresh();
			setCurrent(data);
			await fetchHistory();
		} catch (err: any) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return {
		current,
		history,
		loading,
		error,
		refresh,
		refetch: fetchCurrent,
	};
};
