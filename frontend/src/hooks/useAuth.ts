import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import type { User } from "@/types";

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			if (authService.isAuthenticated()) {
				try {
					const userData = await authService.getCurrentUser();
					setUser(userData);
				} catch (err) {
					setError("Failed to fetch user data");
					authService.logout();
				} // try
			} // if
			setLoading(false);
		};

		fetchUser();
	}, []);

	const login = async (email: string, password: string) => {
		try {
			setLoading(true);
			setError(null);
			const { user: userData } = await authService.login(email, password);
			setUser(userData);
			return userData;
		} catch (err: any) {
			setError(err.response?.data?.message || "Login failed");
			throw err;
		} finally {
			setLoading(false);
		} // try
	};

	const register = async (email: string, password: string, name: string) => {
		try {
			setLoading(true);
			setError(null);
			const { user: userData } = await authService.register(email, password, name);
			setUser(userData);
			return userData;
		} catch (err: any) {
			setError(err.response?.data?.message || "Registration failed");
			throw err;
		} finally {
			setLoading(false);
		} // try
	};

	const logout = () => {
		authService.logout();
		setUser(null);
	};

	return {
		user,
		loading,
		error,
		login,
		register,
		logout,
		isAuthenticated: !!user,
	};
};
