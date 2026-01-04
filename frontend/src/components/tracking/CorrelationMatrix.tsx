import type { Correlation } from "@/types";

interface Props {
	correlations: Correlation[];
}

export const CorrelationMatrix = ({ correlations }: Props) => {
	// Get unique variables for axes
	const variables = Array.from(new Set(correlations.flatMap((c) => [c.variable1, c.variable2]))).sort();

	if (variables.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500 italic">Not enough data to compute correlations yet.</div>
		);
	}

	const getCoefficient = (v1: string, v2: string) => {
		if (v1 === v2) return 1;
		const found = correlations.find(
			(c) => (c.variable1 === v1 && c.variable2 === v2) || (c.variable1 === v2 && c.variable2 === v1)
		);
		return found ? found.coefficient : 0;
	};

	const getColor = (coeff: number) => {
		if (coeff === 1) return "bg-gray-100";

		const alpha = Math.abs(coeff);
		if (coeff > 0) return `rgba(16, 185, 129, ${alpha})`; // green
		if (coeff < 0) return `rgba(239, 68, 68, ${alpha})`; // red
		return "transparent";
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border-separate border-spacing-1">
				<thead>
					<tr>
						<th className="p-2"></th>
						{variables.map((v) => (
							<th key={v} className="p-2 text-xs font-semibold text-gray-600 truncate max-w-20" title={v}>
								{v}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{variables.map((v1) => (
						<tr key={v1}>
							<td className="p-2 text-xs font-semibold text-gray-600 truncate max-w-20" title={v1}>
								{v1}
							</td>
							{variables.map((v2) => {
								const coeff = getCoefficient(v1, v2);
								return (
									<td
										key={`${v1}-${v2}`}
										className="p-2 text-center text-[10px] font-bold border border-gray-100 rounded transition-transform hover:scale-110 cursor-help"
										style={{ backgroundColor: getColor(coeff) }}
										title={`${v1} vs ${v2}: ${coeff.toFixed(2)}`}
									>
										{coeff.toFixed(1)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
			<div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-gray-500 uppercase tracking-widest">
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-red-500 opacity-80 rounded" />
					Negative
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-gray-200 rounded" />
					Neutral
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-emerald-500 opacity-80 rounded" />
					Positive
				</div>
			</div>
		</div>
	);
};
