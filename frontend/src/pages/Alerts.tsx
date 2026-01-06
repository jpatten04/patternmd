import { useState } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AlertSettings } from "@/components/alerts/AlertSettings";
import { useUIStore } from "@/store/uiStore";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/common/Button";

export const Alerts = () => {
	const { alerts, settings, loading, markAsRead, markAllAsRead, dismissAlert, updateSettings, refetch } = useAlerts();
	const addToast = useUIStore((state) => state.addToast);
	const [activeTab, setActiveTab] = useState<"all" | "settings">("all");
	const [isSaving, setIsSaving] = useState(false);

	const handleSaveSettings = async (newSettings: any) => {
		setIsSaving(true);
		try {
			await updateSettings(newSettings);
			addToast({ type: "success", message: "Alert preferences updated" });
		} catch (err) {
			addToast({ type: "error", message: "Failed to update preferences" });
		} finally {
			setIsSaving(false);
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await markAllAsRead();
			addToast({ type: "success", message: "All alerts marked as read" });
		} catch (err) {
			addToast({ type: "error", message: "Failed to mark all as read" });
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
					<p className="text-gray-600 mt-2">Personalized health insights and reminders</p>
				</div>
				{activeTab === "all" && alerts.some(a => !a.isRead) && (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleMarkAllRead}
						className="flex items-center gap-2"
					>
						<CheckIcon className="w-4 h-4" />
						Mark all read
					</Button>
				)}
			</div>

			<div className="flex border-b border-gray-200">
				<button
					onClick={() => setActiveTab("all")}
					className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
						activeTab === "all"
							? "border-primary-500 text-primary-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					All Alerts ({alerts.filter(a => !a.isRead).length} unread)
				</button>
				<button
					onClick={() => setActiveTab("settings")}
					className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
						activeTab === "settings"
							? "border-primary-500 text-primary-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					Preferences
				</button>
			</div>

			{activeTab === "all" ? (
				<AlertsList
					alerts={alerts}
					onMarkAsRead={markAsRead}
					onDismiss={dismissAlert}
					loading={loading}
				/>
			) : (
				settings && (
					<AlertSettings
						settings={settings}
						onSave={handleSaveSettings}
						isSaving={isSaving}
					/>
				)
			)}
		</div>
	);
};

