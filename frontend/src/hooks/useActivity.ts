import { useState, useEffect } from "react";
import { activityService } from "@/services/activityService";
import type { ActivityLog } from "@/types";

export const useActivity = (startDate?: string, endDate?: string, enabled = true) => {
	const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState<string | null>(null);

	const fetchActivityLogs = async () => {
		if (!enabled) return;
		try {
			setLoading(true);
			const response = await activityService.getActivityLogs({
				startDate,
				endDate,
				pageSize: 100,
			});
			setActivityLogs(response.items);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (enabled) {
			fetchActivityLogs();
		}
	}, [startDate, endDate, enabled]);

	return {
		activityLogs,
		loading,
		error,
		refetch: fetchActivityLogs,
	};
};
