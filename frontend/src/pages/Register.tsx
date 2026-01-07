import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useUIStore } from "@/store/uiStore";

export const Register = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();
	const addToast = useUIStore((state) => state.addToast);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			addToast({
				type: "error",
				message: "Passwords do not match",
			});
			return;
		}

		if (password.length < 8) {
			addToast({
				type: "error",
				message: "Password must be at least 8 characters",
			});
			return;
		}

		setIsLoading(true);

		try {
			await register(email, password, name);
			addToast({
				type: "success",
				message: "Account created successfully!",
			});
			navigate("/");
		} catch (error: any) {
			addToast({
				type: "error",
				message: error.response?.data?.message || "Registration failed",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-primary-600 mb-2">PatternMD</h1>
					<h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
					<p className="mt-2 text-gray-600">Start tracking your health patterns</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
					<Input
						label="Full name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="John Doe"
						autoComplete="name"
						required
					/>

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
						placeholder="••••••••"
						required
						autoComplete="new-password"
						helperText="At least 8 characters"
					/>

					<Input
						label="Confirm password"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="••••••••"
						required
						autoComplete="new-password"
					/>

					<Button type="submit" className="w-full cursor-pointer" isLoading={isLoading}>
						Create account
					</Button>

					<p className="text-center text-sm text-gray-600">
						Already have an account?{" "}
						<Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};
