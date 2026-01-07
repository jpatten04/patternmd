import { useState, useEffect } from "react";
import { analysisService, type CorrelationResult } from "@/services/analysisService";
import type { Correlation } from "@/types";

export const usePatterns = () => {
	const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
	const [matrix, setMatrix] = useState<Correlation[]>([]);
	const [aiInsights, setAiInsights] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await analysisService.getPatterns();
			setCorrelations(data.correlations);
			setMatrix(data.matrix || []);
			setAiInsights(data.aiInsights);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		correlations,
		matrix,
		aiInsights,
		loading,
		error,
		refetch: fetchData,
	};
};
