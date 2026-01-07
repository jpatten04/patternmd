import { useAuth } from "@/hooks/useAuth";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useMedications } from "@/hooks/useMedications";
import { useFood } from "@/hooks/useFood";
import { useActivity } from "@/hooks/useActivity";
import { useMood } from "@/hooks/useMood";
import { usePatterns } from "@/hooks/usePatterns";
import { useAlerts } from "@/hooks/useAlerts";
import { useEnvironment } from "@/hooks/useEnvironment";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PlusIcon, ChartBarIcon, BeakerIcon, BellIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { environmentService } from "@/services/environmentService";

export const Dashboard = () => {
	const { user } = useAuth();
	const { symptoms, loading: symptomsLoading } = useSymptoms();
	const { medications, medicationLogs, loading: medsLoading } = useMedications();
	const { foodLogs, loading: foodLoading } = useFood();
	const { activityLogs, loading: activityLoading } = useActivity();
	const { moodLogs, loading: moodLoading } = useMood();
	const { correlations, loading: patternsLoading } = usePatterns();
	const { alerts, loading: alertsLoading } = useAlerts();
	const { environmentLogs, loading: envLoading, refetch: refetchEnv } = useEnvironment();

	const hasCheckedEnv = useRef(false);

	// Auto-log logic: trigger on first dashboard load if data is 6+ hours old
	useEffect(() => {
		if (envLoading || !user?.homeLocation || environmentLogs.length === 0 || hasCheckedEnv.current) return;

		const checkAndAutoLog = async () => {
			hasCheckedEnv.current = true;
			const latestLog = environmentLogs[0];
			const lastLogDate = new Date(latestLog.timestamp);
			const hoursSinceLastLog = (new Date().getTime() - lastLogDate.getTime()) / (1000 * 60 * 60);

			if (hoursSinceLastLog >= 6) {
				try {
					await environmentService.autoFetchEnvironment();
					refetchEnv();
				} catch (err) {
					console.error("Dashboard auto-log failed", err);
				}
			}
		};

		checkAndAutoLog();
	}, [user, environmentLogs, envLoading, refetchEnv]);

	const isLoading =
		symptomsLoading ||
		medsLoading ||
		foodLoading ||
		activityLoading ||
		moodLoading ||
		patternsLoading ||
		alertsLoading ||
		envLoading;

	if (isLoading) {
		return <LoadingSpinner size="lg" />;
	}

	const isToday = (dateStr: string) => {
		if (!dateStr) return false;
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return false;
			return format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
		} catch {
			return false;
		}
	};

	const todayLogsCount =
		(symptoms || []).filter((s) => isToday(s.timestamp)).length +
		(medicationLogs || []).filter((m) => isToday(m.timestamp)).length +
		(foodLogs || []).filter((f) => isToday(f.timestamp)).length +
		(activityLogs || []).filter((a) => isToday(a.timestamp)).length +
		(moodLogs || []).filter((m) => isToday(m.timestamp)).length;

	const activeMedsCount = medications.filter((m) => m.active).length;
	const recentSymptoms = symptoms.slice(0, 5);
	const todaysAlerts = alerts.filter((a) => isToday(a.timestamp));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "User"}!</h1>
				<p className="text-gray-600 mt-2">Here's an overview of your health patterns and recent activity.</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="flex flex-col justify-between">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-500">Today's Logs</span>
						<PlusIcon className="w-5 h-5 text-primary-600" />
					</div>
					<div className="text-2xl font-bold text-gray-900">{todayLogsCount}</div>
					<div className="text-xs text-gray-500 mt-1">New entries today</div>
				</Card>

				<Card className="flex flex-col justify-between">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-500">Active Meds</span>
						<BeakerIcon className="w-5 h-5 text-blue-600" />
					</div>
					<div className="text-2xl font-bold text-gray-900">{activeMedsCount}</div>
					<div className="text-xs text-gray-500 mt-1">Currently tracking</div>
				</Card>

				<Card className="flex flex-col justify-between">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-500">Patterns</span>
						<ChartBarIcon className="w-5 h-5 text-green-600" />
					</div>
					<div className="text-2xl font-bold text-gray-900">{correlations.length}</div>
					<div className="text-xs text-gray-500 mt-1">Insights discovered</div>
				</Card>

				<Card className="flex flex-col justify-between">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-500">Alerts</span>
						<BellIcon className="w-5 h-5 text-red-600" />
					</div>
					<div className="text-2xl font-bold text-gray-900">{alerts.filter((a) => !a.isRead).length}</div>
					<div className="text-xs text-gray-500 mt-1">Unread notifications</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Symptoms */}
				<Card title="Recent Symptoms" className="lg:col-span-2">
					{recentSymptoms.length > 0 ? (
						<div className="space-y-4">
							{recentSymptoms.map((symptom) => (
								<div
									key={symptom.id}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="font-medium text-gray-900">{symptom.symptomName}</p>
										<p className="text-xs text-gray-500">
											{format(new Date(symptom.timestamp), "MMM d, h:mm a")}
										</p>
									</div>
									<div className="flex items-center">
										<span
											className={`px-2 py-1 text-xs font-semibold rounded-full ${
												symptom.severity > 7
													? "bg-red-100 text-red-700"
													: symptom.severity > 4
													? "bg-yellow-100 text-yellow-700"
													: "bg-green-100 text-green-700"
											}`}
										>
											Severity: {symptom.severity}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>No symptoms logged recently.</p>
						</div>
					)}
				</Card>

				{/* Recent Alerts */}
				<Card title="Today's Alerts">
					{todaysAlerts.length > 0 ? (
						<div className="space-y-4">
							{todaysAlerts.map((alert) => (
								<div
									key={alert.id}
									className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100"
								>
									<ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
									<div>
										<p className="text-sm font-medium text-red-900">{alert.alertType}</p>
										<p className="text-xs text-red-700 mt-0.5">{alert.message}</p>
										<p className="text-[10px] text-red-500 mt-1">
											{format(new Date(alert.timestamp), "MMM d")}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>All clear! No alerts today.</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
};
