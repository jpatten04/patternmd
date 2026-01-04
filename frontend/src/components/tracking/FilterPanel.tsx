import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { FilterOptions } from "@/types";

interface Props {
	filters: FilterOptions;
	onFilterChange: (filters: FilterOptions) => void;
	symptomNames: string[];
}

export const FilterPanel = ({ filters, onFilterChange, symptomNames }: Props) => {
	const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

	// Sync local state if external filters change
	useEffect(() => {
		setLocalFilters(filters);
	}, [filters]);

	const handleDateChange = (field: "startDate" | "endDate", value: string) => {
		setLocalFilters({
			...localFilters,
			dateRange: {
				...localFilters.dateRange!,
				[field]: value,
			},
		});
	};

	const toggleSymptom = (name: string) => {
		const current = localFilters.symptomTypes || [];
		const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
		setLocalFilters({ ...localFilters, symptomTypes: next });
	};

	const handleApply = () => {
		onFilterChange(localFilters);
	};

	const handleClear = () => {
		setLocalFilters({
			dateRange: {
				startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
				endDate: format(new Date(), "yyyy-MM-dd"),
			},
			severityRange: [1, 10],
			symptomTypes: [],
		});
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Input
					label="Start Date"
					type="date"
					value={localFilters.dateRange?.startDate}
					onChange={(e) => handleDateChange("startDate", e.target.value)}
				/>
				<Input
					label="End Date"
					type="date"
					value={localFilters.dateRange?.endDate}
					onChange={(e) => handleDateChange("endDate", e.target.value)}
				/>
				<div className="col-span-1 md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Severity Range: {localFilters.severityRange?.[0] || 1} - {localFilters.severityRange?.[1] || 10}
					</label>
					<div className="flex items-center gap-4 px-2 py-3 bg-white border border-gray-300 rounded-lg">
						<input
							type="range"
							min="1"
							max="10"
							value={localFilters.severityRange?.[0] || 1}
							onChange={(e) =>
								setLocalFilters({
									...localFilters,
									severityRange: [Number(e.target.value), localFilters.severityRange?.[1] || 10],
								})
							}
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
						/>
						<input
							type="range"
							min="1"
							max="10"
							value={localFilters.severityRange?.[1] || 10}
							onChange={(e) =>
								setLocalFilters({
									...localFilters,
									severityRange: [localFilters.severityRange?.[0] || 1, Number(e.target.value)],
								})
							}
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
						/>
					</div>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
				<div className="flex flex-wrap gap-2">
					{symptomNames.map((name) => (
						<button
							key={name}
							onClick={() => toggleSymptom(name)}
							className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
								localFilters.symptomTypes?.includes(name)
									? "bg-primary-600 border-primary-600 text-white"
									: "bg-white border-gray-300 text-gray-700 hover:border-primary-500"
							}`}
						>
							{name}
						</button>
					))}
				</div>
			</div>

			<div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
				<Button variant="ghost" size="sm" onClick={handleClear}>
					Clear All
				</Button>
				<Button variant="primary" size="sm" onClick={handleApply}>
					Apply Filters
				</Button>
			</div>
		</div>
	);
};
