export interface ChartDataPoint {
	date: string;
	value: number;
	label?: string;
}

export interface TimeSeriesData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		color: string;
	}[];
}
