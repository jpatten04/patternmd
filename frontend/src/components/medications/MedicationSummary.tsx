import { Card } from "@/components/common/Card";
import type { Medication, MedicationAdherence } from "@/types";
import { CheckCircleIcon, ExclamationCircleIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface Props {
	medications: Medication[];
	adherence: MedicationAdherence[];
}

export const MedicationSummary = ({ medications, adherence }: Props) => {
	const active = medications.filter((m) => m.active);

	const avgAdherence =
		adherence.length > 0
			? Math.round(adherence.reduce((acc, curr) => acc + curr.adherenceRate, 0) / adherence.length)
			: 0;

	const totalMissed = adherence.reduce((acc, curr) => acc + curr.missedDoses, 0);

	return (
		<Card>
			<div className="flex justify-around">
				<div className="flex items-center gap-2.5 px-1">
					<div className="p-1.5 bg-green-50 rounded-md">
						<ChartBarIcon className="w-6 h-6 text-green-600" />
					</div>
					<div>
						<p className="text-[14px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">
							Adherence
						</p>
						<p className="text-[20px] font-bold text-gray-900 leading-none">{avgAdherence}%</p>
					</div>
				</div>
				<div className="flex items-center gap-2.5">
					<div className="p-1.5 bg-red-50 rounded-md">
						<ExclamationCircleIcon className="w-6 h-6 text-red-600" />
					</div>
					<div>
						<p className="text-[14px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">
							Missed
						</p>
						<p className="text-[20px] font-bold text-gray-900 leading-none">{totalMissed}</p>
					</div>
				</div>
				<div className="flex items-center gap-2.5 px-1">
					<div className="p-1.5 bg-blue-50 rounded-md">
						<CheckCircleIcon className="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p className="text-[14px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">
							Active
						</p>
						<p className="text-[20px] font-bold text-gray-900 leading-none">{active.length}</p>
					</div>
				</div>
			</div>
		</Card>
	);
};
