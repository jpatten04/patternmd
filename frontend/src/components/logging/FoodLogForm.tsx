import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { foodService } from "@/services/foodService";
import { useFood } from "@/hooks/useFood";
import { useUIStore } from "@/store/uiStore";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const FoodLogForm = ({ onSuccess, onCancel }: Props) => {
	// We use the hook with enabled=false just to be consistent and have access to refetch if needed,
	// but we don't want it to trigger an API call on mount for the Quick Log.
	useFood(undefined, undefined, false);
	const addToast = useUIStore((state) => state.addToast);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getLocalISOString = () => {
		const now = new Date();
		const offset = now.getTimezoneOffset() * 60000;
		return new Date(now.getTime() - offset).toISOString().slice(0, 16);
	};

	const [formData, setFormData] = useState({
		foodName: "",
		mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
		portionSize: "",
		notes: "",
		timestamp: getLocalISOString(),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await foodService.createFoodLog({
				...formData,
				timestamp: new Date(formData.timestamp).toISOString(),
			});
			addToast({ type: "success", message: "Food logged successfully" });
			onSuccess?.();
		} catch (error: any) {
			addToast({
				type: "error",
				message: error.response?.data?.error || "Failed to log food",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Food / Meal Name"
				value={formData.foodName}
				onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
				placeholder="e.g., Avocado Toast, Chicken Salad"
				required
			/>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
						<button
							key={meal}
							type="button"
							onClick={() => setFormData({ ...formData, mealType: meal })}
							className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
								formData.mealType === meal
									? "bg-primary-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{meal.charAt(0).toUpperCase() + meal.slice(1)}
						</button>
					))}
				</div>
			</div>

			<Input
				label="Portion Size"
				value={formData.portionSize}
				onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
				placeholder="e.g., 1 bowl, 200g (optional)"
			/>

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
					placeholder="Any details about the ingredients or feelings after eating..."
				/>
			</div>

			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel} className="flex-1 cursor-pointer">
						Cancel
					</Button>
				)}
				<Button type="submit" isLoading={isSubmitting} className="flex-1 cursor-pointer">
					Log Food
				</Button>
			</div>
		</form>
	);
};
