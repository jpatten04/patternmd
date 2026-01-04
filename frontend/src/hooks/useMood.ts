import { useState, useEffect } from "react";
import { moodService } from "@/services/moodService";
import type { MoodLog } from "@/types";

export const useMood = (startDate?: string, endDate?: string, enabled = true) => {
	const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState<string | null>(null);

	const fetchMoodLogs = async () => {
		if (!enabled) return;
		try {
			setLoading(true);
			const response = await moodService.getMoodLogs({
				startDate,
				endDate,
				pageSize: 100,
			});
			setMoodLogs(response.items);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (enabled) {
			fetchMoodLogs();
		}
	}, [startDate, endDate, enabled]);

	return {
		moodLogs,
		loading,
		error,
		refetch: fetchMoodLogs,
	};
};
