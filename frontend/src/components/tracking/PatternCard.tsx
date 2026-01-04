import { format, parseISO } from "date-fns";
import { InformationCircleIcon, ArrowTrendingUpIcon, LinkIcon } from "@heroicons/react/24/outline";
import type { Pattern } from "@/types";

interface Props {
	pattern: Pattern;
}

export const PatternCard = ({ pattern }: Props) => {
	const getIcon = () => {
		switch (pattern.patternType) {
			case "trend":
				return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />;
			case "correlation":
				return <LinkIcon className="w-5 h-5 text-green-600" />;
			default:
				return <InformationCircleIcon className="w-5 h-5 text-primary-600" />;
		}
	};

	return (
		<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-gray-50 rounded-lg">{getIcon()}</div>
					<div>
						<h4 className="font-semibold text-gray-900 capitalize">{pattern.patternType}</h4>
						<p className="text-xs text-gray-500">
							Discovered on {format(parseISO(pattern.discoveredAt), "MMM dd, yyyy")}
						</p>
					</div>
				</div>
				<div className="flex flex-col items-end">
					<span className="text-xs font-medium text-gray-500 mb-1">Confidence</span>
					<div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-primary-600 rounded-full"
							style={{ width: `${pattern.confidenceScore * 100}%` }}
						/>
					</div>
				</div>
			</div>

			<p className="text-gray-700 text-sm mb-4 leading-relaxed">{pattern.description}</p>

			{Object.keys(pattern.variables).length > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{Object.entries(pattern.variables).map(([key, value]) => (
						<span
							key={key}
							className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-medium uppercase tracking-wider"
						>
							{key}: {String(value)}
						</span>
					))}
				</div>
			)}

			<button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors flex items-center gap-1 cursor-pointer">
				View Detailed Analysis
				<InformationCircleIcon className="w-4 h-4" />
			</button>
		</div>
	);
};
