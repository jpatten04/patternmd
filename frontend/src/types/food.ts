export interface FoodLog {
	id: string;
	userId: string;
	foodName: string;
	mealType: "breakfast" | "lunch" | "dinner" | "snack";
	timestamp: string;
	portionSize?: string;
	notes?: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
