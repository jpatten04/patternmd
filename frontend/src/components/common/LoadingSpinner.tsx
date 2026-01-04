interface Props {
	size?: "sm" | "md" | "lg";
	fullScreen?: boolean;
}

export const LoadingSpinner = ({ size = "md", fullScreen = false }: Props) => {
	const sizes = {
		sm: "w-6 h-6",
		md: "w-10 h-10",
		lg: "w-16 h-16",
	};

	const spinner = (
		<svg
			className={`animate-spin text-primary-600 ${sizes[size]}`}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">{spinner}</div>
		);
	}

	return <div className="flex justify-center py-8">{spinner}</div>;
};
