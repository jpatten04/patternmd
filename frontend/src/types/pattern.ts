export interface Pattern {
	id: string;
	userId: string;
	patternType: "correlation" | "trigger" | "trend" | "prediction";
	description: string;
	confidenceScore: number; // 0-1
	discoveredAt: string;
	variables: Record<string, any>;
	isActive: boolean;
}

export interface Correlation {
	variable1: string;
	variable2: string;
	coefficient: number; // -1 to 1
	pValue: number;
	strength: "weak" | "moderate" | "strong";
}

export interface AnalysisResult {
	patterns: Pattern[];
	correlations: Correlation[];
	insights: string;
	recommendations: string[];
}

export interface Prediction {
	id: string;
	predictedSymptom: string;
	predictedSeverity: number;
	probability: number;
	triggeringFactors: string[];
	expectedTime: string;
}

export type PatternType = "correlation" | "trigger" | "trend" | "prediction";
