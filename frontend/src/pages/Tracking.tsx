import { useState, useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format, subDays, isWithinInterval, parseISO, endOfDay } from "date-fns";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
	ChartBarIcon,
	Squares2X2Icon,
	ClockIcon,
	ArrowDownTrayIcon,
	FunnelIcon,
	LinkIcon,
} from "@heroicons/react/24/outline";

// Components
import { FilterPanel } from "@/components/tracking/FilterPanel";
import { SymptomChart } from "@/components/tracking/SymptomChart";
import { PatternCard } from "@/components/tracking/PatternCard";
import { TimelineView } from "@/components/tracking/TimelineView";
import { CorrelationMatrix } from "@/components/tracking/CorrelationMatrix";

// Hooks
import { useSymptoms } from "@/hooks/useSymptoms";
import { useMedications } from "@/hooks/useMedications";
import { useFood } from "@/hooks/useFood";
import { useActivity } from "@/hooks/useActivity";
import { useMood } from "@/hooks/useMood";
import { usePatterns } from "@/hooks/usePatterns";

import type { FilterOptions } from "@/types";

export const Tracking = () => {
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		dateRange: {
			startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
			endDate: format(new Date(), "yyyy-MM-dd"),
		},
		severityRange: [1, 10],
		symptomTypes: [],
	});

	// Data fetching
	const { symptoms, loading: symptomsLoading } = useSymptoms(
		filters.dateRange?.startDate,
		filters.dateRange?.endDate
	);
	const { medicationLogs, medications } = useMedications();
	const { foodLogs } = useFood(filters.dateRange?.startDate, filters.dateRange?.endDate);
	const { activityLogs } = useActivity(filters.dateRange?.startDate, filters.dateRange?.endDate);
	const { moodLogs } = useMood(filters.dateRange?.startDate, filters.dateRange?.endDate);
	const { patterns, correlations, loading: patternsLoading } = usePatterns();

	const isLoading = symptomsLoading || patternsLoading;

	// Filtered Data
	const filteredSymptoms = useMemo(() => {
		return symptoms.filter((s) => {
			const severityMatch =
				s.severity >= (filters.severityRange?.[0] || 1) && s.severity <= (filters.severityRange?.[1] || 10);
			const typeMatch = filters.symptomTypes?.length === 0 || filters.symptomTypes?.includes(s.symptomName);
			return severityMatch && typeMatch;
		});
	}, [symptoms, filters]);

	// Prepare Timeline items
	const timelineItems = useMemo(() => {
		const items: any[] = [
			...filteredSymptoms.map((s) => ({
				id: s.id,
				type: "symptom",
				title: `${s.symptomName} (Severity: ${s.severity})`,
				timestamp: s.timestamp,
				details: s.notes,
			})),
			...medicationLogs.map((m) => {
				const med = medications.find((med) => med.id === m.medicationId);
				return {
					id: m.id,
					type: "medication",
					title: `${med?.name || "Medication"} - ${m.taken ? "Taken" : "Missed"}`,
					timestamp: m.timestamp,
					details: m.notes,
				};
			}),
			...foodLogs.map((f) => ({
				id: f.id,
				type: "food",
				title: `${f.mealType.toUpperCase()}: ${f.foodName}`,
				timestamp: f.timestamp,
				details: f.notes,
			})),
			...activityLogs.map((a) => ({
				id: a.id,
				type: "activity",
				title: `${a.activityType} (${a.durationMinutes} min)`,
				timestamp: a.timestamp,
				details: a.notes,
			})),
			...moodLogs.map((m) => ({
				id: m.id,
				type: "mood",
				title: `Mood Rating: ${m.moodRating}/10`,
				timestamp: m.timestamp,
				details: m.emotions.join(", "),
			})),
		];

		// Final filter by date range for timeline items (since some might not be pre-filtered by hook)
		const start = parseISO(filters.dateRange!.startDate);
		const end = endOfDay(parseISO(filters.dateRange!.endDate));

		return items
			.filter((item) => {
				const date = parseISO(item.timestamp);
				return isWithinInterval(date, { start, end });
			})
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}, [filteredSymptoms, medicationLogs, medications, foodLogs, activityLogs, moodLogs, filters.dateRange]);

	const symptomNames = useMemo(() => Array.from(new Set(symptoms.map((s) => s.symptomName))), [symptoms]);

	const tabs = [
		{ name: "Overview", icon: Squares2X2Icon },
		{ name: "Symptoms", icon: ChartBarIcon },
		{ name: "Patterns", icon: LinkIcon },
		{ name: "Timeline", icon: ClockIcon },
	];

	if (isLoading) return <LoadingSpinner size="lg" />;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Track & Analyze</h1>
					<p className="text-gray-600 mt-2">Visualize your symptoms and discover patterns</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => setIsFilterOpen(!isFilterOpen)}
						className={`flex items-center gap-2 ${
							isFilterOpen ? "bg-primary-50 border-primary-200 text-primary-700" : ""
						}`}
					>
						<FunnelIcon className="w-4 h-4" />
						Filters
					</Button>
					<Button variant="secondary" size="sm" className="flex items-center gap-2">
						<ArrowDownTrayIcon className="w-4 h-4" />
						Export
					</Button>
				</div>
			</div>

			{isFilterOpen && (
				<Card className="bg-white border-primary-100 shadow-md">
					<FilterPanel filters={filters} onFilterChange={setFilters} symptomNames={symptomNames} />
				</Card>
			)}

			<TabGroup>
				<TabList className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
					{tabs.map((tab) => (
						<Tab
							key={tab.name}
							className={({ selected }) =>
								`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium leading-5 rounded-lg transition-all cursor-pointer focus:outline-none
								${selected ? "bg-white text-primary-700 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`
							}
						>
							<tab.icon className="w-4 h-4" />
							{tab.name}
						</Tab>
					))}
				</TabList>
				<TabPanels>
					<TabPanel className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card title="Symptom Overview">
								<SymptomChart data={filteredSymptoms} height={300} />
							</Card>
							<Card title="Variable Correlations">
								<CorrelationMatrix correlations={correlations} />
							</Card>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{patterns.slice(0, 3).map((pattern) => (
								<PatternCard key={pattern.id} pattern={pattern} />
							))}
						</div>
					</TabPanel>
					<TabPanel>
						<Card title="Detailed Symptom Analysis">
							<SymptomChart data={filteredSymptoms} height={500} />
						</Card>
					</TabPanel>
					<TabPanel>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{patterns.length > 0 ? (
								patterns.map((pattern) => <PatternCard key={pattern.id} pattern={pattern} />)
							) : (
								<div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
									No patterns discovered yet. Keep logging to see insights!
								</div>
							)}
						</div>
					</TabPanel>
					<TabPanel>
						<Card title="Comprehensive Timeline">
							<TimelineView items={timelineItems} />
						</Card>
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</div>
	);
};
