import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface EnvironmentForm {
	temperature: number;
	feelsLike?: number;
	humidity: number;
	pressure: number;
	windSpeed?: number;
	visibility?: number;
	pm2_5?: number;
	pm10?: number;
	airQualityIndex?: number;
	uvIndex?: number;
	clouds?: number;
	weatherCondition: string;
	location: string;
	timestamp: string;
}

interface Props {
	onSubmit: (data: EnvironmentForm) => Promise<void>;
	onCancel: () => void;
	isSubmitting?: boolean;
}

export const EnvironmentLogForm = ({ onSubmit, onCancel, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EnvironmentForm>({
		defaultValues: {
			timestamp: new Date().toISOString().slice(0, 16),
			location: "Current Location",
		},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Temperature (°F)"
					type="number"
					step="0.01"
					{...register("temperature", { required: "Temperature is required", valueAsNumber: true })}
					error={errors.temperature?.message}
					placeholder="e.g., 72.50"
				/>
				<Input
					label="Feels Like (°F)"
					type="number"
					step="0.01"
					{...register("feelsLike", { valueAsNumber: true })}
					error={errors.feelsLike?.message}
					placeholder="e.g., 75.00"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Humidity (%)"
					type="number"
					step="0.01"
					{...register("humidity", { required: "Humidity is required", valueAsNumber: true })}
					error={errors.humidity?.message}
					placeholder="e.g., 45"
				/>
				<Input
					label="Pressure (inHg)"
					type="number"
					step="0.01"
					{...register("pressure", { required: "Pressure is required", valueAsNumber: true })}
					error={errors.pressure?.message}
					placeholder="e.g., 29.92"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Wind Speed (mph)"
					type="number"
					step="0.01"
					{...register("windSpeed", { valueAsNumber: true })}
					error={errors.windSpeed?.message}
					placeholder="e.g., 5.5"
				/>
				<Input
					label="Visibility (mi)"
					type="number"
					step="0.01"
					{...register("visibility", { valueAsNumber: true })}
					error={errors.visibility?.message}
					placeholder="e.g., 10"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="PM2.5 (µg/m³)"
					type="number"
					step="0.01"
					{...register("pm2_5", { valueAsNumber: true })}
					error={errors.pm2_5?.message}
					placeholder="e.g., 12.5"
				/>
				<Input
					label="PM10 (µg/m³)"
					type="number"
					step="0.01"
					{...register("pm10", { valueAsNumber: true })}
					error={errors.pm10?.message}
					placeholder="e.g., 20"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Air Quality Index (Optional)"
					type="number"
					{...register("airQualityIndex", { valueAsNumber: true })}
					error={errors.airQualityIndex?.message}
					placeholder="e.g., 42"
				/>
				<Input
					label="UV Index (Optional)"
					type="number"
					step="0.1"
					{...register("uvIndex", { valueAsNumber: true })}
					error={errors.uvIndex?.message}
					placeholder="e.g., 5.5"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Weather Condition"
					{...register("weatherCondition", { required: "Weather condition is required" })}
					error={errors.weatherCondition?.message}
					placeholder="e.g., Sunny, Partly Cloudy"
				/>
				<Input
					label="Cloud Cover (%)"
					type="number"
					{...register("clouds", { valueAsNumber: true })}
					error={errors.clouds?.message}
					placeholder="e.g., 25"
				/>
			</div>

			<Input
				label="Location"
				{...register("location", { required: "Location is required" })}
				error={errors.location?.message}
				placeholder="e.g., New York, NY"
			/>

			<Input
				label="Date & Time"
				type="datetime-local"
				{...register("timestamp", { required: "Timestamp is required" })}
				error={errors.timestamp?.message}
			/>

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
					Log Environment
				</Button>
			</div>
		</form>
	);
};
