import React from "react";

interface Props {
	children: React.ReactNode;
	className?: string;
	title?: string;
	description?: string;
	action?: React.ReactNode;
}

export const Card = ({ children, className = "", title, description, action }: Props) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
			{(title || description || action) && (
				<div className="px-6 py-4 border-b border-gray-100">
					<div className="flex items-center justify-between">
						<div>
							{title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
							{description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
						</div>
						{action}
					</div>
				</div>
			)}
			<div className="p-6">{children}</div>
		</div>
	);
};
