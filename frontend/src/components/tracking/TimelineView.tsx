import { format, parseISO } from "date-fns";
import { HeartIcon, BeakerIcon, CakeIcon, BoltIcon, FaceSmileIcon } from "@heroicons/react/24/outline";

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
	// Group items by date
	const groupedItems = items.reduce((acc: any, item) => {
		const date = format(parseISO(item.timestamp), "eeee, MMMM dd");
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(item);
		return acc;
	}, {});

	const sortedDates = Object.keys(groupedItems).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

	return (
		<div className="flow-root">
			<ul role="list" className="-mb-8">
				{sortedDates.map((date) => (
					<li key={date} className="mb-10">
						<div className="relative pb-8">
							<h3 className="text-sm font-semibold text-gray-900 mb-6 bg-gray-50 p-2 rounded inline-block">
								{date}
							</h3>

							<div className="space-y-6 ml-4">
								{groupedItems[date]
									.sort(
										(a: any, b: any) =>
											new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
									)
									.map((item: any) => {
										const config = iconMap[item.type as keyof typeof iconMap];
										const Icon = config.icon;

										return (
											<div key={item.id} className="relative flex space-x-3">
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
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
