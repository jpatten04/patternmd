import { api } from "./api";
import type { User, ApiResponse } from "@/types";

export const usersService = {
	async updateProfile(data: { name?: string; email?: string; homeLocation?: string }): Promise<User> {
		const response = await api.put<ApiResponse<User>>("/users/profile", data);
		return response.data.data!;
	},

	async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
		const response = await api.put<ApiResponse<{ message: string }>>("/users/password", data);
		return response.data.data!;
	},

	async updatePreferences(preferences: Record<string, any>): Promise<Record<string, any>> {
		const response = await api.put<ApiResponse<Record<string, any>>>("/users/preferences", preferences);
		return response.data.data!;
	},
};
