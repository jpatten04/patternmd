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
import { PatternInsights } from "@/components/tracking/PatternInsights";

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
	const { correlations, matrix, aiInsights, loading: patternsLoading } = usePatterns();

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

	// Summary Statistics
	const stats = useMemo(() => {
		const avgSeverity =
			filteredSymptoms.length > 0
				? filteredSymptoms.reduce((acc, s) => acc + s.severity, 0) / filteredSymptoms.length
				: 0;

		const totalMedLogs = medicationLogs.length;
		const medsTaken = medicationLogs.filter((m) => m.taken).length;
		const adherence = totalMedLogs > 0 ? (medsTaken / totalMedLogs) * 100 : 0;

		return {
			avgSeverity: avgSeverity.toFixed(1),
			adherence: adherence.toFixed(0),
			logCount: timelineItems.length,
		};
	}, [filteredSymptoms, medicationLogs, timelineItems]);

	const tabs = [
		{ name: "Overview", icon: Squares2X2Icon },
		{ name: "Symptoms", icon: ChartBarIcon },
		{ name: "Correlations", icon: LinkIcon },
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
						{/* Key Metrics Row */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
								<p className="text-xs font-medium text-gray-500 uppercase">Avg. Severity</p>
								<p className="text-2xl font-bold text-gray-900">{stats.avgSeverity}</p>
							</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
								<p className="text-xs font-medium text-gray-500 uppercase">Medication Adherence</p>
								<p className="text-2xl font-bold text-gray-900">{stats.adherence}%</p>
							</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
								<p className="text-xs font-medium text-gray-500 uppercase">Total Observations</p>
								<p className="text-2xl font-bold text-gray-900">{stats.logCount}</p>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<Card title="Recent Symptom Trends">
									<SymptomChart data={filteredSymptoms.slice(-20)} height={300} />
								</Card>
							</div>
							<div className="space-y-6">
								<Card title="Recent Activity">
									<div className="flow-root">
										<ul role="list" className="-mb-8">
											{timelineItems.slice(0, 5).map((item, itemIdx) => (
												<li key={item.id}>
													<div className="relative pb-8">
														{itemIdx !== 4 ? (
															<span
																className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
																aria-hidden="true"
															/>
														) : null}
														<div className="relative flex space-x-3">
															<div>
																<span
																	className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
																		item.type === "symptom"
																			? "bg-red-50"
																			: item.type === "medication"
																				? "bg-blue-50"
																				: "bg-gray-50"
																	}`}
																>
																	<div
																		className={`h-2 w-2 rounded-full ${
																			item.type === "symptom"
																				? "bg-red-500"
																				: item.type === "medication"
																					? "bg-blue-500"
																					: "bg-gray-500"
																		}`}
																	/>
																</span>
															</div>
															<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
																<div>
																	<p className="text-xs font-semibold text-gray-900">
																		{item.title}
																	</p>
																</div>
																<div className="whitespace-nowrap text-right text-[10px] text-gray-500">
																	{format(parseISO(item.timestamp), "MMM d, HH:mm")}
																</div>
															</div>
														</div>
													</div>
												</li>
											))}
										</ul>
									</div>
								</Card>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{correlations.slice(0, 3).map((corr, idx) => (
								<div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
									<p className="text-xs font-bold text-primary-600 uppercase mb-1">{corr.factor}</p>
									<p className="text-sm text-gray-700 line-clamp-2">{corr.description}</p>
								</div>
							))}
						</div>
					</TabPanel>
					<TabPanel>
						<Card title="Detailed Symptom Analysis">
							<SymptomChart data={filteredSymptoms} height={500} />
						</Card>
					</TabPanel>
					<TabPanel className="space-y-6">
						<Card title="Variable Correlation Matrix">
							<div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
								<h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
									<LinkIcon className="w-5 h-5" />
									How to Read This Matrix
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
									<div>
										<p className="font-bold mb-1">🟢 Positive (+0.3 to +1.0)</p>
										<p>Factors move together. e.g., High humidity correlates with increased pain.</p>
									</div>
									<div>
										<p className="font-bold mb-1">🔴 Negative (-0.3 to -1.0)</p>
										<p>Factors move in opposite directions. e.g., Taking meds correlates with lower symptoms.</p>
									</div>
									<div>
										<p className="font-bold mb-1">⚪ Neutral (-0.3 to +0.3)</p>
										<p>No clear statistical relationship found between these two variables.</p>
									</div>
								</div>
								<p className="mt-3 text-xs text-blue-600 italic">
									Note: Values are Pearson correlation coefficients. 1.0 is a perfect match, 0 is no relation, and -1.0 is a perfect opposite.
								</p>
							</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner overflow-hidden">
								<CorrelationMatrix correlations={matrix} />
							</div>
						</Card>
					</TabPanel>
					<TabPanel className="space-y-6">
						<PatternInsights correlations={correlations} aiInsights={aiInsights} />
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
