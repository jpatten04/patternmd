import { 
	LineChart, 
	Line, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	Legend, 
	ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";
import type { SymptomLog } from "@/types";

interface Props {
	data: SymptomLog[];
	height?: number;
}

export const SymptomChart = ({ data, height = 400 }: Props) => {
	// Process data for the chart
	// Group logs by date and symptom name
	const processedData = data.reduce((acc: any, log) => {
		const fullDate = format(parseISO(log.timestamp), "yyyy-MM-dd");
		if (!acc[fullDate]) {
			acc[fullDate] = { 
				fullDate,
				displayDate: format(parseISO(log.timestamp), "MMM dd")
			};
		}
		acc[fullDate][log.symptomName] = log.severity;
		return acc;
	}, {});

	const chartData = Object.values(processedData).sort((a: any, b: any) => 
		a.fullDate.localeCompare(b.fullDate)
	);

	// Get unique symptom names for lines
	const symptomNames = Array.from(new Set(data.map((s) => s.symptomName)));
	
	const colors = [
		"#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", 
		"#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
	];

	return (
		<div className="w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={chartData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
					<XAxis 
						dataKey="displayDate" 
						axisLine={false}
						tickLine={false}
						tick={{ fontSize: 12, fill: "#6b7280" }}
					/>
					<YAxis 
						domain={[0, 10]} 
						axisLine={false}
						tickLine={false}
						tick={{ fontSize: 12, fill: "#6b7280" }}
					/>
					<Tooltip 
						contentStyle={{ 
							borderRadius: "8px", 
							border: "none", 
							boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" 
						}}
					/>
					<Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
					{symptomNames.map((name, index) => (
						<Line
							key={name}
							type="monotone"
							dataKey={name}
							stroke={colors[index % colors.length]}
							strokeWidth={2}
							dot={{ r: 4, strokeWidth: 2 }}
							activeDot={{ r: 6 }}
							connectNulls
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
