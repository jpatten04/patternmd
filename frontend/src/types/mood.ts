export interface MoodLog {
	id: string;
	userId: string;
	moodRating: number; // 1-10
	emotions: string[];
	timestamp: string;
	notes?: string;
}
