import { useState, useMemo } from "react";
import {
	format,
	addMonths,
	subMonths,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	isSameMonth,
	isSameDay,
	addDays,
	parseISO,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/common/Card";
import type { Medication, MedicationLog, MedicationAdherence } from "@/types";

interface Props {
	medications: Medication[];
	logs: MedicationLog[];
	adherence: MedicationAdherence[];
}

export const DoseTracker = ({ medications, logs }: Props) => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedMedId, setSelectedMedId] = useState<string>("all");
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

	const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
	const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

	const filteredLogs = useMemo(() => {
		if (selectedMedId === "all") return logs;
		return logs.filter((log) => log.medicationId === selectedMedId);
	}, [logs, selectedMedId]);

	const selectedDayLogs = useMemo(() => {
		if (!selectedDate) return [];
		return logs.filter((log) => isSameDay(parseISO(log.timestamp), selectedDate));
	}, [logs, selectedDate]);

	const renderHeader = () => (
		<div className="flex items-center justify-between mb-4">
			<div>
				<h2 className="text-xl font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h2>
				<p className="text-sm text-gray-500">Track your medication adherence history</p>
			</div>
			<div className="flex items-center gap-4">
				<select
					value={selectedMedId}
					onChange={(e) => setSelectedMedId(e.target.value)}
					className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
				>
					<option value="all">All Medications</option>
					{medications.map((med) => (
						<option key={med.id} value={med.id}>
							{med.name}
						</option>
					))}
				</select>
				<div className="flex gap-1">
					<button
						onClick={prevMonth}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
					>
						<ChevronLeftIcon className="w-5 h-5 text-gray-600" />
					</button>
					<button
						onClick={nextMonth}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
					>
						<ChevronRightIcon className="w-5 h-5 text-gray-600" />
					</button>
				</div>
			</div>
		</div>
	);

	const renderDays = () => {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return (
			<div className="grid grid-cols-7 mb-2">
				{days.map((day) => (
					<div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
						{day}
					</div>
				))}
			</div>
		);
	};

	const renderCells = () => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart);
		const endDate = endOfWeek(monthEnd);

		const rows = [];
		let days = [];
		let day = startDate;

		while (day <= endDate) {
			for (let i = 0; i < 7; i++) {
				const currentDay = day;
				const dayLogs = filteredLogs.filter((log) => isSameDay(parseISO(log.timestamp), currentDay));

				days.push(
					<div
						key={day.toString()}
						onClick={() => setSelectedDate(currentDay)}
						className={`relative min-h-20 border border-gray-50 p-2 transition-all cursor-pointer hover:bg-primary-50/50 ${
							!isSameMonth(day, monthStart) ? "bg-gray-50/50 text-gray-300" : "bg-white text-gray-700"
						} ${
							selectedDate && isSameDay(day, selectedDate)
								? "ring-2 ring-primary-500 ring-inset z-10"
								: ""
						}`}
					>
						<span className="text-sm font-medium">{format(day, "d")}</span>

						<div className="mt-1 flex flex-wrap gap-1">
							{dayLogs.map((log) => {
								const med = medications.find((m) => m.id === log.medicationId);
								return (
									<div
										key={log.id}
										title={`${med?.name || "Unknown"}: ${log.taken ? "Taken" : "Missed"}${
											log.notes ? ` - ${log.notes}` : ""
										}`}
										className={`w-2 h-2 rounded-full ${log.taken ? "bg-green-500" : "bg-red-500"}`}
									/>
								);
							})}
						</div>

						{isSameDay(day, new Date()) && (
							<div className="absolute bottom-1 right-1 w-1 h-1 bg-primary-600 rounded-full" />
						)}
					</div>
				);
				day = addDays(day, 1);
			}
			rows.push(
				<div key={day.toString()} className="grid grid-cols-7">
					{days}
				</div>
			);
			days = [];
		}
		return <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
	};

	const renderLegend = () => (
		<div className="flex items-center gap-6 mb-8">
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 bg-green-500 rounded-full" />
				<span className="text-xs text-gray-600 font-medium">Dose Taken</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 bg-red-500 rounded-full" />
				<span className="text-xs text-gray-600 font-medium">Dose Missed</span>
			</div>
			<div className="flex items-center gap-2 ml-auto">
				<BeakerIcon className="w-4 h-4 text-gray-400" />
				<span className="text-xs text-gray-400 italic">Click a date to see details</span>
			</div>
		</div>
	);

	const renderSelectedDayDetails = () => {
		if (!selectedDate) return null;

		return (
			<div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-bold text-gray-900">Details for {format(selectedDate, "MMMM d, yyyy")}</h3>
					{selectedDayLogs.length === 0 && (
						<span className="text-xs text-gray-500 italic">No logs for this day</span>
					)}
				</div>
				<div className="space-y-3">
					{selectedDayLogs.map((log) => {
						const med = medications.find((m) => m.id === log.medicationId);
						return (
							<div
								key={log.id}
								className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
							>
								<div
									className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
										log.taken ? "bg-green-500" : "bg-red-500"
									}`}
								/>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-2">
										<p className="font-semibold text-gray-900 truncate">
											{med?.name || "Unknown Medication"}
										</p>
										<span className="text-[10px] text-gray-400 font-medium">
											{format(parseISO(log.timestamp), "h:mm a")}
										</span>
									</div>
									<p className="text-xs text-gray-500">{med?.dosage}</p>
									{log.notes && (
										<p className="mt-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
											"{log.notes}"
										</p>
									)}
								</div>
								<div
									className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
										log.taken ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
									}`}
								>
									{log.taken ? "Taken" : "Missed"}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<Card className="p-6">
			{renderHeader()}
			{renderLegend()}
			{renderDays()}
			{renderCells()}
			{renderSelectedDayDetails()}
		</Card>
	);
};
