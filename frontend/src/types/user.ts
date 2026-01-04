export interface User {
	id: string;
	name: string;
	email: string;
	createdAt: string;
	preferences?: UserPreferences;
}

export interface UserPreferences {
	theme: "light" | "dark";
	notifications: boolean;
	alertThreshold: number;
	timezone: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}
