export const Dashboard = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600 mt-2">Overview of your health patterns and recent activity</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-sm font-medium text-gray-500">Today's Logs</h3>
					<p className="text-3xl font-bold text-gray-900 mt-2">0</p>
					<p className="text-sm text-gray-500 mt-1">Use the + button to log</p>
				</div>
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-sm font-medium text-gray-500">Active Medications</h3>
					<p className="text-3xl font-bold text-gray-900 mt-2">0</p>
				</div>
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-sm font-medium text-gray-500">Patterns Found</h3>
					<p className="text-3xl font-bold text-gray-900 mt-2">0</p>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
					<div className="text-center text-gray-500 py-8">
						<p>No entries yet. Click the + button to start logging!</p>
					</div>
				</div>
			</div>
		</div>
	);
};
