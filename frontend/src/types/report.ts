export interface Report {
	id: string;
	userId: string;
	generatedAt: string;
	startDate: string;
	endDate: string;
	filePath: string;
	reportType: "comprehensive" | "symptoms" | "medications" | "custom";
	status: "pending" | "completed" | "failed";
}

export interface ReportConfig {
	startDate: string;
	endDate: string;
	includeSections: {
		symptoms: boolean;
		medications: boolean;
		environment: boolean;
		patterns: boolean;
		charts: boolean;
	};
	format: "pdf" | "csv";
}

export type ReportFormat = "pdf" | "csv";
