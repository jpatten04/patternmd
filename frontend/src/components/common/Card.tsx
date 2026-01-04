import React from "react";

interface Props {
	children: React.ReactNode;
	className?: string;
	title?: string;
	action?: React.ReactNode;
}

export const Card = ({ children, className = "", title, action }: Props) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
			{(title || action) && (
				<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
					{title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
					{action}
				</div>
			)}
			<div className="p-6">{children}</div>
		</div>
	);
};
