import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import type { Medication, MedicationForm as MedicationFormType } from "@/types";

interface Props {
	initialData?: Medication;
	onSubmit: (data: MedicationFormType) => Promise<void>;
	onCancel: () => void;
	isSubmitting?: boolean;
}

export const MedicationForm = ({ initialData, onSubmit, onCancel, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<MedicationFormType>({
		defaultValues: initialData
			? {
					name: initialData.name,
					dosage: initialData.dosage,
					frequency: initialData.frequency,
					startDate: initialData.startDate.split("T")[0],
					endDate: initialData.endDate?.split("T")[0],
					purpose: initialData.purpose,
			  }
			: {
					startDate: new Date().toISOString().split("T")[0],
			  },
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Input
				label="Medication Name"
				{...register("name", { required: "Name is required" })}
				error={errors.name?.message}
				placeholder="e.g., Lisinopril"
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Dosage"
					{...register("dosage", { required: "Dosage is required" })}
					error={errors.dosage?.message}
					placeholder="e.g., 10mg"
				/>
				<Input
					label="Frequency"
					{...register("frequency", { required: "Frequency is required" })}
					error={errors.frequency?.message}
					placeholder="e.g., Once daily, every 12 hours"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Start Date"
					type="date"
					{...register("startDate", { required: "Start date is required" })}
					error={errors.startDate?.message}
				/>
				<Input
					label="End Date (Optional)"
					type="date"
					{...register("endDate")}
					error={errors.endDate?.message}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Purpose (Optional)</label>
				<textarea
					{...register("purpose")}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
					rows={3}
					placeholder="e.g., For blood pressure"
				/>
			</div>

			<div className="flex gap-3 pt-2">
				<Button
					type="button"
					variant="secondary"
					onClick={onCancel}
					className="flex-1 cursor-pointer"
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" isLoading={isSubmitting} className="flex-1 cursor-pointer">
					{initialData ? "Update Medication" : "Add Medication"}
				</Button>
			</div>
		</form>
	);
};
