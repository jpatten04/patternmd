export interface Medication {
	id: string;
	userId: string;
	name: string;
	dosage: string;
	frequency: string;
	startDate: string;
	endDate?: string;
	active: boolean;
	purpose?: string;
	sideEffects?: string;
}

export interface MedicationLog {
	id: string;
	medicationId: string;
	userId: string;
	timestamp: string;
	taken: boolean;
	notes?: string;
}

export interface MedicationAdherence {
	medicationId: string;
	medicationName: string;
	adherenceRate: number; // 0-100
	missedDoses: number;
	totalDoses: number;
}

export interface MedicationForm {
	name: string;
	dosage: string;
	frequency: string;
	startDate: string;
	endDate?: string;
	purpose?: string;
}
