import { Card } from "@/components/common/Card";
import type { Medication, MedicationAdherence } from "@/types";
import { PencilSquareIcon, TrashIcon, CalendarIcon, BeakerIcon } from "@heroicons/react/24/outline";

interface CardProps {
	medication: Medication;
	adherence?: MedicationAdherence;
	onEdit: (med: Medication) => void;
	onDelete: (id: string) => void;
}

export const MedicationCard = ({ medication, adherence, onEdit, onDelete }: CardProps) => {
	return (
		<Card className="p-5 border-l-4 border-l-primary-500">
			<div className="flex justify-between items-start">
				<div className="flex gap-3">
					<div className="p-2 bg-primary-50 rounded-lg">
						<BeakerIcon className="w-5 h-5 text-primary-600" />
					</div>
					<div>
						<h3 className="font-bold text-gray-900 text-lg">{medication.name}</h3>
						<p className="text-primary-700 font-medium">{medication.dosage}</p>
					</div>
				</div>
				<div className="flex gap-1">
					<button
						onClick={() => onEdit(medication)}
						className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
						title="Edit"
					>
						<PencilSquareIcon className="w-5 h-5" />
					</button>
					<button
						onClick={() => onDelete(medication.id)}
						className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
						title="Delete"
					>
						<TrashIcon className="w-5 h-5" />
					</button>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
				<div className="flex items-center gap-2 text-gray-600">
					<CalendarIcon className="w-4 h-4" />
					<span>{medication.frequency}</span>
				</div>
				{adherence && (
					<div className="text-right">
						<span
							className={`px-2 py-1 rounded-full text-xs font-bold ${
								adherence.adherenceRate >= 80
									? "bg-green-100 text-green-700"
									: adherence.adherenceRate >= 50
									? "bg-yellow-100 text-yellow-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{adherence.adherenceRate}% Adherence
						</span>
					</div>
				)}
			</div>

			{medication.purpose && <p className="mt-3 text-sm text-gray-500 italic">"{medication.purpose}"</p>}
		</Card>
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
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full"></div>
						Active Medications
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{active.map((med) => (
							<MedicationCard
								key={med.id}
								medication={med}
								adherence={adherence.find((a) => a.medicationId === med.id)}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</div>
				</div>
			)}

			{inactive.length > 0 && (
				<div>
					<h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
						<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
						Inactive / Past Medications
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-75">
						{inactive.map((med) => (
							<MedicationCard
								key={med.id}
								medication={med}
								adherence={adherence.find((a) => a.medicationId === med.id)}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</div>
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
