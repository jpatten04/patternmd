import { useState } from "react";
import { useMedications } from "@/hooks/useMedications";
import { useUIStore } from "@/store/uiStore";
import { MedicationList } from "@/components/medications/MedicationList";
import { MedicationForm } from "@/components/medications/MedicationForm";
import { DoseTracker } from "@/components/medications/DoseTracker";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Medication, MedicationForm as MedicationFormType } from "@/types";
import { MedicationSummary } from "@/components/medications/MedicationSummary";

export const Medications = () => {
	const {
		medications,
		medicationLogs,
		adherence,
		loading,
		error,
		addMedication,
		updateMedication,
		deleteMedication,
	} = useMedications();

	const addToast = useUIStore((state) => state.addToast);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingMed, setEditingMed] = useState<Medication | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAddClick = () => {
		setEditingMed(null);
		setIsModalOpen(true);
	};

	const handleEditClick = (med: Medication) => {
		setEditingMed(med);
		setIsModalOpen(true);
	};

	const handleDeleteClick = async (id: string) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this medication? This will also remove all historical logs."
			)
		) {
			return;
		}

		try {
			await deleteMedication(id);
			addToast({ type: "success", message: "Medication deleted" });
		} catch (err: any) {
			addToast({ type: "error", message: err.message || "Failed to delete" });
		}
	};

	const handleFormSubmit = async (data: MedicationFormType) => {
		setIsSubmitting(true);
		try {
			if (editingMed) {
				await updateMedication(editingMed.id, data);
				addToast({ type: "success", message: "Medication updated" });
			} else {
				await addMedication({ ...data, active: true });
				addToast({ type: "success", message: "Medication added" });
			}
			setIsModalOpen(false);
		} catch (err: any) {
			addToast({ type: "error", message: err.message || "Operation failed" });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading && medications.length === 0) return <LoadingSpinner size="lg" />;

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Medications</h1>
					<p className="text-gray-600 mt-2">Manage your treatment plan and track adherence</p>
				</div>
				<Button onClick={handleAddClick} className="flex items-center gap-2 cursor-pointer">
					<PlusIcon className="w-5 h-5" />
					Add Medication
				</Button>
			</div>

			{error && (
				<div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
					Error loading medications: {error}
				</div>
			)}

			<MedicationSummary medications={medications} adherence={adherence} />

			<MedicationList
				medications={medications}
				adherence={adherence}
				onEdit={handleEditClick}
				onDelete={handleDeleteClick}
			/>

			<DoseTracker medications={medications} logs={medicationLogs} adherence={adherence} />

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={editingMed ? "Edit Medication" : "Add New Medication"}
				size="lg"
			>
				<MedicationForm
					initialData={editingMed || undefined}
					onSubmit={handleFormSubmit}
					onCancel={() => setIsModalOpen(false)}
					isSubmitting={isSubmitting}
				/>
			</Modal>
		</div>
	);
};
