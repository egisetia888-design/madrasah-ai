import { useToastStore } from '../../store/toastStore';
import { Loader2, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300",
            toast.type === 'loading' && "bg-white border-gray-200 text-gray-900",
            toast.type === 'success' && "bg-green-50 border-green-200 text-green-900",
            toast.type === 'error' && "bg-red-50 border-red-200 text-red-900",
            toast.type === 'info' && "bg-blue-50 border-blue-200 text-blue-900"
          )}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          </div>
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
