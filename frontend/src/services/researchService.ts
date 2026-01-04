import { api } from "./api";
import type { ResearchArticle, SavedResearch, ApiResponse } from "@/types";

export const researchService = {
	async search(query: string, limit?: number): Promise<ResearchArticle[]> {
		const response = await api.get<ApiResponse<ResearchArticle[]>>("/research/search", {
			params: { query, limit },
		});
		return response.data.data!;
	},

	async getSaved(): Promise<ResearchArticle[]> {
		const response = await api.get<ApiResponse<ResearchArticle[]>>("/research/saved");
		return response.data.data!;
	},

	async saveArticle(articleId: string, notes?: string): Promise<SavedResearch> {
		const response = await api.post<ApiResponse<SavedResearch>>("/research/save", {
			articleId,
			notes,
		});
		return response.data.data!;
	},
};
