export interface ActivityLog {
	id: string;
	userId: string;
	activityType: string;
	durationMinutes: number;
	intensity: number; // 1-10
	timestamp: string;
	notes?: string;
}
