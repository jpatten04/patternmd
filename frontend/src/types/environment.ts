export interface EnvironmentData {
	id: string;
	userId: string;
	timestamp: string;
	temperature: number;
	feelsLike?: number;
	humidity: number;
	pressure: number;
	windSpeed?: number;
	visibility?: number;
	pm2_5?: number;
	pm10?: number;
	airQualityIndex?: number;
	uvIndex?: number;
	clouds?: number;
	pollenCount?: number;
	weatherCondition: string;
	location: string;
}
