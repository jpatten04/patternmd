import { useState, useEffect } from "react";
import { environmentService } from "@/services/environmentService";
import type { EnvironmentData } from "@/types";

export const useEnvironment = (startDate?: string, endDate?: string, enabled = true) => {
	const [environmentLogs, setEnvironmentLogs] = useState<EnvironmentData[]>([]);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState<string | null>(null);

	const fetchEnvironmentLogs = async () => {
		if (!enabled) return;
		try {
			setLoading(true);
			const response = await environmentService.getEnvironmentLogs({
				startDate,
				endDate,
				pageSize: 100,
			});
			setEnvironmentLogs(response.items);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (enabled) {
			fetchEnvironmentLogs();
		}
	}, [startDate, endDate, enabled]);

	return {
		environmentLogs,
		loading,
		error,
		refetch: fetchEnvironmentLogs,
	};
};
