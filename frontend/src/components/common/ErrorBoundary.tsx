import { Component, type ErrorInfo, type ReactNode } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
					<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<XCircleIcon className="w-10 h-10 text-red-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
						<p className="text-gray-600 mb-6">
							We're sorry for the inconvenience. Please try refreshing the page.
						</p>
						<button onClick={() => window.location.reload()} className="btn-primary">
							Refresh Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
