import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersService } from "@/services/usersService";
import { environmentService } from "@/services/environmentService";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import {
	UserIcon,
	Cog6ToothIcon,
	ShieldCheckIcon,
	BellIcon,
	GlobeAltIcon,
	SwatchIcon,
	ArrowPathIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { UserPreferences } from "@/types";

type Tab = "account" | "preferences" | "notifications" | "security";

export const Settings = () => {
	const { user } = useAuth();
	const addToast = useUIStore((state) => state.addToast);
	const [activeTab, setActiveTab] = useState<Tab>("account");

	// Profile state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [homeLocation, setHomeLocation] = useState("");
	const [isProfileUpdating, setIsProfileUpdating] = useState(false);

	// Location Search state
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Password state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

	// Preferences state
	const [preferences, setPreferences] = useState<UserPreferences>({
		theme: "system",
		units: "metric",
		environmentalDataEnabled: true,
		alertSettings: {
			missedDoseAlerts: true,
			highSeverityAlerts: true,
			patternDiscoveryAlerts: true,
			environmentAlerts: true,
		},
		defaultView: "dashboard",
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});

	useEffect(() => {
		if (user) {
			setName(user.name);
			setEmail(user.email);
			setHomeLocation(user.homeLocation || "");
			if (user.preferences) {
				setPreferences((prev) => ({ ...prev, ...user.preferences }));
			}
		}
	}, [user]);

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsProfileUpdating(true);
		try {
			await usersService.updateProfile({ name, email, homeLocation });
			addToast({ type: "success", message: "Profile updated successfully" });
		} catch (err: any) {
			addToast({ type: "error", message: err.response?.data?.error || "Failed to update profile" });
		} finally {
			setIsProfileUpdating(false);
		}
	};

	const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setHomeLocation(query);

		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

		if (query.trim().length > 2) {
			setIsSearching(true);
			searchTimeoutRef.current = setTimeout(async () => {
				try {
					const results = await environmentService.searchLocation(query);
					setSearchResults(results);
				} catch (err: any) {
					console.error("Search failed", err);
				} finally {
					setIsSearching(false);
				}
			}, 500);
		} else {
			setSearchResults([]);
		}
	};

	const selectLocation = (location: any) => {
		setHomeLocation(location.display_name);
		setSearchResults([]);
	};

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			addToast({ type: "error", message: "Passwords do not match" });
			return;
		}
		setIsPasswordUpdating(true);
		try {
			await usersService.updatePassword({ currentPassword, newPassword });
			addToast({ type: "success", message: "Password updated successfully" });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: any) {
			addToast({ type: "error", message: err.response?.data?.error || "Failed to update password" });
		} finally {
			setIsPasswordUpdating(false);
		}
	};

	const handlePreferenceChange = async (key: keyof UserPreferences, value: any) => {
		const newPrefs = { ...preferences, [key]: value };
		setPreferences(newPrefs);
		try {
			await usersService.updatePreferences(newPrefs);
			addToast({ type: "success", message: "Settings saved" });
		} catch (err: any) {
			addToast({ type: "error", message: "Failed to save settings" });
		}
	};

	const handleAlertSettingChange = async (key: keyof UserPreferences["alertSettings"], value: boolean) => {
		const newAlertSettings = { ...preferences.alertSettings, [key]: value };
		handlePreferenceChange("alertSettings", newAlertSettings);
	};

	const menuItems = [
		{ id: "account", label: "Account", icon: UserIcon },
		{ id: "preferences", label: "Preferences", icon: Cog6ToothIcon },
		{ id: "notifications", label: "Notifications", icon: BellIcon },
		{ id: "security", label: "Security", icon: ShieldCheckIcon },
	];

	return (
		<div className="max-w-6xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
				<p className="text-gray-600 mt-2">Manage your account and app configuration</p>
			</div>

			<div className="flex flex-col md:flex-row gap-8">
				{/* Sidebar Navigation */}
				<aside className="w-full md:w-64 shrink-0">
					<nav className="space-y-1">
						{menuItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id as Tab)}
								className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
									activeTab === item.id
										? "bg-primary-50 text-primary-700 shadow-sm"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								}`}
							>
								<item.icon
									className={`w-5 h-5 ${
										activeTab === item.id ? "text-primary-600" : "text-gray-400"
									}`}
								/>
								{item.label}
							</button>
						))}
					</nav>
				</aside>

				{/* Content Area */}
				<main className="flex-1">
					{activeTab === "account" && (
						<div className="space-y-6">
							<Card title="Public Profile" description="Manage your basic account information.">
								<form onSubmit={handleProfileUpdate} className="space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<Input
											label="Full Name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											required
										/>
										<Input
											label="Email Address"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
										/>
									</div>
									<div className="relative">
										<Input
											label="Home Location"
											helperText="Used for local weather and environmental tracking."
											value={homeLocation}
											onChange={handleLocationInput}
											placeholder="e.g. New York, NY or 10001"
										/>
										{isSearching && (
											<div className="absolute right-3 top-9">
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
														className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0 border-gray-100 flex items-center gap-2 cursor-pointer"
													>
														<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
														<span>{result.display_name}</span>
													</button>
												))}
											</div>
										)}
									</div>
									<div className="pt-4 border-t border-gray-100 flex justify-end">
										<Button type="submit" isLoading={isProfileUpdating} className="cursor-pointer">
											Save Profile
										</Button>
									</div>
								</form>
							</Card>
						</div>
					)}

					{activeTab === "preferences" && (
						<div className="space-y-6">
							<Card
								title="App Configuration"
								description="Customize how the app behaves and displays data."
							>
								<div className="space-y-8">
									<div className="flex items-start justify-between">
										<div className="flex gap-4">
											<div className="p-2 bg-indigo-50 rounded-lg">
												<SwatchIcon className="w-5 h-5 text-indigo-600" />
											</div>
											<div>
												<p className="font-semibold text-gray-900">Theme</p>
												<p className="text-sm text-gray-500">
													Choose your preferred visual style
												</p>
											</div>
										</div>
										<select
											value={preferences.theme}
											onChange={(e) => handlePreferenceChange("theme", e.target.value)}
											className="rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
										>
											<option value="light">Light Mode</option>
											<option value="dark">Dark Mode</option>
											<option value="system">System Default</option>
										</select>
									</div>

									<div className="flex items-start justify-between">
										<div className="flex gap-4">
											<div className="p-2 bg-emerald-50 rounded-lg">
												<GlobeAltIcon className="w-5 h-5 text-emerald-600" />
											</div>
											<div>
												<p className="font-semibold text-gray-900">Units</p>
												<p className="text-sm text-gray-500">
													Distance and temperature measurements
												</p>
											</div>
										</div>
										<select
											value={preferences.units}
											onChange={(e) => handlePreferenceChange("units", e.target.value)}
											className="rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
										>
											<option value="metric">Metric (Celsius, km)</option>
											<option value="imperial">Imperial (Fahrenheit, miles)</option>
										</select>
									</div>

									<div className="flex items-start justify-between">
										<div className="flex gap-4">
											<div className="p-2 bg-blue-50 rounded-lg">
												<Cog6ToothIcon className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<p className="font-semibold text-gray-900">Default Landing Page</p>
												<p className="text-sm text-gray-500">
													Which screen you see first after login
												</p>
											</div>
										</div>
										<select
											value={preferences.defaultView}
											onChange={(e) => handlePreferenceChange("defaultView", e.target.value)}
											className="rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
										>
											<option value="dashboard">Health Dashboard</option>
											<option value="timeline">History Timeline</option>
											<option value="medications">Medication Plan</option>
										</select>
									</div>

									<div className="pt-6 border-t border-gray-100">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-semibold text-gray-900">Environmental Tracking</p>
												<p className="text-sm text-gray-500">
													Allow app to fetch weather and AQI data
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={preferences.environmentalDataEnabled}
													onChange={(e) =>
														handlePreferenceChange(
															"environmentalDataEnabled",
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
											</label>
										</div>
									</div>
								</div>
							</Card>
						</div>
					)}

					{activeTab === "notifications" && (
						<div className="space-y-6">
							<Card
								title="Notification Preferences"
								description="Configure when and how you want to be alerted."
							>
								<div className="space-y-6">
									{[
										{
											id: "missedDoseAlerts",
											label: "Missed Dose Reminders",
											desc: "Get notified if you forget a scheduled medication",
										},
										{
											id: "highSeverityAlerts",
											label: "High Severity Warnings",
											desc: "Alerts when symptoms reach high intensity",
										},
										{
											id: "patternDiscoveryAlerts",
											label: "Pattern Insights",
											desc: "Notifications when new health patterns are identified",
										},
										{
											id: "environmentAlerts",
											label: "Environmental Alerts",
											desc: "Warnings for poor air quality or extreme weather",
										},
									].map((item) => (
										<div key={item.id} className="flex items-center justify-between py-2">
											<div>
												<p className="font-medium text-gray-900">{item.label}</p>
												<p className="text-sm text-gray-500">{item.desc}</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={(preferences.alertSettings as any)[item.id]}
													onChange={(e) =>
														handleAlertSettingChange(
															item.id as keyof UserPreferences["alertSettings"],
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
											</label>
										</div>
									))}
								</div>
							</Card>
						</div>
					)}

					{activeTab === "security" && (
						<div className="space-y-6">
							<Card
								title="Password & Security"
								description="Update your password to keep your account safe."
							>
								<form onSubmit={handlePasswordUpdate} className="space-y-6">
									<Input
										label="Current Password"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										required
									/>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<Input
											label="New Password"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											required
										/>
										<Input
											label="Confirm New Password"
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
										/>
									</div>
									<div className="pt-4 border-t border-gray-100 flex justify-end">
										<Button
											type="submit"
											variant="secondary"
											isLoading={isPasswordUpdating}
											className="cursor-pointer"
										>
											Update Password
										</Button>
									</div>
								</form>
							</Card>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};
