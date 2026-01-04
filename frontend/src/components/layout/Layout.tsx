import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { QuickLogButton } from "@/components/logging/QuickLogButton";

export const Layout = () => {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="max-w-7xl mx-auto p-6 md:p-8">
					<Outlet />
				</div>
			</main>
			<QuickLogButton />
		</div>
	);
};
