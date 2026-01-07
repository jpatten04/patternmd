import { useState, useEffect, useRef } from "react";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useUIStore } from "@/store/uiStore";
import { EnvironmentLogForm } from "@/components/environment/EnvironmentLogForm";
import { EnvironmentLogList } from "@/components/environment/EnvironmentLogList";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
	PlusIcon,
	ArrowPathIcon,
	MapPinIcon,
	InformationCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { environmentService } from "@/services/environmentService";
import { authService } from "@/services/authService";
import type { User } from "@/types";

export const Environment = () => {
	const { environmentLogs, loading, error, refetch } = useEnvironment();
	const addToast = useUIStore((state) => state.addToast);
	const [user, setUser] = useState<User | null>(null);
	const [isLogModalOpen, setIsLogModalOpen] = useState(false);
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [locationInput, setLocationInput] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasCheckedEnv = useRef(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await authService.getCurrentUser();
				setUser(userData);
				setLocationInput(userData.homeLocation || "");
			} catch (err) {
				console.error("Failed to fetch user", err);
			}
		};
		fetchUser();
	}, []);

	// Auto-trigger logic on page load
	useEffect(() => {
		if (loading || !user?.homeLocation || hasCheckedEnv.current) return;

		hasCheckedEnv.current = true; // Prevent multiple triggers

		// if user has no logs fetch one, else check last log time
		if (environmentLogs.length === 0) {
			console.log("No environment logs detected. Triggering auto-fetch...");
			handleAutoFetch();
		} else {
			const latestLog = environmentLogs[0];
			const lastLogDate = new Date(latestLog.timestamp);
			const now = new Date();
			const hoursSinceLastLog = (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60);

			// every 24 hours for now, may change to more often
			if (hoursSinceLastLog >= 24) {
				console.log("No recent environment log. Triggering auto-fetch...");
				handleAutoFetch();
			}
		}
	}, [user, environmentLogs, loading]);

	const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setLocationInput(query);

		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

		if (query.trim().length > 2) {
			setIsSearching(true);
			searchTimeoutRef.current = setTimeout(async () => {
				try {
					const results = await environmentService.searchLocation(query);
					setSearchResults(results);
				} catch (err: any) {
					console.error("Search failed", err);
					addToast({
						type: "error",
						message: err.response?.data?.error || "Location search failed",
					});
				} finally {
					setIsSearching(false);
				}
			}, 500);
		} else {
			setSearchResults([]);
		}
	};

	const selectLocation = (location: any) => {
		setLocationInput(location.display_name);
		setSearchResults([]);
	};

	const handleAutoFetch = async () => {
		if (!user?.homeLocation || isSubmitting) {
			if (!user?.homeLocation) setIsLocationModalOpen(true);
			return;
		}

		setIsSubmitting(true);
		try {
			await environmentService.autoFetchEnvironment();
			addToast({ type: "success", message: "Environmental data updated automatically" });
			refetch();
		} catch (err: any) {
			addToast({ type: "error", message: err.response?.data?.error || "Failed to auto-fetch data" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLocationSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!locationInput.trim()) return;

		setIsSubmitting(true);
		try {
			const updatedUser = await environmentService.updateHomeLocation(locationInput);
			setUser((prev) => (prev ? { ...prev, homeLocation: updatedUser.homeLocation } : null));
			addToast({ type: "success", message: "Home location updated" });
			setIsLocationModalOpen(false);
		} catch (err: any) {
			addToast({ type: "error", message: err.response?.data?.error || "Failed to update location" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleManualLogSubmit = async (data: any) => {
		setIsSubmitting(true);
		try {
			await environmentService.createEnvironmentLog(data);
			addToast({ type: "success", message: "Environment data logged successfully" });
			setIsLogModalOpen(false);
			refetch();
		} catch (err: any) {
			addToast({ type: "error", message: err.message || "Failed to log data" });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading && environmentLogs.length === 0) return <LoadingSpinner size="lg" />;

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Environment</h1>
					<p className="text-gray-600 mt-2">Track environmental factors automatically or manually</p>
				</div>
			</div>

			{/* Location Status & Auto-fetch Action */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-primary-50 rounded-xl">
							<MapPinIcon className="w-6 h-6 text-primary-600" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Home Location</p>
							<div className="flex items-center gap-2 mt-1">
								<h2 className="text-xl font-bold text-gray-900">{user?.homeLocation || "Not Set"}</h2>
								<button
									onClick={() => setIsLocationModalOpen(true)}
									className="text-xs text-primary-600 hover:text-primary-700 font-medium underline cursor-pointer"
								>
									Change
								</button>
							</div>
							{!user?.homeLocation && (
								<p className="text-sm text-amber-600 mt-2 flex items-center gap-1.5">
									<InformationCircleIcon className="w-4 h-4" />
									Set a location to enable automatic data fetching.
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							variant="secondary"
							onClick={() => setIsLogModalOpen(true)}
							className="flex items-center justify-center gap-2 cursor-pointer"
						>
							<PlusIcon className="w-5 h-5" />
							Manual Log
						</Button>
						<Button
							onClick={handleAutoFetch}
							isLoading={isSubmitting}
							disabled={!user?.homeLocation}
							className="flex items-center justify-center gap-2 cursor-pointer min-w-40"
						>
							<ArrowPathIcon className={`w-5 h-5 ${isSubmitting ? "animate-spin" : ""}`} />
							Generate Log
						</Button>
					</div>
				</div>
			</div>

			{error && (
				<div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
					Error loading environment data: {error}
				</div>
			)}

			<EnvironmentLogList logs={environmentLogs} />

			{/* Manual Log Modal */}
			<Modal
				isOpen={isLogModalOpen}
				onClose={() => setIsLogModalOpen(false)}
				title="Log Environmental Data Manually"
				size="lg"
			>
				<EnvironmentLogForm
					onSubmit={handleManualLogSubmit}
					onCancel={() => setIsLogModalOpen(false)}
					isSubmitting={isSubmitting}
				/>
			</Modal>

			{/* Location Settings Modal */}
			<Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title="Set Home Location">
				<form onSubmit={handleLocationSubmit} className="space-y-4">
					<p className="text-sm text-gray-600">
						Enter your city and country (e.g., "New York, US") to automatically fetch weather and air
						quality data.
					</p>
					<div className="relative">
						<Input
							label="Location"
							value={locationInput}
							onChange={handleLocationInput}
							placeholder="City, Country"
							required
							autoFocus
						/>
						{isSearching && (
							<div className="absolute right-3 bottom-3">
								<ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
							</div>
						)}

						{searchResults.length > 0 && (
							<div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
								{searchResults.map((result, idx) => (
									<button
										key={idx}
										type="button"
										onClick={() => selectLocation(result)}
										className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0 border-gray-100 flex items-center gap-2"
									>
										<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
										<span>{result.display_name}</span>
									</button>
								))}
							</div>
						)}
					</div>
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="secondary"
							onClick={() => setIsLocationModalOpen(false)}
							className="flex-1 cursor-pointer"
						>
							Cancel
						</Button>
						<Button type="submit" isLoading={isSubmitting} className="flex-1 cursor-pointer">
							Save Location
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
};
