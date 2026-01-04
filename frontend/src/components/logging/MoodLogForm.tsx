import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { moodService } from "@/services/moodService";
import { useMood } from "@/hooks/useMood";
import { useUIStore } from "@/store/uiStore";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

const COMMON_EMOTIONS = [
	"Happy", "Sad", "Anxious", "Calm", "Angry", "Energetic", 
	"Tired", "Stressed", "Frustrated", "Excited", "Nervous", "Content"
];

export const MoodLogForm = ({ onSuccess, onCancel }: Props) => {
	// Disable mount fetch for Quick Log
	useMood(undefined, undefined, false);
	const addToast = useUIStore((state) => state.addToast);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getLocalISOString = () => {
		const now = new Date();
		const offset = now.getTimezoneOffset() * 60000;
		return new Date(now.getTime() - offset).toISOString().slice(0, 16);
	};

	const [formData, setFormData] = useState({
		moodRating: 5,
		emotions: [] as string[],
		notes: "",
		timestamp: getLocalISOString(),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await moodService.createMoodLog({
				...formData,
				timestamp: new Date(formData.timestamp).toISOString(),
			});
			addToast({ type: "success", message: "Mood logged successfully" });
			onSuccess?.();
		} catch (error: any) {
			addToast({ 
				type: "error", 
				message: error.response?.data?.error || "Failed to log mood" 
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleEmotion = (emotion: string) => {
		setFormData((prev) => ({
			...prev,
			emotions: prev.emotions.includes(emotion)
				? prev.emotions.filter((e) => e !== emotion)
				: [...prev.emotions, emotion],
		}));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Overall Mood: {formData.moodRating}/10
				</label>
				<input
					type="range"
					min="1"
					max="10"
					value={formData.moodRating}
					onChange={(e) => setFormData({ ...formData, moodRating: Number(e.target.value) })}
					className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
				/>
				<div className="flex justify-between text-xs text-gray-500 mt-1">
					<span>Low</span>
					<span>Neutral</span>
					<span>Great</span>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">Emotions (select all that apply)</label>
				<div className="flex flex-wrap gap-2">
					{COMMON_EMOTIONS.map((emotion) => (
						<button
							key={emotion}
							type="button"
							onClick={() => toggleEmotion(emotion)}
							className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
								formData.emotions.includes(emotion)
									? "bg-primary-600 border-primary-600 text-white"
									: "bg-white border-gray-300 text-gray-700 hover:border-primary-500"
							}`}
						>
							{emotion}
						</button>
					))}
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
					placeholder="Any context for how you're feeling..."
				/>
			</div>

			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
				)}
				<Button type="submit" isLoading={isSubmitting} className="flex-1">
					Log Mood
				</Button>
			</div>
		</form>
	);
};
