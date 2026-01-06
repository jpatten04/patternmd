import { format, parseISO } from "date-fns";
import { 
	ExclamationTriangleIcon, 
	InformationCircleIcon, 
	BoltIcon,
	BeakerIcon,
	TrashIcon,
	CheckIcon
} from "@heroicons/react/24/outline";
import type { Alert } from "@/types";

interface Props {
	alert: Alert;
	onMarkAsRead: (id: string) => void;
	onDismiss: (id: string) => void;
}

export const AlertCard = ({ alert, onMarkAsRead, onDismiss }: Props) => {
	const getIcon = () => {
		switch (alert.alertType) {
			case "medication":
				return <BeakerIcon className="w-6 h-6 text-blue-600" />;
			case "pattern":
				return <BoltIcon className="w-6 h-6 text-purple-600" />;
			case "environment":
				return <InformationCircleIcon className="w-6 h-6 text-green-600" />;
			default:
				return <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />;
		}
	};

	const getSeverityColor = () => {
		switch (alert.severity) {
			case "high":
				return "bg-red-50 border-red-100 text-red-900";
			case "medium":
				return "bg-amber-50 border-amber-100 text-amber-900";
			default:
				return "bg-blue-50 border-blue-100 text-blue-900";
		}
	};

	return (
		<div className={`p-4 rounded-xl border transition-all ${getSeverityColor()} ${alert.isRead ? 'opacity-75 grayscale-[0.5]' : ''}`}>
			<div className="flex gap-4">
				<div className={`p-2 rounded-lg bg-white/50 h-fit`}>
					{getIcon()}
				</div>
				<div className="flex-1">
					<div className="flex justify-between items-start">
						<div>
							<span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
								{alert.alertType} Alert
							</span>
							<p className="font-semibold text-lg leading-tight mt-0.5">{alert.message}</p>
						</div>
						<div className="flex gap-2">
							{!alert.isRead && (
								<button
									onClick={() => onMarkAsRead(alert.id)}
									className="p-1.5 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
									title="Mark as read"
								>
									<CheckIcon className="w-5 h-5" />
								</button>
							)}
							<button
								onClick={() => onDismiss(alert.id)}
								className="p-1.5 hover:bg-white/50 rounded-lg transition-colors cursor-pointer text-red-600"
								title="Dismiss"
							>
								<TrashIcon className="w-5 h-5" />
							</button>
						</div>
					</div>
					<div className="flex items-center gap-2 mt-3 text-xs opacity-60">
						<span>{format(parseISO(alert.timestamp), "MMM d, yyyy • h:mm a")}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
