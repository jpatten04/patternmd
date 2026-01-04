import { useState, useEffect } from "react";
import { foodService } from "@/services/foodService";
import type { FoodLog } from "@/types";

export const useFood = (startDate?: string, endDate?: string, enabled = true) => {
	const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState<string | null>(null);

	const fetchFoodLogs = async () => {
		if (!enabled) return;
		try {
			setLoading(true);
			const response = await foodService.getFoodLogs({
				startDate,
				endDate,
				pageSize: 100,
			});
			setFoodLogs(response.items);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (enabled) {
			fetchFoodLogs();
		}
	}, [startDate, endDate, enabled]);

	return {
		foodLogs,
		loading,
		error,
		refetch: fetchFoodLogs,
	};
};
