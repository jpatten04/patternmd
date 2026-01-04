import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: Props) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizes = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
			<div
				className={`relative bg-white rounded-xl shadow-xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto`}
			>
				{title && (
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
						<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
							<XMarkIcon className="w-6 h-6" />
						</button>
					</div>
				)}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};
