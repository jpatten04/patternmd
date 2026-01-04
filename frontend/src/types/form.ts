export interface QuickLogForm {
	type: "symptom" | "medication" | "food" | "activity" | "mood";
	description: string;
	severity?: number;
	timestamp?: string;
}
