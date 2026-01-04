import { create } from "zustand";
import type { Toast } from "@/types";

interface UIState {
	// Modal States
	isQuickLogOpen: boolean;
	setQuickLogOpen: (open: boolean) => void;

	// Toast notifications
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;

	// Global loading
	isLoading: boolean;
	setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
	isQuickLogOpen: false,
	setQuickLogOpen: (open) => set({ isQuickLogOpen: open }),

	toasts: [],
	addToast: (toast) => {
		const id = Math.random().toString(36).substring(7);
		set((state) => ({
			toasts: [...state.toasts, { ...toast, id }],
		}));

		setTimeout(() => {
			set((state) => ({
				toasts: state.toasts.filter((t) => t.id !== id),
			}));
		}, toast.duration || 3000);
	},
	removeToast: (id) => {
		set((state) => ({
			toasts: state.toasts.filter((t) => t.id !== id),
		}));
	},

	isLoading: false,
	setLoading: (loading) => set({ isLoading: loading }),
}));
