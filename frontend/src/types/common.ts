export interface LoadingState {
	isLoading: boolean;
	message?: string;
}

export interface ErrorState {
	hasError: boolean;
	message: string;
	code?: string;
}

export interface Toast {
	id: string;
	type: "success" | "error" | "warning" | "info";
	message: string;
	duration?: number;
}

export interface DateRange {
	startDate: string;
	endDate: string;
}

export interface FilterOptions {
	dateRange?: DateRange;
	symptomTypes?: string[];
	severityRange?: [number, number];
	medicationIds?: string[];
}

export interface SortOption {
	field: string;
	direction: "asc" | "desc";
}

export type LogType = "symptom" | "medication" | "food" | "activity" | "mood";
export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
