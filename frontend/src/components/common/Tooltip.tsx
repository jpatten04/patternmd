import React, { useState } from "react";

interface Props {
	content: string;
	children: React.ReactNode;
}

export const Tooltip = ({ content, children }: Props) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div
			className="relative flex items-center"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			{children}
			{isVisible && (
				<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] leading-relaxed font-medium rounded-lg shadow-xl z-50 w-64 text-left pointer-events-none transition-opacity duration-200">
					{content}
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
				</div>
			)}
		</div>
	);
};
