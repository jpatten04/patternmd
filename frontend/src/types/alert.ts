export interface Alert {
	id: string;
	userId: string;
	alertType: "prediction" | "pattern" | "medication" | "environment";
	message: string;
	severity: "low" | "medium" | "high";
	timestamp: string;
	isRead: boolean;
	relatedPatternId?: string;
}

export interface AlertSettings {
	enablePredictions: boolean;
	enableMedicationReminders: boolean;
	enableWeatherAlerts: boolean;
	severityThreshold: "low" | "medium" | "high";
}

export type AlertSeverity = "low" | "medium" | "high";
