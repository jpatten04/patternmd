import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useUIStore } from "@/store/uiStore";
import type { SymptomLogForm as SymptomLogFormType } from "@/types";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const SymptomLogForm = ({ onSuccess, onCancel }: Props) => {
	const { symptoms, addSymptom } = useSymptoms(undefined, undefined, false);
	const addToast = useUIStore((state) => state.addToast);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getLocalISOString = () => {
		const now = new Date();
		const offset = now.getTimezoneOffset() * 60000;
		return new Date(now.getTime() - offset).toISOString().slice(0, 16);
	};

	const [formData, setFormData] = useState<SymptomLogFormType>({
		symptomName: "",
		severity: 5,
		timestamp: getLocalISOString(),
		durationMinutes: undefined,
		notes: "",
		bodyLocation: "",
		triggers: [],
	});

	// Get unique symptom names for autocomplete (only if symptoms were fetched)
	const pastSymptomNames = symptoms.length > 0 
		? Array.from(new Set(symptoms.map((s) => s.symptomName)))
		: [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await addSymptom({
				...formData,
				timestamp: new Date(formData.timestamp).toISOString(),
			});
			addToast({ type: "success", message: "Symptom logged successfully" });
			onSuccess?.();
		} catch (error: any) {
			addToast({ 
				type: "error", 
				message: error.response?.data?.error || "Failed to log symptom" 
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Input
					label="Symptom Name"
					list="past-symptoms"
					value={formData.symptomName}
					onChange={(e) => setFormData({ ...formData, symptomName: e.target.value })}
					placeholder="e.g., Headache, Nausea"
					required
				/>
				<datalist id="past-symptoms">
					{pastSymptomNames.map((name) => (
						<option key={name} value={name} />
					))}
				</datalist>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Severity: {formData.severity}/10
				</label>
				<input
					type="range"
					min="1"
					max="10"
					value={formData.severity}
					onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
					className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
				/>
				<div className="flex justify-between text-xs text-gray-500 mt-1">
					<span>Mild</span>
					<span>Moderate</span>
					<span>Severe</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Input
					label="Duration (minutes)"
					type="number"
					value={formData.durationMinutes || ""}
					onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value ? Number(e.target.value) : undefined })}
					placeholder="Optional"
				/>
				<Input
					label="Body Location"
					value={formData.bodyLocation || ""}
					onChange={(e) => setFormData({ ...formData, bodyLocation: e.target.value })}
					placeholder="e.g., Left temple"
				/>
			</div>

			<Input
				label="Date & Time"
				type="datetime-local"
				value={formData.timestamp}
				onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
				required
			/>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
				<textarea
					value={formData.notes}
					onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
					rows={3}
					placeholder="Any additional details..."
				/>
			</div>

			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
				)}
				<Button type="submit" isLoading={isSubmitting} className="flex-1">
					Log Symptom
				</Button>
			</div>
		</form>
	);
};
