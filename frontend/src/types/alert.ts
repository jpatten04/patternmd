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
	missedDoseAlerts: boolean;
	highSeverityAlerts: boolean;
	patternDiscoveryAlerts: boolean;
	environmentAlerts: boolean;
	notificationMethod: 'app' | 'email' | 'both';
}

export type AlertSeverity = "low" | "medium" | "high";
