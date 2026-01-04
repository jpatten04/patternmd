import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysisService";
import type { Pattern, Correlation, Prediction } from "@/types";

export const usePatterns = () => {
	const [patterns, setPatterns] = useState<Pattern[]>([]);
	const [correlations, setCorrelations] = useState<Correlation[]>([]);
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPatterns = async () => {
		try {
			setLoading(true);
			const data = await analysisService.getPatterns();
			setPatterns(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchCorrelations = async () => {
		try {
			const data = await analysisService.getCorrelations();
			setCorrelations(data);
		} catch (err: any) {
			console.error("Failed to fetch correlations:", err);
		}
	};

	const fetchPredictions = async () => {
		try {
			const data = await analysisService.getPredictions();
			setPredictions(data);
		} catch (err: any) {
			console.error("Failed to fetch predictions:", err);
		}
	};

	useEffect(() => {
		fetchPatterns();
		fetchCorrelations();
		fetchPredictions();
	}, []);

	const runAnalysis = async () => {
		try {
			setLoading(true);
			await analysisService.runTriggerAnalysis();
			await fetchPatterns();
			await fetchCorrelations();
			await fetchPredictions();
		} catch (err: any) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return {
		patterns,
		correlations,
		predictions,
		loading,
		error,
		runAnalysis,
		refetch: fetchPatterns,
	};
};
