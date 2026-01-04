import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { QuickLogModal } from "./QuickLogModal";

export const QuickLogButton = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-8 right-8 w-16 h-16 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 flex items-center justify-center z-50 cursor-pointer group"
				aria-label="Quick log entry"
			>
				<PlusIcon className="w-8 h-8" />
				<span className="absolute right-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
					Quick Log
				</span>
			</button>

			<QuickLogModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
};
