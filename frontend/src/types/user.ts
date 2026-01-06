export interface User {
	id: string;
	name: string;
	email: string;
	homeLocation?: string;
	createdAt: string;
	preferences?: UserPreferences;
}

export interface UserPreferences {
	theme: "light" | "dark" | "system";
	units: "metric" | "imperial";
	environmentalDataEnabled: boolean;
	alertSettings: {
		missedDoseAlerts: boolean;
		highSeverityAlerts: boolean;
		patternDiscoveryAlerts: boolean;
		environmentAlerts: boolean;
	};
	defaultView: "dashboard" | "timeline" | "medications";
	timezone: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}
