import { Button } from "@/components/common/Button";
import type { AlertSettings as IAlertSettings } from "@/types";
import { useState } from "react";

interface Props {
	settings: IAlertSettings;
	onSave: (settings: IAlertSettings) => Promise<void>;
	isSaving?: boolean;
}

export const AlertSettings = ({ settings: initialSettings, onSave, isSaving }: Props) => {
	const [settings, setSettings] = useState<IAlertSettings>(initialSettings);

	const handleChange = (key: keyof IAlertSettings, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(settings);
	};

	return (
		<form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div className="p-6 border-b border-gray-50">
				<h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
				<p className="text-sm text-gray-500">Choose what you want to be notified about and how.</p>
			</div>

			<div className="p-6 space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-4">
						<h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alert Types</h4>

						<label className="flex items-center gap-5 cursor-pointer group">
							<input
								type="checkbox"
								checked={settings.missedDoseAlerts}
								onChange={(e) => handleChange("missedDoseAlerts", e.target.checked)}
								className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
							/>
							<span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
								Missed Dose Reminders
							</span>
						</label>

						<label className="flex items-center gap-5 cursor-pointer group">
							<input
								type="checkbox"
								checked={settings.highSeverityAlerts}
								onChange={(e) => handleChange("highSeverityAlerts", e.target.checked)}
								className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
							/>
							<span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
								High Severity Triggers
							</span>
						</label>

						<label className="flex items-center gap-5 cursor-pointer group">
							<input
								type="checkbox"
								checked={settings.patternDiscoveryAlerts}
								onChange={(e) => handleChange("patternDiscoveryAlerts", e.target.checked)}
								className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
							/>
							<span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
								New Patterns Discovered
							</span>
						</label>

						<label className="flex items-center gap-5 cursor-pointer group">
							<input
								type="checkbox"
								checked={settings.environmentAlerts}
								onChange={(e) => handleChange("environmentAlerts", e.target.checked)}
								className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
							/>
							<span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
								Weather & Environment
							</span>
						</label>
					</div>

					<div className="space-y-4">
						<h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Method</h4>
						<div className="space-y-2">
							{["app", "email", "both"].map((method) => (
								<label
									key={method}
									className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
								>
									<input
										type="radio"
										name="notificationMethod"
										value={method}
										checked={settings.notificationMethod === method}
										onChange={(e) => handleChange("notificationMethod", e.target.value)}
										className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
									/>
									<span className="text-sm font-medium text-gray-700 capitalize">
										{method === "both"
											? "App & Email"
											: method === "app"
											? "In-App Only"
											: "Email Only"}
									</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="p-6 bg-gray-50 flex justify-end">
				<Button type="submit" isLoading={isSaving} className="min-w-38">
					Save Changes
				</Button>
			</div>
		</form>
	);
};
