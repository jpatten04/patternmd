import { api } from "./api";
import type { User, AuthResponse, ApiResponse } from "@/types";

export const authService = {
	async register(email: string, password: string, name: string): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
			email,
			password,
			name,
		});
		if (response.data.data) {
			localStorage.setItem("token", response.data.data.token);
		} // if
		return response.data.data!;
	},

	async login(email: string, password: string): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>("auth/login", {
			email,
			password,
		});
		if (response.data.data) {
			localStorage.setItem("token", response.data.data.token);
		} // if
		return response.data.data!;
	},

	logout(): void {
		localStorage.removeItem("token");
		window.location.href = "/login";
	},

	async getCurrentUser(): Promise<User> {
		const response = await api.get<ApiResponse<User>>("auth/me");
		return response.data.data!;
	},

	isAuthenticated(): boolean {
		return !!localStorage.getItem("token");
	},
};
