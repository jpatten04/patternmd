import { useState } from "react";
import { format, parseISO } from "date-fns";
import { HeartIcon, BeakerIcon, CakeIcon, BoltIcon, FaceSmileIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface TimelineItem {
	id: string;
	type: "symptom" | "medication" | "food" | "activity" | "mood";
	title: string;
	timestamp: string;
	details?: string;
}

interface Props {
	items: TimelineItem[];
}

const iconMap = {
	symptom: { icon: HeartIcon, color: "text-red-600", bg: "bg-red-50" },
	medication: { icon: BeakerIcon, color: "text-blue-600", bg: "bg-blue-50" },
	food: { icon: CakeIcon, color: "text-green-600", bg: "bg-green-50" },
	activity: { icon: BoltIcon, color: "text-yellow-600", bg: "bg-yellow-50" },
	mood: { icon: FaceSmileIcon, color: "text-purple-600", bg: "bg-purple-50" },
};

export const TimelineView = ({ items }: Props) => {
	const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

	// Group items by ISO date (yyyy-MM-dd) so sorting across years is consistent
	const groupedItems = items.reduce((acc: any, item) => {
		const fullDate = format(parseISO(item.timestamp), "yyyy-MM-dd");
		if (!acc[fullDate]) {
			acc[fullDate] = [];
		}
		acc[fullDate].push(item);
		return acc;
	}, {});

	// Keys are ISO dates (yyyy-MM-dd) so lexical sort matches chronological order
	const sortedDates = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

	const toggleDate = (date: string) => {
		setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
	};

	return (
		<div className="flow-root">
			<ul role="list" className="-mb-4">
				{sortedDates.map((date) => {
					const itemsForDate = groupedItems[date].sort(
						(a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
					);

					const counts: Record<string, number> = {};
					itemsForDate.forEach((it: any) => (counts[it.type] = (counts[it.type] || 0) + 1));

					const isOpen = !!openDates[date];

					return (
						<li key={date} className="mb-4">
							<div className="relative">
								<button
									onClick={() => toggleDate(date)}
									className="w-full flex items-center justify-between mb-2 bg-gray-50 p-2 rounded border border-gray-200 cursor-pointer"
								>
									<div className="flex items-center gap-3">
										<h3 className="text-sm font-semibold text-gray-900">
											{format(parseISO(date), "eeee, MMMM dd")}
										</h3>
										<span className="text-xs text-gray-500">{itemsForDate.length} items</span>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											{Object.entries(counts).map(([type, c]) => (
												<span
													key={type}
													className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-gray-600 border"
												>
													{type}: {c}
												</span>
											))}
										</div>
									</div>
									<ChevronDownIcon
										className={`w-4 h-4 text-gray-500 transition-transform ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								{isOpen && (
									<div className="space-y-4 ml-4">
										{itemsForDate.map((item: any) => {
											const config = iconMap[item.type as keyof typeof iconMap];
											const Icon = config.icon;

											return (
												<div
													key={item.id}
													className="relative flex space-x-3 p-3 rounded-lg border border-gray-200"
												>
													<div>
														<span
															className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${config.bg}`}
														>
															<Icon
																className={`h-5 w-5 ${config.color}`}
																aria-hidden="true"
															/>
														</span>
													</div>
													<div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
														<div>
															<p className="text-sm text-gray-900 font-medium">
																{item.title}
															</p>
															{item.details && (
																<p className="mt-0.5 text-xs text-gray-500 italic">
																	{item.details}
																</p>
															)}
														</div>
														<div className="whitespace-nowrap text-right text-xs text-gray-500">
															<time dateTime={item.timestamp}>
																{format(parseISO(item.timestamp), "h:mm a")}
															</time>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
