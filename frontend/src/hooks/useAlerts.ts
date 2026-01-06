import { useState, useEffect } from "react";
import { alertsService } from "@/services/alertsService";
import type { Alert, AlertSettings } from "@/types";

export const useAlerts = () => {
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [settings, setSettings] = useState<AlertSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAlerts = async () => {
		try {
			setLoading(true);
			const data = await alertsService.getAlerts();
			setAlerts(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchSettings = async () => {
		try {
			const data = await alertsService.getSettings();
			setSettings(data);
		} catch (err: any) {
			console.error("Failed to fetch settings:", err);
		}
	};

	useEffect(() => {
		fetchAlerts();
		fetchSettings();
	}, []);

	const markAsRead = async (id: string) => {
		try {
			const updated = await alertsService.markAsRead(id);
			setAlerts(alerts.map((a) => (a.id === id ? updated : a)));
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const markAllAsRead = async () => {
		try {
			await alertsService.markAllAsRead();
			setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const dismissAlert = async (id: string) => {
		try {
			await alertsService.dismissAlert(id);
			setAlerts(alerts.filter((a) => a.id !== id));
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const updateSettings = async (newSettings: AlertSettings) => {
		try {
			const updated = await alertsService.updateSettings(newSettings);
			setSettings(updated);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	return {
		alerts,
		settings,
		loading,
		error,
		markAsRead,
		markAllAsRead,
		dismissAlert,
		updateSettings,
		refetch: fetchAlerts,
	};
};
