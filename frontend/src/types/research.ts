export interface ResearchArticle {
	id: string;
	title: string;
	authors: string[];
	abstract: string;
	publicationDate: string;
	journal: string;
	doi?: string;
	url: string;
	relevanceScore?: number;
}

export interface SavedResearch {
	articleId: string;
	userId: string;
	savedAt: string;
	notes?: string;
}
