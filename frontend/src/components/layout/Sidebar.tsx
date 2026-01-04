import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
	HomeIcon,
	ChartBarIcon,
	BeakerIcon,
	CloudIcon,
	BellAlertIcon,
	DocumentTextIcon,
	AcademicCapIcon,
	Cog6ToothIcon,
	ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
	{ name: "Dashboard", href: "/", icon: HomeIcon },
	{ name: "Track & Analyze", href: "/tracking", icon: ChartBarIcon },
	{ name: "Medications", href: "/medications", icon: BeakerIcon },
	{ name: "Environment", href: "/environment", icon: CloudIcon },
	{ name: "Alerts", href: "/alerts", icon: BellAlertIcon },
	{ name: "Research", href: "/research", icon: AcademicCapIcon },
	{ name: "Reports", href: "/reports", icon: DocumentTextIcon },
];

export const Sidebar = () => {
	const { user, logout } = useAuth();

	return (
		<div className="w-64 bg-white border-r border-gray-200 flex flex-col">
			{/* Header */}
			<div className="p-6 border-b border-gray-200">
				<h1 className="text-2xl font-bold text-primary-600">PatternMD</h1>
				<p className="text-sm text-gray-500 mt-1">Health Pattern Tracker</p>
			</div>

			{/* User Info */}
			{user && (
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
							<span className="text-primary-600 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
							<p className="text-xs text-gray-500 truncate">{user.email}</p>
						</div>
					</div>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
				{navigation.map((item) => (
					<NavLink
						key={item.name}
						to={item.href}
						end={item.href === "/"}
						className={({ isActive }) =>
							`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colosr ${
								isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
							}`
						}
					>
						<item.icon className="w-5 h-5 mr-3" />
						{item.name}
					</NavLink>
				))}
			</nav>

			{/* Footer actions */}
			<div className="p-4 border-t border-gray-200 space-y-1">
				<NavLink
					to="/settings"
					className={({ isActive }) =>
						`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
							isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
						}`
					}
				>
					<Cog6ToothIcon className="w-5 h-5 mr-3" />
					Settings
				</NavLink>
				<button
					onClick={logout}
					className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
				>
					<ArrowRightEndOnRectangleIcon className="w-5 h-5 mr-3" />
					Logout
				</button>
			</div>
		</div>
	);
};
