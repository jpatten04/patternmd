export interface EnvironmentData {
	id: string;
	userId: string;
	timestamp: string;
	temperature: number;
	humidity: number;
	pressure: number;
	airQualityIndex?: number;
	pollenCount?: number;
	weatherCondition: string;
	location: string;
}
