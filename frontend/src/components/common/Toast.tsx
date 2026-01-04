import {
	CheckCircleIcon,
	XCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Toast as ToastType } from "@/types";
import { useUIStore } from "@/store/uiStore";

const icons = {
	success: CheckCircleIcon,
	error: XCircleIcon,
	warning: ExclamationTriangleIcon,
	info: InformationCircleIcon,
};

const colors = {
	success: "bg-green-50 text-green-800 border-green-200",
	error: "bg-red-50 text-red-800 border-red-200",
	warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
	info: "bg-blue-50 text-blue-800 border-blue-200",
};

interface Props {
	toast: ToastType;
}

function ToastItem({ toast }: Props) {
	const removeToast = useUIStore((state) => state.removeToast);
	const Icon = icons[toast.type];

	return (
		<div className={`flex items-start p-4 rounded-lg border shadow-lg ${colors[toast.type]} animate-slide-in`}>
			<Icon className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
			<p className="flex-1 text-sm font-medium">{toast.message}</p>
			<button onClick={() => removeToast(toast.id)} className="ml-4 shrink-0 hover:opacity-70 transition-opacity">
				<XMarkIcon className="w-5 h-5" />
			</button>
		</div>
	);
}

export const ToastContainer = () => {
	const toasts = useUIStore((state) => state.toasts);

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} />
			))}
		</div>
	);
};
