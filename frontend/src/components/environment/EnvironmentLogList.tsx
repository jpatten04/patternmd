import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Tooltip } from "@/components/common/Tooltip";
import type { EnvironmentData } from "@/types";
import {
	CloudIcon,
	MapPinIcon,
	ChevronDownIcon,
	VariableIcon,
	BoltIcon,
	EyeIcon,
	SunIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
	logs: EnvironmentData[];
}

export const EnvironmentLogList = ({ logs }: Props) => {
	const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

	const toggleLog = (id: string) => {
		setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	if (logs.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
				<CloudIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
				<h3 className="text-lg font-medium text-gray-900">No environmental logs yet</h3>
				<p className="text-gray-500">Log your first environmental data point to start tracking.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-semibold text-gray-900 flex items-center justify-between uppercase tracking-wider">
				<div className="flex items-center gap-2">
					<div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
					Recent Environmental Logs
				</div>
				<span className="text-[10px] font-normal text-gray-400 normal-case flex items-center gap-1">
					<InformationCircleIcon className="w-3 h-3" /> Click any log to expand for more details
				</span>
			</h2>
			<div className="space-y-3">
				{logs.map((log) => {
					const isExpanded = !!expandedLogs[log.id];

					return (
						<div
							key={log.id}
							className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
						>
							<button
								onClick={() => toggleLog(log.id)}
								className="w-full text-left p-4 flex rounded-xl items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
							>
								<div className="flex items-center gap-4">
									<div
										className={`p-2 rounded-lg ${
											isExpanded ? "bg-primary-50 text-primary-600" : "bg-blue-50 text-blue-600"
										}`}
									>
										<CloudIcon className="w-5 h-5" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 flex items-center gap-2">
											{log.weatherCondition}
											<span className="text-xs font-normal text-gray-400">•</span>
											<span className="text-lg text-primary-600">
												{log.temperature.toFixed(2)}°F
											</span>
										</h4>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<MapPinIcon className="w-3 h-3" />
											{log.location}
											<span className="mx-1">•</span>
											{format(parseISO(log.timestamp), "MMM d, h:mm a")}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="hidden sm:flex items-center gap-4 mr-4">
										<div className="text-right">
											<Tooltip
												content="HUMIDITY: The amount of moisture in the air.
													• 30-50%: Ideal/Comfortable
													• 51-70%: Humid
													• Above 70%: Very Humid (Sticky)"
											>
												<div className="flex flex-col items-end">
													<p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
														Humidity <InformationCircleIcon className="w-2.5 h-2.5" />
													</p>
													<p className="text-sm font-bold text-gray-900">
														{log.humidity.toFixed(2)}%
													</p>
												</div>
											</Tooltip>
										</div>
										<div className="text-right">
											<Tooltip
												content="AIR QUALITY (AQI): Measures how clean or polluted the air is.
													• 0-50: Good (Safe)
													• 51-100: Moderate
													• 101-150: Risky for Sensitive Groups
													• Above 150: Unhealthy for Everyone"
											>
												<div className="flex flex-col items-end">
													<p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
														AQI <InformationCircleIcon className="w-2.5 h-2.5" />
													</p>
													<p className="text-sm font-bold text-gray-900">
														{log.airQualityIndex || "N/A"}
													</p>
												</div>
											</Tooltip>
										</div>
									</div>
									<ChevronDownIcon
										className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
											isExpanded ? "rotate-180" : ""
										}`}
									/>
								</div>
							</button>

							{isExpanded && (
								<div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/30">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<Tooltip
											content="HEAT INDEX: How hot it actually feels when humidity is combined with the temperature.
												• Below 80°F: Comfortable
												• 80-90°F: Use Caution
												• Above 90°F: High Heat Stress Risk"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<SunIcon className="w-3 h-3" /> Heat Index
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.feelsLike?.toFixed(2) || log.temperature.toFixed(2)}°F
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="UV INDEX: The strength of sunburn-producing rays.
												• 0-2: Low (Safe)
												• 3-5: Moderate (Sunscreen needed)
												• 6-7: High (Protection required)
												• 8+: Very High to Extreme"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<SunIcon className="w-3 h-3 text-orange-500" /> UV Index
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.uvIndex?.toFixed(1) || "0.0"}
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="WIND SPEED: How fast the air is moving.
												• 0-5 mph: Calm
												• 6-15 mph: Gentle Breeze
												• 16-30 mph: Strong Wind
												• Above 30 mph: Very Windy"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<BoltIcon className="w-3 h-3" /> Wind Speed
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.windSpeed?.toFixed(2) || "0.00"} mph
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="PRESSURE: Atmospheric pressure.
												• 30.0+ inHg: Clear/Stable Weather
												• 29.8-30.0 inHg: Changing Weather
												• Below 29.8 inHg: Stormy/Rainy likely"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<VariableIcon className="w-3 h-3" /> Pressure
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.pressure.toFixed(2)} inHg
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="VISIBILITY: How far you can see clearly.
												• 10 miles: Perfectly Clear
												• 5-9 miles: Fair
												• Below 3 miles: Hazy or Poor
												• Below 1 mile: Foggy/Dangerous"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<EyeIcon className="w-3 h-3" /> Visibility
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.visibility?.toFixed(2) || "10.00"} mi
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="FINE PARTICLES (PM2.5): Tiny dust/smoke that can enter lungs.
												• 0-12: Good
												• 13-35: Moderate
												• Above 35: Unhealthy for some"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<VariableIcon className="w-3 h-3 text-primary-500" /> PM2.5
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.pm2_5?.toFixed(2) || "0.00"}{" "}
													<span className="text-[10px] font-normal text-gray-400">µg/m³</span>
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="COARSE PARTICLES (PM10): Larger dust/pollen/mold particles.
												• 0-54: Good
												• 55-154: Moderate
												• Above 154: Unhealthy for some"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<VariableIcon className="w-3 h-3 text-primary-400" /> PM10
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.pm10?.toFixed(2) || "0.00"}{" "}
													<span className="text-[10px] font-normal text-gray-400">µg/m³</span>
												</p>
											</div>
										</Tooltip>

										<Tooltip
											content="CLOUD COVER: Amount of the sky covered by clouds.
												• 0-25%: Clear/Sunny
												• 26-50%: Partly Cloudy
												• 51-80%: Mostly Cloudy
												• 81-100%: Overcast"
										>
											<div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-full">
												<p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
													<CloudIcon className="w-3 h-3 text-blue-400" /> Cloud Cover
												</p>
												<p className="text-base font-bold text-gray-900">
													{log.clouds !== null && log.clouds !== undefined
														? `${log.clouds}%`
														: "0%"}
												</p>
											</div>
										</Tooltip>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
