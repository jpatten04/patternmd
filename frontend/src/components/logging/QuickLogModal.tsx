import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon, BeakerIcon, CakeIcon, BoltIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { symptomsService } from "@/services/symptomsService";
import { medicationsService } from "@/services/medicationsService";
import { foodService } from "@/services/foodService";
import { activityService } from "@/services/activityService";
import { moodService } from "@/services/moodService";
import { useUIStore } from "@/store/uiStore";
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
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState(5);
	const [moodRating, setMoodRating] = useState(5);
	const [intensity, setIntensity] = useState(5);
	const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
	const [duration, setDuration] = useState(30);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const addToast = useUIStore((state) => state.addToast);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const timestamp = new Date().toISOString();

			switch (selectedType) {
				case "symptom":
					await symptomsService.createSymptom({
						symptomName: description,
						severity,
						timestamp,
						notes: "",
					});
					break;

				case "medication":
					// For quick log, we'll just create a note about taking medication
					// In the full medication page, users can properly track specific meds
					addToast({
						type: "info",
						message: "Use the Medications page to track specific medications",
					});
					break;

				case "food":
					await foodService.createFoodLog({
						foodName: description,
						mealType,
						timestamp,
					});
					break;

				case "activity":
					await activityService.createActivityLog({
						activityType: description,
						durationMinutes: duration,
						intensity,
						timestamp,
					});
					break;

				case "mood":
					await moodService.createMoodLog({
						moodRating,
						emotions: [description],
						timestamp,
					});
					break;
			}

			addToast({
				type: "success",
				message: `${logTypes.find((t) => t.type === selectedType)?.label} logged successfully!`,
			});

			resetForm();
		} catch (error: any) {
			addToast({
				type: "error",
				message: error.response?.data?.error || "Failed to log entry",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setDescription("");
		setSeverity(5);
		setMoodRating(5);
		setIntensity(5);
		setDuration(30);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-gray-900">Quick Log</h2>
					<button
						onClick={resetForm}
						className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
					>
						<XMarkIcon className="w-6 h-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Type Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">What do you want to log?</label>
						<div className="grid grid-cols-3 gap-2">
							{logTypes.map((type) => {
								const Icon = type.icon;
								return (
									<button
										key={type.type}
										type="button"
										onClick={() => setSelectedType(type.type)}
										className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
											selectedType === type.type
												? "border-primary-600 bg-primary-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<Icon className={`w-6 h-6 ${type.color} mb-1`} />
										<span className="text-xs font-medium text-gray-700">{type.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{selectedType === "symptom" && "Symptom"}
							{selectedType === "medication" && "Medication Name"}
							{selectedType === "food" && "Food/Meal"}
							{selectedType === "activity" && "Activity Type"}
							{selectedType === "mood" && "How are you feeling?"}
						</label>
						<input
							type="text"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							placeholder={
								selectedType === "symptom"
									? "e.g., Headache, Nausea"
									: selectedType === "medication"
									? "e.g., Aspirin"
									: selectedType === "food"
									? "e.g., Pizza, Salad"
									: selectedType === "activity"
									? "e.g., Walking, Yoga"
									: "e.g., Anxious, Happy"
							}
							required
						/>
					</div>

					{/* Symptom-specific: Severity */}
					{selectedType === "symptom" && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Severity: {severity}/10
							</label>
							<input
								type="range"
								min="1"
								max="10"
								value={severity}
								onChange={(e) => setSeverity(Number(e.target.value))}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-1">
								<span>Mild</span>
								<span>Moderate</span>
								<span>Severe</span>
							</div>
						</div>
					)}

					{/* Food-specific: Meal Type */}
					{selectedType === "food" && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
							<div className="grid grid-cols-2 gap-2">
								{["breakfast", "lunch", "dinner", "snack"].map((meal) => (
									<button
										key={meal}
										type="button"
										onClick={() => setMealType(meal as any)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
											mealType === meal
												? "bg-primary-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{meal.charAt(0).toUpperCase() + meal.slice(1)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Activity-specific: Duration and Intensity */}
					{selectedType === "activity" && (
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Duration (minutes)
								</label>
								<input
									type="number"
									min="1"
									value={duration}
									onChange={(e) => setDuration(Number(e.target.value))}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Intensity: {intensity}/10
								</label>
								<input
									type="range"
									min="1"
									max="10"
									value={intensity}
									onChange={(e) => setIntensity(Number(e.target.value))}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
								/>
								<div className="flex justify-between text-xs text-gray-500 mt-1">
									<span>Light</span>
									<span>Moderate</span>
									<span>Intense</span>
								</div>
							</div>
						</>
					)}

					{/* Mood-specific: Rating */}
					{selectedType === "mood" && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Mood Rating: {moodRating}/10
							</label>
							<input
								type="range"
								min="1"
								max="10"
								value={moodRating}
								onChange={(e) => setMoodRating(Number(e.target.value))}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-1">
								<span>Low</span>
								<span>Neutral</span>
								<span>Great</span>
							</div>
						</div>
					)}

					{/* Submit Buttons */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={resetForm}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !description.trim()}
							className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{isSubmitting ? "Logging..." : "Log Entry"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
