import { toast } from 'svelte-sonner';
import type { ExternalToast } from 'svelte-sonner';

export function toastSuccess(message: string, options?: ExternalToast): void {
	toast.success(message, options);
}

export function toastError(message: string, options?: ExternalToast): void {
	toast.error(message, options);
}

export function toastInfo(message: string, options?: ExternalToast): void {
	toast.info(message, options);
}
