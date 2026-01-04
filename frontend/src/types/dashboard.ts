import type { SymptomLog, Alert } from "@/types";

export interface DashboardStats {
	todayLogs: number;
	activeMedications: number;
	patternsFound: number;
	adherenceRate: number;
	averageSeverity: number;
	recentSymptoms: SymptomLog[];
	upcomingAlerts: Alert[];
}
