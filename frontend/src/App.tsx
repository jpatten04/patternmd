import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastContainer } from "@/components/common/Toast";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Layout
import { Layout } from "@/components/layout/Layout";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { Tracking } from "@/pages/Tracking";
import { Medications } from "@/pages/Medications";
import { Environment } from "@/pages/Environment";
import { Alerts } from "@/pages/Alerts";
import { Research } from "@/pages/Research";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";

// Protected Route Component
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const App = () => {
	return (
		<ErrorBoundary>
			<BrowserRouter>
				<ToastContainer />
				<Routes>
					{/* Public Routes */}
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />

					{/* Protected Routes */}
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Layout />}>
							<Route index element={<Dashboard />} />
							<Route path="tracking" element={<Tracking />} />
							<Route path="medications" element={<Medications />} />
							<Route path="environment" element={<Environment />} />
							<Route path="alerts" element={<Alerts />} />
							<Route path="research" element={<Research />} />
							<Route path="reports" element={<Reports />} />
							<Route path="settings" element={<Settings />} />
						</Route>
					</Route>

					{/* Fallback */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</ErrorBoundary>
	);
};
