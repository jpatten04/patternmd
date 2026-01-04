import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { activityService } from "@/services/activityService";
import { useActivity } from "@/hooks/useActivity";
import { useUIStore } from "@/store/uiStore";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const ActivityLogForm = ({ onSuccess, onCancel }: Props) => {
	// Disable mount fetch for Quick Log
	useActivity(undefined, undefined, false);
	const addToast = useUIStore((state) => state.addToast);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getLocalISOString = () => {
		const now = new Date();
		const offset = now.getTimezoneOffset() * 60000;
		return new Date(now.getTime() - offset).toISOString().slice(0, 16);
	};

	const [formData, setFormData] = useState({
		activityType: "",
		durationMinutes: 30,
		intensity: 5,
		notes: "",
		timestamp: getLocalISOString(),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await activityService.createActivityLog({
				...formData,
				timestamp: new Date(formData.timestamp).toISOString(),
			});
			addToast({ type: "success", message: "Activity logged successfully" });
			onSuccess?.();
		} catch (error: any) {
			addToast({ 
				type: "error", 
				message: error.response?.data?.error || "Failed to log activity" 
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Activity Type"
				value={formData.activityType}
				onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
				placeholder="e.g., Walking, Yoga, Swimming"
				required
			/>

			<div className="grid grid-cols-2 gap-4">
				<Input
					label="Duration (minutes)"
					type="number"
					min="1"
					value={formData.durationMinutes}
					onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
					required
				/>
				<div className="flex flex-col justify-end">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Intensity: {formData.intensity}/10
					</label>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.intensity}
						onChange={(e) => setFormData({ ...formData, intensity: Number(e.target.value) })}
						className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 mb-2"
					/>
				</div>
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
					placeholder="How did you feel during or after the activity?"
				/>
			</div>

			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
				)}
				<Button type="submit" isLoading={isSubmitting} className="flex-1">
					Log Activity
				</Button>
			</div>
		</form>
	);
};
