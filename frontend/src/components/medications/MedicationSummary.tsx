import { Card } from "@/components/common/Card";
import type { MedicationAdherence } from "@/types";
import { CheckCircleIcon, ExclamationCircleIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface Props {
	adherence: MedicationAdherence[];
}

export const MedicationSummary = ({ adherence }: Props) => {
	const avgAdherence =
		adherence.length > 0
			? Math.round(adherence.reduce((acc, curr) => acc + curr.adherenceRate, 0) / adherence.length)
			: 0;

	const totalMissed = adherence.reduce((acc, curr) => acc + curr.missedDoses, 0);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card className="flex items-center gap-4 p-4">
				<div className="p-3 bg-green-100 rounded-lg">
					<ChartBarIcon className="w-6 h-6 text-green-600" />
				</div>
				<div>
					<p className="text-sm text-gray-500">Avg. Adherence</p>
					<p className="text-2xl font-bold text-gray-900">{avgAdherence}%</p>
				</div>
			</Card>

			<Card className="flex items-center gap-4 p-4">
				<div className="p-3 bg-red-100 rounded-lg">
					<ExclamationCircleIcon className="w-6 h-6 text-red-600" />
				</div>
				<div>
					<p className="text-sm text-gray-500">Missed Doses</p>
					<p className="text-2xl font-bold text-gray-900">{totalMissed}</p>
				</div>
			</Card>

			<Card className="flex items-center gap-4 p-4">
				<div className="p-3 bg-blue-100 rounded-lg">
					<CheckCircleIcon className="w-6 h-6 text-blue-600" />
				</div>
				<div>
					<p className="text-sm text-gray-500">Tracked Meds</p>
					<p className="text-2xl font-bold text-gray-900">{adherence.length}</p>
				</div>
			</Card>
		</div>
	);
};
