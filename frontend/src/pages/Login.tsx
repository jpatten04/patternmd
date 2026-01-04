import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";

export const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const addToast = useUIStore((state) => state.addToast);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await login(email, password);
			addToast({
				type: "success",
				message: "Welcome back!",
			});
			navigate("/");
		} catch (error: any) {
			addToast({
				type: "error",
				message: error.response?.data?.message || "Invalid credentials",
			});
		} finally {
			setIsLoading(false);
		} // try
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-primary-600 mb-2">PatternMD</h1>
					<h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
					<p className="mt-2 text-gray-600">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
					<Input
						label="Email address"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						autoComplete="email"
						required
					/>

					<Input
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="**********"
						autoComplete="current-password"
						required
					/>

					<Button type="submit" className="w-full cursor-pointer" isLoading={isLoading}>
						Sign in
					</Button>

					<p className="text-center text-sm text-gray-600">
						Don't have an account?{" "}
						<Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
							Sign up
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};
