import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { useMedications } from "@/hooks/useMedications";
import { useUIStore } from "@/store/uiStore";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const MedicationLogForm = ({ onSuccess, onCancel }: Props) => {
	const { medications, logDose, loading } = useMedications();
	const addToast = useUIStore((state) => state.addToast);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getLocalISOString = () => {
		const now = new Date();
		const offset = now.getTimezoneOffset() * 60000;
		return new Date(now.getTime() - offset).toISOString().slice(0, 16);
	};

	const [selectedMedId, setSelectedMedId] = useState("");
	const [status, setStatus] = useState<"taken" | "missed">("taken");
	const [notes, setNotes] = useState("");
	const [timestamp, setTimestamp] = useState(getLocalISOString());

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedMedId) {
			addToast({ type: "error", message: "Please select a medication" });
			return;
		}

		setIsSubmitting(true);
		try {
			// Note: The service expects 'taken' as a boolean
			await logDose(selectedMedId, status === "taken", notes);
			addToast({ type: "success", message: "Dose logged successfully" });
			onSuccess?.();
		} catch (error: any) {
			addToast({ 
				type: "error", 
				message: error.response?.data?.error || "Failed to log dose" 
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading && medications.length === 0) {
		return <div className="text-center py-4 text-gray-500">Loading medications...</div>;
	}

	if (medications.length === 0) {
		return (
			<div className="text-center py-4">
				<p className="text-gray-500 mb-4">No active medications found.</p>
				<div className="flex flex-col gap-2">
					<Link 
						to="/medications" 
						onClick={onSuccess}
						className="inline-flex justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
					>
						Add a Medication
					</Link>
					{onCancel && <Button onClick={onCancel} variant="secondary">Close</Button>}
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
				<select
					value={selectedMedId}
					onChange={(e) => setSelectedMedId(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
					required
				>
					<option value="">Select a medication...</option>
					{medications.filter(m => m.active).map((med) => (
						<option key={med.id} value={med.id}>
							{med.name} ({med.dosage})
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setStatus("taken")}
						className={`flex-1 py-2 rounded-lg border-2 transition-all cursor-pointer font-medium ${
							status === "taken"
								? "border-green-600 bg-green-50 text-green-700"
								: "border-gray-200 text-gray-500 hover:border-gray-300"
						}`}
					>
						Taken
					</button>
					<button
						type="button"
						onClick={() => setStatus("missed")}
						className={`flex-1 py-2 rounded-lg border-2 transition-all cursor-pointer font-medium ${
							status === "missed"
								? "border-red-600 bg-red-50 text-red-700"
								: "border-gray-200 text-gray-500 hover:border-gray-300"
						}`}
					>
						Missed
					</button>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
				<input
					type="datetime-local"
					value={timestamp}
					onChange={(e) => setTimestamp(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
					rows={3}
					placeholder="Any notes about this dose..."
				/>
			</div>

			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
				)}
				<Button type="submit" isLoading={isSubmitting} className="flex-1">
					Log Dose
				</Button>
			</div>
		</form>
	);
};
