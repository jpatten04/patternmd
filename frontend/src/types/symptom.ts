export interface SymptomLog {
	id: string;
	userId: string;
	symptomName: string;
	severity: number; // 1-10
	timestamp: string;
	durationMinutes?: number;
	notes?: string;
	bodyLocation?: string;
	triggers?: string[];
}

export interface SymptomStats {
	totalLogs: number;
	averageSeverity: number;
	mostCommon: string;
	worstDay: string;
	trend: "improving" | "worsening" | "stable";
}

export interface SymptomLogForm {
	symptomName: string;
	severity: number;
	timestamp: string;
	durationMinutes?: number;
	notes?: string;
	bodyLocation?: string;
	triggers?: string[];
}
