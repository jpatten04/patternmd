import { Card } from "@/components/common/Card";
import type { Medication, MedicationAdherence } from "@/types";
import { PencilSquareIcon, TrashIcon, BeakerIcon } from "@heroicons/react/24/outline";

interface CardProps {
	medication: Medication;
	adherence?: MedicationAdherence;
	onEdit: (med: Medication) => void;
	onDelete: (id: string) => void;
}

export const MedicationCard = ({ medication, adherence, onEdit, onDelete }: CardProps) => {
	return (
		<div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0 group">
			<div className="flex items-center gap-4 min-w-0 flex-1">
				<div
					className={`w-2 h-8 rounded-full shrink-0 ${medication.active ? "bg-primary-500" : "bg-gray-300"}`}
				/>
				<div className="min-w-0 flex-1 flex items-center gap-6">
					<div className="min-w-40">
						<h3 className="font-bold text-gray-900 text-base truncate">{medication.name}</h3>
					</div>
					<div className="hidden sm:block text-primary-700 text-sm font-medium truncate">
						{medication.dosage} • {medication.frequency}
					</div>
					{medication.purpose && (
						<p className="hidden md:block text-xs text-gray-400 italic truncate max-w-xs ml-auto pr-6">
							"{medication.purpose}"
						</p>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				{adherence && (
					<span
						className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
							adherence.adherenceRate >= 80
								? "bg-green-100 text-green-700"
								: adherence.adherenceRate >= 50
								? "bg-yellow-100 text-yellow-700"
								: "bg-red-100 text-red-700"
						}`}
					>
						{adherence.adherenceRate}%
					</span>
				)}
				<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={() => onEdit(medication)}
						className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer"
						title="Edit"
					>
						<PencilSquareIcon className="w-5 h-5" />
					</button>
					<button
						onClick={() => onDelete(medication.id)}
						className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
						title="Delete"
					>
						<TrashIcon className="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	);
};

interface ListProps {
	medications: Medication[];
	adherence: MedicationAdherence[];
	onEdit: (med: Medication) => void;
	onDelete: (id: string) => void;
}

export const MedicationList = ({ medications, adherence, onEdit, onDelete }: ListProps) => {
	const active = medications.filter((m) => m.active);
	const inactive = medications.filter((m) => !m.active);

	return (
		<div className="space-y-8">
			{active.length > 0 && (
				<div>
					<h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
						<div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
						Active Medications
					</h2>
					<Card className="divide-y divide-gray-50 overflow-hidden">
						{active.map((med) => (
							<MedicationCard
								key={med.id}
								medication={med}
								adherence={adherence.find((a) => a.medicationId === med.id)}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</Card>
				</div>
			)}

			{inactive.length > 0 && (
				<div>
					<h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
						<div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
						Inactive
					</h2>
					<Card className="divide-y divide-gray-50 overflow-hidden opacity-75">
						{inactive.map((med) => (
							<MedicationCard
								key={med.id}
								medication={med}
								adherence={adherence.find((a) => a.medicationId === med.id)}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</Card>
				</div>
			)}

			{medications.length === 0 && (
				<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
					<BeakerIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
					<h3 className="text-lg font-medium text-gray-900">No medications tracked yet</h3>
					<p className="text-gray-500">Add your first medication to start tracking adherence.</p>
				</div>
			)}
		</div>
	);
};
