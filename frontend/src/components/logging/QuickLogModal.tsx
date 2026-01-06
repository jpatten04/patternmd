import { useState } from "react";
import { HeartIcon, BeakerIcon, CakeIcon, BoltIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { SymptomLogForm } from "./SymptomLogForm";
import { MedicationLogForm } from "./MedicationLogForm";
import { FoodLogForm } from "./FoodLogForm";
import { ActivityLogForm } from "./ActivityLogForm";
import { MoodLogForm } from "./MoodLogForm";
import type { LogType } from "@/types";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

const logTypes = [
	{ type: "symptom" as LogType, label: "Symptom", icon: HeartIcon, color: "text-red-600" },
	{ type: "medication" as LogType, label: "Medication", icon: BeakerIcon, color: "text-blue-600" },
	{ type: "food" as LogType, label: "Food", icon: CakeIcon, color: "text-green-600" },
	{ type: "activity" as LogType, label: "Activity", icon: BoltIcon, color: "text-yellow-600" },
	{ type: "mood" as LogType, label: "Mood", icon: FaceSmileIcon, color: "text-purple-600" },
];

export const QuickLogModal = ({ isOpen, onClose }: Props) => {
	const [selectedType, setSelectedType] = useState<LogType>(logTypes[0].type);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Quick Log" size="md">
			<div className="space-y-6">
				{/* Type Selector */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">What do you want to log?</label>
					<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
						{logTypes.map((type) => {
							const Icon = type.icon;
							return (
								<button
									key={type.type}
									type="button"
									onClick={() => setSelectedType(type.type)}
									className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all cursor-pointer ${
										selectedType === type.type
											? "border-primary-600 bg-primary-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<Icon className={`w-5 h-5 ${type.color} mb-1`} />
									<span className="text-[10px] font-medium text-gray-700">{type.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Forms */}
				<div className="mt-6 border-t pt-6">
					{selectedType === "symptom" && <SymptomLogForm onSuccess={onClose} onCancel={onClose} />}
					{selectedType === "medication" && <MedicationLogForm onSuccess={onClose} onCancel={onClose} />}
					{selectedType === "food" && <FoodLogForm onSuccess={onClose} onCancel={onClose} />}
					{selectedType === "activity" && <ActivityLogForm onSuccess={onClose} onCancel={onClose} />}
					{selectedType === "mood" && <MoodLogForm onSuccess={onClose} onCancel={onClose} />}
				</div>
			</div>
		</Modal>
	);
};
