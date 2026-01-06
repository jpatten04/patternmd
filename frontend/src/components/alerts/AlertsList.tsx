import { AlertCard } from "./AlertCard";
import type { Alert } from "@/types";
import { BellSlashIcon } from "@heroicons/react/24/outline";

interface Props {
	alerts: Alert[];
	onMarkAsRead: (id: string) => void;
	onDismiss: (id: string) => void;
	loading?: boolean;
}

export const AlertsList = ({ alerts, onMarkAsRead, onDismiss, loading }: Props) => {
	if (loading) {
		return (
			<div className="space-y-4 animate-pulse">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-24 bg-gray-100 rounded-xl" />
				))}
			</div>
		);
	}

	if (alerts.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
				<BellSlashIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
				<h3 className="text-lg font-medium text-gray-900">All clear!</h3>
				<p className="text-gray-500">You don't have any health alerts or reminders at the moment.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{alerts.map((alert) => (
				<AlertCard
					key={alert.id}
					alert={alert}
					onMarkAsRead={onMarkAsRead}
					onDismiss={onDismiss}
				/>
			))}
		</div>
	);
};
