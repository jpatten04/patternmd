import { useAuth } from "@/hooks/useAuth";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useMedications } from "@/hooks/useMedications";
import { usePatterns } from "@/hooks/usePatterns";
import { useAlerts } from "@/hooks/useAlerts";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { 
	PlusIcon, 
	ChartBarIcon, 
	BeakerIcon, 
	BellIcon, 
	ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export const Dashboard = () => {
	const { user } = useAuth();
	const { symptoms, loading: symptomsLoading } = useSymptoms();
	const { medications, loading: medsLoading } = useMedications();
	const { patterns, loading: patternsLoading } = usePatterns();
	const { alerts, loading: alertsLoading } = useAlerts();

	const isLoading = symptomsLoading || medsLoading || patternsLoading || alertsLoading;

	if (isLoading) {
		return <LoadingSpinner size="lg" />;
	}

	const todayLogsCount = symptoms.filter(s => 
		format(new Date(s.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
	).length;

	const activeMedsCount = medications.filter(m => m.active).length;
	const recentSymptoms = symptoms.slice(0, 5);
	const recentAlerts = alerts.slice(0, 3);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
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
					<div className="text-2xl font-bold text-gray-900">{patterns.length}</div>
					<div className="text-xs text-gray-500 mt-1">Insights discovered</div>
				</Card>

				<Card className="flex flex-col justify-between">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-500">Alerts</span>
						<BellIcon className="w-5 h-5 text-red-600" />
					</div>
					<div className="text-2xl font-bold text-gray-900">{alerts.filter(a => !a.read).length}</div>
					<div className="text-xs text-gray-500 mt-1">Unread notifications</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Symptoms */}
				<Card title="Recent Symptoms" className="lg:col-span-2">
					{recentSymptoms.length > 0 ? (
						<div className="space-y-4">
							{recentSymptoms.map((symptom) => (
								<div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div>
										<p className="font-medium text-gray-900">{symptom.symptomName}</p>
										<p className="text-xs text-gray-500">{format(new Date(symptom.timestamp), 'MMM d, h:mm a')}</p>
									</div>
									<div className="flex items-center">
										<span className={`px-2 py-1 text-xs font-semibold rounded-full ${
											symptom.severity > 7 ? 'bg-red-100 text-red-700' :
											symptom.severity > 4 ? 'bg-yellow-100 text-yellow-700' :
											'bg-green-100 text-green-700'
										}`}>
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
				<Card title="Recent Alerts">
					{recentAlerts.length > 0 ? (
						<div className="space-y-4">
							{recentAlerts.map((alert) => (
								<div key={alert.id} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
									<ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
									<div>
										<p className="text-sm font-medium text-red-900">{alert.title}</p>
										<p className="text-xs text-red-700 mt-0.5">{alert.message}</p>
										<p className="text-[10px] text-red-500 mt-1">{format(new Date(alert.timestamp), 'MMM d')}</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>All clear! No recent alerts.</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
};
